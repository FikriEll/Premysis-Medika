import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Kartu, KepalaHalaman, JudulSeksi, Tombol, InputCari, Kosong, Memuat, Galat, TautanLanjut,
} from '../components/ui'
import { IconTanya, IconWhatsapp, IconPanahKanan } from '../components/Icons'
import { IlustrasiFAQ, IlustrasiPencarianKosong } from '../components/Ilustrasi'

// Halaman FAQ (Frequently Asked Questions).
//
// Pertanyaan dikelompokkan menjadi akordeon supaya halaman tetap
// ringkas di layar ponsel. Pencarian menyaring pertanyaan dan
// jawaban sekaligus, karena pelanggan sering mengetik kata kunci
// yang muncul di jawaban, bukan di judul pertanyaannya.
export default function FAQ() {
  const nav = useNavigate()
  const [daftar, setDaftar] = useState(null)
  const [galat, setGalat] = useState('')
  const [q, setQ] = useState('')
  const [buka, setBuka] = useState(null)

  useEffect(() => {
    let batal = false
    api
      .faqs()
      .then((r) => !batal && setDaftar(r.data || []))
      .catch((e) => !batal && setGalat(e.message))
    return () => {
      batal = true
    }
  }, [])

  const hasil = useMemo(() => {
    if (!daftar) return []
    const kunci = q.trim().toLowerCase()
    if (!kunci) return daftar
    return daftar.filter(
      (f) =>
        (f.question || '').toLowerCase().includes(kunci) ||
        (f.answer || '').toLowerCase().includes(kunci),
    )
  }, [daftar, q])

  if (galat) {
    return <Galat judul="Gagal memuat pertanyaan" pesan={galat} onCoba={() => window.location.reload()} />
  }

  return (
    <div className="wadah-baca space-y-6">
      <KepalaHalaman
        judul="Pertanyaan yang Sering Diajukan"
        pengantar="Temukan jawaban cepat soal pesanan, resep, pengiriman, dan pembayaran."
        ilustrasi={<IlustrasiFAQ size={152} />}
      />

      <InputCari value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari pertanyaan, misalnya: resep" />

      {!daftar ? (
        <Memuat baris={4} />
      ) : hasil.length === 0 ? (
        <Kartu padat>
          <Kosong
            judul="Pertanyaan tidak ditemukan"
            pesan={`Tidak ada pertanyaan yang cocok dengan "${q}". Coba kata kunci lain, atau tanyakan langsung ke apotek.`}
            ilustrasi={<IlustrasiPencarianKosong size={132} />}
            aksi={
              <Tombol size="lg" onClick={() => nav('/kontak')}>
                Tanya Apoteker
              </Tombol>
            }
          />
        </Kartu>
      ) : (
        <section>
          <JudulSeksi>{q.trim() ? `${hasil.length} pertanyaan cocok` : 'Daftar Pertanyaan'}</JudulSeksi>
          <ul className="space-y-2.5">
            {hasil.map((f) => {
              const terbuka = buka === f.id
              return (
                <li key={f.id}>
                  <Kartu padat>
                    <button
                      type="button"
                      onClick={() => setBuka(terbuka ? null : f.id)}
                      aria-expanded={terbuka}
                      className="flex w-full items-start gap-3 px-4 py-4 text-left"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
                        <IconTanya size={20} weight="bold" />
                      </span>
                      <span className="min-w-0 flex-1 text-[17px] font-semibold leading-snug text-primary">
                        {f.question}
                      </span>
                      <IconPanahKanan
                        size={19}
                        weight="bold"
                        className={`mt-1 shrink-0 text-muted transition-transform duration-200 ${terbuka ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {terbuka && (
                      <p className="border-t border-hairline px-4 py-4 text-[16.5px] leading-relaxed text-secondary">
                        {f.answer}
                      </p>
                    )}
                  </Kartu>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <JudulSeksi>Masih belum terjawab?</JudulSeksi>
        <Kartu className="space-y-3">
          <p className="text-[16.5px] leading-relaxed text-secondary">
            Tim apoteker kami siap membantu Anda secara langsung, baik lewat WhatsApp maupun
            melalui form pesan.
          </p>
          <Tombol size="lg" penuh onClick={() => nav('/kontak')}>
            <IconWhatsapp size={21} weight="bold" />
            Hubungi Kami
          </Tombol>
          <TautanLanjut onClick={() => nav('/syarat')}>Baca syarat dan ketentuan</TautanLanjut>
        </Kartu>
      </section>
    </div>
  )
}
