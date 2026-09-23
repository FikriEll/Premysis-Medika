import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtTanggalPanjang } from '../../../shared/format'
import { Kartu, Tombol, Kosong, JudulSeksi, BarisInfo } from '../components/ui'
import { BarisObat } from '../components/kartu'
import { IconPemeriksaan, IconKembali, IconWhatsapp, IconLab, IconCatatan } from '../components/Icons'
import { cariTenaga, KLINIK } from '../lib/layanan'

// F-04 Detail Riwayat Pemeriksaan - brief §16.
//
// Brief §16 menegaskan: "Tampilkan informasi yang MEMANG BOLEH dilihat
// pasien" dan "Jangan menampilkan data medis yang belum diverifikasi."
//
// Karena itu halaman ini hanya menampilkan kolom yang sudah ada di
// catatan resmi bidan (keluhan, hasil, diagnosis, tindakan, catatan).
// Tidak ada interpretasi tambahan, tidak ada angka yang dikarang.
export default function RiwayatDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { pemeriksaanSaya, resepSaya, appointmentSaya } = useStore()

  const p = pemeriksaanSaya.find((x) => x.id === Number(id))

  if (!p) {
    return (
      <Kartu padat>
        <Kosong
          judul="Catatan tidak ditemukan"
          pesan="Catatan pemeriksaan ini mungkin sudah tidak tersedia."
          ikon={<IconPemeriksaan size={24} />}
          aksi={
            <Tombol size="lg" onClick={() => nav('/riwayat', { replace: true })}>
              Kembali ke Riwayat Berobat
            </Tombol>
          }
        />
      </Kartu>
    )
  }

  const tenaga = cariTenaga(p.id_bidan)
  const janji = appointmentSaya.find((a) => a.id === p.id_appointment)
  const resep = resepSaya.find((r) => r.id_pemeriksaan === p.id)

  return (
    <div className="space-y-5">
      {/* Ringkasan kunjungan */}
      <Kartu className="space-y-3.5">
        <p className="numeric text-[16px] font-semibold text-accent">{fmtTanggalPanjang(p.tanggal)}</p>
        <h1 className="text-[22px] font-bold leading-snug tracking-tight text-primary">
          {p.diagnosis || 'Pemeriksaan'}
        </h1>
        <div className="divide-y divide-[var(--border-hairline)] border-t border-hairline">
          <BarisInfo label="Jenis pelayanan">{janji?.jenis_layanan || 'Pemeriksaan'}</BarisInfo>
          <BarisInfo label="Tenaga kesehatan">
            {tenaga ? `${tenaga.profesi} ${tenaga.nama.split(',')[0]}` : 'Bidan Klinik'}
          </BarisInfo>
          <BarisInfo label="Tempat">{KLINIK.nama}</BarisInfo>
        </div>
      </Kartu>

      {/* Catatan pemeriksaan (brief §16) */}
      <Bagian judul="Keluhan Anda" isi={p.keluhan} Ikon={IconCatatan} />
      <Bagian judul="Hasil pemeriksaan" isi={p.hasil} Ikon={IconLab} />
      <Bagian judul="Diagnosis" isi={p.diagnosis} Ikon={IconPemeriksaan} />
      <Bagian judul="Tindakan yang dilakukan" isi={p.tindakan} Ikon={IconPemeriksaan} />
      <Bagian judul="Catatan dari bidan" isi={p.catatan} Ikon={IconCatatan} />

      {/* Resep dari kunjungan ini (brief §16) */}
      {resep && (
        <section>
          <JudulSeksi>Resep dari kunjungan ini</JudulSeksi>
          <Kartu className="divide-y divide-[var(--border-hairline)] py-0">
            {(resep.detail || []).map((d) => (
              <BarisObat
                key={d.id}
                nama={d.nama_obat}
                dosis={d.dosis}
                aturan={d.aturan_pakai}
                jumlah={d.jumlah}
                satuan="unit"
              />
            ))}
          </Kartu>
        </section>
      )}

      <a
        href={KLINIK.tautanWA(`Halo, saya ingin menanyakan hasil pemeriksaan saya pada ${p.tanggal}.`)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[var(--radius-control)] border border-strong surface-raised px-5 text-[18px] font-bold text-primary active:surface-hover"
      >
        <IconWhatsapp size={22} weight="bold" />
        Tanya Klinik
      </a>

      <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/riwayat')}>
        <IconKembali size={20} weight="bold" />
        Kembali ke Riwayat Berobat
      </Tombol>
    </div>
  )
}

// Satu blok catatan. Tidak dirender kalau bidan tidak mengisinya,
// supaya pasien tidak melihat bagian kosong tanpa penjelasan.
function Bagian({ judul, isi, Ikon }) {
  if (!isi) return null
  return (
    <Kartu className="space-y-2">
      <p className="flex items-center gap-2 text-[16px] font-semibold text-primary">
        {Ikon && <Ikon size={18} weight="bold" className="shrink-0 text-accent" />}
        {judul}
      </p>
      <p className="text-[17px] leading-relaxed text-secondary">{isi}</p>
    </Kartu>
  )
}
