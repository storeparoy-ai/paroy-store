'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  TrendingUp, ArrowUpRight, Eye, CheckCircle2, Clock,
  XCircle, Plus, ChevronRight, AlertCircle, Loader2, Pencil, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import ProductModal from '@/components/admin/ProductModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:   { label: 'Menunggu', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  paid:      { label: 'Dibayar',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: AlertCircle },
  approved:  { label: 'Diproses', color: '#00f0ff', bg: 'rgba(0,240,255,0.12)', icon: Package },
  completed: { label: 'Selesai',  color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle2 },
  rejected:  { label: 'Ditolak',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle },
};

type AdminTab = 'dashboard' | 'orders' | 'products' | 'users';

const SIDEBAR_ITEMS: { id: AdminTab; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard Ringkasan' },
  { id: 'orders',    icon: ShoppingBag,     label: 'Semua Pesanan' },
  { id: 'products',  icon: Package,         label: 'Manajemen Produk' },
  { id: 'users',     icon: Users,           label: 'Pengguna Terdaftar' },
];

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteProduct, setDeleteProduct] = useState<any>(null);

  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data.map(mapSupabaseProduct));
  }, []);

  const fetchAdminData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || profile.role !== 'admin') {
      router.push('/');
      return;
    }

    // Fetch Users
    const { data: usersData } = await supabase.from('profiles').select('*');
    if (usersData) setUsers(usersData);

    // Fetch Products
    const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (productsData) setProducts(productsData.map(mapSupabaseProduct));

    // Fetch Orders
    const { data: ordersData } = await supabase.from('orders').select('*, products(title), profiles(full_name)').order('created_at', { ascending: false });
    const { data: topupData } = await supabase.from('topup_orders').select('*, profiles(full_name)').order('created_at', { ascending: false });
    const { data: rekberData } = await supabase.from('rekber_orders').select('*, profiles(full_name)').order('created_at', { ascending: false });

    const combined: any[] = [];
    
    if (ordersData) {
      combined.push(...ordersData.map(o => ({
        id: o.order_number,
        tableId: o.order_number,
        idField: 'order_number',
        type: 'Akun',
        table: 'orders',
        product: o.products?.title || 'Akun Game',
        buyer: o.profiles?.full_name || 'Pembeli',
        amount: o.amount,
        status: o.status,
        date: o.created_at,
        dateFormatted: new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      })));
    }

    if (topupData) {
      combined.push(...topupData.map(t => ({
        id: t.order_number,
        tableId: t.order_number,
        idField: 'order_number',
        type: 'Top Up',
        table: 'topup_orders',
        product: `${t.game_slug.toUpperCase()} (${t.item_label})`,
        buyer: t.profiles?.full_name || t.user_id_game,
        amount: t.amount,
        status: t.status,
        date: t.created_at,
        dateFormatted: new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      })));
    }

    if (rekberData) {
      combined.push(...rekberData.map(r => ({
        id: r.transaction_number,
        tableId: r.transaction_number,
        idField: 'transaction_number',
        type: 'Rekber',
        table: 'rekber_orders',
        product: r.item_name,
        buyer: r.buyer_name,
        amount: r.price,
        status: r.status,
        date: r.created_at,
        dateFormatted: new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      })));
    }

    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setOrders(combined);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const updateOrderStatus = async (order: any, newStatus: string) => {
    const supabase = createClient();
    const { error } = await (supabase.from(order.table as any) as any)
      .update({ status: newStatus })
      .eq(order.idField, order.tableId);

    if (error) {
      alert(`Gagal update status: ${error.message}`);
    } else {
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', deleteProduct.id);
    setDeleteProduct(null);
    fetchProducts();
  };

  const handleToggleStatus = async (product: any) => {
    const supabase = createClient();
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    await supabase.from('products').update({ status: newStatus }).eq('id', product.id);
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-75 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
        <p className="text-xs text-text-muted">Memuat data admin...</p>
      </div>
    );
  }

  const stats = {
    totalRevenue: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.amount, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'paid').length,
    activeProducts: products.filter((p) => p.status === 'active').length,
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 bg-bg-card rounded-2xl border border-white/8">
        {SIDEBAR_ITEMS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-1 justify-center cursor-pointer',
                isActive
                  ? 'bg-linear-to-r from-brand-cyan to-primary-container text-bg-deep shadow-[0_0_16px_rgba(0,240,255,0.35)] scale-102'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-bg-deep' : 'text-text-dim')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { label: 'Total Omzet Selesai', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: '#00f0ff', sub: '+12% performa bulan ini' },
              { label: 'Pesanan Perlu Diproses', value: String(stats.pendingOrders), icon: AlertCircle, color: '#f59e0b', sub: 'Segera cek & verifikasi' },
              { label: 'Total Produk Terdaftar', value: String(products.length), icon: Package, color: '#10b981', sub: `${stats.activeProducts} Produk Aktif` },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className="p-6 rounded-2xl bg-bg-card border border-white/8 hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
                <div className="text-xs font-semibold mt-2 flex items-center gap-1" style={{ color }}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders Table Card */}
          <div className="p-6 rounded-2xl bg-bg-card border border-white/8 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-4">
              <div>
                <h2 className="font-heading font-bold text-lg text-white">Pesanan Terbaru</h2>
                <p className="text-xs text-text-muted">Aktivitas transaksi masuk terkini</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua ({orders.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-raised text-text-muted text-xs font-bold uppercase tracking-wider">
                    {['Order ID', 'Tipe', 'Pembeli', 'Produk', 'Total', 'Status'].map(h => (
                      <th key={h} className="p-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-white divide-y divide-white/5 font-medium">
                  {orders.slice(0, 5).map((order) => {
                    const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono text-brand-cyan font-bold">{order.id}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10">{order.type}</span>
                        </td>
                        <td className="p-3.5 font-semibold">{order.buyer}</td>
                        <td className="p-3.5 text-text-muted max-w-45 truncate">{order.product}</td>
                        <td className="p-3.5 font-bold text-primary-container whitespace-nowrap">{formatCurrency(order.amount)}</td>
                        <td className="p-3.5">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-3">
          {orders.length === 0 && (
            <div className="p-16 rounded-2xl bg-bg-card border border-white/8 flex flex-col items-center gap-3">
              <span className="text-5xl">📋</span>
              <p className="font-bold text-white">Belum ada pesanan masuk</p>
            </div>
          )}
          {orders.map((order) => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = st.icon;
            return (
              <div key={order.id} className="p-5 rounded-2xl bg-bg-card border border-white/8 hover:border-brand-cyan/40 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-brand-cyan">{order.id}</span>
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                        style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-text-muted">{order.type}</span>
                    </div>
                    <p className="text-sm font-bold text-white">{order.product}</p>
                    <p className="text-xs text-text-muted mt-1">
                      👤 {order.buyer} &middot; {order.dateFormatted}
                    </p>
                    <p className="text-sm font-black text-primary-container mt-1.5">{formatCurrency(order.amount)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order, 'approved')}
                          className="btn-cyber text-xs py-1.5 px-3"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      </>
                    )}
                    {order.status === 'paid' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order, 'approved')}
                          className="btn-cyber text-xs py-1.5 px-3"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Proses Pesanan
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order, 'rejected')}
                          className="btn-secondary text-xs py-1.5 px-3 text-red-400 hover:text-red-300"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Tolak
                        </button>
                      </>
                    )}
                    {order.status === 'approved' && (
                      <button
                        onClick={() => updateOrderStatus(order, 'completed')}
                        className="btn-cyber text-xs py-1.5 px-3"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesaikan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-white">Daftar Produk Toko</h2>
              <p className="text-xs text-text-muted">{products.length} total produk ({products.filter(p => p.status === 'active').length} aktif)</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-cyber text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-raised text-text-muted text-xs font-bold uppercase tracking-wider">
                    {['Produk', 'Game', 'Harga', 'Views', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="p-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-white divide-y divide-white/5 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 rounded-xl overflow-hidden shrink-0 bg-bg-raised">
                            {p.images[0] && <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />}
                          </div>
                          <span className="font-semibold text-white max-w-40 truncate">{p.title}</span>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-bold" style={{ color: p.game.color }}>
                        {p.game.icon} {p.game.name}
                      </td>
                      <td className="p-3.5 font-bold text-primary-container whitespace-nowrap">{formatCurrency(p.price)}</td>
                      <td className="p-3.5 text-text-muted whitespace-nowrap">{formatNumber(p.viewCount)}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all',
                            p.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          )}
                        >
                          {p.status === 'active' ? <><ToggleRight className="w-3.5 h-3.5" /> Aktif</> : <><ToggleLeft className="w-3.5 h-3.5" /> Nonaktif</>}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/products/${p.id}`} target="_blank" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white" title="Lihat">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => setEditProduct(p)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-brand-cyan" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteProduct(p)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-red-400" title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USERS */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-bg-card border border-white/8">
          <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-white">Daftar Pengguna</h2>
              <p className="text-xs text-text-muted">{users.length} akun terdaftar di sistem</p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {users.map(({ full_name, username, role, created_at, avatar_url }) => (
              <div key={username} className="flex items-center gap-4 py-3.5 hover:bg-white/5 px-3 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-bg-raised border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {avatar_url ? <img src={avatar_url} alt={full_name} className="w-full h-full object-cover" /> : <span>👤</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-white">{full_name || username}</p>
                    {role === 'admin' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">{username} &middot; Join {new Date(created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ProductModal mode="add" onClose={() => setShowAddModal(false)} onSuccess={fetchProducts} />
      )}
      {editProduct && (
        <ProductModal mode="edit" product={editProduct} onClose={() => setEditProduct(null)} onSuccess={fetchProducts} />
      )}
      {deleteProduct && (
        <DeleteConfirmModal productTitle={deleteProduct.title} onConfirm={handleDeleteProduct} onClose={() => setDeleteProduct(null)} />
      )}

    </div>
  );
}