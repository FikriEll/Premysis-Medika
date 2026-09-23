# **PRODUCT REQUIREMENTS DOCUMENT (PRD)** 

## **Sistem Informasi Pelayanan Kesehatan & E-Commerce — Premysis Medika** 

_Klinik: Premysis Medika  |  Penanggung jawab klinik: Siska Mariawati, S.Tr.Keb. Disusun oleh: Fikri — 202433500177 — Sistem Informasi, Fakultas Ilmu Komputer, Universitas Indraprasta PGRI_ _<u>Versi 1.0 — September 2026</u>_ 

# 1. Ringkasan Produk (Overview) 

Premysis Medika adalah klinik ibu dan anak yang saat ini menjalankan operasionalnya secara manual/semi-manual: pasien menghubungi bidan melalui WhatsApp untuk membuat janji, rekam medis dicatat secara konvensional, dan tidak ada sistem terpusat untuk data pasien, riwayat pemeriksaan, jadwal vaksinasi bayi, maupun penjualan obat/produk kesehatan. 

Produk ini adalah sistem informasi terintegrasi yang terdiri dari dua bagian utama: (1) Aplikasi Pasien (mobile), dan (2) Dashboard Admin (web) untuk bidan dan asisten bidan. Sistem ini menggabungkan layanan klinis (pemeriksaan, riwayat medis, resep, vaksinasi bayi) dengan modul e-commerce (toko obat & produk kesehatan) dalam satu ekosistem data pasien yang saling terhubung. 

# 2. Latar Belakang 

- Klinik Premysis Medika dikelola oleh 1 bidan (pemilik) dan 2 asisten bidan, tanpa staf admin/apoteker terpisah. 

- Proses temu pasien saat ini dilakukan lewat WhatsApp dan kunjungan langsung (first-come-first-served), belum ada sistem pendaftaran/antrian formal. 

- Volume pasien belum terlalu besar, sehingga sistem antrian kompleks tidak diperlukan pada tahap ini. 

- Pencatatan rekam medis, resep, dan stok obat belum terkomputerisasi sehingga rawan tercecer dan sulit dijadikan bahan laporan/analisis. 

- Ada potensi menambah lini pendapatan lewat penjualan obat & produk kesehatan (vitamin, alat kesehatan, kebutuhan ibu & bayi) secara online. 

# 3. Tujuan 

- Menyediakan satu sistem terpusat untuk data pasien, riwayat pemeriksaan, resep, dan jadwal vaksinasi bayi. 

- Memudahkan bidan & asisten mencatat pemeriksaan dan mengelola rekam medis secara digital. 

- Menyediakan kanal alternatif appointment selain WhatsApp, tanpa menghilangkan kebiasaan pasien menghubungi klinik langsung. 

- Membuka kanal penjualan obat & produk kesehatan secara online (e-commerce) yang terhubung langsung dengan resep dan stok klinik. 

- Menghasilkan laporan operasional (pasien, pemeriksaan, vaksinasi, stok, transaksi) untuk mendukung pengambilan keputusan pemilik klinik. 

# 4. Ruang Lingkup (Scope) 

### 4.1 Termasuk dalam ruang lingkup (In-Scope) 

- Aplikasi mobile untuk pasien: appointment, riwayat pemeriksaan, resep, vaksinasi bayi, toko, keranjang, pesanan, notifikasi, profil. 

- Dashboard web untuk admin (bidan & 2 asisten) dengan Role Based Access Control (RBAC). 

- Modul rekam medis, resep digital, dan manajemen vaksinasi bayi. 

- Modul e-commerce: manajemen produk/obat, stok, keranjang, checkout, dan pesanan, terhubung dengan resep dan pengurangan stok otomatis. 

- Modul laporan (pasien, pemeriksaan, vaksinasi, obat, e-commerce). 

- 4.2 Di luar ruang lingkup (Out-of-Scope) untuk versi 1.0 

- Sistem antrian otomatis (belum diperlukan karena volume pasien masih kecil). 

- Integrasi pembayaran online (payment gateway) — pembayaran awal masih manual/di klinik; dapat menjadi pengembangan lanjutan. 

- Appointment online sebagai jalur wajib — tetap sebagai alternatif, WhatsApp/datang langsung tetap didukung. 

- Integrasi dengan BPJS/asuransi. 

# 5. Pengguna & Peran (User Roles) 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|Pasien|Pengguna aplikasi mobile|Membuat appointment, melihat riwayat pemeriksaan &<br>resep, mengelola data vaksinasi bayi, berbelanja di toko,<br>melihat status pesanan.|
|Bidan (Owner)|Admin utama dashboard|Akses penuh: pemeriksaan, rekam medis, resep, jadwal,<br>vaksinasi, laporan, manajemen pengguna.|
|Asisten 1|Admin dashboard — fokus front<br>office|Manajemen data pasien, pendaftaran, appointment,<br>administrasi umum.|
|Asisten 2|Admin dashboard — fokus e-<br>commerce/stok|Manajemen produk, obat, stok, dan pesanan e-commerce.|



# 6. Kebutuhan Fungsional (Functional Requirements) 

## 6.1 Aplikasi Pasien (Mobile) 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|F-01|Login & Registrasi|Login via email/No. WhatsApp + password, fitur lupa<br>password. Registrasi: nama, NIK, tanggal lahir, jenis kelamin,<br>No. WhatsApp, alamat, password.|
|F-02|Beranda|Menampilkan sapaan, jadwal appointment terdekat, jadwal<br>vaksinasi bayi, status pesanan terakhir, pengingat<br>pemeriksaan/vaksin, dan shortcut ke fitur utama.|
|F-03|Appointment|Pasien membuat janji (jenis layanan, tanggal, waktu, keluhan,<br>catatan). Status: Menunggu Konfirmasi → Dikonfirmasi →<br>Selesai / Dibatalkan. Tombol alternatif Hubungi WhatsApp<br>Klinik tetap tersedia.|
|F-04|Riwayat Pemeriksaan|Menampilkan riwayat per kunjungan: tanggal, jenis<br>pemeriksaan, bidan penanggung jawab, hasil, diagnosis,<br>tindakan, resep.|
|F-05|Resep Digital|Menampilkan resep aktif pasien dengan tombol Beli Obat<br>yang terhubung langsung ke produk terkait di toko.|
|F-06|Vaksinasi Bayi|Pasien dapat mendaftarkan data bayi (nama, NIK, tanggal<br>lahir, jenis kelamin, nama orang tua) dan melihat jadwal serta<br>status vaksin (Selesai/Terjadwal), dengan opsi buat<br>appointment vaksin.|



|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|F-07|Toko (E-Commerce)|Katalog produk berkategori (Obat, Vitamin & Suplemen, Ibu<br>& Bayi, Alat Kesehatan) dengan filter, pencarian, dan<br>halaman detail produk. Produk tertentu diberi label<br>'Memerlukan Resep'.|
|F-08|Keranjang & Checkout|Kelola item keranjang, isi data penerima, pilih metode ambil<br>di klinik/pengiriman dan metode pembayaran, lalu buat<br>pesanan.|
|F-09|Pesanan Saya|Melihat status pesanan: Menunggu Pembayaran → Diproses<br>→ Siap Diambil/Dikirim → Selesai, beserta detail nomor,<br>produk, jumlah, total, dan waktu pemesanan.|
|F-10|Notifikasi|Notifikasi appointment terkonfirmasi, pengingat<br>pemeriksaan/vaksin, status pesanan, dan informasi dari klinik.|
|F-11|Profil|Kelola data pribadi pasien, data bayi/anak, ubah password,<br>dan logout.|



6.2 Dashboard Admin (Web) 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|A-01|Dashboard Ringkasan|Statistik harian (pasien, appointment, pemeriksaan, pesanan<br>baru), daftar appointment hari ini, dan peringatan stok<br>menipis.|
|A-02|Manajemen Pasien|Tambah, edit, nonaktifkan, cari, dan lihat detail data pasien<br>(nama, NIK, tanggal lahir, jenis kelamin, WhatsApp, alamat,<br>tanggal registrasi).|
|A-03|Manajemen Appointment|Lihat semua appointment dengan filter (hari ini/minggu<br>ini/bulan ini/status); konfirmasi, ubah jadwal, batalkan, atau<br>tandai selesai.|
|A-04|Pemeriksaan & Rekam Medis|Bidan input keluhan, riwayat kesehatan, hasil pemeriksaan,<br>diagnosis, tindakan, catatan, resep, dan jadwal kontrol;<br>otomatis tersimpan ke riwayat pasien.|
|A-05|Manajemen Vaksin|Kelola data bayi, jadwal vaksin, pencatatan vaksin yang sudah<br>diberikan, penjadwalan vaksin berikutnya, dan riwayat vaksin<br>per bayi.|
|A-06|Manajemen Produk/Obat|Kelola data produk: nama, kategori, foto, deskripsi, harga,<br>stok, satuan, status, dan penanda wajib-resep.|
|A-07|Manajemen Stok|Pencatatan stok masuk dan stok keluar; stok berkurang<br>otomatis saat obat diberikan ke pasien atau pesanan e-<br>commerce diproses.|
|A-08|Pesanan E-Commerce|Melihat detail pesanan (pasien, produk, total) dan mengubah<br>status pesanan sepanjang alur Menunggu → Diproses → Siap<br>Diambil → Selesai.|
|A-09|Manajemen Resep|Bidan membuat resep (pasien, tanggal, nama obat, dosis,<br>jumlah, aturan pakai, catatan) yang otomatis tampil di aplikasi<br>pasien dan tertaut ke produk toko bila tersedia.|
|A-10|Manajemen Pengguna & RBAC|Kelola akun Bidan (akses penuh), Asisten 1<br>(pasien/pendaftaran/appointment/administrasi), dan Asisten 2|



|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**<br>(produk/obat/stok/pesanan).|
|---|---|---|
|A-11|Laporan|Laporan Pasien, Pemeriksaan, Vaksinasi, Obat (stok, keluar-<br>masuk, produk terlaris), dan E-Commerce (jumlah pesanan,<br>selesai, dibatalkan, total transaksi).|



# 7. Alur Data & Hubungan Antar Modul 

Data pasien menjadi pusat dari seluruh sistem. Alurnya: Appointment menghasilkan data kunjungan → Pemeriksaan mencatat riwayat medis → Riwayat medis dapat menghasilkan Resep → Resep terhubung dengan Produk/Obat di Toko → Pembelian (checkout) mengurangi Stok secara otomatis → seluruh transaksi terekap di modul Laporan. Dengan alur ini, satu data pasien tidak berdiri sendiri, melainkan mengalir dari pelayanan klinis hingga transaksi dan pelaporan. 

# 8. Kebutuhan Non-Fungsional 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|N-01|Keamanan|Autentikasi berbasis password (hash), RBAC untuk membatasi akses tiap<br>peran admin, data NIK & rekam medis hanya dapat diakses oleh peran<br>yang berwenang.|
|N-02|Usability|Antarmuka aplikasi pasien sederhana dan ramah pengguna non-teknis (ibu<br>hamil/orang tua bayi dari berbagai usia).|
|N-03|Ketersediaan|Dashboard admin dapat diakses selama jam operasional klinik; data<br>tersimpan otomatis (autosave) pada input pemeriksaan panjang.|
|N-04|Skalabilitas|Struktur data mendukung penambahan kategori produk atau jenis layanan<br>baru tanpa perubahan besar pada skema.|
|N-05|Konsistensi Data|Perubahan stok, status pesanan, dan status appointment harus konsisten<br>real-time antara aplikasi pasien dan dashboard admin.|



# 9. Metrik Keberhasilan (Success Metrics) 

- Seluruh data pemeriksaan pasien baru tercatat digital (0% pencatatan manual di luar sistem) setelah go-live. 

- Waktu pencarian riwayat pasien oleh bidan berkurang dibanding pencatatan manual sebelumnya. 

- Jadwal vaksinasi bayi tidak ada yang terlewat karena adanya pengingat otomatis. 

- Stok obat/produk selalu sinkron antara transaksi klinik dan transaksi e-commerce (tidak ada selisih akibat pencatatan ganda). 

# 10. Rencana Pengembangan Lanjutan (Out of Scope v1, untuk v2) 

- Integrasi payment gateway untuk pembayaran online. 

- Sistem antrian digital apabila volume pasien klinik meningkat signifikan. 

- Integrasi WhatsApp API agar notifikasi otomatis terkirim langsung ke WhatsApp pasien. 

- Modul telekonsultasi/konsultasi jarak jauh dengan bidan. 

# 11. Persona Pengguna 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|Ibu Hamil / Pasien<br>Kandungan|Usia 20-35 tahun, kontrol rutin<br>kehamilan|Butuh: pengingat jadwal periksa, riwayat<br>kehamilan tersimpan rapi, akses cepat ke resep<br>vitamin/obat.|
|Orang Tua Bayi/Balita|Usia 20-40 tahun, mengurus jadwal<br>imunisasi anak|Butuh: pengingat jadwal vaksin tidak terlewat,<br>riwayat vaksin anak tercatat lengkap untuk<br>keperluan sekolah/KIA.|
|Bidan (Siska Mariawati)|Pemilik & tenaga medis utama klinik|Butuh: input pemeriksaan cepat, akses rekam<br>medis pasien lama, kontrol penuh atas resep &<br>laporan klinik.|
|Asisten Bidan 1|Front office, menangani pendaftaran|Butuh: kelola data pasien & jadwal appointment<br>tanpa perlu akses rekam medis rinci.|
|Asisten Bidan 2|Menangani obat, stok, dan pesanan<br>online|Butuh: pantau stok menipis, proses pesanan e-<br>commerce, update status pesanan cepat.|



# 12. User Stories & Kriteria Penerimaan (Acceptance Criteria) 

### 12.1 Aplikasi Pasien 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|US-01|Sebagai pasien, saya ingin membuat<br>appointment dari aplikasi|Given saya login, When saya isi jenis<br>layanan/tanggal/waktu/keluhan dan submit, Then status<br>appointment saya menjadi 'Menunggu Konfirmasi' dan<br>muncul di Beranda.|
|US-02|Sebagai pasien, saya ingin melihat riwayat<br>pemeriksaan saya|Given saya memiliki riwayat kunjungan, When saya buka<br>menu Riwayat Pemeriksaan, Then saya melihat daftar<br>kunjungan terurut dari terbaru, masing-masing dapat dibuka<br>untuk detail diagnosis & tindakan.|
|US-03|Sebagai pasien, saya ingin langsung<br>membeli obat dari resep|Given bidan telah membuat resep untuk saya, When saya<br>membuka menu Resep, Then saya melihat daftar obat resep<br>dan dapat menekan 'Beli Obat' yang otomatis mengisi<br>keranjang.|
|US-04|Sebagai orang tua, saya ingin mendaftarkan<br>data bayi & memantau jadwal vaksin|Given saya menambahkan data bayi, When jadwal vaksin<br>dibuat oleh admin, Then jadwal tersebut tampil di aplikasi<br>saya dengan status Terjadwal/Selesai dan saya menerima<br>notifikasi pengingat H-1.|
|US-05|Sebagai pasien, saya ingin berbelanja<br>produk kesehatan|Given saya memilih produk & jumlah, When saya checkout<br>dengan memilih metode ambil/kirim dan pembayaran, Then<br>pesanan tercipta dengan status 'Menunggu Pembayaran' dan<br>tampil di menu Pesanan Saya.|



### 12.2 Dashboard Admin 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|US-06|Sebagai bidan, saya ingin mencatat hasil|Given saya membuka profil pasien, When saya isi|
||pemeriksaan pasien|keluhan/hasil/diagnosis/tindakan/resep dan simpan, Then data|



|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|||otomatis tersimpan ke riwayat pemeriksaan pasien dan resep<br>(jika ada) langsung tampil di aplikasi pasien.|
|US-07|Sebagai asisten 2, saya ingin memproses<br>pesanan e-commerce|Given ada pesanan baru berstatus 'Menunggu Pembayaran',<br>When pembayaran dikonfirmasi dan saya ubah status ke<br>'Diproses', Then stok produk terkait otomatis berkurang dan<br>pasien menerima notifikasi.|
|US-08|Sebagai bidan, saya ingin melihat laporan<br>bulanan|Given saya membuka menu Laporan, When saya pilih rentang<br>bulan, Then sistem menampilkan ringkasan jumlah pasien,<br>pemeriksaan, vaksinasi, dan transaksi e-commerce pada<br>periode tersebut.|
|US-09|Sebagai admin, saya ingin dibatasi aksesnya<br>sesuai peran (RBAC)|Given saya login sebagai Asisten 1, When saya mencoba<br>membuka menu Manajemen Produk/Stok, Then sistem<br>menolak akses karena di luar peran saya.|



# 13. Model Data Utama (Entitas Kunci) 

Berikut entitas inti yang direkomendasikan sebagai dasar penyusunan ERD pada Bab 4 laporan: 

|**Entitas**|**Atribut Utama**|
|---|---|
|Pasien|id, nama, NIK, tanggal_lahir, jenis_kelamin, no_wa, alamat, password_hash,<br>tanggal_registrasi|
|Bayi|id, id_pasien (FK), nama, NIK, tanggal_lahir, jenis_kelamin, nama_orang_tua|
|Appointment|id, id_pasien (FK), jenis_layanan, tanggal, waktu, keluhan, catatan, status|
|Pemeriksaan|id, id_pasien (FK), id_appointment (FK, nullable), id_bidan (FK), tanggal, keluhan, hasil,<br>diagnosis, tindakan, catatan|
|Resep|id, id_pemeriksaan (FK), id_pasien (FK), tanggal, status|
|ResepDetail|id, id_resep (FK), id_produk (FK), nama_obat, dosis, jumlah, aturan_pakai|
|JadwalVaksin|id, id_bayi (FK), nama_vaksin, tanggal_terjadwal, tanggal_diberikan, status|
|Produk|id, nama, kategori, foto, deskripsi, harga, stok, satuan, status, wajib_resep (boolean)|
|StokMutasi|id, id_produk (FK), jenis (masuk/keluar), jumlah, tanggal, keterangan, sumber (klinik/e-<br>commerce)|
|Keranjang / KeranjangItem|id, id_pasien (FK), id_produk (FK), jumlah|
|Pesanan|id, id_pasien (FK), nomor_pesanan, total, metode_ambil, metode_bayar, status,<br>waktu_pemesanan|
|PesananDetail|id, id_pesanan (FK), id_produk (FK), jumlah, harga_satuan|
|Pengguna (Admin)|id, nama, email, password_hash, peran (Bidan/Asisten1/Asisten2)|
|Notifikasi|id, id_pasien (FK), judul, pesan, jenis, status_baca, tanggal|



Relasi kunci: Pasien 1—N Appointment, Pasien 1—N Pemeriksaan, Pemeriksaan 1—0/1 Resep, Resep 1—N ResepDetail, Pasien 1—N Bayi, Bayi 1—N JadwalVaksin, Pasien 1—N Pesanan, Pesanan 1—N PesananDetail, Produk 1—N StokMutasi. Detail kardinalitas dan atribut lengkap dapat dituangkan dalam ERD pada Bab 4.2. 

# 14. Rancangan Arsitektur & Teknologi (Usulan) 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|Aplikasi Pasien|Mobile (Android/iOS)|Flutter — sejalan dengan pengalaman proyek EduAttend,<br>mempercepat pengembangan lintas platform.|
|Dashboard Admin|Web|Framework berbasis PHP (mis. Laravel) — sejalan dengan<br>pengalaman proyek BelanjaCepat.com, cocok untuk modul RBAC &<br>e-commerce.|
|Backend/API|REST API|Menjembatani aplikasi mobile dan dashboard web ke satu basis data<br>yang sama agar data pasien konsisten di kedua sisi.|
|Basis Data|Relasional<br>(MySQL/MariaDB/Post<br>greSQL)|Struktur data terhubung (pasien-pemeriksaan-resep-produk-pesanan)<br>cocok untuk model relasional dengan foreign key.|
|Notifikasi|Push notification / in-<br>app|Untuk versi awal cukup notifikasi in-app; integrasi WhatsApp API<br>menjadi pengembangan lanjutan (lihat Bab 10).|
|Penyimpanan Media|Cloud storage / server<br>lokal|Untuk foto produk dan (opsional) lampiran hasil pemeriksaan.|



Catatan: pemilihan teknologi di atas bersifat usulan berdasarkan pengalaman proyek yang relevan, dapat disesuaikan dengan arahan dosen pembimbing atau kebutuhan teknis lanjutan. 

# 15. Rancangan Alur Layar Utama (Wireframe Flow) 

### 15.1 Alur Pasien 

Login/Registrasi → Beranda → (a) Buat Appointment → Konfirmasi → Riwayat Pemeriksaan, atau (b) Toko → Detail Produk → Keranjang → Checkout → Pesanan Saya, atau (c) Resep → Beli Obat dari Resep → Keranjang → Checkout. 

### 15.2 Alur Admin 

Login Admin → Dashboard Ringkasan → (a) Pasien dibuka → Input Pemeriksaan → Resep otomatis tersimpan, atau (b) Pesanan E-Commerce → Konfirmasi Pembayaran → Ubah Status → Stok berkurang otomatis, atau (c) Vaksinasi → Catat Vaksin Diberikan → Jadwal Berikutnya dibuat. 

# 16. Prioritas Pengembangan (MoSCoW) 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|Must Have|Login/registrasi pasien, Manajemen pasien,<br>Pemeriksaan & rekam medis, Resep,<br>Produk/obat, Stok, Laporan dasar|Fitur inti yang membuat sistem layak disebut<br>'sistem informasi klinik'.|
|Should Have|Appointment online, Vaksinasi bayi, RBAC<br>multi-admin, Notifikasi in-app|Meningkatkan kualitas layanan namun klinik<br>masih bisa beroperasi tanpa ini di awal.|
|Could Have|Toko & e-commerce penuh (keranjang, checkout,<br>pesanan)|Nilai tambah pendapatan, dapat menyusul<br>setelah modul klinis stabil.|
|Won't Have (v1)|Payment gateway online, Sistem antrian digital,<br>Integrasi WhatsApp API, Telekonsultasi|Didokumentasikan sebagai pengembangan<br>lanjutan pada Bab 10.|



# 17. Risiko & Mitigasi 

|**ID**|**Modul / Fitur**|**Deskripsi & Kriteria**|
|---|---|---|
|R-01|Resistensi pengguna (bidan/asisten belum<br>terbiasa sistem digital)|Desain antarmuka sederhana, pelatihan singkat saat go-<br>live, migrasi data bertahap.|
|R-02|Data pasien/rekam medis bersifat sensitif|Penerapan RBAC ketat, enkripsi password, pembatasan<br>akses NIK & rekam medis hanya untuk peran<br>berwenang.|
|R-03|Selisih stok akibat pencatatan ganda (klinik vs<br>online)|Stok terpusat satu sumber data; pengurangan otomatis di<br>kedua alur transaksi (F-07/A-07).|
|R-04|Pasien lupa/tidak menggunakan aplikasi, tetap<br>mengandalkan WhatsApp|Jalur WhatsApp tetap dipertahankan sebagai alternatif<br>(bukan sistem dipaksakan menggantikan total).|



# 18. Glosarium 

|**Istilah**|**Penjelasan**|
|---|---|
|RBAC|Role Based Access Control — pembatasan hak akses sistem berdasarkan peran pengguna<br>(Bidan, Asisten 1, Asisten 2).|
|Rekam Medis|Catatan hasil pemeriksaan, diagnosis, dan tindakan medis pasien pada setiap kunjungan.|
|FCFS|First-Come-First-Served — prinsip pelayanan sesuai urutan kedatangan, digunakan klinik<br>karena belum memerlukan sistem antrian formal.|
|Stok Mutasi|Pencatatan pergerakan stok produk, baik stok masuk (pembelian ke supplier) maupun stok<br>keluar (penjualan/pemakaian klinis).|



# 19. Lampiran 

Struktur menu Aplikasi Pasien: Beranda, Appointment, Riwayat Pemeriksaan, Resep, Vaksinasi, Toko, Pesanan, Notifikasi, Profil. 

Struktur menu Dashboard Admin: Dashboard, Pasien, Appointment, Pemeriksaan, Rekam Medis, Vaksinasi, Resep, Produk/Obat, Stok, Pesanan, Pengguna, Laporan. 

Judul penelitian yang disarankan: "Perancangan dan Pengembangan Sistem Informasi Pelayanan Kesehatan dan E- Commerce pada Premysis Medika Berbasis Mobile dan Web." 

