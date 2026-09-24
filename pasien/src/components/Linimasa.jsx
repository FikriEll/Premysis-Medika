import { fmtTanggal, fmtJam } from '../../../shared/format'
import { LABEL_PESANAN } from '../lib/status'
import { IconCentangBulat, IconJam, IconPesanan, IconKirim, IconLokasi, IconDompet, IconProduk } from './Icons'

// Linimasa (lacak) pesanan.
//
// Menampilkan perjalanan pesanan langkah demi langkah supaya pelanggan
// tahu posisinya sekarang tanpa harus bertanya ke apotek.
//
// Dua sumber data dipakai:
//  1. `timeline` dari server (asli, berisi waktu tiap perubahan status).
//  2. Bila server tidak mengirim timeline, alur standar digambar dari
//     status sekarang saja.

const IKON = {
  pending_payment: IconDompet,
  awaiting_prescription: IconPesanan,
  paid: IconDompet,
  processing: IconProduk,
  shipped: IconKirim,
  delivered: IconLokasi,
  completed: IconCentangBulat,
  cancelled: IconPesanan,
  expired: IconPesanan,
  refunded: IconPesanan,
}

const KETERANGAN = {
  pending_payment: 'Pesanan dibuat, menunggu pembayaran Anda.',
  awaiting_prescription: 'Menunggu verifikasi resep oleh apotek.',
  paid: 'Pembayaran sudah dikonfirmasi apotek.',
  processing: 'Apotek sedang menyiapkan pesanan Anda.',
  shipped: 'Pesanan sedang dalam pengiriman ke alamat Anda.',
  delivered: 'Pesanan sudah diterima.',
  completed: 'Pesanan sudah selesai. Terima kasih.',
  cancelled: 'Pesanan dibatalkan.',
  expired: 'Pesanan kedaluwarsa karena melewati batas pembayaran.',
  refunded: 'Dana pesanan sudah dikembalikan.',
}

const ALUR = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'completed']

export default function LinimasaPesanan({ pesanan }) {
  const timeline = Array.isArray(pesanan?.timeline) ? pesanan.timeline : []
  const batal = ['cancelled', 'expired', 'refunded'].includes(pesanan?.status)

  // Bangun daftar langkah: pakai timeline bila ada, kalau tidak alur standar.
  const langkah =
    timeline.length > 0
      ? timeline.map((t) => ({ status: t.status, label: t.status_label, at: t.at, note: t.note }))
      : ALUR.map((s, i) => ({
          status: s,
          label: LABEL_PESANAN[s],
          at: i === 0 ? pesanan?.created_at : null,
          note: null,
        }))

  const idxSekarang = langkah.findIndex((l) => l.status === pesanan?.status)

  return (
    <div>
      {batal && (
        <p className="mb-3 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-3.5 py-2.5 text-[15.5px] leading-relaxed text-[var(--color-signal-rose)]">
          <IconPesanan size={17} weight="bold" className="mt-0.5 shrink-0" />
          <span>Pesanan ini tidak dilanjutkan ke tahap berikutnya.</span>
        </p>
      )}

      <ol className="relative">
        {langkah.map((l, i) => {
          const terakhir = i === langkah.length - 1
          const selesai = idxSekarang >= 0 ? i < idxSekarang : true
          const aktif = i === idxSekarang
          const Ikon = IKON[l.status] || IconPesanan
          const keterangan = l.note || KETERANGAN[l.status] || ''

          return (
            <li key={`${l.status}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
              {!terakhir && (
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
                  {l.label || LABEL_PESANAN[l.status] || l.status}
                  {aktif && !batal && (
                    <span className="ml-2 align-middle text-[14px] font-semibold text-accent">Sekarang</span>
                  )}
                </p>
                {keterangan && <p className="mt-0.5 text-[15px] leading-relaxed text-secondary">{keterangan}</p>}
                {l.at && (
                  <p className="numeric mt-0.5 flex items-center gap-1.5 text-[14.5px] text-muted">
                    <IconJam size={14} />
                    {fmtTanggal(l.at)} · {fmtJam(String(l.at).slice(11, 16))}
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
