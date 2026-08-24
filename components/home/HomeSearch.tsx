'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const QUICK_TAGS = [
  { label: '⚡ MLBB', query: 'mlbb' },
  { label: '🔥 Free Fire', query: 'ff' },
  { label: '⚽ eFootball', query: 'efootball' },
  { label: '🎯 PUBG', query: 'pubg' },
  { label: '⏱ Rental', query: 'rental' },
  { label: '💥 Flash Sale', query: 'flash-sale' },
];

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleTag = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="col-span-2 md-col-span-4 flex flex-col gap-2">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative group">
        {/* Animated gradient border */}
        <div
          aria-hidden
          className="absolute -inset-[1.5px] rounded-[15px] search-border-anim opacity-60 transition-opacity group-hover:opacity-90"
          style={{ borderRadius: 'calc(var(--radius-lg) + 1.5px)' }}
        />
        <div
          className="relative flex items-center gap-3 h-12 px-4 overflow-hidden transition-all duration-300"
          style={{
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-card)',
          }}
        >
          <Search
            className="w-4 h-4 shrink-0 transition-colors duration-200 group-hover:text-[rgba(245,158,11,0.7)]"
            style={{ color: 'var(--text-muted)' }}
            aria-hidden
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari akun game, rank, atau fitur..."
            className="flex-1 bg-transparent outline-none border-none ring-0 text-sm"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Cari produk"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </form>

      {/* Quick tags */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <Search className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} aria-hidden />
        {QUICK_TAGS.map(({ label, query: q }) => (
          <button
            key={q}
            type="button"
            onClick={() => handleTag(q)}
            className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-150 active:scale-95 touch-manipulation"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.35)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-400)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.06)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
