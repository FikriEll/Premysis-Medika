import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, SearchInput, EmptyState, Metric, MetricStrip , GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { namaProduk, namaPengguna, fmtTanggal, hariIni } from '../data/mockData'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { IconPlus, IconStok, IconAlert } from '../components/Icons'

export default function Stok() {
  // Mutasi stok dari API bersama. Stok berkurang otomatis saat pesanan
  // masuk "Diproses" (BR-04), jadi riwayat di sini selalu sinkron.
  const { stokMutasi: rows, produk, tambah } = useData()
  const { user } = useAuth()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [jenis, setJenis] = useState('semua')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ id_produk: '', jenis: 'masuk', jumlah: 1, keterangan: '', sumber: 'klinik' })

  const filtered = useMemo(
    () => rows
      .filter((r) => {
        const cocokQ = !q || namaProduk(r.id_produk).toLowerCase().includes(q.toLowerCase()) || (r.keterangan || '').toLowerCase().includes(q.toLowerCase())
        const cocokJenis = jenis === 'semua' || r.jenis === jenis
        return cocokQ && cocokJenis
      })
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [rows, q, jenis],
  )

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const save = async () => {
    if (!form.id_produk) return
    setGalat(null)
    try {
      await tambah('stokMutasi', {
        id_produk: Number(form.id_produk),
        jenis: form.jenis,
        jumlah: Number(form.jumlah),
        tanggal: hariIni(),
        keterangan: form.keterangan,
        sumber: form.sumber,
        id_pengguna: user?.id,
      })
      setModal(false)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const totalMasuk = rows.filter((r) => r.jenis === 'masuk').reduce((s, r) => s + r.jumlah, 0)
  const totalKeluar = rows.filter((r) => r.jenis === 'keluar').reduce((s, r) => s + r.jumlah, 0)
  const stokKritis = produk.filter((p) => p.stok <= p.stok_minimum)

  const columns = [
    { key: 'tanggal', header: 'Tanggal', render: (r) => fmtTanggal(r.tanggal) },
    { key: 'produk', header: 'Produk', render: (r) => <span className="font-medium text-primary">{namaProduk(r.id_produk)}</span> },
    { key: 'jenis', header: 'Jenis', render: (r) => <StatusBadge status={r.jenis} /> },
    { key: 'jumlah', header: 'Jumlah', render: (r) => (
      <span className={r.jenis === 'masuk' ? 'font-semibold text-[var(--color-signal-green)]' : 'font-semibold text-[var(--color-signal-rose)]'}>
        {r.jenis === 'masuk' ? '+' : '−'}{r.jumlah}
      </span>
    )},
    { key: 'sumber', header: 'Sumber', render: (r) => (
      <span className="rounded-[6px] surface-sunken px-2 py-0.5 text-[12px] capitalize text-secondary">{r.sumber}</span>
    )},
    { key: 'keterangan', header: 'Keterangan', className: 'max-w-[260px]', render: (r) => <span className="text-secondary">{r.keterangan}</span> },
    { key: 'id_pengguna', header: 'Oleh', render: (r) => <span className="text-[12px] text-muted">{namaPengguna(r.id_pengguna)}</span> },
  ]

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Manajemen Stok"
        subtitle="Stok masuk & keluar - berkurang otomatis di kedua alur transaksi - §BR-04"
        actions={<Button onClick={() => setModal(true)}><IconPlus size={18} /> Catat Stok Masuk</Button>}
      />

      <MetricStrip className="mb-5 lg:grid-cols-3">
        <Metric label="Total stok masuk" value={totalMasuk} sub="Unit tercatat" tone="green" icon={<IconStok size={16} />} />
        <Metric label="Total stok keluar" value={totalKeluar} sub="Unit tercatat" tone="rose" icon={<IconStok size={16} />} />
        <Metric
          label="Produk stok kritis"
          value={stokKritis.length}
          sub="Di bawah ambang minimum"
          tone={stokKritis.length > 0 ? 'amber' : 'neutral'}
          icon={<IconAlert size={16} />}
        />
      </MetricStrip>

      <Panel
        title="Mutasi stok"
        subtitle={`${filtered.length} catatan`}
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk atau keterangan" className="sm:w-64" />
            <Select value={jenis} onChange={(e) => setJenis(e.target.value)} className="sm:w-40">
              <option value="semua">Semua mutasi</option>
              <option value="masuk">Stok masuk</option>
              <option value="keluar">Stok keluar</option>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="Belum ada mutasi stok"
            message="Catat stok masuk atau keluar untuk mulai membangun jejak mutasi."
            icon={<IconStok size={20} />}
          />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Catat Stok Masuk"
        subtitle="Pembelian dari supplier / restok"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Produk" required>
            <Select value={form.id_produk} onChange={set('id_produk')}>
              <option value="">Pilih produk</option>
              {produk.map((p) => <option key={p.id} value={p.id}>{p.nama} (stok: {p.stok})</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Jenis" required>
              <Select value={form.jenis} onChange={set('jenis')}>
                <option value="masuk">Masuk</option>
                <option value="keluar">Keluar</option>
              </Select>
            </Field>
            <Field label="Jumlah" required>
              <Input type="number" min="1" value={form.jumlah} onChange={set('jumlah')} />
            </Field>
          </div>
          <Field label="Sumber">
            <Select value={form.sumber} onChange={set('sumber')}>
              <option value="klinik">Klinik</option>
              <option value="e-commerce">E-Commerce</option>
            </Select>
          </Field>
          <Field label="Keterangan">
            <Input value={form.keterangan} onChange={set('keterangan')} placeholder="Mis. pembelian supplier PT Sehat Jaya" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
