import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '@/types';

export default function GameQuickSelect({ games }: { games: Game[] }) {
  return (
    <section className="space-y-6">
      <div>
        <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-brand-cyan mb-2.5">
          Pilih Game
        </span>
        <h2 className="font-heading font-extrabold text-2xl sm:text-[32px] text-text-main tracking-[-0.02em]">
          Mulai dari Game Favoritmu
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3.5 sm:gap-4">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/products?game=${game.slug}`}
            className="group flex flex-col items-center gap-3 p-5 rounded-[18px] bg-bg-card border border-border-subtle shadow-elevated hover:border-brand-cyan/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-[28px] overflow-hidden group-hover:scale-105 transition-transform"
              style={{
                background: `linear-gradient(155deg, ${game.color}38, ${game.color}08)`,
                boxShadow: `inset 0 0 0 1px ${game.color}40`,
              }}
            >
              {game.iconUrl ? (
                <Image src={game.iconUrl} alt={game.name} fill sizes="56px" className="object-cover" />
              ) : (
                game.icon
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-text-muted group-hover:text-text-main text-center leading-tight transition-colors">
              {game.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
