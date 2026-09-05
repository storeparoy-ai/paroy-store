'use client';

import React, { useState, useTransition } from 'react';
import { Heart, MessageCircle, UserCircle2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { likePostAction, deleteCommunityPostAction } from '@/lib/supabase/profile-actions';
import { cn, timeAgo } from '@/lib/utils';
import type { CommunityPost } from '@/lib/supabase/queries';

export default function PostCard({
  post,
  canLike,
  canModerate = false,
}: {
  post: CommunityPost;
  canLike: boolean;
  /** Tombol hapus untuk admin — moderasi spam/penipuan di forum terbuka. */
  canModerate?: boolean;
}) {
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    if (!canLike || liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    startTransition(async () => {
      const result = await likePostAction(post.id);
      if (!result.success) {
        // revert optimistic update on failure
        setLiked(false);
        setLikes((n) => n - 1);
      }
    });
  }

  function handleDelete() {
    if (!canModerate) return;
    setDeleteError('');
    startTransition(async () => {
      const result = await deleteCommunityPostAction(post.id);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      // Hilang seketika dari daftar; revalidatePath('/community') di sisi
      // server yang memastikan ia juga tidak muncul lagi saat halaman dimuat
      // ulang oleh siapa pun.
      setRemoved(true);
    });
  }

  if (removed) return null;

  return (
    <Card variant="alt">
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-dim">
            <UserCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-text-main truncate">{post.authorName}</p>
            <p className="text-[10px] text-text-dim">{timeAgo(post.createdAt)}</p>
          </div>
          {post.game && <Badge variant="cyan" size="sm">{post.game}</Badge>}
        </div>

        <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{post.content}</p>

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
            {post.comments}
          </span>

          {canModerate && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              title="Hapus postingan ini"
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-text-dim hover:text-urgency-red transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          )}
        </div>

        {deleteError && <p className="text-[11px] text-urgency-red">{deleteError}</p>}
      </CardContent>
    </Card>
  );
}
