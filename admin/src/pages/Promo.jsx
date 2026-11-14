import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, SearchInput, EmptyState, GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { IconPlus, IconEdit, IconTrash } from '../components/Icons'

const emptyForm = {
  nama: '',
  deskripsi: '',
  kode_promo: '',
  diskon_persen: '',
  diskon_nominal: '',
  minimal_pembelian: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  status: 'Aktif',
}

export default function Promo() {
  const { promo: rows, tambah, ubah, hapus } = useData()
  const { user } = useAuth()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirm, setConfirm] = useState(null)
  const [sibuk, setSibuk] = useState(false)

  const filtered = useMemo(
    () => rows.filter((p) => !q || p.nama.toLowerCase().includes(q.toLowerCase()) || (p.kode_promo || '').toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  )

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const openAdd = () => {
    setForm(emptyForm)
    setGalat(null)
    setModal({ mode: 'add' })
  }

  const openEdit = (p) => {
    setForm(p)
    setGalat(null)
    setModal({ mode: 'edit', data: p })
  }

  const save = async () => {
    if (!form.nama.trim() || !form.kode_promo.trim()) {
      setGalat('Nama & kode promo wajib diisi.')
      return
    }
    if (!form.diskon_persen && !form.diskon_nominal) {
      setGalat('Minimal ada satu jenis diskon (persen atau nominal).')
      return
    }
    setGalat(null)
    setSibuk(true)
    try {
      const payload = {
        nama: form.nama.trim(),
        deskripsi: form.deskripsi.trim(),
        kode_promo: form.kode_promo.trim(),
        diskon_persen: form.diskon_persen ? Number(form.diskon_persen) : null,
        diskon_nominal: form.diskon_nominal ? Number(form.diskon_nominal) : null,
        minimal_pembelian: form.minimal_pembelian ? Number(form.minimal_pembelian) : 0,
        tanggal_mulai: form.tanggal_mulai,
        tanggal_selesai: form.tanggal_selesai,
        status: form.status,
        id_pengguna: user?.id,
      }
      if (modal.mode === 'add') await tambah('promo', payload)
      else await ubah('promo', modal.data.id, payload)
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    } finally {
      setSibuk(false)
    }
  }

  const lakukanHapus = async () => {
    setGalat(null)
    setSibuk(true)
    try {
      await hapus('promo', confirm.id)
      setConfirm(null)
    } catch (e) {
      setGalat(e.message)
      setConfirm(null)
    } finally {
      setSibuk(false)
    }
  }

  const columns = [
    {
      key: 'nama',
      header: 'Promo',
      render: (p) => (
        <div>
          <p className="font-medium text-primary">{p.nama}</p>
          <p className="text-[12px] text-muted">Kode: {p.kode_promo}</p>
        </div>
      ),
    },
    {
      key: 'diskon',
      header: 'Diskon',
      render: (p) =>
        p.diskon_persen ? (
          <span className="font-semibold text-secondary">{p.diskon_persen}%</span>
        ) : (
          <span className="font-semibold text-secondary">Rp {(p.diskon_nominal || 0).toLocaleString('id-ID')}</span>
        ),
    },
    {
      key: 'minimal_pembelian',
      header: 'Min Pembelian',
      render: (p) => <span className="text-[12px] text-muted">Rp {(p.minimal_pembelian || 0).toLocaleString('id-ID')}</span>,
    },
    {
      key: 'tanggal_mulai',
      header: 'Berlaku',
      render: (p) => (
        <span className="text-[12px] text-muted">
          {p.tanggal_mulai} s/d {p.tanggal_selesai}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusBadge status={p.status === 'Aktif' ? 'active' : 'inactive'} />,
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (p) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(p)}
            className="p-1.5 text-secondary hover:text-primary hover:surface-raised rounded transition"
            title="Ubah"
          >
            <IconEdit size={16} />
          </button>
          <button
            onClick={() => setConfirm({ id: p.id, nama: p.nama })}
            className="p-1.5 text-secondary hover:text-signal-rose hover:surface-raised rounded transition"
            title="Hapus"
          >
            <IconTrash size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Manajemen Promo"
        subtitle="Buat dan kelola promo diskon untuk meningkatkan penjualan"
        actions={<Button onClick={openAdd}><IconPlus size={18} /> Tambah Promo</Button>}
      />

      <Panel>
        <SearchInput
          placeholder="Cari promo atau kode..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<div className="text-4xl">🎟️</div>}
            title="Belum ada promo"
            description="Buat promo pertama Anda untuk menarik pelanggan"
          />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      {modal && (
        <Modal
          isOpen
          title={modal.mode === 'add' ? 'Tambah Promo' : 'Ubah Promo'}
          onClose={() => setModal(null)}
          onSave={save}
          loading={sibuk}
        >
          <Field label="Nama Promo" required>
            <Input value={form.nama} onChange={set('nama')} placeholder="Contoh: Vitamin Sehat" />
          </Field>

          <Field label="Deskripsi">
            <Input
              value={form.deskripsi}
              onChange={set('deskripsi')}
              placeholder="Deskripsi singkat promo"
              as="textarea"
              rows={2}
            />
          </Field>

          <Field label="Kode Promo" required>
            <Input value={form.kode_promo} onChange={set('kode_promo')} placeholder="Contoh: VITAMIN20" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Diskon Persen (%)">
              <Input type="number" value={form.diskon_persen} onChange={set('diskon_persen')} placeholder="Contoh: 20" />
            </Field>

            <Field label="Diskon Nominal (Rp)">
              <Input type="number" value={form.diskon_nominal} onChange={set('diskon_nominal')} placeholder="Contoh: 15000" />
            </Field>
          </div>

          <Field label="Minimal Pembelian (Rp)">
            <Input type="number" value={form.minimal_pembelian} onChange={set('minimal_pembelian')} placeholder="0" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tanggal Mulai">
              <Input type="date" value={form.tanggal_mulai} onChange={set('tanggal_mulai')} />
            </Field>

            <Field label="Tanggal Selesai">
              <Input type="date" value={form.tanggal_selesai} onChange={set('tanggal_selesai')} />
            </Field>
          </div>

          <Field label="Status">
            <Select value={form.status} onChange={set('status')}>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </Select>
          </Field>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Hapus Promo"
          message={`Yakin hapus promo "${confirm.nama}"?`}
          onConfirm={lakukanHapus}
          onCancel={() => setConfirm(null)}
          loading={sibuk}
        />
      )}
    </div>
  )
}
