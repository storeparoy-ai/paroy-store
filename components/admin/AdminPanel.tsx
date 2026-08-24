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
  }, [router]);

  useEffect(() => {
    fetchAdminData();

    // Subscribe to new orders (Real-time Notification)
    const supabase = createClient();
    const channels = ['orders', 'topup_orders', 'rekber_orders'].map(table => 
      supabase.channel(`admin-${table}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload) => {
          fetchAdminData();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pesanan Baru Masuk!', {
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
  }, [fetchAdminData]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#00c896]" />
        <p className="text-xs text-on-surface-variant">Memuat data admin...</p>
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
    <>
      <div className="w-full">
        {/* Admin Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 p-1 bg-surface-container-low rounded-xl border border-white/5">
          {SIDEBAR_ITEMS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-label-md font-label-md whitespace-nowrap transition-all duration-200 flex-1 justify-center',
                  activeTab === tab.id
                    ? 'bg-[#00c896] text-black shadow-[0_0_10px_rgba(0,200,150,0.3)]'
                    : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-stack-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {[
                { label: 'Total Pendapatan', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: '#00c896', sub: '+12% dari bulan lalu' },
                { label: 'Pesanan Pending', value: String(stats.pendingOrders), icon: AlertCircle, color: '#ffb4ab', sub: 'Perlu diproses segera' },
                { label: 'Total Produk', value: String(products.length), icon: Package, color: '#00c896', sub: `${stats.activeProducts} Aktif` },
              ].map(({ label, value, icon: Icon, color, sub }) => (
                <div key={label} className="card-level-1 rounded-xl p-gutter card-hover transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-on-surface-variant text-label-md font-label-md">{label}</div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${color}22` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                  </div>
                  <div className="text-headline-lg font-headline-lg text-on-surface">{value}</div>
                  <div className="text-body-md mt-2 flex items-center gap-1" style={{ color }}>
                    <ArrowUpRight className="w-4 h-4" />{sub}
                  </div>
                </div>
              ))}
            </div>

            <div className="card-level-1 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-headline-md font-headline-md text-on-surface">Pesanan Terbaru</h2>
                <button onClick={() => setActiveTab('orders')} className="text-[#00c896] text-label-md hover:underline flex items-center gap-1">
                  Lihat Semua <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high text-on-surface-variant text-label-md border-b border-white/10">
                      {['Order ID','Pembeli','Produk','Jumlah','Status'].map(h => (
                        <th key={h} className="p-4 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-body-md text-on-surface divide-y divide-white/5">
                    {orders.slice(0, 5).map((order) => {
                      const st = STATUS_CONFIG[order.status];
                      const scMap: Record<string,{bg:string;text:string;border:string}> = {
                        pending:   {bg:'rgba(245,158,11,0.1)',text:'#fbbf24',border:'rgba(245,158,11,0.2)'},
                        paid:      {bg:'rgba(59,130,246,0.1)',text:'#60a5fa',border:'rgba(59,130,246,0.2)'},
                        approved:  {bg:'rgba(0,200,150,0.1)',text:'#00c896',border:'rgba(0,200,150,0.2)'},
                        completed: {bg:'rgba(34,197,94,0.1)',text:'#4ade80',border:'rgba(34,197,94,0.2)'},
                        rejected:  {bg:'rgba(239,68,68,0.1)',text:'#f87171',border:'rgba(239,68,68,0.2)'},
                      };
                      const sc = scMap[order.status] ?? scMap.pending;
                      return (
                        <tr key={order.id} className="hover:bg-surface-container-highest/50 transition-colors">
                          <td className="p-4 font-mono text-[#3adfab] text-sm">{order.id}</td>
                          <td className="p-4 font-semibold">{order.buyer}</td>
                          <td className="p-4 text-on-surface-variant max-w-[180px]"><span className="block truncate">{order.product}</span></td>
                          <td className="p-4 font-bold text-[#00c896] whitespace-nowrap">{formatCurrency(order.amount)}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                              style={{background:sc.bg,color:sc.text,borderColor:sc.border}}>
                              {st?.label || order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-level-1 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-headline-md font-headline-md text-on-surface">Produk Populer</h2>
              </div>
              <div className="divide-y divide-white/5">
                {products.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-surface-container-highest/30 transition-colors">
                    <span className="text-on-surface-variant font-bold w-5 text-center text-sm">#{i+1}</span>
                    <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
                      {p.images[0] && <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{p.title}</p>
                      <p className="text-xs text-on-surface-variant">{p.game.icon} {p.game.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#00c896]">{formatCurrency(p.price)}</p>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 justify-end"><Eye className="w-3 h-3" />{formatNumber(p.viewCount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-3">
            {orders.length === 0 && (
              <div className="card-level-1 rounded-xl flex flex-col items-center py-16 gap-3">
                <span className="text-5xl">&#x1F4CB;</span>
                <p className="font-semibold text-on-surface">Belum ada pesanan</p>
              </div>
            )}
            {orders.map((order) => {
              const st = STATUS_CONFIG[order.status];
              const StatusIcon = st ? st.icon : Clock;
              const scMap: Record<string,{bg:string;text:string;border:string}> = {
                pending:   {bg:'rgba(245,158,11,0.1)',text:'#fbbf24',border:'rgba(245,158,11,0.2)'},
                paid:      {bg:'rgba(59,130,246,0.1)',text:'#60a5fa',border:'rgba(59,130,246,0.2)'},
                approved:  {bg:'rgba(0,200,150,0.1)',text:'#00c896',border:'rgba(0,200,150,0.2)'},
                completed: {bg:'rgba(34,197,94,0.1)',text:'#4ade80',border:'rgba(34,197,94,0.2)'},
                rejected:  {bg:'rgba(239,68,68,0.1)',text:'#f87171',border:'rgba(239,68,68,0.2)'},
              };
              const sc = scMap[order.status] ?? scMap.pending;
              return (
                <div key={order.id} className="card-level-1 rounded-xl p-4 hover:border-[#00c896]/30 transition-all duration-200">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#3adfab]">{order.id}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                          style={{background:sc.bg,color:sc.text,borderColor:sc.border}}>
                          <StatusIcon className="w-3 h-3" />{st?.label || order.status}
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-surface-container-high text-on-surface-variant border border-white/10">{order.type}</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface">{order.product}</p>
                      <p className="text-xs mt-0.5 text-on-surface-variant">&#x1F464; {order.buyer} &middot; {order.dateFormatted}</p>
                      <p className="text-sm font-black mt-1 text-[#00c896]">{formatCurrency(order.amount)}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {order.status === 'pending' && (
                        <>
                          <button onClick={() => updateOrderStatus(order, 'paid')}
                            className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-semibold border border-white/10 text-on-surface-variant hover:bg-surface-variant transition-all">
                            <Eye className="w-3 h-3" /> Cek Bukti
                          </button>
                          <button onClick={() => updateOrderStatus(order, 'approved')}
                            className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-semibold bg-[#00c896] text-black hover:bg-[#3adfab] transition-all">
                            <CheckCircle2 className="w-3 h-3" /> Approve
                          </button>
                        </>
                      )}
                      {order.status === 'paid' && (
                        <>
                          <button onClick={() => updateOrderStatus(order, 'approved')}
                            className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-semibold bg-[#00c896] text-black hover:bg-[#3adfab] transition-all">
                            <CheckCircle2 className="w-3 h-3" /> Approve
                          </button>
                          <button onClick={() => updateOrderStatus(order, 'rejected')}
                            className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-semibold transition-all"
                            style={{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.25)'}}>
                            <XCircle className="w-3 h-3" /> Tolak
                          </button>
                        </>
                      )}
                      {order.status === 'approved' && (
                        <button onClick={() => updateOrderStatus(order, 'completed')}
                          className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-semibold bg-[#00c896] text-black hover:bg-[#3adfab] transition-all">
                          <CheckCircle2 className="w-3 h-3" /> Selesaikan
                        </button>
                      )}
                      {(order.status === 'completed' || order.status === 'rejected') && (
                        <span className="text-xs py-1.5 px-3 rounded-lg bg-surface-container text-on-surface-variant">
                          {order.status === 'completed' ? 'Selesai' : 'Ditolak'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-base text-on-surface">Manajemen Produk</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{products.length} produk &middot; {products.filter(p => p.status === 'active').length} aktif</p>
              </div>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-[#00c896] text-black font-bold text-label-md px-4 py-2 rounded-lg hover:bg-[#3adfab] transition-colors">
                <Plus className="w-4 h-4" /> Tambah Produk
              </button>
            </div>
            {products.length === 0 ? (
              <div className="card-level-1 rounded-xl flex flex-col items-center py-16 gap-3">
                <span className="text-5xl">&#x1F4E6;</span>
                <p className="font-semibold text-on-surface">Belum ada produk</p>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#00c896] text-black font-bold px-4 py-2 rounded-lg mt-2">
                  <Plus className="w-4 h-4" /> Tambah Produk Pertama
                </button>
              </div>
            ) : (
              <div className="card-level-1 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-high text-on-surface-variant text-label-md border-b border-white/10">
                        {['Produk','Game','Harga','Views','Status','Aksi'].map(h => (
                          <th key={h} className="p-4 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-container-highest/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-9 h-11 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
                                {p.images[0] && <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />}
                              </div>
                              <span className="text-sm font-semibold text-on-surface line-clamp-2 max-w-[160px]">{p.title}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm whitespace-nowrap" style={{color:p.game.color}}>{p.game.icon} {p.game.name}</td>
                          <td className="p-4 text-sm font-bold text-[#00c896] whitespace-nowrap">{formatCurrency(p.price)}</td>
                          <td className="p-4 text-sm text-on-surface-variant whitespace-nowrap">{formatNumber(p.viewCount)}</td>
                          <td className="p-4">
                            <button onClick={() => handleToggleStatus(p)}
                              className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-all border"
                              style={p.status === 'active'
                                ? {background:'rgba(34,197,94,0.1)',color:'#4ade80',borderColor:'rgba(34,197,94,0.2)'}
                                : {background:'rgba(239,68,68,0.1)',color:'#f87171',borderColor:'rgba(239,68,68,0.2)'}}>
                              {p.status === 'active' ? <><ToggleRight className="w-3 h-3" /> Aktif</> : <><ToggleLeft className="w-3 h-3" /> Nonaktif</>}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Link href={`/products/${p.id}`} target="_blank"
                                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" title="Lihat di toko">
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button onClick={() => setEditProduct(p)}
                                className="p-1.5 rounded-lg text-[#00c896] hover:bg-[#00c896]/10 transition-colors" title="Edit produk">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setDeleteProduct(p)}
                                className="p-1.5 rounded-lg text-[#f87171] hover:bg-red-500/10 transition-colors" title="Hapus produk">
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

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="card-level-1 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-headline-md font-headline-md text-on-surface">Pengguna Terdaftar</h2>
              <span className="bg-surface-container-high text-on-surface-variant text-label-md px-3 py-1 rounded-full border border-white/10">{users.length} total</span>
            </div>
            <div className="divide-y divide-white/5">
              {users.map(({ full_name, username, role, created_at, avatar_url }) => (
                <div key={username} className="flex items-center gap-4 p-4 hover:bg-surface-container-highest/30 transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 bg-surface-container-high border border-white/10">
                    {avatar_url ? <img src={avatar_url} alt={full_name} className="w-full h-full object-cover rounded-full" /> : <span>&#x1F464;</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-on-surface">{full_name || username}</p>
                      {role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#00c896]/10 text-[#00c896] border border-[#00c896]/20">Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant">{username} &middot; Join {new Date(created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAddModal && (
        <ProductModal mode="add" onClose={() => setShowAddModal(false)} onSuccess={fetchProducts} />
      )}
      {editProduct && (
        <ProductModal mode="edit" product={editProduct} onClose={() => setEditProduct(null)} onSuccess={fetchProducts} />
      )}
      {deleteProduct && (
        <DeleteConfirmModal productTitle={deleteProduct.title} onConfirm={handleDeleteProduct} onClose={() => setDeleteProduct(null)} />
      )}
    </>
  );
}