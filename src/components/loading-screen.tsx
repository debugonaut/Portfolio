import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface LoadingScreenProps {
  /** Called when the loading animation completes */
  onComplete: () => void;
}

// 1.65x Wide Stance signature handwriting path with smooth parabolic sweep & downward-bowed crossbar
export const SIGNATURE_HANDWRITING_PATH =
  "M 88 454 C 88 462, 105 468, 128 466 C 177 462, 233 428, 250 354 C 266 276, 260 158, 250 82 C 257 140, 299 342, 359 464 C 329 418, 250 354, 148 328 C 204 322, 303 330, 382 296";

/**
 * LoadingScreen — minimalist single-element initial stroke reveal.
 * 6.8px ink weight, 1.65x stance, 1x speed.
 */
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const strokePathRef = useRef<SVGPathElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const stroke = strokePathRef.current;
    const container = containerRef.current;
    if (!stroke || !container) return;

    const length = stroke.getTotalLength() || 1600;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Set initial undrawn state
      gsap.set(stroke, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      if (reduceMotion) {
        gsap.set(stroke, { strokeDashoffset: 0 });
        setIsAnimating(false);
        onComplete();
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setIsAnimating(false);
          onComplete();
        },
      });

      // 1. Fluid handwriting stroke draw (1x speed: 1.55s)
      tl.to(stroke, {
        strokeDashoffset: 0,
        duration: 1.55,
        ease: "power2.inOut",
      });

      // 2. Subtle ink settle micro-pulse (6.8px ink weight)
      tl.to(
        stroke,
        {
          strokeWidth: 7.3,
          duration: 0.18,
          ease: "power1.out",
        },
        "-=0.1"
      );
      tl.to(stroke, {
        strokeWidth: 6.8,
        duration: 0.22,
        ease: "power2.out",
      });

      // 3. Smooth dissolve into the homepage
      tl.to(
        container,
        {
          autoAlpha: 0,
          scale: 1.05,
          duration: 0.45,
          ease: "power2.in",
        },
        "+=0.15"
      );
    });

    return () => ctx.revert();
  }, [onComplete]);

  if (!isAnimating) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="relative p-6 flex items-center justify-center">
        <svg
          viewBox="0 0 480 600"
          width={200}
          height={250}
          className="transition-colors duration-200"
          style={{
            willChange: "transform, opacity",
          }}
          aria-hidden="true"
        >
          <path
            ref={strokePathRef}
            d={SIGNATURE_HANDWRITING_PATH}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="6.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              willChange: "stroke-dashoffset",
            }}
          />
        </svg>
      </div>
    </div>
  );
}
