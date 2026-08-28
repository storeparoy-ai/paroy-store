'use client';

import React, { useState } from 'react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Search,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowRight,
  ShoppingCart,
  Lock,
  Star,
  Clock,
  Layers,
  Palette,
  Type,
  Box,
  Eye,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DesignSystemStudioPage() {
  const [searchValue, setSearchValue] = useState('Akun MLBB Mythic Immortal');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base text-text-main py-10 sm:py-16 pb-32">
      <Container className="space-y-16">
        
        {/* =========================================================================
            HEADER & TAHAP 1 BADGE
        ========================================================================= */}
        <header className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tahap 1: Fondasi & UI Kit Studio</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-text-main tracking-tight leading-tight">
            Design System <span className="text-gradient-cyan">Paroy Store</span>
          </h1>

          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Fondasi visual dark cyberpunk disiplin (Steam-inspired). Padat konten, rapi lewat grid & tipografi terukur, dengan aturan warna ketat dan satu layout container universal.
          </p>
        </header>


        {/* =========================================================================
            SECTION 1: COLOR PALETTE & WCAG CONTRAST TOKENS
        ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Palette className="w-5 h-5 text-brand-cyan" />
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main">
              1. Token Warna & Peran Visual
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Cyan Accent */}
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="w-full h-14 rounded-xl bg-brand-cyan flex items-center justify-center font-mono font-black text-black text-sm">
                  #22D3EE
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm text-text-main">Brand Cyan</span>
                  <Badge variant="cyan" size="sm">Utama</Badge>
                </div>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                <strong>Satu-satunya warna CTA</strong> & elemen interaktif utama. Fokus perhatian mata pengguna.
              </p>
            </div>

            {/* Urgency Orange */}
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="w-full h-14 rounded-xl bg-urgency-orange flex items-center justify-center font-mono font-black text-black text-sm">
                  #F97316
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm text-text-main">Urgency Orange</span>
                  <Badge variant="urgency" size="sm">Flash Sale</Badge>
                </div>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                <strong>Hanya untuk Flash Sale</strong>, batas waktu, dan countdown urgensi diskon terbatas.
              </p>
            </div>

            {/* Trust Emerald */}
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="w-full h-14 rounded-xl bg-trust-emerald flex items-center justify-center font-mono font-black text-black text-sm">
                  #34D399
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm text-text-main">Trust Emerald</span>
                  <Badge variant="trust" size="sm">Security</Badge>
                </div>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                <strong>Hanya untuk Trust Signals</strong>, rekber aman 100%, garansi akun, & badge rating terverifikasi.
              </p>
            </div>

            {/* Layered Slate Backgrounds */}
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="grid grid-cols-3 gap-1 h-14">
                  <div className="bg-bg-base border border-white/10 rounded-l-xl flex items-center justify-center text-[10px] text-text-dim">Base</div>
                  <div className="bg-bg-card border border-white/10 flex items-center justify-center text-[10px] text-text-muted">Card</div>
                  <div className="bg-bg-card-alt border border-white/10 rounded-r-xl flex items-center justify-center text-[10px] text-text-main">Alt</div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm text-text-main">Dark Navy Layering</span>
                  <Badge variant="neutral" size="sm">Depth</Badge>
                </div>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Gradasi slate 3 lapis untuk hierarki elevasi tanpa memerlukan warna neon berlebihan.
              </p>
            </div>

          </div>
        </section>


        {/* =========================================================================
            SECTION 2: TYPOGRAPHY HIERARCHY
        ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Type className="w-5 h-5 text-brand-cyan" />
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main">
              2. Skala Tipografi (Maksimal 3 Level Heading)
            </h2>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-subtle space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline pb-5 border-b border-border-subtle">
              <span className="text-xs font-mono text-brand-cyan">Heading 1 (Hero / Title)</span>
              <h1 className="md:col-span-3 font-heading font-extrabold text-2xl sm:text-4xl text-text-main tracking-tight">
                Marketplace Akun Game & Top Up Otomatis
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline pb-5 border-b border-border-subtle">
              <span className="text-xs font-mono text-brand-cyan">Heading 2 (Section Title)</span>
              <h2 className="md:col-span-3 font-heading font-bold text-xl sm:text-2xl text-text-main tracking-tight">
                Flash Sale & Produk Pilihan Minggu Ini
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline pb-5 border-b border-border-subtle">
              <span className="text-xs font-mono text-brand-cyan">Heading 3 (Card / Group)</span>
              <h3 className="md:col-span-3 font-heading font-bold text-base sm:text-lg text-text-main">
                Mobile Legends: Bang Bang — Akun Sultan All Skin
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline pb-5 border-b border-border-subtle">
              <span className="text-xs font-mono text-text-muted">Body Text (Paragraf)</span>
              <p className="md:col-span-3 text-sm text-text-muted leading-relaxed">
                Transaksi aman 100% dilindungi sistem Rekber Escrow resmi Paroy Store. Dana hanya diteruskan ke penjual setelah akun diverifikasi penuh oleh pembeli.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline">
              <span className="text-xs font-mono text-text-dim">Monospace & Numbers</span>
              <div className="md:col-span-3 flex flex-wrap items-center gap-4 font-mono">
                <span className="text-xl font-bold text-brand-cyan">{formatCurrency(450000)}</span>
                <span className="text-xs text-text-dim line-through">{formatCurrency(750000)}</span>
                <span className="text-xs px-2 py-0.5 rounded-sm bg-bg-card-alt border border-white/10 text-text-muted">INV-2026-0824</span>
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 3: BUTTON MATRIX
        ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Box className="w-5 h-5 text-brand-cyan" />
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main">
              3. Matriks Komponen Button
            </h2>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-subtle space-y-8">
            
            {/* Button Variants */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Varian Tombol</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">
                  <ShoppingCart className="w-4 h-4" />
                  Primary CTA (Cyan Solid)
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4" />
                  Secondary Outline
                </Button>
                <Button variant="secondary">
                  Secondary Dark
                </Button>
                <Button variant="urgency">
                  <Flame className="w-4 h-4 fill-black" />
                  Flash Sale Urgency
                </Button>
                <Button variant="ghost">
                  Ghost Button
                </Button>
                <Button variant="danger">
                  Hapus / Batal
                </Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div className="space-y-3 pt-6 border-t border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Ukuran Tombol</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small (h-8)</Button>
                <Button size="md">Medium (h-10)</Button>
                <Button size="lg">Large (h-12)</Button>
                <Button size="icon" aria-label="Action">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Button States */}
            <div className="space-y-3 pt-6 border-t border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Kondisi (States)</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button isLoading>Memproses Data</Button>
                <Button disabled>Tombol Nonaktif (Disabled)</Button>
                
                {/* Modal Trigger */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Lock className="w-4 h-4" />
                      Test Modal Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Konfirmasi Transaksi Rekber</DialogTitle>
                      <DialogDescription>
                        Pastikan data akun dan nomor WhatsApp pembeli & penjual sudah benar sebelum melanjutkan ke pembayaran aman.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 rounded-xl bg-bg-card-alt border border-border-subtle text-xs space-y-2">
                      <div className="flex justify-between text-text-muted">
                        <span>Nominal Akun:</span>
                        <span className="font-mono font-bold text-text-main">{formatCurrency(450000)}</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Biaya Jasa Rekber:</span>
                        <span className="font-mono font-bold text-text-main">{formatCurrency(10000)}</span>
                      </div>
                      <div className="flex justify-between items-center text-text-main font-bold pt-2 border-t border-white/5">
                        <span>Total Ditransfer:</span>
                        <span className="font-mono text-brand-cyan text-sm">{formatCurrency(460000)}</span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                        Tutup
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
                        Lanjut ke Bayar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

          </div>
        </section>


        {/* =========================================================================
            SECTION 4: INPUT & FORM CONTROLS
        ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Search className="w-5 h-5 text-brand-cyan" />
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main">
              4. Input & Kontrol Formulir
            </h2>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-subtle">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Search input */}
              <Input
                label="Pencarian Cepat Akun Game"
                leftIcon={<Search className="w-4 h-4" />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Ketik game, rank, atau skin..."
                rightElement={
                  searchValue && (
                    <button
                      onClick={() => setSearchValue('')}
                      className="text-xs text-text-dim hover:text-text-main cursor-pointer"
                    >
                      Hapus
                    </button>
                  )
                }
              />

              {/* Standard text input */}
              <Input
                label="Nomor WhatsApp Pembeli"
                placeholder="Contoh: 081234567890"
              />

              {/* Input with Error State */}
              <Input
                label="User ID Game (Mobile Legends)"
                defaultValue="1234567"
                error="Server ID wajib diisi untuk verifikasi akun game"
                leftIcon={<AlertCircle className="w-4 h-4 text-urgency-red" />}
              />

              {/* Disabled input */}
              <Input
                label="Kode Invoice (Generated Otomatis)"
                defaultValue="INV-PS-20260827-9921"
                disabled
                leftIcon={<Lock className="w-4 h-4" />}
              />

            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 5: BADGES & TRUST SIGNALS
        ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <ShieldCheck className="w-5 h-5 text-brand-cyan" />
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main">
              5. Badges & Trust Signal Chips
            </h2>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-subtle space-y-6">
            
            {/* Trust Signals (Monochrome Emerald) */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Trust Signals (Emerald Security)</h3>
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="trust" size="md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Anti Hackback
                </Badge>
                <Badge variant="trust" size="md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Rekber Resmi Paroy
                </Badge>
                <Badge variant="trust" size="md">
                  <Star className="w-3.5 h-3.5 fill-trust-emerald" />
                  Rating 4.9/5 (10.4k Review)
                </Badge>
                <Badge variant="trust" size="md">
                  <Zap className="w-3.5 h-3.5" />
                  Proses 1 Detik Otomatis
                </Badge>
              </div>
            </div>

            {/* Urgency Signals (Orange Flash Sale) */}
            <div className="space-y-2.5 pt-4 border-t border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Urgency Signals (Flash Sale)</h3>
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="urgency" size="md">
                  <Flame className="w-3.5 h-3.5 fill-urgency-orange" />
                  DISKON 45%
                </Badge>
                <Badge variant="urgency" size="md">
                  <Clock className="w-3.5 h-3.5" />
                  Sisa 02:45:18
                </Badge>
                <Badge variant="urgency" size="sm">
                  Stok Menipis (Sisa 1)
                </Badge>
              </div>
            </div>

            {/* Neutral Category Pills */}
            <div className="space-y-2.5 pt-4 border-t border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Category & Filter Pills</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md">Semua Game</Badge>
                <Badge variant="neutral" size="md">Mobile Legends</Badge>
                <Badge variant="neutral" size="md">Free Fire</Badge>
                <Badge variant="neutral" size="md">PUBG Mobile</Badge>
                <Badge variant="neutral" size="md">Genshin Impact</Badge>
                <Badge variant="neutral" size="md">Valorant</Badge>
              </div>
            </div>

          </div>
        </section>


        {/* =========================================================================
            SECTION 6: CARD PRIMITIVES & PRODUCT DEMOS
        ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Layers className="w-5 h-5 text-brand-cyan" />
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main">
              6. Primitif Card & Demo Produk Katalog
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Interactive Product Card Demo */}
            <Card variant="interactive" className="flex flex-col justify-between">
              <div>
                {/* Card Top Media Container */}
                <div className="relative aspect-video w-full bg-bg-card-alt overflow-hidden border-b border-border-subtle">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-deep via-bg-card to-brand-cyan/10 text-text-dim text-xs font-mono">
                    [Preview Akun Game]
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="cyan" size="sm">MLBB</Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="trust" size="sm">Verified</Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-1">Mythic Glory 120★ — 180 Skin</CardTitle>
                  <CardDescription className="line-clamp-2">
                    Collector Chou, Legend Gusion, Exorcist Yu Zhong. All unbind siap pakai aman 100%.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Specs Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-text-muted">180 Skin</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-text-muted">120 Hero</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-text-muted">Wr 68%</span>
                  </div>

                  {/* Pricing */}
                  <div className="pt-2">
                    <span className="text-xs text-text-dim block">Harga Akun</span>
                    <span className="font-mono font-bold text-lg text-brand-cyan">{formatCurrency(850000)}</span>
                  </div>
                </CardContent>
              </div>

              <CardFooter>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-trust-emerald" />
                  <span>Garansi Rekber</span>
                </div>
                <Button size="sm" variant="primary">
                  Beli Akun
                </Button>
              </CardFooter>
            </Card>


            {/* Flash Sale Card Demo */}
            <Card variant="interactive" className="border-urgency-orange/30 hover:border-urgency-orange flex flex-col justify-between">
              <div>
                <div className="relative aspect-video w-full bg-bg-card-alt overflow-hidden border-b border-border-subtle">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-deep via-urgency-orange/10 to-bg-deep text-text-dim text-xs font-mono">
                    [Flash Sale Promo]
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="urgency" size="sm">
                      <Flame className="w-3 h-3 fill-urgency-orange" />
                      DISKON 40%
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="urgency" size="sm">
                      <Clock className="w-3 h-3" />
                      01:30:12
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-1">Free Fire — Bundle Old Season 1</CardTitle>
                  <CardDescription className="line-clamp-2">
                    Sakura Set, Hip Hop Bundle, AK Dragon Lv 7. Akun pribadi anti hackback.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-text-muted">Old S1</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-text-muted">Evo Gun Max</span>
                  </div>

                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="font-mono font-bold text-lg text-urgency-orange">{formatCurrency(450000)}</span>
                    <span className="font-mono text-xs text-text-dim line-through">{formatCurrency(750000)}</span>
                  </div>
                </CardContent>
              </div>

              <CardFooter>
                <span className="text-xs text-urgency-orange font-bold">Tersisa 1 Akun</span>
                <Button size="sm" variant="urgency">
                  Ambil Flash Sale
                </Button>
              </CardFooter>
            </Card>


            {/* Standard Information Bento Card */}
            <Card variant="alt" className="flex flex-col justify-between">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <CardTitle>Rekber Escrow Otomatis</CardTitle>
                <CardDescription>
                  Uang transaksi ditahan di rekening penampung resmi Paroy Store hingga pembeli mengamankan email & password game 100%.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-trust-emerald" />
                  <span>Verifikasi 2FA dipandu admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-trust-emerald" />
                  <span>Biaya transparan mulai Rp 5.000</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-trust-emerald" />
                  <span>Bantuan sengketa 24 jam nonstop</span>
                </div>
              </CardContent>

              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Pelajari Alur Rekber &rarr;
                </Button>
              </CardFooter>
            </Card>

          </div>
        </section>


        {/* =========================================================================
            SECTION 7: CONTAINER RESPONSIVE GRID VERIFICATION
        ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Box className="w-5 h-5 text-brand-cyan" />
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main">
              7. Verifikasi Grid Layout Container (Full Width Responsive)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((col) => (
              <div
                key={col}
                className="p-5 rounded-2xl bg-bg-card border border-border-subtle text-center flex flex-col items-center justify-center gap-2"
              >
                <span className="w-8 h-8 rounded-full bg-brand-cyan/15 text-brand-cyan font-bold font-mono text-xs flex items-center justify-center">
                  0{col}
                </span>
                <span className="text-xs font-bold text-text-main">Kolom Grid {col}</span>
                <span className="text-[11px] text-text-muted">Responsif 1 &rarr; 2 &rarr; 4 Kolom</span>
              </div>
            ))}
          </div>
        </section>

      </Container>
    </div>
  );
}
