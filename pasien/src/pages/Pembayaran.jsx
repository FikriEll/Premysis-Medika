import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import { fmtRupiah, fmtTanggal } from '../../../shared/format'
import { statusBayar, labelMetodeBayar } from '../lib/status'
import { Kartu, Tombol, Lencana, Kosong, BarisInfo, JudulSeksi, Memuat, Kolom, AreaTeks } from '../components/ui'
import { BarisObat } from '../components/kartu'
import {
  IconDompet, IconPeringatan, IconCentangBulat, IconLokasi, IconPesanan, IconKamera,
} from '../components/Icons'
import { IlustrasiPaket } from '../components/Ilustrasi'

// Muat skrip Snap Midtrans sekali saja (kalau tersedia).
function muatSnap(clientKey, produksi) {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve(window.snap)
    const s = document.createElement('script')
    s.src = produksi
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
    s.setAttribute('data-client-key', clientKey)
    s.onload = () => resolve(window.snap)
    s.onerror = () => reject(new Error('Gagal memuat kanal pembayaran.'))
    document.body.appendChild(s)
  })
}

// F-08b Pembayaran.
//
// Menampilkan ringkasan pesanan + cara membayar:
//   - Transfer / Online : tombol bayar (Midtrans Snap) + tombol cek status
//   - COD               : bayar tunai saat pesanan diterima
// Pesanan yang memerlukan resep dapat mengunggah foto resep di sini.
export default function Pembayaran() {
  const { nomor } = useParams()
  const nav = useNavigate()
  const { beriToast, cekPembayaran, pesananSaya, segarkanPesanan } = useStore()

  const [data, setData] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState(false)
  const [berkasResep, setBerkasResep] = useState(null)
  const [catatanResep, setCatatanResep] = useState('')

  const muat = async () => {
    try {
      const r = await api.pembayaran(nomor)
      setData(r)
      setGalat('')
    } catch (e) {
      setGalat(e.message)
    } finally {
      setMemuat(false)
    }
  }

  useEffect(() => {
    muat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomor])

  const pesanan = data?.order
  const tunai = pesanan?.payment_method === 'cod'
  const lunas = pesanan?.payment_status === 'paid'
  const perluResep = pesanan?.status === 'awaiting_prescription'

  const bayarOnline = async () => {
    setSibuk(true)
    try {
      const snap = await muatSnap(data.midtrans_client_key, data.is_production)
      await new Promise((resolve, reject) => {
        snap.pay(data.snap_token, {
          onSuccess: () => resolve(),
          onPending: () => resolve(),
          onError: () => reject(new Error('Pembayaran gagal diproses.')),
          onClose: () => resolve(),
        })
      })
      await cekPembayaran(nomor)
      await muat()
      beriToast('Status pembayaran diperbarui.', 'sukses')
    } catch (e) {
      beriToast(e.message, 'galat')
    } finally {
      setSibuk(false)
    }
  }

  const cek = async () => {
    setSibuk(true)
    try {
      await cekPembayaran(nomor)
      await muat()
      beriToast('Status pembayaran diperbarui.', 'sukses')
    } catch (e) {
      beriToast(e.message, 'galat')
    } finally {
      setSibuk(false)
    }
  }

  // Unggah resep: buat pengajuan resep melalui endpoint retur? Tidak —
  // resep diunggah saat checkout. Di sini kita hanya mengingatkan pasien
  // menghubungi apotek bila belum sempat mengunggah.
  const kirimResep = async () => {
    if (!berkasResep) {
      setGalat('Pilih foto resep dulu.')
      return
    }
    beriToast('Kirim resep lewat WhatsApp apotek agar segera diverifikasi.', 'info')
  }

  if (memuat) return <Memuat baris={4} />

  if (galat || !pesanan) {
    return (
      <Kartu padat>
        <Kosong
          judul="Pesanan tidak ditemukan"
          pesan={galat || 'Buka menu Pesanan untuk melihat daftar pesanan Anda.'}
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

  return (
    <div className="mx-auto w-full max-w-[820px] space-y-5">
      {/* Ringkasan pesanan */}
      <Kartu className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="numeric text-[15.5px] text-secondary">{pesanan.order_number}</p>
            <p className="mt-0.5 text-[17px] font-semibold text-primary">Ringkasan Pesanan</p>
          </div>
          <Lencana tone={statusBayar(pesanan).tone}>{statusBayar(pesanan).label}</Lencana>
        </div>
        <div className="divide-y divide-[var(--border-hairline)]">
          {(pesanan.items || []).map((d) => (
            <BarisObat key={d.id} nama={d.product_name} jumlah={d.qty} harga={d.subtotal} />
          ))}
        </div>
        <div className="border-t border-hairline pt-2">
          <BarisInfo label="Subtotal">
            <span className="numeric">{fmtRupiah(pesanan.subtotal)}</span>
          </BarisInfo>
          <BarisInfo label="Ongkos kirim">
            <span className="numeric">{pesanan.shipping_cost ? fmtRupiah(pesanan.shipping_cost) : 'Gratis'}</span>
          </BarisInfo>
          {pesanan.discount_total > 0 && (
            <BarisInfo label="Diskon promo">
              <span className="numeric text-[var(--color-signal-green)]">- {fmtRupiah(pesanan.discount_total)}</span>
            </BarisInfo>
          )}
          <BarisInfo label="Jumlah yang harus dibayar" className="border-t border-hairline">
            <span className="numeric text-[21px] font-bold text-accent">{fmtRupiah(pesanan.grand_total)}</span>
          </BarisInfo>
        </div>
        <p className="text-[15px] leading-relaxed text-muted">
          Batas pembayaran: {fmtTanggal(pesanan.expires_at)}
        </p>
      </Kartu>

      {/* Sudah lunas */}
      {lunas && (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-green-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-green)]">
          <IconCentangBulat size={21} weight="bold" className="mt-0.5 shrink-0" />
          <span>Pembayaran Anda sudah dikonfirmasi. Pesanan akan segera diproses.</span>
        </p>
      )}

      {/* Perlu unggah resep */}
      {perluResep && (
        <Kartu className="space-y-3">
          <JudulSeksi>Unggah Resep</JudulSeksi>
          <p className="text-[16px] leading-relaxed text-secondary">
            Pesanan Anda memuat obat yang memerlukan resep. Unggah foto resep agar apotek dapat
            memverifikasi dan memproses pesanan.
          </p>
          <label
            htmlFor="resep"
            className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-strong surface-sunken px-4 py-5 text-center"
          >
            <IconKamera size={26} weight="bold" className="text-accent" />
            <span className="text-[16px] font-semibold text-primary">
              {berkasResep?.name || 'Ketuk untuk pilih foto resep'}
            </span>
            <span className="text-[15px] text-secondary">JPG, PNG, atau PDF</span>
          </label>
          <input
            id="resep"
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            onChange={(e) => setBerkasResep(e.target.files?.[0] || null)}
          />
          <Kolom label="Catatan (boleh dikosongkan)" htmlFor="catatanResep">
            <AreaTeks
              id="catatanResep"
              value={catatanResep}
              onChange={(e) => setCatatanResep(e.target.value)}
              placeholder="Contoh: resep dari dr. Andi, 20 April"
            />
          </Kolom>
          <Tombol size="lg" penuh onClick={kirimResep} disabled={!berkasResep}>
            Kirim Resep
          </Tombol>
        </Kartu>
      )}

      {/* Instruksi COD */}
      {tunai && !lunas && (
        <Kartu className="space-y-3">
          <JudulSeksi>Bayar di Tempat (COD)</JudulSeksi>
          <p className="text-[16px] leading-relaxed text-secondary">
            Pesanan ini dibayar tunai saat diterima. Siapkan uang pas sebesar
            <strong className="font-semibold text-primary"> {fmtRupiah(pesanan.grand_total)}</strong>.
          </p>
          <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3.5">
            <p className="flex items-center gap-2 text-[16px] font-semibold text-primary">
              <IconLokasi size={18} weight="bold" className="text-accent" />
              Alamat pengambilan
            </p>
            <p className="mt-1 text-[16px] leading-relaxed text-secondary">
              Apotek Premysis Medika — Jl. Kesehatan Raya No. 45, Depok
            </p>
          </div>
        </Kartu>
      )}

      {/* Instruksi pembayaran online */}
      {!tunai && !lunas && (
        <Kartu className="space-y-3">
          <JudulSeksi>Pembayaran</JudulSeksi>
          <p className="text-[16px] leading-relaxed text-secondary">
            Tekan tombol di bawah untuk membayar lewat transfer bank atau kanal pembayaran online
            yang tersedia. Setelah membayar, tekan "Cek Status Pembayaran".
          </p>
          {data.snap_token?.startsWith('SNAP-MOCK') && (
            <p className="flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-blue-soft)] px-3.5 py-2.5 text-[15.5px] leading-relaxed text-[var(--color-signal-blue)]">
              <IconPeringatan size={18} weight="bold" className="mt-0.5 shrink-0" />
              <span>
                Mode pengembangan: kanal pembayaran belum dikonfigurasi, jadi tombol bayar hanya
                menyimulasikan pembayaran. Tekan "Cek Status Pembayaran" untuk menandai lunas.
              </span>
            </p>
          )}
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
        {!tunai && !lunas && data.snap_token && (
          <Tombol size="lg" penuh disabled={sibuk} onClick={bayarOnline}>
            <IconDompet size={20} weight="bold" />
            {sibuk ? 'Memproses...' : 'Bayar Sekarang'}
          </Tombol>
        )}
        {!lunas && (
          <Tombol variant="secondary" size="lg" penuh disabled={sibuk} onClick={cek}>
            Cek Status Pembayaran
          </Tombol>
        )}
        <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/pesanan')}>
          <IconPesanan size={20} weight="bold" />
          Ke Pesanan Saya
        </Tombol>
      </div>
    </div>
  )
}
