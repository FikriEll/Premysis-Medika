import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useStore } from '../lib/store'
import {
  Kartu, KepalaHalaman, JudulSeksi, Tombol, Kosong, Memuat, Galat, Lencana, BarisInfo,
} from '../components/ui'
import { IconLabel, IconSparkle, IconToko, IconTanggal } from '../components/Icons'
import { IlustrasiPromo, IlustrasiKosong } from '../components/Ilustrasi'
import { fmtRupiah, fmtTanggal } from '../../../shared/format'

// Halaman Promo atau Diskon.
//
// Menampilkan semua promo yang sedang berlaku. Kode promo bisa
// disalin sekali tekan supaya pelanggan tidak salah ketik saat
// checkout, dan tombol belanja mengarah ke katalog.
export default function Promo() {
  const nav = useNavigate()
  const { beriToast } = useStore()
  const [data, setData] = useState(null)
  const [galat, setGalat] = useState('')
  const [disalin, setDisalin] = useState(null)

  useEffect(() => {
    let batal = false
    api
      .promos()
      .then((r) => !batal && setData(r.data || []))
      .catch((e) => !batal && setGalat(e.message))
    return () => {
      batal = true
    }
  }, [])

  const salin = async (kode) => {
    try {
      await navigator.clipboard.writeText(kode)
      setDisalin(kode)
      beriToast(`Kode ${kode} disalin.`, 'sukses')
      setTimeout(() => setDisalin(null), 2500)
    } catch {
      beriToast(`Salin manual: ${kode}`, 'info')
    }
  }

  if (galat) {
    return <Galat judul="Gagal memuat promo" pesan={galat} onCoba={() => window.location.reload()} />
  }

  // Nilai promo ditulis apa adanya supaya pelanggan tahu besar potongannya.
  const nilaiPromo = (p) => {
    const persen = String(p.type).toLowerCase().startsWith('percent')
    return persen ? `${p.value}%` : fmtRupiah(p.value)
  }

  return (
    <div className="space-y-6">
      <KepalaHalaman
        judul="Promo & Diskon"
        pengantar="Hemat lebih banyak dengan kode promo yang sedang berlaku hari ini."
        ilustrasi={<IlustrasiPromo size={150} />}
      />

      {!data ? (
        <Memuat baris={3} />
      ) : data.length === 0 ? (
        <Kartu padat>
          <Kosong
            judul="Belum ada promo aktif"
            pesan="Promo baru akan tampil di sini. Sementara itu, Anda tetap bisa berbelanja seperti biasa."
            ilustrasi={<IlustrasiKosong size={130} />}
            aksi={
              <Tombol size="lg" onClick={() => nav('/toko')}>
                Belanja Sekarang
              </Tombol>
            }
          />
        </Kartu>
      ) : (
        <section>
          <JudulSeksi>Sedang Berlaku ({data.length})</JudulSeksi>
          <ul className="grid gap-3 lg:grid-cols-2">
            {data.map((p) => (
              <li key={p.id}>
                <Kartu className="flex h-full flex-col space-y-4">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[var(--radius-control)] permukaan-coral">
                      <IconLabel size={22} weight="bold" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[18.5px] font-bold leading-snug text-primary">{p.name}</p>
                      <p className="mt-1 text-[15.5px] leading-relaxed text-secondary">
                        {p.description || 'Gunakan kode di bawah saat menyelesaikan pesanan.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] surface-sunken px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[15px] text-secondary">Kode promo</p>
                      <p className="numeric truncate text-[19px] font-bold tracking-wide text-primary">{p.code}</p>
                    </div>
                    <Tombol variant={disalin === p.code ? 'sukses' : 'secondary'} onClick={() => salin(p.code)}>
                      {disalin === p.code ? 'Tersalin' : 'Salin'}
                    </Tombol>
                  </div>

                  <div className="rounded-[var(--radius-control)] border border-hairline px-4 py-1">
                    <BarisInfo label="Potongan">
                      <span className="text-[var(--color-signal-green)]">- {nilaiPromo(p)}</span>
                    </BarisInfo>
                    {p.min_purchase > 0 && (
                      <BarisInfo label="Minimal belanja">
                        <span className="numeric">{fmtRupiah(p.min_purchase)}</span>
                      </BarisInfo>
                    )}
                    {p.max_discount > 0 && (
                      <BarisInfo label="Maksimal potongan">
                        <span className="numeric">{fmtRupiah(p.max_discount)}</span>
                      </BarisInfo>
                    )}
                    {p.ends_at && (
                      <BarisInfo label="Berlaku sampai">
                        <span className="inline-flex items-center gap-1.5">
                          <IconTanggal size={16} className="text-muted" />
                          <span className="numeric">{fmtTanggal(p.ends_at)}</span>
                        </span>
                      </BarisInfo>
                    )}
                  </div>

                  <Tombol penuh size="lg" className="mt-auto" onClick={() => nav('/toko')}>
                    <IconToko size={20} weight="bold" />
                    Pakai Promo Ini
                  </Tombol>
                </Kartu>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <JudulSeksi>Cara Memakai Kode Promo</JudulSeksi>
        <Kartu>
          <ol className="space-y-3.5">
            {[
              'Salin kode promo dengan tombol Salin di atas.',
              'Pilih obat atau kebutuhan kesehatan di halaman Toko.',
              'Buka Keranjang lalu tekan Selesaikan Pesanan.',
              'Tempel kode promo di langkah Konfirmasi, lalu potongan dihitung otomatis.',
            ].map((t, i) => (
              <li key={i} className="flex gap-3.5">
                <span className="numeric flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[15.5px] font-bold text-accent">
                  {i + 1}
                </span>
                <span className="text-[16.5px] leading-relaxed text-secondary">{t}</span>
              </li>
            ))}
          </ol>
        </Kartu>
        <p className="mt-3 flex items-start gap-2 text-[15.5px] leading-relaxed text-muted">
          <IconSparkle size={17} className="mt-0.5 shrink-0" />
          <span>Satu pesanan hanya dapat memakai satu kode promo. Promo tidak berlaku untuk ongkos kirim.</span>
        </p>
      </section>
    </div>
  )
}
