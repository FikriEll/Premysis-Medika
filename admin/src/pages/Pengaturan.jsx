import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Panel, Button, Field, Input, Textarea, GalatBar } from '../components/ui'
import { useData } from '../context/DataContext'
import { IconCheck, IconAlert } from '../components/Icons'

export default function Pengaturan() {
  const { pengaturan: data } = useData()
  const [form, setForm] = useState(null)
  const [galat, setGalat] = useState(null)
  const [sukses, setSukses] = useState(null)
  const [sibuk, setSibuk] = useState(false)

  useEffect(() => {
    if (data) {
      setForm({
        nama_klinik: data.nama_klinik || '',
        deskripsi_klinik: data.deskripsi_klinik || '',
        email_kontak: data.email_kontak || '',
        telepon: data.telepon || '',
        alamat: data.alamat || '',
        jam_buka: data.jam_buka || '08:00',
        jam_tutup: data.jam_tutup || '17:00',
        hari_libur: data.hari_libur || '',
        whatsapp: data.media_sosial?.whatsapp || '',
        facebook: data.media_sosial?.facebook || '',
        instagram: data.media_sosial?.instagram || '',
      })
    }
  }, [data])

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setGalat(null)
  }

  const simpan = async () => {
    if (!form.nama_klinik) {
      setGalat('Nama klinik wajib diisi.')
      return
    }
    setSibuk(true)
    setGalat(null)
    setSukses(null)
    try {
      const payload = {
        nama_klinik: form.nama_klinik,
        deskripsi_klinik: form.deskripsi_klinik,
        email_kontak: form.email_kontak,
        telepon: form.telepon,
        alamat: form.alamat,
        jam_buka: form.jam_buka,
        jam_tutup: form.jam_tutup,
        hari_libur: form.hari_libur,
        media_sosial: {
          whatsapp: form.whatsapp,
          facebook: form.facebook,
          instagram: form.instagram,
        },
        diubah_tanggal: new Date().toISOString().split('T')[0],
      }
      const res = await fetch('/api/pengaturan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.pesan || 'Gagal menyimpan pengaturan')
      }
      setSukses('Pengaturan website berhasil disimpan.')
      setTimeout(() => setSukses(null), 4000)
    } catch (e) {
      setGalat(e.message)
    } finally {
      setSibuk(false)
    }
  }

  if (!form) return <div className="p-6 text-muted">Memuat…</div>

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Pengaturan Website" subtitle="Kelola informasi klinik, jam operasional, dan kontak" />

      {galat && <GalatBar>{galat}</GalatBar>}
      {sukses && (
        <div className="flex items-start gap-3 rounded-lg bg-[rgb(14_121_82/0.15)] p-4 text-[13px]">
          <IconCheck size={18} className="shrink-0 text-[rgb(14_121_82)]" />
          <p className="text-[rgb(14_121_82)]">{sukses}</p>
        </div>
      )}

      <Panel title="Informasi Umum" icon={null}>
        <div className="space-y-4">
          <Field label="Nama Klinik">
            <Input value={form.nama_klinik} onChange={set('nama_klinik')} placeholder="Premysis Medika" />
          </Field>
          <Field label="Deskripsi Klinik">
            <Textarea value={form.deskripsi_klinik} onChange={set('deskripsi_klinik')} rows={3} placeholder="Deskripsi singkat tentang klinik Anda" />
          </Field>
        </div>
      </Panel>

      <Panel title="Kontak & Lokasi" icon={null}>
        <div className="space-y-4">
          <Field label="Email">
            <Input type="email" value={form.email_kontak} onChange={set('email_kontak')} placeholder="info@premysismedika.id" />
          </Field>
          <Field label="Telepon">
            <Input value={form.telepon} onChange={set('telepon')} placeholder="0812-1234-5678" />
          </Field>
          <Field label="Alamat">
            <Textarea value={form.alamat} onChange={set('alamat')} rows={2} placeholder="Jl. Melati No. 100, Depok" />
          </Field>
        </div>
      </Panel>

      <Panel title="Jam Operasional" icon={null}>
        <div className="space-y-4">
          <Field label="Jam Buka">
            <Input type="time" value={form.jam_buka} onChange={set('jam_buka')} />
          </Field>
          <Field label="Jam Tutup">
            <Input type="time" value={form.jam_tutup} onChange={set('jam_tutup')} />
          </Field>
          <Field label="Hari Libur">
            <Input value={form.hari_libur} onChange={set('hari_libur')} placeholder="Minggu, Hari Raya" />
          </Field>
        </div>
      </Panel>

      <Panel title="Media Sosial" icon={null}>
        <div className="space-y-4">
          <Field label="WhatsApp">
            <Input value={form.whatsapp} onChange={set('whatsapp')} placeholder="62821234567" />
          </Field>
          <Field label="Facebook">
            <Input value={form.facebook} onChange={set('facebook')} placeholder="premysismedika" />
          </Field>
          <Field label="Instagram">
            <Input value={form.instagram} onChange={set('instagram')} placeholder="@premysismedika" />
          </Field>
        </div>
      </Panel>

      <div className="flex gap-3">
        <Button onClick={simpan} disabled={sibuk} variant="primary">
          {sibuk ? 'Menyimpan…' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  )
}
