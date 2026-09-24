import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { Kartu, JudulSeksi, Tombol, Memuat, Galat, AvatarPasien } from '../components/ui'
import { IconKembali, IconTanggal, IconWhatsapp, IconObat, IconToko } from '../components/Icons'
import { fmtTanggalPanjang } from '../../../shared/format'

// Halaman detail artikel.
//
// Isi artikel dikirim server sebagai teks dengan pemisah baris
// kosong antar paragraf, jadi di sini cukup dipecah menjadi <p>
// supaya jaraknya enak dibaca di layar ponsel.
export default function BlogDetail() {
  const { slug } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [galat, setGalat] = useState('')

  useEffect(() => {
    let batal = false
    setData(null)
    setGalat('')
    api
      .blog(slug)
      .then((r) => !batal && setData(r.data))
      .catch((e) => !batal && setGalat(e.message))
    return () => {
      batal = true
    }
  }, [slug])

  if (galat) {
    return (
      <Galat
        judul="Artikel tidak ditemukan"
        pesan={galat}
        onCoba={() => nav('/blog')}
      />
    )
  }
  if (!data) return <Memuat baris={4} />

  const paragraf = (data.content || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <article className="wadah-baca space-y-5">
      <header className="space-y-3">
        {data.cover_image && (
          <img
            src={data.cover_image}
            alt=""
            className="h-[190px] w-full rounded-[var(--radius-card)] border border-hairline object-cover"
          />
        )}
        <h1 className="text-[24px] font-bold leading-tight tracking-tight text-primary">{data.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[15px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <IconTanggal size={16} />
            <span className="numeric">{fmtTanggalPanjang(data.published_at)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconObat size={16} />
            Tim apoteker
          </span>
        </div>
      </header>

      {data.excerpt && (
        <p className="rounded-[var(--radius-card)] bg-[var(--accent-soft)] px-4 py-3.5 text-[17px] font-medium leading-relaxed text-primary">
          {data.excerpt}
        </p>
      )}

      <div className="space-y-4">
        {paragraf.map((p, i) => (
          <p key={i} className="text-[17px] leading-relaxed text-secondary">
            {p}
          </p>
        ))}
      </div>

      <Kartu className="space-y-3">
        <div className="flex items-center gap-3">
          <AvatarPasien nama="Apoteker Premysis" size={44} />
          <div className="min-w-0">
            <p className="text-[16.5px] font-semibold text-primary">Apoteker Premysis</p>
            <p className="text-[15px] text-secondary">Penulis artikel</p>
          </div>
        </div>
        <p className="text-[15.5px] leading-relaxed text-muted">
          Artikel ini bersifat informasi umum dan bukan pengganti nasihat medis. Untuk keluhan
          khusus, konsultasikan dengan apoteker atau dokter Anda.
        </p>
      </Kartu>

      <div className="space-y-2.5">
        <Tombol size="lg" penuh onClick={() => nav('/toko')}>
          <IconToko size={20} weight="bold" />
          Belanja Kebutuhan Kesehatan
        </Tombol>
        <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/kontak')}>
          <IconWhatsapp size={20} weight="bold" />
          Tanya Apotekerer
        </Tombol>
        <Tombol variant="ghost" size="lg" penuh onClick={() => nav('/blog')}>
          <IconKembali size={20} weight="bold" />
          Kembali ke daftar berita
        </Tombol>
      </div>
    </article>
  )
}
