# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript + Tailwind v4 + shadcn/ui + Motion (framer-motion). No backend: MERN's server/database has nothing to serve for a static portfolio; if the user later wants a CMS or contact API, a minimal backend can be added then. (Stack decision pending user confirmation — see interview.)

## Users

Primary: recruiters, hiring managers, and developers evaluating Aadesh Khande as an engineer. Secondary: anyone exploring the portfolio for inspiration or curiosity. Context: desktop-first, one deliberate visit; the site must prove capability fast and be memorable.

## Product Purpose

A high-quality, 3D-animated personal portfolio that moves from mystery ("Who is this?") through identity ("This is Aadesh.") to proof ("What does he build?"). Success = the visitor remembers the site and wants to work with Aadesh.

## Positioning

Distinct from a conventional grid portfolio: every section is a full-viewport scene with one signature interaction (Lanyard ID card, 3D card stack, liquid-pipe journey), built to feel physical and deliberate — "impressive 8/10, performance 9/10."

## Operating Context

- Scene-based scroll system: one scroll gesture = one section transition, with transition locks to survive trackpad momentum.
- Only the active scene runs expensive animation; everything else pauses.
- Light and dark are two equally intentional identities, driven by shared CSS tokens.
- Desktop-first; mobile gets simplified variants of each interaction.

## Capabilities and Constraints

- Sections (narrative order): Home → Identity → Work → Journey → Education → Skills → Contact.
- Identity: React Bits Lanyard ID card with photo reveal + replay.
- Work: 3D card stack (CSS 3D, no WebGL), 5 projects, click = 3D→2D morph.
- Education: accordion gallery with real (archival) photographs.
- Component sources: reactbits.dev, 21st.dev, beui.dev; React Bits registry configured in components.json.
- Constraint: CSS 3D over WebGL everywhere except the Lanyard (which is WebGL-based — reconcile with the "no WebGL" rule).

## Brand Commitments

- Name: Aadesh Khande.
- Hero: giant "AADESH KHANDE" typography, no entrance animation; background black.
- Navigation: React Bits Card Nav component.
- Font: Geist (from the Card Nav screenshot the user shared). [Assumption — confirm: the font family shown in the screenshot is believed to be Geist.]
- Theme toggle in the navbar; both themes fully designed (never a naive invert).
- Design spec source of truth: `.ai/Portfolio.md` and `.ai/01-HOME-HERO.md`.

## Evidence on Hand

- Real project name: "Theralign" (one of the five Work projects).
- Real photograph set exists for education stages (to be supplied).
- Everything else (project screenshots, exact copy, contact details) pending the content interview.

## Product Principles

1. Reveal information progressively; never dump everything at once.
2. One major interaction per section, one supporting animation — restraint beats spectacle.
3. Physical metaphor: objects have depth, weight, and deliberate motion.
4. **Every section has its own bespoke "wow" signature — never reuse a component or concept between sections, and never resurrect anything from the deleted past projects (liquid-pipe etc.). Innovate each surface independently.**
5. The brief's pinned choices win over category defaults.
6. Accessibility and reduced-motion support are non-negotiable.

## Accessibility & Inclusion

- Keyboard parity for all interactions; visible focus states; semantic headings (exactly one h1).
- `prefers-reduced-motion: reduce` honored with simplified transitions.
- Contrast ≥ 4.5:1 for body text in both themes. (Specifics in DESIGN.md once locked.)
