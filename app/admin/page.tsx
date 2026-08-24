'use client';

export const dynamic = 'force-dynamic';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import AdminPanel from '@/components/admin/AdminPanel';

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-8 sm:py-10 pb-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto">
        <div className="mb-6">
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
            Dashboard <span className="text-gradient-cyan">Administrator</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Kelola transaksi, stok akun, dan pengguna Paroy Store secara real-time</p>
        </div>
        <AdminPanel />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
