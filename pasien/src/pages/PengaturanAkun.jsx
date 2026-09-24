import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useTema } from '../lib/theme'
import {
  Kartu, KepalaHalaman, JudulSeksi, Tombol, Kolom, Input, BarisTautan, BarisInfo,
} from '../components/ui'
import {
  IconKunci, IconNotifikasi, IconMata, IconMataTutup, IconPeringatan, IconCentangBulat,
  IconMatahari, IconBulan, IconWhatsapp, IconProfil, IconPanahKanan, IconLabel,
} from '../components/Icons'
import { IlustrasiAkun } from '../components/Ilustrasi'
import { fmtTanggal } from '../../../shared/format'

// Halaman Pengaturan Akun.
//
// Tiga bagian: data profil (ringkas, ubah di halaman terpisah),
// ganti kata sandi, dan preferensi notifikasi. Preferensi
// notifikasi disimpan di server lewat endpoint profil, jadi
// pengaturannya berlaku di semua perangkat.
export default function PengaturanAkun() {
  const nav = useNavigate()
  const { user, ubahSandi, ubahProfil, beriToast } = useStore()
  const { gelap, toggleTema } = useTema()

  const [sandi, setSandi] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [lihat, setLihat] = useState(false)
  const [galatSandi, setGalatSandi] = useState({})
  const [sibukSandi, setSibukSandi] = useState(false)
  const [suksesSandi, setSuksesSandi] = useState(false)

  const [notif, setNotif] = useState({
    notify_email: user?.notify_email ?? true,
    notify_promo: user?.notify_promo ?? true,
  })
  const [sibukNotif, setSibukNotif] = useState(false)

  const ubahS = (k, v) => {
    setSandi((s) => ({ ...s, [k]: v }))
    setGalatSandi((g) => ({ ...g, [k]: undefined, umum: undefined }))
  }

  const simpanSandi = async (e) => {
    e.preventDefault()
    const g = {}
    if (!sandi.current_password) g.current_password = 'Kata sandi saat ini wajib diisi.'
    if (!sandi.password) g.password = 'Kata sandi baru wajib diisi.'
    else if (sandi.password.length < 6) g.password = 'Kata sandi baru minimal 6 karakter.'
    if (sandi.password !== sandi.password_confirmation) g.password_confirmation = 'Ulangi kata sandi belum sama.'
    setGalatSandi(g)
    if (Object.keys(g).length) return

    setSibukSandi(true)
    try {
      await ubahSandi(sandi)
      setSuksesSandi(true)
      setSandi({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      beriToast(err.message, 'galat')
      setGalatSandi({ umum: err.message })
    } finally {
      setSibukSandi(false)
    }
  }

  const simpanNotif = async (kunci) => {
    const baru = { ...notif, [kunci]: !notif[kunci] }
    setNotif(baru)
    setSibukNotif(true)
    try {
      await ubahProfil({ [kunci]: baru[kunci] })
    } catch (e) {
      setNotif(notif)
      beriToast(e.message, 'galat')
    } finally {
      setSibukNotif(false)
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <KepalaHalaman
        className="lg:col-span-2"
        judul="Pengaturan Akun"
        pengantar="Kelola data diri, keamanan kata sandi, dan preferensi notifikasi Anda."
        ilustrasi={<IlustrasiAkun size={144} />}
      />

      {/* --- Profil --- */}
      <section className="lg:col-span-1">
        <JudulSeksi>Data Profil</JudulSeksi>
        <Kartu className="divide-y divide-[var(--border-hairline)] px-4 py-1.5">
          <BarisInfo label="Nama lengkap">{user?.name || '-'}</BarisInfo>
          <BarisInfo label="Nomor HP">
            <span className="numeric">{user?.phone || '-'}</span>
          </BarisInfo>
          <BarisInfo label="Email">
            <span className="break-all">{user?.email || '-'}</span>
          </BarisInfo>
          <BarisInfo label="Terdaftar sejak">
            <span className="numeric">{fmtTanggal(user?.created_at)}</span>
          </BarisInfo>
        </Kartu>
        <Tombol className="mt-3" variant="secondary" size="lg" penuh onClick={() => nav('/profil/edit')}>
          <IconProfil size={20} weight="bold" />
          Ubah Data Profil
        </Tombol>
      </section>

      {/* --- Ganti kata sandi --- */}
      <section className="lg:col-span-1">
        <JudulSeksi>Ganti Kata Sandi</JudulSeksi>

        {suksesSandi ? (
          <Kartu className="space-y-3 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-signal-green-soft)] text-[var(--color-signal-green)]">
              <IconCentangBulat size={36} weight="fill" />
            </span>
            <p className="text-[19px] font-semibold text-primary">Kata Sandi Berhasil Diganti</p>
            <p className="mx-auto max-w-[36ch] text-[16px] leading-relaxed text-secondary">
              Gunakan kata sandi baru Anda saat masuk berikutnya. Sesi di perangkat ini tetap aktif.
            </p>
            <Tombol variant="secondary" penuh onClick={() => setSuksesSandi(false)}>
              Ganti lagi
            </Tombol>
          </Kartu>
        ) : (
          <form onSubmit={simpanSandi} className="space-y-4">
            <Kartu className="space-y-4">
              <Kolom label="Kata sandi saat ini" wajib htmlFor="sandi_lama" galat={galatSandi.current_password}>
                <div className="relative">
                  <Input
                    id="sandi_lama"
                    type={lihat ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={sandi.current_password}
                    onChange={(e) => ubahS('current_password', e.target.value)}
                    className="pr-12"
                    placeholder="Kata sandi yang Anda pakai sekarang"
                  />
                  <button
                    type="button"
                    aria-label={lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    onClick={() => setLihat((v) => !v)}
                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-secondary"
                  >
                    {lihat ? <IconMataTutup size={20} /> : <IconMata size={20} />}
                  </button>
                </div>
              </Kolom>

              <Kolom label="Kata sandi baru" wajib htmlFor="sandi_baru" galat={galatSandi.password} bantuan="Minimal 6 karakter.">
                <Input
                  id="sandi_baru"
                  type={lihat ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={sandi.password}
                  onChange={(e) => ubahS('password', e.target.value)}
                  placeholder="Kata sandi baru"
                />
              </Kolom>

              <Kolom label="Ulangi kata sandi baru" wajib htmlFor="sandi_ulang" galat={galatSandi.password_confirmation}>
                <Input
                  id="sandi_ulang"
                  type={lihat ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={sandi.password_confirmation}
                  onChange={(e) => ubahS('password_confirmation', e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                />
              </Kolom>

              {galatSandi.umum && (
                <p role="alert" className="flex items-start gap-2 text-[16px] leading-relaxed text-[var(--color-signal-rose)]">
                  <IconPeringatan size={18} weight="bold" className="mt-0.5 shrink-0" />
                  <span>{galatSandi.umum}</span>
                </p>
              )}

              <p className="flex items-start gap-2 rounded-[var(--radius-control)] surface-sunken px-4 py-3 text-[15.5px] leading-relaxed text-secondary">
                <IconKunci size={18} className="mt-0.5 shrink-0" />
                <span>Pilih kata sandi yang tidak dipakai di layanan lain, dan jangan bagikan kepada siapa pun.</span>
              </p>
            </Kartu>

            <Tombol type="submit" size="lg" penuh disabled={sibukSandi}>
              {sibukSandi ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
            </Tombol>
          </form>
        )}
      </section>

      {/* --- Preferensi notifikasi --- */}
      <section className="lg:col-span-2">
        <JudulSeksi>Preferensi Notifikasi</JudulSeksi>
        <Kartu padat>
          <BarisNotif
            Ikon={IconNotifikasi}
            judul="Notifikasi pesanan"
            ket="Status pesanan, pembayaran, dan pengiriman."
            aktif={notif.notify_email}
            onToggle={() => simpanNotif('notify_email')}
            disabled={sibukNotif}
            warna="permukaan-sky"
          />
          <BarisNotif
            Ikon={IconSparkleNotif}
            judul="Info promo & diskon"
            ket="Penawaran dan kode promo terbaru dari apotek."
            aktif={notif.notify_promo}
            onToggle={() => simpanNotif('notify_promo')}
            disabled={sibukNotif}
            warna="permukaan-honey"
          />
          <BarisTautan onClick={toggleTema} className="border-t border-hairline">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full permukaan-1 text-accent">
              {gelap ? <IconMatahari size={20} weight="bold" /> : <IconBulan size={20} weight="bold" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Tampilan aplikasi</span>
              <span className="block text-[15.5px] text-secondary">Mode {gelap ? 'gelap' : 'terang'}</span>
            </span>
            <span className="shrink-0 text-[15.5px] font-semibold text-secondary">{gelap ? 'Gelap' : 'Terang'}</span>
          </BarisTautan>
        </Kartu>
        <p className="mt-2 text-[15.5px] leading-relaxed text-muted">
          Notifikasi dikirim ke email dan nomor HP yang terdaftar pada akun Anda.
        </p>
      </section>

      {/* --- Keamanan & bantuan --- */}
      <section className="lg:col-span-2">
        <JudulSeksi>Keamanan &amp; Bantuan</JudulSeksi>
        <Kartu padat>
          <BarisTautan onClick={() => nav('/kontak')}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-green-soft)] text-[var(--color-signal-green)]">
              <IconWhatsapp size={21} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Lupa kata sandi?</span>
              <span className="block text-[15.5px] text-secondary">Petugas apotek dapat membantu memulihkan akun.</span>
            </span>
            <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
          </BarisTautan>
        </Kartu>
      </section>
    </div>
  )
}

// Baris preferensi dengan sakelar. Sakelar memakai aria-checked dan
// teks status, jadi bukan hanya warna yang menandakan aktif/tidak.
function BarisNotif({ Ikon, judul, ket, aktif, onToggle, disabled, warna }) {
  return (
    <div className="flex items-center gap-3 border-b border-hairline px-4 py-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${warna}`}>
        <Ikon size={21} weight="bold" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-semibold text-primary">{judul}</p>
        <p className="mt-0.5 text-[15.5px] leading-snug text-secondary">{ket}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={aktif}
        aria-label={judul}
        disabled={disabled}
        onClick={onToggle}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-150 disabled:opacity-50 ${
          aktif ? 'bg-accent' : 'bg-[var(--border-strong)]'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-soft transition-transform duration-150 ${
            aktif ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

// Ikon promo pada baris notifikasi.
function IconSparkleNotif(props) {
  return <IconLabel {...props} />
}
