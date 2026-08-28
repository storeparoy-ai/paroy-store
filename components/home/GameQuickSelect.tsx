import React from 'react';
import Link from 'next/link';
import { GAMES } from '@/lib/mock-data';

export default function GameQuickSelect() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main tracking-tight">
          Pilih Game Favoritmu
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
        {GAMES.map((game) => (
          <Link
            key={game.id}
            href={`/products?game=${game.slug}`}
            className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-bg-card border border-border-subtle hover:border-brand-cyan/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl bg-white/5 group-hover:scale-105 transition-transform"
              style={{ boxShadow: `inset 0 0 0 1px ${game.color}33` }}
            >
              {game.icon}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-text-muted group-hover:text-text-main text-center leading-tight transition-colors">
              {game.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
