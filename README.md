# Premysis Medika — Dashboard Admin (Web)

> **Branch `frontend-admin`** — branch ini hanya berisi **dashboard admin** (`admin/`).
> Backend ada di branch `backend`, aplikasi pasien di `frontend-pasien`, versi gabungan di `main`.

Dashboard admin **Premysis Medika** — modul operasional klinik + e-commerce/ERP.
Dibangun dengan **React + Vite + Tailwind CSS v4**.

Dashboard membaca dan menulis ke **REST API bersama** (`server/index.js`) lewat proxy `/api`,
sehingga pesanan & data lain yang dibuat pasien langsung terlihat di sini (PRD N-05).

> Dokumen acuan: `docs/PRD.md` (PRD v1.1).

## Menjalankan

Perlu **backend** berjalan lebih dulu (`server/index.js` di http://127.0.0.1:4000).

```bash
npm install             # memasang dependensi di admin/
npm run dev             # dashboard di http://localhost:5173
```

Atau langsung:

```bash
cd admin
npm install
npm run dev
```

### Akun demo (klik pada halaman login untuk mengisi otomatis)

| Peran | Email | Password |
|---|---|---|
| Bidan (Owner) | `siska@premysismedika.id` | `demo1234` |
| Asisten Bidan | `rina@premysismedika.id` | `demo1234` |

## Modul

| Menu | Halaman |
|---|---|
| Dashboard | Ringkasan harian, appointment hari ini, peringatan stok |
| Pasien | CRUD, cari, filter, detail + data bayi |
| Appointment | Filter periode/status, konfirmasi, ubah, batalkan |
| Pemeriksaan | Input rekam medis + resep |
| Vaksinasi | Jadwal & pencatatan vaksin, riwayat per bayi |
| Resep | Buat resep multi-obat, detail |
| Produk & Obat | CRUD produk, penanda wajib-resep, ambang stok |
| Kategori | CRUD kategori produk |
| Stok | Stok masuk/keluar, ringkasan mutasi |
| Pesanan | Alur status kanonik (BR-02), verifikasi pembayaran, detail |
| Pengguna | Kelola akun, matriks RBAC, log aktivitas |
| Laporan | Laporan penjualan + ringkasan, ekspor |

## Struktur

```
admin/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 # entry + router + AuthProvider
    ├── App.jsx                  # definisi rute
    ├── components/              # Sidebar, Topbar, DataTable, Modal, StatusBadge, Icons, ui
    ├── context/                 # AuthContext, DataContext, ThemeContext
    ├── data/mockData.js         # helper nama & format (data hidup dari API)
    ├── lib/api.js               # klien REST API
    └── pages/                   # Dashboard, Pasien, Produk, Kategori, Stok, Pesanan, Laporan, ...
```
