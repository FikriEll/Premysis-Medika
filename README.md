# Premysis Medika

Sistem informasi pelayanan kesehatan & e-commerce klinik ibu dan anak.
Repositori ini berisi **tiga bagian** yang berjalan di atas **satu sumber data**.

| Bagian | Folder | Alamat | Isi |
|---|---|---|---|
| Dashboard Admin | `admin/` | http://localhost:5173 | Modul operasional klinik + e-commerce/ERP (PRD §6.2, §22) |
| Aplikasi Pasien | `pasien/` | http://localhost:5174 | Fitur pasien F-01..F-11 + alur e-commerce (PRD §6.1) |
| API Bersama | backend **Laravel** (`apotek`) | http://127.0.0.1:8000 | REST API + aturan bisnis BR-02..BR-10 |

> Dokumen acuan: `docs/PRD.md` (PRD v1.1).
> Cara backend Laravel menyajikan **dua** front-end: `docs/INTEGRASI_BACKEND.md`.

## Mengapa ada satu server API

Dashboard admin dan aplikasi pasien berjalan di **port berbeda**, sehingga berbeda
*origin* dan **tidak bisa berbagi `localStorage`**. Supaya keduanya benar-benar melihat
data yang sama (PRD N-05: satu sumber data), keduanya membaca dan menulis ke **satu
backend Laravel** (repositori `apotek`), dengan dua permukaan API:

- `/api` — kontrak e-commerce, dipakai aplikasi pasien
- `/api/admin` — kontrak klinik, dipakai dashboard admin

```
        ┌──────────────────┐        ┌──────────────────┐
        │ Dashboard Admin  │        │  Aplikasi Pasien │
        │   :5173          │        │    :5174         │
        └────────┬─────────┘        └────────┬─────────┘
                 │  /api/admin (proxy Vite)  │  /api (proxy Vite)
                 └───────────┬───────────────┘
                             ▼
                 ┌───────────────────────────┐
                 │  Laravel apotek  :8000    │  ← satu basis data
                 └───────────────────────────┘
```

Rincian pemetaan domain apotek ➜ kontrak dashboard (nama kolom, status, peran, aturan
bisnis) ada di **`docs/INTEGRASI_BACKEND.md`**.

Aturan bisnis ditegakkan **di server**, bukan di UI, sehingga tidak bisa dilewati:

- **BR-02** mesin status pesanan (transisi ilegal ditolak)
- **BR-03** konfirmasi pembayaran (hanya boleh setelah pasien mengunggah bukti)
- **BR-04** pengurangan stok (hanya saat pesanan masuk "Diproses")
- **BR-05** produk wajib resep hanya bisa dibeli bila pasien punya resep aktif
- **BR-06** ambang stok minimum
- **BR-07** generate jadwal vaksin saat bayi didaftarkan
- **BR-08** notifikasi otomatis ke pasien saat status berubah
- **BR-09** audit trail (log aktivitas)
- **BR-10** validasi registrasi (NIK & email unik)

### Alur pembayaran (Fitur Minimal #5)

Setelah pesanan dibuat berstatus **Menunggu Pembayaran**, pasien punya langkah
pembayaran yang jelas, dan klinik memverifikasinya:

```
Pesanan dibuat          Pasien bayar & unggah bukti        Admin verifikasi
"Belum Bayar"    ──►    "Menunggu Verifikasi"      ──►     "Terverifikasi"  (pesanan → Dibayar)
        ▲                        │
        └────────────────────────┘  admin "Tolak bukti" → pasien unggah ulang
```

- **Transfer Bank**: halaman Pembayaran menampilkan rekening klinik + nominal
  (**total + kode unik 3 angka** supaya admin mudah mencocokkan). Pasien mengunggah
  foto bukti, lalu admin menekan **Konfirmasi Pembayaran** atau **Tolak**.
- **Tunai**: dibayar saat mengambil pesanan di klinik; tidak perlu unggah bukti.
- Server **menolak konfirmasi transfer sebelum ada bukti** (`409`), dan pasien tidak
  bisa mengunggah ulang saat bukti sedang menunggu verifikasi.
- Konfigurasi rekening & label status ada di `shared/pembayaran.js` (satu sumber untuk
  app pasien dan dashboard admin).

### Fitur e-commerce / ERP (tugas)

**Fitur minimal** (wajib) — semuanya sudah ada:

| Fitur | Di mana |
|---|---|
| Register & Login | App pasien: `/registrasi`, `/masuk` |
| Katalog produk (daftar, detail, harga, stok) | App pasien: `/toko`, `/produk/:id` |
| Keranjang belanja | App pasien: `/keranjang` |
| Checkout | App pasien: `/checkout` (3 langkah + ongkir per jarak) |
| **Pembayaran** | App pasien: `/pesanan/:id/bayar` + verifikasi di admin |
| Riwayat pesanan | App pasien: `/pesanan` (+ lacak pesanan) |
| Login admin | Dashboard: `/login` |
| Manajemen produk (tambah/edit/hapus) | Dashboard: `/produk` |
| Manajemen stok | Dashboard: `/stok` |
| Manajemen pesanan | Dashboard: `/pesanan` |
| Laporan penjualan | Dashboard: `/laporan` (tab E-Commerce) |

**Fitur pendukung** yang sudah dikerjakan:

- **Kategori produk** — CRUD di dashboard (`/kategori`); katalog app pasien membaca
  kategori dari data yang sama (bukan daftar tetap), dan kategori yang masih dipakai
  produk tidak bisa dihapus (`409`).
- **Lacak pesanan** — linimasa status langkah demi langkah di detail pesanan app pasien
  (`komponen Linimasa.jsx`), mengikuti mesin status kanonik BR-02.

### Aturan pengiriman obat (jarak + radius)

Aturan ini tinggal di `shared/pengiriman.js` dan dipakai **server dan app pasien
sekaligus**, supaya angka di layar selalu sama dengan yang ditegakkan saat checkout.

| Jarak dari klinik | Zona | Kurir | Ongkir |
|---|---|---|---|
| ≤ 12 km | Dalam kota | Kurir instan klinik | Rp 10.000 + Rp 2.500/km |
| > 12 km | Luar kota | Grab / Gojek antar kota | Rp 20.000 + Rp 4.000/km |
| perjalanan > 24 jam | — | — | **pesanan ditolak** |

- **Ongkir dihitung dari jarak**, bukan tarif tetap. Endpoint: `POST /api/pengiriman/hitung`.
- **Lokasi dipilih di peta** (Leaflet + OpenStreetMap, tanpa kunci API). Pasien boleh
  mengetuk peta, menggeser pin, atau menekan "Pakai Lokasi Saya".
- **Kejauhan tidak bisa dipesan.** Kalau perjalanan lebih dari 1 hari, tombol lanjut
  dinonaktifkan di UI **dan** checkout ditolak `409` di server.
- **Pembayaran Tunai hanya untuk "Ambil di Klinik".** Pesanan yang dikirim tidak boleh
  tunai (uang harus diterima sebelum kurir berangkat); server menolaknya dengan `409`.
- Tarif kurir di atas adalah **tarif simulasi** untuk demo. Tarif Grab/Gojek yang asli
  hanya bisa didapat lewat API resmi mitra, dan UI menandainya sebagai perkiraan.


## Menjalankan

Backend adalah repositori Laravel `apotek`. Jalankan lebih dulu:

```bash
cd apotek
php artisan serve --host=127.0.0.1 --port=8000   # API :8000
```

Lalu jalankan kedua front-end (dari repositori ini):

```bash
npm --prefix admin install
npm --prefix pasien install
npm --prefix admin run dev     # dashboard :5173  (proxy /api → :8000)
npm --prefix pasien run dev    # app pasien :5174 (proxy /api → :8000)
```

Kemudian buka:

- Dashboard admin : http://localhost:5173
- Aplikasi pasien : http://localhost:5174
- API bersama    : http://127.0.0.1:8000/api/admin/state

### Build produksi

```bash
npm --prefix admin run build
npm --prefix pasien run build
```

## Akun demo

Semua akun memakai password `demo1234`.

**Dashboard admin** (klik kartu di halaman login untuk mengisi otomatis):

| Peran | Email | Hak akses |
|---|---|---|
| Bidan (Owner) | `siska@premysismedika.id` | 11 modul |
| Asisten Bidan | `rina@premysismedika.id` | 7 modul (tanpa Pemeriksaan, Vaksinasi, Resep, Pengguna) |

> Peran "Asisten 1" dan "Asisten 2" digabung menjadi satu peran **Asisten Bidan**
> dengan hak akses gabungan.

**Aplikasi pasien** (klik kartu akun demo untuk mengisi otomatis). Password: `password`
(akun berasal dari `DatabaseSeeder` repositori `apotek`):

| Pasien | Identitas | Catatan |
|---|---|---|
| Budi Santoso | `budi@apotek.test` | Pelanggan dengan pesanan |
| Siti Aminah | `siti@apotek.test` | Pelanggan dengan alamat |
| Pelanggan 3 | `08130324679` | Login pakai nomor HP |

## Coba alur dua arah

1. Buka **app pasien** (:5174), login sebagai Siti, tambah produk di **Toko**, lalu **Checkout**
   (pilih **Transfer Bank**).
2. Pasien langsung diarahkan ke halaman **Pembayaran**: transfer sesuai nominal (termasuk
   kode unik), lalu **unggah bukti transfer**.
3. Buka **dashboard admin** (:5173), login sebagai Siska, buka menu **Pesanan**. Pesanan tadi
   berstatus **Menunggu Verifikasi** — klik **Lihat bukti**, lalu **Konfirmasi Pembayaran**
   (atau **Tolak** untuk meminta pasien mengunggah ulang).
4. Klik **Proses Pesanan**. Buka lagi **app pasien**: status pesanan berubah menjadi
   "Diproses", notifikasi masuk, dan stok produk berkurang otomatis (lihat menu **Stok**).

## Struktur

```
.
├── admin/                 Dashboard admin (React + Vite + Tailwind v4)
├── pasien/                Aplikasi pasien (React + Vite + Tailwind v4)
├── server/                Server Node demo lama (tidak dipakai lagi oleh dashboard)
├── shared/                Entitas & aturan bersama server Node lama
├── scripts/dev.mjs        Orkestrator `npm run dev`
├── docs/
│   ├── PRD.md             Product Requirements Document (v1.1)
│   └── INTEGRASI_BACKEND.md  Cara backend Laravel melayani 2 front-end
└── package.json           Skrip orkestrasi
```

Backend sebenarnya berada di **repositori terpisah**: `apotek` (Laravel).

## Catatan

- **Satu basis data.** Dashboard admin dan aplikasi pasien membaca/menulis ke backend
  Laravel yang sama, sehingga data selalu sinkron (PRD N-05).
- **Login dashboard diverifikasi server** (`POST /api/admin/auth/login-admin`); akun
  nonaktif ditolak. Otorisasi RBAC di dashboard tetap berlaku.
- `server/index.js` (Node, in-memory) adalah server demo lama dan **sudah tidak dipakai**
  oleh dashboard; ia ditinggalkan sebagai rujukan dan dapat dihapus.
- Aplikasi pasien memakai pola **mobile-first** (navigasi bawah + lembar aksi);
  dashboard admin memakai pola desktop.
