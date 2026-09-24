import { useState } from 'react'
import { Kartu, JudulSeksi, Tombol, Input, Bintang, AvatarPasien, Lencana } from './ui'
import {
  IconPerisai, IconBuku, IconDiskusi, IconKirim, IconCentangBulat,
  IconBintang, IconKirimPesan, IconTanya, IconPanahKanan,
} from './Icons'
import { IlustrasiNotifikasi } from './Ilustrasi'

// =============================================================
// Bagian-bagian beranda yang berdiri sendiri.
//
// Dipisah dari Beranda.jsx supaya berkas halaman tetap terbaca dan
// tiap bagian bisa diuji sendiri. Semua warna memakai kelas
// permukaan-* (token) agar mode gelap ikut menyesuaikan.
// =============================================================

// Peta nama ikon dari server ke komponen ikon. Server mengirim nama
// sederhana ('perisai', 'buku', ...) supaya isi janji layanan bisa
// diubah tanpa menyentuh frontend.
const IKON_JANJI = {
  perisai: IconPerisai,
  buku: IconBuku,
  chat: IconDiskusi,
  kirim: IconKirim,
}

// -------------------------------------------------------------
// "Yang Kami Janjikan" - komitmen layanan klinik.
// -------------------------------------------------------------
export function JanjiLayanan({ janji = [] }) {
  if (janji.length === 0) return null

  return (
    <section>
      <JudulSeksi>Yang Kami Janjikan</JudulSeksi>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {janji.map((j) => {
          const Ikon = IKON_JANJI[j.ikon] || IconPerisai
          return (
            <li key={j.judul}>
              <Kartu className="flex h-full flex-col gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${j.warna || 'permukaan-1'} text-accent`}>
                  <Ikon size={23} weight="bold" />
                </span>
                <div className="min-w-0">
                  <p className="text-[17px] font-bold leading-snug text-primary">{j.judul}</p>
                  <p className="mt-1.5 text-[15.5px] leading-relaxed text-secondary">{j.isi}</p>
                </div>
              </Kartu>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// -------------------------------------------------------------
// Tanya jawab singkat (FAQ) dengan buka-tutup.
//
// Memakai <details>/<summary> bawaan browser: sudah bisa keyboard,
// sudah punya semantik, dan tetap jalan tanpa JavaScript.
// -------------------------------------------------------------
export function TanyaJawab({ daftar = [], onLihatSemua }) {
  if (daftar.length === 0) return null

  return (
    <section>
      <JudulSeksi
        aksi={
          onLihatSemua && (
            <button
              type="button"
              onClick={onLihatSemua}
              className="inline-flex items-center gap-1 text-[16px] font-semibold text-accent hover:underline"
            >
              Semua pertanyaan
              <IconPanahKanan size={16} weight="bold" />
            </button>
          )
        }
      >
        Pertanyaan yang Sering Diajukan
      </JudulSeksi>

      <div className="grid gap-2.5 lg:grid-cols-2">
        {daftar.map((f) => (
          <details
            key={f.id}
            className="group rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-3.5 open:surface-hover"
          >
            <summary className="flex cursor-pointer list-none items-start gap-3 text-[16.5px] font-semibold leading-snug text-primary">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full permukaan-mint text-accent">
                <IconTanya size={17} weight="bold" />
              </span>
              <span className="min-w-0 flex-1 pt-1">{f.question}</span>
              <IconPanahKanan
                size={18}
                weight="bold"
                className="mt-1.5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-90"
              />
            </summary>
            <p className="mt-2.5 pl-11 text-[16px] leading-relaxed text-secondary">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

// -------------------------------------------------------------
// Testimoni singkat di beranda.
// -------------------------------------------------------------
export function TestimoniSingkat({ daftar = [], onLihatSemua }) {
  if (daftar.length === 0) return null

  const rataRata = daftar.reduce((s, t) => s + (t.rating || 0), 0) / daftar.length

  return (
    <section>
      <JudulSeksi
        aksi={
          onLihatSemua && (
            <button
              type="button"
              onClick={onLihatSemua}
              className="inline-flex items-center gap-1 text-[16px] font-semibold text-accent hover:underline"
            >
              Semua testimoni
              <IconPanahKanan size={16} weight="bold" />
            </button>
          )
        }
      >
        Kata Pelanggan Kami
      </JudulSeksi>

      <ul className="grid gap-3 lg:grid-cols-3">
        {daftar.slice(0, 3).map((t) => (
          <li key={t.id}>
            <Kartu className="flex h-full flex-col gap-3">
              <div className="flex items-center gap-3">
                {t.photo ? (
                  <img src={t.photo} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                ) : (
                  <AvatarPasien nama={t.name} size={44} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16.5px] font-semibold text-primary">{t.name}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Bintang nilai={t.rating} size={14} />
                    <span className="numeric text-[14.5px] text-secondary">{t.rating}/5</span>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-[13.5px] font-semibold text-[var(--color-signal-green)]">
                  <IconCentangBulat size={15} weight="bold" />
                  Terverifikasi
                </span>
              </div>

              <p className="text-[15.5px] leading-relaxed text-secondary">{t.content}</p>
            </Kartu>
          </li>
        ))}
      </ul>

      <p className="mt-3 flex items-center gap-2 text-[15.5px] text-secondary">
        <IconBintang size={17} weight="fill" className="shrink-0 text-[var(--color-signal-amber)]" />
        <span>
          Rata-rata <strong className="numeric font-bold text-primary">{rataRata.toFixed(1).replace('.', ',')}</strong>{' '}
          dari {daftar.length} ulasan pelanggan.
        </span>
      </p>
    </section>
  )
}

// -------------------------------------------------------------
// Langganan kabar promo.
//
// Form ini belum tersambung ke layanan surel apa pun; pesannya jujur
// menyebut hal itu agar pengguna tidak merasa sudah mendaftar padahal
// belum. Ganti handler `onKirim` begitu kanal surel tersedia.
// -------------------------------------------------------------
export function SuratKabar({ onKirim, className = '' }) {
  const [email, setEmail] = useState('')
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState(false)

  const kirim = async (e) => {
    e.preventDefault()
    const nilai = email.trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(nilai)) {
      setGalat('Masukkan alamat email yang benar. Contoh: nama@email.com')
      return
    }
    setGalat('')
    setSibuk(true)
    try {
      await onKirim?.(nilai)
      setEmail('')
    } catch (err) {
      setGalat(err.message)
    } finally {
      setSibuk(false)
    }
  }

  return (
    <section className={`overflow-hidden rounded-[var(--radius-shell)] border border-hairline permukaan-sky ${className}`}>
      <div className="grid items-center gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-8">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[14px] font-bold uppercase tracking-wide text-accent">
            <IconKirimPesan size={15} weight="bold" />
            Kabar Promo
          </span>
          <h2 className="mt-3 text-[21px] font-bold leading-tight tracking-tight text-primary">
            Jangan lewatkan promo & tips kesehatan
          </h2>
          <p className="mt-2 max-w-[52ch] text-[16px] leading-relaxed text-secondary">
            Tinggalkan email Anda dan kami kabari saat ada diskon obat atau artikel kesehatan baru.
          </p>

          <form onSubmit={kirim} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Alamat email</span>
              <Input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setGalat('')
                }}
                placeholder="nama@email.com"
                aria-invalid={!!galat}
              />
            </label>
            <Tombol type="submit" disabled={sibuk} className="sm:w-auto">
              {sibuk ? 'Mengirim...' : 'Berlangganan'}
            </Tombol>
          </form>

          {galat && (
            <p role="alert" className="mt-2 text-[15.5px] leading-relaxed text-[var(--color-signal-rose)]">
              {galat}
            </p>
          )}

          <p className="mt-2.5 flex items-start gap-2 text-[15px] leading-relaxed text-secondary">
            <IconCentangBulat size={16} className="mt-0.5 shrink-0 text-accent" />
            <span>Kami tidak membagikan email Anda ke pihak lain dan bisa berhenti kapan saja.</span>
          </p>
        </div>

        <div className="pointer-events-none hidden shrink-0 sm:block" aria-hidden="true">
          <IlustrasiNotifikasi size={140} />
        </div>
      </div>
    </section>
  )
}
