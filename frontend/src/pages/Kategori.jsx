import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, SearchInput, EmptyState, GalatBar } from '../components/ui'
import DataTable from '../components/DataTable'
import Modal, { ConfirmDialog } from '../components/Modal'
import { useData } from '../context/DataContext'
import { IconPlus, IconEdit, IconTrash, IconProduk } from '../components/Icons'

const emptyForm = { nama: '', deskripsi: '' }

// Manajemen Kategori Produk (Fitur Pendukung).
// Kategori yang dibuat di sini langsung dipakai katalog aplikasi pasien,
// karena keduanya membaca koleksi `kategori` yang sama dari API.
export default function Kategori() {
  const { kategori: rows, produk, tambah, ubah, hapus } = useData()
  const [galat, setGalat] = useState(null)
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirm, setConfirm] = useState(null)
  const [sibuk, setSibuk] = useState(false)

  const jumlahProduk = (id) => produk.filter((p) => p.id_kategori === id).length

  const filtered = useMemo(
    () => rows.filter((k) => !q || k.nama.toLowerCase().includes(q.toLowerCase()) || (k.deskripsi || '').toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  )

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async () => {
    if (!form.nama.trim()) {
      setGalat('Nama kategori wajib diisi.')
      return
    }
    setGalat(null)
    try {
      if (modal.mode === 'add') await tambah('kategori', { nama: form.nama.trim(), deskripsi: form.deskripsi.trim() })
      else await ubah('kategori', modal.data.id, { nama: form.nama.trim(), deskripsi: form.deskripsi.trim() })
      setModal(null)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const lakukanHapus = async () => {
    setGalat(null)
    setSibuk(true)
    try {
      await hapus('kategori', confirm.id)
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
      header: 'Kategori',
      render: (k) => (
        <div>
          <p className="font-medium text-primary">{k.nama}</p>
          <p className="text-[12px] text-muted">{k.deskripsi || '—'}</p>
        </div>
      ),
    },
    {
      key: 'jumlah',
      header: 'Jumlah Produk',
      render: (k) => (
        <span className="inline-flex items-center gap-1.5 text-[13.5px] text-secondary">
          <IconProduk size={15} className="text-muted" />
          {jumlahProduk(k.id)} produk
        </span>
      ),
    },
    {
      key: 'aksi',
      header: '',
      headerClass: 'text-right',
      className: 'text-right',
      render: (k) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => { setForm({ nama: k.nama, deskripsi: k.deskripsi || '' }); setModal({ mode: 'edit', data: k }) }} title="Edit" aria-label="Edit">
            <IconEdit size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-[var(--color-signal-rose)] hover:bg-[var(--color-signal-rose-soft)]"
            onClick={() => setConfirm(k)}
            title="Hapus"
            aria-label="Hapus"
          >
            <IconTrash size={16} />
          </Button>
        </div>
      ),
    },
  ]

  const dipakai = confirm ? jumlahProduk(confirm.id) : 0

  return (
    <div>
      <GalatBar pesan={galat} onClose={() => setGalat(null)} />
      <PageHeader
        title="Kategori Produk"
        subtitle={`${rows.length} kategori — dipakai katalog toko aplikasi pasien`}
        actions={
          <Button onClick={() => { setForm(emptyForm); setModal({ mode: 'add' }) }}>
            <IconPlus size={18} /> Tambah Kategori
          </Button>
        }
      />

      <Panel divided={false}>
        <div className="border-b border-hairline p-4">
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama kategori..." />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Belum ada kategori" message="Tambahkan kategori untuk mengelompokkan produk di toko." icon={<IconProduk size={20} />} />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </Panel>

      <Modal
        open={modal?.mode === 'add' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}
        subtitle="Kategori mengelompokkan produk di katalog toko"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nama Kategori" required>
            <Input value={form.nama} onChange={set('nama')} placeholder="Mis. Vitamin & Suplemen" />
          </Field>
          <Field label="Deskripsi">
            <Input value={form.deskripsi} onChange={set('deskripsi')} placeholder="Keterangan singkat kategori" />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={lakukanHapus}
        title="Hapus Kategori"
        message={
          dipakai > 0
            ? `Kategori "${confirm?.nama}" masih dipakai oleh ${dipakai} produk. Pindahkan produk itu ke kategori lain sebelum menghapus.`
            : `Hapus kategori "${confirm?.nama}"? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmLabel={dipakai > 0 ? 'Mengerti' : 'Ya, hapus'}
        variant={dipakai > 0 ? 'secondary' : 'danger'}
      />
    </div>
  )
}
