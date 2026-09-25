# Premysis Medika: Dashboard Admin (Frontend)

Frontend **Dashboard Admin (Web)** untuk sistem informasi klinik **Premysis Medika**.
Dibangun dengan **React + Vite + Tailwind CSS v4**.

Data **tidak lagi mock lokal**: dashboard membaca dan menulis ke **backend Laravel**
(repositori `apotek`) lewat prefiks `/api/admin`, sehingga pesanan, appointment, dan data
lain yang dibuat pasien di aplikasi pasien langsung terlihat di sini - PRD N-05.

> Dokumen acuan: `../docs/PRD.md` (PRD v1.1) dan `../docs/INTEGRASI_BACKEND.md`.
> Cakupan: 11 modul Dashboard Admin (PRD §6.2 & §22).

## Menjalankan

Backend Laravel harus berjalan lebih dulu:

```bash
cd ../apotek && php artisan serve --host=127.0.0.1 --port=8000
```

Lalu dashboard:

```bash
cd admin
npm install
npm run dev          # http://localhost:5173, proxy /api → :8000
```

### Akun demo (klik pada halaman login untuk mengisi otomatis)

| Peran | Email | Password |
|---|---|---|
| Bidan (Owner) | `siska@premysismedika.id` | `demo1234` |
| Asisten Bidan | `rina@premysismedika.id` | `demo1234` |

Login **diverifikasi server** (`POST /api/admin/auth/login-admin`); akun nonaktif ditolak
dengan pesan "Akun tidak aktif. Hubungi Bidan." Otorisasi RBAC di sisi klien tetap berlaku.

> **Catatan peran:** Asisten 1 (front office) dan Asisten 2 (e-commerce/stok) digabung
> menjadi **satu peran "Asisten Bidan"** dengan hak akses gabungan
> (Pasien, Appointment, Produk/Obat, Stok, Pesanan, Laporan). Login sebagai asisten lalu
> akses menu **Pemeriksaan/Resep/Vaksinasi/Pengguna** → muncul halaman **403 Akses Ditolak**
> (demonstrasi RBAC).

## Modul yang tersedia

| Menu | Halaman | PRD |
|---|---|---|
| Dashboard | Ringkasan harian, appointment hari ini, peringatan stok | §A-01 |
| Pasien | CRUD, cari, filter, detail + data bayi | §A-02 |
| Appointment | Filter periode/status, konfirmasi, ubah, batalkan | §A-03 |
| Pemeriksaan | Input rekam medis + resep, lihat detail | §A-04 |
| Vaksinasi | Jadwal & pencatatan vaksin, riwayat per bayi | §A-05 |
| Resep | Buat resep multi-obat, detail | §A-09 |
| Produk/Obat | CRUD produk, penanda wajib-resep, ambang stok | §A-06 |
| Stok | Stok masuk/keluar, ringkasan mutasi | §A-07 |
| Pesanan | Alur status kanonik (BR-02), konfirmasi pembayaran, detail | §A-08 |
| Pengguna | Kelola akun, matriks RBAC, log aktivitas | §A-10 |
| Laporan | 5 jenis laporan + ringkasan, ekspor (tombol) | §A-11 |

## Struktur proyek

```
admin/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 # entry + router + AuthProvider
    ├── App.jsx                  # definisi route & guard RBAC
    ├── index.css                # Tailwind + tema brand
    ├── lib/
    │   └── api.js               # klien REST API (/api/admin)
    ├── context/
    │   ├── AuthContext.jsx      # login server + matriks hak akses (§5.1)
    │   └── DataContext.jsx      # snapshot data dari /api/admin/state
    ├── data/
    │   └── mockData.js          # fallback tampilan + helper format
    ├── components/
    │   ├── AppLayout.jsx        # sidebar + topbar + outlet
    │   ├── Sidebar.jsx          # menu (difilter sesuai RBAC)
    │   ├── Topbar.jsx
    │   ├── PageHeader.jsx
    │   ├── DataTable.jsx
    │   ├── Modal.jsx            # Modal + ConfirmDialog
    │   ├── StatusBadge.jsx      # badge status berwarna
    │   ├── statusMap.js         # peta warna status
    │   ├── ui.jsx               # Card, Button, Input, Stat, dll.
    │   └── Icons.jsx            # ikon SVG inline
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── Pasien.jsx
        ├── Appointment.jsx
        ├── Pemeriksaan.jsx
        ├── Vaksinasi.jsx
        ├── Resep.jsx
        ├── Produk.jsx
        ├── Stok.jsx
        ├── Pesanan.jsx
        ├── Pengguna.jsx
        ├── Laporan.jsx
        ├── Forbidden.jsx        # 403
        └── NotFound.jsx         # 404
```

## Menyambung ke backend (langkah berikutnya)

Semua data terpusat di `src/data/mockData.js`. Untuk integrasi:
1. Ganti impor data dengan pemanggilan REST API (mis. `fetch('/api/pasien')`).
2. Ganti fungsi `login()` di `AuthContext.jsx` dengan endpoint autentikasi + token.
3. Terapkan penegakan RBAC di sisi server (frontend hanya menyembunyikan menu).

## Catatan

- Data pada semua halaman adalah **contoh (mock)**, bukan data pasien nyata.
- Status & alur mengikuti PRD v1.1 §8 (Business Rules): BR-02 (alur pesanan),
  BR-04 (pengurangan stok), BR-05 (wajib resep), BR-06 (ambang stok).
- Belum termasuk: integrasi pembayaran, notifikasi push nyata, unggah foto produk.
