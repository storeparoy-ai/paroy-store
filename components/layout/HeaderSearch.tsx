'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import { searchProductsAction } from '@/lib/supabase/actions';
import { formatCurrency } from '@/lib/utils';
import type { ProductSuggestion } from '@/lib/supabase/queries';

/**
 * Kotak pencarian header, dipakai di tampilan desktop maupun menu ponsel.
 *
 * Hasilnya muncul sambil mengetik — sebelumnya pengunjung harus menekan Enter
 * dulu dan berpindah halaman untuk sekadar tahu ada atau tidaknya barangnya.
 * Ketikan ditunda ~250 ms sebelum dikirim, jadi mengetik "mlbb" hanya memicu
 * satu permintaan, bukan empat.
 */
export default function HeaderSearch({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Hasil disimpan bersama kata kunci yang menghasilkannya. Dengan begitu
  // "sedang mencari" dan "daftar yang relevan" bisa DITURUNKAN dari state,
  // bukan disetel lewat effect — sekaligus mencegah hasil ketikan lama
  // sempat terlihat sepersekian detik di bawah ketikan yang baru.
  const [results, setResults] = useState<{ term: string; items: ProductSuggestion[] }>({
    term: '',
    items: [],
  });

  const term = value.trim();
  const fresh = results.term === term;
  const items = fresh ? results.items : [];
  const loading = term.length >= 2 && !fresh;

  useEffect(() => {
    if (term.length < 2 || fresh) return;

    // `ignore` mencegah respons ketikan lama menimpa hasil ketikan terbaru
    // kalau kebetulan datang belakangan.
    let ignore = false;
    const timer = setTimeout(async () => {
      const found = await searchProductsAction(term);
      if (!ignore) setResults({ term, items: found });
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [term, fresh]);

  // Tutup daftar saat mengklik di luar kotak.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToResults(e: React.FormEvent) {
    e.preventDefault();
    if (!term) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/products?q=${encodeURIComponent(term)}`);
  }

  function handlePick() {
    setOpen(false);
    setValue('');
    onNavigate?.();
  }

  const showPanel = open && term.length >= 2;

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={goToResults} role="search">
        <Input
          name="q"
          type="search"
          autoComplete="off"
          aria-label="Cari game atau akun"
          placeholder="Cari game / akun..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          leftIcon={<Search className="w-4 h-4" />}
          rightElement={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-text-dim" /> : undefined}
          className="h-9 bg-bg-card-alt"
        />
      </form>

      {showPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-border-subtle bg-bg-card shadow-elevated overflow-hidden">
          {items.length === 0 ? (
            <p className="px-4 py-3.5 text-xs text-text-muted">
              {loading ? 'Mencari...' : `Tidak ada akun yang cocok dengan "${term}".`}
            </p>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/products/${item.id}`}
                      onClick={handlePick}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/5 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-text-main truncate">{item.title}</p>
                        <p className="text-[10px] text-text-dim">{item.game}</p>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-brand-cyan shrink-0">
                        {formatCurrency(item.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                  router.push(`/products?q=${encodeURIComponent(term)}`);
                }}
                className="w-full text-center px-4 py-2.5 text-[11px] font-semibold text-brand-cyan border-t border-border-subtle hover:bg-white/5 transition-colors"
              >
                Lihat semua hasil untuk &ldquo;{term}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
