import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, SearchInput, EmptyState , GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { namaPasien, namaProduk, fmtRupiah, fmtTanggal } from '../data/mockData'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { IconPesanan, IconEye, IconCheck, IconWhatsapp } from '../components/Icons'

// Mesin status kanonik - PRD §BR-02
const ALUR = ['Menunggu Pembayaran', 'Dibayar', 'Diproses', 'Siap Diambil', 'Selesai']

export default function Pesanan() {
  const { pesanan: rows, memuat, ubahStatusPesanan, konfirmasiPembayaran, tolakPembayaran } = useData()
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [detail, setDetail] = useState(null)
  const [confirm, setConfirm] = useState(null) // {pesanan, aksi}
  const [bukti, setBukti] = useState(null) // pesanan yang bukti transfernya dilihat
  const [tolak, setTolak] = useState(null) // pesanan yang buktinya ditolak
  const [alasan, setAlasan] = useState('')

  const filtered = useMemo(
    () => rows
      .filter((p) => {
        const cocokQ = !q || p.nomor_pesanan.toLowerCase().includes(q.toLowerCase()) || namaPasien(p.id_pasien).toLowerCase().includes(q.toLowerCase())
        const cocokStatus = statusFilter === 'semua' || p.status === statusFilter
        return cocokQ && cocokStatus
      })
      .sort((a, b) => b.waktu_pemesanan.localeCompare(a.waktu_pemesanan)),
    [rows, q, statusFilter],
  )

  // Perubahan dikirim ke API bersama supaya pasien melihat status terbaru
  // (BR-02 mesin status + BR-04 pengurangan stok ditegakkan server).
  const [galat, setGalat] = useState(null)
  const [sibuk, setSibuk] = useState(false)

  const ubahStatus = async (p, status) => {
    setSibuk(true)
    setGalat(null)
    try {
      if (status === 'Dibayar') {
        await konfirmasiPembayaran(p.id, user?.id, p.metode_bayar)
      } else {
        await ubahStatusPesanan(p.id, status, user?.id)
      }
      setConfirm(null)
    } catch (e) {
      setGalat(e.message)
      setConfirm(null)
    } finally {
      setSibuk(false)
    }
  }

  const lakukanTolak = async () => {
    setSibuk(true)
    setGalat(null)
    try {
      await tolakPembayaran(tolak.id, user?.id, alasan)
      setTolak(null)
      setAlasan('')
      setDetail(null)
    } catch (e) {
      setGalat(e.message)
      setTolak(null)
    } finally {
      setSibuk(false)
    }
  }

  const nextStatus = (p) => {
    if (p.status === 'Dibatalkan' || p.status === 'Selesai') return null
    if (p.status === 'Menunggu Pembayaran') return 'Dibayar'
    if (p.status === 'Dibayar') return 'Diproses'
    if (p.status === 'Diproses') return p.metode_ambil === 'Dikirim' ? 'Selesai' : 'Siap Diambil'
    if (p.status === 'Siap Diambil') return 'Selesai'
    return null
  }

  const labelNext = (p) => {
    const n = nextStatus(p)
    if (n === 'Dibayar') return 'Konfirmasi Pembayaran'
    if (n === 'Diproses') return 'Proses Pesanan'
    if (n === 'Siap Diambil') return 'Siap Diambil'
    if (n === 'Selesai') return p.metode_ambil === 'Dikirim' ? 'Tandai Terkirim' : 'Selesaikan'
    return null
  }

  const columns = [
    { key: 'nomor', header: 'No. Pesanan', render: (p) => (
      <div>
        <p className="font-medium text-primary">{p.nomor_pesanan}</p>
        <p className="text-[12px] text-muted">{fmtTanggal(p.waktu_pemesanan)}</p>
      </div>
    )},
    { key: 'pasien', header: 'Pasien', render: (p) => namaPasien(p.id_pasien) },
    { key: 'total', header: 'Total', render: (p) => <span className="font-medium text-primary">{fmtRupiah(p.total)}</span> },
    { key: 'metode', header: 'Metode', render: (p) => (
      <div>
        <p className="text-[13.5px] text-primary">{p.metode_ambil}</p>
        <p className="text-[12px] text-muted">{p.metode_bayar}</p>
      </div>
    )},
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    { key: 'pembayaran', header: 'Pembayaran', render: (p) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge status={p.status_pembayaran || 'Belum Bayar'} />
        {p.bukti_bayar && (
          <button type="button" onClick={() => setBukti(p)} className="text-[12px] font-medium text-accent hover:underline">
            Lihat bukti
          </button>
        )}
      </div>
    )},
    { key: 'aksi', header: '', headerClass: 'text-right', className: 'text-right', render: (p) => (
      <div className="flex justify-end gap-1">
        {nextStatus(p) && (
          <Button size="sm" variant="success" onClick={() => setConfirm({ pesanan: p, aksi: 'next' })} title={labelNext(p)}>
            <IconCheck size={16} /> {labelNext(p)}
          </Button>
        )}
        {p.status === 'Menunggu Pembayaran' && p.status_pembayaran === 'Menunggu Verifikasi' && (
          <Button size="sm" variant="ghost" className="text-[var(--color-signal-rose)] hover:bg-[var(--color-signal-rose-soft)]" onClick={() => setTolak(p)} title="Tolak bukti pembayaran">
            Tolak
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setDetail(p)} title="Detail" aria-label="Detail">
            <IconEye size={16} />
          </Button>
      </div>
    )},
  ]

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Pesanan E-Commerce"
        subtitle="Kelola status pesanan sesuai alur - §BR-02"
      />

      {/* Ringkasan status */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['semua', ...ALUR, 'Dibatalkan'].map((s) => {
          const count = s === 'semua' ? rows.length : rows.filter((r) => r.status === s).length
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-[var(--radius-control)] border px-3 py-1.5 text-[13.5px] font-medium transition ${
                statusFilter === s ? 'border-[var(--accent)] bg-accent-soft text-accent' : 'border-hairline surface-raised text-secondary hover:surface-hover'
              }`}
            >
              {s === 'semua' ? 'Semua' : s} <span className="ml-1 text-[12px] text-muted">{count}</span>
            </button>
          )
        })}
      </div>

      <Panel divided={false}>
        <div className="border-b border-hairline p-4">
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari no. pesanan atau pasien..." />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Tidak ada pesanan" icon={<IconPesanan size={20} />} />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      {/* Detail pesanan */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Pesanan"
        subtitle={detail?.nomor_pesanan}
        size="lg"
        footer={<Button variant="secondary" onClick={() => setDetail(null)}>Tutup</Button>}
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Pasien', namaPasien(detail.id_pasien)],
                ['Waktu Pesan', detail.waktu_pemesanan],
                ['Metode Ambil', detail.metode_ambil],
                ['Metode Bayar', detail.metode_bayar],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[var(--radius-control)] surface-sunken px-3 py-2">
                  <p className="text-[12px] text-muted">{k}</p>
                  <p className="text-[13.5px] font-medium text-primary">{v}</p>
                </div>
              ))}
              {detail.metode_ambil === 'Dikirim' && (
                <div className="rounded-[var(--radius-control)] surface-sunken px-3 py-2 sm:col-span-2">
                  <p className="text-[12px] text-muted">Alamat Pengiriman</p>
                  <p className="text-[13.5px] font-medium text-primary">{detail.alamat_pengiriman}</p>
                </div>
              )}
              <div className="rounded-[var(--radius-control)] surface-sunken px-3 py-2 sm:col-span-2">
                <p className="text-[12px] text-muted">Status Pembayaran</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusBadge status={detail.status_pembayaran || 'Belum Bayar'} />
                  {detail.bukti_bayar && (
                    <Button size="sm" variant="ghost" onClick={() => setBukti(detail)}>Lihat bukti transfer</Button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-control)] border border-hairline">
              <table className="w-full text-[13.5px]">
                <thead className="border-b border-hairline surface-sunken text-left text-[12px] uppercase text-secondary">
                  <tr>
                    <th className="px-4 py-2">Produk</th>
                    <th className="px-4 py-2 text-center">Jml</th>
                    <th className="px-4 py-2 text-right">Harga</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {detail.detail.map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-2 text-primary">{namaProduk(d.id_produk)}</td>
                      <td className="px-4 py-2 text-center text-secondary">{d.jumlah}</td>
                      <td className="px-4 py-2 text-right text-secondary">{fmtRupiah(d.harga_satuan)}</td>
                      <td className="px-4 py-2 text-right font-medium text-primary">{fmtRupiah(d.harga_satuan * d.jumlah)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-hairline text-[13.5px]">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-secondary">Biaya Kirim</td>
                    <td className="px-4 py-2 text-right text-primary">{fmtRupiah(detail.biaya_kirim)}</td>
                  </tr>
                  <tr className="font-semibold text-primary">
                    <td colSpan={3} className="px-4 py-2 text-right">Total</td>
                    <td className="px-4 py-2 text-right">{fmtRupiah(detail.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-green-soft)] px-3 py-2 text-[13.5px] text-[var(--color-signal-green)]">
              <IconWhatsapp size={18} />
              <span>Notifikasi perubahan status dikirim ke pasien - §BR-08.</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Bukti transfer (demo: berkas disimpan sebagai nama) */}
      <Modal
        open={!!bukti}
        onClose={() => setBukti(null)}
        title="Bukti Pembayaran"
        subtitle={bukti?.nomor_pesanan}
        footer={
          bukti && bukti.status === 'Menunggu Pembayaran' && bukti.status_pembayaran === 'Menunggu Verifikasi' ? (
            <>
              <Button variant="secondary" onClick={() => { setTolak(bukti); setBukti(null) }}>Tolak bukti</Button>
              <Button variant="success" onClick={() => { setBukti(null); setConfirm({ pesanan: bukti, aksi: 'next' }) }}>
                <IconCheck size={16} /> Konfirmasi pembayaran
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setBukti(null)}>Tutup</Button>
          )
        }
      >
        {bukti && (
          <div className="space-y-3">
            <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-strong surface-sunken text-center">
              <IconEye size={26} className="text-muted" />
              <p className="text-[13.5px] font-medium text-primary">{bukti.bukti_bayar || 'bukti-transfer.jpg'}</p>
              <p className="text-[12px] text-muted">Pratinjau gambar tersedia di versi produksi</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-control)] surface-sunken px-3 py-2">
                <p className="text-[12px] text-muted">Nominal ditransfer</p>
                <p className="text-[13.5px] font-medium text-primary">{fmtRupiah(bukti.nominal_bayar || bukti.total)}</p>
              </div>
              <div className="rounded-[var(--radius-control)] surface-sunken px-3 py-2">
                <p className="text-[12px] text-muted">Total pesanan</p>
                <p className="text-[13.5px] font-medium text-primary">{fmtRupiah(bukti.total)}</p>
              </div>
            </div>
            {bukti.catatan_bayar && (
              <p className="rounded-[var(--radius-control)] surface-sunken px-3 py-2 text-[13.5px] text-secondary">
                Catatan pasien: {bukti.catatan_bayar}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Tolak bukti pembayaran */}
      <Modal
        open={!!tolak}
        onClose={() => setTolak(null)}
        title="Tolak Bukti Pembayaran"
        subtitle={tolak?.nomor_pesanan}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTolak(null)}>Batal</Button>
            <Button variant="danger" onClick={lakukanTolak} disabled={sibuk}>Ya, tolak</Button>
          </>
        }
      >
        <p className="mb-3 text-[13.5px] leading-relaxed text-secondary">
          Pesanan tetap &quot;Menunggu Pembayaran&quot; dan pasien akan diminta mengunggah ulang bukti.
        </p>
        <Field label="Alasan penolakan" hint="Alasan ini dikirim ke pasien lewat notifikasi.">
          <Input value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Mis. bukti tidak jelas / nominal tidak sesuai" />
        </Field>
      </Modal>

      {/* Konfirmasi perubahan status */}
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => ubahStatus(confirm.pesanan, nextStatus(confirm.pesanan))}
        title="Ubah Status Pesanan"
        message={
          confirm?.pesanan?.status === 'Menunggu Pembayaran'
            ? `Konfirmasi pembayaran pesanan ${confirm.pesanan.nomor_pesanan}? Status berubah menjadi "Dibayar".`
            : confirm?.pesanan?.status === 'Dibayar'
            ? `Proses pesanan ${confirm.pesanan.nomor_pesanan}? Stok produk terkait akan otomatis berkurang - §BR-04.`
            : `Ubah status pesanan ${confirm?.pesanan?.nomor_pesanan} menjadi "${confirm ? nextStatus(confirm.pesanan) : ''}"?`
        }
        confirmLabel="Ya, lanjutkan"
        variant="success"
      />
    </div>
  )
}
