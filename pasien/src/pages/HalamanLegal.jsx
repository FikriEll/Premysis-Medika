import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Kartu, KepalaHalaman, Tombol, Memuat, Galat, JudulSeksi } from '../components/ui'
import { IconPerisai, IconDokumen, IconWhatsapp, IconCentangBulat } from '../components/Icons'
import { IlustrasiSyarat, IlustrasiPrivasi } from '../components/Ilustrasi'
import { fmtTanggalPanjang } from '../../../shared/format'

// Halaman Syarat dan Ketentuan serta Kebijakan Privasi.
//
// Keduanya memakai satu komponen karena bentuknya sama: judul,
// tanggal pembaruan, lalu daftar paragraf. Yang membedakan hanya
// jenis data yang diambil dari API (/pages) dan ilustrasinya.
const JENIS = {
  terms: {
    kunci: 'terms',
    judul: 'Syarat dan Ketentuan',
    pengantar: 'Aturan yang berlaku saat Anda berbelanja dan menggunakan layanan apotek.',
    Ikon: IconDokumen,
    warna: 'permukaan-sky',
    Ilustrasi: IlustrasiSyarat,
  },
  privacy: {
    kunci: 'privacy',
    judul: 'Kebijakan Privasi',
    pengantar: 'Bagaimana kami mengumpulkan, memakai, dan melindungi data pribadi Anda.',
    Ikon: IconPerisai,
    warna: 'permukaan-mint',
    Ilustrasi: IlustrasiPrivasi,
  },
}

const JANJI_PRIVASI = [
  'Data resep medis hanya dibuka apoteker berwenang.',
  'Kami tidak pernah menjual data pribadi Anda.',
  'Nomor kartu dan kode rahasia tidak kami simpan.',
  'Anda berhak meminta salinan atau penghapusan data.',
]

export default function HalamanLegal({ jenis = 'terms' }) {
  const nav = useNavigate()
  const meta = JENIS[jenis] || JENIS.terms
  const [data, setData] = useState(null)
  const [galat, setGalat] = useState('')

  useEffect(() => {
    let batal = false
    setData(null)
    api
      .halaman()
      .then((r) => !batal && setData(r.data?.[meta.kunci] || null))
      .catch((e) => !batal && setGalat(e.message))
    return () => {
      batal = true
    }
  }, [meta.kunci])

  if (galat) {
    return <Galat judul="Gagal memuat halaman ini" pesan={galat} onCoba={() => window.location.reload()} />
  }
  if (!data) return <Memuat baris={4} />

  const Ilustrasi = meta.Ilustrasi

  return (
    <div className="wadah-baca space-y-6">
      <KepalaHalaman judul={meta.judul} pengantar={meta.pengantar} ilustrasi={<Ilustrasi size={150} />} />

      <Kartu className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${meta.warna}`}>
          <meta.Ikon size={22} weight="bold" />
        </span>
        <div className="min-w-0">
          <p className="text-[16px] font-semibold text-primary">Terakhir diperbarui</p>
          <p className="numeric mt-0.5 text-[16px] text-secondary">
            {data.updated_at ? fmtTanggalPanjang(data.updated_at) : 'Belum ada perubahan'}
          </p>
        </div>
      </Kartu>

      {jenis === 'privacy' && (
        <section>
          <JudulSeksi>Empat Janji Kami</JudulSeksi>
          <Kartu>
            <ul className="space-y-3.5">
              {JANJI_PRIVASI.map((j) => (
                <li key={j} className="flex gap-3">
                  <IconCentangBulat size={21} weight="bold" className="mt-0.5 shrink-0 text-[var(--color-signal-green)]" />
                  <span className="text-[16.5px] leading-relaxed text-secondary">{j}</span>
                </li>
              ))}
            </ul>
          </Kartu>
        </section>
      )}

      <section>
        <JudulSeksi>Isi Lengkap</JudulSeksi>
        <Kartu className="space-y-4">
          {(data.blocks || []).map((b, i) => (
            <p key={i} className="text-[16.5px] leading-relaxed text-secondary">
              {b.text}
            </p>
          ))}
          {(!data.blocks || data.blocks.length === 0) && (
            <p className="text-[16.5px] leading-relaxed text-muted">
              Isi halaman ini belum diisi oleh apotek. Silakan hubungi petugas untuk informasi lebih lanjut.
            </p>
          )}
        </Kartu>
      </section>

      <section>
        <JudulSeksi>Ada yang ingin ditanyakan?</JudulSeksi>
        <Tombol size="lg" penuh onClick={() => nav('/kontak')}>
          <IconWhatsapp size={21} weight="bold" />
          Hubungi Kami
        </Tombol>
      </section>
    </div>
  )
}
