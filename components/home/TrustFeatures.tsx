import React from 'react';
import { ShieldCheck, UserCheck, Lock, FileSearch } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

/**
 * Empat alasan memilih toko ini — semuanya hal yang benar-benar dilakukan
 * sistemnya hari ini.
 *
 * Dua di antaranya dulu berisi klaim yang tidak berdasar: "Proses 1 Detik
 * Otomatis" (tidak ada otomatisasi apa pun — pembayarannya transfer manual dan
 * admin yang mengisikan) dan "Rating 4.9/5 dari 10.400 transaksi" (toko ini
 * belum punya satu pun transaksi selesai). Yang pertama bukan cuma tidak
 * jujur, ia menjamin keluhan: pembeli yang top up jam dua pagi akan menunggu
 * sesuatu yang dijanjikan datang dalam sedetik.
 *
 * Penggantinya sengaja dipilih dari hal yang justru jadi kekuatan toko kecil:
 * ada orangnya, dan pesanan bisa dilacak tanpa mendaftar.
 */
const FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Anti Hackback',
    desc: 'Setiap akun diverifikasi & didampingi admin saat serah terima demi keamananmu.',
  },
  {
    icon: UserCheck,
    title: 'Ditangani Admin Langsung',
    desc: 'Pesanan diverifikasi orang, bukan bot. Kirim bukti transfer langsung di situs ini.',
  },
  {
    icon: Lock,
    title: 'Rekber Escrow Resmi',
    desc: 'Dana ditahan aman hingga kedua belah pihak menyelesaikan transaksi.',
  },
  {
    icon: FileSearch,
    title: 'Lacak Tanpa Login',
    desc: 'Cek status pesanan kapan saja pakai nomor invoice — tidak perlu daftar akun dulu.',
  },
];

export default function TrustFeatures() {
  return (
    <section className="space-y-6">
      <div>
        <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-trust-emerald mb-2.5">
          Kenapa Paroy Store
        </span>
        <h2 className="font-heading font-extrabold text-2xl sm:text-[32px] text-text-main tracking-[-0.02em]">
          Transaksi Aman, Dari Awal Sampai Akhir
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} variant="alt">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-[13px] bg-trust-emerald/10 border border-trust-emerald/25 text-trust-emerald flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-[15px] text-text-main tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
