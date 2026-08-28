import React from 'react';
import { ShieldCheck, Zap, Lock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Anti Hackback',
    desc: 'Setiap akun diverifikasi & didampingi admin saat serah terima demi keamananmu.',
  },
  {
    icon: Zap,
    title: 'Proses 1 Detik Otomatis',
    desc: 'Top up diamond & voucher game langsung masuk otomatis tanpa antre.',
  },
  {
    icon: Lock,
    title: 'Rekber Escrow Resmi',
    desc: 'Dana ditahan aman hingga kedua belah pihak menyelesaikan transaksi.',
  },
  {
    icon: Star,
    title: 'Rating 4.9/5',
    desc: 'Dipercaya lebih dari 10.400 transaksi sukses dari gamer se-Indonesia.',
  },
];

export default function TrustFeatures() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {FEATURES.map((feature) => {
        const Icon = feature.icon;
        return (
          <Card key={feature.title} variant="alt">
            <CardContent className="p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-trust-emerald/10 border border-trust-emerald/25 text-trust-emerald flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-text-main">
                {feature.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">{feature.desc}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
