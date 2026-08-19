/**
 * ThemeToggle — AnimatedThemeToggler (circle View Transition) +
 * Classic animated SVG icon (sun↔moon morph from @theme-toggles).
 *
 * The page does a circular clip-path reveal from the button center on toggle.
 * The SVG icon itself morphs: rays collapse + circle clips into crescent.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ClassicSvg } from "@/components/ui/classic-svg";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ak-theme";

// ─── clip-path helpers (from MagicUI AnimatedThemeToggler) ─────────────────
function getCircleClipPaths(
  cx: number,
  cy: number,
  maxRadius: number,
  vw: number,
  vh: number
): [string, string] {
  const px = (x: number) => `${(x / vw) * 100}%`;
  const py = (y: number) => `${(y / vh) * 100}%`;
  const toRadius = (r: number) =>
    `${(r / (Math.hypot(vw, vh) / Math.SQRT2)) * 100}%`;
  return [
    `circle(0% at ${px(cx)} ${py(cy)})`,
    `circle(${toRadius(maxRadius)} at ${px(cx)} ${py(cy)})`,
  ];
}

// ─── component ─────────────────────────────────────────────────────────────
interface ThemeToggleProps {
  className?: string;
  /** Duration for BOTH the View Transition reveal AND the SVG morph (ms) */
  duration?: number;
}

export function ThemeToggle({ className, duration = 500 }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);
  const activeAnimRef = useRef<Animation | null>(null);

  // Keep local state in sync with the class (handles external changes too)
  useEffect(() => {
    const sync = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn || isTransitioningRef.current) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { top, left, width, height } = btn.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top + height / 2;
    const maxRadius = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));

    const apply = () => {
      const next = !isDark;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      // Sync theme-color meta
      const color = next ? "#000000" : "#f2ecdf";
      document.querySelectorAll('meta[name="theme-color"]').forEach((m) =>
        m.setAttribute("content", color)
      );
      setIsDark(next);
    };

    // No View Transitions support → instant swap, SVG still animates
    if (typeof document.startViewTransition !== "function") {
      apply();
      return;
    }

    // Reduced motion → instant swap
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }

    const [clipFrom, clipTo] = getCircleClipPaths(cx, cy, maxRadius, vw, vh);

    const root = document.documentElement;
    root.dataset.themeVt = "active";
    root.style.setProperty("--vt-clip-from", clipFrom);

    const cleanup = () => {
      isTransitioningRef.current = false;
      delete root.dataset.themeVt;
      root.style.removeProperty("--vt-clip-from");
      activeAnimRef.current?.cancel();
      activeAnimRef.current = null;
    };

    isTransitioningRef.current = true;
    const transition = document.startViewTransition(() => {
      flushSync(apply);
    });

    transition.finished.finally(cleanup).catch(() => {});

    transition.ready
      .then(() => {
        const anim = document.documentElement.animate(
          { clipPath: [clipFrom, clipTo] },
          {
            duration,
            easing: "ease-in-out",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        activeAnimRef.current = anim;
      })
      .catch(() => {});
  }, [isDark, duration]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={cn(
        "relative grid h-9 w-9 cursor-pointer place-items-center rounded-full",
        "border border-border/70 text-[18px] text-foreground/75",
        "transition-colors duration-300 hover:border-accent/70 hover:text-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
    >
      <ClassicSvg isDark={isDark} duration={duration} />
    </button>
  );
}
