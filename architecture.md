# Technical Architecture — Paroy Store 2.0

> **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase Backend, Vercel Hosting  
> **Layout Constraint:** Full Width Responsive Container with Adaptive Padding

---

## 1. Arsitektur Komponen & Frontend

```
paroy-store/
├── app/
│   ├── globals.css            # Design tokens (@theme), micro-utilities, scrollbar
│   ├── layout.tsx             # Root layout (Plus Jakarta Sans, Outfit, JetBrains Mono)
│   └── page.tsx               # Homepage (Tahap 2) / Studio (Tahap 1)
│
├── components/
│   ├── ui/                    # Core Atomic UI Kit Primitives
│   │   ├── Container.tsx      # Centered max-width (1440px) universal layout container with responsive padding
│   │   ├── Button.tsx         # CVA-based Button (Primary Cyan, Outline, Urgency Orange, etc.)
│   │   ├── Input.tsx          # Dark slate input with left icon, clear action, error state
│   │   ├── Card.tsx           # Layered Card primitive (Header, Title, Desc, Content, Footer)
│   │   ├── Badge.tsx          # Cyan, Trust Emerald, Urgency Orange, & Neutral status pills
│   │   └── Dialog.tsx         # Accessible Radix UI Dialog / Modal
│   ├── layout/                # Header, Footer, BottomNav, FloatingActionHub
│   ├── home/                  # Homepage feature sections
│   ├── products/              # Product cards & detail components
│   └── admin/                 # Admin dashboard panels & management tables
│
├── lib/
│   ├── utils.ts               # cn(), formatCurrency(), timeAgo(), formatNumber()
│   ├── mock-data.ts           # Fallback mock datasets (Games, Products, Flash Sales, Payments)
│   └── supabase-helpers.ts    # Data mapper between Supabase DB & TypeScript frontend types
│
├── types/
│   └── index.ts               # Product, Game, FlashSale, RekberTransaction, UserProfile types
│
├── utils/
│   └── supabase/              # Supabase SSR client, server, & middleware utilities
│
└── supabase/
    └── migrations/            # SQL schemas for products, orders, profiles, and escrow
```

---

## 2. Design System Tokens (Steam-Inspired Dark Cyberpunk)

### A. Palet Warna Ketat
* **`brand-cyan` (`#22D3EE`):** Satu-satunya warna untuk Call-To-Action (CTA) & elemen interaktif utama.
* **`urgency-orange` (`#F97316`) & `urgency-red` (`#F87171`):** Khusus Flash Sale & countdown diskon.
* **`trust-emerald` (`#34D399`):** Khusus sinyal kepercayaan (rekber aman, 100% anti-hackback, rating 4.9).
* **Dark Navy Slate Layering:**
  * Base Background: `#0A0F1A`
  * Card Surface: `#111520`
  * Card-Alt Surface: `#141A29`
  * Deep Background: `#06080D`
* **Subtle Borders:** `rgba(255, 255, 255, 0.06)` (Normal) & `rgba(34, 211, 238, 0.35)` (Hover Cyan).

### B. Layout & Grid Universal
* **Komponen:** `<Container>` ([components/ui/Container.tsx](file:///c:/Users/User/.gemini/antigravity/scratch/paroy-store/components/ui/Container.tsx))
* **Lebar:** `max-w-360` (1440px) `mx-auto` — kolom konten di-center, bukan full-bleed.
  Di monitor lebar/ultra-wide, sisa ruang jadi margin kiri-kanan alami, bukan
  konten yang melebar mengikuti layar.
* **Padding Proporsional (gutter):**
  * Mobile: `px-4`
  * Tablet: `sm:px-6 md:px-8`
  * Desktop: `lg:px-10 xl:px-12`
* **Catatan revisi:** versi awal pakai `w-full` tanpa `max-width` plus breakpoint
  custom `1920px`/`2560px` untuk padding ekstra. Didrop karena breakpoint itu
  jarang aktif di dunia nyata (display scaling OS membuat CSS viewport yang
  dilaporkan browser lebih sempit dari resolusi fisik monitor), sehingga padding
  efektif tetap tipis dan konten terasa mepet ke tepi browser.

---

## 3. Integrasi Data & Supabase Contract
* **Database Schema:** Disimpan di `supabase/migrations/` dan tidak diubah/reset selama fase rebuild UI.
* **Authentication:** Supabase SSR Auth with cookie session management (`utils/supabase/`).
* **Data Mapping:** Semua data Supabase dipetakan melalui [lib/supabase-helpers.ts](file:///c:/Users/User/.gemini/antigravity/scratch/paroy-store/lib/supabase-helpers.ts) ke tipe TypeScript di [types/index.ts](file:///c:/Users/User/.gemini/antigravity/scratch/paroy-store/types/index.ts).
