import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, MessageCircle, Send as DiscordIcon } from 'lucide-react';
import Container from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import PostComposer from '@/components/community/PostComposer';
import PostCard from '@/components/community/PostCard';
import { getCommunityPosts, getCurrentUserForDisplay, getGames, getSiteSettings } from '@/lib/supabase/queries';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Komunitas',
  description:
    'Tempat pemain berbagi info, mencari teman main, dan bertanya sebelum membeli akun di Paroy Store.',
  alternates: { canonical: '/community' },
};

export default async function CommunityPage() {
  const [posts, user, games, siteSettings] = await Promise.all([
    getCommunityPosts(),
    getCurrentUserForDisplay(),
    getGames(),
    getSiteSettings(),
  ]);

  return (
    <Container className="py-8 sm:py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
              Komunitas Gamer
            </h1>
            <p className="text-xs text-text-muted">Ngobrol bareng sesama gamer Paroy Store</p>
          </div>
        </div>

        {/* Tombol yang belum diisi URL-nya disembunyikan, tidak diarahkan ke
            "#". Discord memang belum diatur di Pengaturan Situs, dan tombol
            mati lebih buruk daripada tidak ada tombol — ia terlihat seperti
            grup yang ada, sampai seseorang menekannya. */}
        {(siteSettings.whatsappUrl || siteSettings.discordUrl) && (
          <Card variant="alt">
            <CardContent className="p-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-text-muted flex-1">Gabung juga di grup resmi kami:</span>
              {siteSettings.whatsappUrl && (
                <a
                  href={siteSettings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              )}
              {siteSettings.discordUrl && (
                <a
                  href={siteSettings.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  <DiscordIcon className="w-3.5 h-3.5" />
                  Discord
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {user ? (
          <PostComposer games={games} />
        ) : (
          <Card variant="alt">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-text-muted">
                <Link href="/login?next=/community" className="text-brand-cyan font-semibold">
                  Masuk
                </Link>{' '}
                dulu untuk ikut posting & like.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-sm text-text-muted py-10 text-center">
              Belum ada obrolan. Jadilah yang pertama!
            </p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                canLike={!!user}
                canModerate={user?.role === 'admin'}
                currentUserId={user?.id ?? null}
              />
            ))
          )}
        </div>
      </div>
    </Container>
  );
}
