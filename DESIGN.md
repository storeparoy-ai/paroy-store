# PAROY STORE — DESIGN SYSTEM & UI/UX SPECIFICATION

> **Style Standard:** Dark Minimalist Cyber Bento Luxury (Linear.app / Vercel / Raycast Pro Aesthetic)  
> **Philosophy:** Pure Solid Surfaces, Tonal Depth, Generous Negative Space, Crisp Typography, Zero Cheap Glassmorphism.

---

## 1. Core Principles (Non-Negotiable)

1. **NO Cheap Glassmorphism**:
   - Do NOT use semi-transparent white borders (`border-white/20`, `border-white/30`) that trap and pinch inner text.
   - Do NOT use blurry transparent cards (`backdrop-blur-md` inside cards or containers).
   - ALL cards, panels, and modals must be **100% Solid Matte** surfaces.

2. **Tonal Elevation Hierarchy (Matte Solid Surfaces)**:
   - **Layer 0 (Canvas / Body Background)**: `#06080D` (Pure deep obsidian base)
   - **Layer 1 (Card / Bento Section Surface)**: `#0D121F` (Dark navy slate solid)
   - **Layer 2 (Raised Element / Input Box / Table Header)**: `#141A29` (Deep slate solid)
   - **Layer 3 (Active / Hover / Selected Item)**: `#1B2438` (Elevated solid)

3. **Border Philosophy (Minimal & Refined)**:
   - Default card borders: `border border-white/8` (subtle 1px boundary, never glowing white).
   - Hover card borders: `hover:border-brand-cyan/40` or `hover:border-white/20`.
   - Focus state on inputs: `border-brand-cyan` with `ring-2 ring-brand-cyan/15`.

4. **Spacious Geometry & Radius Hierarchy**:
   - **Large Sections / Modals / Feature Bento Cards**: `rounded-3xl` (24px) with `p-7 sm:p-9` padding.
   - **Medium Cards / Post Containers / Form Groups**: `rounded-2xl` (16px) with `p-6 sm:p-7` padding.
   - **Input Boxes / Buttons / Dropdowns**: `rounded-xl` (12px) with `px-5 py-3.5` generous padding.
   - *Never allow text or icons to touch or pinch against corner radii.*

5. **Typography & Font Roles**:
   - **Display / Headings (`font-heading`)**: `Outfit` (Weight 700 - 900, negative tracking `-0.02em`).
   - **Body / Interface (`font-sans`)**: `Plus Jakarta Sans` (Weight 400 - 600, clear line-height `1.6`).
   - **Monospace Numbers / Prices / Invoices (`font-mono`)**: `JetBrains Mono` (Tabular figures, crisp).

6. **Neon Accent Distribution (Strategic & Intentional)**:
   - Cyan (`#00F0FF`): Primary brand highlight, active tabs, primary buttons.
   - Emerald (`#00C896`): Instant speed, verified status, escrow security.
   - Orange / Fire (`#FF6A00`): Flash sales, discounts, hot deals.
   - Purple (`#A855F7`): Community, gaming categories, VIP rankings.
   - Accent colors are highlights on solid backgrounds, NEVER whole translucent walls.

---

## 2. Component Blueprint Guidelines

### A. Form Inputs & Dropdowns
```tsx
// Standard Input
<input 
  className="w-full bg-[#141A29] border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder-text-dim focus:bg-[#182236] focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 outline-none transition-all" 
/>
```

### B. Bento Cards & Feed Posts
```tsx
// Standard Bento Card
<div className="p-6 sm:p-8 rounded-2xl bg-[#0D121F] border border-white/8 hover:border-white/15 transition-all shadow-sm space-y-4">
  {/* Content */}
</div>
```

### C. Modals & Dialogs
- Fixed Header (`bg-[#0E1422] border-b border-white/10 px-8 py-5`)
- Scrollable Body (`p-8 space-y-6 overflow-y-auto`)
- Fixed Footer Action Bar (`bg-[#0E1422] border-t border-white/10 px-8 py-4.5 flex justify-end gap-3`)
