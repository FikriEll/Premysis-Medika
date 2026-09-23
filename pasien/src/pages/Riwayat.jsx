import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtTanggalPanjang } from '../../../shared/format'
import { Kartu, Tombol, Kosong } from '../components/ui'
import { IconPemeriksaan, IconResep, IconPanahKanan, IconWhatsapp } from '../components/Icons'
import { IlustrasiObat } from '../components/Ilustrasi'
import { cariTenaga, KLINIK } from '../lib/layanan'

// F-04 Riwayat Berobat - brief §15.
//
// Brief §15 meminta tampilan timeline ATAU card sederhana. Di sini
// dipakai timeline: garis waktu vertikal dengan titik tanggal, supaya
// pasien lanjut usia langsung paham urutan kunjungan dari yang paling
// baru ke yang paling lama.
//
// Setiap entri menampilkan: tanggal, jenis pelayanan, tenaga
// kesehatan, status, dan tombol "Lihat Detail" (brief §15).
export default function Riwayat() {
  const nav = useNavigate()
  const { pemeriksaanSaya, resepSaya, appointmentSaya } = useStore()

  const resepUntuk = (idPemeriksaan) => resepSaya.find((r) => r.id_pemeriksaan === idPemeriksaan)

  return (
    <div className="space-y-5">
      <p className="text-[17px] leading-relaxed text-secondary">
        Catatan kunjungan Anda tersimpan di sini, dari yang paling baru. Tekan Lihat Detail untuk
        membaca hasil pemeriksaan.
      </p>

      {pemeriksaanSaya.length === 0 ? (
        <Kartu padat>
          <Kosong
            judul="Belum ada riwayat berobat"
            pesan="Catatan akan muncul di sini setelah Anda diperiksa oleh bidan di klinik."
            ilustrasi={<IlustrasiObat size={136} />}
            aksi={
              <Tombol size="lg" onClick={() => nav('/appointment/baru')}>
                Buat Janji Temu
              </Tombol>
            }
          />
        </Kartu>
      ) : (
        <ol className="relative space-y-3 border-l-2 border-[var(--border-hairline)] pl-5">
          {pemeriksaanSaya.map((p) => {
            const tenaga = cariTenaga(p.id_bidan)
            const r = resepUntuk(p.id)
            const janji = appointmentSaya.find((a) => a.id === p.id_appointment)
            const layanan = janji?.jenis_layanan || 'Pemeriksaan'

            return (
              <li key={p.id} className="relative">
                {/* Titik timeline. Menyampaikan makna (urutan kunjungan),
                    jadi tidak dianggap hiasan. */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[calc(1.25rem+9px)] top-5 h-4 w-4 rounded-full border-2 border-[var(--surface-canvas)] bg-accent"
                />

                <Kartu className="space-y-3">
                  <div>
                    <p className="numeric text-[15.5px] font-medium text-secondary">
                      {fmtTanggalPanjang(p.tanggal)}
                    </p>
                    <p className="mt-1 text-[18.5px] font-bold leading-snug text-primary">
                      {p.diagnosis || layanan}
                    </p>
                    <p className="mt-0.5 text-[16px] text-secondary">
                      {tenaga ? `${tenaga.profesi} ${tenaga.nama.split(',')[0]}` : 'Bidan Klinik'}
                    </p>
                  </div>

                  {r && (
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[15px] font-semibold text-accent">
                      <IconResep size={15} weight="bold" />
                      Ada resep obat
                    </p>
                  )}

                  <Tombol variant="secondary" penuh onClick={() => nav(`/riwayat/detail/${p.id}`)}>
                    <IconPemeriksaan size={19} weight="bold" />
                    Lihat Detail
                  </Tombol>
                </Kartu>
              </li>
            )
          })}
        </ol>
      )}

      <a
        href={KLINIK.tautanWA('Halo, saya ingin menanyakan hasil pemeriksaan saya di Premysis Medika.')}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-3.5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-green-solid)] text-white">
          <IconWhatsapp size={21} weight="bold" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold text-primary">Ingin bertanya hasilnya?</span>
          <span className="block text-[15.5px] text-secondary">Hubungi klinik lewat WhatsApp</span>
        </span>
        <IconPanahKanan size={18} weight="bold" className="shrink-0 text-muted" />
      </a>
    </div>
  )
}
