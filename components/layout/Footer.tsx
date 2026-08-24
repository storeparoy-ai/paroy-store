import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/products', label: 'Produk' },
  { href: '/flash-sales', label: 'Flash Sale' },
  { href: '/rental', label: 'Rental' },
  { href: '/community', label: 'Komunitas' },
  { href: '/help', label: 'Bantuan' },
  { href: '/rekber', label: 'RekBer' },
  { href: '/about', label: 'Tentang' },
  { href: '/privacy', label: 'Privasi' },
  { href: '/terms', label: 'Syarat' },
];

export default function Footer() {
  return (
    <footer
      className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0 mt-auto w-full"
      style={{
        borderTop: '1px solid var(--border-default)',
        background: 'var(--surface-pure)',
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-3 text-center sm:px-6 lg:gap-4 lg:py-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:text-left">
        <p className="text-[11px] lg:text-xs md:justify-self-start" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} PAROY STORE. Premium Gaming Platform.
        </p>

        <nav
          aria-label="Tautan situs"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 md:justify-self-center lg:gap-4"
        >
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[11px] lg:text-xs transition-colors hover:text-[var(--text-secondary)]"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <p
          className="text-[11px] lg:text-xs md:justify-self-end md:text-right"
          style={{ color: 'rgba(107,98,94,0.5)' }}
        >
          v1.0.0
        </p>
      </div>
    </footer>
  );
}
