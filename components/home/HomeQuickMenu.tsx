import Link from 'next/link';
import { Zap, Clock3, TriangleAlert, ShoppingCart, Star, Gamepad2 } from 'lucide-react';

const MENU_ITEMS = [
  {
    href: '/products',
    label: 'Beli Akun',
    desc: 'Cari akun spek terlengkap',
    icon: ShoppingCart,
    color: 'var(--primary-400)',
    glow: 'rgba(245,158,11,0.12)',
    hoverBorder: 'rgba(245,158,11,0.5)',
    span: 2,
  },
  {
    href: '/topup',
    label: 'Top Up',
    desc: 'Harga terbaik, instant',
    icon: Zap,
    color: 'var(--error)',
    glow: 'rgba(239,68,68,0.12)',
    hoverBorder: 'rgba(239,68,68,0.5)',
    badge: '🔥 HOT',
    span: 2,
  },
  {
    href: '/rental',
    label: 'Rental Akun',
    desc: 'Sewa per jam / per hari',
    icon: Clock3,
    color: 'var(--info)',
    glow: 'rgba(59,130,246,0.1)',
    hoverBorder: 'rgba(59,130,246,0.4)',
    span: 1,
  },
  {
    href: '/flash-sales',
    label: 'Flash Sale',
    desc: 'Harga spesial terbatas',
    icon: Zap,
    color: 'var(--warning)',
    glow: 'rgba(245,158,11,0.1)',
    hoverBorder: 'rgba(245,158,11,0.4)',
    span: 1,
  },
  {
    href: '/rekber',
    label: 'RekBer',
    desc: 'Transaksi jadi aman',
    icon: TriangleAlert,
    color: 'var(--error)',
    glow: 'rgba(239,68,68,0.15)',
    hoverBorder: 'rgba(239,68,68,0.4)',
    span: 1,
  },
  {
    href: '/spin',
    label: 'Spin',
    desc: 'Menangkan hadiah seru',
    icon: Star,
    color: 'var(--accent-purple)',
    glow: 'rgba(214,95,243,0.1)',
    hoverBorder: 'rgba(214,95,243,0.4)',
    span: 1,
  },
  {
    href: '/sell',
    label: 'Jual Akun',
    desc: 'Jual akun harga terbaik',
    icon: Gamepad2,
    color: 'var(--success)',
    glow: 'rgba(34,197,94,0.1)',
    hoverBorder: 'rgba(34,197,94,0.4)',
    span: 2,
  },
];

export default function HomeQuickMenu() {
  return (
    <>
      {MENU_ITEMS.map(({ href, label, desc, icon: Icon, color, glow, hoverBorder, badge, span }) => (
        <Link
          key={href}
          href={href}
          className="glass group relative overflow-hidden p-3 transition-all hover:scale-[1.01] active:scale-[0.98]"
          style={{
            gridColumn: span === 2 ? 'span 2' : 'span 1',
          }}
        >
          {/* Glow bg */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ borderRadius: 'var(--bento-radius)' }}
          >
            <div
              className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
              style={{ background: glow,  }}
            />
          </div>

          <div className="relative flex items-center justify-between gap-2 h-full">
            <div className="min-w-0 flex flex-col gap-1">
              {badge && (
                <div
                  className="badge badge-hot self-start"
                  style={{ fontSize: '9px', marginBottom: '2px' }}
                >
                  {badge}
                </div>
              )}
              <h3
                className="font-bold font-heading leading-tight inline-flex items-center gap-1"
                style={{
                  fontSize: span === 2 ? '0.875rem' : '0.75rem',
                  color: 'var(--text-primary)',
                }}
              >
                {label}
              </h3>
              <p
                className="text-[10px] line-clamp-1 hidden sm:block"
                style={{ color: 'var(--text-muted)' }}
              >
                {desc}
              </p>
            </div>
            <div
              className="flex shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 group-active:scale-95"
              style={{
                width: span === 2 ? '40px' : '36px',
                height: span === 2 ? '40px' : '36px',
                color,
                background: `${color}22`,
              }}
            >
              <Icon
                className="transition-all"
                style={{ width: span === 2 ? '20px' : '16px', height: span === 2 ? '20px' : '16px' }}
                aria-hidden
              />
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}
