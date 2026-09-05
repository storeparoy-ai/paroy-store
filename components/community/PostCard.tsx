'use client';

import React, { useState, useTransition } from 'react';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  likePostAction,
  deleteCommunityPostAction,
  addCommunityCommentAction,
  deleteCommunityCommentAction,
} from '@/lib/supabase/profile-actions';
import { cn, timeAgo } from '@/lib/utils';
import type { CommunityPost, CommunityComment } from '@/lib/supabase/queries';

/* Warna avatar dipilih dari nama, bukan acak, supaya orang yang sama selalu
 * tampil dengan warna yang sama di seluruh halaman — itu yang membuat sebuah
 * percakapan terbaca sebagai beberapa orang berbeda, bukan satu blok abu-abu
 * seragam seperti sebelumnya. */
const AVATAR_TONES = [
  'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30',
  'bg-brand-magenta/15 text-brand-magenta border-brand-magenta/30',
  'bg-brand-violet/15 text-brand-violet border-brand-violet/30',
  'bg-trust-emerald/15 text-trust-emerald border-trust-emerald/30',
  'bg-urgency-orange/15 text-urgency-orange border-urgency-orange/30',
];

function toneFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'shrink-0 rounded-full border flex items-center justify-center font-heading font-bold',
        toneFor(name),
        size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-[11px]'
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

function CommentRow({
  comment,
  canDelete,
  onDeleted,
}: {
  comment: CommunityComment;
  canDelete: boolean;
  onDeleted: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2.5 group">
      <Avatar name={comment.authorName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-bold text-text-main truncate">{comment.authorName}</span>
          <span className="text-[10px] text-text-dim shrink-0">{timeAgo(comment.createdAt)}</span>
          {canDelete && (
            <button
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteCommunityCommentAction(comment.id);
                  if (result.success) onDeleted(comment.id);
                })
              }
              disabled={isPending}
              aria-label="Hapus balasan"
              className="ml-auto shrink-0 text-text-dim hover:text-urgency-red transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap wrap-break-word">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export default function PostCard({
  post,
  canLike,
  canModerate = false,
  currentUserId = null,
}: {
  post: CommunityPost;
  canLike: boolean;
  /** Tombol hapus postingan — khusus admin. */
  canModerate?: boolean;
  /** Dipakai untuk menentukan balasan mana yang boleh dihapus penulisnya sendiri. */
  currentUserId?: string | null;
}) {
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [actionError, setActionError] = useState('');
  const [comments, setComments] = useState(post.commentList);
  const [draft, setDraft] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    if (!canLike || liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    startTransition(async () => {
      const result = await likePostAction(post.id);
      if (!result.success) {
        setLiked(false);
        setLikes((n) => n - 1);
      }
    });
  }

  function handleDeletePost() {
    if (!canModerate) return;
    setActionError('');
    startTransition(async () => {
      const result = await deleteCommunityPostAction(post.id);
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setRemoved(true);
    });
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !canLike) return;
    setActionError('');
    startTransition(async () => {
      const result = await addCommunityCommentAction(post.id, text);
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      // Tampilkan seketika; revalidatePath('/community') di sisi server yang
      // memastikan balasan ini juga ada saat halaman dimuat ulang.
      setComments((list) => [
        ...list,
        {
          id: `local-${Date.now()}`,
          authorId: currentUserId,
          authorName: 'Kamu',
          content: text,
          createdAt: new Date(),
        },
      ]);
      setDraft('');
    });
  }

  if (removed) return null;

  return (
    <Card variant="alt">
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={post.authorName} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-text-main truncate">{post.authorName}</p>
            <p className="text-[10px] text-text-dim">{timeAgo(post.createdAt)}</p>
          </div>
          {post.game && <Badge variant="cyan" size="sm">{post.game}</Badge>}
        </div>

        <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap wrap-break-word">{post.content}</p>

        <div className="flex items-center gap-4 pt-3 border-t border-border-subtle/50">
          <button
            onClick={handleLike}
            disabled={!canLike || liked || isPending}
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold transition-colors',
              liked ? 'text-urgency-red' : 'text-text-muted hover:text-urgency-red',
              !canLike && 'cursor-not-allowed opacity-60'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5', liked && 'fill-urgency-red')} />
            {likes}
          </button>
          <span className="flex items-center gap-1.5 text-xs text-text-dim">
            <MessageCircle className="w-3.5 h-3.5" />
            {comments.length}
          </span>

          {canModerate && (
            <button
              onClick={handleDeletePost}
              disabled={isPending}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-text-dim hover:text-urgency-red transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          )}
        </div>

        {comments.length > 0 && (
          <div className="space-y-3 pt-1">
            {comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                canDelete={canModerate || (!!currentUserId && comment.authorId === currentUserId)}
                onDeleted={(id) => setComments((list) => list.filter((c) => c.id !== id))}
              />
            ))}
          </div>
        )}

        {canLike && (
          <form onSubmit={handleComment} className="flex items-center gap-2 pt-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Tulis balasan..."
              maxLength={1000}
              className="flex-1 h-9 bg-bg-card border border-border-subtle rounded-lg px-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-brand-cyan/50"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isPending}
              aria-label="Kirim balasan"
              className="h-9 w-9 shrink-0 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center hover:bg-brand-cyan/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {actionError && <p className="text-[11px] text-urgency-red">{actionError}</p>}
      </CardContent>
    </Card>
  );
}
