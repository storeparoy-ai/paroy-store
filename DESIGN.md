# PAROY STORE — DESIGN SYSTEM & UI/UX SPECIFICATION

> **Style Standard:** Disciplined Dark Cyberpunk (Steam-Inspired)  
> **Philosophy:** Pure Solid Surfaces, Tonal Depth, Generous Negative Space, Crisp Typography, Zero Cheap Glassmorphism.

---

## 1. Core Principles (Non-Negotiable)

1. **NO Cheap Glassmorphism**:
   - Do NOT use semi-transparent white borders (`border-white/20`, `border-white/30`) that trap and pinch inner text.
   - Do NOT use blurry transparent cards (`backdrop-blur-md` inside cards or containers).
   - ALL cards, panels, and modals must be **100% Solid Matte** surfaces.

2. **Tonal Elevation Hierarchy (Matte Solid Surfaces)**:
   - **Layer 0 (Base Background)**: `#0A0F1A` (Dark navy base)
   - **Layer 1 (Card / Bento Section Surface)**: `#111520` (Dark slate card solid)
   - **Layer 2 (Raised Element / Input Box / Table Header)**: `#141A29` (Deep slate solid)
   - **Layer 3 (Deep Background)**: `#06080D`

3. **Strict Color Distribution**:
   - **Accent Cyan (`#22D3EE`)**: The ONLY color for primary CTAs and interactive highlights.
   - **Urgency Orange (`#F97316`)**: Reserved exclusively for Flash Sale countdowns and discount urgency.
   - **Trust Emerald (`#34D399`)**: Reserved exclusively for trust signals (100% anti-hackback, verified ratings, escrow security).

4. **Typography Hierarchy**:
   - 1 Font family: `Plus Jakarta Sans`
   - Max 3 heading scales: H1 (Hero/Title), H2 (Section), H3 (Card/Group)
   - Monospace: `JetBrains Mono` for currency, timers, and invoice IDs.

5. **Universal Layout Container**:
   - Centered column capped at `max-w-360` (1440px) via `mx-auto`, not full-bleed —
     on wide/ultra-wide monitors the excess space becomes a natural side margin
     instead of stretching content edge-to-edge. This matches the "Steam-inspired"
     reference more closely than an unbounded layout (Steam's own content column
     is width-capped and centered, not full-bleed).
   - Responsive horizontal gutter padding:
     - Mobile: `px-4`
     - Tablet: `sm:px-6 md:px-8`
     - Desktop: `lg:px-10 xl:px-12`
   - Revision note: an earlier version of this spec used `w-full` with no
     max-width and custom `1920px`/`2560px` breakpoints for extra padding.
     That approach was dropped — those breakpoints rarely fire in practice
     (OS display scaling reports a narrower CSS viewport than the physical
     screen on most high-DPI monitors), so real-world padding stayed thin
     and content read as cramped against the browser edge.
