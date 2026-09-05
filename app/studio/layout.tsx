import React from 'react';
import type { Metadata } from 'next';

/** Etalase komponen desain internal — berguna saat mengerjakan tampilan,
 * tapi tidak untuk pengunjung dan jelas bukan untuk mesin pencari. */
export const metadata: Metadata = {
  title: 'Design Studio',
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
