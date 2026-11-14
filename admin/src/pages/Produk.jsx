import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Select, Textarea, SearchInput, EmptyState , GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { namaKategori, fmtRupiah } from '../data/mockData'
import { useData } from '../context/DataContext'
import { IconPlus, IconEdit, IconProduk, IconTrash, IconAlert } from '../components/Icons'

const emptyForm = {
  nama: '', id_kategori: 1, deskripsi: '', harga: 0, stok: 0, satuan: 'pcs', stok_minimum: 10, status: 'Aktif', wajib_resep: false, image: null, image_preview: null,
}

export default function Produk() {
  // Produk & kategori dari API bersama, sama dengan yang dilihat pasien di toko.
  const { produk: rows, kategori, tambah, ubah } = useData()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [kat, setKat] = useState('semua')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirm, setConfirm] = useState(null)

  const filtered = useMemo(
    () => rows.filter((p) => {
      const cocokQ = !q || p.nama.toLowerCase().includes(q.toLowerCase())
      const cocokKat = kat === 'semua' || p.id_kategori === Number(kat)
      return cocokQ && cocokKat
    }),
    [rows, q, kat],
  )

  const openAdd = () => {
    setForm(emptyForm)
    setModal({ mode: 'add' })
  }
  const openEdit = (p) => {
    setForm({ ...p })
    setModal({ mode: 'edit', data: p })
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        setForm({ ...form, image: file, image_preview: evt.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const save = async () => {
    if (!form.nama) return
    const data = {
      ...form,
      id_kategori: Number(form.id_kategori),
      harga: Number(form.harga),
      stok: Number(form.stok),
      stok_minimum: Number(form.stok_minimum),
    }
    setGalat(null)
    try {
      if (modal.mode === 'add') await tambah('produk', data)
      else await ubah('produk', modal.data.id, data)
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const toggleStatus = async (p) => {
    setGalat(null)
    try {
      await ubah('produk', p.id, { status: p.status === 'Aktif' ? 'Nonaktif' : 'Aktif' })
    } catch (e) {
      setGalat(e.message)
    }
    setConfirm(null)
  }

  const columns = [
    { key: 'nama', header: 'Produk', render: (p) => (
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] surface-sunken text-muted">
          <IconProduk size={20} />
        </span>
        <div>
          <p className="font-medium text-primary">{p.nama}</p>
          <p className="text-[12px] text-muted">{namaKategori(p.id_kategori)}</p>
        </div>
      </div>
    )},
    { key: 'harga', header: 'Harga', render: (p) => <span className="font-medium text-primary">{fmtRupiah(p.harga)}</span> },
    { key: 'stok', header: 'Stok', render: (p) => (
      <div className="flex items-center gap-1.5">
        <span className={p.stok <= p.stok_minimum ? 'font-semibold text-[var(--color-signal-amber)]' : 'text-primary'}>{p.stok} {p.satuan}</span>
        {p.stok <= p.stok_minimum && <IconAlert size={14} className="text-[var(--color-signal-amber)]" />}
      </div>
    )},
    { key: 'wajib_resep', header: 'Resep', render: (p) => p.wajib_resep ? (
      <span className="rounded-[6px] surface-sunken px-2 py-0.5 text-[12px] font-medium text-secondary">Wajib Resep</span>
    ) : <span className="text-[12px] text-muted">Bebas</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    { key: 'aksi', header: '', headerClass: 'text-right', className: 'text-right', render: (p) => (
      <div className="flex justify-end gap-1">
        <Button size="sm" variant="ghost" onClick={() => openEdit(p)} title="Edit" aria-label="Edit">
            <IconEdit size={16} />
          </Button>
        <Button size="sm" variant="ghost" className="text-[var(--color-signal-rose)] hover:bg-[var(--color-signal-rose-soft)]" onClick={() => setConfirm(p)} title={p.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'} aria-label="Hapus">
            <IconTrash size={16} />
          </Button>
      </div>
    )},
  ]

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Manajemen Produk / Obat"
        subtitle={`${rows.length} produk terdaftar`}
        actions={<Button onClick={openAdd}><IconPlus size={18} /> Tambah Produk</Button>}
      />

      <Panel divided={false}>
        <div className="flex flex-col gap-3 border-b border-hairline p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama produk..." />
          </div>
          <Select value={kat} onChange={(e) => setKat(e.target.value)} className="sm:w-56">
            <option value="semua">Semua Kategori</option>
            {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </Select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Produk tidak ditemukan" icon={<IconProduk size={20} />} />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      <Modal
        open={modal?.mode === 'add' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Tambah Produk' : 'Edit Produk'}
        subtitle="Produk dengan penanda wajib-resep - §BR-05"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {form.image_preview && (
              <div className="mb-4 flex items-center gap-3">
                <img src={form.image_preview} alt="Preview" className="h-20 w-20 rounded-[var(--radius-control)] border border-hairline object-cover" />
                <div>
                  <p className="text-[13.5px] font-medium text-primary">{form.image?.name}</p>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: null, image_preview: null })}
                    className="text-[12px] text-signal-rose hover:underline"
                  >
                    Hapus gambar
                  </button>
                </div>
              </div>
            )}
            <Field label="Gambar Produk">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full rounded-[var(--radius-control)] border border-hairline px-3 py-2 text-[13.5px] text-secondary file:mr-2 file:border-0 file:rounded file:bg-accent file:px-2.5 file:py-1 file:text-[13px] file:font-medium file:text-[var(--accent-contrast)] hover:border-accent"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Nama Produk" required>
              <Input value={form.nama} onChange={set('nama')} placeholder="Nama produk/obat" />
            </Field>
          </div>
          <Field label="Kategori" required>
            <Select value={form.id_kategori} onChange={set('id_kategori')}>
              {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </Select>
          </Field>
          <Field label="Satuan">
            <Input value={form.satuan} onChange={set('satuan')} placeholder="strip/botol/pcs/box" />
          </Field>
          <Field label="Harga (Rp)" required>
            <Input type="number" min="0" value={form.harga} onChange={set('harga')} />
          </Field>
          <Field label="Stok Saat Ini">
            <Input type="number" min="0" value={form.stok} onChange={set('stok')} />
          </Field>
          <Field label="Stok Minimum" hint="Ambang peringatan - §BR-06">
            <Input type="number" min="0" value={form.stok_minimum} onChange={set('stok_minimum')} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={set('status')}>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Deskripsi">
              <Textarea value={form.deskripsi} onChange={set('deskripsi')} placeholder="Deskripsi produk" />
            </Field>
          </div>
          <label className="flex items-center gap-3 rounded-[var(--radius-control)] border border-hairline px-4 py-3 sm:col-span-2">
            <input type="checkbox" checked={!!form.wajib_resep} onChange={set('wajib_resep')} className="h-4 w-4 rounded-[4px] border-strong accent-[var(--accent)]" />
            <div>
              <p className="text-[13.5px] font-medium text-primary">Memerlukan Resep</p>
              <p className="text-[12px] text-muted">Produk hanya dapat dibeli bila tertaut resep aktif - §BR-05</p>
            </div>
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => toggleStatus(confirm)}
        title={confirm?.status === 'Aktif' ? 'Nonaktifkan Produk' : 'Aktifkan Produk'}
        message={confirm?.status === 'Aktif' ? `Produk "${confirm?.nama}" tidak akan tampil di toko.` : `Aktifkan kembali produk "${confirm?.nama}"?`}
        confirmLabel={confirm?.status === 'Aktif' ? 'Ya, nonaktifkan' : 'Ya, aktifkan'}
        variant={confirm?.status === 'Aktif' ? 'danger' : 'success'}
      />
    </div>
  )
}
