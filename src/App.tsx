import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ThemeProvider } from "@/theme-provider";
import CardNav, { type CardNavItem, type CardNavCategory } from "@/components/card-nav";
import ScrollIndicator from "@/components/scroll-indicator";
import StrokeText from "@/components/stroke-text";
import "@/components/stroke-text.css";

import { FaGithub, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube, FaEnvelope } from "react-icons/fa";
import { SiLeetcode, SiDevdotto } from "react-icons/si";

const CONTACT_CATEGORIES: CardNavCategory[] = [
  {
    label: "Social",
    links: [
      { label: "Twitter / X", href: "#", ariaLabel: "Open Twitter profile", icon: FaTwitter },
      { label: "Instagram", href: "#", ariaLabel: "Open Instagram profile", icon: FaInstagram },
      { label: "YouTube", href: "#", ariaLabel: "Open YouTube channel", icon: FaYoutube },
    ],
  },
  {
    label: "Code",
    links: [
      { label: "GitHub", href: "#", ariaLabel: "Open GitHub profile", icon: FaGithub },
      { label: "LeetCode", href: "#", ariaLabel: "Open LeetCode profile", icon: SiLeetcode },
      { label: "Dev.to", href: "#", ariaLabel: "Open Dev.to profile", icon: SiDevdotto },
    ],
  },
  {
    label: "Direct",
    links: [
      { label: "Email", href: "mailto:surru8990@gmail.com", ariaLabel: "Send an email", icon: FaEnvelope },
      { label: "LinkedIn", href: "#", ariaLabel: "Open LinkedIn profile", icon: FaLinkedinIn },
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

function App() {
  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const promptRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLDivElement | null>(null);
  const navReadyRef = useRef(false);
  const setDockedRef = useRef<((target: boolean) => void) | null>(null);
  const [strokeComplete, setStrokeComplete] = useState(false);
  const [nameDocked, setNameDocked] = useState(false);
  const [logoRevealed, setLogoRevealed] = useState(false);

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
        duration: reduced ? 0 : 0.6,
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
        }, 200);
        return;
      }

      const topBarRect = topBar.getBoundingClientRect();
      const navWidth = topBarRect.width;
      const targetWidth = navWidth * 0.45;
      const scale = targetWidth / rect.width;
      const centerX = topBarRect.left + topBarRect.width / 2;
      const centerY = topBarRect.top + topBarRect.height / 2;
      const dx = centerX - (rect.left + rect.width / 2);
      const dy = centerY - (rect.top + rect.height / 2);

      // Docking: fade name out as it arrives at navbar
      gsap.to(nameEl, { ...vars, x: dx, y: dy, scale, autoAlpha: 0 });
      // Reveal logo when name is mostly gone
      setTimeout(() => {
        setNameDocked(true);
        setLogoRevealed(true);
      }, 350);
    };

    const setDocked = (target: boolean) => {
      if (!navReadyRef.current || animating || docked === target) return;
      docked = target;
      animating = true;
      animate(target);
    };

    setDockedRef.current = setDocked;

    let lastTouchY = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 8) setDocked(e.deltaY > 0);
    };
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? lastTouchY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (y == null) return;
      const dy = lastTouchY - y;
      if (Math.abs(dy) > 10) {
        setDocked(dy > 0);
        lastTouchY = y;
      }
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
    <ThemeProvider>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div ref={navWrapRef} className="relative z-[99] will-change-[opacity,transform]">
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
        <div ref={nameRef} className="pointer-events-none relative z-[100] flex flex-1 items-center justify-center px-6">
          <StrokeText
            text="Aadesh Khande"
            strokeColor="var(--foreground)"
            fillColor="var(--foreground)"
            strokeWidth={1.4}
            drawDuration={STROKE_DRAW_DURATION}
            fillDelay={STROKE_FILL_DELAY}
            stagger={STROKE_STAGGER}
            fontSize={128}
            fontWeight={800}
            letterSpacing={-4}
            className="relative z-[100]"
            onComplete={handleStrokeComplete}
          />
        </div>

        <div
          ref={promptRef}
          className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center will-change-[opacity,transform]"
        >
          <ScrollIndicator decorative label="Scroll down" />
        </div>
      </main>
    </ThemeProvider>
  );
}

export default App;
