import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useTema } from '../lib/theme'
import { fmtTanggal } from '../../../shared/format'
import {
  Kartu, Tombol, Konfirmasi, BarisInfo, BarisTautan, JudulSeksi, AvatarPasien,
} from '../components/ui'
import {
  IconEdit, IconKeluar, IconMatahari, IconBulan, IconPanahKanan,
  IconWhatsapp, IconInfo, IconProfil, IconGear, IconKirim, IconHati,
  IconPesanan, IconTanya, IconTentang, IconDokumen, IconPerisai,
} from '../components/Icons'

// F-11 Profil Saya - e-commerce.
export default function Profil() {
  const nav = useNavigate()
  const { user, logout, pesananSaya } = useStore()
  const { gelap, toggleTema } = useTema()
  const [keluarBuka, setKeluarBuka] = useState(false)

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* --- Kartu identitas --- */}
      <Kartu className="space-y-4 lg:col-span-2">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <AvatarPasien nama={user?.name} size={72} />
          <div className="min-w-0 flex-1">
            <p className="text-[20.5px] font-bold leading-snug tracking-tight text-primary">{user?.name}</p>
            <p className="numeric mt-1 text-[16px] text-secondary">{user?.phone || '-'}</p>
            <p className="mt-1 text-[15px] text-muted">
              Terdaftar sejak {fmtTanggal(user?.created_at)}
            </p>
          </div>
        </div>

        <Tombol size="lg" penuh onClick={() => nav('/profil/edit')}>
          <IconEdit size={20} weight="bold" />
          Edit Profil
        </Tombol>
      </Kartu>

      {/* --- Data pribadi --- */}
      <section>
        <JudulSeksi>Data Pribadi</JudulSeksi>
        <Kartu className="divide-y divide-[var(--border-hairline)] px-4 py-1.5">
          <BarisInfo label="Nama lengkap">{user?.name || '-'}</BarisInfo>
          <BarisInfo label="Nomor HP">
            <span className="numeric">{user?.phone || '-'}</span>
          </BarisInfo>
          <BarisInfo label="Email">
            <span className="break-all">{user?.email || '-'}</span>
          </BarisInfo>
          <BarisInfo label="Total pesanan">
            <span className="numeric">{pesananSaya.length}</span>
          </BarisInfo>
        </Kartu>
        <p className="mt-2 flex items-start gap-2 text-[15.5px] leading-relaxed text-muted">
          <IconInfo size={17} className="mt-0.5 shrink-0" />
          <span>Pastikan nomor HP dan email Anda aktif agar pesanan dapat dikonfirmasi.</span>
        </p>
      </section>

      {/* --- Pengaturan --- */}
      <section>
        <JudulSeksi>Pengaturan</JudulSeksi>
        <Kartu padat>
          <BarisTautan onClick={() => nav('/pengaturan')}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-1 text-accent">
              <IconGear size={22} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Pengaturan Akun</span>
              <span className="block text-[15.5px] text-secondary">Ganti password dan preferensi notifikasi</span>
            </span>
            <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
          </BarisTautan>

          <BarisTautan onClick={() => nav('/pengaturan/pengiriman')} className="border-t border-hairline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-sky">
              <IconKirim size={22} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Pengaturan Pengiriman</span>
              <span className="block text-[15.5px] text-secondary">Alamat, metode kirim, dan biayanya</span>
            </span>
            <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
          </BarisTautan>

          <BarisTautan onClick={() => nav('/wishlist')} className="border-t border-hairline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-coral">
              <IconHati size={22} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Produk Favorit</span>
              <span className="block text-[15.5px] text-secondary">Obat yang Anda simpan untuk dibeli nanti</span>
            </span>
            <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
          </BarisTautan>

          <BarisTautan onClick={toggleTema} className="border-t border-hairline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-1 text-accent">
              {gelap ? <IconMatahari size={21} weight="bold" /> : <IconBulan size={21} weight="bold" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Tampilan</span>
              <span className="block text-[15.5px] text-secondary">Mode {gelap ? 'gelap' : 'terang'}</span>
            </span>
            <span className="shrink-0 text-[15.5px] font-semibold text-secondary">{gelap ? 'Gelap' : 'Terang'}</span>
          </BarisTautan>

          <BarisTautan onClick={() => nav('/pesanan')} className="border-t border-hairline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-honey">
              <IconPesanan size={22} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Pesanan Saya</span>
              <span className="block text-[15.5px] text-secondary">Lihat semua pesanan dan statusnya</span>
            </span>
            <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
          </BarisTautan>
        </Kartu>
      </section>

      {/* --- Bantuan --- */}
      <section>
        <JudulSeksi>Bantuan &amp; Informasi</JudulSeksi>
        <Kartu padat>
          <BarisTautan onClick={() => nav('/faq')}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-sky">
              <IconTanya size={22} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Pertanyaan Umum</span>
              <span className="block text-[15.5px] text-secondary">Jawaban cepat soal pesanan dan resep</span>
            </span>
            <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
          </BarisTautan>

          <BarisTautan onClick={() => nav('/tentang')} className="border-t border-hairline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-mint">
              <IconTentang size={22} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Tentang Kami</span>
              <span className="block text-[15.5px] text-secondary">Profil, visi, dan misi apotek</span>
            </span>
            <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
          </BarisTautan>

          <BarisTautan onClick={() => nav('/syarat')} className="border-t border-hairline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-peach">
              <IconDokumen size={22} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Syarat &amp; Ketentuan</span>
              <span className="block text-[15.5px] text-secondary">Aturan penggunaan layanan</span>
            </span>
            <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
          </BarisTautan>

          <BarisTautan onClick={() => nav('/privasi')} className="border-t border-hairline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-coral">
              <IconPerisai size={22} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Kebijakan Privasi</span>
              <span className="block text-[15.5px] text-secondary">Cara kami menjaga data Anda</span>
            </span>
            <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
          </BarisTautan>
        </Kartu>

        <a
          href="https://wa.me/6281211112222?text=Halo%2C%20saya%20pelanggan%20Apotek%20Premysis%20dan%20butuh%20bantuan."
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-4"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-green-solid)] text-white">
            <IconWhatsapp size={22} weight="bold" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-semibold text-primary">Hubungi Apotek</span>
            <span className="block text-[15.5px] text-secondary">0812-1111-2222</span>
          </span>
          <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
        </a>
      </section>

      <Tombol variant="secondary" size="lg" penuh className="lg:col-span-2" onClick={() => setKeluarBuka(true)}>
        <IconKeluar size={20} weight="bold" />
        Keluar dari Akun
      </Tombol>

      <p className="flex items-start gap-2 pb-2 text-[15px] leading-relaxed text-muted lg:col-span-2">
        <IconProfil size={17} className="mt-0.5 shrink-0" />
        <span>Aplikasi Pelanggan Apotek Premysis Medika.</span>
      </p>

      <Konfirmasi
        buka={keluarBuka}
        onTutup={() => setKeluarBuka(false)}
        onYa={async () => {
          await logout()
          nav('/masuk', { replace: true })
        }}
        judul="Keluar dari akun?"
        pesan="Anda perlu masuk kembali untuk berbelanja dan melihat pesanan."
        labelYa="Ya, Keluar"
      />
    </div>
  )
}
