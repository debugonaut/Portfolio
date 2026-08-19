import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

/**
 * 404 Page — mysterious, minimal, matching the portfolio's dark/beige aesthetic.
 * Uses GSAP for smooth reveal animations.
 */
export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // 404 code — stroke reveal like the hero
      tl.fromTo(
        codeRef.current,
        { autoAlpha: 0, scale: 0.8 },
        { autoAlpha: 1, scale: 1, duration: reduceMotion ? 0.001 : 1.2 },
      );

      // Message fades in
      tl.fromTo(
        messageRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: reduceMotion ? 0.001 : 0.8 },
        "-=0.6",
      );

      // Divider draws
      tl.fromTo(
        dividerRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: reduceMotion ? 0.001 : 0.6 },
        "-=0.4",
      );

      // Link fades in
      tl.fromTo(
        linkRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: reduceMotion ? 0.001 : 0.6 },
        "-=0.3",
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex min-h-svh flex-col items-center justify-center px-6 selection:bg-[var(--accent)] selection:text-black"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* 404 Code */}
      <h1
        ref={codeRef}
        className="select-none font-[var(--font-hero)] text-[clamp(6rem,15vw,12rem)] font-extrabold leading-none tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        404
      </h1>

      {/* Message */}
      <p
        ref={messageRef}
        className="mt-4 max-w-md text-center text-lg md:text-xl font-normal leading-relaxed"
        style={{ color: "var(--muted)" }}
      >
        This page has wandered off the map.
        <br />
        Nothing to see here — just echoes.
      </p>

      {/* Divider */}
      <div
        ref={dividerRef}
        className="mx-auto my-8 h-px w-24 origin-center"
        style={{ backgroundColor: "var(--accent)" }}
      />

      {/* Go Home Link */}
      <Link
        ref={linkRef}
        to="/"
        className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        style={{
          backgroundColor: "var(--foreground)",
          color: "var(--background)",
        }}
      >
        <span>Back to safety</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </Link>
    </div>
  );
}
