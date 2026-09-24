import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah } from '../../../shared/format'
import { Kartu, JudulSeksi, Lencana, Tombol, Kosong, TautanLanjut, KartuAksi } from '../components/ui'
import { KartuProduk } from '../components/kartu'
import {
  IconBelanja, IconKeranjang, IconPesanan, IconProfil,
  IconWhatsapp, IconLokasi, IconSparkle, IconToko,
  IconPerisai, IconKirim, IconPil, IconBuku, IconDiskusi,
  IconJam, IconTelepon, IconBintang, IconCentangBulat,
  IconKartu, IconObat, IconPerawatan, IconTanya, IconPonsel,
  IconPeta, IconLayanan, IconPanahKanan,
} from '../components/Icons'
import { IlustrasiKeranjang } from '../components/Ilustrasi'
import { statusPesanan } from '../lib/status'
import Carousel from '../components/Carousel'
import LogoKlinik from '../components/LogoKlinik'
import { JanjiLayanan, TanyaJawab, TestimoniSingkat, SuratKabar } from '../components/BagianBeranda'
import {
  LencanaPil, JudulBagian, KartuFitur, KartuInfo, PilLayanan, BarisCentang, TautanPanah,
} from '../components/BagianLanding'

// =============================================================
// F-02 Beranda - landing page storefront.
//
// Susunan bagian mengikuti referensi "Live Oak Pharmacy", lalu
// disesuaikan dengan data & fitur Klinik Premysis Medika:
//   hero -> trust bar -> kenapa kami -> produk unggulan ->
//   perbandingan -> kategori -> promo -> janji layanan ->
//   testimoni -> tanya jawab -> layanan digital -> info grid ->
//   pesanan terakhir -> surat kabar -> kontak.
// =============================================================

// Gambar mengikuti peta aset referensi.
const GAMBAR_HERO =
  'https://images.unsplash.com/photo-1576602976047-174e57a47881?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
const GAMBAR_LAYANAN =
  'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
const AVATAR = [
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=64&h=64',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&h=64',
]
const GAMBAR_VITAMIN =
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80'
const GAMBAR_RESEP =
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=150&q=80'

// Navigasi pintasan gaya referensi.
const AKSES_CEPAT = [
  { to: '/toko', judul: 'Belanja Obat', ket: 'Obat & kebutuhan kesehatan', Ikon: IconBelanja, warna: 'permukaan-mint' },
  { to: '/keranjang', judul: 'Keranjang', ket: 'Barang yang akan dibeli', Ikon: IconKeranjang, warna: 'permukaan-sky' },
  { to: '/pesanan', judul: 'Pesanan Saya', ket: 'Lacak status pesanan', Ikon: IconPesanan, warna: 'permukaan-peach' },
  { to: '/profil', judul: 'Profil Saya', ket: 'Data diri dan alamat', Ikon: IconProfil, warna: 'permukaan-honey' },
]

// Peta ikon janji layanan (nama dari server).
const IKON_JANJI = { perisai: IconPerisai, buku: IconBuku, chat: IconDiskusi, kirim: IconKirim }

// Perbandingan: apotek jaringan vs layanan kami (gaya tabel referensi).
const PERBANDINGAN = [
  { fitur: 'Konsultasi apoteker', kami: 'Gratis lewat WhatsApp', lain: 'Antre di loket' },
  { fitur: 'Pengiriman ke rumah', kami: 'Hari yang sama, area kota', lain: 'Ambil sendiri' },
  { fitur: 'Obat asli & terdaftar', kami: 'Selalu BPOM resmi', lain: 'Tidak dijamin' },
  { fitur: 'Riwayat & resep', kami: 'Tersimpan di akun Anda', lain: 'Catatan kertas' },
]

// Enam kartu informasi (gaya grid referensi).
const INFO_GRID = [
  { Ikon: IconPerisai, judul: 'Obat Asli & Terdaftar', ket: 'Semua produk dari distributor resmi dan terdaftar BPOM.' },
  { Ikon: IconKirim, judul: 'Antar Cepat Sampai Rumah', ket: 'Kurir instan area kota, JNE untuk luar kota.' },
  { Ikon: IconDiskusi, judul: 'Konsultasi Gratis', ket: 'Apoteker siap membantu memilih obat yang tepat.' },
  { Ikon: IconPil, judul: 'Dikemas Apoteker', ket: 'Setiap pesanan diperiksa dan dikemas apoteker.' },
  { Ikon: IconKartu, judul: 'Pembayaran Aman', ket: 'Bayar lewat Midtrans: transfer, e-wallet, atau VA.' },
  { Ikon: IconPeta, judul: 'Lokasi Mudah Dijangkau', ket: 'Datang langsung ke klinik atau minta diantar.' },
]

// Langkah layanan digital (gaya bagian gelap referensi).
const LANGKAH_DIGITAL = [
  { Ikon: IconBelanja, judul: 'Pesan', ket: 'Pilih obat dari katalog dan masukkan keranjang.' },
  { Ikon: IconJam, judul: 'Pengingat', ket: 'Simpan jadwal minum obat di akun Anda.' },
  { Ikon: IconKeranjang, judul: 'Pesan Ulang', ket: 'Pesan lagi obat rutin hanya dalam beberapa ketukan.' },
  { Ikon: IconWhatsapp, judul: 'Tanya Apoteker', ket: 'Konsultasi langsung lewat WhatsApp, tanpa biaya.' },
]

function susunSlide(promo) {
  if (promo.length > 0) {
    const warna = ['permukaan-sambutan', 'permukaan-mint', 'permukaan-sky', 'permukaan-peach', 'permukaan-honey']
    return promo.slice(0, 5).map((p, i) => ({
      kunci: `promo-${p.id}`,
      label: 'Promo Aktif',
      judul: p.name,
      isi: p.description || `Pakai kode ${p.code} saat membayar dan dapatkan potongan harga.`,
      aksi: 'Pakai Promo',
      warna: warna[i % warna.length],
      kePromo: true,
      kode: p.code,
    }))
  }

  return [
    {
      kunci: 'layanan-antar',
      label: 'Antar ke Rumah',
      judul: 'Obat diantar sampai depan pintu',
      isi: 'Pesan lewat website, apoteker menyiapkan, lalu kurir mengantar ke alamat Anda.',
      aksi: 'Mulai Belanja',
      warna: 'permukaan-sambutan',
      keToko: true,
      ilustrasi: <IlustrasiKeranjang size={150} />,
    },
    {
      kunci: 'layanan-konsultasi',
      label: 'Konsultasi Gratis',
      judul: 'Tanya apoteker tanpa biaya tambahan',
      isi: 'Bingung dosis atau aturan pakai? Tanyakan lewat WhatsApp sebelum membeli.',
      aksi: 'Lihat Katalog',
      warna: 'permukaan-mint',
      keToko: true,
    },
  ]
}

export default function Beranda() {
  const nav = useNavigate()
  const {
    user, produkUnggulan, promo, pesananSaya, kategori, janji, faq, testimoni,
    pengaturan, beriToast, tambahKeranjang,
  } = useStore()

  const pesananTerakhir = pesananSaya[0]
  const jam = new Date().getHours()
  const sapaan = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 19 ? 'Selamat sore' : 'Selamat malam'
  const namaDepan = (user?.name || '').split(' ')[0]
  const tamu = !user

  const namaKlinik = pengaturan?.site_name || 'Klinik Premysis Medika'
  const tagline = pengaturan?.site_tagline || 'Obat lengkap, cepat & terpercaya'
  const alamat = pengaturan?.address || 'Jl. Kesehatan Raya No. 45, Depok, Jawa Barat'
  const whatsapp = (pengaturan?.whatsapp || '6281211112222').replace(/[^0-9]/g, '')
  const telepon = pengaturan?.phone || '0812-1111-2222'

  const slide = susunSlide(promo)

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

  const aksiSlide = (s) => {
    if (s.keToko) nav('/toko')
    else nav('/promo')
  }

  return (
    <div className="space-y-16 pb-4 sm:space-y-20">
      {/* ============ 1. HERO ============ */}
      <section className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Kiri: teks */}
          <div className="reveal">
            <LencanaPil dot>Melayani Depok &amp; sekitarnya</LencanaPil>

            <h1 className="mt-6 text-[34px] font-medium leading-[1.08] tracking-tight text-heading sm:text-[44px] lg:text-[50px]">
              Dikelola lokal.
              <br />
              <em className="italic">Fokus pada Anda.</em>
            </h1>

            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-secondary sm:text-[19px]">
              {tamu
                ? `${sapaan}! Belanja obat & kebutuhan kesehatan dengan antar `
                : `Halo, ${namaDepan}. Belanja obat & kebutuhan kesehatan dengan antar `}
              <em className="font-serif italic text-heading">gratis</em> sampai rumah Anda.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => nav('/toko')}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-accent px-7 text-[16.5px] font-semibold text-[var(--accent-contrast)] transition-[filter,transform] hover:brightness-110 active:translate-y-px"
              >
                Mulai Belanja
                <IconPanahKanan size={18} weight="bold" />
              </button>
              {tamu ? (
                <button
                  type="button"
                  onClick={() => nav('/masuk')}
                  className="inline-flex min-h-13 items-center justify-center rounded-full border border-hairline surface-raised px-7 text-[16.5px] font-semibold text-primary transition-colors hover:surface-hover"
                >
                  Masuk
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => nav('/pesanan')}
                  className="inline-flex min-h-13 items-center justify-center rounded-full border border-hairline surface-raised px-7 text-[16.5px] font-semibold text-primary transition-colors hover:surface-hover"
                >
                  Pesanan Saya
                </button>
              )}
            </div>

            {/* Bukti sosial */}
            <div className="mt-7 flex items-center gap-3">
              <span className="flex -space-x-2.5">
                {AVATAR.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-9 w-9 rounded-full border-2 border-[var(--surface-canvas)] object-cover"
                  />
                ))}
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--surface-canvas)] bg-[var(--accent-soft)] text-[13px] font-bold text-accent">
                  4.9
                </span>
              </span>
              <span className="text-[15px] leading-tight text-secondary">
                <strong className="block font-semibold text-heading">Dipercaya warga</strong>
                {testimoni.length > 0 ? `${testimoni.length} ulasan pelanggan` : 'Ribuan pesanan terkirim'}
              </span>
            </div>
          </div>

          {/* Kanan: gambar + kartu melayang */}
          <div className="relative lg:h-[600px]">
            <div className="relative h-[320px] overflow-hidden rounded-[var(--radius-shell)] sm:h-[420px] lg:h-full">
              <img
                src={GAMBAR_HERO}
                alt="Apoteker Klinik Premysis Medika menyiapkan pesanan obat"
                className="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-1000 hover:scale-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent" aria-hidden="true" />
            </div>

            {/* Kartu melayang 1 */}
            <div className="animate-float absolute -left-2 top-8 hidden w-[220px] rounded-[var(--radius-card)] border border-hairline surface-raised p-4 shadow-lift sm:block lg:-left-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
                <IconKirim size={20} weight="bold" />
              </span>
              <p className="mt-3 text-[15px] font-semibold text-heading">Antar gratis</p>
              <p className="mt-0.5 text-[14px] leading-snug text-secondary">
                Untuk pembelian di atas Rp150.000 area kota.
              </p>
            </div>

            {/* Kartu melayang 2 */}
            <div className="animate-float-delayed absolute -right-2 bottom-16 hidden w-[220px] rounded-[var(--radius-card)] border border-hairline surface-raised p-4 shadow-lift sm:block lg:-right-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
                <IconWhatsapp size={20} weight="bold" />
              </span>
              <p className="mt-3 text-[15px] font-semibold text-heading">Konsultasi gratis</p>
              <p className="mt-0.5 text-[14px] leading-snug text-secondary">
                Tanya apoteker kapan saja lewat WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-hairline pt-6">
          <BarisCentang>Semua produk terdaftar BPOM</BarisCentang>
          <BarisCentang Ikon={IconLokasi}>{alamat}</BarisCentang>
          <BarisCentang Ikon={IconJam}>{pengaturan?.opening_hours || 'Senin - Sabtu: 08.00 - 21.00 WIB'}</BarisCentang>
        </div>
      </section>

      {/* ============ 2. KENAPA KAMI ============ */}
      <section className="relative">
        {/* Gumpalan latar dekoratif */}
        <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[var(--accent-soft)] opacity-30 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-[var(--accent-soft)] opacity-30 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <JudulBagian
            tengah
            label="Kenapa Premysis Medika"
            judul="Apotek jaringan memperlakukan Anda seperti nomor. Kami seperti keluarga."
            pengantar="Apoteker yang mengenal Anda, obat yang selalu asli, dan pengiriman yang bisa diandalkan."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <KartuFitur
              Ikon={IconPerisai}
              judul="Obat asli, tanpa kompromi"
              ket="Semua stok dibeli dari distributor resmi dan tercatat di BPOM. Kalau tidak asli, kami tidak jual."
            />
            <KartuFitur
              Ikon={IconDiskusi}
              judul="Apoteker yang mendengarkan"
              ket="Bukan sekadar menyerahkan obat. Kami bantu memastikan dosis dan aturan pakainya tepat untuk Anda."
            />
            <KartuFitur
              Ikon={IconKirim}
              judul="Diantar ke depan pintu"
              ket="Pesan dari rumah, apoteker menyiapkan, kurir mengantar. Cocok untuk Anda yang sedang tidak bisa keluar."
            />
          </div>
        </div>
      </section>

      {/* ============ 3. PRODUK UNGGULAN ============ */}
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

            <ul className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-4">
              {produkUnggulan.slice(0, 4).map((p) => (
                <li key={p.id} className="reveal">
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

      {/* ============ 4. PERBANDINGAN ============ */}
      <section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Kiri: penjelasan + dua kartu kecil */}
          <div className="reveal">
            <JudulBagian
              label="Perbedaannya"
              judul="Perawatan apotek yang lengkap"
              pengantar="Dari obat resep sampai vitamin harian, semuanya ditangani apoteker berwenang dan bisa dikirim ke rumah."
            />

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline surface-raised p-3">
                <img src={GAMBAR_VITAMIN} alt="" className="h-14 w-14 shrink-0 rounded-[var(--radius-control)] object-cover" loading="lazy" />
                <div className="min-w-0">
                  <p className="text-[15.5px] font-semibold text-heading">Vitamin &amp; Suplemen</p>
                  <p className="text-[14px] text-secondary">Stok lengkap setiap hari</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline surface-raised p-3">
                <img src={GAMBAR_RESEP} alt="" className="h-14 w-14 shrink-0 rounded-[var(--radius-control)] object-cover" loading="lazy" />
                <div className="min-w-0">
                  <p className="text-[15.5px] font-semibold text-heading">Obat Resep</p>
                  <p className="text-[14px] text-secondary">Disiapkan apoteker</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <TautanPanah onClick={() => nav('/tentang')}>Kenali klinik kami</TautanPanah>
            </div>
          </div>

          {/* Kanan: tabel perbandingan (miring, lurus saat disorot) */}
          <div className="reveal">
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-hairline surface-raised shadow-lift transition-transform duration-300 rotate-1 hover:rotate-0">
              <div className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-hairline bg-[var(--surface-sunken)] text-[13.5px] font-semibold uppercase tracking-wide text-secondary">
                <span className="px-4 py-3">Layanan</span>
                <span className="bg-[var(--accent-soft)] px-4 py-3 text-accent">Premysis</span>
                <span className="px-4 py-3">Apotek lain</span>
              </div>
              {PERBANDINGAN.map((r, i) => (
                <div
                  key={r.fitur}
                  className={`grid grid-cols-[1.3fr_1fr_1fr] text-[15px] ${i % 2 ? 'bg-[var(--surface-hover)]' : ''}`}
                >
                  <span className="px-4 py-3.5 font-medium text-primary">{r.fitur}</span>
                  <span className="flex items-start gap-2 bg-[var(--accent-soft)]/40 px-4 py-3.5 text-primary">
                    <IconCentangBulat size={17} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                    <span>{r.kami}</span>
                  </span>
                  <span className="px-4 py-3.5 text-muted">{r.lain}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. CAROUSEL SOROTAN ============ */}
      <Carousel slide={slide} onAksi={aksiSlide} />

      {/* ============ 6. AKSES CEPAT ============ */}
      <section>
        <JudulSeksi>Akses Cepat</JudulSeksi>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {AKSES_CEPAT.map((a) => (
            <KartuAksi key={a.to} Ikon={a.Ikon} judul={a.judul} ket={a.ket} warna={a.warna} onClick={() => nav(a.to)} />
          ))}
        </div>
      </section>

      {/* ============ 7. KATEGORI ============ */}
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
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline surface-raised px-4 text-[16px] font-semibold text-primary transition-colors hover:border-strong hover:text-accent"
              >
                <IconToko size={18} weight="bold" className="text-accent" />
                {k.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ============ 8. PROMO ============ */}
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

      {/* ============ 9. JANJI LAYANAN ============ */}
      <JanjiLayanan janji={janji} />

      {/* ============ 10. LAYANAN DIGITAL (bagian gelap) ============ */}
      <section className="relative overflow-hidden rounded-[var(--radius-shell)] bg-emerald-950 text-emerald-50">
        <img
          src={GAMBAR_LAYANAN}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30 grayscale brightness-[0.35] mix-blend-multiply"
        />
        <div className="relative px-6 py-12 sm:px-10 sm:py-16">
          <div className="mx-auto max-w-[46rem] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Layanan digital
            </p>
            <h2 className="mt-3 text-[28px] font-medium leading-tight tracking-tight text-emerald-50 sm:text-[36px]">
              Klinik di genggaman Anda
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-emerald-100/90">
              Pesan, ingat jadwal minum obat, dan tanya apoteker - semuanya lewat satu akun.
            </p>
          </div>

          <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Garis penghubung di layar besar (detail referensi) */}
            <span className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-white/10 lg:block" aria-hidden="true" />
            {LANGKAH_DIGITAL.map((s, i) => (
              <li key={s.judul} className="relative text-center lg:text-left">
                <span
                  className={`relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full lg:mx-0 ${
                    i === 0 ? 'bg-emerald-50 text-emerald-950' : 'bg-emerald-800 text-emerald-50'
                  }`}
                >
                  <s.Ikon size={22} weight="bold" />
                </span>
                <p className="mt-4 text-[17.5px] font-semibold text-emerald-50">{s.judul}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-emerald-100/85">{s.ket}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => nav('/toko')}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-emerald-50 px-7 text-[16.5px] font-semibold text-emerald-950 transition-transform hover:-translate-y-0.5"
            >
              <IconBelanja size={19} weight="bold" />
              Mulai Pesan Sekarang
            </button>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Halo, saya ingin bertanya soal obat.')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/25 px-7 text-[16.5px] font-semibold text-emerald-50 transition-colors hover:bg-white/10"
            >
              <IconWhatsapp size={19} weight="bold" />
              Chat Apoteker
            </a>
          </div>
        </div>
      </section>

      {/* ============ 11. LAYANAN (awan tag) ============ */}
      <section>
        <JudulBagian
          label="Layanan"
          judul="Layanan yang disesuaikan untuk Anda"
          pengantar="Pilih yang Anda butuhkan - kami siapkan sisanya."
        />
        <div className="mt-6 flex flex-wrap gap-2.5">
          {['Obat Resep', 'Vitamin & Suplemen', 'Alat Kesehatan', 'Perawatan Ibu & Bayi', 'Antar ke Rumah', 'Konsultasi Apoteker'].map((t) => (
            <PilLayanan key={t} onClick={() => nav('/toko')}>
              {t}
            </PilLayanan>
          ))}
        </div>
        <div className="mt-6">
          <TautanPanah onClick={() => nav('/kontak')}>Punya pertanyaan? Hubungi kami hari ini</TautanPanah>
        </div>
      </section>

      {/* ============ 12. TESTIMONI ============ */}
      <TestimoniSingkat daftar={testimoni} onLihatSemua={() => nav('/testimoni')} />

      {/* ============ 13. TANYA JAWAB ============ */}
      <TanyaJawab daftar={faq} onLihatSemua={() => nav('/faq')} />

      {/* ============ 14. INFO GRID ============ */}
      <section>
        <div className="rounded-[var(--radius-shell)] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--surface-canvas)] p-6 sm:p-10">
          <JudulBagian tengah label="Informasi" judul="Yang membuat belanja obat tenang" />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INFO_GRID.map((k) => (
              <KartuInfo key={k.judul} Ikon={k.Ikon} judul={k.judul} ket={k.ket} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 15. PESANAN TERAKHIR ============ */}
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

      {/* ============ 16. KONTAK ============ */}
      <section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="reveal">
            <JudulBagian
              label="Kontak"
              judul="Mampir atau hubungi kami"
              pengantar="Butuh bantuan memilih obat? Apoteker kami siap membantu."
            />

            <ul className="mt-7 space-y-5">
              <li className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
                  <IconLokasi size={21} weight="bold" />
                </span>
                <div>
                  <p className="text-[15px] font-medium text-secondary">Alamat</p>
                  <p className="text-[16.5px] font-semibold leading-snug text-primary">{alamat}</p>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
                  <IconTelepon size={21} weight="bold" />
                </span>
                <div>
                  <p className="text-[15px] font-medium text-secondary">Telepon</p>
                  <p className="numeric text-[16.5px] font-semibold text-primary">{telepon}</p>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
                  <IconJam size={21} weight="bold" />
                </span>
                <div>
                  <p className="text-[15px] font-medium text-secondary">Jam buka</p>
                  <p className="whitespace-pre-line text-[16.5px] font-semibold leading-snug text-primary">
                    {pengaturan?.opening_hours || 'Senin - Sabtu: 08.00 - 21.00 WIB'}
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Halo, saya butuh bantuan dari Klinik Premysis Medika.')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-accent px-6 text-[16px] font-semibold text-[var(--accent-contrast)] transition-[filter,transform] hover:brightness-110 active:translate-y-px"
              >
                <IconWhatsapp size={20} weight="bold" />
                Chat WhatsApp
              </a>
              <button
                type="button"
                onClick={() => nav('/kontak')}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-hairline surface-raised px-6 text-[16px] font-semibold text-primary transition-colors hover:surface-hover"
              >
                Kirim Pesan
              </button>
            </div>
          </div>

          {/* Kartu ajakan dengan pendar emerald */}
          <div className="reveal relative overflow-hidden rounded-[var(--radius-shell)] border border-hairline surface-raised p-6 sm:p-9">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[var(--accent-soft)] blur-2xl" aria-hidden="true" />
            <div className="relative">
              <LogoKlinik size={52} />
              <h3 className="mt-5 text-[23px] font-medium leading-snug tracking-tight text-heading">
                Belanja obat tanpa keluar rumah
              </h3>
              <p className="mt-3 text-[16px] leading-relaxed text-secondary">
                Buat akun gratis, simpan alamat pengiriman, lalu lacak pesanan Anda secara
                real-time. Apoteker kami menyiapkan setiap pesanan dengan teliti.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => nav(tamu ? '/registrasi' : '/toko')}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-[16px] font-semibold text-[var(--accent-contrast)] transition-[filter,transform] hover:brightness-110 active:translate-y-px"
                >
                  {tamu ? 'Daftar Gratis' : 'Belanja Sekarang'}
                </button>
                <button
                  type="button"
                  onClick={() => nav('/faq')}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-hairline px-6 text-[16px] font-semibold text-primary transition-colors hover:surface-hover"
                >
                  <IconTanya size={18} weight="bold" />
                  Pertanyaan Umum
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-5">
                <BarisCentang>Gratis biaya pendaftaran</BarisCentang>
                <BarisCentang Ikon={IconPonsel}>Pesan dari ponsel</BarisCentang>
                <BarisCentang Ikon={IconLayanan}>Lacak pesanan</BarisCentang>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 17. SURAT KABAR ============ */}
      <SuratKabar
        onKirim={async (email) => {
          beriToast(`Terima kasih! Kami akan mengabari ${email} saat ada promo.`, 'sukses')
        }}
      />
    </div>
  )
}
