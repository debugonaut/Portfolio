import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { SIGNATURE_HANDWRITING_PATH } from "@/components/loading-screen";

/**
 * RefreshTransition — temporary smooth animated interstitial page that plays
 * the signature handwriting stroke (6.8px, 1.65x stance) then transitions to the main site.
 */
export default function RefreshTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const strokePathRef = useRef<SVGPathElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stroke = strokePathRef.current;
    const container = containerRef.current;
    if (!stroke || !container) return;

    const length = stroke.getTotalLength() || 1600;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(stroke, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      if (reduceMotion) {
        gsap.set(stroke, { strokeDashoffset: 0 });
        navigate("/", { replace: true });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          navigate("/", { replace: true });
        },
      });

      // 1. Fluid handwriting stroke draw (1x speed: 1.55s)
      tl.to(stroke, {
        strokeDashoffset: 0,
        duration: 1.55,
        ease: "power2.inOut",
      });

      // 2. Subtle ink settle (6.8px ink weight)
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
  }, [navigate]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-svh flex-col items-center justify-center px-6"
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
