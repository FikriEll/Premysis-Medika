import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtTanggalPanjang, fmtWaktu } from '../../../shared/format'
import { Kartu, Tombol, Kosong } from '../components/ui'
import {
  IconAppointment, IconVaksin, IconPesanan, IconResep, IconInfo,
  IconNotifikasi, IconPanahKanan, IconCentang,
} from '../components/Icons'
import { IlustrasiNotifikasi } from '../components/Ilustrasi'

// F-10 Notifikasi - brief §18.
//
// Brief §18 meminta bahasa manusia, bukan kalimat mesin
// ("Appointment status updated."). Isi pesan notifikasi dibuat di
// SERVER (server/index.js) memakai kalimat Indonesia biasa, jadi
// halaman ini hanya menyajikan, bukan menambah istilah teknis.
//
// Setiap notifikasi juga diberi tombol tindakan yang jelas ("Lihat
// Janji Temu"), bukan sekadar bisa ditekan tanpa petunjuk.
const JENIS = {
  appointment: { Ikon: IconAppointment, tujuan: '/appointment', label: 'Lihat Janji Temu' },
  vaksin: { Ikon: IconVaksin, tujuan: '/vaksinasi', label: 'Lihat Jadwal Imunisasi' },
  pesanan: { Ikon: IconPesanan, tujuan: '/pesanan', label: 'Lihat Pesanan' },
  resep: { Ikon: IconResep, tujuan: '/resep', label: 'Lihat Resep Obat' },
  info: { Ikon: IconInfo, tujuan: '/', label: 'Buka Beranda' },
}

export default function Notifikasi() {
  const nav = useNavigate()
  const { notifikasiSaya, belumDibaca, bacaNotifikasi, bacaSemuaNotifikasi } = useStore()

  return (
    <div className="space-y-5">
      {notifikasiSaya.length > 0 && (
        // flex-wrap: di layar sempit, tombol "Tandai Semua Dibaca"
        // turun ke baris sendiri alih-alih berdesakan (brief §26).
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-[16px] text-secondary">
            {belumDibaca > 0 ? `${belumDibaca} pemberitahuan baru` : 'Semua sudah dibaca'}
          </p>
          {belumDibaca > 0 && (
            <Tombol size="sm" variant="secondary" onClick={bacaSemuaNotifikasi}>
              <IconCentang size={17} weight="bold" />
              Tandai Semua Dibaca
            </Tombol>
          )}
        </div>
      )}

      {notifikasiSaya.length === 0 ? (
        <Kartu padat>
          <Kosong
            judul="Belum ada pemberitahuan"
            pesan="Pengingat jadwal, kabar pesanan, dan resep baru akan muncul di sini."
            ilustrasi={<IlustrasiNotifikasi size={136} />}
          />
        </Kartu>
      ) : (
        <ul className="space-y-3">
          {notifikasiSaya.map((n) => {
            const meta = JENIS[n.jenis] || JENIS.info
            const { Ikon } = meta
            const baru = !n.status_baca
            return (
              <li key={n.id}>
                <Kartu className={`space-y-3.5 ${baru ? 'border-2 border-[var(--accent)]' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        baru ? 'bg-[var(--accent-soft)] text-accent' : 'surface-sunken text-muted'
                      }`}
                    >
                      <Ikon size={23} weight={baru ? 'fill' : 'regular'} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[17px] leading-snug ${baru ? 'font-bold text-primary' : 'font-semibold text-secondary'}`}>
                        {n.judul}
                      </p>
                      <p className="mt-1.5 text-[16px] leading-relaxed text-secondary">{n.pesan}</p>
                      <p className="numeric mt-1.5 text-[15px] text-muted">
                        {fmtTanggalPanjang(n.tanggal?.slice(0, 10))} · {fmtWaktu(n.tanggal)} WIB
                      </p>
                    </div>
                  </div>

                  <Tombol
                    variant={baru ? 'primary' : 'secondary'}
                    penuh
                    onClick={() => {
                      if (baru) bacaNotifikasi(n.id)
                      nav(meta.tujuan)
                    }}
                  >
                    {meta.label}
                    <IconPanahKanan size={18} weight="bold" />
                  </Tombol>
                </Kartu>
              </li>
            )
          })}
        </ul>
      )}

      {notifikasiSaya.length > 0 && (
        <p className="flex items-start gap-2.5 text-[15.5px] leading-relaxed text-muted">
          <IconNotifikasi size={18} className="mt-0.5 shrink-0" />
          <span>Pemberitahuan dibuat otomatis oleh klinik saat ada perubahan pada jadwal atau pesanan Anda.</span>
        </p>
      )}
    </div>
  )
}
