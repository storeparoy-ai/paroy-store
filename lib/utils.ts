import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
  return num.toString();
}

/** Compact "Rp 187,4jt" style formatting — reuses formatNumber's jt/rb
 * suffixing but swaps the decimal point for an Indonesian comma. */
export function formatCompactCurrency(amount: number): string {
  return `Rp ${formatNumber(Math.round(amount)).replace('.', ',')}`;
}

export interface PriceRange {
  id: string;
  minAmount: number | null;
  maxAmount: number | null;
  sortOrder: number;
}

/** Shared label for a price-range row, used both in the public product
 * filter chips and the admin table that manages them — kept in one place
 * so the two never drift apart. `null` on both ends means "no filter". */
export function formatPriceRangeLabel(min: number | null, max: number | null): string {
  if (min == null && max == null) return 'Semua Harga';
  if (min == null) return `< ${formatCompactCurrency(max!)}`;
  if (max == null) return `> ${formatCompactCurrency(min)}`;
  return `${formatCompactCurrency(min)} - ${formatCompactCurrency(max)}`;
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mnt lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  return `${Math.floor(seconds / 86400)} hari lalu`;
}

const REKBER_FEE_TIERS: { max: number; fee: number }[] = [
  { max: 100_000, fee: 5_000 },
  { max: 500_000, fee: 10_000 },
  { max: 1_000_000, fee: 20_000 },
  { max: 5_000_000, fee: 35_000 },
  { max: Infinity, fee: 50_000 },
];

/** @deprecated Superseded by admin-managed tiers (calculateRekberFeeFromTiers
 * below, backed by public.rekber_fee_tiers). Kept only as the seed values
 * migration 00000000000005 inserts. */
export function calculateRekberFee(amount: number): number {
  const tier = REKBER_FEE_TIERS.find((t) => amount <= t.max);
  return tier?.fee ?? REKBER_FEE_TIERS[REKBER_FEE_TIERS.length - 1].fee;
}

export interface RekberFeeTier {
  id: string;
  maxAmount: number | null;
  fee: number;
}

/** Pure — deliberately kept out of lib/supabase/queries.ts, which imports
 * the server-only Supabase client (next/headers). A 'use client' component
 * importing anything from that module pulls the whole module graph into
 * the client bundle and breaks the build. */
export function calculateRekberFeeFromTiers(amount: number, tiers: RekberFeeTier[]): number {
  const tier = tiers.find((t) => t.maxAmount === null || amount <= t.maxAmount);
  return tier?.fee ?? tiers[tiers.length - 1]?.fee ?? 0;
}

/** Label for one row of the public "Daftar Biaya Rekber" table (see
 * RekberFeeTable) — tiers are a ladder, not independent ranges like
 * PriceRange, so each tier's lower bound is derived from the previous
 * tier's maxAmount rather than stored directly. `tiers` must already be in
 * ascending maxAmount order (getRekberFeeTiers() sorts by sort_order,
 * which the admin table keeps in sync with that). */
export function formatRekberTierRange(tiers: RekberFeeTier[], index: number): string {
  const tier = tiers[index];
  const prevMax = index > 0 ? tiers[index - 1].maxAmount : null;
  const min = (prevMax ?? -1) + 1;
  if (tier.maxAmount == null) return `> ${formatCompactCurrency(prevMax ?? 0)}`;
  return `${formatCompactCurrency(min)} - ${formatCompactCurrency(tier.maxAmount)}`;
}

/* generateOrderNumber() dihapus 2026-09-05.
 *
 * Fungsi ini membuat nomor invoice di sisi browser, dan dipakai keempat alur
 * pemesanan sebagai jalan keluar saat penyimpanan ke database gagal. Akibatnya
 * pembeli melihat halaman sukses lengkap dengan nomor invoice untuk pesanan
 * yang tidak pernah ada di mana pun — lalu mentransfer uang. Nomor invoice
 * yang sah sekarang hanya datang dari database (kolom order_number), dan
 * kegagalan ditampilkan apa adanya lewat components/shared/SubmitError.tsx.
 *
 * Sengaja tidak disisakan sebagai fungsi menganggur supaya polanya tidak
 * dipakai ulang tanpa sengaja di kemudian hari. */
