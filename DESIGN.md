# PAROY STORE — DESIGN SYSTEM & UI/UX SPECIFICATION

> **Style Standard:** Paroy Nexus — Neon Holographic Sci-Fi
> **Philosophy:** Multi-neon accent palette, solid matte surfaces with a holographic
> gradient edge (never blur/glass), synthwave grid horizon, technical/geometric type.

**History:** superseded the original "Disciplined Dark Cyberpunk" system (single cyan
accent, navy base, soft-rounded cards, Plus Jakarta Sans/Outfit) on 2026-08-28. The user
felt that direction still read as generic "AI dark mode" and asked for something more
futuristic and colorful; two full mockups were explored as published Artifacts —
"Paroy Arena" (esports HUD: angular cut corners, single gold accent) and "Paroy Nexus"
(neon holographic) — and the user picked Nexus. Rebuilt via a token-first pass: the
`@theme` color/font/radius variables in `app/globals.css` were repainted while keeping
the same variable *names* (`brand-cyan`, `urgency-orange`, `trust-emerald`, ...), so
nearly every component repainted automatically without a per-file rewrite. Only the
handful of components that hardcoded literal Tailwind colors (`red-500`, `orange-400`,
`slate-300`, raw `rgba(34,211,238,...)`, ...) needed direct edits — see git history for
the full list.

---

## 1. Core Principles (Non-Negotiable)

1. **NO Cheap Glassmorphism, still**:
   - Do NOT use `backdrop-blur` inside cards, or translucent-white fills as a surface.
   - ALL cards, panels, and modals are **100% Solid Matte** — the one exception is the
     holographic *edge* (see §6), which is a gradient **border**, not a translucent fill.

2. **Tonal Elevation Hierarchy (Matte Solid Surfaces)**:
   - **Layer 0 (Base Background)**: `#0A0714` (near-black, violet-tinted)
   - **Layer 1 (Card Surface)**: `#140F24`
   - **Layer 2 (Raised Element / Input Box / Alt Surface)**: `#1C1533`
   - **Layer 3 (Deep Background)**: `#06040D`
   - Structural lines/borders are violet-grey, not pure white: `border-subtle` =
     `rgba(157, 78, 255, 0.16)`.

3. **Multi-Neon Color System** (the actual departure from the old single-accent rule):
   - **Magenta (`#FF2E9A`, token `brand-magenta`)**: primary CTA, brand wordmark,
     headline gradient accent. The one color allowed to feel "loud."
   - **Cyan (`#00E5FF`, token `brand-cyan`)**: secondary accent — prices, links, active
     states, info. This carries over the most usage from the old single-cyan system.
   - **Violet (`#9D4EFF`, token `brand-violet`)**: tertiary accent — tags, category
     labels, gradient midpoints.
   - **Amber (`#FFB020`, token `urgency-orange`)**: flash sale / pending / urgency —
     same role as before, warmer hue.
   - **Danger red (`#FF3B5C`, token `urgency-red`)**: errors, delete, rejected/cancelled
     status. Never Tailwind's stock `red-*` — always this token.
   - **Lime (`#C6FF3D`, token `trust-emerald`)**: trust/verified/completed/success.
   - Semantic color (success/warning/danger above) is kept conceptually separate from
     the three decorative brand accents (magenta/cyan/violet) even though both draw
     from the same palette family — a status pill's color always means the same thing;
     a decorative gradient never doubles as a status indicator.
   - Never use Tailwind's stock `red-*`/`orange-*`/`slate-*`/`emerald-*` etc. directly —
     always the named tokens above, so a future repaint stays a one-file token edit.

4. **Typography Hierarchy**:
   - Display/headings: `Orbitron` (geometric, sci-fi) — bold, usually uppercase.
   - Body: `Rajdhani` — condensed technical grotesque, good gaming-UI pedigree.
   - Monospace: `JetBrains Mono` for currency, timers, invoice IDs — kept from the old
     system deliberately (the Nexus mockup used Share Tech Mono; JetBrains Mono reads
     just as "digital" while staying far more legible for real money figures).

5. **Universal Layout Container** (unchanged from the old system):
   - Centered column capped at `max-w-360` (1440px) via `mx-auto`, not full-bleed.
   - Responsive horizontal gutter: `px-5` mobile, `sm:px-8 md:px-10` tablet,
     `lg:px-14 xl:px-16` desktop.

6. **Signature Nexus Moves** (see `app/globals.css`):
   - **`.holo-ring`**: a holographic gradient border (magenta → cyan → violet) drawn as
     a `::before` pseudo-element with a mask, so it needs no extra wrapper `<div>` — add
     the class to any element that already has a `border-radius`. Used on `Card
     variant="raised"` (purchase/summary boxes, hero product card, admin dashboard
     panels) — never as the default for every surface, only the highest-priority ones.
   - **`.hex-clip`**: an elongated-hexagon `clip-path` for tier/status ribbon badges
     (MYTHIC, VERIFIED, Bisa Sewa, ...) — the shaped-badge equivalent of the old ribbon.
   - **`.grid-floor`**: a synthwave perspective floor grid (`repeating-linear-gradient`
     + `rotateX`), masked to fade toward the horizon. Used once per hero-type section,
     never more than that.
   - **Radius scale is shrunk globally** via `@theme`'s `--radius-lg/xl/2xl/3xl`
     overrides in `globals.css` — every existing `rounded-xl`/`rounded-2xl` usage got
     tighter automatically (Nexus panels read more technical/less "soft SaaS" than the
     old system without touching each component).
   - CTAs (`Button` primary) use a magenta gradient with a soft glow shadow instead of
     the old cyan gradient; `urgency` stays amber, `danger` uses the `urgency-red` token.
   - Headline accent words get a magenta→cyan gradient `bg-clip-text` treatment with a
     faint magenta `drop-shadow` glow (see `HeroBanner`, `Header` wordmark).
   - Ambient `glow-blob`s behind hero/section-transition surfaces now pair magenta +
     cyan (was cyan + orange) for the multi-neon feel — still sparing, still blurred,
     never as a card background.

7. **Rollout status**: full site — every page and the admin dashboard — repainted via
   the token change (2026-08-28). Structural Nexus signatures (`.holo-ring`, `.hex-clip`,
   `.grid-floor`) are applied at the highest-impact spots (hero, purchase/summary
   panels, tier badges, admin Sales Dashboard) rather than everywhere; data-dense admin
   tables and lists stay flat by design, same reasoning as the old system's §6.
