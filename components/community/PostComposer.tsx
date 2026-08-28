'use client';

import React, { useState, useTransition } from 'react';
import { Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createCommunityPostAction } from '@/lib/supabase/profile-actions';
import type { Game } from '@/types';

export default function PostComposer({ games }: { games: Game[] }) {
  const [content, setContent] = useState('');
  const [game, setGame] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await createCommunityPostAction({ content, game: game || undefined });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setContent('');
      setGame('');
    });
  }

  return (
    <Card variant="default">
      <CardContent className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Ceritakan sesuatu ke komunitas gamer Paroy Store..."
            className="w-full bg-bg-card-alt border border-border-subtle rounded-xl text-sm text-text-main p-3 focus:outline-none focus:border-brand-cyan/50 resize-none"
          />
          <div className="flex items-center justify-between gap-3">
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="bg-bg-card-alt border border-border-subtle rounded-lg text-xs text-text-muted px-3 py-1.5 focus:outline-none focus:border-brand-cyan/50 cursor-pointer"
            >
              <option value="">Semua Game</option>
              {games.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
            <Button type="submit" variant="primary" size="sm" isLoading={isPending} disabled={!content.trim()}>
              <Send className="w-3.5 h-3.5" />
              Kirim
            </Button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
