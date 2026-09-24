import { createContext, useContext, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import { Toast } from './ui'
import { useStore } from '../lib/store'
import { IconToko } from './Icons'

// =============================================================
// Kontrol blok ajakan umum.
//
// Layout ini selalu menambahkan satu blok "Siap mulai belanja
// obat?" di bawah konten untuk pengunjung yang belum masuk. Tetapi
// sebagian halaman (Beranda, FAQ, Testimoni) sudah punya blok
// ajakan sendiri di akhir - kalau keduanya tampil, halaman jadi
// menumpuk dua ajakan berturut-turut.
//
// Halaman seperti itu cukup memanggil useSembunyikanAjakan() sekali;
// blok umum otomatis disembunyikan selama halaman itu aktif.
// =============================================================
const KonteksAjakan = createContext(() => {})

export function useSembunyikanAjakan() {
  const setSembunyi = useContext(KonteksAjakan)
  useEffect(() => {
    setSembunyi(true)
    return () => setSembunyi(false)
  }, [setSembunyi])
}

// =============================================================
// Kerangka halaman PUBLIK (tanpa login).
//
// Halaman informasi apotek - Tentang Kami, Kontak, FAQ, Syarat,
// Privasi, Testimoni, Berita, Promo - plus katalog (Toko & Detail
// Produk) harus bisa dibaca siapa saja sebelum mendaftar. Itu
// bagian dari fitur FrontEnd 1 pada brief.
//
// Layout WEB: konten selebar `wadah`, lalu footer tiga kolom yang
// sudah memuat semua tautan informasi - jadi tidak perlu lagi
// blok "Informasi Klinik" menumpuk di bawah konten seperti versi
// aplikasi mobile sebelumnya.
//
// Menu bawah (BottomNav) hanya muncul bila pengunjung sudah masuk,
// karena tujuan menu itu halaman milik pelanggan (keranjang,
// pesanan, profil) yang tetap dijaga login.
// =============================================================
export default function LayoutPublik({ tanpaAjakan = false }) {
  const { toast, user } = useStore()
  const nav = useNavigate()
  // true bila halaman aktif sudah punya blok ajakan sendiri.
  const [sembunyiAjakan, setSembunyiAjakan] = useState(false)

  return (
    <KonteksAjakan.Provider value={setSembunyiAjakan}>
    <div className="publik flex min-h-dvh flex-col surface-canvas">
      <a href="#konten" className="skip-link">
        Lompat ke konten
      </a>
      <Header />
      <main id="konten" className="wadah flex-1 pb-nav pt-5">
        <Outlet />

        {/* Ajakan masuk bagi pengunjung yang belum punya sesi.
            Dimatikan di halaman 404 dan di halaman yang punya
            ajakan sendiri - supaya tidak menumpuk. */}
        {!user && !tanpaAjakan && !sembunyiAjakan && (
          <section className="mt-12 overflow-hidden rounded-[var(--radius-shell)] permukaan-sambutan border border-hairline">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-[52ch]">
                <p className="text-[21px] font-bold tracking-tight text-primary">
                  Siap mulai belanja obat?
                </p>
                <p className="mt-2 text-[16.5px] leading-relaxed text-secondary">
                  Masuk atau daftar untuk memesan obat, menyimpan alamat pengiriman, dan melacak
                  status pesanan Anda secara real-time.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => nav('/masuk')}
                  className="inline-flex min-h-13 items-center justify-center rounded-[var(--radius-control)] bg-accent px-6 text-[17px] font-semibold text-[var(--accent-contrast)] hover:brightness-95"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => nav('/registrasi')}
                  className="inline-flex min-h-13 items-center justify-center rounded-[var(--radius-control)] border border-hairline surface-raised px-6 text-[17px] font-semibold text-primary hover:surface-hover"
                >
                  Daftar
                </button>
                <button
                  type="button"
                  onClick={() => nav('/toko')}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-hairline surface-raised px-6 text-[17px] font-semibold text-primary hover:surface-hover"
                >
                  <IconToko size={20} weight="bold" className="text-accent" />
                  Lihat Katalog
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      {user && <BottomNav />}
      <Toast toast={toast} />
    </div>
    </KonteksAjakan.Provider>
  )
}
