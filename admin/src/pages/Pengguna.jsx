import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, EmptyState , GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { roleLabels, namaPengguna } from '../data/mockData'
import { useData } from '../context/DataContext'
import { IconPlus, IconEdit, IconTrash, IconPengguna, IconCheck } from '../components/Icons'
import { permissions } from '../context/AuthContext'

// Label modul untuk matriks RBAC - PRD §5.1
const modulLabel = {
  dashboard: 'Dashboard', pasien: 'Pasien', appointment: 'Appointment', pemeriksaan: 'Pemeriksaan',
  vaksinasi: 'Vaksinasi', resep: 'Resep', produk: 'Produk/Obat', stok: 'Stok',
  pesanan: 'Pesanan', pengguna: 'Pengguna', laporan: 'Laporan',
}
const peranList = ['bidan', 'asisten']

const emptyForm = { nama: '', email: '', peran: 'asisten', no_hp: '', status_aktif: true }

export default function Pengguna() {
  // Akun pengguna & log aktivitas dari API bersama (BR-09 audit trail).
  const { users: rows, logAktivitas, tambah, ubah } = useData()
  const [galat, setGalat] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirm, setConfirm] = useState(null)
  const [tab, setTab] = useState('akun')

  const openAdd = () => {
    setForm(emptyForm)
    setModal({ mode: 'add' })
  }
  const openEdit = (u) => {
    setForm({ ...u })
    setModal({ mode: 'edit', data: u })
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async () => {
    if (!form.nama || !form.email) return
    setGalat(null)
    try {
      if (modal.mode === 'add') await tambah('users', form)
      else await ubah('users', modal.data.id, form)
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const toggleAktif = async (u) => {
    setGalat(null)
    try {
      await ubah('users', u.id, { status_aktif: !u.status_aktif })
    } catch (e) {
      setGalat(e.message)
    }
    setConfirm(null)
  }

  const columns = [
    { key: 'nama', header: 'Nama', render: (u) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-[13.5px] font-semibold text-accent">
          {u.nama.charAt(0)}
        </span>
        <div>
          <p className="font-medium text-primary">{u.nama}</p>
          <p className="text-[12px] text-muted">{u.email}</p>
        </div>
      </div>
    )},
    { key: 'peran', header: 'Peran', render: (u) => <span className="text-primary">{roleLabels[u.peran]}</span> },
    { key: 'no_hp', header: 'No. HP', render: (u) => u.no_hp || '-' },
    { key: 'status_aktif', header: 'Status', render: (u) => <StatusBadge status={u.status_aktif ? 'Aktif' : 'Nonaktif'} /> },
    { key: 'aksi', header: '', headerClass: 'text-right', className: 'text-right', render: (u) => (
      <div className="flex justify-end gap-1">
        <Button size="sm" variant="ghost" onClick={() => openEdit(u)} title="Edit" aria-label="Edit">
            <IconEdit size={16} />
          </Button>
        <Button size="sm" variant="ghost" className="text-[var(--color-signal-rose)] hover:bg-[var(--color-signal-rose-soft)]" onClick={() => setConfirm(u)} title="Nonaktifkan" aria-label="Nonaktifkan">
            <IconTrash size={16} />
          </Button>
      </div>
    )},
  ]

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Manajemen Pengguna & RBAC"
        subtitle="Kelola akun & hak akses sesuai peran - §A-10"
        actions={<Button onClick={openAdd}><IconPlus size={18} /> Tambah Pengguna</Button>}
      />

      <div className="mb-4 flex gap-2">
        {[['akun', 'Akun Pengguna'], ['rbac', 'Matriks Hak Akses'], ['log', 'Log Aktivitas']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-[var(--radius-control)] border px-4 py-2 text-[13.5px] font-medium transition ${
              tab === k ? 'border-[var(--accent)] bg-accent-soft text-accent' : 'border-hairline surface-raised text-secondary hover:surface-hover'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'akun' && (
        <Panel title="Akun pengguna" subtitle={`${rows.length} akun terdaftar`}>
          {rows.length === 0 ? (
            <EmptyState
              title="Belum ada pengguna"
              message="Tambahkan akun bidan atau asisten untuk memberi akses ke dashboard."
              icon={<IconPengguna size={20} />}
            />
          ) : (
            <DataTable columns={columns} rows={rows} />
          )}
        </Panel>
      )}

      {tab === 'rbac' && (
        <Panel
          title="Matriks hak akses"
          subtitle="Mengikuti PRD §5.1"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th scope="col" className="px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted">Modul</th>
                  {peranList.map((p) => (
                    <th key={p} scope="col" className="px-5 py-3 text-center text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted">
                      {roleLabels[p]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {Object.keys(modulLabel).map((m) => (
                  <tr key={m} className="transition-colors duration-150 hover:surface-hover">
                    <td className="px-5 py-3 font-medium text-primary">{modulLabel[m]}</td>
                    {peranList.map((p) => {
                      const boleh = permissions[p]?.includes(m)
                      return (
                        <td key={p} className="px-5 py-3 text-center">
                          {boleh ? (
                            <>
                              <span className="inline-flex text-[var(--color-signal-green)]" aria-hidden="true">
                                <IconCheck size={16} />
                              </span>
                              <span className="sr-only">Boleh akses</span>
                            </>
                          ) : (
                            <span className="text-muted" aria-label="Tidak ada akses">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-hairline px-5 py-3 text-[12px] text-muted">
            Hak akses ditegakkan di sisi server pada implementasi nyata; antarmuka hanya menyembunyikan menu.
          </p>
        </Panel>
      )}

      {tab === 'log' && (
        <Panel title="Log aktivitas" subtitle={`${logAktivitas.length} catatan terakhir`}>
          <ul className="divide-y divide-[var(--border-hairline)]">
            {logAktivitas.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] text-primary">{l.aksi} <span className="text-muted">- {l.entitas} #{l.id_entitas}</span></p>
                  <p className="text-[12px] text-muted">{namaPengguna(l.id_pengguna)}</p>
                </div>
                <span className="text-[12px] text-muted">{l.waktu}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Modal
        open={modal?.mode === 'add' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Tambah Pengguna' : 'Edit Pengguna'}
        subtitle="Peran menentukan hak akses (RBAC) - §A-10"
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
              <Input value={form.nama} onChange={set('nama')} placeholder="Nama pengguna" />
            </Field>
          </div>
          <Field label="Email" required>
            <Input type="email" value={form.email} onChange={set('email')} placeholder="nama@premysismedika.id" />
          </Field>
          <Field label="No. HP">
            <Input value={form.no_hp} onChange={set('no_hp')} placeholder="08xx-xxxx-xxxx" />
          </Field>
          <Field label="Peran" required hint="Hak akses mengikuti matriks §5.1">
            <Select value={form.peran} onChange={set('peran')}>
              {peranList.map((p) => <option key={p} value={p}>{roleLabels[p]}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status_aktif ? 'aktif' : 'nonaktif'} onChange={(e) => setForm({ ...form, status_aktif: e.target.value === 'aktif' })}>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => toggleAktif(confirm)}
        title={confirm?.status_aktif ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
        message={confirm?.status_aktif ? `Pengguna "${confirm?.nama}" tidak akan dapat login.` : `Aktifkan kembali pengguna "${confirm?.nama}"?`}
        confirmLabel={confirm?.status_aktif ? 'Ya, nonaktifkan' : 'Ya, aktifkan'}
        variant={confirm?.status_aktif ? 'danger' : 'success'}
      />
    </div>
  )
}
