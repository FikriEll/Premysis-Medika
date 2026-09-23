// Formatter bersama untuk kedua aplikasi (admin & pasien).
// Satu sumber supaya angka dan tanggal tidak pernah beda format.

// Tanggal "hari ini" untuk demo. Data contoh berada di April 2026,
// jadi waktu demo disamakan supaya jadwal & pengingat terasa nyata.
export const DEMO_TANGGAL = '2026-04-20'

// Waktu demo: tanggal tetap (agar konsisten dengan data contoh),
// jam-menit ikut jam asli supaya tiap catatan baru punya waktu unik.
export const waktuDemo = () => {
  const d = new Date()
  const jam = String(d.getHours()).padStart(2, '0')
  const menit = String(d.getMinutes()).padStart(2, '0')
  const detik = String(d.getSeconds()).padStart(2, '0')
  return `${DEMO_TANGGAL} ${jam}:${menit}:${detik}`
}

// Ubah objek Date menjadi 'YYYY-MM-DD' memakai komponen LOKAL.
//
// JANGAN pakai toISOString() untuk ini: ia mengubah ke UTC, sehingga di
// zona WIB (UTC+7) tanggal mundur satu hari. Contoh nyata: pengguna
// menekan "Sen 20 Apr" di wizard janji temu, tetapi yang tersimpan
// 2026-04-19 (Minggu) - pasien bisa datang di hari yang salah.
export const keISO = (d) => {
  const t = new Date(d)
  const bulan = String(t.getMonth() + 1).padStart(2, '0')
  const hari = String(t.getDate()).padStart(2, '0')
  return `${t.getFullYear()}-${bulan}-${hari}`
}

export const tanggalDemoBesok = (hari = 1) => {
  const d = new Date(DEMO_TANGGAL + 'T00:00:00')
  d.setDate(d.getDate() + hari)
  return keISO(d)
}

export const fmtRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

export const fmtAngka = (n) => new Intl.NumberFormat('id-ID').format(n || 0)

export const fmtTanggal = (s) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d)) return s
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const fmtTanggalPanjang = (s) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d)) return s
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export const fmtWaktu = (s) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d)) return s
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// Jam gaya Indonesia dengan TITIK, bukan titik dua.
//
// Brief aplikasi pasien §8 (pilih waktu: "09.00", "09.30") dan §9
// ("10.00 WIB") memakai format ini, jadi jam jadwal ditampilkan
// seragam di seluruh aplikasi pasien.
export const fmtJam = (s) => (s ? String(s).replace(':', '.') : '-')

// Hitung usia dalam bulan dari tanggal lahir (untuk jadwal vaksin bayi).
export const usiaBulan = (tanggalLahir, sampai = new Date()) => {
  const lahir = new Date(tanggalLahir)
  if (isNaN(lahir)) return 0
  let bulan = (sampai.getFullYear() - lahir.getFullYear()) * 12 + (sampai.getMonth() - lahir.getMonth())
  if (sampai.getDate() < lahir.getDate()) bulan -= 1
  return Math.max(0, bulan)
}

export const labelUsia = (tanggalLahir) => {
  const b = usiaBulan(tanggalLahir)
  if (b < 1) return 'Baru lahir'
  if (b < 12) return `${b} bulan`
  const th = Math.floor(b / 12)
  const sisa = b % 12
  return sisa ? `${th} tahun ${sisa} bulan` : `${th} tahun`
}

export const statusPesanan = {
  'Menunggu Pembayaran': { tone: 'amber', label: 'Menunggu Pembayaran' },
  Dibayar: { tone: 'blue', label: 'Dibayar' },
  Diproses: { tone: 'blue', label: 'Diproses' },
  'Siap Diambil': { tone: 'accent', label: 'Siap Diambil' },
  Dikirim: { tone: 'accent', label: 'Dikirim' },
  Selesai: { tone: 'green', label: 'Selesai' },
  Dibatalkan: { tone: 'rose', label: 'Dibatalkan' },
}

export const statusAppointment = {
  'Menunggu Konfirmasi': { tone: 'amber', label: 'Menunggu Konfirmasi' },
  Dikonfirmasi: { tone: 'blue', label: 'Dikonfirmasi' },
  Selesai: { tone: 'green', label: 'Selesai' },
  Dibatalkan: { tone: 'rose', label: 'Dibatalkan' },
  'Tidak Hadir': { tone: 'rose', label: 'Tidak Hadir' },
}

export const statusVaksin = {
  Terjadwal: { tone: 'amber', label: 'Terjadwal' },
  Selesai: { tone: 'green', label: 'Selesai' },
  Terlewat: { tone: 'rose', label: 'Terlewat' },
}

// Mesin status pesanan kanonik - PRD BR-02.
// Transisi hanya boleh mengikuti alur ini.
export const ALUR_PESANAN = [
  'Menunggu Pembayaran',
  'Dibayar',
  'Diproses',
  'Siap Diambil',
  'Selesai',
]

export const nextStatusPesanan = (status, metodeAmbil) => {
  if (status === 'Menunggu Pembayaran') return 'Dibayar'
  if (status === 'Dibayar') return 'Diproses'
  if (status === 'Diproses') return metodeAmbil === 'Dikirim' ? 'Dikirim' : 'Siap Diambil'
  if (status === 'Siap Diambil' || status === 'Dikirim') return 'Selesai'
  return null
}

export const bolehDibatalkanPasien = (status) => status === 'Menunggu Pembayaran'
