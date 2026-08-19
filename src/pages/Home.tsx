import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import CardNav, { type CardNavItem, type CardNavCategory } from "@/components/card-nav";
import ScrollIndicator from "@/components/scroll-indicator";
import StrokeText from "@/components/stroke-text";
import "@/components/stroke-text.css";

import { FaGithub, FaTwitter, FaLinkedinIn, FaInstagram, FaEnvelope, FaPenNib, FaNewspaper } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { FiFileText } from "react-icons/fi";
import CodolioIcon from "@/components/icons/codolio-icon";
import YouTubeMusicIcon from "@/components/icons/yt-music-icon";
import LoadingScreen from "@/components/loading-screen";

const CONTACT_CATEGORIES: CardNavCategory[] = [
  {
    label: "Social",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/", ariaLabel: "Open Instagram profile", icon: FaInstagram },
      { label: "X (Twitter)", href: "https://x.com/", ariaLabel: "Open X profile", icon: FaTwitter },
      { label: "YT Music", href: "https://music.youtube.com/@RakeshGupta-un7se", ariaLabel: "Open YT Music", icon: YouTubeMusicIcon },
      { label: "Blogs", href: "#", ariaLabel: "Coming soon - Blogs", icon: FaPenNib },
    ],
  },
  {
    label: "Code",
    links: [
      { label: "GitHub", href: "https://github.com/debugonaut/", ariaLabel: "Open GitHub profile", icon: FaGithub },
      { label: "LeetCode", href: "https://leetcode.com/u/Aadesh_Khande/", ariaLabel: "Open LeetCode profile", icon: SiLeetcode },
      { label: "Codolio", href: "https://codolio.com/profile/thisvexesme", ariaLabel: "Open Codolio profile", icon: CodolioIcon },
      { label: "Resume", href: "/Resume.pdf", ariaLabel: "Download resume", icon: FiFileText },
    ],
  },
  {
    label: "Direct",
    links: [
      { label: "Email", href: "mailto:contact@aadeshkhande.com", ariaLabel: "Send an email", icon: FaEnvelope },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/aadesh-khande/", ariaLabel: "Open LinkedIn profile", icon: FaLinkedinIn },
      { label: "Newsletter", href: "#", ariaLabel: "Coming soon - Newsletter", icon: FaNewspaper },
    ],
  },
];

const NAV_ITEMS: CardNavItem[] = [
  {
    label: "Identity",
    bgColor: "var(--nav-card-1)",
    textColor: "var(--nav-card-text)",
    links: [
      { label: "The Lanyard", href: "#identity", ariaLabel: "Go to the identity section" },
      { label: "Journey", href: "#journey", ariaLabel: "Go to the journey section" },
    ],
  },
  {
    label: "Work",
    bgColor: "var(--nav-card-2)",
    textColor: "var(--nav-card-text)",
    links: [
      { label: "Selected Work", href: "#work", ariaLabel: "Go to the work section" },
      { label: "Case Studies", href: "#work-cases", ariaLabel: "Go to the case studies" },
    ],
  },
  {
    label: "Contact",
    bgColor: "var(--nav-card-3)",
    textColor: "var(--nav-card-text)",
    categories: CONTACT_CATEGORIES,
  },
];

// Load choreography: Stroke text animates first, then navbar and scroll prompt fade in.
const STROKE_DRAW_DURATION = 1.6;
const STROKE_FILL_DELAY = 0.2;
const STROKE_STAGGER = 0.05;
const NAV_REVEAL_DELAY = 1; // seconds after stroke completes
const NAV_REVEAL_DURATION = 0.7;
const PROMPT_OFFSET = 0.3; // seconds after the nav starts

export default function Home() {
  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const promptRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLDivElement | null>(null);
  const navReadyRef = useRef(false);
  const setDockedRef = useRef<((target: boolean) => void) | null>(null);
  const [loadingComplete, setLoadingComplete] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
        const isReload = navEntries.length > 0 && navEntries[0].type === "reload";
        if (isReload) return false; // Always play the signature flourish on page reload
      } catch {
        // fallback
      }
      return Boolean(sessionStorage.getItem("portfolio_entered"));
    }
    return false;
  });
  const [strokeComplete, setStrokeComplete] = useState(false);
  const [nameDocked, setNameDocked] = useState(false);
  const [logoRevealed, setLogoRevealed] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    try {
      sessionStorage.setItem("portfolio_entered", "true");
    } catch {
      // ignore
    }
    setLoadingComplete(true);
  }, []);

  const handleStrokeComplete = useCallback(() => {
    setStrokeComplete(true);
  }, []);

  const handleLogoClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setDockedRef.current?.(false);
  }, []);

  // Update tab title when switching away so it stands out cleanly in open tabs
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        document.title = "   Aadesh Khande";
      } else {
        document.title = "Aadesh Khande — Portfolio";
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Hide nav and prompt immediately on mount until stroke animation completes
  useLayoutEffect(() => {
    const nav = navWrapRef.current;
    const prompt = promptRef.current;
    if (nav) gsap.set(nav, { autoAlpha: 0, y: -16 });
    if (prompt) gsap.set(prompt, { autoAlpha: 0, y: 12 });
  }, []);

  useLayoutEffect(() => {
    if (!strokeComplete) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const nav = navWrapRef.current;
      const prompt = promptRef.current;

      if (reduceMotion || !nav || !prompt) {
        gsap.set([nav, prompt].filter(Boolean), { autoAlpha: 1, y: 0 });
        navReadyRef.current = true;
        return;
      }

      // Nav slides down into place; prompt rises slightly. Both use expo.out
      // to match the site's motion language. autoAlpha hides visibility too,
      // so nothing is hoverable/focusable before the reveal.
      gsap.fromTo(
        nav,
        { autoAlpha: 0, y: -16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: NAV_REVEAL_DURATION,
          delay: NAV_REVEAL_DELAY,
          ease: "expo.out",
          onComplete: () => {
            navReadyRef.current = true;
          },
        },
      );

      gsap.fromTo(
        prompt,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: NAV_REVEAL_DURATION,
          delay: NAV_REVEAL_DELAY + PROMPT_OFFSET,
          ease: "expo.out",
        },
      );
    });

    return () => ctx.revert();
  }, [strokeComplete]);

  useLayoutEffect(() => {
    const prompt = promptRef.current;
    if (!prompt) return;

    // Spec 5.4: on the first real scroll input, fade the cue out (300ms) and
    // never bring it back. overwrite:"auto" also cancels the load reveal if
    // the visitor scrolls during the 0–3s window.
    let hidden = false;
    const detach: Array<() => void> = [];
    const hide = () => {
      if (hidden) return;
      hidden = true;
      detach.forEach((fn) => fn());
      gsap.to(prompt, {
        autoAlpha: 0,
        y: -8,
        duration: 0.3,
        ease: "expo.out",
        overwrite: "auto",
      });
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 8) hide();
    };
    const onTouch = () => hide();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key)) {
        hide();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    detach.push(
      () => window.removeEventListener("wheel", onWheel),
      () => window.removeEventListener("touchmove", onTouch),
      () => window.removeEventListener("keydown", onKey),
    );
    return () => detach.forEach((fn) => fn());
  }, []);

  // Name morph: on downward scroll the hero name minimizes and docks into the
  // center of the top bar; scrolling up returns it. Transform-only (scale +
  // x/y from live rects) per the perf rules.
  useLayoutEffect(() => {
    const nameEl = nameRef.current;
    const nav = navWrapRef.current;
    if (!nameEl || !nav) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let docked = false;
    let animating = false;

    const animate = (target: boolean) => {
      const topBar = nav.querySelector<HTMLElement>(".card-nav-top");
      const toggle = topBar?.querySelector<HTMLElement>("button");
      if (!topBar || !toggle) return;

      const rect = nameEl.getBoundingClientRect();
      if (!rect.width) return;

      const vars: gsap.TweenVars = {
        duration: reduced ? 0.001 : 0.6,
        ease: "expo.inOut",
        overwrite: "auto",
        onComplete: () => {
          animating = false;
        },
      };

      if (!target) {
        // Undocking: fade name back in as it returns
        gsap.to(nameEl, { ...vars, x: 0, y: 0, scale: 1, autoAlpha: 1 });
        // Hide logo after name is visible
        setTimeout(() => {
          setNameDocked(false);
          setLogoRevealed(false);
        }, 150);
        return;
      }

      // Docking: target center of navbar top bar
      const topBarRect = topBar.getBoundingClientRect();
      const targetCenterX = topBarRect.left + topBarRect.width / 2;
      const targetCenterY = topBarRect.top + topBarRect.height / 2;
      const currentCenterX = rect.left + rect.width / 2;
      const currentCenterY = rect.top + rect.height / 2;

      const deltaX = targetCenterX - currentCenterX;
      const deltaY = targetCenterY - currentCenterY;

      // Scale down to fit top bar height (~70% of bar height)
      const targetHeight = topBarRect.height * 0.7;
      const scale = targetHeight / rect.height;

      // Animate name towards center of navbar
      gsap.to(nameEl, {
        ...vars,
        x: deltaX,
        y: deltaY,
        scaleX: scale * 0.3,
        scaleY: scale,
        autoAlpha: 0,
      });

      // Reveal signature logo when name disappears
      setTimeout(() => {
        setNameDocked(true);
        setTimeout(() => {
          setLogoRevealed(true);
        }, 50);
      }, 300);
    };

    const setDocked = (target: boolean) => {
      if (target === docked || animating) return;
      if (!navReadyRef.current) return;
      animating = true;
      docked = target;
      animate(target);
    };

    setDockedRef.current = setDocked;

    let touchStartY = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 8) setDocked(true);
      else if (e.deltaY < -8) setDocked(false);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const delta = touchStartY - e.touches[0].clientY;
      if (delta > 12) setDocked(true);
      else if (delta < -12) setDocked(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") setDocked(true);
      else if (e.key === "ArrowUp") setDocked(false);
    };
    const onResize = () => {
      if (docked && !animating) animate(true);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return () => {
      setDockedRef.current = null;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(nameEl);
    };
  }, []);

  return (
    <>
      {/* Loading Screen — shows on first visit */}
      {!loadingComplete && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}

      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div ref={navWrapRef} className="fixed inset-x-0 top-0 z-[99] will-change-[opacity,transform]">
        <CardNav
          items={NAV_ITEMS}
          baseColor="var(--nav-base)"
          menuColor="var(--nav-menu)"
          logoVisible={nameDocked}
          logoAnimate={logoRevealed}
          onLogoClick={handleLogoClick}
        />
      </div>

      <main id="home" className="relative flex min-h-svh flex-col">
        <div ref={nameRef} className="pointer-events-none relative z-[100] flex flex-1 items-center justify-center px-5 sm:px-6">
          <StrokeText
            text="Aadesh Khande"
            strokeColor="var(--foreground)"
            fillColor="var(--foreground)"
            strokeWidth={1.4}
            stackBreakpoint={640}
            drawDuration={STROKE_DRAW_DURATION}
            fillDelay={STROKE_FILL_DELAY}
            stagger={STROKE_STAGGER}
            fontSize={128}
            fontWeight={800}
            letterSpacing={-4}
            className="relative z-[100]"
            animate={loadingComplete}
            onComplete={handleStrokeComplete}
          />
        </div>

        <div
          ref={promptRef}
          className="pointer-events-none absolute inset-x-0 flex justify-center will-change-[opacity,transform]"
          style={{ bottom: "max(env(safe-area-inset-bottom), clamp(1.5rem, 6vh, 2.5rem))" }}
        >
          <ScrollIndicator decorative label="Scroll down" />
        </div>
      </main>
    </>
  );
}
