import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah } from '../../../shared/format'
import { BANK, nominalBayar, instruksiTransfer, statusPembayaran } from '../../../shared/pembayaran'
import { Kartu, Tombol, Lencana, Kosong, Konfirmasi, BarisInfo, JudulSeksi, AreaTeks, Kolom } from '../components/ui'
import { BarisObat } from '../components/kartu'
import {
  IconDompet, IconPeringatan, IconCentangBulat, IconKamera, IconLokasi, IconPesanan,
} from '../components/Icons'
import { IlustrasiPaket } from '../components/Ilustrasi'

// F-08b Pembayaran - Fitur Minimal #5 (tugas ERP).
//
// Setelah pesanan dibuat (status "Menunggu Pembayaran"), pasien masuk
// ke halaman ini untuk membayar:
//   - Transfer Bank : lihat rekening + nominal (termasuk kode unik),
//                     lalu unggah bukti transfer.
//   - Tunai         : dibayar saat mengambil pesanan di klinik.
// Bukti yang diunggah masuk ke status "Menunggu Verifikasi" dan
// diperiksa admin lewat dashboard (menu Pesanan).
export default function Pembayaran() {
  const { id } = useParams()
  const nav = useNavigate()
  const { pesananSaya, bayarPesanan, beriToast, namaProduk } = useStore()

  const pesanan = pesananSaya.find((p) => p.id === Number(id))

  const [namaBerkas, setNamaBerkas] = useState('')
  const [catatan, setCatatan] = useState('')
  const [sibuk, setSibuk] = useState(false)
  const [tanya, setTanya] = useState(false)
  const [galat, setGalat] = useState('')

  const hitung = useMemo(() => (pesanan ? nominalBayar(pesanan) : null), [pesanan])

  if (!pesanan) {
    return (
      <Kartu padat>
        <Kosong
          judul="Pesanan tidak ditemukan"
          pesan="Pesanan ini mungkin sudah tidak ada. Buka menu Pesanan untuk melihat daftar pesanan Anda."
          ilustrasi={<IlustrasiPaket size={132} />}
          aksi={
            <Tombol size="lg" onClick={() => nav('/pesanan', { replace: true })}>
              Ke Pesanan Saya
            </Tombol>
          }
        />
      </Kartu>
    )
  }

  const tunai = pesanan.metode_bayar === 'Tunai'
  const sp = pesanan.status_pembayaran || 'Belum Bayar'
  const lunas = sp === 'Terverifikasi'
  const menungguVerifikasi = sp === 'Menunggu Verifikasi'
  const ditolak = sp === 'Ditolak'
  const sudahDiproses = pesanan.status !== 'Menunggu Pembayaran'

  const pilihBerkas = (e) => {
    const f = e.target.files?.[0]
    setGalat('')
    if (!f) return
    // Demo: yang disimpan adalah nama berkas (tanpa mengunggah ke server
    // penyimpanan). Cukup untuk menunjukkan alur unggah bukti.
    if (f.size > 3 * 1024 * 1024) {
      setGalat('Ukuran foto terlalu besar. Maksimal 3 MB.')
      return
    }
    setNamaBerkas(f.name)
  }

  const kirim = async () => {
    setGalat('')
    if (!tunai && !namaBerkas) {
      setGalat('Unggah foto bukti transfer terlebih dahulu.')
      return
    }
    setSibuk(true)
    try {
      await bayarPesanan(pesanan.id, {
        bukti: namaBerkas,
        catatan,
        nominal: hitung.harus_dibayar,
      })
      setTanya(false)
      nav('/pesanan', { replace: true, state: { sorot: pesanan.id } })
    } catch (e) {
      setGalat(e.message)
      beriToast(e.message, 'galat')
      setTanya(false)
    } finally {
      setSibuk(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Ringkasan pesanan yang akan dibayar */}
      <Kartu className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="numeric text-[15.5px] text-secondary">{pesanan.nomor_pesanan}</p>
            <p className="mt-0.5 text-[17px] font-semibold text-primary">Ringkasan Pesanan</p>
          </div>
          <Lencana tone={statusPembayaran[sp]?.tone}>{statusPembayaran[sp]?.label}</Lencana>
        </div>
        <div className="divide-y divide-[var(--border-hairline)]">
          {(pesanan.detail || []).map((d) => (
            <BarisObat
              key={d.id}
              nama={namaProduk(d.id_produk)}
              jumlah={d.jumlah}
              harga={d.jumlah * d.harga_satuan}
            />
          ))}
        </div>
        <div className="border-t border-hairline pt-2">
          <BarisInfo label="Subtotal">
            <span className="numeric">{fmtRupiah(pesanan.total - (pesanan.biaya_kirim || 0))}</span>
          </BarisInfo>
          <BarisInfo label="Ongkos kirim">
            <span className="numeric">{pesanan.biaya_kirim ? fmtRupiah(pesanan.biaya_kirim) : 'Gratis'}</span>
          </BarisInfo>
          <BarisInfo label="Kode unik">
            <span className="numeric">+ {fmtRupiah(hitung.kode_unik)}</span>
          </BarisInfo>
          <BarisInfo label="Jumlah yang harus dibayar" className="border-t border-hairline">
            <span className="numeric text-[21px] font-bold text-accent">{fmtRupiah(hitung.harus_dibayar)}</span>
          </BarisInfo>
        </div>
      </Kartu>

      {/* Sudah lunas / sedang diperiksa / ditolak */}
      {lunas && (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-green-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-green)]">
          <IconCentangBulat size={21} weight="bold" className="mt-0.5 shrink-0" />
          <span>Pembayaran Anda sudah dikonfirmasi klinik. Pesanan akan segera diproses.</span>
        </p>
      )}

      {menungguVerifikasi && (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-blue-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-blue)]">
          <IconPeringatan size={21} weight="bold" className="mt-0.5 shrink-0" />
          <span>
            Bukti pembayaran Anda sedang diperiksa klinik (biasanya dalam 1x24 jam). Anda tidak perlu
            mengunggah ulang.
          </span>
        </p>
      )}

      {ditolak && (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-rose-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-rose)]">
          <IconPeringatan size={21} weight="bold" className="mt-0.5 shrink-0" />
          <span>
            Bukti pembayaran sebelumnya belum bisa diterima
            {pesanan.alasan_tolak ? `: ${pesanan.alasan_tolak}` : '.'} Silakan unggah ulang bukti yang benar.
          </span>
        </p>
      )}

      {/* Instruksi transfer (hanya untuk Transfer Bank, belum lunas) */}
      {!tunai && !lunas && !menungguVerifikasi && (
        <>
          <Kartu className="space-y-3">
            <JudulSeksi>Rekening Tujuan Transfer</JudulSeksi>
            <div className="rounded-[var(--radius-control)] surface-1 px-4 py-3.5">
              <p className="text-[17px] font-bold text-primary">{BANK.bank}</p>
              <p className="numeric mt-1 text-[22px] font-bold tracking-wide text-accent">{BANK.nomor}</p>
              <p className="mt-1 text-[16px] text-secondary">a.n. {BANK.atas_nama}</p>
            </div>
            <ol className="space-y-2">
              {instruksiTransfer(pesanan).langkah.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[16px] leading-relaxed text-secondary">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full surface-sunken text-[14px] font-bold text-accent">
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <p className="flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-amber-soft)] px-3.5 py-2.5 text-[15.5px] leading-relaxed text-[var(--color-signal-amber)]">
              <IconPeringatan size={18} weight="bold" className="mt-0.5 shrink-0" />
              <span>
                Transfer <strong className="font-semibold">tepat sampai 3 angka terakhir</strong> (kode unik) supaya
                klinik mudah mencocokkan pembayaran Anda.
              </span>
            </p>
          </Kartu>

          {/* Unggah bukti */}
          <Kartu className="space-y-3">
            <JudulSeksi>Unggah Bukti Transfer</JudulSeksi>
            <label
              htmlFor="bukti"
              className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-strong surface-sunken px-4 py-5 text-center"
            >
              <IconKamera size={26} weight="bold" className="text-accent" />
              <span className="text-[16px] font-semibold text-primary">
                {namaBerkas || 'Ketuk untuk pilih foto bukti'}
              </span>
              <span className="text-[15px] text-secondary">JPG atau PNG, maksimal 3 MB</span>
            </label>
            <input
              id="bukti"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={pilihBerkas}
            />

            <Kolom label="Catatan (boleh dikosongkan)" htmlFor="catatanBayar" bantuan="Mis. nama pengirim berbeda dari nama akun.">
              <AreaTeks
                id="catatanBayar"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: transfer dari rekening suami"
              />
            </Kolom>
          </Kartu>
        </>
      )}

      {/* Instruksi tunai */}
      {tunai && !sudahDiproses && (
        <Kartu className="space-y-3">
          <JudulSeksi>Bayar Tunai di Klinik</JudulSeksi>
          <p className="text-[16px] leading-relaxed text-secondary">
            Pesanan ini dibayar tunai saat Anda mengambilnya di klinik. Siapkan uang pas sebesar
            <strong className="font-semibold text-primary"> {fmtRupiah(pesanan.total)}</strong>.
          </p>
          <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3.5">
            <p className="flex items-center gap-2 text-[16px] font-semibold text-primary">
              <IconLokasi size={18} weight="bold" className="text-accent" />
              Lokasi pengambilan
            </p>
            <p className="mt-1 text-[16px] leading-relaxed text-secondary">
              Klinik Premysis Medika — Jl. Kesehatan Raya No. 45, Depok
            </p>
          </div>
          <p className="text-[15.5px] leading-relaxed text-muted">
            Klinik akan menandai pesanan sudah dibayar saat Anda membayar di kasir.
          </p>
        </Kartu>
      )}

      {galat && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-rose)]"
        >
          <IconPeringatan size={19} weight="bold" className="mt-0.5 shrink-0" />
          <span>{galat}</span>
        </p>
      )}

      {/* Tindakan */}
      <div className="space-y-2.5 pb-2">
        {!tunai && !lunas && !menungguVerifikasi && (
          <Tombol size="lg" penuh disabled={sibuk} onClick={() => setTanya(true)}>
            <IconDompet size={20} weight="bold" />
            {ditolak ? 'Kirim Ulang Bukti' : 'Saya Sudah Bayar, Kirim Bukti'}
          </Tombol>
        )}

        <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/pesanan')}>
          <IconPesanan size={20} weight="bold" />
          Ke Pesanan Saya
        </Tombol>
      </div>

      <Konfirmasi
        buka={tanya}
        onTutup={() => setTanya(false)}
        onYa={kirim}
        sibuk={sibuk}
        tone="primary"
        judul="Kirim bukti pembayaran?"
        pesan={`Klinik akan memeriksa bukti transfer sebesar ${fmtRupiah(hitung.harus_dibayar)}. Pastikan foto terlihat jelas.`}
        labelYa="Ya, Kirim Bukti"
      />
    </div>
  )
}
