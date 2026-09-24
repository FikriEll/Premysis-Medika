import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useStore } from '../lib/store'
import {
  Kartu, KepalaHalaman, JudulSeksi, Tombol, Kolom, Input, AreaTeks, Memuat, Galat,
  BarisFakta, PilihanKotak,
} from '../components/ui'
import {
  IconWhatsapp, IconTelepon, IconEmail, IconLokasi, IconJam, IconKirimPesan,
  IconPeringatan, IconCentangBulat, IconChat,
} from '../components/Icons'
import { IlustrasiKontak, IlustrasiSukses } from '../components/Ilustrasi'

// Halaman Kontak Kami.
//
// Tiga jalan menghubungi apotek: WhatsApp (paling cepat), telepon,
// dan form pesan yang masuk ke kotak masuk petugas. Alamat dan peta
// lokasi ikut ditampilkan supaya pelanggan bisa datang langsung.
const TOPIK = [
  'Pertanyaan tentang pesanan',
  'Tanya ketersediaan obat',
  'Konsultasi pemakaian obat',
  'Kerja sama atau lainnya',
]

export default function Kontak() {
  const { user, beriToast } = useStore()
  const [info, setInfo] = useState(null)
  const [galat, setGalat] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: TOPIK[0], message: '' })
  const [galatForm, setGalatForm] = useState({})
  const [sibuk, setSibuk] = useState(false)
  const [terkirim, setTerkirim] = useState(false)

  useEffect(() => {
    let batal = false
    api
      .kontakInfo()
      .then((r) => !batal && setInfo(r.data))
      .catch((e) => !batal && setGalat(e.message))
    return () => {
      batal = true
    }
  }, [])

  // Isi otomatis dari akun yang sedang masuk supaya pelanggan tidak
  // perlu mengetik ulang datanya.
  useEffect(() => {
    if (!user) return
    setForm((f) => ({
      ...f,
      name: f.name || user.name || '',
      email: f.email || user.email || '',
      phone: f.phone || user.phone || '',
    }))
  }, [user])

  const ubah = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setGalatForm((g) => ({ ...g, [k]: undefined }))
  }

  const periksa = () => {
    const g = {}
    if (!form.name.trim()) g.name = 'Nama wajib diisi.'
    if (!form.email.trim()) g.email = 'Email wajib diisi.'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) g.email = 'Alamat email belum benar.'
    if (form.message.trim().length < 10) g.message = 'Tuliskan pesan minimal 10 karakter agar kami paham kebutuhan Anda.'
    return g
  }

  const kirim = async (e) => {
    e.preventDefault()
    const g = periksa()
    setGalatForm(g)
    if (Object.keys(g).length) return

    setSibuk(true)
    try {
      await api.kirimKontak({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject,
        message: form.message.trim(),
      })
      setTerkirim(true)
    } catch (err) {
      beriToast(err.message, 'galat')
      setGalatForm({ umum: err.message })
    } finally {
      setSibuk(false)
    }
  }

  if (galat) {
    return <Galat judul="Gagal memuat informasi kontak" pesan={galat} onCoba={() => window.location.reload()} />
  }
  if (!info) return <Memuat baris={3} />

  const wa = (info.whatsapp || '').replace(/[^0-9]/g, '').replace(/^0/, '62')

  if (terkirim) {
    return (
      <div className="space-y-5">
        <Kartu className="space-y-4 text-center">
          <div className="flex justify-center">
            <IlustrasiSukses size={148} />
          </div>
          <div>
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-primary">Pesan Anda Terkirim</h1>
            <p className="mx-auto mt-2 max-w-[38ch] text-[17px] leading-relaxed text-secondary">
              Terima kasih sudah menghubungi kami. Petugas apotek akan membalas lewat email atau
              WhatsApp yang Anda cantumkan.
            </p>
          </div>
        </Kartu>

        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent('Halo, saya baru mengirim pesan lewat aplikasi.')}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-green-solid)] px-5 text-[18px] font-semibold text-white"
        >
          <IconWhatsapp size={22} weight="bold" />
          Butuh cepat? Chat WhatsApp
        </a>

        <Tombol variant="secondary" size="lg" penuh onClick={() => { setTerkirim(false); setForm((f) => ({ ...f, message: '' })) }}>
          Kirim pesan lain
        </Tombol>
      </div>
    )
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <KepalaHalaman
        className="lg:col-span-2"
        judul="Kontak Kami"
        pengantar="Ada pertanyaan tentang obat atau pesanan? Kami siap membantu Anda."
        ilustrasi={<IlustrasiKontak size={150} />}
      />

      <div className="space-y-6">
      {/* --- Jalan cepat: WhatsApp & telepon --- */}
      <section>
        <JudulSeksi>Hubungi Langsung</JudulSeksi>
        <div className="space-y-2.5">
          {info.whatsapp && (
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent('Halo, saya butuh bantuan dari Klinik Premysis Medika.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3.5 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-4"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-green-solid)] text-white">
                <IconWhatsapp size={23} weight="bold" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold text-primary">Chat WhatsApp</span>
                <span className="block text-[15.5px] text-secondary">Balasan paling cepat, biasanya di bawah 15 menit</span>
              </span>
            </a>
          )}

          {info.phone && (
            <a
              href={`tel:${info.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-3.5 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-4"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-sky">
                <IconTelepon size={22} weight="bold" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold text-primary">Telepon Klinik</span>
                <span className="numeric block text-[15.5px] text-secondary">{info.phone}</span>
              </span>
            </a>
          )}
        </div>
      </section>

      {/* --- Alamat & jam buka --- */}
      <section>
        <JudulSeksi>Alamat &amp; Jam Buka</JudulSeksi>
        <Kartu className="divide-y divide-[var(--border-hairline)] px-4 py-1">
          {info.address && <BarisFakta Ikon={IconLokasi} label="Alamat apotek" nilai={info.address} warna="permukaan-coral" />}
          {info.opening_hours && (
            <BarisFakta Ikon={IconJam} label="Jam operasional" warna="permukaan-honey">
              <span className="whitespace-pre-line">{info.opening_hours}</span>
            </BarisFakta>
          )}
          {info.email && <BarisFakta Ikon={IconEmail} label="Email" nilai={info.email} warna="permukaan-sky" />}
        </Kartu>

        {info.maps_embed_url && (
          <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-hairline">
            <iframe
              title="Peta lokasi apotek"
              src={info.maps_embed_url}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[220px] w-full"
            />
          </div>
        )}
      </section>
      </div>

      {/* --- Form pesan --- */}
      <section>
        <JudulSeksi>Kirim Pesan</JudulSeksi>
        <form onSubmit={kirim} className="space-y-4">
          <Kartu className="space-y-4">
            <Kolom label="Topik pertanyaan" wajib>
              <div className="space-y-2">
                {TOPIK.map((t) => (
                  <PilihanKotak
                    key={t}
                    Ikon={IconChat}
                    judul={t}
                    terpilih={form.subject === t}
                    onClick={() => ubah('subject', t)}
                  />
                ))}
              </div>
            </Kolom>

            <Kolom label="Nama lengkap" wajib htmlFor="nama" galat={galatForm.name}>
              <Input id="nama" value={form.name} onChange={(e) => ubah('name', e.target.value)} placeholder="Contoh: Siti Nurhaliza" />
            </Kolom>

            <Kolom label="Email" wajib htmlFor="email" galat={galatForm.email} bantuan="Kami akan membalas ke email ini.">
              <Input id="email" type="email" inputMode="email" value={form.email} onChange={(e) => ubah('email', e.target.value)} placeholder="nama@email.com" />
            </Kolom>

            <Kolom label="Nomor HP / WhatsApp" htmlFor="hp" bantuan="Opsional, agar kami bisa membalas lebih cepat.">
              <Input id="hp" type="tel" inputMode="tel" value={form.phone} onChange={(e) => ubah('phone', e.target.value)} placeholder="0812-3456-7890" />
            </Kolom>

            <Kolom label="Pesan Anda" wajib htmlFor="pesan" galat={galatForm.message} bantuan="Jelaskan sedetail mungkin agar kami bisa membantu dengan tepat.">
              <AreaTeks id="pesan" value={form.message} onChange={(e) => ubah('message', e.target.value)} placeholder="Contoh: Saya ingin menanyakan apakah obat X tersedia dan berapa harganya." rows={5} />
            </Kolom>

            {galatForm.umum && (
              <p role="alert" className="flex items-start gap-2 text-[16px] leading-relaxed text-[var(--color-signal-rose)]">
                <IconPeringatan size={18} weight="bold" className="mt-0.5 shrink-0" />
                <span>{galatForm.umum}</span>
              </p>
            )}
          </Kartu>

          <Tombol type="submit" size="lg" penuh disabled={sibuk}>
            <IconKirimPesan size={21} weight="bold" />
            {sibuk ? 'Mengirim...' : 'Kirim Pesan'}
          </Tombol>
        </form>

        <p className="mt-3 flex items-start gap-2 text-[15.5px] leading-relaxed text-muted">
          <IconCentangBulat size={17} className="mt-0.5 shrink-0" />
          <span>Untuk pertanyaan mendesak soal obat yang sedang Anda konsumsi, sebaiknya hubungi apotek lewat telepon atau WhatsApp.</span>
        </p>
      </section>
    </div>
  )
}
