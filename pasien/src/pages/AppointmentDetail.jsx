import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtTanggalPanjang, statusAppointment , fmtJam } from '../../../shared/format'
import { Kartu, Tombol, Lencana, Kosong, Konfirmasi, BarisInfo } from '../components/ui'
import {
  IconJam, IconLokasi, IconWhatsapp, IconPeta, IconKalender,
  IconCatatan, IconAppointment, IconPeringatan, IconChat,
} from '../components/Icons'
import { KLINIK, cariTenaga } from '../lib/layanan'

// F-03 Detail Janji Temu - brief §9.
//
// Informasi paling penting (tanggal, jam, tenaga kesehatan, status)
// ditampilkan BESAR di bagian atas. Tindakan berisiko (pembatalan)
// dipisah ke bawah dan wajib melewati dialog konfirmasi (brief §21).
export default function AppointmentDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { appointmentSaya, batalkanAppointment, beriToast } = useStore()
  const [batal, setBatal] = useState(false)
  const [sibuk, setSibuk] = useState(false)

  const janji = appointmentSaya.find((a) => a.id === Number(id))

  if (!janji) {
    return (
      <Kartu padat>
        <Kosong
          judul="Janji temu tidak ditemukan"
          pesan="Janji temu ini mungkin sudah tidak ada. Buka daftar janji temu untuk melihat jadwal Anda."
          ikon={<IconAppointment size={24} />}
          aksi={
            <Tombol size="lg" onClick={() => nav('/appointment', { replace: true })}>
              Lihat Semua Janji Temu
            </Tombol>
          }
        />
      </Kartu>
    )
  }

  const tenaga = cariTenaga(janji.id_bidan)
  const status = statusAppointment[janji.status] || { tone: 'neutral' }
  const bolehBatal = janji.status === 'Menunggu Konfirmasi' || janji.status === 'Dikonfirmasi'

  const lakukanBatal = async () => {
    setSibuk(true)
    try {
      await batalkanAppointment(janji.id)
      beriToast('Janji temu Anda sudah dibatalkan.', 'info')
      setBatal(false)
    } catch (e) {
      beriToast(e.message, 'galat')
    } finally {
      setSibuk(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* --- Informasi utama: tanggal, jam, tenaga, status --- */}
      <Kartu className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[20.5px] font-bold leading-snug tracking-tight text-primary">
            Janji Temu Anda
          </h1>
          <Lencana tone={status.tone}>{status.label}</Lencana>
        </div>

        {/* Blok waktu: paling sering dicari pasien saat mau berangkat. */}
        <div className="rounded-[var(--radius-control)] permukaan-1 px-4 py-4">
          <p className="flex items-center gap-2 text-[18.5px] font-bold leading-snug text-primary">
            <IconKalender size={21} weight="bold" className="shrink-0 text-accent" />
            {fmtTanggalPanjang(janji.tanggal)}
          </p>
          <p className="numeric mt-2 flex items-center gap-2 text-[24px] font-bold text-accent">
            <IconJam size={24} weight="bold" className="shrink-0" />
            {fmtJam(janji.waktu)} WIB
          </p>
        </div>

        <div className="divide-y divide-[var(--border-hairline)]">
          <BarisInfo label="Layanan">{janji.jenis_layanan}</BarisInfo>
          <BarisInfo label="Tenaga kesehatan">
            <span className="block">
              {tenaga ? tenaga.nama : 'Tenaga klinik'}
              <span className="mt-0.5 block text-[15.5px] font-normal text-secondary">
                {tenaga ? tenaga.profesi : ''}
              </span>
            </span>
          </BarisInfo>
          <BarisInfo label="Tempat">{KLINIK.nama}</BarisInfo>
        </div>

        {janji.keluhan && (
          <p className="flex items-start gap-2.5 rounded-[var(--radius-control)] surface-sunken px-4 py-3 text-[16px] leading-relaxed text-secondary">
            <IconCatatan size={18} className="mt-0.5 shrink-0 text-muted" />
            <span>
              <span className="block font-semibold text-primary">Keluhan Anda</span>
              {janji.keluhan}
            </span>
          </p>
        )}

        {janji.catatan && (
          <p className="flex items-start gap-2.5 rounded-[var(--radius-control)] bg-[var(--color-signal-blue-soft)] px-4 py-3 text-[16px] leading-relaxed text-[var(--color-signal-blue)]">
            <IconChat size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>
              <span className="block font-semibold">Pesan dari klinik</span>
              {janji.catatan}
            </span>
          </p>
        )}

        {janji.status === 'Menunggu Konfirmasi' && (
          <p className="flex items-start gap-2.5 rounded-[var(--radius-control)] bg-[var(--color-signal-amber-soft)] px-4 py-3 text-[16px] leading-relaxed text-[var(--color-signal-amber)]">
            <IconPeringatan size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>Klinik belum mengonfirmasi jadwal ini. Anda akan menerima pemberitahuan begitu disetujui.</span>
          </p>
        )}
      </Kartu>

      {/* --- Tindakan --- */}
      <div className="space-y-2.5">
        <a
          href={KLINIK.peta}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[var(--radius-control)] bg-accent px-5 text-[18px] font-bold text-[var(--accent-contrast)] active:brightness-95"
        >
          <IconPeta size={22} weight="bold" />
          Lihat Lokasi Klinik
        </a>

        <a
          href={KLINIK.tautanWA(`Halo, saya ingin menanyakan janji temu saya pada ${janji.tanggal} pukul ${fmtJam(janji.waktu)}.`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[var(--radius-control)] border border-strong surface-raised px-5 text-[18px] font-bold text-primary active:surface-hover"
        >
          <IconWhatsapp size={22} weight="bold" />
          Hubungi Klinik
        </a>

        {bolehBatal && (
          <button
            type="button"
            onClick={() => setBatal(true)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 text-[17px] font-semibold text-[var(--color-signal-rose)] active:surface-hover"
          >
            Batalkan Janji Temu
          </button>
        )}
      </div>

      <p className="flex items-start gap-2.5 text-[15.5px] leading-relaxed text-muted">
        <IconLokasi size={18} className="mt-0.5 shrink-0" />
        <span>{KLINIK.alamat}</span>
      </p>

      {/* Konfirmasi pembatalan (brief §21) */}
      <Konfirmasi
        buka={batal}
        onTutup={() => setBatal(false)}
        onYa={lakukanBatal}
        sibuk={sibuk}
        judul="Batalkan Janji Temu?"
        pesan={`Apakah Anda yakin ingin membatalkan janji temu pada ${fmtTanggalPanjang(janji.tanggal)} pukul ${fmtJam(janji.waktu)} WIB? Anda dapat membuat jadwal baru kapan saja.`}
        labelYa="Ya, Batalkan"
      />
    </div>
  )
}
