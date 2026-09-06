'use client';

import React, { useMemo, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  DEFAULT_TEMPLATES,
  PLACEHOLDERS,
  contohNilai,
  renderTemplate,
  type TemplateKey,
} from '@/lib/notify-template';

/**
 * Penyunting satu template pesan: kotak teks, daftar penanda yang bisa
 * diklik, dan pratinjau langsung.
 *
 * Pratinjaunya memanggil renderTemplate() — fungsi yang SAMA PERSIS dengan
 * yang dipakai server saat benar-benar mengirim. Kalau pratinjau punya
 * salinan logikanya sendiri, cepat atau lambat keduanya akan berbeda dan
 * pratinjau itu berubah jadi kebohongan yang meyakinkan.
 */
export default function MessageTemplateEditor({
  templateKey,
  label,
  description,
  value,
  onChange,
}: {
  templateKey: TemplateKey;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // Pratinjau dirender sebagai teks biasa: tag HTML-nya ditanggalkan supaya
  // yang terlihat kira-kira sama dengan hasil akhir di Telegram, tanpa
  // menyuntikkan HTML orang lain ke dalam dashboard.
  const pratinjau = useMemo(() => {
    const isi = renderTemplate(
      value.trim() || DEFAULT_TEMPLATES[templateKey],
      contohNilai('https://paroy-store.vercel.app/admin/pesanan')
    );
    return isi
      .replace(/<a href="([^"]*)">([^<]*)<\/a>/g, '$2')
      .replace(/<\/?[a-z]+>/gi, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }, [value, templateKey]);

  /** Sisipkan penanda tepat di posisi kursor, bukan ditambahkan di ujung —
   * pemilik toko biasanya sedang menyusun satu baris tertentu saat menekannya. */
  function sisipkan(penanda: string) {
    const el = areaRef.current;
    if (!el) {
      onChange(value + penanda);
      return;
    }
    const awal = el.selectionStart ?? value.length;
    const akhir = el.selectionEnd ?? value.length;
    const baru = value.slice(0, awal) + penanda + value.slice(akhir);
    onChange(baru);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(awal + penanda.length, awal + penanda.length);
    });
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-text-main">{label}</p>
          <p className="text-[11px] text-text-dim leading-relaxed">{description}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onChange(DEFAULT_TEMPLATES[templateKey])}
          title="Kembalikan ke susunan bawaan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Bawaan
        </Button>
      </div>

      <textarea
        ref={areaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        spellCheck={false}
        className="w-full bg-bg-card text-text-main placeholder:text-text-dim text-xs rounded-xl border border-border-subtle p-3.5 font-mono leading-relaxed transition-all duration-200 focus:outline-none focus:border-brand-cyan/60 focus:ring-1 focus:ring-brand-cyan/30 resize-y"
        placeholder={DEFAULT_TEMPLATES[templateKey]}
      />

      <div className="space-y-1.5">
        <p className="text-[11px] text-text-dim">Klik untuk menyisipkan:</p>
        <div className="flex flex-wrap gap-1.5">
          {PLACEHOLDERS[templateKey].map((p) => (
            <button
              key={p.key}
              type="button"
              title={p.hint}
              onClick={() => sisipkan(p.key)}
              className="px-2 py-1 rounded-lg bg-bg-card-alt border border-border-subtle text-[10px] font-mono text-brand-cyan hover:border-brand-cyan/50 transition-colors cursor-pointer"
            >
              {p.key}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-card-alt p-3.5 space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-text-dim font-semibold">
          Pratinjau (dengan data contoh)
        </p>
        <pre className="text-[11px] text-text-muted whitespace-pre-wrap font-mono leading-relaxed">
          {pratinjau}
        </pre>
      </div>
    </div>
  );
}
