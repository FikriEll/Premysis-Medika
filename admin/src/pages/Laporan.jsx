import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Select, EmptyState, Metric, MetricStrip } from '../components/ui'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { namaPasien, fmtRupiah, fmtTanggal, dashboardStats } from '../data/mockData'
import { useData } from '../context/DataContext'
import { IconDownload, IconLaporan } from '../components/Icons'

const JENIS = [
  { k: 'pasien', l: 'Laporan Pasien' },
  { k: 'pemeriksaan', l: 'Laporan Pemeriksaan' },
  { k: 'vaksinasi', l: 'Laporan Vaksinasi' },
  { k: 'obat', l: 'Laporan Obat & Stok' },
  { k: 'ecommerce', l: 'Laporan E-Commerce' },
]

export default function Laporan() {
  // Laporan dihitung dari data API bersama supaya angkanya konsisten
  // dengan yang dilihat pasien.
  const { pasien, appointment, pemeriksaan, jadwalVaksin, produk, pesanan } = useData()
  const [jenis, setJenis] = useState('pasien')
  // Opsi periode: tiga bulan terakhir (label saja; penyaringan rinci
  // menyusul saat laporan dipecah per periode).
  const opsiPeriode = useMemo(() => {
    const out = []
    const d = new Date()
    for (let i = 0; i < 3; i++) {
      const t = new Date(d.getFullYear(), d.getMonth() - i, 1)
      out.push({
        nilai: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`,
        label: t.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      })
    }
    return out
  }, [])
  const [periode, setPeriode] = useState(opsiPeriode[0].nilai)

  const stat = dashboardStats()

  // Ringkasan e-commerce
  const ringkasEcommerce = useMemo(() => {
    const total = pesanan.length
    const selesai = pesanan.filter((p) => p.status === 'Selesai').length
    const dibatalkan = pesanan.filter((p) => p.status === 'Dibatalkan').length
    const transaksi = pesanan.filter((p) => p.status !== 'Dibatalkan').reduce((s, p) => s + p.total, 0)
    return { total, selesai, dibatalkan, transaksi }
  }, [])

  // Produk terlaris (dari detail pesanan)
  const terlaris = useMemo(() => {
    const map = {}
    pesanan.filter((p) => p.status !== 'Dibatalkan').forEach((p) => {
      p.detail.forEach((d) => {
        map[d.id_produk] = (map[d.id_produk] || 0) + d.jumlah
      })
    })
    return Object.entries(map)
      .map(([id, qty]) => ({ produk: produk.find((x) => x.id === Number(id))?.nama || '-', qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [])

  const renderTabel = () => {
    if (jenis === 'pasien') {
      return (
        <DataTable
          columns={[
            { key: 'nama', header: 'Nama' },
            { key: 'nik', header: 'NIK' },
            { key: 'no_wa', header: 'No. WhatsApp' },
            { key: 'tanggal_registrasi', header: 'Registrasi', render: (p) => fmtTanggal(p.tanggal_registrasi) },
            { key: 'status_aktif', header: 'Status', render: (p) => <StatusBadge status={p.status_aktif ? 'Aktif' : 'Nonaktif'} /> },
          ]}
          rows={pasien}
        />
      )
    }
    if (jenis === 'pemeriksaan') {
      return (
        <DataTable
          columns={[
            { key: 'tanggal', header: 'Tanggal', render: (p) => fmtTanggal(p.tanggal) },
            { key: 'pasien', header: 'Pasien', render: (p) => namaPasien(p.id_pasien) },
            { key: 'diagnosis', header: 'Diagnosis' },
            { key: 'tindakan', header: 'Tindakan' },
          ]}
          rows={pemeriksaan}
        />
      )
    }
    if (jenis === 'vaksinasi') {
      return (
        <DataTable
          columns={[
            { key: 'nama_vaksin', header: 'Vaksin' },
            { key: 'terjadwal', header: 'Terjadwal', render: (v) => fmtTanggal(v.tanggal_terjadwal) },
            { key: 'diberikan', header: 'Diberikan', render: (v) => v.tanggal_diberikan ? fmtTanggal(v.tanggal_diberikan) : '-' },
            { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
          ]}
          rows={jadwalVaksin}
        />
      )
    }
    if (jenis === 'obat') {
      return (
        <DataTable
          columns={[
            { key: 'nama', header: 'Produk' },
            { key: 'stok', header: 'Stok', render: (p) => `${p.stok} ${p.satuan}` },
            { key: 'stok_minimum', header: 'Min.' },
            { key: 'status_stok', header: 'Kondisi', render: (p) => (
              p.stok === 0 ? <StatusBadge status="Dibatalkan" /> : p.stok <= p.stok_minimum ? <span className="text-[12px] font-medium text-[var(--color-signal-amber)]">Menipis</span> : <span className="text-[12px] text-[var(--color-signal-green)]">Aman</span>
            )},
          ]}
          rows={produk}
        />
      )
    }
    // e-commerce
    return (
      <DataTable
        columns={[
          { key: 'nomor_pesanan', header: 'No. Pesanan' },
          { key: 'pasien', header: 'Pasien', render: (p) => namaPasien(p.id_pasien) },
          { key: 'waktu_pemesanan', header: 'Waktu', render: (p) => fmtTanggal(p.waktu_pemesanan) },
          { key: 'total', header: 'Total', render: (p) => fmtRupiah(p.total) },
          { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
        ]}
        rows={pesanan}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Laporan"
        subtitle="Rekap operasional klinik & e-commerce - §A-11"
        actions={
          <Button variant="secondary">
            <IconDownload size={18} /> Ekspor PDF/Excel
          </Button>
        }
      />

      {/* Ringkasan umum: satu bingkai dipisah garis rambut. */}
      <MetricStrip className="mb-5">
        <Metric label="Total pasien" value={stat.totalPasien} sub="Terdaftar" tone="accent" icon={<IconLaporan size={16} />} />
        <Metric label="Total pemeriksaan" value={pemeriksaan.length} sub="Seluruh periode" tone="green" />
        <Metric label="Total appointment" value={appointment.length} sub="Seluruh periode" tone="blue" />
        <Metric label="Total transaksi" value={fmtRupiah(ringkasEcommerce.transaksi)} sub="E-commerce" tone="neutral" />
      </MetricStrip>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={jenis} onChange={(e) => setJenis(e.target.value)} className="sm:w-60">
          {JENIS.map((j) => <option key={j.k} value={j.k}>{j.l}</option>)}
        </Select>
        <Select value={periode} onChange={(e) => setPeriode(e.target.value)} className="sm:w-44">
          {opsiPeriode.map((o) => (
            <option key={o.nilai} value={o.nilai}>{o.label}</option>
          ))}
        </Select>
      </div>

      <Panel
        title={JENIS.find((j) => j.k === jenis)?.l}
        subtitle={`Periode ${periode}`}
      >
        {renderTabel()}
      </Panel>

      {/* Ringkasan e-commerce & produk terlaris */}
      {jenis === 'ecommerce' && (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <MetricStrip className="lg:col-span-2 lg:grid-cols-3">
            <Metric label="Total pesanan" value={ringkasEcommerce.total} tone="blue" />
            <Metric label="Pesanan selesai" value={ringkasEcommerce.selesai} tone="green" />
            <Metric label="Dibatalkan" value={ringkasEcommerce.dibatalkan} tone="rose" />
          </MetricStrip>
          <Panel title="Produk terlaris" subtitle="Berdasarkan jumlah terjual">
            <ul className="divide-y divide-[var(--border-hairline)]">
              {terlaris.map((t, i) => (
                <li key={t.produk} className="flex items-center gap-3 px-5 py-3">
                  <span className="numeric w-4 shrink-0 text-[12.5px] text-muted">{i + 1}</span>
                  <span className="flex-1 truncate text-[13.5px] text-primary">{t.produk}</span>
                  <span className="numeric text-[13.5px] font-medium text-primary">{t.qty}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {jenis === 'obat' && (
        <MetricStrip className="mt-5 lg:grid-cols-3">
          <Metric label="Total produk" value={produk.length} sub="Katalog aktif" tone="accent" />
          <Metric label="Produk stok kritis" value={stat.stokMenipis} sub="Di bawah ambang minimum" tone={stat.stokMenipis > 0 ? 'amber' : 'neutral'} />
          <Metric label="Produk nonaktif" value={produk.filter((p) => p.status === 'Nonaktif').length} sub="Tidak ditampilkan di toko" tone="rose" />
        </MetricStrip>
      )}
    </div>
  )
}
