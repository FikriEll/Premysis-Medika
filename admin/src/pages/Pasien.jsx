import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, SearchInput, EmptyState , GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { fmtTanggal, hariIni } from '../data/mockData'
import { useData } from '../context/DataContext'
import { IconPlus, IconEdit, IconTrash, IconPasien, IconEye } from '../components/Icons'

const emptyForm = {
  nama: '', nik: '', tanggal_lahir: '', jenis_kelamin: 'P', no_wa: '', alamat: '',
}

export default function Pasien() {
  // Data pasien dari API bersama: pasien yang mendaftar sendiri di
  // aplikasi pasien langsung muncul di sini - PRD N-05.
  const { pasien: rows, bayi, tambah, ubah } = useData()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [modal, setModal] = useState(null) // {mode:'add'|'edit'|'view', data}
  const [form, setForm] = useState(emptyForm)
  const [confirm, setConfirm] = useState(null)

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      const cocokQ =
        !q ||
        p.nama.toLowerCase().includes(q.toLowerCase()) ||
        p.nik.includes(q) ||
        p.no_wa.includes(q)
      const cocokStatus =
        statusFilter === 'semua' ||
        (statusFilter === 'aktif' && p.status_aktif) ||
        (statusFilter === 'nonaktif' && !p.status_aktif)
      return cocokQ && cocokStatus
    })
  }, [rows, q, statusFilter])

  const openAdd = () => {
    setForm(emptyForm)
    setModal({ mode: 'add' })
  }
  const openEdit = (p) => {
    setForm({ ...p })
    setModal({ mode: 'edit', data: p })
  }
  const openView = (p) => setModal({ mode: 'view', data: p })

  const save = async () => {
    if (!form.nama || !form.nik) return
    setGalat(null)
    try {
      if (modal.mode === 'add') {
        await tambah('pasien', { ...form, tanggal_registrasi: hariIni(), status_aktif: true })
      } else {
        await ubah('pasien', modal.data.id, form)
      }
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const toggleAktif = async (p) => {
    setGalat(null)
    try {
      await ubah('pasien', p.id, { status_aktif: !p.status_aktif })
    } catch (e) {
      setGalat(e.message)
    }
    setConfirm(null)
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    {
      key: 'nama',
      header: 'Nama Pasien',
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-[13.5px] font-semibold text-accent">
            {p.nama.charAt(0)}
          </span>
          <div>
            <p className="font-medium text-primary">{p.nama}</p>
            <p className="text-[12px] text-muted">NIK {p.nik}</p>
          </div>
        </div>
      ),
    },
    { key: 'no_wa', header: 'No. WhatsApp' },
    { key: 'tanggal_lahir', header: 'Tgl Lahir', render: (p) => fmtTanggal(p.tanggal_lahir) },
    { key: 'jenis_kelamin', header: 'JK', render: (p) => <StatusBadge status={p.jenis_kelamin} /> },
    { key: 'tanggal_registrasi', header: 'Registrasi', render: (p) => fmtTanggal(p.tanggal_registrasi) },
    {
      key: 'status_aktif',
      header: 'Status',
      render: (p) => <StatusBadge status={p.status_aktif ? 'Aktif' : 'Nonaktif'} />,
    },
    {
      key: 'aksi',
      header: '',
      headerClass: 'text-right',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => openView(p)} title="Detail" aria-label="Detail">
            <IconEye size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(p)} title="Edit" aria-label="Edit">
            <IconEdit size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-[var(--color-signal-rose)] hover:bg-[var(--color-signal-rose-soft)]"
            onClick={() => setConfirm(p)}
            title={p.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
           aria-label="Hapus">
            <IconTrash size={16} />
          </Button>
        </div>
      ),
    },
  ]

  const bayiPasien = modal?.mode === 'view' ? bayi.filter((b) => b.id_pasien === modal.data.id) : []

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Manajemen Pasien"
        subtitle={`${rows.length} pasien terdaftar`}
        actions={
          <Button onClick={openAdd}>
            <IconPlus size={18} /> Tambah Pasien
          </Button>
        }
      />

      <Panel divided={false}>
        <div className="flex flex-col gap-3 border-b border-hairline p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, NIK, atau No. WhatsApp..." />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Pasien tidak ditemukan"
            message="Coba ubah kata kunci atau filter status."
            icon={<IconPasien size={20} />}
          />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      {/* Form tambah/edit */}
      <Modal
        open={modal?.mode === 'add' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Tambah Pasien' : 'Edit Pasien'}
        subtitle="Data pasien tersimpan terpusat - PRD §A-02"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nama Lengkap" required>
              <Input value={form.nama} onChange={set('nama')} placeholder="Nama pasien" />
            </Field>
          </div>
          <Field label="NIK" required hint="16 digit, unik - §BR-10">
            <Input value={form.nik} onChange={set('nik')} placeholder="3276xxxxxxxxxxxx" maxLength={16} />
          </Field>
          <Field label="No. WhatsApp" required>
            <Input value={form.no_wa} onChange={set('no_wa')} placeholder="08xx-xxxx-xxxx" />
          </Field>
          <Field label="Tanggal Lahir" required>
            <Input type="date" value={form.tanggal_lahir} onChange={set('tanggal_lahir')} />
          </Field>
          <Field label="Jenis Kelamin" required>
            <Select value={form.jenis_kelamin} onChange={set('jenis_kelamin')}>
              <option value="P">Perempuan</option>
              <option value="L">Laki-laki</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Alamat" required>
              <Input value={form.alamat} onChange={set('alamat')} placeholder="Alamat lengkap" />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Detail */}
      <Modal
        open={modal?.mode === 'view'}
        onClose={() => setModal(null)}
        title={modal?.data?.nama}
        subtitle="Detail data pasien"
        footer={<Button variant="secondary" onClick={() => setModal(null)}>Tutup</Button>}
      >
        {modal?.data && (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['NIK', modal.data.nik],
                ['No. WhatsApp', modal.data.no_wa],
                ['Tanggal Lahir', fmtTanggal(modal.data.tanggal_lahir)],
                ['Jenis Kelamin', modal.data.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'],
                ['Tanggal Registrasi', fmtTanggal(modal.data.tanggal_registrasi)],
                ['Status', modal.data.status_aktif ? 'Aktif' : 'Nonaktif'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[var(--radius-control)] surface-sunken px-3 py-2">
                  <dt className="text-[12px] text-muted">{k}</dt>
                  <dd className="text-[13.5px] font-medium text-primary">{v}</dd>
                </div>
              ))}
              <div className="rounded-[var(--radius-control)] surface-sunken px-3 py-2 sm:col-span-2">
                <dt className="text-[12px] text-muted">Alamat</dt>
                <dd className="text-[13.5px] font-medium text-primary">{modal.data.alamat}</dd>
              </div>
            </dl>

            <div>
              <p className="mb-2 text-[13.5px] font-semibold text-primary">Data Bayi / Anak ({bayiPasien.length})</p>
              {bayiPasien.length === 0 ? (
                <p className="rounded-[var(--radius-control)] surface-sunken px-3 py-3 text-[13.5px] text-muted">
                  Pasien ini belum memiliki data bayi terdaftar.
                </p>
              ) : (
                <ul className="space-y-2">
                  {bayiPasien.map((b) => (
                    <li key={b.id} className="flex items-center justify-between rounded-[var(--radius-control)] border border-hairline px-3 py-2">
                      <div>
                        <p className="text-[13.5px] font-medium text-primary">{b.nama}</p>
                        <p className="text-[12px] text-muted">
                          {b.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'} · Lahir {fmtTanggal(b.tanggal_lahir)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => toggleAktif(confirm)}
        title={confirm?.status_aktif ? 'Nonaktifkan Pasien' : 'Aktifkan Pasien'}
        message={
          confirm?.status_aktif
            ? `Pasien "${confirm?.nama}" akan dinonaktifkan. Riwayat tetap tersimpan dan tidak dihapus.`
            : `Aktifkan kembali pasien "${confirm?.nama}"?`
        }
        confirmLabel={confirm?.status_aktif ? 'Ya, nonaktifkan' : 'Ya, aktifkan'}
        variant={confirm?.status_aktif ? 'danger' : 'success'}
      />
    </div>
  )
}
