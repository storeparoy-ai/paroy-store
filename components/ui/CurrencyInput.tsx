'use client';

import React from 'react';
import Input from '@/components/ui/Input';

/**
 * Input nominal rupiah dengan pemisah ribuan otomatis.
 *
 * Kolom harga di dashboard sebelumnya `type="number"` polos, jadi satu juta
 * tampil sebagai "1000000" — deretan angka yang harus dihitung sendiri dengan
 * mata, dan gampang meleset satu digit. Salah ketik satu nol di sini berarti
 * akun sejuta dipajang sepuluh juta (atau seratus ribu), jadi keterbacaannya
 * bukan sekadar kenyamanan.
 *
 * Yang disimpan ke database tetap angka mentah tanpa titik; titiknya murni
 * lapisan tampilan. `inputMode="numeric"` memunculkan papan tombol angka di
 * ponsel, sementara jenisnya tetap teks karena `type="number"` tidak
 * mengizinkan titik pemisah di dalam nilainya.
 */
export default function CurrencyInput({
  label,
  value,
  onValueChange,
  required,
  placeholder,
  helperText,
}: {
  label: string;
  /** Angka mentah tanpa pemisah, mis. "1000000". String kosong = belum diisi. */
  value: string;
  onValueChange: (rawDigits: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
}) {
  const display = value ? Number(value).toLocaleString('id-ID') : '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Buang apa pun selain angka, termasuk titik yang barusan kita sisipkan
    // sendiri — sumber kebenarannya selalu digit mentah.
    onValueChange(e.target.value.replace(/\D/g, ''));
  }

  return (
    <div className="w-full">
      <Input
        label={label}
        type="text"
        inputMode="numeric"
        required={required}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        leftIcon={<span className="text-xs font-semibold">Rp</span>}
      />
      {helperText && <p className="text-[11px] text-text-dim mt-1">{helperText}</p>}
    </div>
  );
}
