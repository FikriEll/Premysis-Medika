import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Kartu, Tombol, Kolom, Input, AreaTeks, Pilih, JudulSeksi } from '../components/ui'
import { IconKembali, IconPeringatan, IconCentangBulat, IconInfo } from '../components/Icons'

// F-11 Edit Profil - brief §17.
//
// Brief §17: "Buat form edit dengan field yang jelas. Jangan
// menggunakan singkatan yang tidak umum."
//
// Karena itu setiap kolom memakai kalimat penuh ("Nomor HP", bukan
// "No. HP" atau "Telp"), dan diberi contoh isian supaya pasien tahu
// format yang diharapkan.
export default function EditProfil() {
  const nav = useNavigate()
  const { user, ubahProfil, beriToast } = useStore()

  const [form, setForm] = useState({
    nama: user?.nama || '',
    no_wa: user?.no_wa || '',
    email: user?.email || '',
    tanggal_lahir: user?.tanggal_lahir || '',
    jenis_kelamin: user?.jenis_kelamin || 'P',
    alamat: user?.alamat || '',
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
    if (!form.nama.trim()) g.nama = 'Nama lengkap wajib diisi.'
    if (!form.no_wa.trim()) g.no_wa = 'Nomor HP wajib diisi.'
    else if (!/^[0-9+\-\s()]{8,20}$/.test(form.no_wa.trim())) g.no_wa = 'Nomor HP tidak valid. Contoh: 0812-3456-7890'
    if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      g.email = 'Alamat email belum benar. Contoh: nama@email.com'
    }
    if (!form.alamat.trim()) g.alamat = 'Alamat wajib diisi agar pengiriman obat tidak salah.'
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
        nama: form.nama.trim(),
        no_wa: form.no_wa.trim(),
        email: form.email.trim(),
        tanggal_lahir: form.tanggal_lahir || null,
        jenis_kelamin: form.jenis_kelamin,
        alamat: form.alamat.trim(),
      })
      setSukses(true)
    } catch (err) {
      beriToast(err.message, 'galat')
      setGalat({ umum: err.message })
    } finally {
      setSibuk(false)
    }
  }

  // Layar sukses (brief §28): beri tahu bahwa perubahan tersimpan.
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
              Data diri Anda sudah diperbarui. Klinik akan memakai data terbaru ini untuk melayani Anda.
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
        Lengkapi data diri Anda dengan benar. Data ini dipakai klinik untuk melayani dan mengirim
        obat Anda.
      </p>

      <Kartu className="space-y-5">
        <Kolom
          label="Nama lengkap"
          wajib
          htmlFor="nama"
          galat={galat.nama}
          bantuan="Tulis nama sesuai kartu identitas."
        >
          <Input
            id="nama"
            value={form.nama}
            onChange={(e) => ubah('nama', e.target.value)}
            placeholder="Contoh: Siti Nurhaliza"
          />
        </Kolom>

        <Kolom
          label="Nomor HP"
          wajib
          htmlFor="no_wa"
          galat={galat.no_wa}
          bantuan="Dipakai untuk masuk ke aplikasi dan dihubungi klinik."
        >
          <Input
            id="no_wa"
            type="tel"
            inputMode="tel"
            value={form.no_wa}
            onChange={(e) => ubah('no_wa', e.target.value)}
            placeholder="0812-3456-7890"
          />
        </Kolom>

        <Kolom
          label="Alamat email"
          htmlFor="email"
          galat={galat.email}
          bantuan="Boleh dikosongkan bila Anda tidak punya email."
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

        <Kolom label="Tanggal lahir" htmlFor="tanggal_lahir">
          <Input
            id="tanggal_lahir"
            type="date"
            value={form.tanggal_lahir || ''}
            onChange={(e) => ubah('tanggal_lahir', e.target.value)}
          />
        </Kolom>

        <Kolom label="Jenis kelamin" htmlFor="jenis_kelamin">
          <Pilih
            id="jenis_kelamin"
            value={form.jenis_kelamin}
            onChange={(e) => ubah('jenis_kelamin', e.target.value)}
          >
            <option value="P">Perempuan</option>
            <option value="L">Laki-laki</option>
          </Pilih>
        </Kolom>

        <Kolom
          label="Alamat lengkap"
          wajib
          htmlFor="alamat"
          galat={galat.alamat}
          bantuan="Tulis nama jalan, nomor rumah, kelurahan, dan kota."
        >
          <AreaTeks
            id="alamat"
            value={form.alamat}
            onChange={(e) => ubah('alamat', e.target.value)}
            placeholder="Contoh: Jl. Melati No. 12, Depok"
          />
        </Kolom>

        <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3">
          <p className="flex items-start gap-2 text-[16px] leading-relaxed text-secondary">
            <IconInfo size={18} className="mt-0.5 shrink-0" />
            <span>Nomor NIK tidak dapat diubah sendiri. Minta bantuan petugas klinik bila perlu diperbaiki.</span>
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
