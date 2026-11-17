import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, Textarea, SearchInput, EmptyState, GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { useData } from '../context/DataContext'
import { IconPlus, IconEdit, IconTrash, IconAlert, IconChevronRight } from '../components/Icons'
import { fmtTanggal, fmtRupiah } from '../data/mockData'

const emptyForm = {
  nama: '',
  email: '',
  telepon: '',
  asal: 'Google Maps',
  status: 'Prospek',
  nilai_potensial: 0,
  catatan: '',
}

const STATUS_OPTIONS = [
  { nilai: 'Prospek', label: 'Prospek' },
  { nilai: 'Follow-up', label: 'Follow-up' },
  { nilai: 'Konversi', label: 'Konversi' },
  { nilai: 'Batal', label: 'Batal' },
]

export default function CRM() {
  const { crmLead: rows = [] } = useData()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [stat, setStat] = useState('semua')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirm, setConfirm] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)

  const filtered = useMemo(
    () => rows.filter((p) => {
      const cocokQ = !q || p.nama.toLowerCase().includes(q.toLowerCase()) || p.email.includes(q)
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

  const openDetail = (p) => {
    setSelectedLead(p)
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async () => {
    if (!form.nama || !form.email) return
    setGalat(null)
    try {
      const method = modal.mode === 'add' ? 'POST' : 'PATCH'
      const endpoint = modal.mode === 'add' ? '/api/crmLead' : `/api/crmLead/${form.id}`
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Gagal menyimpan lead')
      setModal(null)
      setForm(emptyForm)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const hapus = async () => {
    setGalat(null)
    try {
      const res = await fetch(`/api/crmLead/${confirm.data.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus lead')
      setConfirm(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="CRM" subtitle="Kelola leads dan riwayat interaksi pelanggan" />

      {galat && <GalatBar>{galat}</GalatBar>}

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email..." />
        <Select value={stat} onChange={(e) => setStat(e.target.value)}>
          <option value="semua">Semua Status</option>
          <option value="Prospek">Prospek</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Konversi">Konversi</option>
          <option value="Batal">Batal</option>
        </Select>
        <Button onClick={openAdd} variant="primary">
          <IconPlus size={16} />
          Lead Baru
        </Button>
      </div>

      <Panel>
        {filtered.length === 0 ? (
          <EmptyState title="Tidak ada lead" description="Mulai dengan menambahkan lead baru." />
        ) : (
          <DataTable
            cols={[
              { head: 'Nama', key: 'nama' },
              { head: 'Email', key: 'email' },
              { head: 'Telepon', key: 'telepon' },
              { head: 'Asal', key: 'asal' },
              { head: 'Status', key: 'status', render: (v) => <StatusBadge status={v} /> },
              { head: 'Nilai Potensial', key: 'nilai_potensial', render: (v) => v > 0 ? fmtRupiah(v) : '-' },
              {
                head: '', key: 'aksi',
                render: (_, p) => (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openDetail(p)} className="flex items-center justify-center w-7 h-7 rounded hover:surface-hover text-muted">
                      <IconChevronRight size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        )}
      </Panel>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Lead Baru' : 'Edit Lead'}
          open={!!modal}
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            <Field label="Nama">
              <Input value={form.nama} onChange={set('nama')} placeholder="Nama lengkap" required />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" required />
            </Field>
            <Field label="Telepon">
              <Input value={form.telepon} onChange={set('telepon')} placeholder="0813-xxxx-xxxx" />
            </Field>
            <Field label="Asal">
              <Input value={form.asal} onChange={set('asal')} placeholder="Google Maps, Rekomendasi, dll" />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={set('status')}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.nilai} value={s.nilai}>{s.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Nilai Potensial (Rp)">
              <Input type="number" value={form.nilai_potensial} onChange={set('nilai_potensial')} placeholder="500000" />
            </Field>
            <Field label="Catatan">
              <Textarea value={form.catatan} onChange={set('catatan')} rows={3} placeholder="Catatan tentang lead ini" />
            </Field>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <Button onClick={() => setModal(null)} variant="secondary">Batal</Button>
            <Button onClick={save} variant="primary">Simpan</Button>
          </div>
        </Modal>
      )}

      {selectedLead && (
        <Modal
          title={selectedLead.nama}
          open={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted mb-1">Email</p>
              <p className="font-medium">{selectedLead.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Telepon</p>
              <p className="font-medium">{selectedLead.telepon}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Asal</p>
              <p className="font-medium">{selectedLead.asal}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Status</p>
              <StatusBadge status={selectedLead.status} />
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Nilai Potensial</p>
              <p className="font-medium">{selectedLead.nilai_potensial > 0 ? fmtRupiah(selectedLead.nilai_potensial) : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Catatan</p>
              <p className="text-sm">{selectedLead.catatan || '-'}</p>
            </div>
            <div className="flex gap-3 justify-between pt-4">
              <Button onClick={() => { openEdit(selectedLead); setSelectedLead(null) }} variant="secondary">Edit</Button>
              <Button onClick={() => { setConfirm({ mode: 'hapus', data: selectedLead }); setSelectedLead(null) }} variant="danger">Hapus</Button>
            </div>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Hapus Lead?"
          message={`Anda yakin ingin menghapus lead "${confirm.data.nama}"?`}
          onConfirm={hapus}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
