import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import { Panel, Metric, MetricStrip, Button, EmptyState } from '../components/ui'
import StatusBadge from '../components/StatusBadge'
import { dashboardStats, namaPasien, fmtRupiah, fmtTanggal, namaPengguna } from '../data/mockData'
import { useData } from '../context/DataContext'
import {
  IconAppointment, IconPemeriksaan, IconPesanan, IconAlert,
  IconStok, IconChevronRight, IconPlus, IconWhatsapp, IconArrowRight,
} from '../components/Icons'

// Garis waktu appointment: satu baris per jadwal, jam sebagai kolom
// tetap (monospace) supaya kolomnya sejajar dan mudah dipindai.
function BarisAppointment({ a }) {
  return (
    <li className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:surface-hover">
      <span className="numeric w-11 shrink-0 text-[13px] font-medium text-secondary">{a.waktu}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-primary">{namaPasien(a.id_pasien)}</p>
        <p className="truncate text-[12.5px] text-secondary">{a.jenis_layanan}</p>
      </div>
      <StatusBadge status={a.status} />
    </li>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  // Ringkasan dibaca dari API bersama, jadi angka di sini selalu
  // mencerminkan aktivitas terbaru dari dashboard maupun app pasien.
  const { appointment, produk, pesanan, logAktivitas } = useData()
  const stats = dashboardStats()
  const hariIni = '2026-04-20'

  const apptHariIni = appointment
    .filter((a) => a.tanggal === hariIni)
    .sort((a, b) => a.waktu.localeCompare(b.waktu))

  const stokMenipis = produk
    .filter((p) => p.stok <= p.stok_minimum)
    .sort((a, b) => a.stok - b.stok)

  const pesananTerbaru = [...pesanan]
    .sort((a, b) => b.waktu_pemesanan.localeCompare(a.waktu_pemesanan))
    .slice(0, 4)

  const tautan = (to, label) => (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent transition-colors duration-200 hover:underline underline-offset-4"
    >
      {label}
      <IconChevronRight size={14} />
    </Link>
  )

  return (
    <div>
      <PageHeader
        title={`Selamat datang, ${user?.nama?.split(' ')[0]}`}
        subtitle={`Ringkasan operasional klinik per ${fmtTanggal(hariIni)}.`}
        actions={
          <>
            <Link to="/appointment">
              <Button variant="secondary">
                <IconAppointment size={17} />
                Appointment
              </Button>
            </Link>
            <Link to="/pemeriksaan">
              <Button>
                <IconPlus size={17} />
                Pemeriksaan Baru
              </Button>
            </Link>
          </>
        }
      />

      {/* Metrik: satu bingkai dipisah garis rambut, bukan empat kartu. */}
      <MetricStrip>
        <Metric
          label="Appointment hari ini"
          value={stats.appointmentHariIni}
          sub="Jadwal terjadwal"
          tone="blue"
          icon={<IconAppointment size={16} />}
        />
        <Metric
          label="Pemeriksaan hari ini"
          value={stats.pemeriksaanHariIni}
          sub="Kunjungan tercatat"
          tone="green"
          icon={<IconPemeriksaan size={16} />}
        />
        <Metric
          label="Pesanan baru"
          value={stats.pesananBaru}
          sub="Menunggu pembayaran"
          tone="amber"
          icon={<IconPesanan size={16} />}
        />
        <Metric
          label="Stok menipis"
          value={stats.stokMenipis}
          sub="Di bawah ambang minimum"
          tone={stats.stokMenipis > 0 ? 'rose' : 'neutral'}
          icon={<IconAlert size={16} />}
        />
      </MetricStrip>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Appointment hari ini"
          subtitle={`${apptHariIni.length} jadwal`}
          action={tautan('/appointment', 'Lihat semua')}
        >
          {apptHariIni.length === 0 ? (
            <EmptyState
              title="Belum ada appointment hari ini"
              message="Jadwal baru yang masuk akan tampil di sini secara berurutan."
              icon={<IconAppointment size={20} />}
            />
          ) : (
            <ul className="divide-y divide-[var(--border-hairline)]">
              {apptHariIni.map((a) => (
                <BarisAppointment key={a.id} a={a} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Peringatan stok"
          subtitle="Produk pada atau di bawah batas minimum"
          action={tautan('/stok', 'Kelola')}
        >
          {stokMenipis.length === 0 ? (
            <EmptyState title="Semua stok aman" message="Tidak ada produk di bawah ambang minimum." icon={<IconStok size={20} />} />
          ) : (
            <ul className="divide-y divide-[var(--border-hairline)]">
              {stokMenipis.map((p) => {
                const habis = p.stok === 0
                return (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-primary">{p.nama}</p>
                      <p className="text-[12px] text-muted">
                        Minimum {p.stok_minimum} {p.satuan}
                      </p>
                    </div>
                    <span
                      className={`numeric shrink-0 text-[13.5px] font-semibold ${
                        habis ? 'text-[var(--color-signal-rose)]' : 'text-[var(--color-signal-amber)]'
                      }`}
                    >
                      {p.stok}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Pesanan terbaru"
          subtitle="Alur e-commerce"
          action={tautan('/pesanan', 'Lihat semua')}
        >
          <ul className="divide-y divide-[var(--border-hairline)]">
            {pesananTerbaru.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:surface-hover">
                <div className="min-w-0 flex-1">
                  <p className="numeric truncate text-[13px] font-medium text-primary">{p.nomor_pesanan}</p>
                  <p className="truncate text-[12.5px] text-secondary">{namaPasien(p.id_pasien)}</p>
                </div>
                <span className="numeric hidden text-[13px] font-medium text-primary sm:block">
                  {fmtRupiah(p.total)}
                </span>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Aktivitas terbaru" subtitle="Jejak audit sistem">
          <ul className="divide-y divide-[var(--border-hairline)]">
            {logAktivitas.map((l) => (
              <li key={l.id} className="px-5 py-3.5">
                <p className="text-[13.5px] text-primary">{l.aksi}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {namaPengguna(l.id_pengguna)} pada {l.waktu}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Catatan kanal WhatsApp: satu baris informasi dengan aksen tepi,
          bukan kotak hijau penuh yang bersaing dengan data utama. */}
      <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-card)] border border-hairline border-l-2 border-l-[var(--accent)] surface-raised px-5 py-4">
        <span className="mt-0.5 text-accent">
          <IconWhatsapp size={19} />
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-primary">Jalur WhatsApp tetap tersedia</p>
          <p className="mt-0.5 max-w-[80ch] text-[12.5px] leading-relaxed text-secondary">
            Pasien masih dapat menghubungi klinik lewat WhatsApp. Sistem ini berperan sebagai
            kanal tambahan, bukan pengganti kebiasaan yang sudah berjalan.
          </p>
        </div>
        <Link to="/appointment" className="ml-auto hidden shrink-0 sm:block">
          <Button variant="ghost" size="sm">
            Kelola jadwal
            <IconArrowRight size={15} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
