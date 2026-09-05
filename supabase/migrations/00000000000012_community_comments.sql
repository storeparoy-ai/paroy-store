-- ============================================================================
-- Migration: balasan di Komunitas.
--
-- Halaman Komunitas menampilkan penghitung komentar sejak awal, tapi tidak
-- pernah ada tabelnya dan tidak ada cara membalas apa pun — ikon komentar itu
-- murni hiasan, dan angkanya selalu 0. Jadinya papan pengumuman satu arah,
-- bukan tempat mengobrol; persis yang dirasakan pengguna sebagai "hampa".
-- ============================================================================

create table if not exists public.community_comments (
  id         uuid primary key default gen_random_uuid(),
  -- ON DELETE CASCADE penting: sejak migrasi 11 admin bisa menghapus
  -- postingan, dan tanpa ini penghapusan itu akan ditolak Postgres begitu
  -- postingannya sudah punya balasan (foreign key violation) — bug yang sama
  -- persis dengan yang menimpa tombol hapus produk.
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  author_id  uuid references public.profiles(id) on delete set null,
  content    text not null,
  created_at timestamptz default timezone('utc'::text, now())
);

create index if not exists community_comments_post_id_idx
  on public.community_comments (post_id, created_at);

alter table public.community_comments enable row level security;

drop policy if exists "Comments are viewable by everyone." on public.community_comments;
create policy "Comments are viewable by everyone." on public.community_comments
  for select using (true);

drop policy if exists "Users can write comments." on public.community_comments;
create policy "Users can write comments." on public.community_comments
  for insert with check (auth.uid() = author_id);

-- Penulisnya sendiri boleh menarik kembali ucapannya; admin boleh membersihkan
-- spam. Tidak ada kebijakan UPDATE, alasannya sama seperti pada postingan:
-- menghapus itu moderasi, menyunting kalimat orang lain itu pemalsuan.
drop policy if exists "Authors and admins can delete comments." on public.community_comments;
create policy "Authors and admins can delete comments." on public.community_comments
  for delete using (auth.uid() = author_id or public.is_admin());


-- ---------------------------------------------------------------------------
-- Jaga agar community_posts.comments selalu sama dengan jumlah baris nyata.
--
-- Kolomnya sudah ada dan sudah dibaca halaman Komunitas, jadi lebih baik
-- dijaga trigger daripada dihitung ulang setiap pembacaan — dan karena
-- satu-satunya yang menulis kolom itu adalah trigger ini, angkanya tidak bisa
-- melenceng seperti flash_sales.sold dulu.
-- ---------------------------------------------------------------------------
create or replace function public.sync_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
       set comments = coalesce(comments, 0) + 1
     where id = new.post_id;
    return new;
  else
    update public.community_posts
       set comments = greatest(coalesce(comments, 0) - 1, 0)
     where id = old.post_id;
    return old;
  end if;
end;
$$;

drop trigger if exists community_comments_count on public.community_comments;
create trigger community_comments_count
  after insert or delete on public.community_comments
  for each row execute function public.sync_post_comment_count();

-- Selaraskan sekali untuk data yang sudah ada (semuanya akan jadi 0, karena
-- memang belum pernah ada balasan yang tersimpan).
update public.community_posts p
   set comments = (select count(*) from public.community_comments c where c.post_id = p.id);
