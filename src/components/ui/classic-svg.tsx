/**
 * ClassicSvg — the raw animated SVG from @theme-toggles (classic variant).
 * Sun rays collapse + circle clips into a crescent moon on dark mode.
 * Use this inside a button; it does NOT render its own <button>.
 */
import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface ClassicSvgProps {
  isDark: boolean;
  duration?: number;
  className?: string;
}

export function ClassicSvg({ isDark, duration = 500, className }: ClassicSvgProps) {
  const id = useId().replace(/:/g, "");
  const clipId = `classic-clip-${id}`;

  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ "--d": `${duration}ms` } as CSSProperties}
      className={cn("overflow-visible", className)}
    >
      <defs>
        <clipPath id={clipId}>
          {/* Clips circle → crescent. Path morphs when .dark class is present */}
          <path
            d={
              isDark
                ? "M0 2h13a1 1 0 0010 10v14H0Z"
                : "M0 0h25a1 1 0 0010 10v14H0Z"
            }
            style={{
              transitionProperty: "d",
              transitionDuration: "var(--d)",
              transitionDelay: isDark ? `calc(var(--d) * 0.15)` : "0ms",
            }}
          />
        </clipPath>
      </defs>

      <g stroke="currentColor" strokeLinecap="round">
        {/* Main circle — scales up (moon) or stays small (sun) */}
        <circle
          cx={12}
          cy={12}
          r={5}
          fill="currentColor"
          clipPath={`url(#${clipId})`}
          style={{
            transformOrigin: "center",
            transitionProperty: "transform",
            transitionDuration: "var(--d)",
            transform: isDark ? "scale(1.7)" : "scale(1)",
          }}
        />

        {/* 8 sun rays — fade + rotate out when going dark */}
        {[
          "M12 1.4v2.4",
          "m20.3 3.7-2.5 2.5",
          "M22.6 12h-2.4",
          "m20.3 20.3-2.5-2.5",
          "M12 22.6v-2.4",
          "m3.7 20.3 2.5-2.5",
          "M1.4 12h2.4",
          "m3.7 3.7 2.5 2.5",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeMiterlimit={0}
            style={{
              transformOrigin: "center",
              transitionProperty: "transform, opacity",
              transitionDuration: "var(--d)",
              transitionDelay: isDark ? "0ms" : `calc(var(--d) * 0.15)`,
              transform: isDark ? "scale(0.5) rotate(45deg)" : "scale(1) rotate(0deg)",
              opacity: isDark ? 0 : 1,
            }}
          />
        ))}
      </g>
    </svg>
  );
}
