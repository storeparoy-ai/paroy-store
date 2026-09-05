-- ============================================================================
-- Migration: umpan aktivitas terbaru yang benar-benar terjadi
--
-- Beranda punya kartu bertuliskan "LIVE" yang menampilkan nama dan pembelian
-- karangan dari lib/mock-data.ts, berputar tiap 3,2 detik. Itu klaim palsu
-- paling telanjang di seluruh situs: label "Live" menyatakan secara harfiah
-- bahwa yang tampil sedang terjadi.
--
-- Diganti dengan data sungguhan. Selama belum ada transaksi selesai, kartunya
-- tidak muncul sama sekali — beranda kehilangan satu elemen untuk sementara,
-- lalu mendapatkannya kembali dengan sendirinya begitu penjualan berjalan.
--
-- Dua keputusan soal privasi:
--
--   1. Hanya pesanan yang sudah DIBAYAR atau SELESAI. Pesanan 'pending' cuma
--      berarti seseorang mengisi formulir; menampilkannya sebagai aktivitas
--      akan mengiklankan transaksi yang mungkin tidak pernah terjadi.
--
--   2. Nama disamarkan jadi "Rizky A." di dalam fungsi ini, bukan di aplikasi.
--      Nama lengkap pembeli tidak pernah meninggalkan database, jadi tidak ada
--      cara memaksanya keluar lewat REST. Top up tidak menyimpan nama sama
--      sekali, jadi barisnya memang tanpa nama.
-- ============================================================================

create or replace function public.get_recent_activity(p_limit integer default 8)
returns table (
  actor      text,
  action     text,
  item_label text,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  with masked as (
    select
      -- "Rizky Ananda" -> "Rizky A." ; "Rizky" -> "Rizky"
      case
        when coalesce(o.buyer_name, '') = '' then null
        when split_part(o.buyer_name, ' ', 2) = '' then split_part(o.buyer_name, ' ', 1)
        else split_part(o.buyer_name, ' ', 1) || ' ' || left(split_part(o.buyer_name, ' ', 2), 1) || '.'
      end as actor,
      case when o.mode = 'rental' then 'menyewa' else 'membeli' end::text as action,
      coalesce(p.title, 'akun game') as item_label,
      o.created_at
    from public.orders o
    left join public.products p on p.id = o.product_id
    where o.status in ('paid', 'completed')

    union all

    select null::text,
           'top up'::text,
           t.game || ' ' || t.item_label,
           t.created_at
    from public.topup_orders t
    where t.status in ('paid', 'completed')

    union all

    select
      case
        when coalesce(r.buyer_name, '') = '' then null
        when split_part(r.buyer_name, ' ', 2) = '' then split_part(r.buyer_name, ' ', 1)
        else split_part(r.buyer_name, ' ', 1) || ' ' || left(split_part(r.buyer_name, ' ', 2), 1) || '.'
      end,
      'mengajukan rekber'::text,
      r.item_description,
      r.created_at
    from public.rekber_orders r
    where r.status in ('paid', 'completed')
  )
  select m.actor, m.action, m.item_label, m.created_at
  from masked m
  order by m.created_at desc
  limit least(greatest(coalesce(p_limit, 8), 1), 20);
$$;

grant execute on function public.get_recent_activity(integer) to anon, authenticated;
