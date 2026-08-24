'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-stack-lg bg-surface-container-lowest border-t border-white/10 flat no-shadows">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="col-span-1 md:col-span-1">
          <span className="text-headline-md font-headline-md font-black text-primary mb-4 block">PAROY STORE</span>
          <p className="text-body-md font-body-md text-on-surface-variant">© 2024 PAROY STORE. All Rights Reserved.</p>
        </div>
        <div className="col-span-1 md:col-span-3 flex flex-wrap gap-gutter justify-start md:justify-end items-start">
          <Link href="/terms" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100">
            Privacy Policy
          </Link>
          <Link href="/contact" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
