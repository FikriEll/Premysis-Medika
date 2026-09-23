// =============================================================
// Katalog layanan & tenaga kesehatan untuk wizard janji temu.
//
// Sumber data pasien, produk, dan jadwal tetap dari REST API
// bersama. Dua daftar di bawah ini adalah pilihan layanan yang
// memang ditawarkan klinik (mengikuti jenis_layanan pada PRD §6.1),
// jadi tidak perlu endpoint baru.
//
// Brief §8 langkah 1: "Pilih layanan" memakai card besar yang
// dapat ditekan. Brief §8 langkah 2: tampilkan foto, nama, profesi.
// =============================================================
import {
  IconPemeriksaan, IconHati, IconTanya, IconBayi, IconVaksin,
  IconLab, IconPerawatan, IconObat, IconPerawatanKulit,
} from '../components/Icons'

// Layanan yang paling sering dipakai diletakkan lebih dulu, supaya
// pilihan pertama yang terlihat adalah yang paling mungkin dibutuhkan.
//
// Brief §1/§8: "Jangan menampilkan semua pilihan sekaligus" dan
// "maksimal 3-5 tindakan utama dalam satu layar". Karena itu daftar
// panjang dipecah: `utama` tampil dulu (4 kartu besar), sisanya
// disembunyikan di balik satu tombol "Lihat layanan lain". Pasien
// lansia melihat 4 pilihan, bukan 10.
export const LAYANAN = [
  {
    id: 'Pemeriksaan Umum',
    nama: 'Pemeriksaan Umum',
    ket: 'Keluhan ringan seperti demam, batuk, atau sakit kepala',
    Ikon: IconPemeriksaan,
    utama: true,
  },
  {
    id: 'Pemeriksaan Kehamilan',
    nama: 'Pemeriksaan Kehamilan',
    ket: 'Kontrol kandungan rutin dan pemantauan ibu hamil',
    Ikon: IconHati,
    utama: true,
  },
  {
    id: 'Imunisasi Bayi',
    nama: 'Imunisasi Anak',
    ket: 'Vaksin sesuai usia anak, dijadwalkan otomatis',
    Ikon: IconVaksin,
    utama: true,
  },
  {
    id: 'Konsultasi Umum',
    nama: 'Konsultasi',
    ket: 'Tanya bidan soal kesehatan atau KB, tanpa periksa fisik',
    Ikon: IconTanya,
    utama: true,
  },
  {
    id: 'Kontrol Nifas',
    nama: 'Kontrol Setelah Melahirkan',
    ket: 'Pemeriksaan ibu dan bayi setelah persalinan',
    Ikon: IconBayi,
  },
  {
    id: 'Pemeriksaan Lab',
    nama: 'Pemeriksaan Laboratorium',
    ket: 'Cek darah, urine, atau pemeriksaan penunjang lain',
    Ikon: IconLab,
  },
  {
    id: 'Perawatan Luka',
    nama: 'Perawatan Luka',
    ket: 'Ganti perban dan pembersihan luka',
    Ikon: IconPerawatan,
  },
  {
    id: 'Perawatan Kulit',
    nama: 'Perawatan Kulit',
    ket: 'Keluhan kulit, jerawat, atau ruam',
    Ikon: IconPerawatanKulit,
  },
  {
    id: 'Pembelian Obat',
    nama: 'Ambil Obat',
    ket: 'Ambil obat resep atau obat bebas di klinik',
    Ikon: IconObat,
  },
  {
    id: 'Lainnya',
    nama: 'Pemeriksaan Lainnya',
    ket: 'Butuh layanan lain? Bidan akan membantu saat Anda datang',
    Ikon: IconTanya,
  },
]

export const cariLayanan = (id) => LAYANAN.find((l) => l.id === id)

// Tenaga kesehatan yang bisa dipilih pasien.
// Diambil dari data pengguna klinik (seed): Bidan Siska sebagai
// bidan penanggung jawab, Rina sebagai asisten bidan.
// `id_bidan` mengikuti kolom id_bidan pada entitas appointment.
export const TENAGA_KESEHATAN = [
  {
    id: 1,
    nama: 'Siska Mariawati, S.Tr.Keb.',
    profesi: 'Bidan',
    ket: 'Bidan penanggung jawab klinik',
    inisial: 'SM',
  },
  {
    id: 2,
    nama: 'Rina Kartika',
    profesi: 'Asisten Bidan',
    ket: 'Membantu pemeriksaan dan administrasi',
    inisial: 'RK',
  },
]

export const cariTenaga = (id) => TENAGA_KESEHATAN.find((t) => t.id === Number(id))

// Jam praktik klinik. Slot ditampilkan sebagai tombol besar
// (brief §8 langkah 4), bukan dropdown, dan dikelompokkan pagi vs
// siang-sore supaya 16 pilihan tidak menjadi satu dinding angka.
export const JAM_PRAKTIK = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
]

export const JAM_PAGI = JAM_PRAKTIK.filter((s) => Number(s.slice(0, 2)) < 12)
export const JAM_SIANG = JAM_PRAKTIK.filter((s) => Number(s.slice(0, 2)) >= 12)

// Informasi klinik (brief §7): jam operasional, alamat, WhatsApp.
// Ditulis di satu tempat supaya Beranda, detail janji, dan halaman
// bantuan menampilkan hal yang sama persis.
export const KLINIK = {
  nama: 'Premysis Medika',
  tagline: 'Klinik Ibu & Anak',
  alamat: 'Jl. Kesehatan Raya No. 45, Depok, Jawa Barat',
  telepon: '0812-1111-2222',
  wa: '6281211112222',
  // Koordinat klinik: titik nol perhitungan jarak pengiriman.
  // Nilainya HARUS sama dengan KLINIK_KOORDINAT di shared/pengiriman.js.
  lat: -6.4025,
  lng: 106.7942,
  jam: [
    { hari: 'Senin sampai Jumat', waktu: '08.00 - 17.00' },
    { hari: 'Sabtu', waktu: '08.00 - 13.00' },
    { hari: 'Minggu dan hari libur', waktu: 'Tutup' },
  ],
  // Tautan peta sederhana: pengguna bisa menekan "Lihat Lokasi Klinik"
  // lalu aplikasi peta bawaan ponsel membuka alamat ini.
  peta: 'https://maps.google.com/?q=Klinik+Premysis+Medika+Depok',
  tautanWA: (pesan = 'Halo, saya pasien Premysis Medika.') =>
    `https://wa.me/6281211112222?text=${encodeURIComponent(pesan)}`,
}
