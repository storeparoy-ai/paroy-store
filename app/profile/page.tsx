'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, ShoppingBag, Heart, Bell, Settings,
  ChevronRight, Package, Clock, CheckCircle2, XCircle, AlertCircle, LogOut, Loader2, Shield,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import AdminPanel from '@/components/admin/AdminPanel';
import ProductCard from '@/components/products/ProductCard';

const ORDER_STATUS = {
  pending:   { label: 'Menunggu',  color: '#f59e0b',   bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  paid:      { label: 'Dibayar',   color: '#3b82f6',   bg: 'rgba(59,130,246,0.12)',  icon: AlertCircle },
  approved:  { label: 'Diproses',  color: '#00f0ff',   bg: 'rgba(0,240,255,0.12)',   icon: Package },
  completed: { label: 'Selesai',   color: '#10b981',   bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle2 },
  rejected:  { label: 'Ditolak',   color: '#ef4444',   bg: 'rgba(239,68,68,0.12)',   icon: XCircle },
  cancelled: { label: 'Dibatalkan',color: '#64748b',   bg: 'rgba(255,255,255,0.05)', icon: XCircle },
};

type TabId = 'orders' | 'wishlist' | 'settings' | 'admin';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-bg-deep">
        <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
        <p className="text-xs text-text-muted">Memuat profil akun...</p>
      </div>
    );
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const tabs: { id: TabId; icon: typeof ShoppingBag; label: string }[] = [
    { id: 'orders', icon: ShoppingBag, label: 'Riwayat Pesanan' },
    { id: 'wishlist', icon: Heart, label: 'Wishlist Favorit' },
    { id: 'settings', icon: Settings, label: 'Pengaturan Akun' },
  ];

  if (userProfile?.role === 'admin') {
    tabs.push({ id: 'admin' as TabId, icon: Shield, label: 'Admin Dashboard' });
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-8 sm:py-10 pb-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto">
        
        {/* Profile Header Card */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-bg-card border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden mb-8">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* User Info Left */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 text-3xl font-black text-white bg-linear-to-tr from-brand-cyan to-brand-purple shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                  {userProfile.avatarUrl ? (
                    <Image src={userProfile.avatarUrl} alt="Avatar" fill className="object-cover" sizes="80px" />
                  ) : (
                    userProfile.name.charAt(0).toUpperCase()
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-bg-card border border-white/20 flex items-center justify-center cursor-pointer shadow-md hover:scale-110 hover:border-brand-cyan transition-all">
                  <span className="text-xs">📷</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-heading font-black text-xl sm:text-2xl text-white">
                    {userProfile.name}
                  </h1>
                  {userProfile.role === 'admin' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Administrator
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-text-muted border border-white/10">
                      Member Verified
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-text-muted mt-1 flex items-center gap-2">
                  <span>{userProfile.username}</span> &middot; <span>{userProfile.email}</span>
                </p>
                <p className="text-[11px] text-text-dim mt-0.5">
                  Bergabung sejak tahun {userProfile.joinDate}
                </p>
              </div>
            </div>

            {/* Quick Metrics Right */}
            <div className="grid grid-cols-3 gap-3 self-stretch md:self-auto">
              <div className="p-3.5 rounded-2xl bg-bg-base border border-white/5 text-center flex flex-col justify-center min-w-25">
                <span className="text-lg font-black text-white">{orders.length}</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Total Order</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-bg-base border border-white/5 text-center flex flex-col justify-center min-w-25">
                <span className="text-lg font-black text-emerald-400">
                  {orders.filter(o => o.status === 'completed').length}
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Selesai</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-bg-base border border-white/5 text-center flex flex-col justify-center min-w-25">
                <span className="text-lg font-black text-brand-cyan">
                  {MOCK_PRODUCTS.filter((_, i) => i % 2 === 0).length}
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Wishlist</span>
              </div>
            </div>

          </div>

          {/* Tab Navigation Navigation Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-6 mt-6 border-t border-white/5">
            {tabs.map(({ id, icon: Icon, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border',
                    isActive
                      ? 'bg-linear-to-r from-brand-cyan to-primary-container text-bg-deep border-transparent shadow-[0_0_16px_rgba(0,240,255,0.3)] scale-102'
                      : 'bg-bg-base text-text-muted border-white/5 hover:text-white hover:border-white/15'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-bg-deep' : 'text-text-dim')} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Tab Content Container */}
        <div className="w-full">
          
          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-black text-xl text-white">Daftar Transaksi Saya</h2>
                  <p className="text-xs text-text-muted">Pantau status transaksi top up dan akun pesananmu</p>
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['all', 'pending', 'paid', 'approved', 'completed', 'rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border',
                        filterStatus === st
                          ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/40 shadow-sm'
                          : 'bg-bg-card text-text-muted border-white/5 hover:text-white'
                      )}
                    >
                      {st === 'all' ? 'Semua' : (ORDER_STATUS as any)[st]?.label || st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-20 rounded-3xl bg-bg-card border border-white/8 flex flex-col items-center justify-center text-center p-6 gap-3">
                  <span className="text-5xl">📦</span>
                  <h3 className="font-heading font-bold text-base text-white">Belum Ada Pesanan</h3>
                  <p className="text-xs text-text-muted max-w-sm">Kamu belum melakukan pembelian apapun atau filter tidak sesuai.</p>
                  <Link href="/products" className="btn-cyber text-xs mt-2">
                    Mulai Belanja Akun
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => {
                    const st = (ORDER_STATUS as any)[order.status] || ORDER_STATUS.pending;
                    const StatusIcon = st.icon;
                    return (
                      <div
                        key={order.id}
                        className="p-5 rounded-2xl bg-bg-card border border-white/8 hover:border-brand-cyan/40 transition-all flex flex-col justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-bg-raised">
                            {order.product?.images?.[0] && (
                              <Image
                                src={order.product.images[0]}
                                alt={order.product.title || 'Product'}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="64px"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-mono text-xs font-bold text-brand-cyan">{order.id}</span>
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {st.label}
                              </span>
                            </div>

                            <h3 className="font-heading font-bold text-sm text-white line-clamp-1 group-hover:text-brand-cyan transition-colors">
                              {order.product?.title || 'Produk Game'}
                            </h3>
                            <p className="text-[11px] text-text-muted mt-0.5">
                              {order.mode === 'rental' ? '⏱ Rental Akun' : '🛒 Pembelian Akun'} &middot; {order.date}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-text-dim block">Total Tagihan</span>
                            <span className="text-sm font-black text-primary-container">{formatCurrency(order.amount)}</span>
                          </div>

                          <Link
                            href={`/cek-transaksi?id=${order.id}`}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            Detail Pesanan &rarr;
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div>
              <div className="mb-6">
                <h2 className="font-heading font-black text-xl text-white">Wishlist & Produk Tersimpan</h2>
                <p className="text-xs text-text-muted">Koleksi akun impian yang kamu tandai untuk dibeli nanti</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {MOCK_PRODUCTS.filter((_, i) => i % 2 === 0).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Profil Info */}
              <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-bg-card border border-white/8 flex flex-col gap-4">
                <h2 className="font-heading font-bold text-base text-white">Informasi Akun & Kontak</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nama Lengkap', value: userProfile.name, type: 'text' },
                    { label: 'Username', value: userProfile.username, type: 'text' },
                    { label: 'Email Terdaftar', value: userProfile.email, type: 'email' },
                    { label: 'Nomor WhatsApp', value: userProfile.whatsapp || 'Belum diisi', type: 'tel' },
                  ].map(({ label, value, type }) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-text-muted mb-1.5">{label}</label>
                      <input
                        type={type}
                        defaultValue={value}
                        className="input-base"
                        aria-label={label}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button className="btn-cyber text-xs py-2.5 px-6">
                    Simpan Perubahan
                  </button>
                </div>
              </div>

              {/* Quick Actions & Logout */}
              <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-white/8 flex flex-col justify-between gap-6">
                <div>
                  <h2 className="font-heading font-bold text-base text-white mb-3">Keamanan & Sesi</h2>
                  <div className="space-y-2 text-xs">
                    <Link href="/notifications" className="flex items-center justify-between p-3.5 rounded-xl bg-bg-base hover:bg-white/5 border border-white/5 transition-colors">
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <Bell className="w-4 h-4 text-text-dim" />
                        <span>Pengaturan Notifikasi</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-dim" />
                    </Link>

                    <Link href="/rekber" className="flex items-center justify-between p-3.5 rounded-xl bg-bg-base hover:bg-white/5 border border-white/5 transition-colors">
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Verifikasi Rekber</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-dim" />
                    </Link>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full p-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB: ADMIN DASHBOARD (FULL WIDESCREEN) */}
          {activeTab === 'admin' && (
            <div className="w-full">
              <AdminPanel />
            </div>
          )}

        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
