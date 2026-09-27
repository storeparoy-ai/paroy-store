-- Ikon resmi untuk tujuh game bawaan (seed migrasi 00000000000005).
--
-- Sebelumnya semua game tampil sebagai emoji (⚡🔥🎯🔫🌟⚽💥) karena
-- icon_url kosong — Valorant bahkan muncul sebagai pistol air mainan.
-- Berkasnya ada di repo (public/games/<slug>.png), disusun dari logo resmi
-- masing-masing penerbit, jadi cukup menunjuk path-nya di sini.
--
-- Hanya mengisi yang masih kosong: logo yang sudah atau nanti diunggah admin
-- lewat Admin → Kategori Game tidak ditimpa. Aman dijalankan berulang kali.

update public.games
set icon_url = '/games/' || slug || '.png'
where slug in ('mlbb', 'ff', 'pubg', 'valorant', 'genshin', 'efootball', 'cod')
  and coalesce(icon_url, '') = '';

-- Periksa hasilnya (harus 7 baris ber-icon_url /games/...):
-- select slug, name, icon_url from public.games order by sort_order;
