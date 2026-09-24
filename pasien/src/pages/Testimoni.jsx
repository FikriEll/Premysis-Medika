import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Kartu, KepalaHalaman, JudulSeksi, Tombol, Kosong, Memuat, Galat, Bintang, AvatarPasien,
} from '../components/ui'
import { IconBintang, IconWhatsapp, IconTerverifikasi } from '../components/Icons'
import { IlustrasiTestimoni, IlustrasiKosong } from '../components/Ilustrasi'
import { fmtTanggal } from '../../../shared/format'

// Halaman Testimoni Pelanggan.
//
// Ringkasan peringkat ditampilkan lebih dulu (rata-rata + sebaran
// bintang), lalu ulasan lengkap. Hanya testimoni yang sudah
// disetujui apotek yang tampil, jadi isinya bisa dipercaya.
export default function Testimoni() {
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [meta, setMeta] = useState(null)
  const [galat, setGalat] = useState('')
  const [saring, setSaring] = useState(0)

  useEffect(() => {
    let batal = false
    api
      .testimoni()
      .then((r) => {
        if (batal) return
        setData(r.data || [])
        setMeta(r.meta || null)
      })
      .catch((e) => !batal && setGalat(e.message))
    return () => {
      batal = true
    }
  }, [])

  if (galat) {
    return <Galat judul="Gagal memuat testimoni" pesan={galat} onCoba={() => window.location.reload()} />
  }
  if (!data) return <Memuat baris={3} />

  const tampil = saring ? data.filter((t) => t.rating === saring) : data

  return (
    <div className="space-y-6">
      <KepalaHalaman
        judul="Testimoni Pelanggan"
        pengantar="Cerita nyata dari pelanggan yang sudah berbelanja di apotek kami."
        ilustrasi={<IlustrasiTestimoni size={150} />}
      />

      {meta && meta.total > 0 && (
        <Kartu className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="numeric text-[40px] font-bold leading-none text-primary">
                {Number(meta.average_rating).toFixed(1).replace('.', ',')}
              </p>
              <Bintang nilai={meta.average_rating} size={18} className="mt-2" />
              <p className="mt-1.5 text-[15px] text-secondary">dari {meta.total} ulasan</p>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((r) => {
                const jumlah = meta.rating_counts?.[r] ?? 0
                const persen = meta.total ? Math.round((jumlah / meta.total) * 100) : 0
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSaring(saring === r ? 0 : r)}
                    aria-pressed={saring === r}
                    className="flex w-full items-center gap-2 text-left"
                  >
                    <span className="numeric w-3 shrink-0 text-[15px] font-semibold text-secondary">{r}</span>
                    <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full surface-sunken">
                      <span
                        className="block h-full rounded-full bg-[var(--color-signal-amber)]"
                        style={{ width: `${persen}%` }}
                      />
                    </span>
                    <span className="numeric w-8 shrink-0 text-right text-[15px] text-muted">{jumlah}</span>
                  </button>
                )
              })}
            </div>
          </div>
          {saring > 0 && (
            <Tombol variant="secondary" penuh onClick={() => setSaring(0)}>
              Tampilkan semua ulasan
            </Tombol>
          )}
        </Kartu>
      )}

      <section>
        <JudulSeksi>
          {saring ? `Ulasan bintang ${saring}` : 'Semua Ulasan'} ({tampil.length})
        </JudulSeksi>

        {tampil.length === 0 ? (
          <Kartu padat>
            <Kosong
              judul="Belum ada testimoni"
              pesan="Ulasan dari pelanggan akan tampil di sini setelah disetujui apotek."
              ilustrasi={<IlustrasiKosong size={130} />}
              aksi={
                <Tombol size="lg" onClick={() => nav('/toko')}>
                  Mulai Belanja
                </Tombol>
              }
            />
          </Kartu>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {tampil.map((t) => (
              <li key={t.id}>
                <Kartu className="space-y-3">
                  <div className="flex items-center gap-3">
                    {t.photo ? (
                      <img src={t.photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                    ) : (
                      <AvatarPasien nama={t.name} size={48} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[17px] font-semibold text-primary">{t.name}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Bintang nilai={t.rating} size={15} />
                        <span className="numeric text-[15px] text-secondary">{t.rating}/5</span>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[14.5px] font-semibold text-[var(--color-signal-green)]">
                      <IconTerverifikasi size={16} weight="bold" />
                      Terverifikasi
                    </span>
                  </div>

                  <p className="text-[16.5px] leading-relaxed text-secondary">{t.content}</p>

                  {t.created_at && (
                    <p className="text-[15px] text-muted">Ditulis {fmtTanggal(t.created_at)}</p>
                  )}
                </Kartu>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <JudulSeksi>Sudah pernah berbelanja?</JudulSeksi>
        <Kartu className="space-y-3">
          <p className="text-[16.5px] leading-relaxed text-secondary">
            Ceritakan pengalaman Anda agar pelanggan lain lebih yakin. Kirim ulasan lewat
            WhatsApp apotek, lalu petugas akan menampilkannya di halaman ini.
          </p>
          <Tombol size="lg" penuh onClick={() => nav('/kontak')}>
            <IconBintang size={20} weight="bold" />
            Kirim Ulasan
          </Tombol>
          <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/blog')}>
            Baca berita kesehatan
          </Tombol>
        </Kartu>
      </section>
    </div>
  )
}
