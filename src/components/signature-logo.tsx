import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import signatureSvg from "../signature.svg?url";

interface SignatureLogoProps {
  /** Whether to play the reveal animation */
  animate?: boolean;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  className?: string;
}

/**
 * Signature logo with a wipe-reveal animation.
 * Uses CSS mix-blend-mode + filter for light/dark theme support.
 */
export default function SignatureLogo({
  animate = false,
  width = 40,
  height = 50,
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
      gsap.set(el.querySelector(".sig-logo-img"), { opacity: 1, scale: 1 });
      hasAnimated.current = true;
      return;
    }

    hasAnimated.current = true;

    const img = el.querySelector(".sig-logo-img") as HTMLElement;

    // Start: fully clipped, image invisible and scaled down
    gsap.set(el, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(img, { opacity: 0, scale: 0.85, transformOrigin: "center center" });

    const tl = gsap.timeline();

    // Wipe reveal from left to right
    tl.to(el, {
      clipPath: "inset(0 0% 0 0)",
      duration: 0.8,
      ease: "power2.inOut",
    });

    // Simultaneously fade in and scale up the image
    tl.to(img, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    }, 0.15);
  }, [animate, width, height]);

  // Reset when animate goes false
  useEffect(() => {
    if (!animate) {
      hasAnimated.current = false;
      const el = containerRef.current;
      if (el) {
        gsap.set(el, { clipPath: "inset(0 100% 0 0)" });
        const img = el.querySelector(".sig-logo-img") as HTMLElement;
        if (img) gsap.set(img, { opacity: 0, scale: 0.85 });
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
      <img
        src={signatureSvg}
        alt=""
        className="sig-logo-img"
        width={width}
        height={height}
        style={{
          opacity: 0,
          display: "block",
          /* Theme-aware: invert in dark mode, keep normal in light mode */
          filter: "var(--logo-filter, none)",
        }}
      />
    </div>
  );
}
