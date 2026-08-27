'use client';

import { useState } from 'react';
import { Bell, Package, Tag, MessageCircle, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

type NotificationType = 'order' | 'promo' | 'system' | 'community';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  link?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Pesanan Selesai 🎉',
    message: 'Pesanan akun MLBB Mythic Glory kamu telah selesai dikirim. Selamat bermain dan terima kasih telah bertransaksi di Paroy Store!',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    link: '/profile',
  },
  {
    id: '2',
    type: 'promo',
    title: 'Flash Sale Alert! ⚡',
    message: 'Flash Sale kilat telah dimulai! Dapatkan diskon hingga 70% untuk top up Diamond MLBB dan Akun Sultan.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: false,
    link: '/flash-sales',
  },
  {
    id: '3',
    type: 'system',
    title: 'Selamat Datang di PAROY STORE 🚀',
    message: 'Terima kasih telah mendaftar. Lengkapi nomor WhatsApp dan verifikasi profil kamu untuk transaksi rekber yang lebih aman.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: true,
    link: '/profile',
  },
  {
    id: '4',
    type: 'order',
    title: 'Pembayaran Diterima 💸',
    message: 'Pembayaran untuk pesanan Top Up Free Fire 1450 Diamond telah kami verifikasi. Item berhasil dikirim otomatis.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    isRead: true,
  },
  {
    id: '5',
    type: 'community',
    title: 'Komentar Baru di Komunitas 💬',
    message: 'GamerPro_ID membalas postingan kamu di grup Komunitas Turnamen MLBB Paroy Store.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    isRead: true,
    link: '/community',
  },
];

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; color: string; bg: string; badge: string }> = {
  order:     { icon: Package,       color: '#00c896', bg: 'rgba(0,200,150,0.12)', badge: 'Pesanan' },
  promo:     { icon: Tag,           color: '#ff6a00', bg: 'rgba(255,106,0,0.12)', badge: 'Promo' },
  system:    { icon: AlertCircle,   color: '#00f0ff', bg: 'rgba(0,240,255,0.12)', badge: 'Sistem' },
  community: { icon: MessageCircle, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', badge: 'Komunitas' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <>
      <Header />

      <main className="min-h-screen py-10 sm:py-14 pb-36 px-4 w-full flex justify-center">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          
          {/* Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D121F] border border-white/8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 flex items-center justify-center text-brand-cyan shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-heading font-black text-2xl text-white tracking-tight flex items-center gap-2.5">
                  Notifikasi
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-cyan text-black shadow-xs">
                      {unreadCount} Baru
                    </span>
                  )}
                </h1>
                <p className="text-xs text-text-muted mt-0.5">
                  Pemberitahuan transaksi, promo flash sale, dan update akun kamu
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tandai semua dibaca</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                activeTab === 'all'
                  ? 'bg-white/10 text-white border-white/20 shadow-xs font-black'
                  : 'bg-[#0D121F] text-text-muted border-white/6 hover:text-white hover:border-white/15'
              )}
            >
              Semua Notifikasi ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                activeTab === 'unread'
                  ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30 shadow-xs font-black'
                  : 'bg-[#0D121F] text-text-muted border-white/6 hover:text-white hover:border-white/15'
              )}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="flex flex-col gap-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const config = TYPE_CONFIG[notif.type];
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={cn(
                      'relative p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer shadow-md flex items-start gap-4',
                      !notif.isRead
                        ? 'bg-[#111728] border-brand-cyan/30 hover:border-brand-cyan/50'
                        : 'bg-[#0D121F] border-white/8 hover:border-white/15 opacity-80 hover:opacity-100'
                    )}
                  >
                    {/* Unread dot indicator */}
                    {!notif.isRead && (
                      <span className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
                    )}

                    {/* Notification Type Icon */}
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{ background: config.bg, color: config.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md"
                          style={{ background: config.bg, color: config.color }}
                        >
                          {config.badge}
                        </span>
                        <span className="text-[10px] text-text-dim">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <h3 className={cn('text-sm font-heading text-white leading-snug', !notif.isRead ? 'font-black' : 'font-bold')}>
                        {notif.title}
                      </h3>

                      <p className="text-xs text-text-muted leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.link && (
                        <div className="pt-1">
                          <Link 
                            href={notif.link}
                            className="text-xs font-bold text-brand-cyan hover:underline inline-flex items-center gap-1"
                          >
                            <span>Lihat Selengkapnya &rarr;</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 rounded-3xl bg-[#0D121F] border border-white/8 text-center flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">🔕</span>
                <h3 className="font-heading font-black text-lg text-white">Tidak Ada Notifikasi</h3>
                <p className="text-xs text-text-muted max-w-sm">
                  {activeTab === 'unread' 
                    ? 'Bagus! Kamu sudah membaca semua notifikasi yang ada.' 
                    : 'Belum ada notifikasi baru untuk akun kamu.'}
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
