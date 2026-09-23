import { fmtTanggal, fmtJam } from '../../../shared/format'
import { IconCentangBulat, IconJam, IconPesanan, IconKirim, IconLokasi, IconDompet, IconProduk } from './Icons'

// Linimasa (lacak) pesanan - Fitur Pendukung "Lacak Pesanan".
//
// Menampilkan perjalanan pesanan langkah demi langkah supaya pasien
// tahu posisinya sekarang tanpa harus bertanya ke klinik. Urutan
// langkah mengikuti mesin status kanonik (BR-02) di shared/format.js,
// jadi tidak mungkin berbeda dengan yang dilihat dashboard admin.
//
// Brief §22: status selalu ikon + teks, tidak pernah warna saja.

const IKON = {
  'Menunggu Pembayaran': IconDompet,
  Dibayar: IconDompet,
  Diproses: IconProduk,
  'Siap Diambil': IconLokasi,
  Dikirim: IconKirim,
  Selesai: IconCentangBulat,
}

const KETERANGAN = {
  'Menunggu Pembayaran': 'Pesanan dibuat, menunggu pembayaran Anda.',
  Dibayar: 'Pembayaran sudah dikonfirmasi klinik.',
  Diproses: 'Klinik sedang menyiapkan pesanan Anda.',
  'Siap Diambil': 'Pesanan siap diambil di klinik.',
  Dikirim: 'Pesanan sedang dalam pengiriman ke alamat Anda.',
  Selesai: 'Pesanan sudah selesai. Terima kasih.',
}

export default function LinimasaPesanan({ pesanan }) {
  const dikirim = pesanan.metode_ambil === 'Dikirim'
  const langkah = dikirim
    ? ['Menunggu Pembayaran', 'Dibayar', 'Diproses', 'Dikirim', 'Selesai']
    : ['Menunggu Pembayaran', 'Dibayar', 'Diproses', 'Siap Diambil', 'Selesai']

  const batal = pesanan.status === 'Dibatalkan'
  const idx = langkah.indexOf(pesanan.status)

  // Waktu yang memang diketahui. Langkah lain tidak diberi jam palsu.
  const waktu = {
    'Menunggu Pembayaran': pesanan.waktu_pemesanan,
    Dibayar: pesanan.waktu_bayar || null,
  }

  return (
    <div>
      {batal && (
        <p className="mb-3 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-3.5 py-2.5 text-[15.5px] leading-relaxed text-[var(--color-signal-rose)]">
          <IconPesanan size={17} weight="bold" className="mt-0.5 shrink-0" />
          <span>Pesanan ini dibatalkan, jadi tidak dilanjutkan ke tahap berikutnya.</span>
        </p>
      )}

      <ol className="relative">
        {langkah.map((s, i) => {
          const selesai = !batal && i < idx
          const aktif = !batal && i === idx
          const Ikon = IKON[s]
          const t = waktu[s]
          return (
            <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
              {/* Garis penghubung antar langkah */}
              {i < langkah.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-0.5 ${
                    selesai ? 'bg-accent' : 'bg-[var(--border-strong)]'
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  selesai
                    ? 'bg-accent text-[var(--accent-contrast)]'
                    : aktif
                      ? 'bg-[var(--accent-soft)] text-accent ring-2 ring-[var(--accent)]'
                      : 'surface-sunken text-muted'
                }`}
              >
                <Ikon size={17} weight={aktif || selesai ? 'fill' : 'regular'} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className={`text-[16.5px] leading-snug ${aktif ? 'font-bold text-primary' : selesai ? 'font-semibold text-primary' : 'font-medium text-secondary'}`}>
                  {s}
                  {aktif && !batal && (
                    <span className="ml-2 align-middle text-[14px] font-semibold text-accent">Sekarang</span>
                  )}
                </p>
                <p className="mt-0.5 text-[15px] leading-relaxed text-secondary">{KETERANGAN[s]}</p>
                {t && (
                  <p className="numeric mt-0.5 flex items-center gap-1.5 text-[14.5px] text-muted">
                    <IconJam size={14} />
                    {fmtTanggal(t)} · {fmtJam(t.slice(11, 16))}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
