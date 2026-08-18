import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

interface StrokeTextProps {
  text: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export default function StrokeText({
  text,
  strokeColor = "#1a1712",
  fillColor = "#1a1712",
  strokeWidth = 1.4,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  ease = "power2.out",
  fontSize = 128,
  fontWeight = 800,
  letterSpacing = -4,
  className = "",
  style,
  onComplete,
}: StrokeTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const strokeTextRef = useRef<SVGTextElement>(null);
  const wipeRectRef = useRef<SVGRectElement>(null);
  const [box, setBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const rawId = useId();
  const wipeId = `stroke-text-wipe-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const characters = useMemo(() => Array.from(String(text ?? "")), [text]);
  const dash = Math.max(fontSize * 7, 200);

  const fontStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight,
      letterSpacing: `${letterSpacing}px`,
      fontFamily: "var(--font-hero)",
    }),
    [fontSize, fontWeight, letterSpacing]
  );

  useLayoutEffect(() => {
    const node = strokeTextRef.current;
    if (!node) return undefined;

    let cancelled = false;
    const measure = () => {
      if (cancelled || !strokeTextRef.current) return;
      let bbox;
      try {
        bbox = strokeTextRef.current.getBBox();
      } catch {
        return;
      }
      if (!bbox || !bbox.width) return;
      const pad = Math.max(Number(strokeWidth) || 1, fontSize * 0.1);
      const next = {
        x: bbox.x - pad,
        y: bbox.y - pad,
        width: bbox.width + pad * 2,
        height: bbox.height + pad * 2,
      };
      setBox((prev) =>
        prev && Math.abs(prev.x - next.x) < 0.5 && Math.abs(prev.width - next.width) < 0.5 && Math.abs(prev.y - next.y) < 0.5
          ? prev
          : next
      );
    };

    measure();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [characters, fontSize, fontWeight, letterSpacing, strokeWidth]);

  useEffect(() => {
    const root = rootRef.current;
    if (typeof window === "undefined" || !root || !box) return undefined;

    const strokes = gsap.utils.toArray(root.querySelectorAll("[data-stroke-char]"));
    const fills = gsap.utils.toArray(root.querySelectorAll("[data-fill-char]"));
    const wipe = wipeRectRef.current;

    if (!strokes.length) return undefined;

    const useWipe = true;
    const fillDuration = Math.max(0.4, drawDuration * 0.5);

    const targets = [...strokes, ...fills, wipe].filter(Boolean);

    const setStart = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: dash });
      gsap.set(fills, { opacity: useWipe ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: { width: 0 } });
    };

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0 });
      gsap.set(fills, { opacity: 1 });
      if (wipe) gsap.set(wipe, { attr: { width: box.width } });
      onComplete?.();
      return () => gsap.killTweensOf(targets);
    }

    setStart();

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        onComplete?.();
      },
    });

    tl.to(strokes, { strokeDashoffset: 0, duration: drawDuration, ease, stagger: { each: stagger } }, 0);

    if (useWipe && wipe) {
      tl.to(wipe, { attr: { width: box.width }, duration: fillDuration, ease: "power2.inOut" }, drawDuration + fillDelay);
    }

    return () => {
      tl.kill();
      gsap.killTweensOf(targets);
    };
  }, [box, dash, drawDuration, fillDelay, stagger, ease, onComplete]);

  const viewBox = box ? `${box.x} ${box.y} ${box.width} ${box.height}` : `0 ${-fontSize} 600 ${fontSize * 1.3}`;

  return (
    <span
      ref={rootRef}
      className={`stroke-text ${className}`.trim()}
      style={{ ...style, "--stroke-text-height": `${Math.round(fontSize * 1.3)}px` } as React.CSSProperties}
      role="img"
      aria-label={String(text ?? "")}
    >
      <svg className="stroke-text__svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <clipPath id={wipeId} clipPathUnits="userSpaceOnUse">
            <rect ref={wipeRectRef} x={box?.x ?? 0} y={box?.y ?? 0} width="0" height={box?.height ?? fontSize * 1.3} />
          </clipPath>
        </defs>
        <text
          ref={strokeTextRef}
          className="stroke-text__stroke"
          x="0"
          y="0"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={fontStyle}
        >
          {characters.map((char, index) => (
            <tspan data-stroke-char key={`s-${index}`}>
              {char}
            </tspan>
          ))}
        </text>
        <text
          className="stroke-text__fill"
          x="0"
          y="0"
          fill={fillColor}
          stroke="none"
          style={fontStyle}
          clipPath={`url(#${wipeId})`}
        >
          {characters.map((char, index) => (
            <tspan data-fill-char key={`f-${index}`}>
              {char}
            </tspan>
          ))}
        </text>
      </svg>
    </span>
  );
}
