'use client';

import { useState } from 'react';
import { Bell, Package, Tag, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

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
    message: 'Pesanan akun MLBB Mythic Glory kamu telah selesai. Selamat bermain!',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    link: '/profile',
  },
  {
    id: '2',
    type: 'promo',
    title: 'Flash Sale Alert! ⚡',
    message: 'Flash Sale dimulai dalam 30 menit! Diskon hingga 70% untuk top up Diamond MLBB.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: false,
    link: '/flash-sales',
  },
  {
    id: '3',
    type: 'system',
    title: 'Selamat Datang di PAROY STORE',
    message: 'Terima kasih telah mendaftar. Lengkapi profil kamu untuk pengalaman berbelanja yang lebih baik.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: true,
    link: '/profile',
  },
  {
    id: '4',
    type: 'order',
    title: 'Pembayaran Diterima 💸',
    message: 'Pembayaran untuk pesanan Top Up Free Fire telah kami terima. Sedang diproses oleh admin.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    isRead: true,
  },
  {
    id: '5',
    type: 'community',
    title: 'Komentar Baru di Postinganmu',
    message: 'GamerPro_ID membalas komentar kamu di grup Komunitas MLBB.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    isRead: true,
    link: '/community',
  },
];

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  order:     { icon: Package,       color: 'var(--success)',     bg: 'rgba(34,197,94,0.12)' },
  promo:     { icon: Tag,           color: 'var(--warning)',     bg: 'rgba(245,158,11,0.12)' },
  system:    { icon: AlertCircle,   color: 'var(--info)',        bg: 'rgba(59,130,246,0.12)' },
  community: { icon: MessageCircle, color: 'var(--primary-400)', bg: 'rgba(245,158,11,0.12)' },
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
      <div className="pt-24 min-h-screen flex flex-col">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-bold font-heading text-xl flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                🔔 Notifikasi
                {unreadCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-400)', color: 'white' }}>
                    {unreadCount} Baru
                  </span>
                )}
              </h1>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium flex items-center gap-1.5 transition-colors"
                style={{ color: 'var(--primary-400)' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(['all', 'unread'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border"
                style={{
                  background: activeTab === tab ? 'rgba(245,158,11,0.12)' : 'var(--surface-card)',
                  borderColor: activeTab === tab ? 'rgba(245,158,11,0.4)' : 'var(--border-default)',
                  color: activeTab === tab ? 'var(--primary-400)' : 'var(--text-muted)',
                }}
              >
                {tab === 'all' ? 'Semua' : 'Belum Dibaca'}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex flex-col gap-2">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const config = TYPE_CONFIG[notif.type];
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={cn(
                      "glass-card p-4 transition-all relative overflow-hidden cursor-pointer",
                      !notif.isRead ? "border-l-4" : "opacity-75"
                    )}
                    style={{ 
                      borderLeftColor: !notif.isRead ? 'var(--primary-400)' : 'transparent',
                      background: !notif.isRead ? 'rgba(255,255,255,0.06)' : 'var(--surface-card)'
                    }}
                  >
                    {!notif.isRead && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ background: 'var(--primary-400)' }} />
                    )}
                    <div className="flex gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: config.bg, color: config.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 pr-4">
                        <p className={cn("text-sm mb-1", !notif.isRead ? "font-bold" : "font-semibold")} style={{ color: 'var(--text-primary)' }}>
                          {notif.title}
                        </p>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {notif.message}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-5xl">🔕</span>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Tidak ada notifikasi
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {activeTab === 'unread' ? 'Kamu sudah membaca semua notifikasi' : 'Kamu belum memiliki notifikasi'}
                </p>
              </div>
            )}
          </div>

        </div>
        <Footer />
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
