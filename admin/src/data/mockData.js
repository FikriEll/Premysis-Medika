// =============================================================
// MOCK DATA - Premysis Medika Dashboard
// Semua data di bawah ini adalah data contoh (dummy) untuk keperluan
// pengembangan frontend. Nanti diganti dengan pemanggilan REST API.
// =============================================================

export const roleLabels = {
  bidan: 'Bidan (Owner)',
  asisten: 'Asisten Bidan',
}

// --- Pengguna (Admin) - §15 ---
// Catatan: Asisten 1 (front office) & Asisten 2 (e-commerce/stok) digabung
// menjadi satu peran "asisten" dengan hak akses gabungan.
export const users = [
  { id: 1, nama: 'Siska Mariawati, S.Tr.Keb.', email: 'siska@premysismedika.id', peran: 'bidan', status_aktif: true, no_hp: '0812-1111-2222' },
  { id: 2, nama: 'Rina Kartika', email: 'rina@premysismedika.id', peran: 'asisten', status_aktif: true, no_hp: '0812-3333-4444' },
  { id: 4, nama: 'Ayu Lestari', email: 'ayu@premysismedika.id', peran: 'asisten', status_aktif: false, no_hp: '0812-7777-8888' },
]

// --- Pasien ---
export const pasien = [
  { id: 1, nama: 'Siti Nurhaliza', nik: '3276010101990001', tanggal_lahir: '1999-01-01', jenis_kelamin: 'P', no_wa: '0813-9000-0001', alamat: 'Jl. Melati No. 12, Depok', tanggal_registrasi: '2026-01-05', status_aktif: true },
  { id: 2, nama: 'Dewi Lestari', nik: '3276010202950002', tanggal_lahir: '1995-02-02', jenis_kelamin: 'P', no_wa: '0813-9000-0002', alamat: 'Jl. Mawar No. 8, Depok', tanggal_registrasi: '2026-01-09', status_aktif: true },
  { id: 3, nama: 'Ahmad Fauzi', nik: '3276010303900003', tanggal_lahir: '1990-03-03', jenis_kelamin: 'L', no_wa: '0813-9000-0003', alamat: 'Jl. Kenanga No. 3, Jakarta', tanggal_registrasi: '2026-02-01', status_aktif: true },
  { id: 4, nama: 'Ratna Sari', nik: '3276010404880004', tanggal_lahir: '1988-04-04', jenis_kelamin: 'P', no_wa: '0813-9000-0004', alamat: 'Jl. Anggrek No. 21, Depok', tanggal_registrasi: '2026-02-11', status_aktif: true },
  { id: 5, nama: 'Maya Putri', nik: '3276010505970005', tanggal_lahir: '1997-05-05', jenis_kelamin: 'P', no_wa: '0813-9000-0005', alamat: 'Jl. Dahlia No. 5, Bogor', tanggal_registrasi: '2026-03-02', status_aktif: true },
  { id: 6, nama: 'Budi Santoso', nik: '3276010606850006', tanggal_lahir: '1985-06-06', jenis_kelamin: 'L', no_wa: '0813-9000-0006', alamat: 'Jl. Flamboyan No. 9, Depok', tanggal_registrasi: '2026-03-14', status_aktif: false },
  { id: 7, nama: 'Indah Permata', nik: '3276010707920007', tanggal_lahir: '1992-07-07', jenis_kelamin: 'P', no_wa: '0813-9000-0007', alamat: 'Jl. Cempaka No. 17, Jakarta', tanggal_registrasi: '2026-03-28', status_aktif: true },
  { id: 8, nama: 'Nur Aisyah', nik: '3276010808960008', tanggal_lahir: '1996-08-08', jenis_kelamin: 'P', no_wa: '0813-9000-0008', alamat: 'Jl. Kamboja No. 2, Depok', tanggal_registrasi: '2026-04-04', status_aktif: true },
]

// --- Bayi ---
export const bayi = [
  { id: 1, id_pasien: 2, nama: 'Kenzo Alfarizi', nik: '3276010202950002', tanggal_lahir: '2025-10-12', jenis_kelamin: 'L', nama_orang_tua: 'Dewi Lestari' },
  { id: 2, id_pasien: 4, nama: 'Alesha Kirana', nik: '3276010404880004', tanggal_lahir: '2025-11-20', jenis_kelamin: 'P', nama_orang_tua: 'Ratna Sari' },
  { id: 3, id_pasien: 5, nama: 'Binar Prayoga', nik: '3276010505970005', tanggal_lahir: '2026-01-08', jenis_kelamin: 'L', nama_orang_tua: 'Maya Putri' },
  { id: 4, id_pasien: 8, nama: 'Zahra Amelia', nik: '3276010808960008', tanggal_lahir: '2026-02-15', jenis_kelamin: 'P', nama_orang_tua: 'Nur Aisyah' },
]

// --- Jenis Vaksin (master) ---
export const jenisVaksin = [
  { id: 1, nama_vaksin: 'BCG', usia_bulan: 1, deskripsi: 'Tuberkulosis' },
  { id: 2, nama_vaksin: 'Hepatitis B-1', usia_bulan: 0, deskripsi: 'Hepatitis B dosis 1' },
  { id: 3, nama_vaksin: 'Polio-1', usia_bulan: 1, deskripsi: 'Polio dosis 1' },
  { id: 4, nama_vaksin: 'DPT-HB-Hib-1', usia_bulan: 2, deskripsi: 'Difteri, Pertusis, Tetanus, Hepatitis B, Hib' },
  { id: 5, nama_vaksin: 'Polio-2', usia_bulan: 2, deskripsi: 'Polio dosis 2' },
  { id: 6, nama_vaksin: 'DPT-HB-Hib-2', usia_bulan: 3, deskripsi: 'Dosis 2' },
  { id: 7, nama_vaksin: 'Campak-Rubella', usia_bulan: 9, deskripsi: 'MR dosis 1' },
]

// --- Jadwal Vaksin ---
export const jadwalVaksin = [
  { id: 1, id_bayi: 1, id_jenis_vaksin: 1, nama_vaksin: 'BCG', tanggal_terjadwal: '2025-11-12', tanggal_diberikan: '2025-11-12', status: 'Selesai' },
  { id: 2, id_bayi: 1, id_jenis_vaksin: 3, nama_vaksin: 'Polio-1', tanggal_terjadwal: '2025-11-12', tanggal_diberikan: '2025-11-12', status: 'Selesai' },
  { id: 3, id_bayi: 1, id_jenis_vaksin: 4, nama_vaksin: 'DPT-HB-Hib-1', tanggal_terjadwal: '2025-12-12', tanggal_diberikan: '2025-12-14', status: 'Selesai' },
  { id: 4, id_bayi: 1, id_jenis_vaksin: 6, nama_vaksin: 'DPT-HB-Hib-2', tanggal_terjadwal: '2026-04-20', tanggal_diberikan: null, status: 'Terjadwal' },
  { id: 5, id_bayi: 2, id_jenis_vaksin: 1, nama_vaksin: 'BCG', tanggal_terjadwal: '2025-12-20', tanggal_diberikan: '2025-12-20', status: 'Selesai' },
  { id: 6, id_bayi: 2, id_jenis_vaksin: 4, nama_vaksin: 'DPT-HB-Hib-1', tanggal_terjadwal: '2026-01-20', tanggal_diberikan: '2026-01-22', status: 'Selesai' },
  { id: 7, id_bayi: 2, id_jenis_vaksin: 6, nama_vaksin: 'DPT-HB-Hib-2', tanggal_terjadwal: '2026-04-25', tanggal_diberikan: null, status: 'Terjadwal' },
  { id: 8, id_bayi: 3, id_jenis_vaksin: 2, nama_vaksin: 'Hepatitis B-1', tanggal_terjadwal: '2026-01-08', tanggal_diberikan: '2026-01-08', status: 'Selesai' },
  { id: 9, id_bayi: 3, id_jenis_vaksin: 1, nama_vaksin: 'BCG', tanggal_terjadwal: '2026-02-08', tanggal_diberikan: null, status: 'Terjadwal' },
  { id: 10, id_bayi: 4, id_jenis_vaksin: 2, nama_vaksin: 'Hepatitis B-1', tanggal_terjadwal: '2026-02-15', tanggal_diberikan: '2026-02-15', status: 'Selesai' },
  { id: 11, id_bayi: 4, id_jenis_vaksin: 1, nama_vaksin: 'BCG', tanggal_terjadwal: '2026-03-15', tanggal_diberikan: null, status: 'Terjadwal' },
]

// --- Appointment ---
export const appointment = [
  { id: 1, id_pasien: 1, id_bidan: 1, jenis_layanan: 'Pemeriksaan Kehamilan', tanggal: '2026-04-20', waktu: '09:00', keluhan: 'Kontrol rutin kehamilan trimester 2', catatan: '', status: 'Dikonfirmasi' },
  { id: 2, id_pasien: 2, id_bidan: 1, jenis_layanan: 'Imunisasi Bayi', tanggal: '2026-04-20', waktu: '10:00', keluhan: 'Vaksin DPT-HB-Hib-2 untuk Kenzo', catatan: '', status: 'Dikonfirmasi' },
  { id: 3, id_pasien: 3, id_bidan: 1, jenis_layanan: 'Konsultasi Umum', tanggal: '2026-04-20', waktu: '11:00', keluhan: 'Demam 2 hari', catatan: 'Bawa hasil lab', status: 'Menunggu Konfirmasi' },
  { id: 4, id_pasien: 4, id_bidan: 1, jenis_layanan: 'Kontrol Nifas', tanggal: '2026-04-21', waktu: '09:30', keluhan: 'Kontrol pasca melahirkan', catatan: '', status: 'Menunggu Konfirmasi' },
  { id: 5, id_pasien: 5, id_bidan: 1, jenis_layanan: 'KB / Kontrasepsi', tanggal: '2026-04-21', waktu: '13:00', keluhan: 'Pemasangan IUD', catatan: '', status: 'Dikonfirmasi' },
  { id: 6, id_pasien: 7, id_bidan: 1, jenis_layanan: 'Pemeriksaan Kehamilan', tanggal: '2026-04-18', waktu: '10:00', keluhan: 'Kontrol rutin', catatan: '', status: 'Selesai' },
  { id: 7, id_pasien: 8, id_bidan: 1, jenis_layanan: 'Imunisasi Bayi', tanggal: '2026-04-15', waktu: '09:00', keluhan: 'Vaksin BCG Zahra', catatan: '', status: 'Selesai' },
  { id: 8, id_pasien: 1, id_bidan: 1, jenis_layanan: 'Konsultasi Umum', tanggal: '2026-04-10', waktu: '14:00', keluhan: 'Sakit kepala', catatan: '', status: 'Dibatalkan' },
  { id: 9, id_pasien: 2, id_bidan: 1, jenis_layanan: 'Pemeriksaan Kehamilan', tanggal: '2026-04-22', waktu: '09:00', keluhan: 'Kontrol kehamilan', catatan: '', status: 'Menunggu Konfirmasi' },
  { id: 10, id_pasien: 5, id_bidan: 1, jenis_layanan: 'Konsultasi Umum', tanggal: '2026-04-19', waktu: '15:00', keluhan: 'Batuk berdahak', catatan: '', status: 'Selesai' },
]

// --- Pemeriksaan ---
export const pemeriksaan = [
  { id: 1, id_pasien: 7, id_appointment: 6, id_bidan: 1, tanggal: '2026-04-18', keluhan: 'Kontrol rutin kehamilan', hasil: 'TFU 24 cm, DJJ 140x/menit, tekanan darah 110/70', diagnosis: 'Kehamilan normal G2P1A0 UK 24 minggu', tindakan: 'Pemeriksaan ANC rutin, USG', catatan: 'Kontrol 1 bulan lagi' },
  { id: 2, id_pasien: 8, id_appointment: 7, id_bidan: 1, tanggal: '2026-04-15', keluhan: 'Imunisasi BCG', hasil: 'BB 4.2 kg, suhu 36.8°C, kondisi sehat', diagnosis: 'Bayi sehat, siap imunisasi', tindakan: 'Pemberian vaksin BCG 0.05 ml', catatan: 'Observasi 30 menit' },
  { id: 3, id_pasien: 5, id_appointment: 10, id_bidan: 1, tanggal: '2026-04-19', keluhan: 'Batuk berdahak 5 hari', hasil: 'Faring hiperemis, suhu 37.5°C', diagnosis: 'ISPA (Infeksi Saluran Pernapasan Akut)', tindakan: 'Pemberian resep obat batuk & vitamin', catatan: 'Kontrol bila tidak membaik 3 hari' },
  { id: 4, id_pasien: 2, id_appointment: null, id_bidan: 1, tanggal: '2026-04-12', keluhan: 'Nyeri perut bagian bawah', hasil: 'Tekanan darah 120/80, nyeri tekan abdomen', diagnosis: 'Dismenore', tindakan: 'Pemberian analgesik', catatan: '' },
]

// --- Produk (Kategori: 1 Obat, 2 Vitamin & Suplemen, 3 Ibu & Bayi, 4 Alat Kesehatan) ---
export const kategori = [
  { id: 1, nama: 'Obat', deskripsi: 'Obat-obatan umum' },
  { id: 2, nama: 'Vitamin & Suplemen', deskripsi: 'Vitamin dan suplemen kesehatan' },
  { id: 3, nama: 'Ibu & Bayi', deskripsi: 'Kebutuhan ibu dan bayi' },
  { id: 4, nama: 'Alat Kesehatan', deskripsi: 'Peralatan kesehatan' },
]

export const produk = [
  { id: 1, id_kategori: 1, nama: 'Paracetamol 500mg', deskripsi: 'Obat penurun demam & pereda nyeri', harga: 12000, stok: 120, satuan: 'strip', stok_minimum: 20, status: 'Aktif', wajib_resep: false },
  { id: 2, id_kategori: 1, nama: 'Amoxicillin 500mg', deskripsi: 'Antibiotik (wajib resep dokter)', harga: 35000, stok: 45, satuan: 'strip', stok_minimum: 15, status: 'Aktif', wajib_resep: true },
  { id: 3, id_kategori: 1, nama: 'OBH Combi Batuk', deskripsi: 'Sirup obat batuk', harga: 22000, stok: 8, satuan: 'botol', stok_minimum: 10, status: 'Aktif', wajib_resep: false },
  { id: 4, id_kategori: 2, nama: 'Folamil Genio', deskripsi: 'Vitamin ibu hamil & menyusui', harga: 55000, stok: 60, satuan: 'box', stok_minimum: 15, status: 'Aktif', wajib_resep: false },
  { id: 5, id_kategori: 2, nama: 'Vitamin D3 1000 IU', deskripsi: 'Suplemen vitamin D', harga: 48000, stok: 32, satuan: 'botol', stok_minimum: 10, status: 'Aktif', wajib_resep: false },
  { id: 6, id_kategori: 2, nama: 'Sangobion', deskripsi: 'Suplemen penambah darah', harga: 32000, stok: 5, satuan: 'strip', stok_minimum: 15, status: 'Aktif', wajib_resep: false },
  { id: 7, id_kategori: 3, nama: 'Minyak Telon Bayi', deskripsi: 'Minyak penghangat bayi', harga: 18000, stok: 90, satuan: 'botol', stok_minimum: 20, status: 'Aktif', wajib_resep: false },
  { id: 8, id_kategori: 3, nama: 'Diapers Bayi M', deskripsi: 'Popok bayi ukuran M', harga: 65000, stok: 40, satuan: 'pack', stok_minimum: 15, status: 'Aktif', wajib_resep: false },
  { id: 9, id_kategori: 4, nama: 'Termometer Digital', deskripsi: 'Termometer digital badan', harga: 75000, stok: 18, satuan: 'pcs', stok_minimum: 5, status: 'Aktif', wajib_resep: false },
  { id: 10, id_kategori: 4, nama: 'Masker Medis 3ply (50pcs)', deskripsi: 'Masker medis sekali pakai', harga: 40000, stok: 3, satuan: 'box', stok_minimum: 10, status: 'Aktif', wajib_resep: false },
  { id: 11, id_kategori: 1, nama: 'Antasida Suspensi', deskripsi: 'Obat maag', harga: 25000, stok: 0, satuan: 'botol', stok_minimum: 10, status: 'Nonaktif', wajib_resep: false },
  { id: 12, id_kategori: 3, nama: 'Breast Pad (30pcs)', deskripsi: 'Pelindung payudara ibu menyusui', harga: 38000, stok: 25, satuan: 'box', stok_minimum: 10, status: 'Aktif', wajib_resep: false },
]

// --- Stok Mutasi ---
export const stokMutasi = [
  { id: 1, id_produk: 1, jenis: 'masuk', jumlah: 100, tanggal: '2026-04-01', keterangan: 'Pembelian supplier PT Sehat Jaya', sumber: 'klinik', id_pengguna: 2 },
  { id: 2, id_produk: 2, jenis: 'masuk', jumlah: 50, tanggal: '2026-04-01', keterangan: 'Pembelian supplier', sumber: 'klinik', id_pengguna: 2 },
  { id: 3, id_produk: 1, jenis: 'keluar', jumlah: 5, tanggal: '2026-04-19', keterangan: 'Pemberian obat klinis (Pemeriksaan #3)', sumber: 'klinik', id_pengguna: 1 },
  { id: 4, id_produk: 3, jenis: 'keluar', jumlah: 12, tanggal: '2026-04-14', keterangan: 'Pesanan #ORD-0002', sumber: 'e-commerce', id_pengguna: 2 },
  { id: 5, id_produk: 7, jenis: 'masuk', jumlah: 50, tanggal: '2026-04-05', keterangan: 'Restok', sumber: 'klinik', id_pengguna: 2 },
  { id: 6, id_produk: 6, jenis: 'keluar', jumlah: 10, tanggal: '2026-04-16', keterangan: 'Pesanan #ORD-0004', sumber: 'e-commerce', id_pengguna: 2 },
]

// --- Resep ---
export const resep = [
  { id: 1, id_pemeriksaan: 3, id_pasien: 5, id_bidan: 1, tanggal: '2026-04-19', status: 'Aktif', detail: [
    { id: 1, id_produk: 3, nama_obat: 'OBH Combi Batuk', dosis: '3x sehari', jumlah: 1, aturan_pakai: '1 sendok takar setelah makan' },
    { id: 2, id_produk: 5, nama_obat: 'Vitamin D3 1000 IU', dosis: '1x sehari', jumlah: 1, aturan_pakai: '1 tablet pagi hari' },
  ]},
  { id: 2, id_pemeriksaan: 4, id_pasien: 2, id_bidan: 1, tanggal: '2026-04-12', status: 'Selesai', detail: [
    { id: 3, id_produk: 1, nama_obat: 'Paracetamol 500mg', dosis: '3x sehari', jumlah: 1, aturan_pakai: '1 tablet bila nyeri' },
  ]},
  { id: 3, id_pemeriksaan: 1, id_pasien: 7, id_bidan: 1, tanggal: '2026-04-18', status: 'Aktif', detail: [
    { id: 4, id_produk: 4, nama_obat: 'Folamil Genio', dosis: '1x sehari', jumlah: 2, aturan_pakai: '1 kapsul setelah makan' },
  ]},
]

// --- Pesanan E-Commerce ---
export const pesanan = [
  { id: 1, nomor_pesanan: 'ORD-20260420-0001', id_pasien: 1, total: 67000, biaya_kirim: 0, alamat_pengiriman: '-', metode_ambil: 'Ambil di Klinik', metode_bayar: 'Transfer Bank', status: 'Menunggu Pembayaran', waktu_pemesanan: '2026-04-20 08:15', detail: [
    { id: 1, id_produk: 4, jumlah: 1, harga_satuan: 55000 },
    { id: 2, id_produk: 1, jumlah: 1, harga_satuan: 12000 },
  ]},
  { id: 2, nomor_pesanan: 'ORD-20260419-0002', id_pasien: 3, total: 88000, biaya_kirim: 15000, alamat_pengiriman: 'Jl. Kenanga No. 3, Jakarta', metode_ambil: 'Dikirim', metode_bayar: 'Transfer Bank', status: 'Diproses', waktu_pemesanan: '2026-04-19 14:30', detail: [
    { id: 3, id_produk: 3, jumlah: 2, harga_satuan: 22000 },
    { id: 4, id_produk: 9, jumlah: 1, harga_satuan: 75000 },
  ]},
  { id: 3, nomor_pesanan: 'ORD-20260418-0003', id_pasien: 5, total: 65000, biaya_kirim: 0, alamat_pengiriman: '-', metode_ambil: 'Ambil di Klinik', metode_bayar: 'Tunai', status: 'Siap Diambil', waktu_pemesanan: '2026-04-18 10:05', detail: [
    { id: 5, id_produk: 8, jumlah: 1, harga_satuan: 65000 },
  ]},
  { id: 4, nomor_pesanan: 'ORD-20260416-0004', id_pasien: 8, total: 118000, biaya_kirim: 0, alamat_pengiriman: '-', metode_ambil: 'Ambil di Klinik', metode_bayar: 'Transfer Bank', status: 'Selesai', waktu_pemesanan: '2026-04-16 09:40', detail: [
    { id: 6, id_produk: 6, jumlah: 2, harga_satuan: 32000 },
    { id: 7, id_produk: 12, jumlah: 1, harga_satuan: 38000 },
    { id: 8, id_produk: 7, jumlah: 1, harga_satuan: 18000 },
  ]},
  { id: 5, nomor_pesanan: 'ORD-20260414-0005', id_pasien: 4, total: 90000, biaya_kirim: 0, alamat_pengiriman: '-', metode_ambil: 'Ambil di Klinik', metode_bayar: 'Tunai', status: 'Dibatalkan', waktu_pemesanan: '2026-04-14 16:20', detail: [
    { id: 9, id_produk: 9, jumlah: 1, harga_satuan: 75000 },
  ]},
  { id: 6, nomor_pesanan: 'ORD-20260420-0006', id_pasien: 7, total: 48000, biaya_kirim: 0, alamat_pengiriman: '-', metode_ambil: 'Ambil di Klinik', metode_bayar: 'Transfer Bank', status: 'Dibayar', waktu_pemesanan: '2026-04-20 11:10', detail: [
    { id: 10, id_produk: 5, jumlah: 1, harga_satuan: 48000 },
  ]},
]

// --- Notifikasi ---
export const notifikasi = [
  { id: 1, id_pasien: 2, judul: 'Pengingat Vaksin H-1', pesan: 'Vaksin DPT-HB-Hib-2 untuk Kenzo dijadwalkan besok.', jenis: 'vaksin', status_baca: false, tanggal: '2026-04-19 08:00' },
  { id: 2, id_pasien: 1, judul: 'Appointment Dikonfirmasi', pesan: 'Appointment Anda tanggal 20 Apr 2026 pukul 09:00 telah dikonfirmasi.', jenis: 'appointment', status_baca: true, tanggal: '2026-04-18 09:30' },
  { id: 3, id_pasien: 3, judul: 'Pesanan Diproses', pesan: 'Pesanan ORD-20260419-0002 sedang diproses.', jenis: 'pesanan', status_baca: false, tanggal: '2026-04-19 15:00' },
]

// --- Log Aktivitas (Audit Trail) ---
export const logAktivitas = [
  { id: 1, id_pengguna: 1, aksi: 'Membuat resep', entitas: 'Resep', id_entitas: 1, waktu: '2026-04-19 10:15' },
  { id: 2, id_pengguna: 2, aksi: 'Konfirmasi pembayaran', entitas: 'Pesanan', id_entitas: 6, waktu: '2026-04-20 11:20' },
  { id: 3, id_pengguna: 2, aksi: 'Menambah pasien', entitas: 'Pasien', id_entitas: 8, waktu: '2026-04-04 08:45' },
  { id: 4, id_pengguna: 1, aksi: 'Mencatat pemeriksaan', entitas: 'Pemeriksaan', id_entitas: 3, waktu: '2026-04-19 10:00' },
]

// =============================================================
// Helper untuk tampilan
// =============================================================
// Tanggal hari ini (YYYY-MM-DD). Dulu nilai ini di-hardcode ke tanggal
// demo 2026-04-20, sehingga dashboard yang membaca data nyata dari API
// menampilkan nol ("tidak ada jadwal hari ini") setiap hari setelahnya.
export const hariIni = () => new Date().toISOString().slice(0, 10)

export const fmtRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

export const fmtTanggal = (s) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d)) return s
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ---------------------------------------------------------------
// Lookup nama.
//
// Halaman admin sekarang memuat data dari REST API bersama (lihat
// context/DataContext.jsx). Karena itu tabel rujukan di bawah ini
// harus mengikuti data hidup, bukan hanya array statis di file ini.
// DataProvider memanggil setSnapshot() setiap kali data dimuat;
// helper di bawah otomatis memakai data terbaru bila tersedia.
// ---------------------------------------------------------------
let SNAPSHOT = null

export function setSnapshot(s) {
  SNAPSHOT = s || null
}

const sumber = (kunci, statis) => (SNAPSHOT && Array.isArray(SNAPSHOT[kunci]) ? SNAPSHOT[kunci] : statis)

export const namaPasien = (id) => sumber('pasien', pasien).find((p) => p.id === id)?.nama || '-'
export const namaBayi = (id) => sumber('bayi', bayi).find((b) => b.id === id)?.nama || '-'
export const namaProduk = (id) => sumber('produk', produk).find((p) => p.id === id)?.nama || '-'
export const namaKategori = (id) => sumber('kategori', kategori).find((k) => k.id === id)?.nama || '-'
export const namaPengguna = (id) => sumber('users', users).find((u) => u.id === id)?.nama || '-'

// Versi aman untuk komponen: mengembalikan objek, bukan hanya nama.
export const cariPasien = (id) => sumber('pasien', pasien).find((p) => p.id === id) || null
export const cariProduk = (id) => sumber('produk', produk).find((p) => p.id === id) || null
export const cariBayi = (id) => sumber('bayi', bayi).find((b) => b.id === id) || null

// Statistik dashboard - §A-01
export const dashboardStats = () => {
  const tgl = hariIni()
  const ps = sumber('pasien', pasien)
  const ap = sumber('appointment', appointment)
  const pm = sumber('pemeriksaan', pemeriksaan)
  const pn = sumber('pesanan', pesanan)
  const pd = sumber('produk', produk)
  return {
    pasienBaru: ps.filter((p) => p.tanggal_registrasi === tgl).length,
    totalPasien: ps.length,
    appointmentHariIni: ap.filter((a) => a.tanggal === tgl).length,
    pemeriksaanHariIni: pm.filter((p) => p.tanggal === tgl).length,
    pesananBaru: pn.filter((p) => p.status === 'Menunggu Pembayaran').length,
    stokMenipis: pd.filter((p) => p.stok <= p.stok_minimum).length,
  }
}
