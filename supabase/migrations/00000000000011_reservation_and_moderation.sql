-- ============================================================================
-- Migration: tiga bug dari audit 2026-09-04.
--
--   BUG-03  Satu akun bisa dipesan dua orang sekaligus (tidak ada penguncian).
--   BUG-05  Postingan komunitas tidak bisa dihapus siapa pun, termasuk admin.
--   BUG-06  Sisa stok flash sale tidak pernah berkurang.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- BUG-05. Admin boleh menghapus postingan komunitas.
--
-- Tabel community_posts hanya pernah diberi kebijakan SELECT dan INSERT
-- (migrasi 00), jadi begitu ada spam atau penipuan di halaman Komunitas,
-- satu-satunya cara membersihkannya adalah lewat SQL Editor. Kebijakan UPDATE
-- sengaja TETAP tidak diberikan: isi postingan orang lain tidak boleh bisa
-- diubah oleh siapa pun, termasuk admin — menghapus itu moderasi, menyunting
-- diam-diam itu pemalsuan.
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can delete community posts." on public.community_posts;
create policy "Admins can delete community posts." on public.community_posts
  for delete using (public.is_admin());


-- ---------------------------------------------------------------------------
-- BUG-03. Kunci produk begitu dipesan.
--
-- Sebelumnya tidak ada satu pun kode yang mengubah products.status saat
-- pesanan masuk, jadi akun yang sama — barang tunggal, tidak ada stok kedua —
-- bisa dipesan dan dibayar dua orang sekaligus, dan admin baru sadar setelah
-- kedua uangnya masuk.
--
-- Perhatikan `for update` pada pembacaan produk: itu mengunci baris tersebut
-- sampai transaksi selesai. Tanpanya, dua permintaan yang datang bersamaan
-- bisa sama-sama lolos pemeriksaan status 'active' sebelum salah satunya
-- sempat menulis — persis lomba yang ingin dicegah di sini.
-- ---------------------------------------------------------------------------
create or replace function public.create_guest_order(
  p_buyer_name     text,
  p_buyer_whatsapp text,
  p_product_id     uuid,
  p_payment_method text,
  p_mode           text default 'buy',
  p_note           text default null,
  p_rental_unit    text default null,
  p_rental_qty     integer default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product      public.products%rowtype;
  v_mode         text := coalesce(p_mode, 'buy');
  v_amount       numeric;
  v_rate         numeric;
  v_max_qty      integer;
  v_order_number text;
begin
  select * into v_product from public.products where id = p_product_id for update;

  if not found then
    raise exception 'Produk tidak ditemukan.' using errcode = '22023';
  end if;

  if coalesce(v_product.status, '') <> 'active' then
    raise exception 'Akun ini sudah dipesan orang lain atau sedang tidak tersedia.'
      using errcode = '22023';
  end if;

  if v_mode = 'rental' then
    if not coalesce(v_product.can_rental, false) then
      raise exception 'Produk ini tidak disewakan.' using errcode = '22023';
    end if;

    if p_rental_unit not in ('hourly', 'daily') then
      raise exception 'Satuan sewa tidak valid.' using errcode = '22023';
    end if;

    v_rate    := case when p_rental_unit = 'hourly'
                      then v_product.rental_price_hourly
                      else v_product.rental_price_daily end;
    v_max_qty := case when p_rental_unit = 'hourly' then 24 else 30 end;

    if v_rate is null or v_rate <= 0 then
      raise exception 'Tarif sewa untuk satuan ini belum diatur.' using errcode = '22023';
    end if;

    if p_rental_qty is null or p_rental_qty < 1 or p_rental_qty > v_max_qty then
      raise exception 'Durasi sewa di luar batas yang diizinkan.' using errcode = '22023';
    end if;

    v_amount := v_rate * p_rental_qty;
  else
    v_amount := v_product.price;
  end if;

  insert into public.orders
    (buyer_id, buyer_name, buyer_whatsapp, product_id, amount, mode, note, payment_method, status)
  values
    (auth.uid(), p_buyer_name, p_buyer_whatsapp, p_product_id, v_amount, v_mode, p_note, p_payment_method, 'pending')
  returning order_number into v_order_number;

  -- Akun dikunci sampai admin menyelesaikan atau menolak pesanannya
  -- (updateOrderStatusAction yang melepasnya kembali).
  update public.products set status = 'reserved' where id = p_product_id;

  return v_order_number;
end;
$$;

create or replace function public.create_guest_rekber(
  p_buyer_name       text,
  p_buyer_whatsapp   text,
  p_product_id       uuid,
  p_item_description text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product      public.products%rowtype;
  v_amount       numeric;
  v_fee          numeric;
  v_order_number text;
begin
  if p_product_id is null then
    raise exception 'Pengajuan rekber harus menyertakan produk.' using errcode = '22023';
  end if;

  select * into v_product from public.products where id = p_product_id for update;

  if not found then
    raise exception 'Produk tidak ditemukan.' using errcode = '22023';
  end if;

  if coalesce(v_product.status, '') <> 'active' then
    raise exception 'Akun ini sudah dipesan orang lain atau sedang tidak tersedia.'
      using errcode = '22023';
  end if;

  v_amount := v_product.price;

  select t.fee into v_fee
    from public.rekber_fee_tiers t
   where t.max_amount is null or v_amount <= t.max_amount
   order by t.sort_order asc
   limit 1;

  if v_fee is null then
    raise exception 'Tarif rekber belum diatur.' using errcode = '22023';
  end if;

  insert into public.rekber_orders
    (requester_id, buyer_name, buyer_whatsapp, product_id, item_description, amount, fee, seller_contact, status)
  values
    (auth.uid(), p_buyer_name, p_buyer_whatsapp, p_product_id, p_item_description, v_amount, v_fee,
     'Paroy Store (Official)', 'pending')
  returning order_number into v_order_number;

  update public.products set status = 'reserved' where id = p_product_id;

  return v_order_number;
end;
$$;


-- ---------------------------------------------------------------------------
-- BUG-06. Sisa stok flash sale dihitung dari pesanan sungguhan.
--
-- Kolom flash_sales.sold hanya pernah dibaca, tidak pernah ditulis, jadi
-- tulisan "Tersisa 3 Akun" akan tetap berbunyi begitu selamanya — termasuk
-- setelah akunnya laku. Angka urgensi yang tidak pernah bergerak cepat
-- ketahuan pembeli, dan itu justru menggerus kepercayaan, hal yang paling
-- mahal buat toko akun.
--
-- Daripada menambah kolom yang harus dijaga agar tidak melenceng, jumlah
-- terjual DITURUNKAN dari data pesanan: tidak bisa basi, tidak bisa salah
-- hitung. Perlu SECURITY DEFINER karena tabel orders memang tertutup untuk
-- pengunjung anonim (kebijakan self-or-admin) — fungsi ini hanya
-- mengembalikan angka agregat, tidak satu pun data pembeli.
-- ---------------------------------------------------------------------------
create or replace function public.get_flash_sale_sold_counts()
returns table (flash_sale_id uuid, sold_count bigint)
language sql
security definer
stable
set search_path = public
as $$
  select f.id,
         count(o.id)
    from public.flash_sales f
    left join public.orders o
      on o.product_id = f.product_id
     and o.status in ('paid', 'completed')
     and o.created_at >= f.starts_at
     and o.created_at <= f.ends_at
   group by f.id;
$$;

grant execute on function public.get_flash_sale_sold_counts() to anon, authenticated;
