import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-border/70 text-foreground/75 transition-colors duration-300 hover:border-accent/70 hover:text-accent"
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "absolute h-[15px] w-[15px] transition-all duration-[1125ms]",
          dark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute h-[15px] w-[15px] transition-all duration-[1125ms]",
          dark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        )}
      />
    </button>
  );
}
