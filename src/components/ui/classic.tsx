import { useId, type ButtonHTMLAttributes, type CSSProperties } from "react";
import { useTheme } from "@/theme-provider";
import { cn } from "@/lib/utils";

export interface ClassicProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  duration?: number;
  toggled?: boolean;
}

export function Classic({
  duration = 500,
  className,
  type = "button",
  title = "Toggle theme",
  "aria-label": ariaLabel,
  onClick,
  toggled,
  ...props
}: ClassicProps) {
  const toggleId = useId().replace(/:/g, "");
  const clipMainId = `toggles-dev-classic-main-${toggleId}`;
  const { theme, toggleTheme } = useTheme();
  const isDark = toggled !== undefined ? toggled : theme === "dark";

  return (
    <button
      type={type}
      title={title}
      aria-label={ariaLabel || (isDark ? "Switch to light mode" : "Switch to dark mode")}
      aria-pressed={isDark}
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        } else {
          toggleTheme();
        }
      }}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={
          {
            "--toggles-duration": `${duration}ms`,
          } as CSSProperties
        }
        className="overflow-visible"
      >
        <defs>
          <clipPath id={clipMainId}>
            <path
              d="M0 0h25a1 1 0 0010 10v14H0Z"
              className={cn(
                "transition-[d,transform] duration-[var(--toggles-duration)]",
                "dark:delay-[calc(var(--toggles-duration)*0.15)]",
                "dark:[d:path('M0_2h13a1_1_0_0010_10v14H0Z')]",
                "dark:not-supports-[d:path('M0_0')]:-translate-x-3.25 dark:not-supports-[d:path('M0_0')]:translate-y-0.5"
              )}
            />
          </clipPath>
        </defs>
        <g stroke="currentColor" strokeLinecap="round">
          <circle
            cx={12}
            cy={12}
            r={5}
            fill="currentColor"
            clipPath={`url(#${clipMainId})`}
            className={cn(
              "origin-center transition-transform duration-[var(--toggles-duration)]",
              "dark:scale-[1.7]"
            )}
          />
          <path
            d="M12 1.4v2.4"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeMiterlimit={0}
            paintOrder="stroke markers fill"
            className={cn(
              "origin-center transition-all duration-[var(--toggles-duration)] delay-[calc(var(--toggles-duration)*0.15)]",
              "dark:delay-0 dark:scale-50 dark:rotate-45 dark:opacity-0"
            )}
          />
          <path
            d="m20.3 3.7-2.5 2.5"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeMiterlimit={0}
            paintOrder="stroke markers fill"
            className={cn(
              "origin-center transition-all duration-[var(--toggles-duration)] delay-[calc(var(--toggles-duration)*0.15)]",
              "dark:delay-0 dark:scale-50 dark:rotate-45 dark:opacity-0"
            )}
          />
          <path
            d="M22.6 12h-2.4"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeMiterlimit={0}
            paintOrder="stroke markers fill"
            className={cn(
              "origin-center transition-all duration-[var(--toggles-duration)] delay-[calc(var(--toggles-duration)*0.15)]",
              "dark:delay-0 dark:scale-50 dark:rotate-45 dark:opacity-0"
            )}
          />
          <path
            d="M12 22.6v-2.4"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeMiterlimit={0}
            paintOrder="stroke markers fill"
            className={cn(
              "origin-center transition-all duration-[var(--toggles-duration)] delay-[calc(var(--toggles-duration)*0.15)]",
              "dark:delay-0 dark:scale-50 dark:rotate-45 dark:opacity-0"
            )}
          />
          <path
            d="M1.4 12h2.4"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeMiterlimit={0}
            paintOrder="stroke markers fill"
            className={cn(
              "origin-center transition-all duration-[var(--toggles-duration)] delay-[calc(var(--toggles-duration)*0.15)]",
              "dark:delay-0 dark:scale-50 dark:rotate-45 dark:opacity-0"
            )}
          />
          <path
            d="m20.3 20.3-2.5-2.5"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeMiterlimit={0}
            paintOrder="stroke markers fill"
            className={cn(
              "origin-center transition-all duration-[var(--toggles-duration)] delay-[calc(var(--toggles-duration)*0.15)]",
              "dark:delay-0 dark:scale-50 dark:rotate-45 dark:opacity-0"
            )}
          />
          <path
            d="m3.7 20.3 2.5-2.5"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeMiterlimit={0}
            paintOrder="stroke markers fill"
            className={cn(
              "origin-center transition-all duration-[var(--toggles-duration)] delay-[calc(var(--toggles-duration)*0.15)]",
              "dark:delay-0 dark:scale-50 dark:rotate-45 dark:opacity-0"
            )}
          />
          <path
            d="m3.7 3.7 2.5 2.5"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeMiterlimit={0}
            paintOrder="stroke markers fill"
            className={cn(
              "origin-center transition-all duration-[var(--toggles-duration)] delay-[calc(var(--toggles-duration)*0.15)]",
              "dark:delay-0 dark:scale-50 dark:rotate-45 dark:opacity-0"
            )}
          />
        </g>
      </svg>
    </button>
  );
}
