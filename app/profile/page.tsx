'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, ShoppingBag, Heart, Bell, Settings,
  ChevronRight, Package, Clock, CheckCircle2, XCircle, AlertCircle, LogOut, Loader2
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

const ORDER_STATUS = {
  pending:   { label: 'Menunggu',  color: 'var(--warning)',   bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  paid:      { label: 'Dibayar',   color: 'var(--info)',      bg: 'rgba(59,130,246,0.12)',  icon: AlertCircle },
  approved:  { label: 'Diproses',  color: 'var(--primary-400)', bg: 'rgba(245,158,11,0.12)', icon: Package },
  completed: { label: 'Selesai',   color: 'var(--success)',   bg: 'rgba(34,197,94,0.12)',   icon: CheckCircle2 },
  rejected:  { label: 'Ditolak',   color: 'var(--error)',     bg: 'rgba(239,68,68,0.12)',   icon: XCircle },
  cancelled: { label: 'Dibatalkan',color: 'var(--text-muted)',bg: 'rgba(255,255,255,0.05)', icon: XCircle },
};

type TabId = 'orders' | 'wishlist' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        setUserProfile({
          id: user.id,
          name: profile.full_name || 'User',
          username: profile.username || `@user_${user.id.substring(0,6)}`,
          email: user.email,
          whatsapp: profile.whatsapp,
          avatarUrl: profile.avatar_url,
          joinDate: new Date(profile.created_at).getFullYear(),
          role: profile.role,
        });
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, products(*, profiles(full_name, username, role))')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersData) {
        setOrders(ordersData.map(o => ({
          id: o.order_number,
          product: mapSupabaseProduct(o.products),
          status: o.status,
          amount: o.amount,
          date: new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          mode: o.mode,
        })));
      }
      
      setLoading(false);
    };
    
    fetchProfileData();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Pilih gambar untuk diupload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.id}-${Math.random()}.${fileExt}`;
      
      const supabase = createClient();
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      setUserProfile({ ...userProfile, avatarUrl: publicUrl });
      alert('Avatar berhasil diperbarui!');
    } catch (error: any) {
      alert(error.message || 'Gagal upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-400)' }} />
      </div>
    );
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const tabs: { id: TabId; icon: typeof ShoppingBag; label: string }[] = [
    { id: 'orders', icon: ShoppingBag, label: 'Pesanan' },
    { id: 'wishlist', icon: Heart, label: 'Wishlist' },
    { id: 'settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-24 min-h-screen">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4">

          {/* Profile card */}
          <div className="glass-heavy relative overflow-hidden rounded-2xl p-5 mb-4">
            <div
              aria-hidden
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'rgba(245,158,11,0.10)', filter: 'blur(40px)' }}
            />
            <div className="relative flex items-center gap-4">
              {/* Avatar with Upload */}
              <div className="relative group">
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 text-2xl font-bold text-white relative"
                  style={{ background: 'linear-gradient(135deg, var(--primary-400), var(--accent-purple))' }}
                >
                  {userProfile.avatarUrl ? (
                    <Image src={userProfile.avatarUrl} alt="Avatar" fill className="object-cover" sizes="64px" />
                  ) : (
                    userProfile.name.charAt(0).toUpperCase()
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--surface-card)] border border-[var(--border-default)] flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform">
                  <span className="text-[10px]">📷</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="min-w-0 flex-1">
                <h1 className="font-bold font-heading text-lg" style={{ color: 'var(--text-primary)' }}>
                  {userProfile.name}
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{userProfile.username}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{userProfile.email}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: 'Total Order', value: orders.length },
                { label: 'Selesai', value: orders.filter((o) => o.status === 'completed').length },
                { label: 'Bergabung', value: userProfile.joinDate },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="text-center py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
                >
                  <p className="text-lg font-black font-heading" style={{ color: 'var(--primary-400)' }}>{value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 p-1 rounded-xl mb-4"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
          >
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all'
                )}
                style={
                  activeTab === id
                    ? { background: 'linear-gradient(135deg, var(--primary-400), var(--primary-500))', color: 'white' }
                    : { color: 'var(--text-muted)' }
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* === Tab: Orders === */}
          {activeTab === 'orders' && (
            <div>
              {/* Status filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                {['all', 'pending', 'approved', 'completed', 'rejected'].map((s) => {
                  const isActive = filterStatus === s;
                  const st = s !== 'all' ? ORDER_STATUS[s as keyof typeof ORDER_STATUS] : null;
                  return (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                      style={{
                        background: isActive && st ? st.bg : isActive ? 'rgba(245,158,11,0.12)' : 'var(--surface-card)',
                        borderColor: isActive && st ? st.color + '66' : isActive ? 'rgba(245,158,11,0.4)' : 'var(--border-default)',
                        color: isActive && st ? st.color : isActive ? 'var(--primary-400)' : 'var(--text-muted)',
                      }}
                    >
                      {s === 'all' ? '🎮 Semua' : st?.label}
                    </button>
                  );
                })}
              </div>

              {filteredOrders.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {filteredOrders.map((order) => {
                    const st = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS];
                    const StatusIcon = st.icon;
                    return (
                      <div
                        key={order.id}
                        className="glass-card p-3 flex gap-3 hover:border-[rgba(245,158,11,0.3)] transition-all"
                      >
                        {/* Product image */}
                        <div className="relative w-14 h-[72px] rounded-lg overflow-hidden shrink-0 bg-[var(--surface-raised)]">
                          <Image
                            src={order.product.images[0]}
                            alt={order.product.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs font-semibold line-clamp-2 font-heading" style={{ color: 'var(--text-primary)' }}>
                              {order.product.title}
                            </p>
                            {/* Status badge */}
                            <span
                              className="badge shrink-0 flex items-center gap-1"
                              style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}
                            >
                              <StatusIcon className="w-2.5 h-2.5" />
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {order.id} · {order.mode === 'rental' ? '⏱ Rental' : '🛒 Beli'}
                              </p>
                              <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--primary-400)' }}>
                                {formatCurrency(order.amount)}
                              </p>
                            </div>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{order.date}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-16 gap-3">
                  <span className="text-5xl">📦</span>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tidak ada pesanan</p>
                </div>
              )}
            </div>
          )}

          {/* === Tab: Wishlist === */}
          {activeTab === 'wishlist' && (
            <div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                {MOCK_PRODUCTS.filter((_, i) => i % 2 === 0).length} produk tersimpan
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MOCK_PRODUCTS.filter((_, i) => i % 2 === 0).map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="glass-card p-2 flex gap-2 hover:border-[rgba(245,158,11,0.35)] transition-all"
                  >
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--surface-raised)]">
                      <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] line-clamp-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                      <p className="text-xs font-bold mt-1" style={{ color: 'var(--primary-400)' }}>{formatCurrency(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* === Tab: Settings === */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-3">
              {/* Edit profile */}
              <div className="glass-card p-4">
                <h2 className="section-label text-sm mb-4">Info Profil</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Nama Lengkap', value: userProfile.name, type: 'text' },
                    { label: 'Username', value: userProfile.username, type: 'text' },
                    { label: 'Email', value: userProfile.email, type: 'email' },
                    { label: 'WhatsApp', value: userProfile.whatsapp, type: 'tel' },
                  ].map(({ label, value, type }) => (
                    <div key={label}>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
                      <input
                        type={type}
                        defaultValue={value}
                        className="input-base"
                        aria-label={label}
                      />
                    </div>
                  ))}
                  <button className="btn-primary w-full text-sm mt-1">
                    Simpan Perubahan
                  </button>
                </div>
              </div>

              {/* Menu settings */}
              <div className="glass-card overflow-hidden">
                {[
                  { icon: Bell, label: 'Pengaturan Notifikasi', href: '/notifications' },
                  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center justify-between p-4 border-b transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </Link>
                ))}
                
                {userProfile.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-between p-4 border-b transition-colors hover:bg-[rgba(245,158,11,0.1)]"
                    style={{ borderColor: 'var(--border-subtle)', background: 'rgba(245,158,11,0.05)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4" style={{ color: 'var(--primary-400)' }} />
                      <span className="text-sm font-bold" style={{ color: 'var(--primary-400)' }}>Dashboard Admin</span>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--primary-400)' }} />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-4 w-full text-left transition-colors hover:bg-[rgba(239,68,68,0.05)]"
                  style={{ color: 'var(--error)' }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-semibold">Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
