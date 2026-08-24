'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Plus, Users, Loader2, MessageSquare, Flame, Sparkles } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  seller: { label: 'Seller Pro', color: '#00f0ff', bg: 'rgba(0,240,255,0.12)' },
  buyer:  { label: 'Member', color: '#94a3b8', bg: 'rgba(255,255,255,0.05)' },
  admin:  { label: 'Admin Resmi', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

type FilterTab = 'all' | 'mlbb' | 'ff' | 'pubg' | 'admin';

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: '🎮 Semua Diskusi' },
  { id: 'admin', label: '📣 Pengumuman Resmi' },
  { id: 'mlbb', label: '⚡ Mobile Legends' },
  { id: 'ff', label: '🔥 Free Fire' },
  { id: 'pubg', label: '🎯 PUBG Mobile' },
];

const INITIAL_MOCK_POSTS = [
  {
    id: 'p1',
    author: { name: 'Admin Paroy', role: 'admin', avatar: '🛡️' },
    content: '🎉 Event Top Up Promo Kemerdekaan & Season Baru telah dibuka! Dapatkan cashback diamond hingga 20% otomatis masuk ke akun.',
    game: 'Mobile Legends',
    likes: 48,
    comments: 12,
    createdAt: new Date(Date.now() - 3600000),
    liked: false,
  },
  {
    id: 'p2',
    author: { name: 'Rizky Gamer', role: 'seller', avatar: '⚡' },
    content: 'Baru aja beli akun MLBB Mythic Glory lewat Rekber Paroy Store, prosesnya cepet banget ga sampe 10 menit udah kelar ganti email. Recomended seller!',
    game: 'Mobile Legends',
    likes: 24,
    comments: 5,
    createdAt: new Date(Date.now() - 7200000),
    liked: false,
  },
  {
    id: 'p3',
    author: { name: 'Dimas Pro', role: 'buyer', avatar: '🎯' },
    content: 'Ada yang mau mabar push rank Immortal MLBB malam ini? Open slot 2 orang roamer & mage, winrate 65%+ ya gais.',
    game: 'Mobile Legends',
    likes: 15,
    comments: 8,
    createdAt: new Date(Date.now() - 14400000),
    liked: false,
  },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>(INITIAL_MOCK_POSTS);
  const [loading, setLoading] = useState(false);
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
      
      if (data && data.length > 0) {
        const mapped = data.map(post => ({
          id: post.id,
          author: { 
            name: post.profiles?.full_name || post.profiles?.username || 'Gamer', 
            role: post.profiles?.role || 'buyer', 
            avatar: post.profiles?.avatar_url || '🎮' 
          },
          content: post.content,
          game: post.game,
          likes: post.likes || 0,
          comments: post.comments || 0,
          createdAt: new Date(post.created_at),
          liked: false,
        }));
        setPosts([...mapped, ...INITIAL_MOCK_POSTS]);
      }
    };
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    const optimisticPost = {
      id: String(Date.now()),
      author: { name: user?.email?.split('@')[0] || 'Kamu', role: 'buyer', avatar: '👤' },
      content: newPost,
      game: 'Komunitas',
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      liked: false,
    };
    setPosts([optimisticPost, ...posts]);
    setNewPost('');
    setShowPostBox(false);

    if (user) {
      const supabase = createClient();
      await supabase.from('community_posts').insert({
        author_id: user.id,
        content: optimisticPost.content,
        game: null
      });
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

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-8 sm:py-10 pb-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto">
        
        {/* Hero Header */}
        <div className="relative p-8 sm:p-10 rounded-3xl bg-bg-card border border-white/8 shadow-md overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                  <Users className="w-5 h-5" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-brand-cyan">
                  FORUM & KOMUNITAS
                </span>
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
                Ruang Diskusi <span className="text-gradient-cyan">Gamers Indonesia</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-xl">
                Tempat berbagi tips, info giveaway, cari teman mabar, review transaksi, dan diskusi seputar game favoritmu.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>1.420 Gamers Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Feed Left (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Create Post Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-bg-card border border-white/8 shadow-sm">
              {showPostBox ? (
                <div className="space-y-3">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Bagikan tips, cari mabar, atau ajukan pertanyaan ke komunitas..."
                    rows={3}
                    className="input-base resize-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-text-dim">Gunakan bahasa yang sopan dan ramah</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPostBox(false)}
                        className="btn-secondary text-xs py-1.5 px-3.5"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handlePost}
                        disabled={!newPost.trim()}
                        className="btn-cyber text-xs py-1.5 px-5 disabled:opacity-40"
                      >
                        Kirim Postingan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setShowPostBox(true)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-bg-base border border-white/5 cursor-pointer hover:border-brand-cyan/40 transition-all text-text-muted text-xs sm:text-sm"
                >
                  <span className="text-lg">✍️</span>
                  <span>Ada yang ingin kamu diskusikan hari ini? Tulis postingan...</span>
                </div>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer',
                    activeTab === tab.id
                      ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan shadow-sm'
                      : 'bg-bg-card text-text-muted border-white/8 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Post Feed List */}
            <div className="space-y-4">
              {posts.map((post) => {
                const badge = ROLE_BADGE[post.author.role] || ROLE_BADGE.buyer;
                return (
                  <div
                    key={post.id}
                    className="p-6 rounded-2xl bg-bg-card border border-white/8 hover:border-white/15 transition-all shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg-raised border border-white/10 flex items-center justify-center text-base">
                          {post.author.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-white">{post.author.name}</span>
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}33` }}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-dim mt-0.5">{timeAgo(post.createdAt)}</p>
                        </div>
                      </div>

                      {post.game && (
                        <span className="text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded-lg border border-brand-cyan/20">
                          {post.game}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-6 pt-3 border-t border-white/5 text-xs text-text-muted">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={cn(
                          'flex items-center gap-1.5 transition-colors cursor-pointer',
                          post.liked ? 'text-red-400 font-bold' : 'hover:text-white'
                        )}
                      >
                        <Heart className={cn('w-4 h-4', post.liked && 'fill-red-400')} />
                        <span>{post.likes} Suka</span>
                      </button>

                      <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments} Komentar</span>
                      </div>

                      <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer ml-auto">
                        <Share2 className="w-4 h-4" />
                        <span>Bagikan</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Sidebar Right (4 cols sticky) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            
            {/* Discord & WA Banner */}
            <div className="p-6 sm:p-7 rounded-3xl bg-bg-card border border-white/8 shadow-sm flex flex-col gap-4">
              <h3 className="font-heading font-bold text-base text-white">
                Gabung Saluran Resmi
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Dapatkan notifikasi diskon kilat, giveaway harian, dan turnamen mingguan di server Discord & WhatsApp Paroy Store.
              </p>

              <div className="space-y-2.5">
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#5865f2]/15 border border-[#5865f2]/30 text-white text-xs font-bold hover:bg-[#5865f2]/25 transition-all"
                >
                  <span className="flex items-center gap-2">🎮 Server Discord (5.2k Member)</span>
                  <span>&rarr;</span>
                </a>
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all"
                >
                  <span className="flex items-center gap-2">💬 Saluran WhatsApp Resmi</span>
                  <span>&rarr;</span>
                </a>
              </div>
            </div>

            {/* Community Rules */}
            <div className="p-6 sm:p-7 rounded-3xl bg-bg-card border border-white/8 shadow-sm">
              <h3 className="font-heading font-bold text-base text-white mb-3">
                Tata Tertib Forum
              </h3>
              <ul className="space-y-2.5 text-xs text-text-muted list-disc list-inside leading-relaxed">
                <li>Dilarang spam, promosi judi, atau konten ilegal.</li>
                <li>Gunakan selalu Rekber Resmi Paroy Store untuk transaksi akun.</li>
                <li>Hormati sesama member dan jaga sportifitas.</li>
              </ul>
            </div>

          </div>

        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
