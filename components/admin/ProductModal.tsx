'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Loader2, Upload } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

const GAMES = [
  { value: 'MLBB', label: '⚡ Mobile Legends' },
  { value: 'Free Fire', label: '🔥 Free Fire' },
  { value: 'PUBG', label: '🎯 PUBG Mobile' },
  { value: 'Valorant', label: '🔫 Valorant' },
  { value: 'Genshin', label: '✨ Genshin Impact' },
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
    setImages(prev => {
      const img = prev[index];
      if (img.type === 'file') URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.title.trim() || !form.price) {
      setError('Nama produk dan harga wajib diisi!');
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError('Minimal upload 1 foto produk!');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Upload files first
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid rgba(232,120,159,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-4 border-b"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-default)' }}
        >
          <h2 className="font-bold font-heading text-base" style={{ color: 'var(--text-primary)' }}>
            {mode === 'add' ? '➕ Tambah Produk Baru' : '✏️ Edit Produk'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          {error && (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                background: 'rgba(239,68,68,0.12)',
                color: 'var(--error)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="glass-card p-4 flex flex-col gap-3">
            <p className="section-label text-xs">Info Dasar</p>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                Nama Produk <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="contoh: Akun MLBB Mythic Glory Full Skin"
                className="input-base"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Game
                </label>
                <select
                  value={form.game}
                  onChange={e => setForm(prev => ({ ...prev, game: e.target.value }))}
                  className="input-base"
                >
                  {GAMES.map(g => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={e =>
                    setForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))
                  }
                  className="input-base"
                >
                  <option value="active">✅ Aktif (Tampil di Toko)</option>
                  <option value="inactive">❌ Nonaktif (Disembunyikan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                Deskripsi Singkat
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ceritakan keunggulan akun ini..."
                rows={3}
                className="input-base resize-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="glass-card p-4 flex flex-col gap-3">
            <p className="section-label text-xs">Harga</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Harga Jual (Rp) <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="450000"
                  className="input-base"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Harga Rental/Hari (Rp)
                </label>
                <input
                  type="number"
                  value={form.rental_price_daily}
                  onChange={e => setForm(prev => ({ ...prev, rental_price_daily: e.target.value }))}
                  placeholder="50000"
                  className="input-base"
                  disabled={!form.can_rental}
                  min="0"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.can_rental}
                onChange={e => setForm(prev => ({ ...prev, can_rental: e.target.checked }))}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--primary-400)' }}
              />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                ⏱ Produk ini tersedia untuk sistem Rental
              </span>
            </label>
          </div>

          {/* Specs */}
          <div className="glass-card p-4 flex flex-col gap-3">
            <p className="section-label text-xs">Spesifikasi Akun</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'rank', label: '🏆 Rank Tertinggi', placeholder: 'Mythic Glory' },
                { key: 'win_rate', label: '📊 Win Rate', placeholder: '65%' },
                { key: 'total_hero', label: '⚔️ Total Hero', placeholder: '120' },
                { key: 'total_skin', label: '👗 Total Skin', placeholder: '80' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key as keyof ProductFormData] as string}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input-base"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Platform
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
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Region
                </label>
                <input
                  type="text"
                  value={form.region}
                  onChange={e => setForm(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="Indonesia"
                  className="input-base"
                />
              </div>
            </div>
          </div>

          {/* Images Upload */}
          <div className="glass-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="section-label text-xs">Foto Produk <span style={{ color: 'var(--error)' }}>*</span></p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ color: 'var(--primary-400)', background: 'rgba(232,120,159,0.1)' }}
              >
                <Upload className="w-3 h-3" /> Pilih Foto
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
            
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border-default)] group">
                  <Image src={img.preview} alt={`Preview ${index}`} fill className="object-cover" sizes="100px" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div 
                  className="col-span-full py-6 text-center text-xs rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-[var(--primary-400)] hover:bg-[rgba(232,120,159,0.05)]"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6 mb-1 opacity-50" />
                  Klik "Pilih Foto" untuk upload<br/>(Maksimal 5MB per file)
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-2 mt-2">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary flex-1">
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : mode === 'add' ? (
                '➕ Simpan Produk'
              ) : (
                '✅ Update Produk'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
