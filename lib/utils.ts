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

export function calculateRekberFee(amount: number): number {
  const tier = REKBER_FEE_TIERS.find((t) => amount <= t.max);
  return tier?.fee ?? REKBER_FEE_TIERS[REKBER_FEE_TIERS.length - 1].fee;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PS-${y}${m}${d}-${rand}`;
}
