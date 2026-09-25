import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useStore } from '../lib/store'
import { Kartu, KepalaHalaman, JudulSeksi, Tombol, Memuat, Galat, BarisFakta } from '../components/ui'
import {
  IconWhatsapp, IconTelepon, IconEmail, IconLokasi, IconJam, IconCentangBulat,
} from '../components/Icons'
import { IlustrasiKontak, IlustrasiSukses } from '../components/Ilustrasi'
import SectionKontak from '../components/SectionKontak'

// Halaman Kontak Kami.
//
// Dua jalan menghubungi apotek: form pesan yang masuk ke kotak masuk
// petugas, atau langsung lewat WhatsApp/telepon. Alamat dan peta
// lokasi ikut ditampilkan supaya pelanggan bisa datang langsung.
//
// Tata letaknya memakai section kontak bergaya referensi (panel
// gelap + kartu form), tetapi state, pemeriksaan isian, dan
// pengirimannya tetap ditangani halaman ini - hanya wajahnya yang
// berubah, fungsinya tidak.
//
// Catatan: sebelumnya halaman ini menampilkan dua blok kontak yang
// isinya mirip (tautan WhatsApp/telepon di kolom kiri DAN form di
// kolom kanan) sehingga terasa menumpuk. Sekarang semua jalan
// menghubungi berada dalam satu panel, dan bagian bawah hanya berisi
// alamat lengkap, jam buka, dan peta.
export default function Kontak() {
  const { user, beriToast } = useStore()
  const [info, setInfo] = useState(null)
  const [galat, setGalat] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Pertanyaan tentang pesanan', message: '' })
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
    <div className="space-y-6">
      <KepalaHalaman
        judul="Kontak Kami"
        pengantar="Ada pertanyaan tentang obat atau pesanan? Kami siap membantu Anda."
        ilustrasi={<IlustrasiKontak size={150} />}
      />

      {/* --- Panel kontak: form pesan + jalan menghubungi langsung --- */}
      <SectionKontak
        info={info}
        form={form}
        ubah={ubah}
        kirim={kirim}
        galatForm={galatForm}
        sibuk={sibuk}
      />

      {/* --- Alamat lengkap, jam buka, dan peta --- */}
      <section className="space-y-3">
        <JudulSeksi>Alamat &amp; Jam Buka</JudulSeksi>
        <Kartu className="divide-y divide-[var(--border-hairline)] px-4 py-1">
          {info.address && <BarisFakta Ikon={IconLokasi} label="Alamat klinik" nilai={info.address} warna="permukaan-coral" />}
          {info.opening_hours && (
            <BarisFakta Ikon={IconJam} label="Jam operasional" warna="permukaan-honey">
              <span className="whitespace-pre-line">{info.opening_hours}</span>
            </BarisFakta>
          )}
          {info.email && <BarisFakta Ikon={IconEmail} label="Email" nilai={info.email} warna="permukaan-sky" />}
          {info.phone && (
            <BarisFakta Ikon={IconTelepon} label="Telepon" warna="permukaan-mint">
              <a href={`tel:${info.phone.replace(/\s/g, '')}`} className="numeric hover:underline">
                {info.phone}
              </a>
            </BarisFakta>
          )}
        </Kartu>

        {info.maps_embed_url && (
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-hairline">
            <iframe
              title="Peta lokasi klinik"
              src={info.maps_embed_url}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[240px] w-full"
            />
          </div>
        )}
      </section>

      <p className="flex items-start gap-2 text-[15.5px] leading-relaxed text-muted">
        <IconCentangBulat size={17} className="mt-0.5 shrink-0" />
        <span>Untuk pertanyaan mendesak soal obat yang sedang Anda konsumsi, sebaiknya hubungi apotek lewat telepon atau WhatsApp.</span>
      </p>
    </div>
  )
}
