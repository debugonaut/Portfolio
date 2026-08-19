import { motion, useReducedMotion, type Variants } from "framer-motion";

interface ScrollIndicatorProps {
  /** Text label above the chevrons. Defaults to "Scroll down" */
  label?: string;
  /** Number of chevron layers. Defaults to 3 */
  count?: number;
  /** Called when clicked — e.g. scroll to next section */
  onClick?: () => void;
  /** Extra Tailwind classes on the wrapper */
  className?: string;
  /** Pure decoration (aria-hidden, not focusable) — until real sections exist */
  decorative?: boolean;
}

// Each chevron fades in from above and exits downward, staggered — a
// cascade "waterfall". Colors come from tokens (currentColor / text-muted),
// so the cue reads correctly in both the pure-black and beige identities.
const chevronVariants: Variants = {
  animate: (i: number) => ({
    opacity: [0, 1, 0],
    y: [-4, 0, 4],
    transition: {
      duration: 1.6,
      ease: "easeInOut",
      repeat: Infinity,
      delay: i * 0.25,
    },
  }),
};

// Depth: each layer is more muted than the last.
const LAYER_OPACITY = ["opacity-100", "opacity-60", "opacity-30"];

function Chevron() {
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none" aria-hidden="true">
      <path
        d="M3 3L14 13L25 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ScrollIndicator({
  label = "",
  count = 3,
  onClick,
  className = "",
  decorative = false,
}: ScrollIndicatorProps) {
  const reduceMotion = useReducedMotion();

  const chevrons = Array.from({ length: count }).map((_, i) => {
    const layerClass = LAYER_OPACITY[Math.min(i, LAYER_OPACITY.length - 1)];
    const stackClass = `-mt-1.5 first:mt-0 ${layerClass}`;
    if (reduceMotion) {
      return (
        <div key={i} className={stackClass}>
          <Chevron />
        </div>
      );
    }
    return (
      <motion.div
        key={i}
        custom={i}
        animate="animate"
        variants={chevronVariants}
        className={stackClass}
      >
        <Chevron />
      </motion.div>
    );
  });

  const inner = (
    <>
      {label && (
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted transition-colors duration-300 group-hover:text-foreground/70">
          {label}
        </span>
      )}
      <div className="flex flex-col items-center text-foreground">{chevrons}</div>
    </>
  );

  if (decorative) {
    return (
      <div aria-hidden="true" className={`flex flex-col items-center gap-2 ${className}`}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll to next section"
      className={`group flex cursor-pointer flex-col items-center gap-2 rounded-sm bg-transparent p-0 outline-none ${className}`}
    >
      {inner}
    </button>
  );
}
