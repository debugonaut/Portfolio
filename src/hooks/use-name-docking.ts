import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface UseNameDockingOptions {
  nameRef: React.RefObject<HTMLDivElement | null>;
  navWrapRef: React.RefObject<HTMLDivElement | null>;
  navReady: boolean;
}

export function useNameDocking({ nameRef, navWrapRef, navReady }: UseNameDockingOptions) {
  const [nameDocked, setNameDocked] = useState(false);
  const [logoRevealed, setLogoRevealed] = useState(false);
  const setDockedRef = useRef<((target: boolean) => void) | null>(null);

  useLayoutEffect(() => {
    const nameEl = nameRef.current;
    const nav = navWrapRef.current;
    if (!nameEl || !nav) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let docked = false;
    let animating = false;

    const timers: Array<ReturnType<typeof setTimeout>> = [];

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
        timers.push(
          setTimeout(() => {
            setNameDocked(false);
            setLogoRevealed(false);
          }, 150)
        );
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
      timers.push(
        setTimeout(() => {
          setNameDocked(true);
          timers.push(
            setTimeout(() => {
              setLogoRevealed(true);
            }, 50)
          );
        }, 300)
      );
    };

    const setDocked = (target: boolean) => {
      if (target === docked || animating) return;
      if (!navReady) return;
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
      timers.forEach(clearTimeout);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(nameEl);
    };
  }, [navReady, nameRef, navWrapRef]);

  const triggerDock = (target: boolean) => {
    setDockedRef.current?.(target);
  };

  return {
    nameDocked,
    logoRevealed,
    setDocked: triggerDock,
  };
}
