import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, Textarea, SearchInput, EmptyState, GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { useData } from '../context/DataContext'
import { IconPlus, IconEdit, IconTrash, IconAlert, IconCheck } from '../components/Icons'

const emptyForm = {
  nomor_pesanan: '',
  alasan: 'Produk rusak',
  keterangan: '',
  status: 'Menunggu Persetujuan',
}

export default function Pengembalian() {
  const { pengembalian: rows = [] } = useData()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [stat, setStat] = useState('semua')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirm, setConfirm] = useState(null)

  const filtered = useMemo(
    () => rows.filter((p) => {
      const cocokQ = !q || p.nomor_pesanan.toLowerCase().includes(q.toLowerCase())
      const cocokStat = stat === 'semua' || p.status === stat
      return cocokQ && cocokStat
    }),
    [rows, q, stat],
  )

  const openAdd = () => {
    setForm(emptyForm)
    setModal({ mode: 'add' })
  }

  const openEdit = (p) => {
    setForm({ ...p })
    setModal({ mode: 'edit', data: p })
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async () => {
    if (!form.nomor_pesanan) return
    setGalat(null)
    try {
      if (modal.mode === 'add') {
        // Post to API
        await fetch('/api/pengembalian', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const approve = async (p) => {
    setGalat(null)
    try {
      await fetch(`/api/pengembalian/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Disetujui' }),
      })
    } catch (e) {
      setGalat(e.message)
    }
    setConfirm(null)
  }

  const columns = [
    { key: 'nomor_pesanan', header: 'Pesanan', render: (p) => <span className="font-medium">{p.nomor_pesanan}</span> },
    { key: 'alasan', header: 'Alasan', render: (p) => <span className="text-[13px]">{p.alasan}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      header: 'Aksi',
      render: (p) => (
        <div className="flex gap-1">
          {p.status === 'Menunggu Persetujuan' && (
            <>
              <Button size="sm" onClick={() => { setConfirm({ type: 'approve', data: p }) }}>
                <IconCheck size={14} />
              </Button>
              <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>
                <IconEdit size={14} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Pengembalian Barang" description="Kelola retur pesanan pelanggan" icon="📦" />

      {galat && <GalatBar message={galat} onClose={() => setGalat(null)} />}

      <Panel>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nomor pesanan..." />
          </div>
          <Select value={stat} onChange={(e) => setStat(e.target.value)}>
            <option value="semua">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
          </Select>
          <Button onClick={openAdd}>
            <IconPlus size={16} />
            Tambah Retur
          </Button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Tidak ada pengembalian" />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      <Modal
        open={modal?.mode === 'add' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Tambah Pengembalian' : 'Edit Pengembalian'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nomor Pesanan" required>
            <Input value={form.nomor_pesanan} onChange={set('nomor_pesanan')} placeholder="ORD-..." />
          </Field>
          <Field label="Alasan Pengembalian" required>
            <Select value={form.alasan} onChange={set('alasan')}>
              <option value="Produk rusak">Produk rusak</option>
              <option value="Produk tidak sesuai">Produk tidak sesuai</option>
              <option value="Kesalahan pengiriman">Kesalahan pengiriman</option>
              <option value="Lainnya">Lainnya</option>
            </Select>
          </Field>
          <Field label="Keterangan">
            <Textarea value={form.keterangan} onChange={set('keterangan')} placeholder="Detail pengembalian..." />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.type === 'approve' && approve(confirm.data)}
        title="Setujui Pengembalian?"
        message="Pesanan akan diproses untuk pengembalian dana."
      />
    </>
  )
}
