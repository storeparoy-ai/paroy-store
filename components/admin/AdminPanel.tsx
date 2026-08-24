'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  TrendingUp, ArrowUpRight, Eye, CheckCircle2, Clock,
  XCircle, Plus, ChevronRight, BarChart3, Settings,
  LogOut, AlertCircle, Loader2, Pencil, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import ProductModal from '@/components/admin/ProductModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:   { label: 'Menunggu', color: 'var(--warning)',     bg: 'rgba(245,158,11,0.12)',   icon: Clock },
  paid:      { label: 'Dibayar',  color: 'var(--info)',        bg: 'rgba(59,130,246,0.12)',   icon: AlertCircle },
  approved:  { label: 'Diproses', color: 'var(--primary-400)', bg: 'rgba(245,158,11,0.12)', icon: Package },
  completed: { label: 'Selesai',  color: 'var(--success)',     bg: 'rgba(34,197,94,0.12)',   icon: CheckCircle2 },
  rejected:  { label: 'Ditolak',  color: 'var(--error)',       bg: 'rgba(239,68,68,0.12)',   icon: XCircle },
};

type AdminTab = 'dashboard' | 'orders' | 'products' | 'users';

const SIDEBAR_ITEMS: { id: AdminTab; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'orders',    icon: ShoppingBag,     label: 'Pesanan' },
  { id: 'products',  icon: Package,         label: 'Produk' },
  { id: 'users',     icon: Users,           label: 'Pengguna' },
];

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    const fetchAdminData = async () => {
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
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*');
      if (usersData) setUsers(usersData);

      // Fetch Products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
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
          type: o.mode === 'rental' ? 'Rental' : 'Marketplace',
          buyer: o.profiles?.full_name || 'Unknown',
          product: o.products?.title || 'Unknown Product',
          amount: o.amount,
          status: o.status,
          date: o.created_at,
          table: 'orders'
        })));
      }
      if (topupData) {
        combined.push(...topupData.map(o => ({
          id: o.order_number,
          tableId: o.order_number,
          idField: 'order_number',
          type: 'Top Up',
          buyer: o.profiles?.full_name || 'Unknown',
          product: `Top Up ${o.game} - ${o.item_label}`,
          amount: o.amount,
          status: o.status,
          date: o.created_at,
          table: 'topup_orders'
        })));
      }
      if (rekberData) {
        combined.push(...rekberData.map(o => ({
          id: o.id.substring(0, 8),
          tableId: o.id,
          idField: 'id',
          type: 'RekBer',
          buyer: o.profiles?.full_name || 'Unknown',
          product: `RekBer: ${o.item_description}`,
          amount: Number(o.amount) + Number(o.fee),
          status: o.status,
          date: o.created_at,
          table: 'rekber_orders'
        })));
      }
      
      combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(combined.map(o => ({...o, dateFormatted: new Date(o.date).toLocaleString('id-ID')})));
      setLoading(false);
    };

    fetchAdminData();

    // Subscribe to new orders (Real-time Notification)
    const supabase = createClient();
    const channels = ['orders', 'topup_orders', 'rekber_orders'].map(table => 
      supabase.channel(`admin-${table}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload) => {
          fetchAdminData();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pesanan Baru Masuk! 🎉', {
              body: `Transaksi baru di ${table} sebesar Rp ${payload.new.amount}`,
            });
          }
        })
        .subscribe()
    );

    // Request Notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [router]);

  const updateOrderStatus = async (order: any, newStatus: string) => {
    const supabase = createClient();
    const { error } = await (supabase as any)
      .from(order.table)
      .update({ status: newStatus })
      .eq(order.idField, order.tableId);

    if (!error) {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: newStatus } : o));
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

  if (loading) { return ( <div className="flex flex-col items-center justify-center min-h-[300px] gap-4"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-400)' }} /></div> ); }

  const stats = {
    totalRevenue: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.amount, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'paid').length,
    activeProducts: products.filter((p) => p.status === 'active').length,
  };

  return (
    <>
      <div className="w-full">
      {/* Admin Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6">
        {SIDEBAR_ITEMS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-[var(--primary-500)] text-white shadow-lg'
                  : 'bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="w-full">{/* ===== DASHBOARD TAB ===== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 max-w-5xl">
              {/* Stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'var(--success)', up: '+12%' },
                  { label: 'Total Pesanan', value: String(stats.totalOrders), icon: ShoppingBag, color: 'var(--info)', up: '+5%' },
                  { label: 'Perlu Diproses', value: String(stats.pendingOrders), icon: Clock, color: 'var(--warning)', up: '' },
                  { label: 'Produk Aktif', value: String(stats.activeProducts), icon: Package, color: 'var(--primary-400)', up: '' },
                ].map(({ label, value, icon: Icon, color, up }) => (
                  <div key={label} className="glass-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}22` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      {up && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: 'var(--success)' }}>
                          <ArrowUpRight className="w-3 h-3" />{up}
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-black font-heading" style={{ color }}>{value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="glass-card overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                  <span className="section-label text-sm">Pesanan Terbaru</span>
                  <button onClick={() => setActiveTab('orders')} className="text-xs flex items-center gap-1" style={{ color: 'var(--primary-400)' }}>
                    Lihat Semua <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'var(--surface-raised)' }}>
                        {['Order ID', 'Pembeli', 'Produk', 'Jumlah', 'Status'].map((h) => (
                          <th key={h} className="p-3 text-left font-semibold" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => {
                        const st = STATUS_CONFIG[order.status];
                        return (
                          <tr key={order.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <td className="p-3 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{order.id}</td>
                            <td className="p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{order.buyer}</td>
                            <td className="p-3 max-w-[180px]">
                              <span className="block truncate" style={{ color: 'var(--text-secondary)' }}>{order.product}</span>
                            </td>
                            <td className="p-3 font-bold whitespace-nowrap" style={{ color: 'var(--primary-400)' }}>{formatCurrency(order.amount)}</td>
                            <td className="p-3">
                              <span className="badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}>
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

              {/* Top products */}
              <div className="glass-card overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                  <span className="section-label text-sm">Produk Populer</span>
                </div>
                <div className="divide-y" style={{ '--tw-divide-color': 'var(--border-subtle)' } as React.CSSProperties}>
                  {products.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-3">
                      <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--surface-raised)]">
                        <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.game.icon} {p.game.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold" style={{ color: 'var(--primary-400)' }}>{formatCurrency(p.price)}</p>
                        <p className="text-[10px] flex items-center gap-0.5 justify-end" style={{ color: 'var(--text-muted)' }}>
                          <Eye className="w-2.5 h-2.5" />{formatNumber(p.viewCount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== ORDERS TAB ===== */}
          {activeTab === 'orders' && (
            <div className="max-w-5xl space-y-3">
              {orders.map((order) => {
                const st = STATUS_CONFIG[order.status];
                const StatusIcon = st.icon;
                return (
                  <div key={order.id} className="glass-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{order.id}</span>
                          <span className="badge flex items-center gap-1" style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {st.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{order.product}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          👤 {order.buyer} · {order.dateFormatted}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="badge" style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                            {order.type}
                          </span>
                        </div>
                        <p className="text-sm font-black mt-1" style={{ color: 'var(--primary-400)' }}>{formatCurrency(order.amount)}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order, 'paid')}
                              className="btn-secondary text-xs py-1.5 px-3"
                            >
                              <Eye className="w-3 h-3" /> Cek Bukti
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order, 'approved')}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                          </>
                        )}
                        {order.status === 'paid' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order, 'approved')}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order, 'rejected')}
                              className="text-xs py-1.5 px-3 rounded-lg font-semibold transition-all"
                              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.25)' }}
                            >
                              <XCircle className="w-3 h-3 inline mr-1" /> Tolak
                            </button>
                          </>
                        )}
                        {order.status === 'approved' && (
                          <button
                            onClick={() => updateOrderStatus(order, 'completed')}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Selesaikan
                          </button>
                        )}
                        {(order.status === 'completed' || order.status === 'rejected') && (
                          <span className="text-xs py-1.5 px-3 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--surface-raised)' }}>
                            {order.status === 'completed' ? '✅ Selesai' : '❌ Ditolak'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== PRODUCTS TAB ===== */}
          {activeTab === 'products' && (
            <div className="max-w-5xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold font-heading text-base" style={{ color: 'var(--text-primary)' }}>
                    🎮 Manajemen Produk
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {products.length} produk · {products.filter(p => p.status === 'active').length} aktif
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Produk
                </button>
              </div>

              {products.length === 0 ? (
                <div className="glass-card flex flex-col items-center py-16 gap-3">
                  <span className="text-5xl">📦</span>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Belum ada produk</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Klik "Tambah Produk" untuk mulai berjualan</p>
                  <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm mt-2">
                    <Plus className="w-4 h-4" /> Tambah Produk Pertama
                  </button>
                </div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: 'var(--surface-raised)' }}>
                          {['Produk', 'Game', 'Harga', 'Views', 'Status', 'Aksi'].map((h) => (
                            <th key={h} className="p-3 text-left font-semibold" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="relative w-8 h-10 rounded-lg overflow-hidden shrink-0 bg-[var(--surface-raised)]">
                                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="32px" />
                                </div>
                                <span className="line-clamp-2 max-w-[160px]" style={{ color: 'var(--text-primary)' }}>{p.title}</span>
                              </div>
                            </td>
                            <td className="p-3" style={{ color: p.game.color, whiteSpace: 'nowrap' }}>
                              {p.game.icon} {p.game.name}
                            </td>
                            <td className="p-3 font-bold whitespace-nowrap" style={{ color: 'var(--primary-400)' }}>
                              {formatCurrency(p.price)}
                            </td>
                            <td className="p-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                              {formatNumber(p.viewCount)}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleStatus(p)}
                                className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all"
                                style={
                                  p.status === 'active'
                                    ? { background: 'rgba(34,197,94,0.12)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.2)' }
                                    : { background: 'rgba(239,68,68,0.12)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }
                                }
                              >
                                {p.status === 'active'
                                  ? <><ToggleRight className="w-3 h-3" /> Aktif</>
                                  : <><ToggleLeft className="w-3 h-3" /> Nonaktif</>
                                }
                              </button>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Link
                                  href={`/products/${p.id}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                                  style={{ color: 'var(--text-muted)' }}
                                  title="Lihat di toko"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  onClick={() => setEditProduct(p)}
                                  className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(245,158,11,0.1)]"
                                  style={{ color: 'var(--primary-400)' }}
                                  title="Edit produk"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteProduct(p)}
                                  className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(239,68,68,0.1)]"
                                  style={{ color: 'var(--error)' }}
                                  title="Hapus produk"
                                >
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
              )}
            </div>
          )}

          {/* ===== USERS TAB ===== */}
          {activeTab === 'users' && (
            <div className="max-w-3xl">
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                  <span className="section-label text-sm">Pengguna Terdaftar ({users.length})</span>
                </div>
                {users.map(({ full_name, username, role, created_at, avatar_url }) => (
                  <div key={username} className="flex items-center gap-3 p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: 'var(--surface-raised)' }}>
                      {avatar_url || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{full_name || username}</p>
                        {role === 'admin' && (
                          <span className="badge text-[9px]" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)' }}>Admin</span>
                        )}
                      </div>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{username} · Join {new Date(created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODALS ===== */}
      {showAddModal && (
        <ProductModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchProducts}
        />
      )}
      {editProduct && (
        <ProductModal
          mode="edit"
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSuccess={fetchProducts}
        />
      )}
      {deleteProduct && (
        <DeleteConfirmModal
          productTitle={deleteProduct.title}
          onConfirm={handleDeleteProduct}
          onClose={() => setDeleteProduct(null)}
        />
      )}
    </>
  );
}


