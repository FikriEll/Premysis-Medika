import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Kartu, KepalaHalaman, JudulSeksi, Tombol, Kosong, Memuat, Galat, Lencana } from '../components/ui'
import { IconBuku, IconTanggal, IconObat } from '../components/Icons'
import { IlustrasiBlog, IlustrasiKosong } from '../components/Ilustrasi'
import { fmtTanggal } from '../../../shared/format'

// Halaman Blog / Berita.
//
// Artikel diambil dari server apotek (ditulis apoteker), sehingga
// isinya satu sumber dengan dashboard admin. Daftar ditampilkan
// sebagai kartu ringkas dengan gambar sampul bila tersedia.
export default function Blog() {
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [meta, setMeta] = useState(null)
  const [galat, setGalat] = useState('')
  const [halaman, setHalaman] = useState(1)
  const [memuatLagi, setMemuatLagi] = useState(false)

  useEffect(() => {
    let batal = false
    if (halaman === 1) setData(null)
    else setMemuatLagi(true)

    api
      .blogs({ page: halaman, per_page: 9 })
      .then((r) => {
        if (batal) return
        setMeta(r.meta || null)
        setData((d) => (halaman === 1 ? r.data || [] : [...(d || []), ...(r.data || [])]))
      })
      .catch((e) => !batal && setGalat(e.message))
      .finally(() => !batal && setMemuatLagi(false))

    return () => {
      batal = true
    }
  }, [halaman])

  if (galat) {
    return <Galat judul="Gagal memuat berita" pesan={galat} onCoba={() => window.location.reload()} />
  }

  const adaLagi = meta && meta.current_page < meta.last_page

  return (
    <div className="space-y-6">
      <KepalaHalaman
        judul="Berita & Artikel Kesehatan"
        pengantar="Tips, panduan, dan informasi obat yang ditulis langsung oleh apoteker kami."
        ilustrasi={<IlustrasiBlog size={150} />}
      />

      {!data ? (
        <Memuat baris={4} />
      ) : data.length === 0 ? (
        <Kartu padat>
          <Kosong
            judul="Belum ada artikel"
            pesan="Artikel kesehatan akan tampil di sini begitu apotek menerbitkannya."
            ilustrasi={<IlustrasiKosong size={130} />}
            aksi={
              <Tombol size="lg" onClick={() => nav('/toko')}>
                Belanja Obat
              </Tombol>
            }
          />
        </Kartu>
      ) : (
        <section>
          <JudulSeksi>Artikel Terbaru</JudulSeksi>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => nav(`/blog/${p.slug}`)}
                  className="flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline surface-raised text-left transition-colors active:surface-hover"
                >
                  <span className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden permukaan-sky">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <IconObat size={34} />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                    <span className="block text-[17.5px] font-semibold leading-snug text-primary">
                      {p.title}
                    </span>
                    {p.excerpt && (
                      <span className="line-clamp-2 block text-[15.5px] leading-relaxed text-secondary">
                        {p.excerpt}
                      </span>
                    )}
                    <span className="mt-auto flex items-center gap-1.5 text-[14.5px] text-muted">
                      <IconTanggal size={15} />
                      <span className="numeric">{fmtTanggal(p.published_at)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {adaLagi && (
            <Tombol
              variant="secondary"
              size="lg"
              penuh
              className="mt-3"
              disabled={memuatLagi}
              onClick={() => setHalaman((h) => h + 1)}
            >
              {memuatLagi ? 'Memuat...' : 'Tampilkan artikel lain'}
            </Tombol>
          )}
        </section>
      )}

      <section>
        <JudulSeksi>Butuh saran langsung?</JudulSeksi>
        <Kartu className="space-y-3">
          <Lencana tone="accent" ikon={<IconBuku size={14} weight="bold" />}>
            Ditulis oleh apoteker
          </Lencana>
          <p className="text-[16.5px] leading-relaxed text-secondary">
            Artikel di halaman ini bersifat informasi umum. Untuk keluhan khusus, konsultasikan
            langsung dengan apoteker kami.
          </p>
          <Tombol size="lg" penuh onClick={() => nav('/kontak')}>
            Konsultasi Apoteker
          </Tombol>
        </Kartu>
      </section>
    </div>
  )
}
