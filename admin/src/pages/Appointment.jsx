import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, Textarea, SearchInput, EmptyState , GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { namaPasien, fmtTanggal } from '../data/mockData'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { IconPlus, IconEdit, IconCheck, IconClose, IconAppointment, IconWhatsapp } from '../components/Icons'

const LAYANAN = [
  'Pemeriksaan Kehamilan',
  'Imunisasi Bayi',
  'Konsultasi Umum',
  'Kontrol Nifas',
  'KB / Kontrasepsi',
]

const STATUS_APPT = ['Menunggu Konfirmasi', 'Dikonfirmasi', 'Selesai', 'Dibatalkan']

// Filter periode sederhana (berdasarkan tanggal mock 2026-04-20)
const hariIni = '2026-04-20'

export default function Appointment() {
  // Data appointment dibaca dari API bersama, jadi janji yang dibuat
  // pasien lewat aplikasi pasien langsung tampil di sini - PRD N-05.
  const { appointment: rows, pasien, tambah, ubah, ubahStatusAppointment } = useData()
  const { user } = useAuth()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [periode, setPeriode] = useState('semua')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ id_pasien: '', jenis_layanan: LAYANAN[0], tanggal: '', waktu: '', keluhan: '', catatan: '' })
  const [confirm, setConfirm] = useState(null)

  const filtered = useMemo(() => {
    const d = new Date(hariIni)
    return rows
      .filter((a) => {
        const cocokQ = !q || namaPasien(a.id_pasien).toLowerCase().includes(q.toLowerCase()) || a.jenis_layanan.toLowerCase().includes(q.toLowerCase())
        const cocokStatus = statusFilter === 'semua' || a.status === statusFilter
        let cocokPeriode = true
        const t = new Date(a.tanggal)
        if (periode === 'hari') cocokPeriode = a.tanggal === hariIni
        else if (periode === 'minggu') cocokPeriode = Math.abs((t - d) / 86400000) <= 7
        else if (periode === 'bulan') cocokPeriode = t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear()
        return cocokQ && cocokStatus && cocokPeriode
      })
      .sort((a, b) => (b.tanggal + b.waktu).localeCompare(a.tanggal + a.waktu))
  }, [rows, q, periode, statusFilter])

  const save = async () => {
    if (!form.id_pasien || !form.tanggal) return
    setGalat(null)
    try {
      if (modal.mode === 'add') {
        await tambah('appointment', {
          ...form,
          id_pasien: Number(form.id_pasien),
          id_bidan: 1,
          status: 'Menunggu Konfirmasi',
          id_pengguna: user?.id,
        })
      } else {
        await ubah('appointment', modal.data.id, { ...form, id_pasien: Number(form.id_pasien) })
      }
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const ubahStatus = async (a, status) => {
    setGalat(null)
    try {
      await ubahStatusAppointment(a.id, status, user?.id)
    } catch (e) {
      setGalat(e.message)
    }
    setConfirm(null)
  }

  const openAdd = () => {
    setForm({ id_pasien: '', jenis_layanan: LAYANAN[0], tanggal: hariIni, waktu: '09:00', keluhan: '', catatan: '' })
    setModal({ mode: 'add' })
  }
  const openEdit = (a) => {
    setForm({ ...a, id_pasien: String(a.id_pasien) })
    setModal({ mode: 'edit', data: a })
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const columns = [
    { key: 'tanggal', header: 'Jadwal', render: (a) => (
      <div>
        <p className="font-medium text-primary">{fmtTanggal(a.tanggal)}</p>
        <p className="text-[12px] text-muted">{a.waktu} WIB</p>
      </div>
    )},
    { key: 'pasien', header: 'Pasien', render: (a) => (
      <div>
        <p className="font-medium text-primary">{namaPasien(a.id_pasien)}</p>
        <p className="text-[12px] text-muted">Siska Mariawati</p>
      </div>
    )},
    { key: 'jenis_layanan', header: 'Jenis Layanan' },
    { key: 'keluhan', header: 'Keluhan', className: 'max-w-[220px]', render: (a) => (
      <span className="line-clamp-2 text-secondary">{a.keluhan || '-'}</span>
    )},
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    { key: 'aksi', header: '', headerClass: 'text-right', className: 'text-right', render: (a) => (
      <div className="flex justify-end gap-1">
        {a.status === 'Menunggu Konfirmasi' && (
          <Button size="sm" variant="success" onClick={() => ubahStatus(a, 'Dikonfirmasi')} title="Konfirmasi" aria-label="Konfirmasi">
            <IconCheck size={16} />
          </Button>
        )}
        {a.status === 'Dikonfirmasi' && (
          <Button size="sm" variant="secondary" onClick={() => ubahStatus(a, 'Selesai')} title="Tandai Selesai" aria-label="Tandai Selesai">
            <IconCheck size={16} />
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => openEdit(a)} title="Ubah jadwal" aria-label="Ubah jadwal">
            <IconEdit size={16} />
          </Button>
        {a.status !== 'Selesai' && a.status !== 'Dibatalkan' && (
          <Button size="sm" variant="ghost" className="text-[var(--color-signal-rose)] hover:bg-[var(--color-signal-rose-soft)]" onClick={() => setConfirm(a)} title="Batalkan" aria-label="Batalkan">
            <IconClose size={16} />
          </Button>
        )}
      </div>
    )},
  ]

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Manajemen Appointment"
        subtitle="Konfirmasi, ubah jadwal, dan kelola status appointment"
        actions={
          <>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-hairline bg-[var(--color-signal-green-soft)] px-3.5 py-2 text-[13.5px] font-medium text-[var(--color-signal-green)] hover:bg-[var(--color-signal-green-soft)]"
            >
              <IconWhatsapp size={18} /> WhatsApp Klinik
            </a>
            <Button onClick={openAdd}>
              <IconPlus size={18} /> Tambah Appointment
            </Button>
          </>
        }
      />

      <Panel divided={false}>
        <div className="flex flex-col gap-3 border-b border-hairline p-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari pasien atau jenis layanan..." />
          </div>
          <div className="flex gap-2">
            <Select value={periode} onChange={(e) => setPeriode(e.target.value)} className="w-36">
              <option value="semua">Semua Waktu</option>
              <option value="hari">Hari Ini</option>
              <option value="minggu">Minggu Ini</option>
              <option value="bulan">Bulan Ini</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48">
              <option value="semua">Semua Status</option>
              {STATUS_APPT.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Tidak ada appointment" message="Ubah filter atau tambah appointment baru." icon={<IconAppointment size={20} />} />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      <Modal
        open={modal?.mode === 'add' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Tambah Appointment' : 'Ubah Appointment'}
        subtitle="Status awal: Menunggu Konfirmasi - PRD §F-03"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Pasien" required>
              <Select value={form.id_pasien} onChange={set('id_pasien')}>
                <option value="">Pilih pasien</option>
                {pasien.filter((p) => p.status_aktif).map((p) => (
                  <option key={p.id} value={p.id}>{p.nama} ({p.no_wa})</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Jenis Layanan" required>
              <Select value={form.jenis_layanan} onChange={set('jenis_layanan')}>
                {LAYANAN.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Tanggal" required>
            <Input type="date" value={form.tanggal} onChange={set('tanggal')} />
          </Field>
          <Field label="Waktu" required hint="Cegah bentrok jadwal - §BR-01">
            <Input type="time" value={form.waktu} onChange={set('waktu')} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Keluhan">
              <Textarea value={form.keluhan} onChange={set('keluhan')} placeholder="Keluhan pasien..." />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Catatan">
              <Input value={form.catatan} onChange={set('catatan')} placeholder="Catatan tambahan (opsional)" />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => ubahStatus(confirm, 'Dibatalkan')}
        title="Batalkan Appointment"
        message={`Batalkan appointment ${namaPasien(confirm?.id_pasien)} pada ${fmtTanggal(confirm?.tanggal)} ${confirm?.waktu}?`}
        confirmLabel="Ya, batalkan"
      />
    </div>
  )
}
