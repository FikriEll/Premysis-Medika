// =============================================================
// Peta warna & label status (PRD §8 BR-02, F-03).
//
// Aturan redesign: warna hanya dipakai kalau membawa makna.
// Semua tone di sini adalah pastel teredam (saturasi rendah) supaya
// tidak ada hujan warna di dalam tabel, dan tetap terbaca di mode
// gelap karena memakai warna solid + latar tipis.
// =============================================================

export const statusMap = {
  // Appointment (F-03)
  'Menunggu Konfirmasi': { tone: 'amber' },
  Dikonfirmasi: { tone: 'blue' },
  Selesai: { tone: 'green' },
  Dibatalkan: { tone: 'red' },

  // Pesanan (BR-02)
  'Menunggu Pembayaran': { tone: 'amber' },
  Dibayar: { tone: 'blue' },
  Diproses: { tone: 'blue' },
  'Siap Diambil': { tone: 'violet' },
  Dikirim: { tone: 'violet' },

  // Pembayaran pesanan (Fitur Minimal #5)
  'Belum Bayar': { tone: 'amber' },
  'Menunggu Verifikasi': { tone: 'blue' },
  Terverifikasi: { tone: 'green' },
  Ditolak: { tone: 'red' },

  // Vaksin (F-06)
  Terjadwal: { tone: 'blue' },

  // Resep (A-09)
  Aktif: { tone: 'green' },
  Kadaluarsa: { tone: 'slate' },

  // Produk (A-06)
  Nonaktif: { tone: 'slate' },

  // Stok mutasi
  masuk: { tone: 'green', label: 'Masuk' },
  keluar: { tone: 'red', label: 'Keluar' },

  // Jenis kelamin
  L: { tone: 'blue', label: 'Laki-laki' },
  P: { tone: 'violet', label: 'Perempuan' },
}

// Pastel teredam: latar tipis + teks bernada gelap, tanpa ring tebal.
export const tones = {
  amber: 'bg-[var(--color-signal-amber-soft)] text-[var(--color-signal-amber)]',
  blue: 'bg-[var(--color-signal-blue-soft)] text-[var(--color-signal-blue)]',
  sky: 'bg-[var(--color-signal-blue-soft)] text-[var(--color-signal-blue)]',
  green: 'bg-[var(--color-signal-green-soft)] text-[var(--color-signal-green)]',
  red: 'bg-[var(--color-signal-rose-soft)] text-[var(--color-signal-rose)]',
  violet: 'bg-[var(--surface-sunken)] text-[var(--text-secondary)]',
  slate: 'bg-[var(--surface-sunken)] text-[var(--text-secondary)]',
  pink: 'bg-[var(--surface-sunken)] text-[var(--text-secondary)]',
}
