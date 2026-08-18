# AGENTS.md

## Portfolio design spec (read before building)
- `.ai/Portfolio.md` (~3,800 lines) is the authoritative design spec for the portfolio. Read it before building or changing any section.
- Locked rules: full-viewport scene-based sections; one scroll gesture = one step; only the active scene may run expensive animation; CSS 3D over WebGL/Three.js; every component designed for light AND dark via shared tokens; target "Impressive 8/10, Performance 9/10".
- Narrative: 01 Home (giant "AADESH KHANDE", no entrance animation) → 02 Identity (React Bits Lanyard ID card + photo reveal) → 03 Work (3D card stack, 5 projects, hover-raise, click = 3D→2D morph) → 04 Journey (scroll-driven, TBD) → 05 Education (accordion gallery, 3 panels, archival photos) → 06 Skills → contact.
- User: Aadesh Khande. Known real project: "Theralign". Component sources: reactbits.dev, 21st.dev, beui.dev. Desktop-first; mobile gets simplified variants.

## Hero design decisions (user-stated, not yet locked)
- Navbar = React Bits **Card Nav** component (https://reactbits.dev/components/card-nav). **It is a GSAP-powered hamburger card menu** (collapsed 60px bar with logo + hamburger + CTA; expands to 3 colored link-cards with staggered GSAP timeline), NOT a static pill. Port at `src/components/card-nav.tsx`; deps gsap + react-icons. Registry source: `github.com/DavidHDev/react-bits`, file `public/r/CardNav-TS-TW.json`.
- Theme identity (user-pinned): **beige light** (`--background: #f2ecdf`) / **pure black dark** (`--background: #000000`). **Design language: brown + beige** — warm, earthy palette across both themes. Dark mode foreground is warm cream (`#f0e6d3`), not pure white. Nav card text, menu icons, and CTA all use warm cream in dark mode. Selection text is black on gold in dark mode. The palette evokes craft, warmth, stability — like a dimly lit gallery with gold accents. Nav top bar is intentionally blank — hamburger lines left, theme toggle right, no logo, no CTA. Theme toggle animation duration: 1125ms (50% slower than default for smooth feel).
- Font: **Bricolage Grotesque** (React Bits' own face, confirmed from reactbits.dev source; variable package `@fontsource-variable/bricolage-grotesque/opsz.css`, family `"Bricolage Grotesque Variable"`). Earlier Geist assumption was wrong; the `overused-font: geist` detector ignore is now inert.
- Load choreography (Part 3 of `.ai/01-HOME-HERO.md`): hero text owns 0–2s (user authors its entrance separately — never animate it yourself); navbar + scroll prompt fade in from t=2s (nav 2000ms, prompt 2300ms, both ~700ms `expo.out`, settled by 3s). Implemented with `gsap.fromTo`/`autoAlpha` in `App.tsx` (nav wrapper + prompt refs). The prompt wrapper must keep `z-index` above `<main>` when it carries `will-change: opacity/transform` (the will-change creates a stacking context that otherwise traps the nav's z-99 under later siblings — real bug we hit).
- Scroll prompt = user-supplied **framer-motion cascade chevrons** (`src/components/scroll-indicator.tsx`, `framer-motion` only — no new dep): 3 chevrons, opacity [0,1,0] + y [−4,0,4], 1.6s loop, stagger 0.25s, layers 100/60/30, themed via `currentColor` + `text-muted` (no gold). `decorative` prop = aria-hidden non-button until scene-scroll lands. Spec 5.4 hide-on-scroll (wheel/touch/key, 300ms GSAP fade, never returns) is implemented in App. Reduced motion → static chevrons via `useReducedMotion`.
- **Name morph** (hero → nav logo, user idea, spec 4.10): on downward scroll the giant `AADESH KHANDE` shrinks and docks into the **center** of the nav top bar via GSAP transform-only scale + x/y from live rects (600ms `expo.inOut`); scroll up undocks. Docked dimensions: height = 70% of navbar height (`scaleY`), width = 30% of original (`scaleX = 0.3`) — compressed, refined look. The h1 carries `relative z-[100]` so it paints above the nav wrapper's `z-[99]` stacking context while docked (same trap as the wrapper fix — the nav card background would otherwise cover it). **Hero font**: the h1 uses `var(--font-hero)` (defined in `:root` and `.dark` in index.css), separate from the site font. Change `--font-hero` in CSS to swap the name font without affecting the rest of the site. Wheel/touch/key listeners live in App; the cue-hide and dock share the same gestures.
- Preview environment quirk (`.freebuff/preview.sh` + `dist-preview` singlefile): the preview webview is **unfocused → rAF throttled to near-death** — GSAP/framer tweens created after the first ~3s usually never render, `document.hasFocus()` is false, and screenshots produce no frames. The load reveal (immediateRender + a few early frames) still renders; verify animation logic via dataset markers + live rect math + fresh-load probes instead of screenshots, and tell the user to check motion in a real browser (`npm run dev`).

## MCP / tooling config (non-obvious)
- MCP servers live in `.agents/mcp.json` (project) or `~/.agents/mcp.json` (global). Standard Claude/Cursor format: stdio (`command`/`args`/`env`) or http (`url`/`headers`). `$VAR` values are resolved from the app's environment. Project overrides global. Config is loaded at session start — edits require a Freebuff restart.
- `.agents/mcp.json` holds the 21st.dev API key (free key from 21st.dev/mcp; old "Magic" keys were reset and no longer work). `.agents/` is gitignored — never commit it.
- `components.json` at root registers the React Bits shadcn registry (`@react-bits` → https://reactbits.dev/r/{name}.json) → enables `npx shadcn add @react-bits/<name>`. No key required.
- App internals if needed: Freebuff is an Electron app at /Applications/Freebuff.app (inspect app.asar via `strings` for behavior); global state in ~/.config/freebuff-desktop/state.json; per-project data under ~/.config/freebuff-desktop/projects/; `preloadedSkills` in .freebuff/settings.json; skills live in `.superpowers/`.

## Stack conventions
- Default: Vite + React + TS + Tailwind v4 + shadcn + Motion (framer-motion) + Lenis. Note: the scene-scroll model conflicts with Lenis — pick one scroll architecture early.
- Previous (deleted) iterations: `index.html` liquid-pipe SVG journey timeline; `journey/` React port; `parallax/` R3F + drei + lenis. **All dead — user rule: do NOT reuse or reference past components/concepts.** Each section gets its own bespoke "wow" signature; the liquid-pipe is abandoned.
- Impeccable design skill installed at `.agents/skills/impeccable/` (v4.1.1): 23 `/impeccable` commands; run `/impeccable init` on a new surface to write PRODUCT.md + DESIGN.md context. It writes ephemeral working files under `.impeccable/`.
- GSAP official skills installed at `.agents/skills/gsap-*` (core, timeline, scrolltrigger, plugins, performance, utils, frameworks, react). GSAP (incl. all plugins — ScrollTrigger, SplitText, MorphSVG) is now 100% free since the Webflow acquisition; usable without Club membership. Skills recommend GSAP when no animation lib is pinned; the portfolio currently uses framer-motion.

## Progressive Enhancement & Performance Architecture (LOCKED)

### Device Tier Detection
- **System:** `src/lib/device-tiers.ts` — detects GPU, memory, cores to classify devices as `low | medium | high`
- **Scoring:** GPU type + memory (4GB+ = tier up) + cores (4+ = tier up) + high-end GPU bonus
- **Output:** `DeviceTier` type + `getAnimationConfig(tier)` returns per-tier settings
- **Usage:** Wrap app in `<PerformanceProvider>`, consume via `usePerformance()` hook

### Performance Tiers (Animation Budgets)
| Tier | FPS Target | WebGL | Particles | Parallax | Concurrent Animations |
|------|------------|-------|-----------|----------|----------------------|
| Low | 30fps | ❌ | ❌ | ❌ | 2 |
| Medium | 45fps | ❌ | ✅ | ✅ | 4 |
| High | 60fps | ✅ | ✅ | ✅ | 8 |

### Scene-Based Architecture (MANDATORY)
- **One active scene rule:** Only the scene in viewport runs animations. Off-screen scenes MUST be paused/killed.
- **Implementation:** Use `SceneWrapper` component with ScrollTrigger `onEnter`/`onLeave` callbacks
- **Pause pattern:**
  ```typescript
  ScrollTrigger.create({
    trigger: scene,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => resumeScene(sceneId),
    onLeave: () => pauseScene(sceneId),
    onEnterBack: () => resumeScene(sceneId),
    onLeaveBack: () => pauseScene(sceneId),
  });
  ```
- **Resource saving:** Paused scenes kill GSAP timelines, stop rAF loops, unload WebGL textures
- **Memory management:** Each scene owns its animations; `gsap.context()` + `ctx.revert()` on unmount

### Lazy Loading Strategy
- **Code splitting:** Each scene is a `React.lazy()` import via `LazyScene` component
- **Priority levels:**
  - `high`: Load immediately (hero, first visible scene)
  - `medium`: Load on browser idle (`requestIdleCallback`)
  - `low`: Load after 2s delay or on first scroll
- **WebGL lazy load:** Three.js/R3F only imported when scene enters viewport AND device tier >= medium

### WebGL Fallback System
- **Check:** `WebGLFallback` component detects GPU support + tier before rendering
- **Low-end:** CSS-only animations, no canvas, static gradients
- **Medium:** Selective WebGL (hero background only), limited particle count
- **High:** Full WebGL, R3F, post-processing, high particle counts

### Animation Hooks
- **`useAdaptiveAnimation(fn, options)`** — wraps GSAP timeline with tier-aware quality
- **Quality parameter:** Animation functions receive `quality: 'low' | 'high'` to adjust complexity
- **ScrollTrigger integration:** Built-in scrub, pin, markers support

### Performance Monitoring
- **Real-time FPS tracking** via `PerformanceMonitor` singleton
- **Auto-downgrade:** If FPS < 30 for 2+ seconds, dispatch `performance:drop` event
- **Response:** App listens and reduces particle count, disables parallax, simplifies animations

### File Structure for New Scenes
```
src/
├── scenes/
│   ├── Identity/
│   │   ├── index.tsx          # Main scene component
│   │   ├── animations.ts     # Scene-specific GSAP timelines
│   │   ├── fallback.tsx       # Low-end CSS fallback
│   │   └── webgl.tsx          # High-end WebGL version (optional)
│   ├── Work/
│   └── ...
├── components/
│   ├── SceneWrapper.tsx       # ScrollTrigger + lazy load wrapper
│   ├── LazyScene.tsx          # Dynamic import + Suspense
│   ├── WebGLFallback.tsx      # WebGL detection + fallback
│   └── PerformanceMonitor.tsx # FPS tracking
├── context/
│   └── performance-context.tsx
├── hooks/
│   └── useAdaptiveAnimation.ts
└── lib/
    └── device-tiers.ts
```

### Three-Zone Lifecycle System (ENHANCED)
Every section exists in one of three states at any moment:

| State | Distance | Animation | WebGL | Memory |
|-------|----------|-----------|-------|--------|
| **ACTIVE** | Current section | Fully running | Render loop ON | Highest |
| **ADJACENT** | ±1 section | Prewarmed, paused | Context alive | Medium |
| **DORMANT** | ±2+ sections | Fully paused | Context suspended | Low |

**Dynamic Adjacency Window (Scroll-Speed Adaptive):**
- Fast scroll (flinging): Collapse to ACTIVE only — GPU serves what's on screen
- Slow scroll / idle: Expand to ±1 (ADJACENT) — next section pre-warmed
- Stopped 300ms+: Optionally expand to ±2 for prefetching
- Measure: compare FPS during fast scrolling. Target: no drops below 50fps on mid-tier

### Pause Behavior Per Animation Type
| Animation Type | Adjacent (Paused) | Dormant |
|----------------|-------------------|----------|
| Framer Motion variants | Held at "ready" state | Reset to initial |
| GSAP timelines | `timeline.pause()` | `timeline.kill()` |
| CSS `@keyframes` | `animation-play-state: paused` | `display: none` on wrapper |
| Canvas RAF | Store ID, `cancelAnimationFrame` | Cancel + nullify context |
| Scroll-driven listeners | Stay alive (cheap) | Listener detached |
| Three.js render loop | `renderer.setAnimationLoop(null)` | `renderer.dispose()` + null |

### Cold Start Buffer (WebGL)
When navigating to a dormant section with WebGL:
1. Add 200ms initialization buffer before triggering entrance animation
2. Section wrapper shows `0ms opacity` flash-in ONLY after canvas signals readiness
3. Prevents jarring "UI animating while canvas is black" effect

### Component Contracts
**Section Components:**
```typescript
interface SectionProps {
  index: number;      // Position in section array
  lifecycle: 'active' | 'adjacent' | 'dormant';
  perfTier: PerfTier;
}
```
- Manages NO scroll state
- Contains NO hardcoded colors
- Imports from NO other section
- Every `useEffect` has cleanup

**Canvas Components:**
```typescript
interface CanvasProps {
  paused: boolean;      // True when adjacent
  perfTier: PerfTier;
  forceFallback?: boolean; // Force CSS fallback
}
```
- Disposes ALL Three.js resources on cleanup
- Never shares renderer across instances
- Has non-WebGL fallback (CSS float animation)

### Accessibility (MANDATORY)
- `prefers-reduced-motion`: All animations → `duration: 0.001ms` (not 0 — avoids layout thrashing)
- Three.js: Stop animation, show static card
- Scroll transforms: Removed, use fade-only transitions
- Theme toggle: Instant swap, no circular reveal
- Keyboard: All sections navigable via Arrow/Space/PageUp/PageDown
- Canvas elements: `aria-label` required (e.g., "Interactive profile card")
- Semantic HTML: `<section>` with `aria-labelledby`, skip-to-content link
- Contrast: WCAG AA (4.5:1 body, 3:1 large text) in BOTH themes

### Build Quality Gates (Per Section)
- [ ] Both themes render correctly (equally intentional, not "inverted")
- [ ] Active state animates correctly
- [ ] Adjacent state holds without animating
- [ ] Dormant state disposes resources
- [ ] `prefers-reduced-motion` — no animations, full functionality
- [ ] Low perf tier — no WebGL errors, no dropped frames (throttled CPU)
- [ ] Keyboard navigable — no mouse required
- [ ] `aria-label` on all non-text interactive elements
- [ ] Zero hardcoded color values
- [ ] All `useEffect` hooks have cleanup

### Innovative Ideas (LOCKED)

**15.1 Section Exit Anticipation**
When scroll wheel held >300ms (deliberate scroll), current section begins micro-exit:
- Content shifts up 8px, opacity → 0.9
- Signals "I know you want to leave"
- Makes scroll feel connected, not binary
- Expose `scrollIntent: 'idle' | 'leaving-up' | 'leaving-down'` from scroll controller

**15.2 Narrative Scroll Mode (Journey Section)**
Journey is the ONLY section with internal sub-scrolling:
- Uses scroll controller's dwell time, not browser scroll
- Each gesture advances internal timeline (not section)
- After all entries play, next gesture exits to Education
- Keeps "one viewport = one section" rule while allowing depth

**15.3 Font Loading Orchestration**
- Do NOT show content until display font loads (Home impact depends on typography)
- Use `document.fonts.ready` promise
- Show minimal loading state (background color only) until resolved
- Typically <200ms on fast connections

**15.4 Theme-Aware WebGL Uniforms**
Three.js can't read CSS variables:
- `useTheme()` exposes parsed colors as JS objects
- Canvas components receive as props → pass as uniforms/material.color
- Theme toggle updates Lanyard color WITHOUT re-mounting scene

**15.5 Gyroscope Parallax (Mobile)**
On Identity section only:
- Use `DeviceOrientationEvent` for subtle card tilt (±6px max)
- Request permission on iOS 13+ ONLY when entering Identity section
- Disabled if `prefers-reduced-motion` active
- Fallback: no effect, section still complete

### DO NOT
- ❌ Run animations on off-screen scenes — pause them immediately
- ❌ Import Three.js/R3F at top level — always lazy load
- ❌ Assume all users have WebGL — always provide CSS fallback
- ❌ Skip `prefers-reduced-motion` check — respect user preference
- ❌ Create more than 8 concurrent GSAP tweens on low-end devices
- ❌ Use `will-change` on every element — only on actively animating elements
- ❌ Force layout thrashing — batch reads before writes
- ❌ Forget `gsap.context()` cleanup — always revert on unmount
- ❌ Show content before display font loads (Home section)
- ❌ Use `duration: 0` for reduced motion — use `0.001ms`
- ❌ Cache WebGL contexts across unmounts — dispose fully, re-init on re-mount
