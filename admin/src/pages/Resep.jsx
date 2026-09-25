import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, Textarea, SearchInput, EmptyState , GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { namaPasien, fmtTanggal, hariIni } from '../data/mockData'
import { useData } from '../context/DataContext'
import { IconPlus, IconResep, IconEye, IconTrash } from '../components/Icons'

export default function Resep() {
  // Resep dari API bersama; resep yang dibuat di sini langsung muncul
  // di menu Resep aplikasi pasien (BR-05: syarat beli obat wajib resep).
  const { resep: rows, pasien, produk, tambah } = useData()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ id_pasien: '', tanggal: hariIni(), catatan: '' })
  const [detail, setDetail] = useState([])

  const filtered = useMemo(
    () => rows.filter((r) => !q || namaPasien(r.id_pasien).toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  )

  const openAdd = () => {
    setForm({ id_pasien: '', tanggal: hariIni(), catatan: '' })
    setDetail([{ id_produk: '', dosis: '', jumlah: 1, aturan_pakai: '' }])
    setModal({ mode: 'add' })
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const updateDetail = (i, k, v) => setDetail(detail.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)))
  const addDetail = () => setDetail([...detail, { id_produk: '', dosis: '', jumlah: 1, aturan_pakai: '' }])
  const removeDetail = (i) => setDetail(detail.filter((_, idx) => idx !== i))

  const save = async () => {
    if (!form.id_pasien || detail.length === 0) return
    const items = detail
      .filter((d) => d.id_produk)
      .map((d, i) => {
        const p = produk.find((x) => x.id === Number(d.id_produk))
        return { id: i + 1, id_produk: Number(d.id_produk), nama_obat: p?.nama || '-', dosis: d.dosis, jumlah: Number(d.jumlah), aturan_pakai: d.aturan_pakai }
      })
    setGalat(null)
    try {
      await tambah('resep', {
        id_pemeriksaan: null,
        id_pasien: Number(form.id_pasien),
        id_bidan: 1,
        tanggal: form.tanggal,
        status: 'Aktif',
        catatan: form.catatan,
        detail: items,
      })
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const columns = [
    { key: 'tanggal', header: 'Tanggal', render: (r) => fmtTanggal(r.tanggal) },
    { key: 'pasien', header: 'Pasien', render: (r) => (
      <div>
        <p className="font-medium text-primary">{namaPasien(r.id_pasien)}</p>
        <p className="text-[12px] text-muted">Bidan: Siska Mariawati</p>
      </div>
    )},
    { key: 'obat', header: 'Obat', render: (r) => (
      <div className="flex flex-wrap gap-1">
        {r.detail.map((d) => (
          <span key={d.id} className="rounded-[6px] surface-sunken px-2 py-0.5 text-[12px] text-secondary">{d.nama_obat}</span>
        ))}
      </div>
    )},
    { key: 'jumlah', header: 'Jml Obat', render: (r) => `${r.detail.length} item` },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'aksi', header: '', headerClass: 'text-right', className: 'text-right', render: (r) => (
      <Button size="sm" variant="ghost" onClick={() => setModal({ mode: 'view', data: r })} aria-label="Lihat detail">
            <IconEye size={16} />
          </Button>
    )},
  ]

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Manajemen Resep"
        subtitle="Resep otomatis tampil di aplikasi pasien & tertaut ke toko"
        actions={
          <Button onClick={openAdd}>
            <IconPlus size={18} /> Buat Resep
          </Button>
        }
      />

      <Panel divided={false}>
        <div className="border-b border-hairline p-4">
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari pasien..." />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Belum ada resep" icon={<IconResep size={20} />} />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      {/* Buat resep - §A-09 */}
      <Modal
        open={modal?.mode === 'add'}
        onClose={() => setModal(null)}
        title="Buat Resep"
        subtitle="Resep tertaut ke produk toko bila tersedia - §A-09"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button onClick={save}>Simpan Resep</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Pasien" required>
              <Select value={form.id_pasien} onChange={set('id_pasien')}>
                <option value="">Pilih pasien</option>
                {pasien.filter((p) => p.status_aktif).map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </Select>
            </Field>
            <Field label="Tanggal" required>
              <Input type="date" value={form.tanggal} onChange={set('tanggal')} />
            </Field>
          </div>

          <div className="rounded-[var(--radius-control)] border border-hairline p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13.5px] font-semibold text-primary">Daftar Obat</p>
              <Button size="sm" variant="secondary" onClick={addDetail}>
                <IconPlus size={15} /> Tambah Obat
              </Button>
            </div>
            <div className="space-y-2">
              {detail.map((d, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <Select value={d.id_produk} onChange={(e) => updateDetail(i, 'id_produk', e.target.value)} className="col-span-4">
                    <option value="">Pilih obat</option>
                    {produk.filter((p) => p.status === 'Aktif').map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </Select>
                  <Input className="col-span-2" value={d.dosis} onChange={(e) => updateDetail(i, 'dosis', e.target.value)} placeholder="Dosis" />
                  <Input className="col-span-2" type="number" min="1" value={d.jumlah} onChange={(e) => updateDetail(i, 'jumlah', e.target.value)} placeholder="Jml" />
                  <Input className="col-span-3" value={d.aturan_pakai} onChange={(e) => updateDetail(i, 'aturan_pakai', e.target.value)} placeholder="Aturan pakai" />
                  <button onClick={() => removeDetail(i)} className="col-span-1 text-[var(--color-signal-rose)] hover:text-[var(--color-signal-rose)]">
                    <IconTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Field label="Catatan">
            <Textarea value={form.catatan} onChange={set('catatan')} placeholder="Catatan resep (opsional)" />
          </Field>
        </div>
      </Modal>

      {/* Detail resep */}
      <Modal
        open={modal?.mode === 'view'}
        onClose={() => setModal(null)}
        title="Detail Resep"
        subtitle={modal?.data ? `${namaPasien(modal.data.id_pasien)} · ${fmtTanggal(modal.data.tanggal)}` : ''}
        footer={<Button variant="secondary" onClick={() => setModal(null)}>Tutup</Button>}
      >
        {modal?.data && (
          <div className="space-y-2">
            {modal.data.detail.map((d) => (
              <div key={d.id} className="rounded-[var(--radius-control)] border border-hairline px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-primary">{d.nama_obat}</p>
                  <span className="text-[13.5px] text-secondary">{d.jumlah}x</span>
                </div>
                <p className="mt-1 text-[13.5px] text-secondary">{d.dosis} · {d.aturan_pakai}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
