import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, Textarea, SearchInput, EmptyState , GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { namaPasien, namaProduk, fmtTanggal } from '../data/mockData'
import { useData } from '../context/DataContext'
import { IconPlus, IconPemeriksaan, IconEye, IconResep } from '../components/Icons'

const emptyForm = {
  id_pasien: '', keluhan: '', riwayat: '', hasil: '', diagnosis: '', tindakan: '', catatan: '', jadwal_kontrol: '',
}

export default function Pemeriksaan() {
  // Riwayat pemeriksaan dari API bersama; ini yang dibaca pasien di
  // menu Riwayat aplikasi pasien (F-04).
  const { pemeriksaan: rows, pasien, produk, tambah } = useData()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [resepDraft, setResepDraft] = useState([])

  const filtered = useMemo(
    () => rows
      .filter((p) => !q || namaPasien(p.id_pasien).toLowerCase().includes(q.toLowerCase()) || (p.diagnosis || '').toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [rows, q],
  )

  const openAdd = () => {
    setForm(emptyForm)
    setResepDraft([])
    setModal({ mode: 'add' })
  }
  const openView = (p) => setModal({ mode: 'view', data: p })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const addResepItem = () => setResepDraft([...resepDraft, { id_produk: '', dosis: '', jumlah: 1, aturan_pakai: '' }])
  const updateResepItem = (i, k, v) => setResepDraft(resepDraft.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))
  const removeResepItem = (i) => setResepDraft(resepDraft.filter((_, idx) => idx !== i))

  const save = async () => {
    if (!form.id_pasien || !form.diagnosis) return
    setGalat(null)
    try {
      await tambah('pemeriksaan', {
        ...form,
        id_pasien: Number(form.id_pasien),
        id_appointment: null,
        id_bidan: 1,
        tanggal: '2026-04-20',
        resep: resepDraft,
      })
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const columns = [
    { key: 'tanggal', header: 'Tanggal', render: (p) => fmtTanggal(p.tanggal) },
    { key: 'pasien', header: 'Pasien', render: (p) => (
      <div>
        <p className="font-medium text-primary">{namaPasien(p.id_pasien)}</p>
        <p className="text-[12px] text-muted">Bidan: Siska Mariawati</p>
      </div>
    )},
    { key: 'diagnosis', header: 'Diagnosis', className: 'max-w-[240px]', render: (p) => (
      <span className="line-clamp-2 text-secondary">{p.diagnosis}</span>
    )},
    { key: 'tindakan', header: 'Tindakan', className: 'max-w-[200px]', render: (p) => (
      <span className="line-clamp-2 text-secondary">{p.tindakan || '-'}</span>
    )},
    { key: 'resep', header: 'Resep', render: (p) => (
      p.resep?.length || (p.id === 3 || p.id === 4 || p.id === 1) ? (
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-accent">
          <IconResep size={14} /> Ada
        </span>
      ) : <span className="text-[12px] text-muted">-</span>
    )},
    { key: 'aksi', header: '', headerClass: 'text-right', className: 'text-right', render: (p) => (
      <Button size="sm" variant="ghost" onClick={() => openView(p)} title="Lihat rekam medis" aria-label="Lihat rekam medis">
            <IconEye size={16} />
          </Button>
    )},
  ]

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Pemeriksaan & Rekam Medis"
        subtitle="Catat hasil pemeriksaan, diagnosis, tindakan, dan resep"
        actions={
          <Button onClick={openAdd}>
            <IconPlus size={18} /> Pemeriksaan Baru
          </Button>
        }
      />

      <Panel divided={false}>
        <div className="border-b border-hairline p-4">
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari pasien atau diagnosis..." />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Belum ada pemeriksaan" message="Catat pemeriksaan baru untuk memulai." icon={<IconPemeriksaan size={20} />} />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      {/* Form input pemeriksaan - §A-04 */}
      <Modal
        open={modal?.mode === 'add'}
        onClose={() => setModal(null)}
        title="Input Pemeriksaan"
        subtitle="Data otomatis tersimpan ke riwayat pasien - §A-04"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button onClick={save}>Simpan Pemeriksaan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Pasien" required>
            <Select value={form.id_pasien} onChange={set('id_pasien')}>
              <option value="">Pilih pasien</option>
              {pasien.filter((p) => p.status_aktif).map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Keluhan">
              <Textarea value={form.keluhan} onChange={set('keluhan')} placeholder="Keluhan utama pasien" />
            </Field>
            <Field label="Riwayat Kesehatan">
              <Textarea value={form.riwayat} onChange={set('riwayat')} placeholder="Riwayat penyakit/obat" />
            </Field>
            <Field label="Hasil Pemeriksaan">
              <Textarea value={form.hasil} onChange={set('hasil')} placeholder="TD, suhu, BB, dll." />
            </Field>
            <Field label="Diagnosis" required>
              <Textarea value={form.diagnosis} onChange={set('diagnosis')} placeholder="Diagnosis" />
            </Field>
            <Field label="Tindakan">
              <Textarea value={form.tindakan} onChange={set('tindakan')} placeholder="Tindakan medis" />
            </Field>
            <Field label="Jadwal Kontrol">
              <Input type="date" value={form.jadwal_kontrol} onChange={set('jadwal_kontrol')} />
            </Field>
          </div>
          <Field label="Catatan">
            <Input value={form.catatan} onChange={set('catatan')} placeholder="Catatan tambahan" />
          </Field>

          {/* Resep - §A-09 */}
          <div className="rounded-[var(--radius-control)] border border-hairline p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13.5px] font-semibold text-primary">Resep (opsional)</p>
              <Button size="sm" variant="secondary" onClick={addResepItem}>
                <IconPlus size={15} /> Tambah Obat
              </Button>
            </div>
            {resepDraft.length === 0 ? (
              <p className="text-[12px] text-muted">Belum ada obat dalam resep. Resep otomatis tampil di aplikasi pasien.</p>
            ) : (
              <div className="space-y-2">
                {resepDraft.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 items-center gap-2">
                    <Select value={r.id_produk} onChange={(e) => updateResepItem(i, 'id_produk', e.target.value)} className="col-span-5">
                      <option value="">Pilih obat</option>
                      {produk.filter((p) => p.id_kategori === 1 || p.wajib_resep).map((p) => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </Select>
                    <Input className="col-span-3" value={r.dosis} onChange={(e) => updateResepItem(i, 'dosis', e.target.value)} placeholder="Dosis" />
                    <Input className="col-span-3" value={r.aturan_pakai} onChange={(e) => updateResepItem(i, 'aturan_pakai', e.target.value)} placeholder="Aturan pakai" />
                    <button onClick={() => removeResepItem(i)} className="col-span-1 text-[var(--color-signal-rose)] hover:text-[var(--color-signal-rose)]"></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Detail rekam medis */}
      <Modal
        open={modal?.mode === 'view'}
        onClose={() => setModal(null)}
        title="Rekam Medis"
        subtitle={modal?.data ? `${namaPasien(modal.data.id_pasien)} · ${fmtTanggal(modal.data.tanggal)}` : ''}
        size="lg"
        footer={<Button variant="secondary" onClick={() => setModal(null)}>Tutup</Button>}
      >
        {modal?.data && (
          <div className="space-y-3">
            {[
              ['Keluhan', modal.data.keluhan],
              ['Hasil Pemeriksaan', modal.data.hasil],
              ['Diagnosis', modal.data.diagnosis],
              ['Tindakan', modal.data.tindakan],
              ['Catatan', modal.data.catatan],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[var(--radius-control)] surface-sunken px-4 py-3">
                <p className="text-[12px] font-medium uppercase tracking-wide text-muted">{k}</p>
                <p className="mt-0.5 text-[13.5px] text-primary">{v || '-'}</p>
              </div>
            ))}
            {(modal.data.id === 3 || modal.data.id === 1) && (
              <div className="rounded-[var(--radius-control)] border border-hairline bg-accent-soft px-4 py-3">
                <p className="mb-1 flex items-center gap-2 text-[13.5px] font-semibold text-accent">
                  <IconResep size={16} /> Resep terkait
                </p>
                <p className="text-[13.5px] text-secondary">Lihat detail pada menu Resep.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
