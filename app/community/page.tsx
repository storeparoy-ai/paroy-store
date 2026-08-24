'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Users, MessageSquare, Flame, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  seller: { label: 'Seller Pro', color: '#00f0ff', bg: 'rgba(0,240,255,0.12)' },
  buyer:  { label: 'Member', color: '#94a3b8', bg: 'rgba(255,255,255,0.06)' },
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
    content: '🎉 Event Top Up Promo Kemerdekaan & Season Baru telah dibuka! Dapatkan cashback diamond hingga 20% otomatis masuk ke akun game kamu 24 jam nonstop.',
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
    <div className="min-h-screen bg-[#06080d] text-white flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-14 pb-36 flex flex-col gap-10">
        
        {/* Hero Banner Bento */}
        <div className="relative p-8 sm:p-12 md:p-14 rounded-3xl bg-[#0e1422] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-brand-cyan">
                  FORUM & KOMUNITAS RESMI
                </span>
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight">
                Ruang Diskusi <span className="text-gradient-cyan">Gamers Indonesia</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Tempat berbagi tips pro player, info giveaway, cari teman mabar, review transaksi seller, dan diskusi seputar game favoritmu.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span>1.420 Gamers Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          
          {/* Main Feed Left (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6 sm:gap-8">
            
            {/* Create Post Bento Box */}
            <div className="p-7 sm:p-9 rounded-3xl bg-[#0e1422] border border-white/10 shadow-xl">
              {showPostBox ? (
                <div className="space-y-4">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Bagikan tips, cari mabar, atau ajukan pertanyaan ke komunitas..."
                    rows={4}
                    className="w-full bg-[#141a29] border border-white/10 rounded-2xl p-5 text-sm text-white placeholder:text-slate-500 focus:bg-[#182236] focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 outline-none transition-all resize-none shadow-inner"
                    autoFocus
                  />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">Gunakan bahasa yang sopan, sportif, dan ramah</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowPostBox(false)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handlePost}
                        disabled={!newPost.trim()}
                        className="btn-cyber text-xs sm:text-sm py-2.5 px-6 disabled:opacity-40 flex items-center gap-2 shadow-lg cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Kirim Postingan</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setShowPostBox(true)}
                  className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-[#141a29] border border-white/10 cursor-pointer hover:border-brand-cyan/40 hover:bg-[#182236] transition-all text-xs sm:text-sm shadow-inner"
                >
                  <span className="text-2xl">✍️</span>
                  <span className="text-slate-300 font-medium">Ada yang ingin kamu diskusikan hari ini? Tulis postingan...</span>
                </div>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer',
                    activeTab === tab.id
                      ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/50 shadow-sm'
                      : 'bg-[#0e1422] text-slate-400 border-white/8 hover:text-white hover:border-white/20'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Post Feed List */}
            <div className="space-y-6">
              {posts.map((post) => {
                const badge = ROLE_BADGE[post.author.role] || ROLE_BADGE.buyer;
                return (
                  <div
                    key={post.id}
                    className="p-7 sm:p-9 rounded-3xl bg-[#0e1422] border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl flex flex-col gap-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#141a29] border border-white/10 flex items-center justify-center text-xl shadow-xs shrink-0">
                          {post.author.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-heading font-black text-base text-white">{post.author.name}</span>
                            <span
                              className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}33` }}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{timeAgo(post.createdAt)}</p>
                        </div>
                      </div>

                      {post.game && (
                        <span className="text-xs font-bold text-brand-cyan bg-brand-cyan/10 px-4 py-1.5 rounded-xl border border-brand-cyan/30 shrink-0">
                          {post.game}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-8 pt-4 border-t border-white/8 text-xs sm:text-sm text-slate-400">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={cn(
                          'flex items-center gap-2 transition-colors cursor-pointer font-bold',
                          post.liked ? 'text-red-400' : 'hover:text-white'
                        )}
                      >
                        <Heart className={cn('w-4 h-4', post.liked && 'fill-red-400')} />
                        <span>{post.likes} Suka</span>
                      </button>

                      <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer font-bold">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments} Komentar</span>
                      </div>

                      <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer ml-auto font-bold">
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
          <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8 sticky top-28">
            
            {/* Discord & WA Banner */}
            <div className="p-7 sm:p-9 rounded-3xl bg-[#0e1422] border border-white/10 shadow-xl flex flex-col gap-5">
              <h3 className="font-heading font-black text-xl text-white">
                Gabung Saluran Resmi
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dapatkan notifikasi diskon kilat, giveaway diamond harian, dan turnamen mingguan di server Discord & WhatsApp Paroy Store.
              </p>

              <div className="space-y-3.5 pt-2">
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 px-6 rounded-2xl bg-[#5865f2]/15 border border-[#5865f2]/30 text-white text-xs sm:text-sm font-bold hover:bg-[#5865f2]/25 transition-all shadow-md group"
                >
                  <span className="flex items-center gap-3">🎮 Server Discord (5.2k Member)</span>
                  <span className="group-hover:translate-x-1.5 transition-transform text-slate-400">&rarr;</span>
                </a>
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 px-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold hover:bg-emerald-500/25 transition-all shadow-md group"
                >
                  <span className="flex items-center gap-3">💬 Saluran WhatsApp Resmi</span>
                  <span className="group-hover:translate-x-1.5 transition-transform text-emerald-400">&rarr;</span>
                </a>
              </div>
            </div>

            {/* Community Rules */}
            <div className="p-7 sm:p-9 rounded-3xl bg-[#0e1422] border border-white/10 shadow-xl space-y-4">
              <h3 className="font-heading font-black text-xl text-white">
                Tata Tertib Forum
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 list-disc list-inside leading-relaxed">
                <li>Dilarang keras melakukan spam, promosi judi online, atau konten ilegal.</li>
                <li>Gunakan selalu Rekber Resmi Paroy Store untuk transaksi akun demi keamanan 100%.</li>
                <li>Hormati sesama member komunitas dan jaga sportifitas bermain game.</li>
              </ul>
            </div>

          </div>

        </div>

      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
