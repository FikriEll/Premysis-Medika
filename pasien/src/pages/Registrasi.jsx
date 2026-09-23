import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Tombol, Kolom, Input, Pilih, AreaTeks } from '../components/ui'
import { IconPeringatan } from '../components/Icons'
import { IlustrasiSehat } from '../components/Ilustrasi'

// F-01 Registrasi - PRD §6.1 + BR-10.
// Validasi penuh ditegakkan di server; di sini hanya memandu pengguna.
const AWAL = {
  nama: '', nik: '', email: '', no_wa: '', alamat: '',
  tanggal_lahir: '', jenis_kelamin: 'P', password: '', ulangi: '',
}

export default function Registrasi() {
  const { registrasi } = useStore()
  const nav = useNavigate()
  const [form, setForm] = useState(AWAL)
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState(false)

  const ubah = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const kirim = async (e) => {
    e.preventDefault()
    setGalat('')
    if (form.password !== form.ulangi) {
      setGalat('Ulangi password belum sama.')
      return
    }
    setSibuk(true)
    try {
      await registrasi({
        nama: form.nama.trim(),
        nik: form.nik.trim(),
        email: form.email.trim(),
        no_wa: form.no_wa.trim(),
        alamat: form.alamat.trim(),
        tanggal_lahir: form.tanggal_lahir || null,
        jenis_kelamin: form.jenis_kelamin,
        password: form.password,
      })
      nav('/', { replace: true })
    } catch (err) {
      setGalat(err.message)
    } finally {
      setSibuk(false)
    }
  }

  return (
    <div className="min-h-dvh surface-canvas">
      <div className="mx-auto max-w-[560px] px-5 py-8">
        <div className="permukaan-sambutan mb-6 flex items-center justify-between gap-2 overflow-hidden rounded-[var(--radius-shell)] border border-hairline pl-5">
          <div className="py-4">
            <p className="text-[17px] font-semibold leading-snug tracking-tight text-primary">
              Daftar sekali, terhubung selamanya
            </p>
            <p className="mt-1 max-w-[24ch] text-[15px] leading-relaxed text-secondary">
              Riwayat periksa, resep, dan jadwal imunisasi anak tersimpan rapi.
            </p>
          </div>
          <IlustrasiSehat size={112} className="shrink-0" />
        </div>

        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-primary">
          Buat akun pasien
        </h1>
        <p className="mt-1.5 text-[16px] leading-relaxed text-secondary">
          Isi data berikut. NIK dan nomor WhatsApp membantu klinik mengenali Anda saat datang.
        </p>

        {galat && (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-3.5 py-3 text-[15px] leading-relaxed text-[var(--color-signal-rose)]"
          >
            <IconPeringatan size={18} className="mt-px shrink-0" />
            <span>{galat}</span>
          </p>
        )}

        <form onSubmit={kirim} className="mt-6 space-y-4 pb-8">
          <Kolom label="Nama lengkap" wajib htmlFor="nama">
            <Input id="nama" value={form.nama} onChange={(e) => ubah('nama', e.target.value)} placeholder="Nama sesuai KTP" required />
          </Kolom>

          <Kolom label="NIK" wajib htmlFor="nik" bantuan="16 digit sesuai KTP">
            <Input id="nik" value={form.nik} onChange={(e) => ubah('nik', e.target.value)} inputMode="numeric" placeholder="3276xxxxxxxxxxxx" required />
          </Kolom>

          <Kolom label="Email" wajib htmlFor="email">
            <Input id="email" type="email" value={form.email} onChange={(e) => ubah('email', e.target.value)} placeholder="nama@email.com" required />
          </Kolom>

          <Kolom label="Nomor WhatsApp" htmlFor="wa" bantuan="Dipakai untuk pengingat jadwal">
            <Input id="wa" value={form.no_wa} onChange={(e) => ubah('no_wa', e.target.value)} inputMode="tel" placeholder="0813-xxxx-xxxx" />
          </Kolom>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Kolom label="Tanggal lahir" htmlFor="tgl">
              <Input id="tgl" type="date" value={form.tanggal_lahir} onChange={(e) => ubah('tanggal_lahir', e.target.value)} />
            </Kolom>
            <Kolom label="Jenis kelamin" htmlFor="jk">
              <Pilih id="jk" value={form.jenis_kelamin} onChange={(e) => ubah('jenis_kelamin', e.target.value)}>
                <option value="P">Perempuan</option>
                <option value="L">Laki-laki</option>
              </Pilih>
            </Kolom>
          </div>

          <Kolom label="Alamat" htmlFor="alamat">
            <AreaTeks id="alamat" value={form.alamat} onChange={(e) => ubah('alamat', e.target.value)} placeholder="Jalan, nomor, kelurahan, kota" />
          </Kolom>

          <Kolom label="Password" wajib htmlFor="pass" bantuan="Minimal 8 karakter, kombinasi huruf dan angka">
            <Input id="pass" type="password" value={form.password} onChange={(e) => ubah('password', e.target.value)} placeholder="Buat password" required />
          </Kolom>

          <Kolom label="Ulangi password" wajib htmlFor="ulang">
            <Input id="ulang" type="password" value={form.ulangi} onChange={(e) => ubah('ulangi', e.target.value)} placeholder="Ketik ulang password" required />
          </Kolom>

          <Tombol type="submit" size="lg" penuh disabled={sibuk}>
            {sibuk ? 'Mendaftarkan...' : 'Daftar'}
          </Tombol>
        </form>

        <p className="pb-8 text-center text-[15.5px] text-secondary">
          Sudah punya akun?{' '}
          <Link to="/masuk" className="font-medium text-accent underline underline-offset-4">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
