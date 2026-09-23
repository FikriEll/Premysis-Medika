// =============================================================
// Konfigurasi pembayaran bersama (aplikasi pasien + dashboard admin).
//
// Satu sumber supaya instruksi transfer yang dibaca pasien PERSIS
// sama dengan rekening yang dipakai admin saat memverifikasi, dan
// supaya status pembayaran tidak pernah berbeda kata di kedua app.
//
// Fitur Minimal #5 "Pembayaran" (tugas ERP): setelah pesanan dibuat,
// pasien harus punya langkah pembayaran yang jelas, dan klinik harus
// bisa memverifikasinya. File ini menyimpan bagian yang statis
// (rekening + label status); pencatatannya ada di server/index.js.
// =============================================================

// Rekening tujuan transfer klinik.
export const BANK = {
  bank: 'Bank Mandiri',
  nomor: '1370-0099-8877',
  atas_nama: 'Klinik Premysis Medika',
  // Batas waktu pembayaran supaya pesanan tidak menggantung selamanya.
  tenggat_jam: 24,
}

// Status pembayaran pada sebuah pesanan (terpisah dari status pesanan).
// Dipakai sebagai lencana di aplikasi pasien dan kolom di dashboard admin.
export const statusPembayaran = {
  'Belum Bayar': { tone: 'amber', label: 'Belum Bayar' },
  'Menunggu Verifikasi': { tone: 'blue', label: 'Menunggu Verifikasi' },
  Terverifikasi: { tone: 'green', label: 'Terverifikasi' },
  Ditolak: { tone: 'rose', label: 'Ditolak' },
}

export const labelPembayaran = (s) => statusPembayaran[s]?.label || 'Belum Bayar'

// Nominal + kode unik 3 angka supaya admin mudah mencocokkan transfer
// yang masuk dengan pesanan yang mana. Deterministik dari id pesanan,
// jadi pasien dan admin selalu melihat angka yang sama.
export const nominalBayar = (pesanan) => {
  const total = Number(pesanan?.total || 0)
  const kodeUnik = (Number(pesanan?.id || 0) * 137) % 1000
  return { total, kode_unik: kodeUnik, harus_dibayar: total + kodeUnik }
}

// Instruksi pembayaran dalam bahasa manusia (brief §23: tanpa istilah
// teknis). Dipakai halaman Pembayaran pasien.
export const instruksiTransfer = (pesanan) => {
  const { harus_dibayar } = nominalBayar(pesanan)
  return {
    judul: 'Transfer ke rekening klinik',
    langkah: [
      `Buka aplikasi m-banking atau ATM Anda.`,
      `Transfer tepat sejumlah Rp ${harus_dibayar.toLocaleString('id-ID')} ke rekening di bawah.`,
      `Simpan bukti transfer, lalu unggah fotonya di halaman ini.`,
      `Klinik akan memeriksa bukti Anda, biasanya dalam 1x24 jam.`,
    ],
  }
}
