import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

interface StrokeTextProps {
  text: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  /** Viewport width (px) at or below which the name stacks into two lines. */
  stackBreakpoint?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Whether the stroke drawing timeline should play (defaults to true) */
  animate?: boolean;
  onComplete?: () => void;
}

export default function StrokeText({
  text,
  strokeColor = "var(--foreground)",
  fillColor = "var(--foreground)",
  strokeWidth = 1.4,
  stackBreakpoint = 640,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  ease = "power2.out",
  fontWeight = 400,
  className = "",
  style,
  animate = true,
  onComplete,
}: StrokeTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const strokeLayerRef = useRef<HTMLDivElement>(null);
  const fillLayerRef = useRef<HTMLDivElement>(null);
  const [stacked, setStacked] = useState(false);

  // Responsive two-line stack on mobile
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${stackBreakpoint}px)`);
    const apply = () => setStacked(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [stackBreakpoint]);

  const lines = useMemo(() => {
    const normalized = String(text ?? "").trim();
    if (!stacked || !normalized) return [normalized];
    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length < 2) return [normalized];
    return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
  }, [text, stacked]);

  useEffect(() => {
    const root = rootRef.current;
    const strokeEl = strokeLayerRef.current;
    const fillEl = fillLayerRef.current;
    if (typeof window === "undefined" || !root || !strokeEl || !fillEl) return undefined;

    const strokeChars = strokeEl.querySelectorAll("[data-char]");
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(strokeEl, { opacity: 1, clipPath: "inset(0 0% 0 0)" });
      gsap.set(fillEl, { opacity: 1, clipPath: "inset(0 0% 0 0)" });
      gsap.set(strokeChars, { opacity: 1, y: 0 });
      onComplete?.();
      return undefined;
    }

    // Reset to start state
    gsap.killTweensOf([strokeEl, fillEl, ...Array.from(strokeChars)]);
    gsap.set(strokeEl, { opacity: 1, clipPath: "inset(0 100% 0 0)" });
    gsap.set(fillEl, { opacity: 1, clipPath: "inset(0 100% 0 0)" });
    gsap.set(strokeChars, { opacity: 0, y: 12 });

    if (!animate) return undefined;

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        onComplete?.();
      },
    });

    const fillDuration = Math.max(0.5, drawDuration * 0.55);

    // 1. Wipe stroke container in + stagger characters
    tl.to(
      strokeEl,
      {
        clipPath: "inset(0 0% 0 0)",
        duration: drawDuration,
        ease: "power2.inOut",
      },
      0
    );

    tl.to(
      strokeChars,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: stagger,
        ease: ease,
      },
      0.05
    );

    // 2. Wipe the solid fill across the letters
    tl.to(
      fillEl,
      {
        clipPath: "inset(0 0% 0 0)",
        duration: fillDuration,
        ease: "power2.inOut",
      },
      drawDuration * 0.65 + fillDelay
    );

    return () => {
      tl.kill();
      gsap.killTweensOf([strokeEl, fillEl, ...Array.from(strokeChars)]);
    };
  }, [lines, drawDuration, fillDelay, stagger, ease, animate, onComplete, stacked]);

  return (
    <div
      ref={rootRef}
      className={`stroke-text-lockup relative select-none text-center ${className}`.trim()}
      style={{
        ...style,
        fontFamily: "var(--font-hero)",
      }}
      role="heading"
      aria-level={1}
      aria-label={String(text ?? "")}
    >
      {/* Container holding perfectly aligned stroke and fill layers */}
      <div className="relative inline-flex flex-col items-center justify-center">
        {/* Layer 1: Outlined Stroke Layer */}
        <div
          ref={strokeLayerRef}
          className="stroke-text__stroke-layer leading-[0.95] tracking-tight will-change-[clip-path,transform]"
          style={{
            clipPath: "inset(0 100% 0 0)",
            WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
            color: "transparent",
            fontFamily: "var(--font-hero)",
            fontWeight: fontWeight,
          }}
          aria-hidden="true"
        >
          {lines.map((line, li) => (
            <div
              key={`stroke-line-${li}`}
              className="whitespace-nowrap font-hero text-[clamp(44px,14vw,80px)] sm:text-[clamp(68px,11vw,132px)]"
              style={{
                letterSpacing: stacked ? "-0.03em" : "-0.04em",
              }}
            >
              {Array.from(line).map((char, ci) => (
                <span
                  key={`sc-${li}-${ci}`}
                  data-char
                  className="inline-block"
                  style={{
                    marginRight: char === " " ? (stacked ? "0.25em" : "0.35em") : undefined,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Layer 2: Solid Fill Layer (wipes over the stroke layer) */}
        <div
          ref={fillLayerRef}
          className="stroke-text__fill-layer absolute inset-0 pointer-events-none leading-[0.95] tracking-tight will-change-[clip-path]"
          style={{
            clipPath: "inset(0 100% 0 0)",
            color: fillColor,
            fontFamily: "var(--font-hero)",
            fontWeight: fontWeight,
          }}
          aria-hidden="true"
        >
          {lines.map((line, li) => (
            <div
              key={`fill-line-${li}`}
              className="whitespace-nowrap font-hero text-[clamp(44px,14vw,80px)] sm:text-[clamp(68px,11vw,132px)]"
              style={{
                letterSpacing: stacked ? "-0.03em" : "-0.04em",
              }}
            >
              {Array.from(line).map((char, ci) => (
                <span
                  key={`fc-${li}-${ci}`}
                  className="inline-block"
                  style={{
                    marginRight: char === " " ? (stacked ? "0.25em" : "0.35em") : undefined,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

