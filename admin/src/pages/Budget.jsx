import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, SearchInput, EmptyState, Metric, MetricStrip, GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { IconPlus, IconEdit, IconTrash, IconTrend } from '../components/Icons'

const emptyForm = {
  bulan: '',
  modal_awal: '',
  stok_nilai: '',
  penjualan_bruto: '',
  penjualan_bersih: '',
  pengeluaran: '',
  laba_kotor: '',
  laba_bersih: '',
  catatan: '',
}

export default function Budget() {
  const { budget: rows, tambah, ubah, hapus } = useData()
  const { user } = useAuth()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirm, setConfirm] = useState(null)
  const [sibuk, setSibuk] = useState(false)

  const filtered = useMemo(
    () => rows
      .filter((b) => !q || b.bulan.includes(q) || (b.catatan || '').toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.bulan.localeCompare(a.bulan)),
    [rows, q],
  )

  const totalPenjualan = rows.reduce((s, b) => s + (b.penjualan_bersih || 0), 0)
  const totalPengeluaran = rows.reduce((s, b) => s + (b.pengeluaran || 0), 0)
  const totalLaba = rows.reduce((s, b) => s + (b.laba_bersih || 0), 0)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const openAdd = () => {
    setForm(emptyForm)
    setGalat(null)
    setModal({ mode: 'add' })
  }

  const openEdit = (b) => {
    setForm(b)
    setGalat(null)
    setModal({ mode: 'edit', data: b })
  }

  const save = async () => {
    if (!form.bulan.trim()) {
      setGalat('Bulan wajib diisi (format: YYYY-MM).')
      return
    }
    setGalat(null)
    setSibuk(true)
    try {
      const payload = {
        bulan: form.bulan.trim(),
        modal_awal: form.modal_awal ? Number(form.modal_awal) : 0,
        stok_nilai: form.stok_nilai ? Number(form.stok_nilai) : 0,
        penjualan_bruto: form.penjualan_bruto ? Number(form.penjualan_bruto) : 0,
        penjualan_bersih: form.penjualan_bersih ? Number(form.penjualan_bersih) : 0,
        pengeluaran: form.pengeluaran ? Number(form.pengeluaran) : 0,
        laba_kotor: form.laba_kotor ? Number(form.laba_kotor) : 0,
        laba_bersih: form.laba_bersih ? Number(form.laba_bersih) : 0,
        catatan: form.catatan.trim(),
        id_pengguna: user?.id,
      }
      if (modal.mode === 'add') await tambah('budget', payload)
      else await ubah('budget', modal.data.id, payload)
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
      await hapus('budget', confirm.id)
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
      key: 'bulan',
      header: 'Bulan',
      render: (b) => <span className="font-medium text-primary">{b.bulan}</span>,
    },
    {
      key: 'penjualan_bersih',
      header: 'Penjualan Bersih',
      render: (b) => <span className="font-medium text-secondary">Rp {(b.penjualan_bersih || 0).toLocaleString('id-ID')}</span>,
    },
    {
      key: 'pengeluaran',
      header: 'Pengeluaran',
      render: (b) => <span className="text-secondary">Rp {(b.pengeluaran || 0).toLocaleString('id-ID')}</span>,
    },
    {
      key: 'laba_bersih',
      header: 'Laba Bersih',
      render: (b) => (
        <span className="font-semibold text-signal-green">Rp {(b.laba_bersih || 0).toLocaleString('id-ID')}</span>
      ),
    },
    {
      key: 'catatan',
      header: 'Catatan',
      className: 'max-w-[200px]',
      render: (b) => <span className="text-[12px] text-muted">{b.catatan || '—'}</span>,
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (b) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(b)}
            className="p-1.5 text-secondary hover:text-primary hover:surface-raised rounded transition"
            title="Ubah"
          >
            <IconEdit size={16} />
          </button>
          <button
            onClick={() => setConfirm({ id: b.id, bulan: b.bulan })}
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
        title="Manajemen Budget & RAB"
        subtitle="Laporan anggaran, stok, modal, pemasukan dan pengeluaran"
        actions={<Button onClick={openAdd}><IconPlus size={18} /> Tambah Budget</Button>}
      />

      <MetricStrip>
        <Metric label="Total Penjualan" value={`Rp ${totalPenjualan.toLocaleString('id-ID')}`} icon={<IconTrend size={20} />} />
        <Metric label="Total Pengeluaran" value={`Rp ${totalPengeluaran.toLocaleString('id-ID')}`} />
        <Metric label="Total Laba" value={`Rp ${totalLaba.toLocaleString('id-ID')}`} tone="positive" />
      </MetricStrip>

      <Panel>
        <SearchInput
          placeholder="Cari bulan atau catatan..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<div className="text-4xl">📊</div>}
            title="Belum ada data budget"
            description="Mulai buat laporan budget bulanan Anda"
          />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      {modal && (
        <Modal
          isOpen
          title={modal.mode === 'add' ? 'Tambah Budget' : 'Ubah Budget'}
          onClose={() => setModal(null)}
          onSave={save}
          loading={sibuk}
        >
          <Field label="Bulan (YYYY-MM)" required>
            <Input type="month" value={form.bulan} onChange={set('bulan')} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Modal Awal (Rp)">
              <Input type="number" value={form.modal_awal} onChange={set('modal_awal')} placeholder="0" />
            </Field>

            <Field label="Nilai Stok (Rp)">
              <Input type="number" value={form.stok_nilai} onChange={set('stok_nilai')} placeholder="0" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Penjualan Bruto (Rp)">
              <Input type="number" value={form.penjualan_bruto} onChange={set('penjualan_bruto')} placeholder="0" />
            </Field>

            <Field label="Penjualan Bersih (Rp)">
              <Input type="number" value={form.penjualan_bersih} onChange={set('penjualan_bersih')} placeholder="0" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Pengeluaran (Rp)">
              <Input type="number" value={form.pengeluaran} onChange={set('pengeluaran')} placeholder="0" />
            </Field>

            <Field label="Laba Kotor (Rp)">
              <Input type="number" value={form.laba_kotor} onChange={set('laba_kotor')} placeholder="0" />
            </Field>
          </div>

          <Field label="Laba Bersih (Rp)">
            <Input type="number" value={form.laba_bersih} onChange={set('laba_bersih')} placeholder="0" />
          </Field>

          <Field label="Catatan">
            <Input
              value={form.catatan}
              onChange={set('catatan')}
              placeholder="Catatan atau keterangan"
              as="textarea"
              rows={2}
            />
          </Field>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Hapus Budget"
          message={`Yakin hapus data budget ${confirm.bulan}?`}
          onConfirm={lakukanHapus}
          onCancel={() => setConfirm(null)}
          loading={sibuk}
        />
      )}
    </div>
  )
}
