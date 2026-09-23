import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtTanggal } from '../../../shared/format'
import { Kartu, Tombol, Kosong, Lencana, JudulSeksi } from '../components/ui'
import { IconResep, IconToko, IconPeringatan, IconInfo, IconPil } from '../components/Icons'
import { IlustrasiObat } from '../components/Ilustrasi'

// F-05 Resep Digital + US-03.
// Resep aktif pasien dengan tombol "Beli Obat" yang mengisi keranjang
// dari produk terkait. Jika obat tidak ada di katalog, tombol nonaktif
// dan muncul info "hubungi klinik" - sesuai PRD F-05 & BR-05.
export default function Resep() {
  const nav = useNavigate()
  const { resepSaya, cariProduk, tambahKeranjang, beriToast, bolehBeli, idProdukResepAktif } = useStore()

  const aktif = resepSaya.filter((r) => r.status === 'Aktif')
  const lain = resepSaya.filter((r) => r.status !== 'Aktif')

  const beliSemua = (r) => {
    let masuk = 0
    let dilewati = 0
    for (const d of r.detail || []) {
      const p = d.id_produk ? cariProduk(d.id_produk) : null
      if (p && p.status === 'Aktif' && bolehBeli(p)) {
        tambahKeranjang(p.id, d.jumlah || 1)
        masuk++
      } else {
        dilewati++
      }
    }
    if (masuk > 0) {
      beriToast(`${masuk} obat masuk keranjang.${dilewati ? ` ${dilewati} obat perlu dibeli di klinik.` : ''}`, 'sukses')
      nav('/keranjang')
    } else {
      beriToast('Obat pada resep ini belum tersedia di toko. Silakan hubungi klinik.', 'info')
    }
  }

  const beliSatu = (d) => {
    const p = d.id_produk ? cariProduk(d.id_produk) : null
    if (!p) {
      beriToast('Obat ini tidak ada di katalog toko. Silakan hubungi klinik.', 'info')
      return
    }
    if (p.stok <= 0) {
      beriToast(`Stok ${p.nama} sedang habis. Silakan hubungi klinik.`, 'galat')
      return
    }
    tambahKeranjang(p.id, d.jumlah || 1)
    beriToast(`${p.nama} masuk keranjang.`, 'sukses')
  }

  return (
    <div className="space-y-5">
      <p className="text-[17px] leading-relaxed text-secondary">
        Resep dari bidan tampil di sini. Anda dapat langsung membeli obat yang tersedia di toko.
      </p>

      {resepSaya.length === 0 ? (
        <Kartu padat>
          <Kosong
            judul="Belum ada resep"
            pesan="Resep akan muncul setelah bidan mencatat hasil pemeriksaan Anda."
            ilustrasi={<IlustrasiObat size={140} />}
          />
        </Kartu>
      ) : (
        <>
          {aktif.length > 0 && (
            <section>
              <JudulSeksi>Resep aktif</JudulSeksi>
              <ul className="space-y-3">
                {aktif.map((r) => (
                  <li key={r.id}>
                    <Kartu className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[18.5px] font-bold tracking-tight text-primary">Resep #{r.id}</p>
                          <p className="numeric mt-0.5 text-[15px] text-muted">{fmtTanggal(r.tanggal)}</p>
                        </div>
                        <Lencana tone="green">Aktif</Lencana>
                      </div>

                      <ul className="divide-y divide-[var(--border-hairline)] border-t border-hairline">
                        {(r.detail || []).map((d) => {
                          const p = d.id_produk ? cariProduk(d.id_produk) : null
                          const tersedia = p && p.status === 'Aktif' && p.stok > 0
                          const bisaDibeli = tersedia && bolehBeli(p)
                          return (
                            <li key={d.id} className="py-3">
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full permukaan-1 text-accent">
                                  <IconPil size={19} weight="bold" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[17px] font-semibold text-primary">{d.nama_obat}</p>
                                  <p className="mt-0.5 text-[15.5px] text-secondary">
                                    {d.dosis} · {d.jumlah} unit
                                  </p>
                                  <p className="mt-0.5 text-[15.5px] text-muted">{d.aturan_pakai}</p>

                                  {!p && (
                                    <p className="mt-2 inline-flex items-start gap-1.5 text-[15px] text-[var(--color-signal-amber)]">
                                      <IconPeringatan size={14} className="mt-px shrink-0" />
                                      Tidak ada di katalog toko. Hubungi klinik untuk mengambil obat ini.
                                    </p>
                                  )}
                                  {p && !tersedia && (
                                    <p className="mt-2 inline-flex items-start gap-1.5 text-[15px] text-[var(--color-signal-amber)]">
                                      <IconPeringatan size={14} className="mt-px shrink-0" />
                                      Stok sedang habis. Hubungi klinik.
                                    </p>
                                  )}
                                </div>

                                <Tombol
                                  size="sm"
                                  variant={bisaDibeli ? 'primary' : 'secondary'}
                                  disabled={!bisaDibeli}
                                  onClick={() => beliSatu(d)}
                                  className="shrink-0"
                                >
                                  Beli
                                </Tombol>
                              </div>
                            </li>
                          )
                        })}
                      </ul>

                      <Tombol penuh onClick={() => beliSemua(r)}>
                        <IconToko size={20} weight="bold" />
                        Beli Obat dari Resep Ini
                      </Tombol>
                    </Kartu>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {lain.length > 0 && (
            <section>
              <JudulSeksi>Resep selesai</JudulSeksi>
              <ul className="space-y-2.5">
                {lain.map((r) => (
                  <li key={r.id}>
                    <Kartu className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full surface-sunken text-muted">
                        <IconResep size={21} weight="bold" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[17px] font-semibold text-primary">Resep #{r.id}</p>
                        <p className="numeric text-[15px] text-muted">
                          {fmtTanggal(r.tanggal)} · {r.detail?.length || 0} obat
                        </p>
                      </div>
                      <Lencana tone="neutral">{r.status}</Lencana>
                    </Kartu>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="flex items-start gap-2 rounded-[var(--radius-card)] surface-sunken px-3.5 py-3 text-[15px] leading-relaxed text-secondary">
        <IconInfo size={16} className="mt-px shrink-0" />
        <span>
          Obat bertanda resep hanya dapat dibeli bila resep Anda masih aktif. Untuk obat yang
          tidak tersedia di toko, silakan ambil langsung di klinik.
        </span>
      </p>
    </div>
  )
}
