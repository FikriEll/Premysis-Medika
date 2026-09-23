import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtTanggalPanjang , fmtJam } from '../../../shared/format'
import { Kartu, Tombol, Kosong, Konfirmasi, JudulSeksi } from '../components/ui'
import { KartuJanji } from '../components/kartu'
import { IconAppointment, IconWhatsapp } from '../components/Icons'
import { IlustrasiJanji } from '../components/Ilustrasi'
import { KLINIK } from '../lib/layanan'

// F-03 Daftar Janji Temu - brief §5 menu "Janji Temu".
//
// Penyederhanaan sadar dari versi sebelumnya: filter teks
// (Semua/Mendatang/Selesai/Dibatalkan) DIHAPUS. Brief §28 meminta
// jumlah pilihan ditekan dan tidak ada istilah yang harus dipelajari.
// Daftar dipisah menjadi dua kelompok yang jelas: yang akan datang di
// atas (paling penting), lalu riwayat di bawah. Setiap kartu punya
// satu tombol "Lihat Detail Janji Temu".
export default function Appointment() {
  const nav = useNavigate()
  const { appointmentSaya, batalkanAppointment, beriToast } = useStore()
  const [batal, setBatal] = useState(null)
  const [sibuk, setSibuk] = useState(false)

  const mendatang = appointmentSaya.filter(
    (a) => a.status === 'Menunggu Konfirmasi' || a.status === 'Dikonfirmasi',
  )
  const lampau = appointmentSaya.filter(
    (a) => a.status === 'Selesai' || a.status === 'Dibatalkan' || a.status === 'Tidak Hadir',
  )

  const bolehBatal = (a) => a.status === 'Menunggu Konfirmasi' || a.status === 'Dikonfirmasi'

  const lakukanBatal = async () => {
    setSibuk(true)
    try {
      await batalkanAppointment(batal.id)
      beriToast('Janji temu Anda sudah dibatalkan.', 'info')
      setBatal(null)
    } catch (e) {
      beriToast(e.message, 'galat')
    } finally {
      setSibuk(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tombol size="lg" penuh onClick={() => nav('/appointment/baru')}>
        <IconAppointment size={21} weight="bold" />
        Buat Janji Temu Baru
      </Tombol>

      {/* --- Janji yang akan datang --- */}
      <section>
        <JudulSeksi>Janji Temu yang Akan Datang</JudulSeksi>
        {mendatang.length === 0 ? (
          <Kartu padat>
            <Kosong
              judul="Belum ada janji temu"
              pesan="Anda belum memiliki jadwal pemeriksaan. Buat janji agar tidak perlu mengantre di klinik."
              ilustrasi={<IlustrasiJanji size={140} />}
              aksi={
                <Tombol size="lg" onClick={() => nav('/appointment/baru')}>
                  Buat Janji Temu
                </Tombol>
              }
            />
          </Kartu>
        ) : (
          <ul className="space-y-3">
            {mendatang.map((a) => (
              <li key={a.id}>
                <KartuJanji janji={a} onDetail={() => nav(`/appointment/detail/${a.id}`)} />
                {bolehBatal(a) && (
                  <div className="mt-2 flex justify-end">
                    <Tombol variant="secondary" size="sm" onClick={() => setBatal(a)}>
                      Batalkan Janji Temu
                    </Tombol>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Riwayat janji temu --- */}
      {lampau.length > 0 && (
        <section>
          <JudulSeksi>Janji Temu Sebelumnya</JudulSeksi>
          <ul className="space-y-3">
            {lampau.map((a) => (
              <li key={a.id}>
                <KartuJanji janji={a} onDetail={() => nav(`/appointment/detail/${a.id}`)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bantuan selalu tersedia (brief §1). */}
      <a
        href={KLINIK.tautanWA('Halo, saya ingin bertanya soal janji temu saya di Premysis Medika.')}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-3.5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-green-solid)] text-white">
          <IconWhatsapp size={21} weight="bold" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold text-primary">Butuh bantuan?</span>
          <span className="block text-[15.5px] text-secondary">Hubungi klinik lewat WhatsApp</span>
        </span>
      </a>

      <Konfirmasi
        buka={!!batal}
        onTutup={() => setBatal(null)}
        onYa={lakukanBatal}
        sibuk={sibuk}
        judul="Batalkan Janji Temu?"
        pesan={
          batal
            ? `Apakah Anda yakin ingin membatalkan janji temu ${batal.jenis_layanan} pada ${fmtTanggalPanjang(batal.tanggal)} pukul ${fmtJam(batal.waktu)} WIB? Anda dapat membuat jadwal baru kapan saja.`
            : ''
        }
        labelYa="Ya, Batalkan"
      />
    </div>
  )
}
