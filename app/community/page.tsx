'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Plus, ThumbsUp, Users, Loader2 } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  seller: { label: 'Seller', color: 'var(--primary-400)', bg: 'rgba(245,158,11,0.12)' },
  buyer:  { label: 'Buyer',  color: 'var(--info)',        bg: 'rgba(59,130,246,0.12)' },
  admin:  { label: 'Admin',  color: 'var(--warning)',     bg: 'rgba(245,158,11,0.12)' },
};

type FilterTab = 'all' | 'mlbb' | 'ff' | 'pubg' | 'efootball' | 'admin';

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: '🎮 Semua' },
  { id: 'admin', label: '📣 Pengumuman' },
  { id: 'mlbb', label: '⚡ MLBB' },
  { id: 'ff', label: '🔥 FF' },
  { id: 'pubg', label: '🎯 PUBG' },
  { id: 'efootball', label: '⚽ eFootball' },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [newPost, setNewPost] = useState('');
  const [showPostBox, setShowPostBox] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient();
      
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user || null);

      const { data } = await supabase
        .from('community_posts')
        .select('*, profiles(full_name, username, role, avatar_url)')
        .order('created_at', { ascending: false });
      
      if (data) {
        // Map data to match our UI structure
        const mapped = data.map(post => ({
          id: post.id,
          author: { 
            name: post.profiles?.full_name || post.profiles?.username || 'Unknown', 
            role: post.profiles?.role || 'buyer', 
            avatar: post.profiles?.avatar_url || '😊' 
          },
          content: post.content,
          game: post.game,
          likes: post.likes || 0,
          comments: post.comments || 0,
          createdAt: new Date(post.created_at),
          liked: false,
        }));
        setPosts(mapped);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    
    const supabase = createClient();
    
    // Optimistic update
    const optimisticPost = {
      id: String(Date.now()),
      author: { name: 'Kamu (Memuat...)', role: 'buyer', avatar: '😊' },
      content: newPost,
      game: null,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      liked: false,
    };
    setPosts([optimisticPost, ...posts]);
    const contentToPost = newPost;
    setNewPost('');
    setShowPostBox(false);

    const { error } = await supabase
      .from('community_posts')
      .insert({
        author_id: user.id,
        content: contentToPost,
        game: null
      });
      
    if (!error) {
      // Refresh to get actual data
      const { data } = await supabase
        .from('community_posts')
        .select('*, profiles(full_name, username, role, avatar_url)')
        .order('created_at', { ascending: false });
        
      if (data) {
        setPosts(data.map(post => ({
          id: post.id,
          author: { 
            name: post.profiles?.full_name || post.profiles?.username || 'Unknown', 
            role: post.profiles?.role || 'buyer', 
            avatar: post.profiles?.avatar_url || '😊' 
          },
          content: post.content,
          game: post.game,
          likes: post.likes || 0,
          comments: post.comments || 0,
          createdAt: new Date(post.created_at),
          liked: false,
        })));
      }
    }
  };

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'admin') return p.author.role === 'admin';
    const gameMap: Record<string, string> = {
      mlbb: 'MLBB', ff: 'Free Fire', pubg: 'PUBG', efootball: 'eFootball',
    };
    return p.game?.toLowerCase().includes(gameMap[activeTab].toLowerCase()) ?? false;
  });

  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-[5.75rem] min-h-screen">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-bold font-heading text-xl" style={{ color: 'var(--text-primary)' }}>
                👥 Komunitas
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Bergabung, berbagi, dan bertransaksi bersama
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Users className="w-3.5 h-3.5" />
              1,248 online
            </div>
          </div>

          {/* Create post */}
          {showPostBox ? (
            <div className="glass-card p-4 mb-4 animate-slide-up">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Bagikan pengalaman, info, atau pertanyaan kamu..."
                rows={4}
                className="input-base resize-none mb-3"
                autoFocus
                aria-label="Buat postingan"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowPostBox(false)}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  onClick={handlePost}
                  className="btn-primary text-xs"
                  disabled={!newPost.trim() || !user}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Posting
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPostBox(true)}
              className="w-full glass-card p-3 flex items-center gap-3 mb-4 text-left hover:border-[rgba(245,158,11,0.35)] transition-all"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--primary-400), var(--accent-purple))' }}
              >
                😊
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Bagikan sesuatu ke komunitas...
              </span>
            </button>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
            {FILTER_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                style={{
                  background: activeTab === id ? 'rgba(245,158,11,0.12)' : 'var(--surface-card)',
                  borderColor: activeTab === id ? 'rgba(245,158,11,0.4)' : 'var(--border-default)',
                  color: activeTab === id ? 'var(--primary-400)' : 'var(--text-muted)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Posts feed */}
          <div className="flex flex-col gap-3">
            {filteredPosts.map((post) => {
              const role = ROLE_BADGE[post.author.role];
              return (
                <article
                  key={post.id}
                  className="glass-card p-4 transition-all hover:border-[rgba(245,158,11,0.2)]"
                >
                  {/* Author row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: 'var(--surface-raised)' }}
                      >
                        {post.author.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {post.author.name}
                          </span>
                          <span
                            className="badge text-[9px]"
                            style={{ background: role.bg, color: role.color, border: `1px solid ${role.color}33` }}
                          >
                            {role.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {post.game && (
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{post.game} ·</span>
                          )}
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button aria-label="Simpan post">
                      <Bookmark className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {post.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        post.liked ? 'bg-[rgba(245,158,11,0.12)]' : 'hover:bg-[rgba(255,255,255,0.04)]'
                      )}
                      style={{ color: post.liked ? 'var(--primary-400)' : 'var(--text-muted)' }}
                      aria-label="Like"
                    >
                      <ThumbsUp className={cn('w-3.5 h-3.5', post.liked && 'fill-current')} />
                      {post.likes}
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(255,255,255,0.04)]"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="Komentar"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {post.comments}
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(255,255,255,0.04)] ml-auto"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="Bagikan"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Bagikan
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <Footer />
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
