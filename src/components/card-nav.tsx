import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { gsap } from "gsap";
import { GoArrowLeft, GoArrowUpRight } from "react-icons/go";
import { ThemeToggle } from "./theme-toggle";
import SignatureLogo from "./signature-logo";

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export type CardNavCategory = {
  label: string;
  links: CardNavLink[];
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links?: CardNavLink[];
  categories?: CardNavCategory[];
};

interface CardNavProps {
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  /** Show the signature logo in the nav center (driven by name morph dock state) */
  logoVisible?: boolean;
  /** Whether the logo should play its reveal animation */
  logoAnimate?: boolean;
}

const isReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CardNav: React.FC<CardNavProps> = ({
  items,
  className = "",
  ease = "power3.out",
  baseColor = "#fff",
  menuColor,
  logoVisible = false,
  logoAnimate = false,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Record<number, string | null>>({});
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const animatingRef = useRef<number | null>(null); // tracks which card is mid-drill

  const navDuration = isReducedMotion() ? 0 : 0.4;
  const drillDuration = isReducedMotion() ? 0 : 0.3;

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";

        contentEl.offsetHeight; // force layout

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: navDuration,
      ease,
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: navDuration, ease, stagger: 0.08 }, "-=0.1");

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const toggleMenu = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      setActiveCategory({});
      animatingRef.current = null;
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  }, [isExpanded]);

  const setCardRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      if (el) cardsRef.current[i] = el;
    },
    [],
  );

  /**
   * Animate children out, then call onSwap, then animate new children in.
   * Self-contained — no useLayoutEffect needed for the "in" phase.
   */
  const crossfade = useCallback(
    (
      container: HTMLElement,
      direction: "left" | "right",
      onSwap: () => void,
    ) => {
      const outChildren = Array.from(container.children) as HTMLElement[];

      const animateIn = () => {
        const inChildren = Array.from(container.children) as HTMLElement[];
        if (!inChildren.length) return;

        gsap.set(inChildren, { x: direction === "left" ? 20 : -20, opacity: 0 });
        gsap.to(inChildren, {
          x: 0,
          opacity: 1,
          duration: drillDuration,
          stagger: 0.04,
          ease: "power2.out",
        });
      };

      if (!outChildren.length) {
        onSwap();
        // After React re-renders, animate new content in
        requestAnimationFrame(() => animateIn());
        return;
      }

      gsap.to(outChildren, {
        x: direction === "left" ? -20 : 20,
        opacity: 0,
        duration: drillDuration * 0.6,
        stagger: 0.02,
        ease: "power2.in",
        onComplete: () => {
          onSwap();
          // After React re-renders, animate new content in
          requestAnimationFrame(() => animateIn());
        },
      });
    },
    [drillDuration],
  );

  const drillIntoCategory = useCallback(
    (cardIdx: number, categoryLabel: string) => {
      if (animatingRef.current === cardIdx) return;
      const card = cardsRef.current[cardIdx];
      if (!card) return;

      const container = card.querySelector(".nav-card-links") as HTMLElement;
      if (!container) return;

      animatingRef.current = cardIdx;
      crossfade(container, "left", () => {
        setActiveCategory((prev) => ({ ...prev, [cardIdx]: categoryLabel }));
        animatingRef.current = null;
      });
    },
    [crossfade],
  );

  const drillBack = useCallback(
    (cardIdx: number) => {
      if (animatingRef.current === cardIdx) return;
      const card = cardsRef.current[cardIdx];
      if (!card) return;

      const container = card.querySelector(".nav-card-links") as HTMLElement;
      if (!container) return;

      animatingRef.current = cardIdx;
      crossfade(container, "right", () => {
        setActiveCategory((prev) => ({ ...prev, [cardIdx]: null }));
        animatingRef.current = null;
      });
    },
    [crossfade],
  );

  return (
    <div
      className={`card-nav-container absolute left-1/2 top-[1.2em] z-[99] w-[90%] max-w-[800px] -translate-x-1/2 md:top-[2em] ${className}`}
    >
      <nav
        ref={navRef}
        aria-label="Primary"
        className={`card-nav ${isExpanded ? "open" : ""} relative block h-[60px] overflow-hidden rounded-xl p-0 shadow-md will-change-[height]`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="card-nav-top absolute inset-x-0 top-0 z-[2] flex h-[60px] items-center justify-between p-2 pl-[1.1rem]">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""} flex h-full cursor-pointer flex-col items-center justify-center gap-[6px] group`}
            onClick={toggleMenu}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMenu();
              }
            }}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            aria-expanded={isExpanded}
            tabIndex={0}
            style={{ color: menuColor }}
          >
            <div
              className={`hamburger-line h-[2px] w-[30px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${
                isHamburgerOpen ? "translate-y-[4px] rotate-45" : ""
              } group-hover:opacity-75`}
            />
            <div
              className={`hamburger-line h-[2px] w-[30px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${
                isHamburgerOpen ? "-translate-y-[4px] -rotate-45" : ""
              } group-hover:opacity-75`}
            />
          </div>

          {/* Signature logo — centered in the top bar, revealed when name docks */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <SignatureLogo
              animate={logoAnimate}
              width={28}
              height={35}
              className={logoVisible ? "opacity-100" : "opacity-0"}
            />
          </div>

          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>

        <div
          className={`card-nav-content absolute bottom-0 left-0 right-0 top-[60px] z-[1] flex flex-col items-stretch justify-start gap-2 p-2 ${
            isExpanded ? "visible pointer-events-auto" : "invisible pointer-events-none"
          } md:flex-row md:items-end md:gap-[12px]`}
          aria-hidden={!isExpanded}
        >
          {(items || []).slice(0, 3).map((item, idx) => {
            const hasCategories = item.categories && item.categories.length > 0;
            const activeCat = activeCategory[idx] ?? null;
            const activeCategoryData =
              hasCategories && activeCat
                ? item.categories!.find((c) => c.label === activeCat)
                : null;

            return (
              <div
                key={`${item.label}-${idx}`}
                className="nav-card group/card relative flex min-h-[60px] min-w-0 flex-[1_1_auto] flex-col gap-2 p-[12px_16px] select-none rounded-[calc(0.75rem-0.2rem)] h-auto md:h-full md:min-h-0 md:flex-[1_1_0%]"
                ref={setCardRef(idx)}
                style={{ backgroundColor: item.bgColor, color: item.textColor }}
              >
                {/* Card header */}
                <div className="nav-card-label relative flex items-center gap-2 text-[18px] font-normal tracking-[-0.5px] md:text-[22px]">
                  {hasCategories && activeCat ? (
                    <button
                      onClick={() => drillBack(idx)}
                      className="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-[inherit] transition-opacity duration-300 hover:opacity-75"
                      style={{ color: item.textColor }}
                      aria-label={`Back to ${item.label} categories`}
                    >
                      <GoArrowLeft className="text-[16px]" aria-hidden="true" />
                      <span>{activeCategoryData?.label}</span>
                    </button>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] origin-left scale-x-0 bg-current opacity-30 transition-transform duration-300 ease-out group-hover/card:scale-x-100" />
                </div>

                {/* Card content */}
                <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
                  {hasCategories && !activeCat ? (
                    item.categories!.map((cat, i) => (
                      <button
                        key={`${cat.label}-${i}`}
                        onClick={() => drillIntoCategory(idx, cat.label)}
                        className="nav-card-link group/link inline-flex cursor-pointer items-center gap-[6px] border-0 bg-transparent p-0 text-left font-[inherit] text-[15px] no-underline transition-opacity duration-300 hover:opacity-75 md:text-[16px]"
                        style={{ color: item.textColor }}
                        aria-label={`View ${cat.label} links`}
                      >
                        <GoArrowUpRight
                          className="nav-card-link-icon shrink-0 transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
                          aria-hidden="true"
                        />
                        {cat.label}
                      </button>
                    ))
                  ) : (
                    (activeCategoryData?.links ?? item.links ?? []).map((lnk, i) => {
                      const Icon = lnk.icon;
                      return (
                        <a
                          key={`${lnk.label}-${i}`}
                          className="nav-card-link group/link inline-flex items-center gap-[6px] text-[15px] no-underline transition-opacity duration-300 hover:opacity-75 md:text-[16px]"
                          href={lnk.href}
                          aria-label={lnk.ariaLabel}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {Icon ? (
                            <Icon className="nav-card-link-icon shrink-0 text-[16px]" aria-hidden="true" />
                          ) : (
                            <GoArrowUpRight
                              className="nav-card-link-icon shrink-0 transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
                              aria-hidden="true"
                            />
                          )}
                          {lnk.label}
                        </a>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
