'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Trash2, Loader2, Upload, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

const GAMES = [
  { value: 'MLBB', label: '⚡ Mobile Legends: Bang Bang' },
  { value: 'Free Fire', label: '🔥 Free Fire MAX' },
  { value: 'PUBG', label: '🎯 PUBG Mobile' },
  { value: 'Valorant', label: '🔫 Valorant' },
  { value: 'Genshin', label: '✨ Genshin Impact' },
  { value: 'eFootball', label: '⚽ eFootball' },
  { value: 'COD', label: '💥 Call of Duty: Mobile' },
  { value: 'Other', label: '🎮 Lainnya' },
];

interface ProductFormData {
  title: string;
  game: string;
  price: string;
  rental_price_daily: string;
  can_rental: boolean;
  status: 'active' | 'inactive';
  description: string;
  rank: string;
  win_rate: string;
  total_hero: string;
  total_skin: string;
  platform: string;
  region: string;
}

const DEFAULT_FORM: ProductFormData = {
  title: '',
  game: 'MLBB',
  price: '',
  rental_price_daily: '',
  can_rental: false,
  status: 'active',
  description: '',
  rank: '',
  win_rate: '',
  total_hero: '',
  total_skin: '',
  platform: 'Android, iOS',
  region: 'Indonesia',
};

type ImageItem = { type: 'url'; value: string; preview: string } | { type: 'file'; value: File; preview: string };

interface ProductModalProps {
  mode: 'add' | 'edit';
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({ mode, product, onClose, onSuccess }: ProductModalProps) {
  const [form, setForm] = useState<ProductFormData>(DEFAULT_FORM);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'edit' && product) {
      setForm({
        title: product.title || '',
        game: product.game || 'MLBB',
        price: String(product.price || ''),
        rental_price_daily: String(product.rental_price_daily || ''),
        can_rental: product.can_rental || false,
        status: product.status || 'active',
        description: product.description || '',
        rank: product.specs?.rank || '',
        win_rate: product.specs?.win_rate || '',
        total_hero: product.specs?.total_hero || '',
        total_skin: product.specs?.total_skin || '',
        platform: Array.isArray(product.platform)
          ? product.platform.join(', ')
          : product.platform || 'Android, iOS',
        region: product.region || 'Indonesia',
      });
      if (product.images && product.images.length > 0) {
        setImages(product.images.map((url: string) => ({ type: 'url', value: url, preview: url })));
      }
    }
  }, [mode, product]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(file => ({
      type: 'file' as const,
      value: file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Nama produk wajib diisi.');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('Harga jual harus berupa angka valid di atas 0.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Check user auth
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Process Images
    const finalImageUrls: string[] = [];
    
    for (const img of images) {
      if (img.type === 'url') {
        finalImageUrls.push(img.value);
      } else {
        const fileExt = img.value.name.split('.').pop();
        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, img.value, { cacheControl: '3600', upsert: false });
          
        if (uploadError) {
          setError(`Gagal upload foto: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);
        finalImageUrls.push(publicUrlData.publicUrl);
      }
    }

    // Fallback image if none uploaded
    if (finalImageUrls.length === 0) {
      finalImageUrls.push('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop');
    }

    // 2. Insert/Update DB
    const payload = {
      title: form.title,
      game: form.game,
      price: Number(form.price),
      rental_price_daily: form.can_rental && form.rental_price_daily
        ? Number(form.rental_price_daily)
        : null,
      can_rental: form.can_rental,
      status: form.status,
      images: finalImageUrls,
      description: form.description,
      platform: form.platform.split(',').map(p => p.trim()),
      region: form.region,
      specs: {
        rank: form.rank,
        win_rate: form.win_rate,
        total_hero: form.total_hero,
        total_skin: form.total_skin,
      },
      seller_id: user?.id,
    };

    let result;
    if (mode === 'add') {
      result = await supabase.from('products').insert(payload);
    } else {
      result = await supabase.from('products').update(payload).eq('id', product.id);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Matte Dark Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card with Linear/Bento Architecture */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0b0f19] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden z-10"
      >
        {/* Fixed Header */}
        <div className="shrink-0 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 bg-[#0e1422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-lg sm:text-xl text-white tracking-tight">
                {mode === 'add' ? 'Tambah Produk Baru' : 'Edit Detail Produk'}
              </h2>
              <p className="text-xs text-text-muted">
                {mode === 'add' ? 'Isi rincian akun game untuk dipublikasikan ke etalase' : `Mengedit data produk ID #${product?.id || ''}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Info Dasar */}
          <div className="p-6 rounded-2xl bg-[#111728] border border-white/8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-white/6">
              <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
              <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                1. Informasi Dasar Produk
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-main mb-2">
                Nama Judul Produk <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Akun MLBB Mythic Glory 120 Hero + Collector Skin"
                className="input-base"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-main mb-2">
                  Kategori Game <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.game}
                  onChange={e => setForm(prev => ({ ...prev, game: e.target.value }))}
                  className="input-base cursor-pointer"
                >
                  {GAMES.map(g => (
                    <option key={g.value} value={g.value} className="bg-[#111728] text-white">
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-2">
                  Status Toko
                </label>
                <select
                  value={form.status}
                  onChange={e =>
                    setForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))
                  }
                  className="input-base cursor-pointer"
                >
                  <option value="active" className="bg-[#111728] text-white">✅ Aktif (Tampil di Toko)</option>
                  <option value="inactive" className="bg-[#111728] text-white">❌ Nonaktif (Disembunyikan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-main mb-2">
                Deskripsi Lengkap & Keunggulan Akun
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ceritakan detail skin langka, status email (moonton all unbind), win rate, hero favorit, dll..."
                rows={3}
                className="input-base resize-none"
              />
            </div>
          </div>

          {/* Section 2: Harga & Sistem Rental */}
          <div className="p-6 rounded-2xl bg-[#111728] border border-white/8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-white/6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                2. Penetapan Harga & Opsi Rental
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-main mb-2">
                  Harga Jual Akun (Rp) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Contoh: 450000"
                  className="input-base font-mono font-bold"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-2">
                  Harga Rental / Hari (Rp)
                </label>
                <input
                  type="number"
                  value={form.rental_price_daily}
                  onChange={e => setForm(prev => ({ ...prev, rental_price_daily: e.target.value }))}
                  placeholder="Contoh: 50000"
                  className="input-base font-mono font-bold"
                  disabled={!form.can_rental}
                  min="0"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/6 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.can_rental}
                  onChange={e => setForm(prev => ({ ...prev, can_rental: e.target.checked }))}
                  className="w-4 h-4 rounded accent-brand-cyan cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-semibold text-white">
                  Aktifkan Sistem Sewa / Rental Harian untuk akun ini
                </span>
              </label>
              <span className="text-[10px] uppercase font-bold text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded-md border border-brand-cyan/20">
                Fitur Rental
              </span>
            </div>
          </div>

          {/* Section 3: Spesifikasi Teknis Akun */}
          <div className="p-6 rounded-2xl bg-[#111728] border border-white/8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-white/6">
              <span className="w-2 h-2 rounded-full bg-brand-purple shadow-[0_0_8px_#a855f7]" />
              <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                3. Spesifikasi Teknis Akun
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { key: 'rank', label: '🏆 Rank Tertinggi', placeholder: 'Mythic Glory' },
                { key: 'win_rate', label: '📊 Win Rate', placeholder: '65%' },
                { key: 'total_hero', label: '⚔️ Total Hero', placeholder: '120' },
                { key: 'total_skin', label: '👗 Total Skin', placeholder: '80' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] font-bold text-text-muted mb-1.5 truncate">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key as keyof ProductFormData] as string}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input-base text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-text-main mb-2">
                  Dukungan Platform
                </label>
                <input
                  type="text"
                  value={form.platform}
                  onChange={e => setForm(prev => ({ ...prev, platform: e.target.value }))}
                  placeholder="Android, iOS"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-main mb-2">
                  Region Server Akun
                </label>
                <input
                  type="text"
                  value={form.region}
                  onChange={e => setForm(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="Indonesia / Asia"
                  className="input-base"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Foto Produk & Screenshot */}
          <div className="p-6 rounded-2xl bg-[#111728] border border-white/8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                  4. Galeri Foto Akun
                </h3>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 hover:bg-brand-cyan/25 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Foto</span>
              </button>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-4/3 rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                  <Image src={img.preview} alt={`Preview ${index}`} fill className="object-cover" sizes="150px" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div 
                  className="col-span-full py-8 text-center text-xs rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-text-muted"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-brand-cyan/70" />
                  <p className="font-bold text-white">Klik untuk upload foto screenshot akun</p>
                  <span className="text-[11px] text-text-dim">Format JPG, PNG, atau WebP (Maksimal 5MB)</span>
                </div>
              )}
            </div>
          </div>

        </form>

        {/* Fixed Sticky Footer Actions */}
        <div className="shrink-0 flex items-center justify-end gap-3 px-6 sm:px-8 py-4.5 border-t border-white/10 bg-[#0e1422]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary px-5 py-2.5 text-xs sm:text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="btn-cyber px-6 py-2.5 text-xs sm:text-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Server...</span>
              </>
            ) : mode === 'add' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan & Publikasikan Produk</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
