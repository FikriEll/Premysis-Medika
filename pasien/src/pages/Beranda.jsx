import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtRupiah, fmtTanggal, fmtTanggalPanjang , fmtJam } from '../../../shared/format'
import { Kartu, JudulSeksi, Lencana, Tombol, Kosong, TautanLanjut, KartuAksi } from '../components/ui'
import { KartuJanji } from '../components/kartu'
import {
  IconAppointment, IconBelanja, IconRekam, IconProfil,
  IconWhatsapp, IconLokasi, IconJam, IconPesanan, IconSapa, IconNotifikasi,
} from '../components/Icons'
import { IlustrasiIbuBayi, IlustrasiJanji } from '../components/Ilustrasi'
import { KLINIK } from '../lib/layanan'
import { statusPesanan } from '../../../shared/format'

// F-02 Beranda - brief §7.
//
// Brief §7 tegas soal isi Beranda: JANGAN ramai. Strukturnya hanya
//   Header (sapaan) -> Notifikasi penting -> Janji temu terdekat ->
//   Akses cepat (maksimal 4) -> Informasi klinik.
//
// Halaman ini SENGAJA tidak lagi memuat jadwal vaksin, daftar resep,
// dan pintasan 6 ikon seperti versi sebelumnya. Semua itu sudah punya
// tempatnya sendiri dan tetap terjangkau dari akses cepat atau menu
// bawah, jadi menumpuknya di Beranda hanya membuat pasien bingung
// (brief §1: "maksimal 3-5 tindakan utama dalam satu layar").
const AKSES_CEPAT = [
  { to: '/appointment/baru', judul: 'Buat Janji Temu', ket: 'Daftar periksa tanpa mengantre', Ikon: IconAppointment, warna: 'permukaan-sky' },
  { to: '/toko', judul: 'Beli Obat', ket: 'Obat dan kebutuhan ibu & anak', Ikon: IconBelanja, warna: 'permukaan-mint' },
  { to: '/riwayat', judul: 'Riwayat Berobat', ket: 'Hasil pemeriksaan sebelumnya', Ikon: IconRekam, warna: 'permukaan-peach' },
  { to: '/profil', judul: 'Profil Saya', ket: 'Data diri dan akun Anda', Ikon: IconProfil, warna: 'permukaan-honey' },
]

export default function Beranda() {
  const nav = useNavigate()
  const { user, appointmentMendatang, pesananSaya, notifikasiSaya } = useStore()

  const janjiTerdekat = appointmentMendatang[0]
  const pesananTerakhir = pesananSaya[0]
  const pengingat = notifikasiSaya.filter((n) => !n.status_baca).slice(0, 1)

  const jam = new Date().getHours()
  const sapaan = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 19 ? 'Selamat sore' : 'Selamat malam'
  const namaDepan = (user?.nama || '').split(' ')[0]

  return (
    <div className="space-y-6">
      {/* --- Header: sapaan (brief §7) --- */}
      <section className="permukaan-sambutan relative overflow-hidden rounded-[var(--radius-shell)] border border-hairline">
        <div className="relative z-10 max-w-[60%] px-5 pb-6 pt-5">
          <h1 className="flex flex-wrap items-center gap-x-2 text-[24px] font-bold leading-tight tracking-tight text-primary">
            <span>
              Halo, {namaDepan}
            </span>
            <IconSapa size={24} weight="bold" className="text-accent" aria-hidden="true" />
          </h1>
          <p className="mt-2 text-[16px] leading-relaxed text-secondary">
            Semoga Anda sehat hari ini.
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-3 -right-2">
          <IlustrasiIbuBayi size={150} />
        </div>
      </section>

      {/* --- Notifikasi penting, tampil jelas di atas (brief §7) --- */}
      {pengingat.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => nav('/notifikasi')}
          className="flex w-full items-start gap-3 rounded-[var(--radius-card)] border-2 border-[var(--accent)] bg-[var(--accent-soft)] p-4 text-left"
        >
          <span className="mt-0.5 shrink-0 text-accent">
            <IconNotifikasi size={22} weight="fill" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-bold text-primary">{n.judul}</span>
            <span className="mt-1 block text-[16px] leading-relaxed text-secondary">{n.pesan}</span>
            <span className="mt-2 block text-[16px] font-semibold text-accent">Lihat selengkapnya</span>
          </span>
        </button>
      ))}

      {/* --- Janji temu terdekat (brief §7: card besar) --- */}
      <section>
        <JudulSeksi aksi={<TautanLanjut onClick={() => nav('/appointment')}>Semua janji temu</TautanLanjut>}>
          Janji Temu Anda
        </JudulSeksi>

        {janjiTerdekat ? (
          <KartuJanji janji={janjiTerdekat} onDetail={() => nav('/appointment/detail')} />
        ) : (
          <Kartu padat>
            <Kosong
              judul="Belum ada janji temu"
              pesan="Anda belum memiliki jadwal pemeriksaan. Buat janji agar tidak perlu mengantre di klinik."
              ilustrasi={<IlustrasiJanji size={140} />}
              aksi={
                <Tombol size="lg" onClick={() => nav('/appointment/baru')}>
                  <IconAppointment size={20} weight="bold" />
                  Buat Janji Temu
                </Tombol>
              }
            />
          </Kartu>
        )}
      </section>

      {/* --- Akses cepat: tepat 4 tindakan (brief §7) --- */}
      <section>
        <JudulSeksi>Akses Cepat</JudulSeksi>
        <div className="space-y-2.5">
          {AKSES_CEPAT.map((a) => (
            <KartuAksi key={a.to} Ikon={a.Ikon} judul={a.judul} ket={a.ket} warna={a.warna} onClick={() => nav(a.to)} />
          ))}
        </div>
      </section>

      {/* --- Pesanan terakhir: informasi yang perlu diketahui pasien --- */}
      {pesananTerakhir && (
        <section>
          <JudulSeksi aksi={<TautanLanjut onClick={() => nav('/pesanan')}>Semua pesanan</TautanLanjut>}>
            Pesanan Terakhir
          </JudulSeksi>
          <Kartu className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="numeric text-[15.5px] text-secondary">{pesananTerakhir.nomor_pesanan}</p>
                <p className="mt-0.5 text-[17px] font-bold text-primary">
                  {fmtRupiah(pesananTerakhir.total)}
                </p>
              </div>
              <Lencana tone={statusPesanan[pesananTerakhir.status]?.tone}>
                {statusPesanan[pesananTerakhir.status]?.label}
              </Lencana>
            </div>
            <Tombol variant="secondary" penuh onClick={() => nav('/pesanan')}>
              <IconPesanan size={19} weight="bold" />
              Lihat Pesanan Saya
            </Tombol>
          </Kartu>
        </section>
      )}

      {/* --- Informasi klinik: tidak disembunyikan di dalam menu --- */}
      <section>
        <JudulSeksi>Informasi Klinik</JudulSeksi>
        <Kartu className="space-y-4">
          <div>
            <p className="text-[18px] font-bold text-primary">{KLINIK.nama}</p>
            <p className="mt-0.5 text-[16px] text-secondary">{KLINIK.tagline}</p>
          </div>

          <div className="space-y-2.5 border-t border-hairline pt-4">
            <p className="flex items-start gap-2.5 text-[16px] leading-relaxed text-secondary">
              <IconLokasi size={19} weight="bold" className="mt-0.5 shrink-0 text-accent" />
              <span>{KLINIK.alamat}</span>
            </p>
            {KLINIK.jam.map((j) => (
              <p key={j.hari} className="flex items-start justify-between gap-3 text-[16px] text-secondary">
                <span className="inline-flex items-start gap-2.5">
                  <IconJam size={19} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                  <span>{j.hari}</span>
                </span>
                <span className={`numeric font-semibold ${j.waktu === 'Tutup' ? 'text-muted' : 'text-primary'}`}>
                  {fmtJam(j.waktu)}
                </span>
              </p>
            ))}
          </div>

          <div className="border-t border-hairline pt-4">
            <p className="text-[16px] text-secondary">Nomor WhatsApp</p>
            <p className="numeric mt-0.5 text-[18.5px] font-bold text-primary">{KLINIK.telepon}</p>
          </div>

          <a
            href={KLINIK.tautanWA('Halo, saya pasien Premysis Medika. Saya ingin bertanya.')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[var(--radius-control)] bg-accent px-5 text-[18px] font-bold text-[var(--accent-contrast)] active:brightness-95"
          >
            <IconWhatsapp size={22} weight="bold" />
            Hubungi Klinik
          </a>
        </Kartu>
      </section>
    </div>
  )
}
