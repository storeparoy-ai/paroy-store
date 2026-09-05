-- ============================================================================
-- Migration: pengaturan notifikasi (Telegram) yang bisa diatur dari dashboard
--
-- Konteks: token bot dan chat ID awalnya hidup sebagai environment variable
-- di Vercel, yang berarti setiap kali ganti bot atau memindahkan notifikasi
-- ke grup lain harus buka dashboard Vercel dan menunggu deploy ulang.
-- Sekarang dua-duanya ada di Admin → Notifikasi.
--
-- Sama seperti payment_gateway_settings (migrasi 8) dan TIDAK seperti tabel
-- CMS lainnya: tabel ini menyimpan rahasia, jadi hanya admin yang boleh
-- membacanya. Token bot Telegram itu setara kata sandi — siapa pun yang
-- memilikinya bisa mengirim pesan atas nama bot dan membaca seluruh riwayat
-- chat yang bot itu ikuti.
-- ============================================================================

create table if not exists public.notification_settings (
  id                  integer primary key default 1,
  provider            text not null default 'telegram',
  bot_token           text,
  chat_id             text,
  is_enabled          boolean not null default true,
  notify_new_order    boolean not null default true,
  notify_proof_upload boolean not null default true,
  updated_at          timestamptz default timezone('utc'::text, now()),
  constraint notification_settings_singleton check (id = 1)
);

alter table public.notification_settings enable row level security;

drop policy if exists "Only admins can view notification settings." on public.notification_settings;
create policy "Only admins can view notification settings." on public.notification_settings
  for select using (public.is_admin());

drop policy if exists "Only admins can insert notification settings." on public.notification_settings;
create policy "Only admins can insert notification settings." on public.notification_settings
  for insert with check (public.is_admin());

drop policy if exists "Only admins can update notification settings." on public.notification_settings;
create policy "Only admins can update notification settings." on public.notification_settings
  for update using (public.is_admin());

insert into public.notification_settings (id, provider, is_enabled)
values (1, 'telegram', true)
on conflict (id) do nothing;

-- CATATAN PENTING soal cara aplikasi membaca tabel ini.
--
-- Pesanan dibuat oleh pembeli tamu, yang di mata Postgres adalah `anon` — dan
-- `anon` sengaja tidak boleh membaca tabel ini. Jadi server Next.js membacanya
-- dengan SUPABASE_SERVICE_ROLE_KEY (lihat utils/supabase/service.ts).
--
-- Yang TIDAK boleh dilakukan, dan sempat dipertimbangkan lalu dibuang: bikin
-- fungsi SECURITY DEFINER yang mengembalikan token ini ke `anon`. Fungsi
-- seperti itu bisa dipanggil siapa saja yang punya kunci anon — dan kunci anon
-- memang ada di dalam browser setiap pengunjung — jadi itu sama saja dengan
-- menempelkan token bot di halaman muka situs.
--
-- Tombol "Kirim Tes" di dashboard tidak butuh service role key: admin membaca
-- tabel ini sebagai dirinya sendiri lewat RLS di atas. Yang butuh service role
-- key hanya notifikasi otomatis dari pesanan tamu.
