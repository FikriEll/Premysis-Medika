# Aplikasi Pelanggan — Klinik Premysis Medika (Web)

Antarmuka pelanggan untuk apotek: **website responsif** (bukan lagi aplikasi
mobile satu kolom). Satu basis kode melayani dua wajah:

| Lebar layar | Tata letak |
|---|---|
| < 640px (ponsel) | satu kolom, menu bawah (BottomNav), header ringkas + tombol menu |
| 640–1023px (tablet) | grid 2 kolom, menu bawah masih tampil |
| ≥ 1024px (desktop) | grid 3–4 kolom, navigasi pindah ke **header**, menu bawah disembunyikan |

Lebar konten dibatasi `--lebar-wadah: 1280px` (utility `wadah`); halaman teks
panjang (Syarat, Privasi, FAQ, artikel) memakai `wadah-baca` 760px agar baris
tidak melelahkan mata.

## Menjalankan

```bash
npm install
npm run dev        # dev server + proxy /api -> http://127.0.0.1:8000
npm run build      # bundel produksi ke dist/
```

Backend Laravel (repo `apotek`) harus berjalan di `127.0.0.1:8000`; proxy di
`vite.config.js` meneruskan `/api` ke sana sehingga tidak ada masalah CORS.

## Peta halaman

**Publik (tanpa login)** — `LayoutPublik`
Beranda, Toko, Detail Produk, Tentang Kami, Kontak, FAQ, Syarat & Ketentuan,
Kebijakan Privasi, Testimoni, Blog, Detail Blog, Promo.

**Perlu login** — `AppLayout` + `Terlindungi`
Keranjang, Checkout, Pembayaran, Pesanan, Profil, Edit Profil, Wishlist,
Pengaturan Akun, Pengaturan Pengiriman.

Tamu yang menekan "Tambah ke Keranjang" diarahkan ke `/masuk` beserta state
`dari`, lalu dikembalikan ke halaman asal setelah masuk.

## Alur pembayaran (Midtrans Snap)

1. Checkout memanggil `POST /api/checkout` dengan `payment_method: "midtrans"`.
2. Server membuat pesanan berstatus `pending_payment` dan **Snap token**.
3. Frontend mengarahkan ke `/pesanan/:nomor/bayar`, memuat `snap.js` lalu
   memanggil `snap.pay(token)`.
4. Setelah jendela Snap ditutup, frontend memanggil endpoint cek status agar
   status pesanan ikut segar, tanpa menunggu webhook.
5. Webhook `POST /midtrans/notification` (di repo `apotek`) memverifikasi
   `signature_key` (SHA-512 dari `order_id + status_code + gross_amount +
   server_key`) sebelum menandai pesanan lunas.

Bila kunci Midtrans belum diisi, server mengembalikan token `SNAP-MOCK-…` dan
halaman Pembayaran menampilkan catatan mode pengembangan — bukan galat mentah.

## Token desain

Seluruh warna, radius, dan permukaan diambil dari token di `src/index.css`.
Aturan yang dijaga:

- Komponen **tidak boleh** memakai warna hex mentah; warna dekoratif hanya
  lewat kelas `permukaan-*` supaya mode gelap bekerja otomatis. (Pengecualian:
  logo Google resmi di `Masuk.jsx`.)
- Satu warna aksi (accent) untuk tombol/tautan; warna lain hanya latar.
- Aksen berupa ikon dalam bulatan, bukan garis tepi tebal.
- Ilustrasi SVG memakai CSS variable, `aria-hidden`, dan satu bahasa bentuk.

Audit kontras WCAG AA dijalankan di 10 halaman × mode terang/gelap → 0 gagal.
