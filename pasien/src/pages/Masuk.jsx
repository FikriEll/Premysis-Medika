import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../lib/api'
import { useStore } from '../lib/store'
import { Tombol, Kolom, Input, Lembar } from '../components/ui'
import { IconMata, IconMataTutup, IconPeringatan, IconWhatsapp, IconPonsel } from '../components/Icons'
import { IlustrasiSehat } from '../components/Ilustrasi'
import LogoKlinik from '../components/LogoKlinik'

// Logo Google resmi (empat warna) - satu-satunya tempat warna di
// luar token dipakai, karena ini logo pihak ketiga yang tidak boleh
// diubah warnanya.
function LogoGoogle({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.2Z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46Z" />
      <path fill="#FBBC05" d="M11.8 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-3 .7-4.3V14H4.5C3.1 16.9 2.3 20.3 2.3 24s.8 7.1 2.2 10l7.3-5.7Z" />
      <path fill="#EA4335" d="M24 10.2c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 3.7 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14l7.3 5.7c1.7-5.2 6.5-9.5 12.2-9.5Z" />
    </svg>
  )
}

// F-01 Masuk.
//
// Login sangat sederhana: satu kolom identitas (email ATAU nomor HP)
// + password. Tidak ada field lain, tidak ada pilihan yang
// membingungkan pengguna lansia.
const AKUN_DEMO = [
  { identitas: 'budi@apotek.test', sandi: 'password', nama: 'Budi Santoso', ket: 'Pelanggan dengan pesanan' },
  { identitas: 'siti@apotek.test', sandi: 'password', nama: 'Siti Aminah', ket: 'Pelanggan dengan alamat' },
  { identitas: '08130324679', sandi: 'password', nama: 'Pelanggan 3', ket: 'Login pakai nomor HP' },
]

export default function Masuk() {
  const { login } = useStore()
  const nav = useNavigate()
  const loc = useLocation()
  const [identitas, setIdentitas] = useState('')
  const [password, setPassword] = useState('')
  const [lihat, setLihat] = useState(false)
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState(false)
  const [bantuan, setBantuan] = useState(false)
  const [sibukDemo, setSibukDemo] = useState(null)
  const [sibukGoogle, setSibukGoogle] = useState(false)

  // Pesan galat dari kembalian login Google (disimpan main.jsx).
  const [galatGoogle] = useState(() => {
    const g = window.sessionStorage.getItem('premysis_google_error')
    if (g) window.sessionStorage.removeItem('premysis_google_error')
    return g || ''
  })

  const masukGoogle = async () => {
    setGalat('')
    setSibukGoogle(true)
    try {
      const r = await api.googleUrl(loc.state?.dari || '/')
      if (r?.url) window.location.assign(r.url)
      else setGalat(r?.message || 'Login dengan Google belum tersedia.')
    } catch (err) {
      setGalat(err.message)
    } finally {
      setSibukGoogle(false)
    }
  }

  const kirim = async (e) => {
    e.preventDefault()
    setGalat('')
    setSibuk(true)
    try {
      await login(identitas.trim(), password)
      nav(loc.state?.dari || '/', { replace: true })
    } catch (err) {
      setGalat(err.message)
    } finally {
      setSibuk(false)
    }
  }

  // Akun contoh: sekali tekan langsung masuk, jadi penguji tidak perlu
  // mengetik apa pun dan password contoh tidak pernah tampil di layar.
  const masukDemo = async (a) => {
    setGalat('')
    setSibukDemo(a.identitas)
    try {
      await login(a.identitas, a.sandi)
      nav('/', { replace: true })
    } catch (err) {
      setGalat(err.message)
    } finally {
      setSibukDemo(null)
    }
  }

  return (
    <div className="min-h-dvh surface-canvas">
      <div className="mx-auto flex min-h-dvh max-w-[560px] flex-col px-5 pb-8 pt-10">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <LogoKlinik size={48} />
            <div>
              <p className="text-[19.5px] font-bold tracking-tight text-primary">Klinik Premysis Medika</p>
              <p className="text-[15px] text-secondary">Obat &amp; kebutuhan kesehatan</p>
            </div>
          </div>

          <div className="permukaan-sambutan mt-6 flex items-center justify-between gap-2 overflow-hidden rounded-[var(--radius-shell)] border border-hairline pl-5">
            <div className="py-5">
              <h1 className="text-[23px] font-bold leading-snug tracking-tight text-primary">
                Selamat Datang
              </h1>
              <p className="mt-1.5 max-w-[24ch] text-[15.5px] leading-relaxed text-secondary">
                Masuk untuk berbelanja obat dan melacak pesanan Anda.
              </p>
            </div>
            <IlustrasiSehat size={124} className="shrink-0" />
          </div>

          {(galat || galatGoogle) && (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-4 py-3 text-[16px] leading-relaxed text-[var(--color-signal-rose)]"
            >
              <IconPeringatan size={19} weight="bold" className="mt-0.5 shrink-0" />
              <span>{galat || galatGoogle}</span>
            </p>
          )}

          <form onSubmit={kirim} className="mt-5 space-y-5">
            <Kolom label="Email atau Nomor HP" wajib htmlFor="identitas">
              <Input
                id="identitas"
                type="text"
                autoComplete="username"
                placeholder="nama@email.com atau 0812-3456-7890"
                value={identitas}
                onChange={(e) => setIdentitas(e.target.value)}
                required
              />
            </Kolom>

            <Kolom label="Password" wajib htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={lihat ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  aria-label={lihat ? 'Sembunyikan password' : 'Tampilkan password'}
                  onClick={() => setLihat((v) => !v)}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-secondary"
                >
                  {lihat ? <IconMataTutup size={20} /> : <IconMata size={20} />}
                </button>
              </div>
            </Kolom>

            <Tombol type="submit" size="lg" penuh disabled={sibuk}>
              {sibuk ? 'Sedang masuk...' : 'Masuk'}
            </Tombol>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--border-hairline)]" />
            <span className="text-[15px] text-muted">atau</span>
            <span className="h-px flex-1 bg-[var(--border-hairline)]" />
          </div>

          <button
            type="button"
            onClick={masukGoogle}
            disabled={sibukGoogle}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-control)] border border-hairline surface-raised px-5 text-[18px] font-semibold text-primary transition-colors active:surface-hover disabled:opacity-60"
          >
            <LogoGoogle size={21} />
            {sibukGoogle ? 'Menghubungkan...' : 'Masuk dengan Google'}
          </button>

          <button
            type="button"
            onClick={() => setBantuan(true)}
            className="mt-3 block w-full py-3 text-center text-[17px] font-semibold text-accent"
          >
            Lupa password?
          </button>

          <p className="text-center text-[17px] text-secondary">
            Belum punya akun?{' '}
            <Link to="/registrasi" className="font-semibold text-accent underline underline-offset-4">
              Daftar di sini
            </Link>
          </p>

          {/* Akun contoh */}
          <div className="mt-8 rounded-[var(--radius-card)] border border-hairline surface-raised p-4">
            <p className="text-[16px] font-semibold text-primary">Coba dengan akun contoh</p>
            <p className="mt-1 text-[15px] leading-relaxed text-secondary">
              Tekan salah satu nama di bawah untuk langsung masuk.
            </p>
            <ul className="mt-3 space-y-1.5">
              {AKUN_DEMO.map((a) => (
                <li key={a.identitas}>
                  <button
                    type="button"
                    onClick={() => masukDemo(a)}
                    disabled={sibukDemo !== null}
                    className="flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-control)] border border-hairline px-3.5 py-2.5 text-left transition-colors active:surface-hover disabled:opacity-60"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <IconPonsel size={19} weight="bold" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[17px] font-semibold text-primary">{a.nama}</span>
                      <span className="block truncate text-[15px] text-secondary">
                        {sibukDemo === a.identitas ? 'Sedang masuk...' : a.ket}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-[15px] leading-relaxed text-muted">
          Data pada aplikasi ini adalah contoh untuk pengembangan.
        </p>
      </div>

      {/* Bantuan lupa password */}
      <Lembar
        buka={bantuan}
        onTutup={() => setBantuan(false)}
        judul="Lupa password?"
        subjudul="Petugas apotek akan membantu Anda membuat password baru."
        footer={
          <a
            href="https://wa.me/6281317739371?text=Halo%2C%20saya%20lupa%20password%20website%20Klinik%20Premysis%20Medika."
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-accent px-5 text-[18px] font-semibold text-[var(--accent-contrast)]"
          >
            <IconWhatsapp size={22} weight="bold" />
            Hubungi Kami
          </a>
        }
      >
        <ol className="space-y-4">
          {[
            'Tekan tombol Hubungi Kami di bawah.',
            'Sebutkan nama dan email/nomor HP yang Anda pakai untuk mendaftar.',
            'Petugas akan membantu Anda masuk kembali.',
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="numeric flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[15.5px] font-bold text-accent">
                {i + 1}
              </span>
              <span className="text-[17px] leading-relaxed text-secondary">{t}</span>
            </li>
          ))}
        </ol>
      </Lembar>
    </div>
  )
}
