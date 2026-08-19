import { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { SIGNATURE_PATH } from "@/components/signature-paths";
import StrokeText from "@/components/stroke-text";
import { useTheme } from "@/theme-provider";

export type MockupStyle =
  | "smooth-sweep-thick"
  | "ink-nib-lead"
  | "velocity-flow"
  | "morph-handoff";

interface MockupMeta {
  id: MockupStyle;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  tags: string[];
}

const MOCKUP_METAS: MockupMeta[] = [
  {
    id: "smooth-sweep-thick",
    title: "1. Ultra-Smooth Sweep & Downward Bowed Crossbar",
    subtitle: "Deep left arc + downward-curved star crossbar",
    duration: "1.6s",
    description:
      "Continuous graceful left parabolic arc + natural downward-curving bow on the final crossbar from left to right, matching the organic gesture of your signature.",
    tags: ["Bowed Crossbar", "Parabolic Sweep", "10.2px Thick", "Organic"],
  },
  {
    id: "ink-nib-lead",
    title: "2. Golden Nib Trail",
    subtitle: "Glowing gold nib writing the bold mark",
    duration: "1.6s",
    description:
      "A glowing gold fountain pen tip draws your initial live on screen, depositing the thick dark line in real time as it moves through the smooth curves.",
    tags: ["Pen Nib", "Gold Trail", "Interactive", "Premium"],
  },
  {
    id: "velocity-flow",
    title: "3. Kinetic Velocity Flow",
    subtitle: "Calligraphic speed variance (slows at apex, whips on crossbar)",
    duration: "1.5s",
    description:
      "Mimics real human pen velocity: decelerates into the high apex peak, accelerates on the long downstroke, and flows with whip physics through the horizontal crossbars.",
    tags: ["Human Physics", "Dynamic Ease", "Velocity Curves"],
  },
  {
    id: "morph-handoff",
    title: "4. Complete Flow & Hero Handoff",
    subtitle: "Signature reveal → Home hero name draw",
    duration: "1.9s",
    description:
      "The full handwritten mark draws itself, the ink settles with a micro-pulse, and the screen seamlessly dissolves open into the giant 'Aadesh Khande' hero stroke draw.",
    tags: ["Hero Handoff", "Complete Flow", "Session Gated"],
  },
];

// Continuous smooth parabolic sweep + downward-bowed star crossbar:
function getSmoothSweepPath(scaleX: number = 1.45): string {
  const cx = 240;
  const scale = (x: number) => Math.round(cx + (x - cx) * scaleX);

  // 1. M: Bottom hook start (148, 454)
  // 2. C1: Smooth lower bowl dip & sweep (148, 462 -> 158, 468 -> 172, 466)
  // 3. C2: Parabolic upward climb to high apex (202, 462 -> 246, 354 -> 246, 82)
  // 4. C3: Right leg descender down to foot (250, 140 -> 276, 342 -> 312, 464)
  // 5. C4: Loop across to left star arm (294, 418 -> 246, 354 -> 184, 328)
  // 6. C5: Final crossbar curving slightly DOWNWARD as it sweeps across (218, 344 -> 276, 330 -> 326, 296)
  return `M ${scale(148)} 454 C ${scale(148)} 462, ${scale(158)} 468, ${scale(172)} 466 C ${scale(202)} 462, ${scale(236)} 428, ${scale(246)} 354 C ${scale(256)} 276, ${scale(252)} 158, ${scale(246)} 82 C ${scale(250)} 140, ${scale(276)} 342, ${scale(312)} 464 C ${scale(294)} 418, ${scale(246)} 354, ${scale(184)} 328 C ${scale(218)} 344, ${scale(276)} 330, ${scale(326)} 296`;
}

export default function LoaderMockups() {
  const [activeMockup, setActiveMockup] = useState<MockupStyle>("smooth-sweep-thick");
  const [replayKey, setReplayKey] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showHeroHandoff, setShowHeroHandoff] = useState(false);
  const [showNavbarCompare, setShowNavbarCompare] = useState(true);
  const [heroTriggered, setHeroTriggered] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState<number>(6.8);
  const [widthScale, setWidthScale] = useState<number>(1.65);
  const { theme, toggleTheme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const strokePathRef = useRef<SVGPathElement>(null);
  const penNibRef = useRef<SVGCircleElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const activePathD = useMemo(() => getSmoothSweepPath(widthScale), [widthScale]);

  const triggerReplay = (type?: MockupStyle) => {
    if (type) setActiveMockup(type);
    setHeroTriggered(false);
    setReplayKey((k) => k + 1);
  };

  useEffect(() => {
    const stroke = strokePathRef.current;
    const container = containerRef.current;
    const penNib = penNibRef.current;
    if (!stroke || !container) return;

    const length = stroke.getTotalLength() || 1550;
    const speed = playbackSpeed;

    const ctx = gsap.context(() => {
      // Reset targets
      gsap.killTweensOf([stroke, container, penNib, heroRef.current]);
      gsap.set(container, { autoAlpha: 1 });
      gsap.set(heroRef.current, { autoAlpha: showHeroHandoff ? 1 : 0 });
      gsap.set(stroke, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      if (penNib) gsap.set(penNib, { autoAlpha: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          if (showHeroHandoff) {
            setHeroTriggered(true);
          }
        },
      });

      if (activeMockup === "smooth-sweep-thick") {
        // --- 1. SMOOTH SWEEP THICKENED DRAW ---
        tl.to(stroke, {
          strokeDashoffset: 0,
          duration: 1.55 / speed,
          ease: "power2.inOut",
        });

        // Subtle ink settle
        tl.to(
          stroke,
          {
            strokeWidth: strokeWidth * 1.06,
            duration: 0.18 / speed,
            ease: "power1.out",
          },
          "-=0.1"
        );
        tl.to(stroke, {
          strokeWidth: strokeWidth,
          duration: 0.22 / speed,
          ease: "power2.out",
        });

        tl.to(
          container,
          {
            autoAlpha: showHeroHandoff ? 0 : 0.05,
            duration: 0.4 / speed,
            ease: "power2.in",
          },
          "+=0.2"
        );
      } else if (activeMockup === "ink-nib-lead") {
        // --- 2. GOLDEN PEN NIB FLOW ---
        if (penNib) {
          gsap.set(penNib, { autoAlpha: 1 });
          const startPt = stroke.getPointAtLength(0);
          gsap.set(penNib, { cx: startPt.x, cy: startPt.y });
        }

        const progressObj = { val: 0 };
        tl.to(progressObj, {
          val: 1,
          duration: 1.5 / speed,
          ease: "power2.inOut",
          onUpdate: () => {
            const currentDist = progressObj.val * length;
            stroke.style.strokeDashoffset = String(length - currentDist);

            if (penNib) {
              const pt = stroke.getPointAtLength(currentDist);
              penNib.setAttribute("cx", String(pt.x));
              penNib.setAttribute("cy", String(pt.y));
            }
          },
        });

        if (penNib) {
          tl.to(penNib, {
            autoAlpha: 0,
            scale: 2,
            duration: 0.25 / speed,
            ease: "power2.out",
          });
        }

        tl.to(
          container,
          {
            autoAlpha: showHeroHandoff ? 0 : 0.05,
            duration: 0.4 / speed,
            ease: "power2.in",
          },
          "+=0.15"
        );
      } else if (activeMockup === "velocity-flow") {
        // --- 3. KINETIC VELOCITY FLOW ---
        // Segment 1: Parabolic Sweep to Apex
        tl.to(stroke, {
          strokeDashoffset: length * 0.62,
          duration: 0.75 / speed,
          ease: "power3.out",
        });

        // Segment 2: Downstroke cut
        tl.to(stroke, {
          strokeDashoffset: length * 0.28,
          duration: 0.35 / speed,
          ease: "power2.in",
        });

        // Segment 3: Star sweep across (downward bowed curve)
        tl.to(stroke, {
          strokeDashoffset: 0,
          duration: 0.45 / speed,
          ease: "power1.out",
        });

        tl.to(
          container,
          {
            autoAlpha: showHeroHandoff ? 0 : 0.05,
            duration: 0.35 / speed,
            ease: "power2.in",
          },
          "+=0.1"
        );
      } else if (activeMockup === "morph-handoff") {
        // --- 4. COMPLETE FLOW & HERO HANDOFF ---
        tl.to(stroke, {
          strokeDashoffset: 0,
          duration: 1.4 / speed,
          ease: "power2.inOut",
        });

        tl.to(container, {
          scale: 1.06,
          autoAlpha: 0,
          duration: 0.45 / speed,
          ease: "power3.in",
        });
      }
    });

    return () => ctx.revert();
  }, [activeMockup, replayKey, playbackSpeed, showHeroHandoff, strokeWidth, activePathD]);

  const activeMeta = MOCKUP_METAS.find((m) => m.id === activeMockup)!;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-black flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <h1 className="text-sm font-semibold tracking-wider uppercase text-[var(--foreground)]">
              Smooth Parabolic Sweep & Bowed Crossbar Lab
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Deep continuous left curve + downward-bowed star crossbar at 10.2px ink weight
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Stroke thickness */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1 bg-[var(--background)] text-xs">
            <span className="text-[var(--muted)] font-medium">Ink Weight:</span>
            {[
              { label: "6.8px", val: 6.8 },
              { label: "10.2px (Ideal)", val: 10.2 },
              { label: "13.0px (Heavy)", val: 13.0 },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => {
                  setStrokeWidth(item.val);
                  triggerReplay();
                }}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  strokeWidth === item.val
                    ? "bg-[var(--foreground)] text-[var(--background)] font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Width Stance Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1 bg-[var(--background)] text-xs">
            <span className="text-[var(--muted)]">Stance:</span>
            {[
              { label: "1.3x", val: 1.3 },
              { label: "1.45x (Ideal)", val: 1.45 },
              { label: "1.65x", val: 1.65 },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => {
                  setWidthScale(item.val);
                  triggerReplay();
                }}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  widthScale === item.val
                    ? "bg-[var(--foreground)] text-[var(--background)] font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Speed selector */}
          <div className="flex items-center rounded-lg border border-[var(--border)] p-0.5 bg-[var(--background)] text-xs">
            {[0.5, 1, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  setPlaybackSpeed(speed);
                  triggerReplay();
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  playbackSpeed === speed
                    ? "bg-[var(--foreground)] text-[var(--background)] font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Compare with Navbar toggle */}
          <button
            onClick={() => setShowNavbarCompare((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              showNavbarCompare
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-semibold"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)]"
            }`}
          >
            {showNavbarCompare ? "✓ Navbar Comparison Active" : "+ Show Navbar Comparison"}
          </button>

          {/* Hero handoff toggle */}
          <button
            onClick={() => {
              setShowHeroHandoff((prev) => !prev);
              triggerReplay();
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              showHeroHandoff
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-semibold"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)]"
            }`}
          >
            {showHeroHandoff ? "✓ Hero Handoff Active" : "+ Test Hero Handoff"}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--foreground)] transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>

          {/* Replay button */}
          <button
            onClick={() => triggerReplay()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-xs font-medium hover:scale-105 active:scale-95 transition-transform shadow-sm"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Replay (R)
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        {/* Left / Center: Interactive Canvas */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-8 relative min-h-[540px] border-b lg:border-b-0 lg:border-r border-[var(--border)] overflow-hidden">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, var(--foreground) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Side-by-Side Comparison Container */}
          <div className="flex flex-wrap items-center justify-center gap-12 z-20">
            {/* 1. Animated Handwriting Stroke */}
            <div className="flex flex-col items-center">
              <div
                ref={containerRef}
                className="relative p-6 flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 480 600"
                  width={200}
                  height={250}
                  className="transition-colors duration-200"
                  style={{
                    willChange: "transform, opacity",
                  }}
                >
                  {/* Smooth Parabolic Sweep + Downward Bowed Crossbar path */}
                  <path
                    ref={strokePathRef}
                    d={activePathD}
                    fill="none"
                    stroke="var(--foreground)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      willChange: "stroke-dashoffset",
                    }}
                  />

                  {/* Golden Ink Nib Tip (Variant 2) */}
                  <circle
                    ref={penNibRef}
                    r="7"
                    fill="var(--accent)"
                    style={{
                      opacity: 0,
                      filter: "drop-shadow(0 0 8px var(--accent))",
                    }}
                  />
                </svg>
              </div>
              <span className="text-xs font-mono text-[var(--accent)] font-semibold mt-2">
                Animated Handwriting ({strokeWidth}px)
              </span>
            </div>

            {/* 2. Static Navbar SVG Glyph (Side-by-Side Audit) */}
            {showNavbarCompare && (
              <div className="flex flex-col items-center border-l border-[var(--border)] pl-12">
                <div className="p-6 flex items-center justify-center opacity-85">
                  <svg
                    viewBox="0 0 480 600"
                    width={200}
                    height={250}
                    style={{
                      color: "var(--foreground)",
                    }}
                  >
                    <g
                      transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth={1.2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    >
                      <path d={SIGNATURE_PATH} vectorEffect="non-scaling-stroke" />
                    </g>
                  </svg>
                </div>
                <span className="text-xs font-mono text-[var(--muted)] mt-2">
                  Navbar Logo (Reference Silhouette)
                </span>
              </div>
            )}
          </div>

          {/* Simulated Hero Stage (if handoff active) */}
          {showHeroHandoff && (
            <div
              ref={heroRef}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-[var(--background)]/90 backdrop-blur-sm"
            >
              <StrokeText
                text="Aadesh Khande"
                strokeColor="var(--foreground)"
                fillColor="var(--foreground)"
                strokeWidth={1.4}
                drawDuration={1.4}
                fillDelay={0.15}
                fontSize={100}
                fontWeight={800}
                letterSpacing={-3}
                animate={heroTriggered}
              />
              <p className="mt-4 text-xs text-[var(--muted)] uppercase tracking-widest">
                [Hero Text Draws In Seamlessly After Loader Exit]
              </p>
            </div>
          )}

          {/* Canvas status overlay */}
          <div className="absolute bottom-4 left-6 text-xs text-[var(--muted)] flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-[var(--border)]">
              {activeMeta.duration}
            </span>
            <span>{activeMeta.title}</span>
            <span className="text-[var(--accent)] font-mono text-[10px]">
              [{strokeWidth}px ink • {widthScale}x stance]
            </span>
          </div>
        </div>

        {/* Right Sidebar: Option Selection & Audit */}
        <div className="lg:col-span-4 p-6 bg-[var(--background)] flex flex-col justify-between gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
              Motion Profiles
            </h2>

            <div className="flex flex-col gap-3">
              {MOCKUP_METAS.map((mockup) => {
                const isSelected = activeMockup === mockup.id;
                return (
                  <button
                    key={mockup.id}
                    onClick={() => triggerReplay(mockup.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]"
                        : "border-[var(--border)] hover:border-[var(--foreground)]/40 hover:bg-[var(--foreground)]/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">
                        {mockup.title}
                      </h3>
                      <span className="text-[11px] font-mono text-[var(--accent)] font-medium">
                        {mockup.duration}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">
                      {mockup.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {mockup.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audit summary */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/5 text-xs text-[var(--muted)] leading-relaxed">
            <p className="font-semibold text-[var(--foreground)] mb-1">🔍 Curved Star Crossbar</p>
            <p className="text-[11px] text-[var(--muted)] leading-normal">
              The final left-to-right stroke now has a natural downward-curving bow as it crosses the central vertical stem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
