'use client';

import { CircleMenu, CircleMenuItem } from '@/components/ui/circle-menu';
import { Zap, ShieldCheck, Flame, Trophy, MessageSquare, ShoppingBag, Clock } from 'lucide-react';

const ACTION_ITEMS: CircleMenuItem[] = [
  { label: 'Top Up Kilat', icon: <Zap size={20} className="text-brand-cyan" />, href: '/topup' },
  { label: 'Beli Akun Sultan', icon: <ShoppingBag size={20} className="text-white" />, href: '/products' },
  { label: 'Sewa Akun', icon: <Clock size={20} className="text-primary-container" />, href: '/rental' },
  { label: 'Flash Sale', icon: <Flame size={20} className="text-red-400" />, href: '/flash-sales' },
  { label: 'Rekber Escrow', icon: <ShieldCheck size={20} className="text-emerald-400" />, href: '/rekber' },
  { label: 'Leaderboard', icon: <Trophy size={20} className="text-amber-400" />, href: '/leaderboard' },
];

export default function FloatingActionHub() {
  return (
    <div className="fixed bottom-8 right-8 z-90 hidden sm:flex items-center justify-center pointer-events-none">
      <CircleMenu items={ACTION_ITEMS} />
    </div>
  );
}
