import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Tombol, Kolom, Input, AreaTeks } from '../components/ui'
import { IconPeringatan } from '../components/Icons'
import { IlustrasiSehat } from '../components/Ilustrasi'

// F-01 Registrasi.
// Validasi penuh ditegakkan di server; di sini hanya memandu pengguna.
const AWAL = { name: '', email: '', phone: '', password: '', ulangi: '' }

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
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        password_confirmation: form.ulangi,
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
              Daftar sekali, belanja lebih mudah
            </p>
            <p className="mt-1 max-w-[24ch] text-[15px] leading-relaxed text-secondary">
              Riwayat pesanan dan alamat pengiriman tersimpan rapi.
            </p>
          </div>
          <IlustrasiSehat size={112} className="shrink-0" />
        </div>

        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-primary">
          Buat akun pelanggan
        </h1>
        <p className="mt-1.5 text-[16px] leading-relaxed text-secondary">
          Isi data berikut agar pesanan obat Anda dapat diproses dengan benar.
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
            <Input id="nama" value={form.name} onChange={(e) => ubah('name', e.target.value)} placeholder="Nama sesuai KTP" required />
          </Kolom>

          <Kolom label="Email" wajib htmlFor="email">
            <Input id="email" type="email" value={form.email} onChange={(e) => ubah('email', e.target.value)} placeholder="nama@email.com" required />
          </Kolom>

          <Kolom label="Nomor HP / WhatsApp" wajib htmlFor="wa" bantuan="Dipakai untuk pengiriman dan konfirmasi pesanan">
            <Input id="wa" value={form.phone} onChange={(e) => ubah('phone', e.target.value)} inputMode="tel" placeholder="0813-xxxx-xxxx" required />
          </Kolom>

          <Kolom label="Password" wajib htmlFor="pass" bantuan="Minimal 6 karakter">
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
