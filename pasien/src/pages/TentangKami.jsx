import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Kartu, KepalaHalaman, JudulSeksi, Tombol, Memuat, Galat, KartuAksi } from '../components/ui'
import {
  IconPerisai, IconTerverifikasi, IconKirim, IconDiskusi, IconBintang, IconBuku, IconWhatsapp,
} from '../components/Icons'
import { IlustrasiTentangKami } from '../components/Ilustrasi'

// Halaman Tentang Kami: profil apotek, visi, misi, dan nilai layanan.
//
// Seluruh isi diambil dari pengaturan apotek (API /pages), jadi
// petugas bisa memperbarui teks tanpa menyentuh aplikasi pasien.
export default function TentangKami() {
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [galat, setGalat] = useState('')

  useEffect(() => {
    let batal = false
    api
      .halaman()
      .then((r) => !batal && setData(r.data?.about || null))
      .catch((e) => !batal && setGalat(e.message))
    return () => {
      batal = true
    }
  }, [])

  if (galat) {
    return <Galat judul="Gagal memuat profil apotek" pesan={galat} onCoba={() => window.location.reload()} />
  }
  if (!data) return <Memuat baris={3} />

  const NILAI = [
    { Ikon: IconTerverifikasi, judul: 'Obat asli & terdaftar', ket: 'Dibeli dari distributor resmi dan terdaftar BPOM.', warna: 'permukaan-mint' },
    { Ikon: IconPerisai, judul: 'Resep dijaga ketat', ket: 'Berkas resep hanya dibuka apoteker berwenang.', warna: 'permukaan-sky' },
    { Ikon: IconKirim, judul: 'Kirim cepat', ket: 'Kurir instan area kota, JNE untuk luar kota.', warna: 'permukaan-peach' },
    { Ikon: IconDiskusi, judul: 'Konsultasi ramah', ket: 'Apoteker siap membantu memilih obat yang tepat.', warna: 'permukaan-honey' },
  ]

  return (
    <div className="wadah-baca space-y-6">
      <KepalaHalaman
        judul={`Tentang ${data.site_name || 'Apotek Kami'}`}
        pengantar={data.site_tagline || 'Solusi obat lengkap, cepat, dan terpercaya untuk keluarga Anda.'}
        ilustrasi={<IlustrasiTentangKami size={168} />}
      />

      {data.about && (
        <section>
          <JudulSeksi>Siapa Kami</JudulSeksi>
          <Kartu>
            <p className="text-[17px] leading-relaxed text-secondary">{data.about}</p>
          </Kartu>
        </section>
      )}

      {data.vision && (
        <section>
          <JudulSeksi>Visi</JudulSeksi>
          <Kartu className="space-y-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full permukaan-mint">
              <IconBintang size={22} weight="bold" />
            </span>
            <p className="text-[17px] leading-relaxed text-secondary">{data.vision}</p>
          </Kartu>
        </section>
      )}

      {Array.isArray(data.mission) && data.mission.length > 0 && (
        <section>
          <JudulSeksi>Misi</JudulSeksi>
          <Kartu>
            <ol className="space-y-3.5">
              {data.mission.map((m, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className="numeric flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[15.5px] font-bold text-accent">
                    {i + 1}
                  </span>
                  <span className="text-[17px] leading-relaxed text-secondary">{m}</span>
                </li>
              ))}
            </ol>
          </Kartu>
        </section>
      )}

      <section>
        <JudulSeksi>Yang Kami Janjikan</JudulSeksi>
        <div className="grid grid-cols-1 gap-2.5">
          {NILAI.map((n) => (
            <KartuAksi key={n.judul} Ikon={n.Ikon} judul={n.judul} ket={n.ket} warna={n.warna} onClick={() => nav('/kontak')} />
          ))}
        </div>
      </section>

      <section>
        <JudulSeksi>Kenali Kami Lebih Dekat</JudulSeksi>
        <div className="grid grid-cols-2 gap-2.5">
          <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/testimoni')}>
            <IconBintang size={20} weight="bold" />
            Testimoni
          </Tombol>
          <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/blog')}>
            <IconBuku size={20} weight="bold" />
            Berita
          </Tombol>
        </div>
        <Tombol className="mt-2.5" size="lg" penuh onClick={() => nav('/kontak')}>
          <IconWhatsapp size={20} weight="bold" />
          Hubungi Apotek
        </Tombol>
      </section>
    </div>
  )
}
