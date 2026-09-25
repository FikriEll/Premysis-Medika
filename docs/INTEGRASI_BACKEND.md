# Integrasi Backend Apotek (Laravel) dengan Dashboard Admin & Aplikasi Pasien

Dokumen ini menjelaskan bagaimana **satu backend Laravel** (repositori
[`DionTulus/apotek`](https://github.com/DionTulus/apotek)) melayani **dua front-end**
sekaligus: aplikasi pasien (e-commerce) dan dashboard admin klinik.

---

## 1. Latar belakang

Sebelum integrasi ini, repositori dashboard (`Premysis-Medika`) memiliki dua sumber data
berbeda:

| Aplikasi | Sumber data lama | Masalah |
|---|---|---|
| Aplikasi pasien (`pasien/`) | Laravel apotek `:8000` via `/api` | Sudah benar, tetapi terpisah dari dashboard |
| Dashboard admin (`admin/`) | Server Node in-memory `server/index.js` `:4000` | Data hilang saat server di-restart, dan **tidak sama** dengan yang dilihat pasien |

Akibatnya pesanan yang dibuat pasien tidak pernah muncul di dashboard admin, dan
perubahan stok di admin tidak terlihat oleh pasien. Ini melanggar **PRD N-05**
(satu sumber data).

Setelah integrasi:

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
                 │  /api        → pasien     │
                 │  /api/admin  → dashboard  │
                 └───────────────────────────┘
```

---

## 2. Perbedaan domain (dan cara menjembataninya)

Repositori `apotek` dimodelkan sebagai **apotek e-commerce**: nama kolom berbahasa
Inggris (`name`, `price`, `stock`, `requires_prescription`), status enum teknis
(`pending_payment`, `paid`, `processing`, ...).

Dashboard admin klinik memakai kontrak lain: nama kolom **Indonesia** (`nama`, `harga`,
`stok`, `wajib_resep`), alur kerja bidan yang lebih rinci (`Siap Diambil`), serta entitas
klinis yang tidak ada di skema apotek (bayi, imunisasi, janji temu, pemeriksaan, resep
klinis, notifikasi, log aktivitas).

Jembatan ditaruh di **satu tempat saja**: trait
`app/Http/Controllers/Api/Concerns/PresentsClinic.php`, yang berisi:

- `present*()` — model apotek ➜ bentuk JSON dashboard
- `apply*` / builder — input dashboard ➜ kolom model apotek

Controller (`AdminClinicController`) hanya memanggilnya, sehingga tidak ada duplikasi
logika dan kontrak dashboard tetap stabil walau skema apotek berubah.

### Pemetaan status pesanan

Enum apotek tidak memiliki padanan "Siap Diambil", sehingga:

- kolom `orders.status` (enum) **tetap diperbarui** agar aplikasi pasien ikut berubah;
- kolom baru `orders.status_clinic` menyimpan status alur klinik apa adanya.

| Status klinik (dashboard) | Enum apotek (`orders.status`) |
|---|---|
| Menunggu Pembayaran | `pending_payment` |
| Dibayar | `paid` |
| Diproses | `processing` |
| Siap Diambil | `processing` (+ `status_clinic`) |
| Dikirim | `shipped` |
| Selesai | `completed` |
| Dibatalkan | `cancelled` |

### Pemetaan peran

| Peran dashboard | Enum apotek (`users.role`) |
|---|---|
| bidan | `admin` |
| asisten | `pharmacist` |

---

## 3. Perubahan pada repositori `apotek`

### 3.1 Migrasi

| Berkas | Isi |
|---|---|
| `database/migrations/2026_09_25_000001_create_clinic_tables.php` | Kolom klinis pada `users` (nik, tanggal_lahir, jenis_kelamin, no_wa, alamat, status_aktif) + tabel `babies`, `vaccine_types`, `vaccine_schedules`, `appointments`, `examinations`, `clinical_prescriptions`, `clinical_prescription_items`, `notifications`, `activity_logs` |
| `database/migrations/2026_09_25_000002_add_clinic_columns_to_orders.php` | Kolom `orders.status_clinic`, `bukti_bayar`, `catatan_bayar`, `alasan_tolak`, `nominal_bayar` |

Semua tabel baru memakai prefiks domain klinis dan **tidak mengubah** tabel apotek yang
sudah ada (kecuali penambahan kolom nullable pada `users` & `orders`).

### 3.2 Model

Model baru: `Baby`, `VaccineType`, `VaccineSchedule`, `Appointment`, `Examination`,
`ClinicalPrescription`, `ClinicalPrescriptionItem`, `Notification`, `ActivityLog`.

Model `User` dan `Order` ditambah kolom klinis pada `$fillable`/`$casts`.

### 3.3 API admin (`routes/api.php`, prefiks `/api/admin`)

| Metode | Jalur | Kegunaan |
|---|---|---|
| POST | `/api/admin/auth/login-admin` | Login petugas (verifikasi password) |
| GET | `/api/admin/state` | Snapshot seluruh koleksi (dipanggil sekali saat dashboard dimuat) |
| GET | `/api/admin/{koleksi}` | Daftar koleksi |
| POST | `/api/admin/{koleksi}` | Tambah data |
| PATCH | `/api/admin/{koleksi}/{id}` | Ubah data |
| DELETE | `/api/admin/{koleksi}/{id}` | Hapus (khusus `kategori`) |
| PATCH | `/api/admin/pesanan/{id}/status` | Mesin status pesanan (**BR-02**) |
| POST | `/api/admin/pesanan/{id}/pembayaran` | Konfirmasi / tolak bukti bayar (**BR-03**) |
| PATCH | `/api/admin/appointment/{id}/status` | Ubah status janji temu (**BR-08**) |
| POST | `/api/admin/bayi/{id}/generate-jadwal` | Generate jadwal imunisasi (**BR-07**) |

Koleksi yang dikenali: `users`, `pasien`, `bayi`, `jenisVaksin`, `jadwalVaksin`,
`appointment`, `pemeriksaan`, `kategori`, `produk`, `stokMutasi`, `resep`, `pesanan`,
`pembayaran`, `notifikasi`, `logAktivitas`.

### 3.4 Aturan bisnis yang ditegakkan di API admin

- **BR-02** mesin status: transisi ilegal ditolak `409`.
- **BR-03** pembayaran: konfirmasi hanya saat pesanan berstatus "Menunggu Pembayaran";
  penolakan menyimpan `alasan_tolak` dan mengirim notifikasi.
- **BR-04** stok: pembatalan pesanan mengembalikan stok (`restoreOrderStock`); catat
  stok masuk/keluar memperbarui `products.stock` + `stock_movements`.
- **BR-07** jadwal vaksin dibuat dari master `vaccine_types` + tanggal lahir bayi.
- **BR-08** notifikasi otomatis ke pasien saat status pesanan/janji temu berubah.
- **BR-09** audit trail: setiap aksi tulis tercatat di `activity_logs`.

### 3.5 Seeder

`database/seeders/ClinicSeeder.php` — idempoten (`updateOrCreate`), mengisi akun
petugas, pasien klinis, bayi, master & jadwal vaksin, janji temu, pemeriksaan, resep
klinis, notifikasi, dan log aktivitas.

```bash
php artisan migrate --force
php artisan db:seed --class=ClinicSeeder --force
```

---

## 4. Perubahan pada repositori dashboard

| Berkas | Perubahan |
|---|---|
| `admin/vite.config.js` | Proxy `/api` diarahkan ke Laravel `:8000` (dulu Node `:4000`) |
| `admin/src/lib/api.js` | `BASE = '/api/admin'`; pesan galat menerima `pesan` (kontrak klinik) maupun `message` (Laravel) |
| `admin/src/context/AuthContext.jsx` | Login nyata ke `POST /api/admin/auth/login-admin` (dulu simulasi di peramban) |
| `admin/src/pages/Login.jsx` | `handleSubmit` menjadi `async` (menunggu verifikasi server) |
| `admin/src/data/mockData.js` | Helper `hariIni()`; `dashboardStats()` tidak lagi memakai tanggal demo ter-hardcode |
| `admin/src/pages/{Dashboard,Appointment,Laporan,Stok,Resep,Vaksinasi,Pemeriksaan,Pasien}.jsx` | Tanggal demo `2026-04-20` diganti tanggal nyata |

`admin/src/context/DataContext.jsx` **tidak berubah** — kontraknya sudah cocok dengan
bentuk `state` yang disajikan API admin, sehingga seluruh halaman bekerja tanpa diubah.

---

## 5. Menjalankan

### 5.1 Backend Laravel (`apotek`)

```bash
cd apotek
composer install
cp .env.example .env        # sesuaikan kredensial basis data
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force # DatabaseSeeder (katalog apotek)
php artisan db:seed --class=ClinicSeeder --force # data klinis + akun petugas
php artisan serve --host=127.0.0.1 --port=8000
```

### 5.2 Dashboard admin

```bash
cd premysis_medika_dashboard
npm --prefix admin install
npm --prefix admin run dev     # http://localhost:5173  (proxy /api → :8000)
```

### 5.3 Aplikasi pasien

```bash
npm --prefix pasien install
npm --prefix pasien run dev    # http://localhost:5174  (proxy /api → :8000)
```

> Jalur `/api` dan `/api/admin` diarahkan ke Laravel yang sama. Variabel `API_URL`
> dapat dipakai bila server berjalan di alamat lain.

---

## 6. Akun demo

| Peran | Email | Password |
|---|---|---|
| Bidan (owner) | `siska@premysismedika.id` | `demo1234` |
| Asisten bidan | `rina@premysismedika.id` | `demo1234` |
| Asisten (nonaktif) | `ayu@premysismedika.id` | `demo1234` |
| Admin apotek | `admin@apotek.test` | `password` |

Akun nonaktif ditolak saat login (`403 Akun tidak aktif`).

---

## 7. Catatan & batasan

- **Autentikasi token.** Login admin saat ini memverifikasi email+password terhadap tabel
  `users`, tetapi belum menerbitkan token Sanctum. Aplikasi pasien sudah memakai token
  Bearer. Menambahkan token untuk dashboard dapat dilakukan tanpa mengubah kontrak JSON
  (hanya menambah header `Authorization`).
- **Status pembayaran manual.** Skema apotek memakai Midtrans; dashboard klinik memakai
  verifikasi bukti transfer manual. Keduanya disatukan lewat kolom `bukti_bayar` &
  `alasan_tolak`, dengan status pembayaran klinik diturunkan dari `payment_status` +
  ada/tidaknya bukti.
- **Data lama.** Tabel apotek yang sudah ada (katalog 32 produk, 122 pesanan) langsung
  tampil di dashboard. Entitas klinis diisi `ClinicSeeder`.
- **`server/index.js` (Node)** masih ada sebagai server demo mandiri dan tidak lagi
  dipakai oleh dashboard. Ia dapat dihapus bila tidak diperlukan lagi.
