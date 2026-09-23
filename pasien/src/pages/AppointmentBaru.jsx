import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtTanggalPanjang, fmtJam, keISO } from '../../../shared/format'
import {
  Kartu, Tombol, PilihanKotak, SlotWaktu, BarisInfo, Kolom, AreaTeks, Lembar, Konfirmasi, AvatarPasien,
} from '../components/ui'
import {
  IconKembali, IconCentangBulat, IconKalender, IconCatatan,
  IconWhatsapp, IconTanya,
} from '../components/Icons'
import { LAYANAN, TENAGA_KESEHATAN, JAM_PAGI, JAM_SIANG, KLINIK } from '../lib/layanan'

// F-03 Buat Janji Temu - brief §8 (wizard 5 langkah).
//
// Aturan brief yang dipegang di sini:
// - "Jangan menampilkan semua pilihan sekaligus": satu langkah satu
//   pertanyaan, dengan indikator "Langkah 2 dari 5" yang jelas.
// - Setiap langkah punya satu tindakan utama berlabel kata kerja
//   ("Lanjut ke Pilih Jadwal"), bukan "Next".
// - Langkah terakhir menampilkan ringkasan + konfirmasi sebelum
//   benar-benar menyimpan (brief §8 langkah 5).
// - Setelah berhasil, tampil layar sukses berbahasa manusia
//   (brief §28), bukan sekadar toast yang cepat hilang.

const HARI_DEMO = '2026-04-20'
const JUMLAH_LANGKAH = 5
const JUDUL_LANGKAH = [
  'Pilih Layanan', 'Pilih Tenaga Kesehatan', 'Pilih Tanggal', 'Pilih Waktu', 'Konfirmasi Janji Temu',
]

// Tanggal yang bisa dipilih: 14 hari ke depan dari tanggal demo.
// Ditampilkan sebagai tombol besar, bukan kalender rumit (brief §8
// langkah 3: tanggal yang tersedia dibuat jelas).
function daftarTanggal() {
  const dasar = new Date(HARI_DEMO + 'T00:00:00')
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(dasar)
    d.setDate(d.getDate() + i)
    return {
      // keISO() memakai komponen tanggal LOKAL. toISOString() akan
      // menggeser tanggal ke UTC dan membuat pasien memilih "Sen 20 Apr"
      // tetapi tersimpan sebagai 19 April (Minggu).
      iso: keISO(d),
      hariSingkat: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      hari: d.getDate(),
      bulan: d.toLocaleDateString('id-ID', { month: 'short' }),
      lengkap: d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      minggu: d.getDay() === 0, // klinik tutup
    }
  })
}

export default function AppointmentBaru() {
  const nav = useNavigate()
  const { buatAppointment, slotTerisi, beriToast } = useStore()

  const [langkah, setLangkah] = useState(1)
  const [layanan, setLayanan] = useState(null)
  const [tenaga, setTenaga] = useState(TENAGA_KESEHATAN[0])
  const [tanggal, setTanggal] = useState(null)
  const [waktu, setWaktu] = useState(null)
  const [keluhan, setKeluhan] = useState('')
  const [tanyaKeluhan, setTanyaKeluhan] = useState(false)
  const [konfirmasi, setKonfirmasi] = useState(false)
  const [sibuk, setSibuk] = useState(false)
  const [sukses, setSukses] = useState(null)
  const [tampilSemuaLayanan, setTampilSemuaLayanan] = useState(false)
  const [tanggalTampil, setTanggalTampil] = useState(false)

  const tanggalOpsi = useMemo(daftarTanggal, [])
  const terisi = tanggal ? slotTerisi(tanggal) : new Set()

  // Langkah hanya boleh maju kalau pertanyaannya sudah dijawab.
  const bisaLanjut =
    (langkah === 1 && !!layanan) ||
    (langkah === 2 && !!tenaga) ||
    (langkah === 3 && !!tanggal) ||
    (langkah === 4 && !!waktu) ||
    langkah === 5

  const kembali = () => {
    if (langkah > 1) setLangkah((n) => n - 1)
    else nav(-1)
  }

  const simpan = async () => {
    setSibuk(true)
    try {
      const a = await buatAppointment({
        id_bidan: tenaga.id,
        jenis_layanan: layanan,
        tanggal,
        waktu,
        keluhan: keluhan.trim(),
      })
      setKonfirmasi(false)
      setSukses(a)
    } catch (e) {
      beriToast(e.message, 'galat')
    } finally {
      setSibuk(false)
    }
  }

  // ------------------------------------------------------------------
  // Layar sukses (brief §28)
  // ------------------------------------------------------------------
  if (sukses) {
    return (
      <div className="space-y-5">
        <Kartu className="space-y-4 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-signal-green-soft)] text-[var(--color-signal-green)]">
            <IconCentangBulat size={44} weight="fill" />
          </span>
          <div>
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-primary">
              Janji Temu Berhasil Dibuat
            </h1>
            <p className="mx-auto mt-2 max-w-[38ch] text-[17px] leading-relaxed text-secondary">
              Janji temu Anda dengan {tenaga.profesi} {tenaga.nama.split(',')[0]} pada{' '}
              <span className="font-semibold text-primary">{fmtTanggalPanjang(tanggal)}</span> pukul{' '}
              <span className="numeric font-semibold text-primary">{fmtJam(waktu)} WIB</span> sudah tercatat.
            </p>
          </div>
          <p className="rounded-[var(--radius-control)] surface-sunken px-4 py-3 text-left text-[16px] leading-relaxed text-secondary">
            Klinik akan mengonfirmasi jadwal Anda. Anda akan menerima pemberitahuan di menu Notifikasi
            begitu jadwal disetujui.
          </p>
        </Kartu>

        <Tombol size="lg" penuh onClick={() => nav('/appointment')}>
          Lihat Janji Temu
        </Tombol>
        <Tombol variant="secondary" size="lg" penuh onClick={() => nav('/')}>
          Kembali ke Beranda
        </Tombol>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Wizard
  // ------------------------------------------------------------------
  return (
    <div className="space-y-5">
      {/* Indikator langkah: pasien harus selalu tahu ia di mana
          (brief §24). */}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[17px] font-bold text-accent">
            Langkah {langkah} dari {JUMLAH_LANGKAH}
          </p>
          <p className="text-[17px] font-semibold text-primary">{JUDUL_LANGKAH[langkah - 1]}</p>
        </div>
        <div
          className="mt-2 flex gap-1.5"
          role="progressbar"
          aria-valuenow={langkah}
          aria-valuemin={1}
          aria-valuemax={JUMLAH_LANGKAH}
          aria-label={`Langkah ${langkah} dari ${JUMLAH_LANGKAH}`}
        >
          {Array.from({ length: JUMLAH_LANGKAH }, (_, i) => (
            <span key={i} className={`h-2 flex-1 rounded-full ${i < langkah ? 'bg-accent' : 'bg-[var(--border-strong)]'}`} />
          ))}
        </div>
      </div>

      {/* --- Langkah 1: layanan --- */}
      {langkah === 1 && (
        <section className="space-y-3">
          <h2 className="text-[20.5px] font-bold tracking-tight text-primary">Anda perlu layanan apa?</h2>
          <p className="text-[16px] leading-relaxed text-secondary">
            Pilih yang paling mendekati. Bidan akan mengarahkan bila kurang tepat.
          </p>
          <div className="space-y-2.5">
            {(tampilSemuaLayanan ? LAYANAN : LAYANAN.filter((l) => l.utama)).map((l) => (
              <PilihanKotak
                key={l.id}
                Ikon={l.Ikon}
                judul={l.nama}
                ket={l.ket}
                terpilih={layanan === l.id}
                onClick={() => setLayanan(l.id)}
              />
            ))}
          </div>

          {/* Sisa layanan disembunyikan supaya layar pertama tetap
              ringkas (brief §1: maksimal 3-5 tindakan per layar). */}
          {!tampilSemuaLayanan && (
            <Tombol variant="secondary" penuh onClick={() => setTampilSemuaLayanan(true)}>
              Lihat Layanan Lainnya
            </Tombol>
          )}
        </section>
      )}

      {/* --- Langkah 2: tenaga kesehatan --- */}
      {langkah === 2 && (
        <section className="space-y-3">
          <h2 className="text-[20.5px] font-bold tracking-tight text-primary">
            Siapa yang akan memeriksa Anda?
          </h2>
          <div className="space-y-2.5">
            {TENAGA_KESEHATAN.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTenaga(t)}
                aria-pressed={tenaga?.id === t.id}
                className={`flex w-full items-center gap-4 rounded-[var(--radius-card)] border-2 px-4 py-4 text-left transition-colors ${
                  tenaga?.id === t.id ? 'border-[var(--accent)] permukaan-1' : 'border-hairline surface-raised'
                }`}
              >
                <AvatarPasien nama={t.nama} size={56} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[18px] font-bold leading-snug text-primary">{t.nama}</span>
                  <span className="mt-0.5 block text-[16px] font-semibold text-accent">{t.profesi}</span>
                  <span className="mt-0.5 block text-[15.5px] leading-snug text-secondary">{t.ket}</span>
                </span>
                {tenaga?.id === t.id && (
                  <IconCentangBulat size={26} weight="fill" className="shrink-0 text-accent" />
                )}
              </button>
            ))}
          </div>
          <p className="rounded-[var(--radius-control)] surface-sunken px-4 py-3 text-[16px] leading-relaxed text-secondary">
            Belum tahu harus memilih siapa? Pilih Bidan Siska. Beliau akan mengarahkan Anda ke tenaga
            yang tepat saat Anda datang.
          </p>
        </section>
      )}

      {/* --- Langkah 3: tanggal --- */}
      {langkah === 3 && (
        <section className="space-y-3">
          <h2 className="text-[20.5px] font-bold tracking-tight text-primary">Pilih tanggal kunjungan</h2>
          <p className="text-[16px] leading-relaxed text-secondary">
            Ketuk tanggal yang Anda inginkan. Hari Minggu klinik tutup.
          </p>

          {/* Brief §28: "Jangan mengandalkan swipe untuk fungsi
              penting". Karena itu tanggal disusun sebagai kisi 3 kolom
              yang muat di layar - tidak ada geser ke samping. Hanya 6
              tanggal terdekat yang ditampilkan; sisanya dibuka dengan
              satu tombol jelas. */}
          <div className="grid grid-cols-3 gap-2.5">
            {(tanggalTampil ? tanggalOpsi : tanggalOpsi.slice(0, 6)).map((t) => (
              <button
                key={t.iso}
                type="button"
                disabled={t.minggu}
                onClick={() => {
                  setTanggal(t.iso)
                  setWaktu(null)
                }}
                aria-pressed={tanggal === t.iso}
                aria-label={t.lengkap}
                className={`flex min-h-24 flex-col items-center justify-center rounded-[var(--radius-card)] border-2 px-2 py-2.5 transition-colors ${
                  t.minggu
                    ? 'cursor-not-allowed border-hairline surface-sunken text-muted'
                    : tanggal === t.iso
                      ? 'border-[var(--accent)] permukaan-1 text-accent'
                      : 'border-hairline surface-raised text-primary'
                }`}
              >
                <span className="text-[15px] font-medium">{t.hariSingkat}</span>
                <span className="numeric text-[24px] font-bold leading-none">{t.hari}</span>
                <span className="text-[15px]">{t.bulan}</span>
                {t.minggu && <span className="mt-0.5 text-[15px] font-semibold">Tutup</span>}
              </button>
            ))}
          </div>

          {!tanggalTampil && tanggalOpsi.length > 6 && (
            <Tombol variant="secondary" penuh onClick={() => setTanggalTampil(true)}>
              Lihat Tanggal Lainnya
            </Tombol>
          )}

          {tanggal && (
            <p className="flex items-center gap-2.5 rounded-[var(--radius-control)] permukaan-1 px-4 py-3 text-[16px] font-semibold text-accent">
              <IconKalender size={19} weight="bold" />
              {fmtTanggalPanjang(tanggal)}
            </p>
          )}
        </section>
      )}

      {/* --- Langkah 4: waktu --- */}
      {langkah === 4 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-[20.5px] font-bold tracking-tight text-primary">Pilih jam kedatangan</h2>
            <p className="mt-1 text-[16px] font-medium text-secondary">{fmtTanggalPanjang(tanggal)}</p>
          </div>

          {/* Slot dibagi pagi dan siang-sore supaya 16 tombol tidak
              jadi satu dinding angka (brief §1). */}
          <KelompokJam
            judul="Pagi"
            jam={JAM_PAGI}
            waktu={waktu}
            terisi={terisi}
            onPilih={setWaktu}
          />
          <KelompokJam
            judul="Siang sampai sore"
            jam={JAM_SIANG}
            waktu={waktu}
            terisi={terisi}
            onPilih={setWaktu}
          />

          <p className="rounded-[var(--radius-control)] surface-sunken px-4 py-3 text-[16px] leading-relaxed text-secondary">
            Jam yang bertanda "Sudah terisi" tidak dapat dipilih. Silakan pilih jam yang lain.
          </p>

          {/* Keluhan bersifat pilihan: pasien yang tidak nyaman menulis
              tetap bisa menyelesaikan janji temu. */}
          <Tombol variant="secondary" penuh onClick={() => setTanyaKeluhan(true)}>
            <IconCatatan size={19} weight="bold" />
            {keluhan ? 'Ubah keluhan saya' : 'Tambahkan keluhan (boleh dikosongkan)'}
          </Tombol>
          {keluhan && (
            <p className="rounded-[var(--radius-control)] border border-hairline px-4 py-3 text-[16px] leading-relaxed text-secondary">
              {keluhan}
            </p>
          )}
        </section>
      )}

      {/* --- Langkah 5: konfirmasi --- */}
      {langkah === 5 && (
        <section className="space-y-3">
          <h2 className="text-[20.5px] font-bold tracking-tight text-primary">
            Periksa kembali janji temu Anda
          </h2>

          <Kartu className="divide-y divide-[var(--border-hairline)]">
            <BarisInfo label="Layanan">{layanan}</BarisInfo>
            <BarisInfo label="Tenaga kesehatan">
              <span className="block">
                {tenaga.nama}
                <span className="mt-0.5 block text-[15.5px] font-normal text-secondary">{tenaga.profesi}</span>
              </span>
            </BarisInfo>
            <BarisInfo label="Tanggal">{fmtTanggalPanjang(tanggal)}</BarisInfo>
            <BarisInfo label="Waktu">
              <span className="numeric">{fmtJam(waktu)} WIB</span>
            </BarisInfo>
            <BarisInfo label="Tempat">{KLINIK.nama}</BarisInfo>
            {keluhan && <BarisInfo label="Keluhan">{keluhan}</BarisInfo>}
          </Kartu>

          <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-blue-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-blue)]">
            <IconTanya size={19} weight="bold" className="mt-0.5 shrink-0" />
            <span>
              Status janji Anda akan "Menunggu Konfirmasi" sampai klinik menyetujui. Anda akan menerima
              pemberitahuan saat jadwal disetujui.
            </span>
          </p>
        </section>
      )}

      {/* --- Tombol tindakan --- */}
      <div className="space-y-2.5 pt-1">
        {langkah < JUMLAH_LANGKAH ? (
          <Tombol size="lg" penuh disabled={!bisaLanjut} onClick={() => setLangkah((n) => n + 1)}>
            {langkah === 1 && 'Lanjut ke Pilih Tenaga Kesehatan'}
            {langkah === 2 && 'Lanjut ke Pilih Tanggal'}
            {langkah === 3 && 'Lanjut ke Pilih Waktu'}
            {langkah === 4 && 'Lanjut ke Konfirmasi'}
          </Tombol>
        ) : (
          <Tombol size="lg" penuh disabled={sibuk} onClick={() => setKonfirmasi(true)}>
            Buat Janji Temu
          </Tombol>
        )}

        <Tombol variant="secondary" size="lg" penuh onClick={kembali} disabled={sibuk}>
          <IconKembali size={19} weight="bold" />
          {langkah === 1 ? 'Batal' : 'Kembali ke langkah sebelumnya'}
        </Tombol>
      </div>

      {/* Bantuan selalu tersedia (brief §1). */}
      <a
        href={KLINIK.tautanWA('Halo, saya butuh bantuan membuat janji temu di aplikasi Premysis Medika.')}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline surface-raised px-4 py-3.5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-signal-green-solid)] text-white">
          <IconWhatsapp size={21} weight="bold" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold text-primary">Bingung? Hubungi Klinik</span>
          <span className="block text-[15.5px] text-secondary">Bidan akan membantu membuatkan jadwal</span>
        </span>
      </a>

      {/* Lembar keluhan */}
      <Lembar
        buka={tanyaKeluhan}
        onTutup={() => setTanyaKeluhan(false)}
        judul="Keluhan atau keperluan"
        subjudul="Ceritakan singkat agar bidan dapat bersiap. Bagian ini boleh dikosongkan."
        footer={
          <Tombol size="lg" penuh onClick={() => setTanyaKeluhan(false)}>
            Simpan Keluhan
          </Tombol>
        }
      >
        <Kolom
          label="Apa yang Anda rasakan?"
          htmlFor="keluhan"
          bantuan="Contoh: demam sejak kemarin, kontrol kehamilan, atau sakit kepala"
        >
          <AreaTeks
            id="keluhan"
            value={keluhan}
            onChange={(e) => setKeluhan(e.target.value)}
            placeholder="Tulis di sini..."
          />
        </Kolom>
      </Lembar>

      {/* Konfirmasi terakhir (brief §8 langkah 5, §21) */}
      <Konfirmasi
        buka={konfirmasi}
        onTutup={() => setKonfirmasi(false)}
        onYa={simpan}
        sibuk={sibuk}
        tone="primary"
        judul="Buat janji temu ini?"
        pesan={`Janji temu ${layanan} bersama ${tenaga.profesi} ${tenaga.nama.split(',')[0]} pada ${fmtTanggalPanjang(tanggal)} pukul ${fmtJam(waktu)} WIB akan dikirim ke klinik.`}
        labelYa="Ya, Buat Janji Temu"
      />
    </div>
  )
}

// Kelompok slot jam (Pagi / Siang sampai sore).
// Dipisah supaya 16 pilihan tidak tampil sebagai satu dinding angka;
// pasien lansia memilih dari kelompok kecil yang berlabel jelas.
function KelompokJam({ judul, jam, waktu, terisi, onPilih }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[17px] font-semibold text-primary">{judul}</p>
      <div className="grid grid-cols-3 gap-2.5">
        {jam.map((s) => (
          <SlotWaktu
            key={s}
            waktu={s}
            terpilih={waktu === s}
            terisi={terisi.has(s)}
            onClick={() => onPilih(s)}
          />
        ))}
      </div>
    </div>
  )
}
