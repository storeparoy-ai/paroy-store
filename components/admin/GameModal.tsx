'use client';

import React, { useState, useTransition } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { createGameAction, updateGameAction, type GameInput } from '@/lib/supabase/cms-actions';
import type { AdminGame } from '@/lib/supabase/admin-queries';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function GameFormFields({
  game,
  onOpenChange,
  onSaved,
}: {
  game?: AdminGame;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [name, setName] = useState(game?.name ?? '');
  const [slug, setSlug] = useState(game?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!!game);
  const [icon, setIcon] = useState(game?.icon ?? '🎮');
  const [iconUrl, setIconUrl] = useState<string | null>(game?.iconUrl ?? null);
  const [color, setColor] = useState(game?.color ?? '#00e5ff');
  const [sortOrder, setSortOrder] = useState(String(game?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(game?.isActive ?? true);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !slug.trim()) {
      setError('Nama dan slug wajib diisi.');
      return;
    }

    const input: GameInput = {
      slug: slugify(slug),
      name: name.trim(),
      icon,
      iconUrl,
      color,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };

    startTransition(async () => {
      const result = game ? await updateGameAction(game.id, input) : await createGameAction(input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      onSaved?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nama Game"
        required
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!slugTouched) setSlug(slugify(e.target.value));
        }}
        placeholder="Contoh: Mobile Legends"
      />
      <Input
        label="Slug (dipakai di URL)"
        required
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
          setSlugTouched(true);
        }}
        placeholder="contoh: mobile-legends"
      />

      <ImageUploadField label="Ikon Game (gambar/logo)" value={iconUrl} onChange={setIconUrl} folder="games" />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Emoji Cadangan"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="🎮"
        />
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">Warna Aksen</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-11 h-11 rounded-xl border border-border-subtle bg-bg-card cursor-pointer"
            />
            <Input value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </div>
      </div>

      <Input
        label="Urutan Tampil (angka lebih kecil tampil duluan)"
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      />

      <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-brand-cyan cursor-pointer"
        />
        Tampilkan di website
      </label>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-urgency-red/10 border border-urgency-red/25 text-xs text-urgency-red">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Batal
        </Button>
        <Button type="submit" variant="primary" isLoading={isPending}>
          {game ? 'Simpan Perubahan' : 'Tambah Game'}
        </Button>
      </div>
    </form>
  );
}

export default function GameModal({
  open,
  onOpenChange,
  game,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game?: AdminGame;
  onSaved?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{game ? 'Edit Game' : 'Tambah Game Baru'}</DialogTitle>
          <DialogDescription>
            Game yang aktif akan muncul di beranda dan filter katalog.
          </DialogDescription>
        </DialogHeader>
        {open && <GameFormFields game={game} onOpenChange={onOpenChange} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  );
}
