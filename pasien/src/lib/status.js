// =============================================================
// Peta status pesanan & pembayaran apotek -> bahasa pasien.
//
// Nilai status datang dari API apotek dalam bahasa Inggris
// (pending_payment, paid, ...). File ini satu-satunya tempat yang
// menerjemahkannya, supaya semua halaman memakai kata yang sama.
// =============================================================

export const TONE_PESANAN = {
  pending_payment: 'amber',
  awaiting_prescription: 'amber',
  paid: 'blue',
  processing: 'blue',
  shipped: 'accent',
  delivered: 'accent',
  completed: 'green',
  cancelled: 'rose',
  expired: 'rose',
  refunded: 'rose',
}

export const LABEL_PESANAN = {
  pending_payment: 'Menunggu Pembayaran',
  awaiting_prescription: 'Menunggu Verifikasi Resep',
  paid: 'Sudah Dibayar',
  processing: 'Sedang Diproses',
  shipped: 'Dalam Pengiriman',
  delivered: 'Pesanan Diterima',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
  refunded: 'Dana Dikembalikan',
}

// Pesanan yang masih berjalan (belum selesai/batal).
export const PESANAN_BERJALAN = [
  'pending_payment',
  'awaiting_prescription',
  'paid',
  'processing',
  'shipped',
  'delivered',
]

export const statusPesanan = (o) => ({
  tone: TONE_PESANAN[o?.status] || 'neutral',
  label: o?.status_label || LABEL_PESANAN[o?.status] || o?.status || 'Tidak diketahui',
})

export const TONE_BAYAR = {
  unpaid: 'amber',
  paid: 'green',
  failed: 'rose',
  refunded: 'rose',
}

export const LABEL_BAYAR = {
  unpaid: 'Belum Dibayar',
  paid: 'Sudah Dibayar',
  failed: 'Pembayaran Gagal',
  refunded: 'Dana Dikembalikan',
}

export const statusBayar = (o) => ({
  tone: TONE_BAYAR[o?.payment_status] || 'neutral',
  label: LABEL_BAYAR[o?.payment_status] || 'Belum Dibayar',
})

// Label metode bayar dalam bahasa manusia.
export const labelMetodeBayar = (m) =>
  m === 'cod' ? 'Bayar di Tempat (COD)' : m === 'midtrans' ? 'Transfer / Pembayaran Online' : m || '-'

// Pasien boleh membatalkan sendiri selama belum dibayar.
export const bolehDibatalkan = (status) => status === 'pending_payment'
