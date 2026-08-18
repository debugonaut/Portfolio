import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SIGNATURE_PATH } from "./signature-paths";

interface SignatureLogoProps {
  /** Whether to play the reveal animation */
  animate?: boolean;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Screen-pixel stroke thickness (via non-scaling-stroke) for crisp, refined ink */
  strokeWidth?: number;
  className?: string;
}

/**
 * Signature logo with a wipe-reveal animation.
 * Uses native inline SVG with currentColor and non-scaling-stroke
 * so the stroke is rendered in crisp screen pixels, ensuring it is
 * clean, dark, and razor-sharp in both light and dark themes.
 */
export default function SignatureLogo({
  animate = false,
  width = 38,
  height = 46,
  strokeWidth = 1.2,
  className = "",
}: SignatureLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!animate || hasAnimated.current) return;
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(el, { clipPath: "inset(0 0 0 0)" });
      gsap.set(el.querySelector(".sig-logo-svg"), { opacity: 1, scale: 1 });
      hasAnimated.current = true;
      return;
    }

    hasAnimated.current = true;

    const svg = el.querySelector(".sig-logo-svg") as SVGElement;

    // Start: fully clipped, SVG invisible and scaled down
    gsap.set(el, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(svg, { opacity: 0, scale: 0.85, transformOrigin: "center center" });

    const tl = gsap.timeline();

    // Wipe reveal from left to right
    tl.to(el, {
      clipPath: "inset(0 0% 0 0)",
      duration: 0.8,
      ease: "power2.inOut",
    });

    // Simultaneously fade in and scale up the SVG
    tl.to(
      svg,
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      0.15,
    );
  }, [animate, width, height]);

  // Reset when animate goes false
  useEffect(() => {
    if (!animate) {
      hasAnimated.current = false;
      const el = containerRef.current;
      if (el) {
        gsap.set(el, { clipPath: "inset(0 100% 0 0)" });
        const svg = el.querySelector(".sig-logo-svg") as SVGElement;
        if (svg) gsap.set(svg, { opacity: 0, scale: 0.85 });
      }
    }
  }, [animate]);

  return (
    <div
      ref={containerRef}
      className={`signature-logo-wrapper ${className}`}
      style={{
        width,
        height,
        clipPath: "inset(0 100% 0 0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 480 600"
        width={width}
        height={height}
        className="sig-logo-svg"
        style={{
          opacity: 0,
          display: "block",
          color: "var(--nav-menu)",
          willChange: "transform, opacity",
        }}
      >
        <g
          transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d={SIGNATURE_PATH} vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
    </div>
  );
}
