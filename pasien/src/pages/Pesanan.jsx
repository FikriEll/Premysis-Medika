import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import { fmtRupiah, fmtTanggal } from '../../../shared/format'
import { statusPesanan, statusBayar, labelMetodeBayar, bolehDibatalkan, PESANAN_BERJALAN } from '../lib/status'
import { Kartu, Tombol, Lencana, Kosong, Lembar, Konfirmasi, BarisInfo, JudulSeksi, Memuat } from '../components/ui'
import { KartuPesanan, BarisObat } from '../components/kartu'
import LinimasaPesanan from '../components/Linimasa'
import { IconPesanan, IconLokasi, IconKirim, IconDompet, IconPeringatan, IconWhatsapp } from '../components/Icons'
import { IlustrasiPaket } from '../components/Ilustrasi'

// F-09 Pesanan Saya.
//
// Status memakai bahasa yang mudah dimengerti (lihat lib/status.js),
// daftar dipisah menjadi "Pesanan Berjalan" dan "Pesanan Sebelumnya".
export default function Pesanan() {
  const nav = useNavigate()
  const { pesananSaya, batalkanPesanan, beriToast } = useStore()
  const [detail, setDetail] = useState(null)
  const [memuatDetail, setMemuatDetail] = useState(false)
  const [batal, setBatal] = useState(null)
  const [sibuk, setSibuk] = useState(false)

  const berjalan = pesananSaya.filter((p) => PESANAN_BERJALAN.includes(p.status))
  const selesai = pesananSaya.filter((p) => !PESANAN_BERJALAN.includes(p.status))

  const bukaDetail = async (p) => {
    setDetail(p)
    setMemuatDetail(true)
    try {
      const r = await api.pesananDetail(p.order_number)
      setDetail(r.data)
    } catch (e) {
      beriToast(e.message, 'galat')
    } finally {
      setMemuatDetail(false)
    }
  }

  const lakukanBatal = async () => {
    setSibuk(true)
    try {
      await batalkanPesanan(batal.order_number)
      beriToast('Pesanan Anda sudah dibatalkan.', 'info')
      setBatal(null)
      setDetail(null)
    } catch (e) {
      beriToast(e.message, 'galat')
    } finally {
      setSibuk(false)
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <JudulSeksi>Pesanan Berjalan</JudulSeksi>
        {berjalan.length === 0 ? (
          <Kartu padat>
            <Kosong
              judul="Belum ada pesanan"
              pesan="Pesanan yang Anda buat akan tampil di sini beserta statusnya."
              ilustrasi={<IlustrasiPaket size={136} />}
              aksi={
                <Tombol size="lg" onClick={() => nav('/toko')}>
                  Belanja Sekarang
                </Tombol>
              }
            />
          </Kartu>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {berjalan.map((p) => (
              <li key={p.id}>
                <KartuPesanan pesanan={p} onDetail={() => bukaDetail(p)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {selesai.length > 0 && (
        <section>
          <JudulSeksi>Pesanan Sebelumnya</JudulSeksi>
          <ul className="grid gap-3 lg:grid-cols-2">
            {selesai.map((p) => (
              <li key={p.id}>
                <KartuPesanan pesanan={p} onDetail={() => bukaDetail(p)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <a
        href="https://wa.me/6281211112222?text=Halo%2C%20saya%20ingin%20menanyakan%20pesanan%20saya."
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-3.5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-green-solid)] text-white">
          <IconWhatsapp size={21} weight="bold" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold text-primary">Ada pertanyaan soal pesanan?</span>
          <span className="block text-[15.5px] text-secondary">Hubungi apotek lewat WhatsApp</span>
        </span>
      </a>

      {/* --- Detail pesanan --- */}
      <Lembar
        buka={!!detail}
        onTutup={() => setDetail(null)}
        judul="Detail Pesanan"
        subjudul={detail?.order_number}
        footer={
          detail ? (
            <div className="space-y-2.5">
              {detail.status === 'pending_payment' && (
                <Tombol size="lg" penuh onClick={() => nav(`/pesanan/${detail.order_number}/bayar`)}>
                  <IconDompet size={20} weight="bold" />
                  {detail.payment_method === 'cod' ? 'Lihat Cara Bayar' : 'Bayar Sekarang'}
                </Tombol>
              )}
              {bolehDibatalkan(detail.status) && (
                <Tombol variant="danger" size="lg" penuh onClick={() => setBatal(detail)}>
                  Batalkan Pesanan
                </Tombol>
              )}
              <Tombol variant="secondary" size="lg" penuh onClick={() => setDetail(null)}>
                Tutup
              </Tombol>
            </div>
          ) : null
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[16px] text-secondary">Status pesanan</span>
              <Lencana tone={statusPesanan(detail).tone}>{statusPesanan(detail).label}</Lencana>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[16px] text-secondary">Status pembayaran</span>
              <Lencana tone={statusBayar(detail).tone}>{statusBayar(detail).label}</Lencana>
            </div>

            {memuatDetail ? (
              <Memuat baris={2} />
            ) : (
              <>
                {/* Lacak pesanan */}
                {Array.isArray(detail.timeline) && detail.timeline.length > 0 && (
                  <div className="rounded-[var(--radius-card)] border border-hairline px-4 py-4">
                    <JudulSeksi>Lacak Pesanan</JudulSeksi>
                    <LinimasaPesanan pesanan={detail} />
                  </div>
                )}

                {/* Barang */}
                <div>
                  <JudulSeksi>Barang yang dipesan</JudulSeksi>
                  <div className="divide-y divide-[var(--border-hairline)]">
                    {(detail.items || []).map((d) => (
                      <BarisObat key={d.id} nama={d.product_name} jumlah={d.qty} harga={d.subtotal} />
                    ))}
                  </div>
                </div>

                {/* Cara terima & bayar */}
                <div className="rounded-[var(--radius-card)] border border-hairline px-4 py-1.5">
                  <BarisInfo label="Pengiriman">
                    <span className="inline-flex items-center gap-1.5">
                      {detail.shipping_method?.code === 'PICKUP' ? (
                        <IconLokasi size={17} className="text-muted" />
                      ) : (
                        <IconKirim size={17} className="text-muted" />
                      )}
                      {detail.shipping_method?.name || '-'}
                    </span>
                  </BarisInfo>
                  {detail.shipping_address && detail.shipping_address !== '-' && (
                    <BarisInfo label="Alamat">{detail.shipping_address}</BarisInfo>
                  )}
                  <BarisInfo label="Cara bayar">
                    <span className="inline-flex items-center gap-1.5">
                      <IconDompet size={17} className="text-muted" />
                      {labelMetodeBayar(detail.payment_method)}
                    </span>
                  </BarisInfo>
                  <BarisInfo label="Waktu pesan">
                    <span className="numeric">{fmtTanggal(detail.created_at)}</span>
                  </BarisInfo>
                </div>

                {/* Biaya */}
                <div className="rounded-[var(--radius-card)] border border-hairline px-4 py-1.5">
                  <BarisInfo label="Subtotal">
                    <span className="numeric">{fmtRupiah(detail.subtotal)}</span>
                  </BarisInfo>
                  <BarisInfo label="Ongkos kirim">
                    <span className="numeric">{detail.shipping_cost ? fmtRupiah(detail.shipping_cost) : 'Gratis'}</span>
                  </BarisInfo>
                  {detail.discount_total > 0 && (
                    <BarisInfo label="Diskon promo">
                      <span className="numeric text-[var(--color-signal-green)]">- {fmtRupiah(detail.discount_total)}</span>
                    </BarisInfo>
                  )}
                  <BarisInfo label="Total bayar" className="border-t border-hairline">
                    <span className="numeric text-[20.5px] font-bold text-accent">{fmtRupiah(detail.grand_total)}</span>
                  </BarisInfo>
                </div>
              </>
            )}

            {bolehDibatalkan(detail.status) && (
              <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] surface-sunken px-4 py-3.5 text-[16px] leading-relaxed text-secondary">
                <IconPeringatan size={18} weight="bold" className="mt-0.5 shrink-0 text-muted" />
                <span>
                  Pesanan masih menunggu pembayaran, jadi Anda dapat membatalkannya sendiri. Setelah
                  pembayaran dikonfirmasi apotek, pembatalan hanya bisa dilakukan oleh apotek.
                </span>
              </p>
            )}
          </div>
        )}
      </Lembar>

      <Konfirmasi
        buka={!!batal}
        onTutup={() => setBatal(null)}
        onYa={lakukanBatal}
        sibuk={sibuk}
        judul="Batalkan Pesanan?"
        pesan={
          batal
            ? `Apakah Anda yakin ingin membatalkan pesanan ${batal.order_number}? Pesanan yang dibatalkan tidak dapat dikembalikan.`
            : ''
        }
        labelYa="Ya, Batalkan"
      />
    </div>
  )
}
