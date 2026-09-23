# PRODUCT REQUIREMENTS DOCUMENT (PRD) — v1.1

## Sistem Informasi Pelayanan Kesehatan & E-Commerce — Premysis Medika

_Klinik: Premysis Medika | Penanggung jawab klinik: Siska Mariawati, S.Tr.Keb. Disusun oleh: Fikri — 202433500177 — Sistem Informasi, Fakultas Ilmu Komputer, Universitas Indraprasta PGRI_

**Versi 1.1 — [bulan/tahun] · Riwayat perubahan lihat §23.**

> Catatan v1.1: seluruh header tabel diperbaiki, mesin status (appointment, pesanan, pembayaran) diseragamkan, ditambahkan §8 Business Rules, matriks hak akses (RBAC), kepatuhan regulasi (UU PDP & Permenkes RME), metrik SMART, serta rencana pengujian/UAT. Bagian bertanda **[BARU]** atau **[DIUBAH]** menandai perubahan dari v1.0.

---

# 1. Ringkasan Produk (Overview)

Premysis Medika adalah klinik ibu dan anak yang saat ini menjalankan operasionalnya secara manual/semi-manual: pasien menghubungi bidan melalui WhatsApp untuk membuat janji, rekam medis dicatat konvensional, dan tidak ada sistem terpusat untuk data pasien, riwayat pemeriksaan, jadwal vaksinasi bayi, maupun penjualan obat/produk kesehatan.

Produk ini adalah sistem informasi terintegrasi yang terdiri dari dua bagian: **(1) Aplikasi Pasien (mobile)** dan **(2) Dashboard Admin (web)** untuk bidan dan asisten bidan. Sistem menggabungkan layanan klinis (pemeriksaan, riwayat medis, resep, vaksinasi bayi) dengan modul e-commerce (toko obat & produk kesehatan) dalam satu ekosistem data pasien yang saling terhubung.

# 2. Latar Belakang

- Klinik dikelola oleh 1 bidan (pemilik) dan 2 asisten bidan, tanpa staf admin/apoteker terpisah.
- Proses temu pasien saat ini lewat WhatsApp dan kunjungan langsung (first-come-first-served); belum ada pendaftaran/antrian formal.
- Volume pasien belum besar, sehingga sistem antrian kompleks belum diperlukan.
- Pencatatan rekam medis, resep, dan stok obat belum terkomputerisasi sehingga rawan tercecer dan sulit dijadikan laporan.
- Ada potensi menambah pendapatan lewat penjualan obat & produk kesehatan secara online.

# 3. Tujuan

- Menyediakan satu sistem terpusat untuk data pasien, riwayat pemeriksaan, resep, dan jadwal vaksinasi bayi.
- Memudahkan bidan & asisten mencatat pemeriksaan dan mengelola rekam medis secara digital.
- Menyediakan kanal alternatif appointment selain WhatsApp, tanpa menghilangkan kebiasaan pasien menghubungi klinik langsung.
- Membuka kanal penjualan obat & produk kesehatan secara online yang terhubung dengan resep dan stok klinik.
- Menghasilkan laporan operasional untuk mendukung pengambilan keputusan pemilik klinik.

# 4. Ruang Lingkup (Scope)

### 4.1 Termasuk dalam ruang lingkup (In-Scope)

- Aplikasi mobile pasien: appointment, riwayat pemeriksaan, resep, vaksinasi bayi, toko, keranjang, pesanan, notifikasi, profil.
- Dashboard web admin (bidan & 2 asisten) dengan Role Based Access Control (RBAC).
- Modul rekam medis, resep digital, dan manajemen vaksinasi bayi.
- Modul e-commerce: manajemen produk/obat, stok, keranjang, checkout, pesanan — terhubung resep dan pengurangan stok otomatis.
- Modul laporan (pasien, pemeriksaan, vaksinasi, obat, e-commerce).

### 4.2 Di luar ruang lingkup (Out-of-Scope) untuk versi 1.0

- Sistem antrian otomatis (volume pasien masih kecil).
- Integrasi payment gateway — pembayaran awal manual/di klinik.
- Appointment online sebagai jalur wajib — WhatsApp/datang langsung tetap didukung.
- Integrasi BPJS/asuransi.

# 5. Pengguna & Peran (User Roles)

| ID | Peran | Platform | Deskripsi & Hak Akses |
|---|---|---|---|
| R-01 | Pasien | Mobile | Membuat appointment, melihat riwayat pemeriksaan & resep, mengelola data vaksinasi bayi, berbelanja, melihat status pesanan. |
| R-02 | Bidan (Owner) | Dashboard web | Akses penuh: pemeriksaan, rekam medis, resep, jadwal, vaksinasi, laporan, manajemen pengguna. |
| R-03 | Asisten 1 | Dashboard web | Front office: manajemen data pasien, pendaftaran, appointment, administrasi umum. Tanpa akses tulis rekam medis. |
| R-04 | Asisten 2 | Dashboard web | E-commerce/stok: manajemen produk, obat, stok, dan pesanan e-commerce. |

### 5.1 Matriks Hak Akses (RBAC) **[BARU]**

Keterangan: **C**=Create, **R**=Read, **U**=Update, **D**=Delete/nonaktifkan, **–**=tidak ada akses.

| Modul | Bidan (R-02) | Asisten 1 (R-03) | Asisten 2 (R-04) |
|---|---|---|---|
| Data Pasien | CRUD | CRUD | R |
| Appointment | CRUD | CRUD | R |
| Pemeriksaan & Rekam Medis | CRUD | R | – |
| Resep | CRUD | R | R |
| Vaksinasi | CRUD | R | R |
| Produk/Obat | CRUD | – | CRUD |
| Stok & Mutasi | CRUD | – | CRUD |
| Pesanan E-Commerce | CRUD | R | CRUD |
| Pengguna & RBAC | CRUD | – | – |
| Laporan | R | R (pasien/appointment) | R (obat/e-commerce) |

> Hak akses ditegakkan di sisi server (bukan hanya menyembunyikan menu), lihat §9 N-01.

# 6. Kebutuhan Fungsional (Functional Requirements)

## 6.1 Aplikasi Pasien (Mobile)

| ID | Modul / Fitur | Deskripsi & Kriteria |
|---|---|---|
| F-01 | Login & Registrasi | Login via email/No. WhatsApp + password; lupa password (lihat §8 BR-10). Registrasi: nama, NIK, tanggal lahir, jenis kelamin, No. WhatsApp, alamat, password. |
| F-02 | Beranda | Sapaan, appointment terdekat, jadwal vaksinasi bayi (semua bayi terdaftar), status pesanan terakhir, pengingat, shortcut fitur utama. |
| F-03 | Appointment | Pasien membuat janji (jenis layanan, tanggal, waktu, keluhan, catatan). Status: Menunggu Konfirmasi → Dikonfirmasi → Selesai / Dibatalkan. Tombol alternatif Hubungi WhatsApp Klinik tetap tersedia. |
| F-04 | Riwayat Pemeriksaan | Riwayat per kunjungan: tanggal, jenis pemeriksaan, bidan penanggung jawab, hasil, diagnosis, tindakan, resep. |
| F-05 | Resep Digital | Resep aktif pasien dengan tombol Beli Obat yang mengisi keranjang dari produk terkait. Jika obat tidak ada di katalog, tombol nonaktif + info "hubungi klinik". |
| F-06 | Vaksinasi Bayi | Daftarkan data bayi (nama, NIK, tanggal lahir, jenis kelamin, nama orang tua) dan lihat jadwal/status vaksin (Terjadwal/Selesai), opsi buat appointment vaksin. |
| F-07 | Toko (E-Commerce) | Katalog produk berkategori (Obat, Vitamin & Suplemen, Ibu & Bayi, Alat Kesehatan) dengan filter, pencarian, detail produk. Produk tertentu berlabel "Memerlukan Resep". |
| F-08 | Keranjang & Checkout | Kelola item keranjang, isi data penerima, pilih metode ambil di klinik/pengiriman, metode pembayaran, lalu buat pesanan. Validasi stok & resep saat checkout (§8 BR-04, BR-05). |
| F-09 | Pesanan Saya | Status pesanan: Menunggu Pembayaran → Dibayar → Diproses → Siap Diambil/Dikirim → Selesai / Dibatalkan (mesin status §8 BR-02), beserta nomor, produk, jumlah, total, waktu. |
| F-10 | Notifikasi | Notifikasi appointment, pengingat pemeriksaan/vaksin, status pesanan, info klinik. Daftar trigger lengkap §8 BR-08. |
| F-11 | Profil | Kelola data pribadi, data bayi/anak, ubah password, logout. |

## 6.2 Dashboard Admin (Web)

| ID | Modul / Fitur | Deskripsi & Kriteria |
|---|---|---|
| A-01 | Dashboard Ringkasan | Statistik harian (pasien, appointment, pemeriksaan, pesanan baru), daftar appointment hari ini, peringatan stok menipis (ambang §8 BR-06). |
| A-02 | Manajemen Pasien | Tambah, edit, nonaktifkan, cari, lihat detail pasien. |
| A-03 | Manajemen Appointment | Lihat semua appointment dengan filter; konfirmasi, ubah jadwal, batalkan, tandai selesai. |
| A-04 | Pemeriksaan & Rekam Medis | Bidan input keluhan, riwayat kesehatan, hasil, diagnosis, tindakan, catatan, resep, jadwal kontrol; otomatis tersimpan ke riwayat pasien. |
| A-05 | Manajemen Vaksin | Kelola data bayi, jadwal vaksin (auto-generate §8 BR-07), pencatatan vaksin diberikan, penjadwalan berikutnya, riwayat per bayi. |
| A-06 | Manajemen Produk/Obat | Kelola produk: nama, kategori, foto, deskripsi, harga, stok, satuan, status, penanda wajib-resep, ambang stok minimum. |
| A-07 | Manajemen Stok | Stok masuk/keluar; stok berkurang otomatis saat obat diberikan ke pasien atau pesanan e-commerce masuk status **Diproses** (§8 BR-04). |
| A-08 | Pesanan E-Commerce | Lihat detail pesanan dan ubah status sepanjang alur §8 BR-02, termasuk **Konfirmasi Pembayaran** (§8 BR-03). |
| A-09 | Manajemen Resep | Bidan membuat resep (pasien, tanggal, nama obat, dosis, jumlah, aturan pakai, catatan) yang otomatis tampil di aplikasi pasien dan tertaut ke produk toko bila tersedia. |
| A-10 | Manajemen Pengguna & RBAC | Kelola akun Bidan (akses penuh), Asisten 1 (pasien/pendaftaran/appointment/administrasi), Asisten 2 (produk/obat/stok/pesanan) sesuai matriks §5.1. |
| A-11 | Laporan | Laporan Pasien, Pemeriksaan, Vaksinasi, Obat (stok, keluar-masuk, produk terlaris), E-Commerce (pesanan, selesai, dibatalkan, total transaksi). Dapat diekspor PDF/Excel. |

# 7. Alur Data & Hubungan Antar Modul

Data pasien menjadi pusat sistem. Appointment → data kunjungan → Pemeriksaan mencatat riwayat medis → Riwayat medis dapat menghasilkan Resep → Resep terhubung Produk/Obat di Toko → Pembelian (checkout) mengurangi Stok otomatis → seluruh transaksi terekap di Laporan. Satu data pasien mengalir dari pelayanan klinis hingga transaksi dan pelaporan.

# 8. Aturan Bisnis (Business Rules) **[BARU]**

**BR-01 Appointment.** Sistem mencegah bentrok jadwal: satu slot waktu menampung kapasitas terbatas (default 1 pasien/slot, dapat dikonfigurasi). Appointment yang tidak dikonfirmasi melewati waktu dapat ditandai "Tidak Hadir". Pasien dapat membatalkan hingga H-1.

**BR-02 Mesin Status Pesanan (kanonik — dipakai di seluruh dokumen).**

```
Menunggu Pembayaran → Dibayar → Diproses → Siap Diambil / Dikirim → Selesai
        └──────────────────────── Dibatalkan ◄──────────────────────────┘
```
- Pasien dapat membatalkan selama status "Menunggu Pembayaran".
- Admin dapat membatalkan dengan alasan selama status belum "Selesai".
- Transisi status hanya boleh mengikuti alur di atas.

**BR-03 Pembayaran Manual.** Setelah pesanan dibuat, pasien membayar di klinik/transfer, lalu admin menekan **Konfirmasi Pembayaran**. Sistem mencatat entitas `Pembayaran` dan mengubah status menjadi "Dibayar".

**BR-04 Pengurangan Stok.** Stok berkurang **hanya pada satu titik**: saat pesanan berubah menjadi "Diproses" (pembayaran terkonfirmasi), dan saat bidan mencatat pemberian obat klinis. Saat checkout, sistem **memvalidasi** ketersediaan stok; jika jumlah pesanan > stok, checkout diblokir dengan pesan jelas.

**BR-05 Produk Wajib Resep.** Produk `wajib_resep = true` hanya dapat di-checkout bila tertaut ke `Resep` aktif milik pasien tersebut, atau disetujui (override) oleh admin.

**BR-06 Ambang Stok Minimum.** Setiap produk memiliki `stok_minimum` (default, mis. 10). Stok ≤ ambang memicu peringatan di A-01.

**BR-07 Jadwal Vaksin.** Jadwal dapat di-generate otomatis dari master jadwal imunisasi berdasarkan tanggal lahir bayi, dan tetap dapat disesuaikan manual oleh admin.

**BR-08 Trigger Notifikasi.** (1) appointment dikonfirmasi/diubah/dibatalkan; (2) pengingat pemeriksaan H-1; (3) pengingat vaksin H-1/H-3; (4) perubahan status pesanan; (5) resep baru terbit; (6) info dari klinik. Kanal v1: in-app + push/local notification (lihat §9 N-03).

**BR-09 Audit Trail.** Setiap perubahan rekam medis, resep, stok, dan pesanan mencatat `id_pengguna` pelaku dan waktu perubahan.

**BR-10 Akun & Identitas.** NIK unik untuk Pasien dan Bayi; No. WhatsApp berformat valid; password minimal 8 karakter (kombinasi huruf & angka); lupa password via tautan/OTP ke email atau WhatsApp terdaftar.

# 9. Kebutuhan Non-Fungsional

| ID | Aspek | Deskripsi & Kriteria |
|---|---|---|
| N-01 | Keamanan | Autentikasi password ter-hash (bcrypt/argon2); komunikasi HTTPS/TLS; RBAC ditegakkan server-side; session timeout; pembatasan percobaan login (throttling); data NIK & rekam medis hanya untuk peran berwenang (prinsip least privilege). |
| N-02 | Usability | Antarmuka pasien sederhana & ramah pengguna non-teknis (ibu hamil/orang tua bayi), Bahasa Indonesia, tombol besar, langkah minim. |
| N-03 | Ketersediaan & Notifikasi | Dashboard dapat diakses selama jam operasional; data tersimpan otomatis (autosave) pada input pemeriksaan panjang. Pengingat memerlukan push/local notification (bukan sekadar in-app) agar pengingat proaktif berfungsi. |
| N-04 | Skalabilitas | Struktur data mendukung penambahan kategori produk/jenis layanan baru tanpa perubahan besar (kategori sebagai master table). |
| N-05 | Konsistensi Data | Perubahan stok, status pesanan, dan status appointment konsisten (near real-time) antara aplikasi pasien dan dashboard admin. |
| N-06 | Performa | Waktu muat halaman/API < 2 detik pada kondisi normal; mendukung minimal 50 pengguna bersamaan. |
| N-07 | Kepatuhan (Compliance) | Mematuhi UU No. 27/2022 (Pelindungan Data Pribadi) dan Permenkes No. 24/2022 (Rekam Medis Elektronik); retensi rekam medis sesuai ketentuan berlaku. |
| N-08 | Backup & Pemulihan | Backup data harian; target RPO ≤ 24 jam; prosedur pemulihan terdokumentasi. |
| N-09 | Maintainability & Portability | Kode modular, terdokumentasi; dapat dijalankan pada server lokal klinik maupun cloud. |

# 10. Metrik Keberhasilan (Success Metrics) **[DIUBAH — SMART]**

| # | Metrik | Baseline | Target |
|---|---|---|---|
| M-01 | Pencatatan pemeriksaan baru secara digital | 0% (manual) | 100% dalam 1 bulan setelah go-live |
| M-02 | Waktu pencarian riwayat pasien oleh bidan | ± 5 menit (manual) | < 30 detik |
| M-03 | Jadwal vaksinasi bayi yang terlewat per bulan | tidak terukur | 0 |
| M-04 | Selisih stok (klinik vs e-commerce) per audit bulanan | tidak terukur | 0 |
| M-05 | Waktu proses konfirmasi pesanan | manual/ad-hoc | < 5 menit per pesanan |

# 11. Asumsi & Batasan **[BARU]**

- **Asumsi:** koneksi internet tersedia di klinik; bidan/asisten memiliki perangkat untuk mengakses dashboard; pasien memiliki smartphone Android/iOS.
- **Batasan:** v1 tanpa payment gateway, tanpa antrian digital, tanpa integrasi BPJS/asuransi, tanpa WhatsApp API.
- **Ketergantungan:** penyedia cloud storage (foto produk), penyedia layanan email/WhatsApp untuk OTP lupa password.

# 12. Rencana Pengembangan Lanjutan (v2)

- Integrasi payment gateway untuk pembayaran online.
- Sistem antrian digital bila volume pasien meningkat.
- Integrasi WhatsApp API untuk notifikasi otomatis.
- Modul telekonsultasi/konsultasi jarak jauh.

# 13. Persona Pengguna

| ID | Persona | Profil | Kebutuhan Utama |
|---|---|---|---|
| P-01 | Ibu Hamil / Pasien Kandungan | Usia 20–35, kontrol rutin kehamilan | Pengingat jadwal periksa, riwayat kehamilan rapi, akses cepat resep vitamin/obat. |
| P-02 | Orang Tua Bayi/Balita | Usia 20–40, mengurus imunisasi anak | Pengingat jadwal vaksin, riwayat vaksin lengkap untuk KIA/sekolah. |
| P-03 | Bidan (Siska Mariawati) | Pemilik & tenaga medis utama | Input pemeriksaan cepat, akses rekam medis pasien lama, kontrol penuh resep & laporan. |
| P-04 | Asisten Bidan 1 | Front office, pendaftaran | Kelola data pasien & appointment tanpa akses rekam medis rinci. |
| P-05 | Asisten Bidan 2 | Obat, stok, pesanan online | Pantau stok menipis, proses pesanan, update status cepat. |

# 14. User Stories & Kriteria Penerimaan (Acceptance Criteria)

## 14.1 Aplikasi Pasien

| ID | User Story | Kriteria Penerimaan (Given/When/Then) |
|---|---|---|
| US-01 | Membuat appointment dari aplikasi | **Given** saya login, **When** saya isi jenis layanan/tanggal/waktu/keluhan dan submit, **Then** status appointment menjadi "Menunggu Konfirmasi" dan muncul di Beranda. |
| US-02 | Melihat riwayat pemeriksaan | **Given** saya punya riwayat kunjungan, **When** saya buka Riwayat Pemeriksaan, **Then** saya melihat daftar kunjungan terurut terbaru, masing-masing dapat dibuka untuk detail diagnosis & tindakan. |
| US-03 | Membeli obat dari resep | **Given** bidan telah membuat resep, **When** saya buka menu Resep, **Then** saya melihat daftar obat resep dan dapat menekan "Beli Obat" yang mengisi keranjang otomatis. |
| US-04 | Mendaftarkan bayi & memantau jadwal vaksin | **Given** saya menambahkan data bayi, **When** jadwal vaksin dibuat admin, **Then** jadwal tampil dengan status Terjadwal/Selesai dan saya menerima notifikasi pengingat H-1. |
| US-05 | Berbelanja produk kesehatan | **Given** saya memilih produk & jumlah, **When** saya checkout dengan metode ambil/kirim & pembayaran, **Then** pesanan tercipta berstatus "Menunggu Pembayaran" dan tampil di Pesanan Saya. |
| US-10 **[BARU]** | Login & registrasi | **Given** saya belum punya akun, **When** saya registrasi dengan data lengkap & valid, **Then** akun terbuat dan saya dapat login. |
| US-11 **[BARU]** | Menerima pengingat vaksin/pemeriksaan | **Given** ada jadwal vaksin/pemeriksaan mendatang, **When** H-1 tiba, **Then** saya menerima notifikasi pengingat. |

## 14.2 Dashboard Admin

| ID | User Story | Kriteria Penerimaan (Given/When/Then) |
|---|---|---|
| US-06 | Bidan mencatat hasil pemeriksaan | **Given** saya membuka profil pasien, **When** saya isi keluhan/hasil/diagnosis/tindakan/resep dan simpan, **Then** data tersimpan ke riwayat pemeriksaan pasien dan resep (jika ada) langsung tampil di aplikasi pasien. |
| US-07 | Asisten 2 memproses pesanan e-commerce | **Given** ada pesanan baru berstatus "Menunggu Pembayaran", **When** pembayaran dikonfirmasi dan saya ubah status ke "Diproses", **Then** stok produk terkait otomatis berkurang dan pasien menerima notifikasi. |
| US-08 | Bidan melihat laporan bulanan | **Given** saya membuka menu Laporan, **When** saya pilih rentang bulan, **Then** sistem menampilkan ringkasan jumlah pasien, pemeriksaan, vaksinasi, dan transaksi e-commerce periode tersebut, dapat diekspor. |
| US-09 | RBAC sesuai peran | **Given** saya login sebagai Asisten 1, **When** saya mencoba membuka Manajemen Produk/Stok, **Then** sistem menolak akses karena di luar peran saya. |
| US-12 **[BARU]** | Asisten 2 mengelola stok | **Given** stok produk ≤ ambang minimum, **When** saya membuka dashboard, **Then** muncul peringatan stok menipis dan saya dapat mencatat stok masuk. |
| US-13 **[BARU]** | Bidan mengelola produk/obat | **Given** saya membuka Manajemen Produk, **When** saya tambah produk dengan penanda wajib-resep, **Then** produk muncul di toko dengan label "Memerlukan Resep". |

# 15. Model Data Utama (Entitas Kunci)

| Entitas | Atribut Utama |
|---|---|
| Pasien | id, nama, NIK (unik), tanggal_lahir, jenis_kelamin, no_wa, alamat, password_hash, tanggal_registrasi, status_aktif, created_at, updated_at |
| Bayi | id, id_pasien (FK), nama, NIK, tanggal_lahir, jenis_kelamin, nama_orang_tua, created_at, updated_at |
| Appointment | id, id_pasien (FK), id_bidan (FK, nullable), jenis_layanan, tanggal, waktu, keluhan, catatan, status, created_at, updated_at |
| Pemeriksaan | id, id_pasien (FK), id_appointment (FK, nullable), id_bidan (FK), tanggal, keluhan, hasil, diagnosis, tindakan, catatan, created_at, updated_at |
| Resep | id, id_pemeriksaan (FK), id_pasien (FK), id_bidan (FK), tanggal, status, created_at, updated_at |
| ResepDetail | id, id_resep (FK), id_produk (FK, nullable), nama_obat, dosis, jumlah, aturan_pakai |
| JadwalVaksin | id, id_bayi (FK), id_jenis_vaksin (FK), nama_vaksin, tanggal_terjadwal, tanggal_diberikan, status |
| JenisVaksin **[BARU]** | id, nama_vaksin, usia_bulan, deskripsi |
| Kategori **[BARU]** | id, nama, deskripsi |
| Produk | id, id_kategori (FK), nama, foto, deskripsi, harga, stok, satuan, stok_minimum, status, wajib_resep (boolean), created_at, updated_at |
| StokMutasi | id, id_produk (FK), jenis (masuk/keluar), jumlah, tanggal, keterangan, sumber (klinik/e-commerce), id_pengguna (FK) |
| Keranjang **[DIUBAH]** | id, id_pasien (FK), created_at, updated_at |
| KeranjangItem **[DIUBAH]** | id, id_keranjang (FK), id_produk (FK), jumlah, harga_saat_itu |
| Pesanan | id, id_pasien (FK), nomor_pesanan, total, biaya_kirim, alamat_pengiriman, metode_ambil, metode_bayar, status, waktu_pemesanan, created_at, updated_at |
| PesananDetail | id, id_pesanan (FK), id_produk (FK), jumlah, harga_satuan |
| Pembayaran **[BARU]** | id, id_pesanan (FK), jumlah, metode, bukti, waktu, id_pengguna (FK) |
| Pengguna (Admin) | id, nama, email, password_hash, peran (Bidan/Asisten1/Asisten2), status_aktif, created_at, updated_at |
| Notifikasi | id, id_pasien (FK), judul, pesan, jenis, status_baca, tanggal |
| LogAktivitas **[BARU]** | id, id_pengguna (FK), aksi, entitas, id_entitas, waktu |

**Relasi kunci:** Pasien 1—N Appointment; Pasien 1—N Pemeriksaan; Pemeriksaan 1—0/1 Resep; Resep 1—N ResepDetail; Pasien 1—N Bayi; Bayi 1—N JadwalVaksin; JenisVaksin 1—N JadwalVaksin; Kategori 1—N Produk; Pasien 1—1 Keranjang; Keranjang 1—N KeranjangItem; Produk 1—N KeranjangItem; Pasien 1—N Pesanan; Pesanan 1—N PesananDetail; Pesanan 1—0/1 Pembayaran; Produk 1—N StokMutasi; Pengguna 1—N Pemeriksaan; Pengguna 1—N Resep; Pasien 1—N Notifikasi. Detail kardinalitas lengkap dituangkan dalam ERD pada Bab 4.2.

# 16. Rancangan Arsitektur & Teknologi (Usulan)

| Komponen | Teknologi | Alasan |
|---|---|---|
| Aplikasi Pasien | Mobile (Android/iOS) — Flutter | Sejalan pengalaman proyek EduAttend, mempercepat pengembangan lintas platform. |
| Dashboard Admin | Web — PHP (mis. Laravel) | Sejalan pengalaman proyek BelanjaCepat.com; cocok untuk RBAC & e-commerce. |
| Backend/API | REST API | Menjembatani mobile & dashboard ke satu basis data agar data pasien konsisten. |
| Basis Data | Relasional (MySQL/MariaDB/PostgreSQL) | Struktur data terhubung (pasien-pemeriksaan-resep-produk-pesanan) cocok dengan foreign key. |
| Notifikasi | Push/local + in-app | Pengingat proaktif (lihat BR-08, N-03). Integrasi WhatsApp API jadi pengembangan lanjutan. |
| Penyimpanan Media | Cloud storage / server lokal | Untuk foto produk dan (opsional) lampiran hasil pemeriksaan. |

> Catatan: Laravel dapat sekaligus menyajikan dashboard web **dan** REST API dalam satu basis kode (monolit + API), atau dipisah — keputusan ini perlu ditetapkan pada Bab rancangan arsitektur. Pemilihan teknologi bersifat usulan dan dapat disesuaikan dengan arahan dosen pembimbing.

# 17. Alur Navigasi (Wireframe Flow) **[DIUBAH — judul]**

### 17.1 Alur Pasien

Login/Registrasi → Beranda → (a) Buat Appointment → Konfirmasi → Riwayat Pemeriksaan, atau (b) Toko → Detail Produk → Keranjang → Checkout → Pesanan Saya, atau (c) Resep → Beli Obat dari Resep → Keranjang → Checkout.

### 17.2 Alur Admin

Login Admin → Dashboard Ringkasan → (a) Pasien → Input Pemeriksaan → Resep otomatis tersimpan, atau (b) Pesanan E-Commerce → Konfirmasi Pembayaran → Ubah Status → Stok berkurang otomatis, atau (c) Vaksinasi → Catat Vaksin Diberikan → Jadwal Berikutnya dibuat.

> Pada laporan, bagian ini dilengkapi wireframe/mockup layar.

# 18. Prioritas Pengembangan (MoSCoW) **[DIUBAH — diselaraskan]**

| Prioritas | Fitur | Alasan |
|---|---|---|
| Must Have | Login/registrasi pasien, Manajemen pasien, Pemeriksaan & rekam medis, Resep, Produk/obat, Stok, RBAC, Laporan dasar | Fitur inti yang membuat sistem layak disebut "sistem informasi klinik"; RBAC wajib karena multi-peran. |
| Should Have | Appointment online, Vaksinasi bayi, Notifikasi | Meningkatkan kualitas layanan; klinik masih bisa beroperasi tanpa ini di awal. |
| Could Have | Toko & e-commerce penuh (keranjang, checkout, pesanan) | Nilai tambah pendapatan; dapat menyusul setelah modul klinis stabil (tetapi merupakan kontribusi utama judul — status dapat dinaikkan ke Should sesuai arahan pembimbing). |
| Won't Have (v1) | Payment gateway online, Sistem antrian digital, WhatsApp API, Telekonsultasi | Pengembangan lanjutan (lihat §12). |

# 19. Risiko & Mitigasi

| ID | Risiko | Mitigasi |
|---|---|---|
| R-01 | Resistensi pengguna (bidan/asisten belum terbiasa sistem digital) | Antarmuka sederhana, pelatihan singkat saat go-live, migrasi data bertahap. |
| R-02 | Data pasien/rekam medis bersifat sensitif | RBAC ketat, enkripsi password, pembatasan akses NIK & rekam medis hanya untuk peran berwenang, kepatuhan UU PDP. |
| R-03 | Selisih stok akibat pencatatan ganda (klinik vs online) | Stok terpusat satu sumber data; pengurangan otomatis di kedua alur (A-06/A-07, BR-04). |
| R-04 | Pasien lupa/tidak menggunakan aplikasi, tetap mengandalkan WhatsApp | Jalur WhatsApp tetap dipertahankan sebagai alternatif. |
| R-05 **[BARU]** | Pengingat tidak terbaca karena notifikasi hanya in-app | Terapkan push/local notification (N-03, BR-08). |

# 20. Rencana Pengujian & UAT **[BARU]**

- **Pengujian fungsional:** setiap user story (§14) diuji terhadap kriteria penerimaan (Given/When/Then) — black-box.
- **Pengujian RBAC:** verifikasi matriks §5.1 (akses ditolak di luar peran, termasuk uji langsung ke API).
- **Pengujian data:** konsistensi stok & status lintas modul (BR-04, N-05).
- **UAT:** melibatkan bidan & asisten bidan sebagai pengguna nyata; hasil dicatat sebagai bukti bab pengujian.
- **Definition of Done:** fitur selesai bila lolos kriteria penerimaan, lolos uji RBAC terkait, dan tidak menimbulkan inkonsistensi stok/status.

# 21. Glosarium

| Istilah | Penjelasan |
|---|---|
| RBAC | Role Based Access Control — pembatasan hak akses berdasarkan peran (Bidan, Asisten 1, Asisten 2). |
| Rekam Medis | Catatan hasil pemeriksaan, diagnosis, dan tindakan medis pasien tiap kunjungan. |
| FCFS | First-Come-First-Served — pelayanan sesuai urutan kedatangan. |
| Stok Mutasi | Pencatatan pergerakan stok produk (masuk dari supplier / keluar untuk penjualan atau pemakaian klinis). |
| UU PDP | UU No. 27/2022 tentang Pelindungan Data Pribadi. |
| RME | Rekam Medis Elektronik (Permenkes No. 24/2022). |
| RPO | Recovery Point Objective — batas kehilangan data yang dapat ditoleransi. |

# 22. Lampiran

**Struktur menu Aplikasi Pasien:** Beranda, Appointment, Riwayat Pemeriksaan, Resep, Vaksinasi, Toko, Pesanan, Notifikasi, Profil.

**Struktur menu Dashboard Admin:** Dashboard, Pasien, Appointment, Pemeriksaan, Rekam Medis, Vaksinasi, Resep, Produk/Obat, Stok, Pesanan, Pengguna, Laporan.

**Judul penelitian yang disarankan:** "Perancangan dan Pengembangan Sistem Informasi Pelayanan Kesehatan dan E-Commerce pada Premysis Medika Berbasis Mobile dan Web."

# 23. Riwayat Versi **[BARU]**

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | September 2026 | Draf awal. |
| 1.1 | [isi tanggal] | Perbaikan header tabel; penyeragaman mesin status (appointment/pesanan/pembayaran); penambahan §5.1 Matriks RBAC, §8 Business Rules, §11 Asumsi & Batasan, §20 Rencana Pengujian & UAT, §23 Riwayat Versi; perluasan §9 Non-Fungsional (keamanan, performa, kepatuhan, backup); metrik §10 dibuat SMART; perbaikan model data (§15); penyelarasan MoSCoW (§18); perbaikan referensi R-03. |
