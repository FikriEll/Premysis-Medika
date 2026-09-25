import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, SearchInput, EmptyState , GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { namaBayi, namaPasien, fmtTanggal, hariIni } from '../data/mockData'
import { useData } from '../context/DataContext'
import { IconPlus, IconVaksin, IconCheck, IconEye } from '../components/Icons'

export default function Vaksinasi() {
  // Jadwal vaksin dari API bersama; bayi yang didaftarkan pasien otomatis
  // mendapat jadwal (BR-07) sehingga langsung tampil di sini.
  const { jadwalVaksin: rows, bayi, jenisVaksin, tambah, ubah } = useData()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ id_bayi: '', id_jenis_vaksin: '', tanggal_terjadwal: '', status: 'Terjadwal' })
  const [detailBayi, setDetailBayi] = useState(null)

  const filtered = useMemo(
    () => rows.filter((j) => {
      const cocokQ = !q || namaBayi(j.id_bayi).toLowerCase().includes(q.toLowerCase()) || j.nama_vaksin.toLowerCase().includes(q.toLowerCase())
      const cocokStatus = statusFilter === 'semua' || j.status === statusFilter
      return cocokQ && cocokStatus
    }),
    [rows, q, statusFilter],
  )

  const openAdd = () => {
    setForm({ id_bayi: '', id_jenis_vaksin: '', tanggal_terjadwal: '', status: 'Terjadwal' })
    setModal({ mode: 'add' })
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async () => {
    if (!form.id_bayi || !form.id_jenis_vaksin) return
    const jv = jenisVaksin.find((j) => j.id === Number(form.id_jenis_vaksin))
    setGalat(null)
    try {
      await tambah('jadwalVaksin', {
        id_bayi: Number(form.id_bayi),
        id_jenis_vaksin: Number(form.id_jenis_vaksin),
        nama_vaksin: jv?.nama_vaksin || '-',
        tanggal_terjadwal: form.tanggal_terjadwal,
        tanggal_diberikan: null,
        status: 'Terjadwal',
      })
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const beriVaksin = async (j) => {
    setGalat(null)
    try {
      await ubah('jadwalVaksin', j.id, { tanggal_diberikan: hariIni(), status: 'Selesai' })
    } catch (e) {
      setGalat(e.message)
    }
  }

  const columns = [
    { key: 'bayi', header: 'Bayi', render: (j) => {
      const b = bayi.find((x) => x.id === j.id_bayi)
      return (
        <div>
          <p className="font-medium text-primary">{namaBayi(j.id_bayi)}</p>
          <p className="text-[12px] text-muted">{b ? `Orang tua: ${b.nama_orang_tua}` : '-'}</p>
        </div>
      )
    }},
    { key: 'nama_vaksin', header: 'Jenis Vaksin' },
    { key: 'tanggal_terjadwal', header: 'Terjadwal', render: (j) => fmtTanggal(j.tanggal_terjadwal) },
    { key: 'tanggal_diberikan', header: 'Diberikan', render: (j) => j.tanggal_diberikan ? fmtTanggal(j.tanggal_diberikan) : <span className="text-muted">-</span> },
    { key: 'status', header: 'Status', render: (j) => <StatusBadge status={j.status} /> },
    { key: 'aksi', header: '', headerClass: 'text-right', className: 'text-right', render: (j) => (
      <div className="flex justify-end gap-1">
        {j.status === 'Terjadwal' && (
          <Button size="sm" variant="success" onClick={() => beriVaksin(j)} title="Tandai sudah diberikan">
            <IconCheck size={16} /> Beri
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setDetailBayi(j.id_bayi)} title="Riwayat vaksin bayi" aria-label="Tandai sudah diberikan">
            <IconEye size={16} />
          </Button>
      </div>
    )},
  ]

  const riwayatBayi = detailBayi ? rows.filter((r) => r.id_bayi === detailBayi).sort((a, b) => a.tanggal_terjadwal.localeCompare(b.tanggal_terjadwal)) : []
  const bayiInfo = bayi.find((b) => b.id === detailBayi)

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Manajemen Vaksinasi"
        subtitle="Jadwal & pencatatan imunisasi bayi"
        actions={
          <Button onClick={openAdd}>
            <IconPlus size={18} /> Jadwalkan Vaksin
          </Button>
        }
      />

      {/* Ringkasan bayi terdaftar */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {bayi.map((b) => {
          const total = rows.filter((r) => r.id_bayi === b.id).length
          const selesai = rows.filter((r) => r.id_bayi === b.id && r.status === 'Selesai').length
          return (
            <div key={b.id} className="surface-raised rounded-[var(--radius-card)] border border-hairline p-4 shadow-soft">
              <p className="truncate text-[13.5px] font-medium text-primary">{b.nama}</p>
              <p className="text-[12px] text-muted">{namaPasien(b.id_pasien)}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full surface-sunken">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${total ? (selesai / total) * 100 : 0}%` }} />
                </div>
                <span className="numeric text-[12px] font-medium text-secondary">{selesai}/{total}</span>
              </div>
            </div>
          )
        })}
      </div>

      <Panel divided={false}>
        <div className="flex flex-col gap-3 border-b border-hairline p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama bayi atau jenis vaksin..." />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
            <option value="semua">Semua Status</option>
            <option value="Terjadwal">Terjadwal</option>
            <option value="Selesai">Selesai</option>
          </Select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Tidak ada jadwal vaksin" icon={<IconVaksin size={20} />} />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      {/* Jadwalkan vaksin - §A-05, BR-07 */}
      <Modal
        open={modal?.mode === 'add'}
        onClose={() => setModal(null)}
        title="Jadwalkan Vaksin"
        subtitle="Jadwal dapat dibuat otomatis dari master imunisasi - §BR-07"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button onClick={save}>Simpan Jadwal</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Bayi" required>
            <Select value={form.id_bayi} onChange={set('id_bayi')}>
              <option value="">Pilih bayi</option>
              {bayi.map((b) => <option key={b.id} value={b.id}>{b.nama} ({b.nama_orang_tua})</option>)}
            </Select>
          </Field>
          <Field label="Jenis Vaksin" required hint="Usia anjuran otomatis dari master">
            <Select value={form.id_jenis_vaksin} onChange={set('id_jenis_vaksin')}>
              <option value="">Pilih vaksin</option>
              {jenisVaksin.map((j) => <option key={j.id} value={j.id}>{j.nama_vaksin} (usia {j.usia_bulan} bln)</option>)}
            </Select>
          </Field>
          <Field label="Tanggal Terjadwal" required>
            <Input type="date" value={form.tanggal_terjadwal} onChange={set('tanggal_terjadwal')} />
          </Field>
        </div>
      </Modal>

      {/* Riwayat vaksin per bayi */}
      <Modal
        open={!!detailBayi}
        onClose={() => setDetailBayi(null)}
        title={bayiInfo ? `Riwayat Vaksin - ${bayiInfo.nama}` : ''}
        subtitle={bayiInfo ? `Lahir ${fmtTanggal(bayiInfo.tanggal_lahir)} · Orang tua: ${bayiInfo.nama_orang_tua}` : ''}
        footer={<Button variant="secondary" onClick={() => setDetailBayi(null)}>Tutup</Button>}
      >
        <ul className="space-y-2">
          {riwayatBayi.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-[var(--radius-control)] border border-hairline px-4 py-3">
              <div>
                <p className="text-[13.5px] font-medium text-primary">{r.nama_vaksin}</p>
                <p className="text-[12px] text-muted">
                  Terjadwal {fmtTanggal(r.tanggal_terjadwal)}
                  {r.tanggal_diberikan && ` · Diberikan ${fmtTanggal(r.tanggal_diberikan)}`}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  )
}
