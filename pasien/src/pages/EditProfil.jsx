import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Kartu, Tombol, Kolom, Input, JudulSeksi } from '../components/ui'
import { IconKembali, IconPeringatan, IconCentangBulat, IconInfo } from '../components/Icons'

// F-11 Edit Profil.
// Setiap kolom memakai kalimat penuh dan diberi contoh isian supaya
// pelanggan tahu format yang diharapkan.
export default function EditProfil() {
  const nav = useNavigate()
  const { user, ubahProfil, beriToast } = useStore()

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  })
  const [galat, setGalat] = useState({})
  const [sibuk, setSibuk] = useState(false)
  const [sukses, setSukses] = useState(false)

  const ubah = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setGalat((g) => ({ ...g, [k]: undefined }))
  }

  const periksa = () => {
    const g = {}
    if (!form.name.trim()) g.name = 'Nama lengkap wajib diisi.'
    if (!form.phone.trim()) g.phone = 'Nomor HP wajib diisi.'
    else if (!/^[0-9+\-\s()]{8,20}$/.test(form.phone.trim())) g.phone = 'Nomor HP tidak valid. Contoh: 0812-3456-7890'
    if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      g.email = 'Alamat email belum benar. Contoh: nama@email.com'
    }
    return g
  }

  const simpan = async (e) => {
    e?.preventDefault()
    const g = periksa()
    setGalat(g)
    if (Object.keys(g).length) return

    setSibuk(true)
    try {
      await ubahProfil({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      })
      setSukses(true)
    } catch (err) {
      beriToast(err.message, 'galat')
      setGalat({ umum: err.message })
    } finally {
      setSibuk(false)
    }
  }

  if (sukses) {
    return (
      <div className="space-y-5">
        <Kartu className="space-y-4 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-signal-green-soft)] text-[var(--color-signal-green)]">
            <IconCentangBulat size={44} weight="fill" />
          </span>
          <div>
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-primary">
              Profil Berhasil Disimpan
            </h1>
            <p className="mx-auto mt-2 max-w-[38ch] text-[17px] leading-relaxed text-secondary">
              Data diri Anda sudah diperbarui. Apotek akan memakai data terbaru ini untuk memproses pesanan.
            </p>
          </div>
        </Kartu>
        <Tombol size="lg" penuh onClick={() => nav('/profil')}>
          Kembali ke Profil
        </Tombol>
      </div>
    )
  }

  return (
    <form onSubmit={simpan} className="space-y-5">
      <p className="text-[17px] leading-relaxed text-secondary">
        Lengkapi data diri Anda dengan benar. Data ini dipakai apotek untuk mengonfirmasi dan
        mengirim pesanan Anda.
      </p>

      <Kartu className="space-y-5">
        <Kolom
          label="Nama lengkap"
          wajib
          htmlFor="nama"
          galat={galat.name}
          bantuan="Tulis nama sesuai kartu identitas."
        >
          <Input
            id="nama"
            value={form.name}
            onChange={(e) => ubah('name', e.target.value)}
            placeholder="Contoh: Siti Nurhaliza"
          />
        </Kolom>

        <Kolom
          label="Nomor HP"
          wajib
          htmlFor="no_wa"
          galat={galat.phone}
          bantuan="Dipakai untuk masuk ke aplikasi dan dihubungi apotek."
        >
          <Input
            id="no_wa"
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => ubah('phone', e.target.value)}
            placeholder="0812-3456-7890"
          />
        </Kolom>

        <Kolom
          label="Alamat email"
          htmlFor="email"
          galat={galat.email}
          bantuan="Dipakai untuk masuk dan menerima notifikasi pesanan."
        >
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => ubah('email', e.target.value)}
            placeholder="nama@email.com"
          />
        </Kolom>

        <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3">
          <p className="flex items-start gap-2 text-[16px] leading-relaxed text-secondary">
            <IconInfo size={18} className="mt-0.5 shrink-0" />
            <span>Untuk mengubah alamat pengiriman, gunakan pilihan alamat saat menyelesaikan pesanan.</span>
          </p>
        </div>

        {galat.umum && (
          <p role="alert" className="flex items-start gap-2 text-[16px] leading-relaxed text-[var(--color-signal-rose)]">
            <IconPeringatan size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{galat.umum}</span>
          </p>
        )}
      </Kartu>

      <div className="space-y-2.5 pb-2">
        <Tombol type="submit" size="lg" penuh disabled={sibuk}>
          {sibuk ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Tombol>
        <Tombol
          variant="secondary"
          size="lg"
          penuh
          disabled={sibuk}
          onClick={() => nav('/profil')}
        >
          <IconKembali size={20} weight="bold" />
          Batal
        </Tombol>
      </div>
    </form>
  )
}
