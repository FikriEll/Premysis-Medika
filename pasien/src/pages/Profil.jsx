import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useTema } from '../lib/theme'
import { fmtTanggal, labelUsia } from '../../../shared/format'
import {
  Kartu, Tombol, Lembar, Konfirmasi, BarisInfo, BarisTautan, JudulSeksi,
  Lencana, Kosong, AvatarPasien,
} from '../components/ui'
import {
  IconEdit, IconKeluar, IconBayi, IconMatahari, IconBulan,
  IconPanahKanan, IconNotifikasi, IconWhatsapp, IconInfo, IconProfil,
} from '../components/Icons'
import { IlustrasiBayi } from '../components/Ilustrasi'
import { KLINIK } from '../lib/layanan'

// F-11 Profil Saya - brief §17.
//
// Brief §17 meminta menampilkan: foto profil, nama lengkap, nomor HP,
// tanggal lahir, jenis kelamin, alamat, dan data lain yang diperlukan
// klinik; dengan satu tombol "Edit Profil".
//
// Catatan: foto profil pada data demo belum ada, jadi dipakai avatar
// inisial (bukan foto palsu yang bisa menyesatkan pasien).
export default function Profil() {
  const nav = useNavigate()
  const { user, bayiSaya, logout, notifikasiSaya } = useStore()
  const { gelap, toggleTema } = useTema()
  const [keluarBuka, setKeluarBuka] = useState(false)

  const belumDibaca = notifikasiSaya.filter((n) => !n.status_baca).length

  return (
    <div className="space-y-5">
      {/* --- Kartu identitas --- */}
      <Kartu className="space-y-4">
        <div className="flex items-center gap-4">
          <AvatarPasien nama={user?.nama} size={72} />
          <div className="min-w-0 flex-1">
            <p className="text-[20.5px] font-bold leading-snug tracking-tight text-primary">{user?.nama}</p>
            <p className="numeric mt-1 text-[16px] text-secondary">{user?.no_wa || '-'}</p>
            <p className="mt-1 text-[15px] text-muted">
              Terdaftar sejak {fmtTanggal(user?.tanggal_registrasi)}
            </p>
          </div>
        </div>

        <Tombol size="lg" penuh onClick={() => nav('/profil/edit')}>
          <IconEdit size={20} weight="bold" />
          Edit Profil
        </Tombol>
      </Kartu>

      {/* --- Data pribadi (brief §17) --- */}
      <section>
        <JudulSeksi>Data Pribadi</JudulSeksi>
        <Kartu className="divide-y divide-[var(--border-hairline)] px-4 py-1.5">
          <BarisInfo label="Nama lengkap">{user?.nama || '-'}</BarisInfo>
          <BarisInfo label="Nomor HP">
            <span className="numeric">{user?.no_wa || '-'}</span>
          </BarisInfo>
          <BarisInfo label="Tanggal lahir">
            <span className="numeric">{fmtTanggal(user?.tanggal_lahir)}</span>
          </BarisInfo>
          <BarisInfo label="Jenis kelamin">
            {user?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </BarisInfo>
          <BarisInfo label="Alamat">{user?.alamat || '-'}</BarisInfo>
          <BarisInfo label="Nomor NIK">
            <span className="numeric">{user?.nik || '-'}</span>
          </BarisInfo>
          <BarisInfo label="Email">
            <span className="break-all">{user?.email || '-'}</span>
          </BarisInfo>
        </Kartu>
        <p className="mt-2 flex items-start gap-2 text-[15.5px] leading-relaxed text-muted">
          <IconInfo size={17} className="mt-0.5 shrink-0" />
          <span>Nomor NIK hanya dapat diubah oleh petugas klinik saat Anda datang.</span>
        </p>
      </section>

      {/* --- Data anak --- */}
      <section>
        <JudulSeksi
          aksi={
            <Tombol size="sm" variant="secondary" onClick={() => nav('/vaksinasi')}>
              Kelola
            </Tombol>
          }
        >
          Data Anak
        </JudulSeksi>
        {bayiSaya.length === 0 ? (
          <Kartu padat>
            <Kosong
              judul="Belum ada data anak"
              pesan="Tambahkan data anak agar jadwal imunisasi tercatat dan diingatkan otomatis."
              ilustrasi={<IlustrasiBayi size={124} />}
              aksi={
                <Tombol size="lg" onClick={() => nav('/vaksinasi')}>
                  Daftarkan Anak
                </Tombol>
              }
            />
          </Kartu>
        ) : (
          <ul className="space-y-2.5">
            {bayiSaya.map((b) => (
              <li key={b.id}>
                <Kartu padat>
                  <BarisTautan onClick={() => nav('/vaksinasi')}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
                      <IconBayi size={22} weight="bold" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[17px] font-semibold text-primary">{b.nama}</span>
                      <span className="block text-[15.5px] text-secondary">
                        {labelUsia(b.tanggal_lahir)} · {b.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </span>
                    <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
                  </BarisTautan>
                </Kartu>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Pengaturan --- */}
      <section>
        <JudulSeksi>Pengaturan</JudulSeksi>
        <Kartu padat>
          <BarisTautan onClick={toggleTema}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-1 text-accent">
              {gelap ? <IconMatahari size={21} weight="bold" /> : <IconBulan size={21} weight="bold" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Tampilan</span>
              <span className="block text-[15.5px] text-secondary">Mode {gelap ? 'gelap' : 'terang'}</span>
            </span>
            <Lencana tone="neutral">{gelap ? 'Gelap' : 'Terang'}</Lencana>
          </BarisTautan>

          <BarisTautan onClick={() => nav('/notifikasi')} className="border-t border-hairline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full permukaan-1 text-accent">
              <IconNotifikasi size={21} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold text-primary">Pemberitahuan</span>
              <span className="block text-[15.5px] text-secondary">
                {belumDibaca > 0 ? `${belumDibaca} belum dibaca` : 'Tidak ada yang baru'}
              </span>
            </span>
            {belumDibaca > 0 && <Lencana tone="rose">{belumDibaca}</Lencana>}
          </BarisTautan>
        </Kartu>
      </section>

      {/* --- Bantuan --- */}
      <section>
        <JudulSeksi>Bantuan</JudulSeksi>
        <a
          href={KLINIK.tautanWA('Halo, saya pasien Premysis Medika dan butuh bantuan.')}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-4"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-green-solid)] text-white">
            <IconWhatsapp size={22} weight="bold" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-semibold text-primary">Hubungi Klinik</span>
            <span className="block text-[15.5px] text-secondary">{KLINIK.telepon}</span>
          </span>
          <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
        </a>
      </section>

      <Tombol variant="secondary" size="lg" penuh onClick={() => setKeluarBuka(true)}>
        <IconKeluar size={20} weight="bold" />
        Keluar dari Akun
      </Tombol>

      <p className="flex items-start gap-2 pb-2 text-[15px] leading-relaxed text-muted">
        <IconProfil size={17} className="mt-0.5 shrink-0" />
        <span>
          Aplikasi Pasien Premysis Medika. Data pada aplikasi ini adalah contoh untuk keperluan
          pengembangan.
        </span>
      </p>

      <Konfirmasi
        buka={keluarBuka}
        onTutup={() => setKeluarBuka(false)}
        onYa={() => {
          logout()
          nav('/masuk', { replace: true })
        }}
        judul="Keluar dari akun?"
        pesan="Anda perlu masuk kembali untuk membuat janji temu atau berbelanja."
        labelYa="Ya, Keluar"
      />
    </div>
  )
}
