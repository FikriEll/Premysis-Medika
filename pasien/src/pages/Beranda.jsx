import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah } from '../../../shared/format'
import { Kartu, JudulSeksi, Lencana, Tombol, Kosong, TautanLanjut, KartuAksi } from '../components/ui'
import { KartuProduk } from '../components/kartu'
import {
  IconBelanja, IconKeranjang, IconPesanan, IconProfil,
  IconWhatsapp, IconLokasi, IconSparkle, IconToko,
} from '../components/Icons'
import { IlustrasiKeranjang } from '../components/Ilustrasi'
import { statusPesanan } from '../lib/status'

// F-02 Beranda - e-commerce.
//
// Struktur sengaja sederhana: sapaan -> pencarian/kategori ->
// promo -> produk unggulan -> pesanan terakhir -> informasi apotek.
// Tidak ramai, maksimal 3-5 tindakan utama dalam satu layar.
const AKSES_CEPAT = [
  { to: '/toko', judul: 'Belanja Obat', ket: 'Obat & kebutuhan kesehatan', Ikon: IconBelanja, warna: 'permukaan-mint' },
  { to: '/keranjang', judul: 'Keranjang', ket: 'Barang yang akan dibeli', Ikon: IconKeranjang, warna: 'permukaan-sky' },
  { to: '/pesanan', judul: 'Pesanan Saya', ket: 'Lacak status pesanan', Ikon: IconPesanan, warna: 'permukaan-peach' },
  { to: '/profil', judul: 'Profil Saya', ket: 'Data diri dan alamat', Ikon: IconProfil, warna: 'permukaan-honey' },
]

export default function Beranda() {
  const nav = useNavigate()
  const { user, produkUnggulan, promo, pesananSaya, kategori, beriToast, tambahKeranjang } = useStore()

  const pesananTerakhir = pesananSaya[0]
  const jam = new Date().getHours()
  const sapaan = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 19 ? 'Selamat sore' : 'Selamat malam'
  const namaDepan = (user?.name || '').split(' ')[0]
  const tamu = !user

  const tambah = async (p) => {
    if (tamu) {
      beriToast('Masuk dulu untuk menambah ke keranjang.', 'info')
      nav('/masuk', { state: { dari: '/' } })
      return
    }
    try {
      await tambahKeranjang(p.id, 1)
      beriToast(`${p.name} masuk keranjang.`, 'sukses')
    } catch (e) {
      beriToast(e.message, 'galat')
    }
  }

  return (
    <div className="space-y-8">
      {/* --- Sapaan / hero --- */}
      <section className="permukaan-sambutan relative overflow-hidden rounded-[var(--radius-shell)] border border-hairline">
        <div className="relative z-10 max-w-[62%] px-6 py-7 sm:max-w-[58%] sm:px-9 sm:py-10 lg:max-w-[55%]">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-primary sm:text-[32px]">
            {tamu ? `${sapaan}!` : `Halo, ${namaDepan}`}
          </h1>
          <p className="mt-2.5 max-w-[46ch] text-[16.5px] leading-relaxed text-secondary sm:text-[18px]">
            {tamu ? 'Belanja obat & kebutuhan kesehatan, diantar sampai rumah.' : 'Mau belanja obat apa hari ini?'}
          </p>
          {tamu && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => nav('/toko')}
                className="inline-flex min-h-13 items-center justify-center rounded-[var(--radius-control)] bg-accent px-6 text-[17px] font-semibold text-[var(--accent-contrast)] hover:brightness-95"
              >
                Mulai Belanja
              </button>
              <button
                type="button"
                onClick={() => nav('/masuk')}
                className="inline-flex min-h-13 items-center justify-center rounded-[var(--radius-control)] border border-hairline surface-raised px-6 text-[17px] font-semibold text-primary hover:surface-hover"
              >
                Masuk
              </button>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute -bottom-3 -right-2 opacity-95 sm:-bottom-5 sm:right-4">
          <IlustrasiKeranjang size={180} />
        </div>
      </section>

      {/* --- Akses cepat --- */}
      <section>
        <JudulSeksi>Akses Cepat</JudulSeksi>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {AKSES_CEPAT.map((a) => (
            <KartuAksi key={a.to} Ikon={a.Ikon} judul={a.judul} ket={a.ket} warna={a.warna} onClick={() => nav(a.to)} />
          ))}
        </div>
      </section>

      {/* --- Kategori --- */}
      {kategori.length > 0 && (
        <section>
          <JudulSeksi aksi={<TautanLanjut onClick={() => nav('/toko')}>Lihat semua</TautanLanjut>}>
            Kategori
          </JudulSeksi>
          <div className="flex flex-wrap gap-2">
            {kategori.slice(0, 8).map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => nav(`/toko?kategori=${k.slug}`)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline surface-raised px-4 text-[16px] font-semibold text-primary hover:border-strong"
              >
                <IconToko size={18} weight="bold" className="text-accent" />
                {k.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* --- Promo --- */}
      {promo.length > 0 && (
        <section>
          <JudulSeksi aksi={<TautanLanjut onClick={() => nav('/promo')}>Semua promo</TautanLanjut>}>
            Promo Aktif
          </JudulSeksi>
          <ul className="grid gap-2.5 lg:grid-cols-3">
            {promo.slice(0, 3).map((p) => (
              <li key={p.id}>
                <Kartu className="flex h-full items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
                    <IconSparkle size={22} weight="bold" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] font-semibold text-primary">{p.name}</p>
                    <p className="mt-0.5 text-[15.5px] leading-relaxed text-secondary">
                      {p.description || `Pakai kode ${p.code}`}
                    </p>
                    <Lencana tone="accent" className="mt-2">
                      Kode: {p.code}
                    </Lencana>
                  </div>
                </Kartu>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- Produk unggulan --- */}
      <section>
        <JudulSeksi aksi={<TautanLanjut onClick={() => nav('/toko')}>Semua produk</TautanLanjut>}>
          Produk Unggulan
        </JudulSeksi>
        {produkUnggulan.length === 0 ? (
          <Kartu padat>
            <Kosong
              judul="Belum ada produk unggulan"
              pesan="Lihat seluruh katalog obat di halaman Toko."
              ilustrasi={<IlustrasiKeranjang size={132} />}
              aksi={<Tombol size="lg" onClick={() => nav('/toko')}>Buka Toko</Tombol>}
            />
          </Kartu>
        ) : (
          <>
            {/* Ponsel: daftar mendatar satu kolom */}
            <ul className="space-y-3 lg:hidden">
              {produkUnggulan.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <Kartu padat>
                    <div className="flex items-center gap-3.5 p-4">
                      <button
                        type="button"
                        onClick={() => nav(`/produk/${p.slug}`)}
                        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] permukaan-1 text-accent"
                      >
                        {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <IconBelanja size={26} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => nav(`/produk/${p.slug}`)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-[17.5px] font-semibold leading-snug text-primary">{p.name}</span>
                        <span className="numeric mt-1 block text-[18px] font-bold text-primary">{fmtRupiah(p.price)}</span>
                        <span className="mt-0.5 block text-[15px] text-secondary">
                          {p.in_stock ? `Tersedia ${p.stock} ${p.unit}` : 'Stok habis'}
                        </span>
                      </button>
                      <Tombol
                        size="sm"
                        disabled={!p.in_stock}
                        onClick={() => tambah(p)}
                        aria-label={`Tambah ${p.name} ke keranjang`}
                      >
                        <IconKeranjang size={18} weight="bold" />
                        Tambah
                      </Tombol>
                    </div>
                  </Kartu>
                </li>
              ))}
            </ul>

            {/* Layar besar: grid kartu tegak */}
            <ul className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-4">
              {produkUnggulan.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <KartuProduk
                    ringkas
                    produk={p}
                    onBuka={() => nav(`/produk/${p.slug}`)}
                    onTambah={tambah}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* --- Pesanan terakhir --- */}
      {pesananTerakhir && (
        <section>
          <JudulSeksi aksi={<TautanLanjut onClick={() => nav('/pesanan')}>Semua pesanan</TautanLanjut>}>
            Pesanan Terakhir
          </JudulSeksi>
          <Kartu className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="numeric text-[15.5px] text-secondary">{pesananTerakhir.order_number}</p>
                <p className="mt-0.5 text-[17px] font-bold text-primary">
                  {fmtRupiah(pesananTerakhir.grand_total)}
                </p>
              </div>
              <Lencana tone={statusPesanan(pesananTerakhir).tone}>
                {statusPesanan(pesananTerakhir).label}
              </Lencana>
            </div>
            <Tombol variant="secondary" penuh onClick={() => nav('/pesanan')}>
              <IconPesanan size={19} weight="bold" />
              Lihat Pesanan Saya
            </Tombol>
          </Kartu>
        </section>
      )}

      {/* --- Informasi apotek ---
          Di versi web, tautan informasi sudah pindah ke footer tiga
          kolom, jadi di sini cukup satu band kontak yang ringkas.
          Tidak ada lagi daftar tautan ganda seperti versi aplikasi. */}
      <section className="overflow-hidden rounded-[var(--radius-shell)] border border-hairline surface-raised">
        <div className="grid items-center gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full permukaan-mint">
              <IconLokasi size={26} weight="bold" />
            </span>
            <div className="min-w-0">
              <p className="text-[19px] font-bold text-primary">Butuh bantuan memilih obat?</p>
              <p className="mt-1.5 text-[16.5px] leading-relaxed text-secondary">
                Apoteker kami siap membantu. Datang ke apotek atau hubungi kami - pesanan Anda juga
                bisa diantar sampai rumah.
              </p>
              <p className="mt-3 flex items-start gap-2.5 text-[16px] leading-relaxed text-secondary">
                <IconLokasi size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                <span>Jl. Kesehatan Raya No. 45, Depok, Jawa Barat</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2.5 sm:w-[210px]">
            <a
              href="https://wa.me/6281211112222?text=Halo%2C%20saya%20ingin%20bertanya%20soal%20pesanan%20obat."
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-[var(--radius-control)] bg-[var(--color-signal-green-solid)] px-5 text-[17px] font-semibold text-white hover:brightness-95"
            >
              <IconWhatsapp size={21} weight="bold" />
              Chat WhatsApp
            </a>
            <button
              type="button"
              onClick={() => nav('/kontak')}
              className="inline-flex min-h-13 items-center justify-center rounded-[var(--radius-control)] border border-hairline px-5 text-[17px] font-semibold text-primary hover:surface-hover"
            >
              Lihat Kontak &amp; Peta
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
