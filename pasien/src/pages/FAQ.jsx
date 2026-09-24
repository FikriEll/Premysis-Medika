import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Kartu, KepalaHalaman, JudulSeksi, Tombol, InputCari, Kosong, Memuat, Galat,
} from '../components/ui'
import { IconWhatsapp } from '../components/Icons'
import { IlustrasiFAQ, IlustrasiPencarianKosong } from '../components/Ilustrasi'
import AkordeonTanya from '../components/AkordeonTanya'
import { useSembunyikanAjakan } from '../components/LayoutPublik'

// Halaman FAQ (Frequently Asked Questions).
//
// Pertanyaan dikelompokkan menjadi akordeon supaya halaman tetap
// ringkas di layar ponsel. Pencarian menyaring pertanyaan dan
// jawaban sekaligus, karena pelanggan sering mengetik kata kunci
// yang muncul di jawaban, bukan di judul pertanyaannya.
//
// Catatan tata letak: halaman ini TIDAK lagi menambahkan blok
// ajakan "Masih belum terjawab?" di paling bawah, karena
// LayoutPublik sudah menyediakan satu blok ajakan masuk untuk
// pengunjung - dua blok berturut-turut membuat halaman terasa
// menumpuk. Ajakan menghubungi apoteker kini menyatu di dalam
// akordeon (infoKontak), bukan sebagai section terpisah.
export default function FAQ() {
  const nav = useNavigate()
  const [daftar, setDaftar] = useState(null)
  const [galat, setGalat] = useState('')
  const [q, setQ] = useState('')
  // Halaman ini punya blok bantuan sendiri -> matikan ajakan umum.
  useSembunyikanAjakan()

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
          <AkordeonTanya
            daftar={hasil}
            infoKontak={{
              judul: 'Masih belum terjawab?',
              keterangan: 'Tim apoteker kami siap membantu Anda lewat WhatsApp atau form pesan.',
              aksi: (
                <Tombol size="lg" onClick={() => nav('/kontak')}>
                  <IconWhatsapp size={21} weight="bold" />
                  Hubungi Kami
                </Tombol>
              ),
            }}
          />
        </section>
      )}
    </div>
  )
}
