import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Tombol, Kolom, Input, Lembar } from '../components/ui'
import { IconMata, IconMataTutup, IconPeringatan, IconPulse, IconWhatsapp, IconPonsel } from '../components/Icons'
import { IlustrasiSehat } from '../components/Ilustrasi'
import { KLINIK } from '../lib/layanan'

// F-01 Masuk - brief §6.
//
// Brief meminta login sangat sederhana: hanya Nomor HP + Password.
// Tidak ada field lain, tidak ada pilihan yang membingungkan.
// Server menerima nomor HP (tanda baca diabaikan) maupun email, jadi
// akun lama tetap bisa masuk.
//
// Soal OTP (brief §6 "jika memungkinkan"): server demo ini belum
// punya layanan SMS, jadi OTP tidak dipalsukan. Sebagai gantinya,
// "Lupa password?" mengarahkan pasien ke WhatsApp klinik, jalur yang
// memang nyata dan paling mudah untuk pengguna lansia.
const AKUN_DEMO = [
  { identitas: '0813-9000-0001', sandi: 'demo1234', nama: 'Siti Nurhaliza', ket: 'Ada janji temu dan resep' },
  { identitas: '0813-9000-0002', sandi: 'demo1234', nama: 'Dewi Lestari', ket: 'Ada data anak (imunisasi)' },
  { identitas: '0813-9000-0005', sandi: 'demo1234', nama: 'Maya Putri', ket: 'Ada riwayat berobat' },
]

export default function Masuk() {
  const { login } = useStore()
  const nav = useNavigate()
  const loc = useLocation()
  const [nomor, setNomor] = useState('')
  const [password, setPassword] = useState('')
  const [lihat, setLihat] = useState(false)
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState(false)
  const [bantuan, setBantuan] = useState(false)
  const [sibukDemo, setSibukDemo] = useState(null)

  const kirim = async (e) => {
    e.preventDefault()
    setGalat('')
    setSibuk(true)
    try {
      await login(nomor.trim(), password)
      nav(loc.state?.dari || '/', { replace: true })
    } catch (err) {
      setGalat(err.message)
    } finally {
      setSibuk(false)
    }
  }

  // Akun contoh untuk pengembangan: sekali tekan langsung masuk, jadi
  // penguji tidak perlu mengetik apa pun dan password contoh tidak
  // pernah ditampilkan di layar.
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
          {/* Identitas klinik: logo + nama, supaya pasien yakin ini
              aplikasi klinik yang benar, bukan aplikasi lain. */}
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent text-[var(--accent-contrast)]">
              <IconPulse size={26} weight="bold" />
            </span>
            <div>
              <p className="text-[19.5px] font-bold tracking-tight text-primary">{KLINIK.nama}</p>
              <p className="text-[15px] text-secondary">{KLINIK.tagline}</p>
            </div>
          </div>

          {/* Sapaan + ilustrasi (brief §6: "Selamat Datang") */}
          <div className="permukaan-sambutan mt-6 flex items-center justify-between gap-2 overflow-hidden rounded-[var(--radius-shell)] border border-hairline pl-5">
            <div className="py-5">
              <h1 className="text-[23px] font-bold leading-snug tracking-tight text-primary">
                Selamat Datang
              </h1>
              <p className="mt-1.5 max-w-[24ch] text-[15.5px] leading-relaxed text-secondary">
                Masuk untuk melihat jadwal pemeriksaan, riwayat pelayanan, dan pesanan obat Anda.
              </p>
            </div>
            <IlustrasiSehat size={124} className="shrink-0" />
          </div>

          {galat && (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-4 py-3 text-[16px] leading-relaxed text-[var(--color-signal-rose)]"
            >
              <IconPeringatan size={19} weight="bold" className="mt-0.5 shrink-0" />
              <span>{galat}</span>
            </p>
          )}

          <form onSubmit={kirim} className="mt-5 space-y-5">
            <Kolom label="Nomor HP" wajib htmlFor="nomor">
              <Input
                id="nomor"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0812-3456-7890"
                value={nomor}
                onChange={(e) => setNomor(e.target.value)}
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

          {/* Lupa password: teks jelas, bukan ikon kecil. */}
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

          {/* Akun contoh: sekali tekan langsung masuk, supaya penguji
              tidak perlu mengetik manual. */}
          <div className="mt-8 rounded-[var(--radius-card)] border border-hairline surface-raised p-4">
            <p className="text-[16px] font-semibold text-primary">Coba dengan akun contoh</p>
            <p className="mt-1 text-[15px] leading-relaxed text-secondary">
              Tekan salah satu nama di bawah untuk langsung masuk dan melihat isinya.
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
        subjudul="Tenaga klinik akan membantu Anda membuat password baru."
        footer={
          <a
            href={KLINIK.tautanWA('Halo, saya lupa password aplikasi Premysis Medika. Nama saya: ')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-accent px-5 text-[18px] font-semibold text-[var(--accent-contrast)]"
          >
            <IconWhatsapp size={22} weight="bold" />
            Hubungi Klinik
          </a>
        }
      >
        <ol className="space-y-4">
          {[
            'Tekan tombol Hubungi Klinik di bawah.',
            'Sebutkan nama dan nomor HP yang Anda pakai untuk mendaftar.',
            'Tenaga klinik akan membantu Anda masuk kembali.',
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="numeric flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[15.5px] font-bold text-accent">
                {i + 1}
              </span>
              <span className="text-[17px] leading-relaxed text-secondary">{t}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-[var(--radius-control)] surface-sunken px-4 py-3 text-[16px] leading-relaxed text-secondary">
          Anda juga bisa langsung datang ke klinik. Bawa kartu identitas agar lebih cepat diproses.
        </p>
      </Lembar>
    </div>
  )
}
