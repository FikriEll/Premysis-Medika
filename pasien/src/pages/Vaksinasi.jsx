import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtTanggal, labelUsia, usiaBulan, statusVaksin } from '../../../shared/format'
import { Kartu, Tombol, Kolom, Input, Pilih, Lembar, Lencana, Kosong, JudulSeksi } from '../components/ui'
import { IconVaksin, IconTambah, IconJam, IconInfo } from '../components/Icons'
import { IlustrasiBayi } from '../components/Ilustrasi'

// F-06 Vaksinasi Bayi + US-04.
// Daftarkan data bayi lalu lihat jadwal/status vaksin.
// Saat bayi didaftarkan, server otomatis membuat jadwal dari master
// jenis vaksin berdasarkan tanggal lahir (BR-07).
const AWAL = { nama: '', nik: '', tanggal_lahir: '', jenis_kelamin: 'L', nama_orang_tua: '' }

export default function Vaksinasi() {
  const nav = useNavigate()
  const { bayiSaya, jadwalVaksinSaya, tambahBayi, beriToast } = useStore()
  const [buka, setBuka] = useState(false)
  const [form, setForm] = useState(AWAL)
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState(false)

  const ubah = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const simpan = async (e) => {
    e.preventDefault()
    setGalat('')
    if (!form.nama.trim() || !form.tanggal_lahir) {
      setGalat('Nama dan tanggal lahir wajib diisi.')
      return
    }
    setSibuk(true)
    try {
      await tambahBayi({
        nama: form.nama.trim(),
        nik: form.nik.trim(),
        tanggal_lahir: form.tanggal_lahir,
        jenis_kelamin: form.jenis_kelamin,
        nama_orang_tua: form.nama_orang_tua.trim(),
      })
      setForm(AWAL)
      setBuka(false)
    } catch (err) {
      setGalat(err.message)
      beriToast(err.message, 'galat')
    } finally {
      setSibuk(false)
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-[17px] leading-relaxed text-secondary">
        Pantau jadwal imunisasi anak Anda. Klinik akan mengingatkan Anda menjelang jadwal.
      </p>

      <Tombol size="lg" penuh onClick={() => setBuka(true)}>
        <IconTambah size={21} weight="bold" />
        Daftarkan Anak
      </Tombol>

      {bayiSaya.length === 0 ? (
        <Kartu padat>
          <Kosong
            judul="Belum ada data anak"
            pesan="Daftarkan anak Anda agar jadwal imunisasi dapat dibuatkan otomatis sesuai usia."
            ilustrasi={<IlustrasiBayi size={140} />}
            aksi={<Tombol size="lg" onClick={() => setBuka(true)}>Daftarkan Anak</Tombol>}
          />
        </Kartu>
      ) : (
        bayiSaya.map((b) => {
          const jadwal = jadwalVaksinSaya.filter((j) => j.id_bayi === b.id)
          const selesai = jadwal.filter((j) => j.status === 'Selesai').length
          const berikutnya = jadwal.filter((j) => j.status === 'Terjadwal')[0]
          const persen = jadwal.length ? Math.round((selesai / jadwal.length) * 100) : 0

          return (
            <section key={b.id}>
              <JudulSeksi>{b.nama}</JudulSeksi>
              <Kartu className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[16px] text-secondary">
                      {b.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} · {labelUsia(b.tanggal_lahir)}
                    </p>
                    <p className="numeric mt-0.5 text-[15.5px] text-muted">
                      Lahir {fmtTanggal(b.tanggal_lahir)}
                    </p>
                  </div>
                  <Lencana tone={persen === 100 ? 'green' : 'amber'}>
                    {selesai}/{jadwal.length} selesai
                  </Lencana>
                </div>

                {/* Progres imunisasi */}
                <div>
                  <div className="h-2 overflow-hidden rounded-full surface-sunken">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-300"
                      style={{ width: `${persen}%` }}
                    />
                  </div>
                  <p className="numeric mt-1.5 text-[15.5px] text-muted">{persen}% imunisasi dasar selesai</p>
                </div>

                {berikutnya && (
                  <div className="flex items-center gap-3 rounded-[var(--radius-control)] bg-[var(--color-signal-amber-soft)] px-3.5 py-3">
                    <span className="shrink-0 text-[var(--color-signal-amber)]">
                      <IconJam size={20} weight="bold" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[17px] font-semibold text-primary">
                        Berikutnya: {berikutnya.nama_vaksin}
                      </p>
                      <p className="numeric text-[16px] text-secondary">
                        {fmtTanggal(berikutnya.tanggal_terjadwal)}
                      </p>
                    </div>
                    <Tombol
                      variant="secondary"
                      onClick={() => nav('/appointment/baru')}
                      className="shrink-0"
                    >
                      Buat Janji
                    </Tombol>
                  </div>
                )}

                {/* Daftar lengkap jadwal */}
                {jadwal.length > 0 && (
                  <ul className="divide-y divide-[var(--border-hairline)] border-t border-hairline">
                    {jadwal.map((j) => (
                      <li key={j.id} className="flex items-center gap-3 py-3">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                            j.status === 'Selesai'
                              ? 'bg-[var(--color-signal-green-soft)] text-[var(--color-signal-green)]'
                              : 'permukaan-2 text-[var(--color-signal-amber)]'
                          }`}
                        >
                          <IconVaksin size={19} weight="bold" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[17px] font-semibold text-primary">{j.nama_vaksin}</p>
                          <p className="numeric text-[15.5px] text-muted">
                            {j.status === 'Selesai'
                              ? `Diberikan ${fmtTanggal(j.tanggal_diberikan || j.tanggal_terjadwal)}`
                              : `Jadwal ${fmtTanggal(j.tanggal_terjadwal)}`}
                          </p>
                        </div>
                        <Lencana tone={statusVaksin[j.status]?.tone}>{statusVaksin[j.status]?.label || j.status}</Lencana>
                      </li>
                    ))}
                  </ul>
                )}
              </Kartu>
            </section>
          )
        })
      )}

      <p className="flex items-start gap-2 rounded-[var(--radius-card)] surface-sunken px-3.5 py-3 text-[15px] leading-relaxed text-secondary">
        <IconInfo size={18} className="mt-px shrink-0" />
        <span>
          Jadwal dibuat otomatis dari master imunisasi dasar sesuai usia anak, dan dapat
          disesuaikan oleh bidan saat kunjungan.
        </span>
      </p>

      {/* Form daftar anak */}
      <Lembar
        buka={buka}
        onTutup={() => setBuka(false)}
        judul="Daftarkan Anak"
        subjudul="Jadwal imunisasi akan dibuat otomatis"
        footer={
          <div className="flex gap-2.5">
            <Tombol variant="secondary" penuh onClick={() => setBuka(false)} disabled={sibuk}>
              Batal
            </Tombol>
            <Tombol penuh onClick={simpan} disabled={sibuk}>
              {sibuk ? 'Menyimpan...' : 'Simpan'}
            </Tombol>
          </div>
        }
      >
        <form onSubmit={simpan} className="space-y-4">
          <Kolom label="Nama anak" wajib htmlFor="bnama">
            <Input id="bnama" value={form.nama} onChange={(e) => ubah('nama', e.target.value)} placeholder="Nama lengkap anak" />
          </Kolom>
          <Kolom label="NIK anak" htmlFor="bnik" bantuan="Bila belum ada, boleh dikosongkan">
            <Input id="bnik" value={form.nik} onChange={(e) => ubah('nik', e.target.value)} inputMode="numeric" placeholder="16 digit" />
          </Kolom>
          <Kolom label="Tanggal lahir" wajib htmlFor="btgl">
            <Input id="btgl" type="date" value={form.tanggal_lahir} onChange={(e) => ubah('tanggal_lahir', e.target.value)} />
          </Kolom>
          <Kolom label="Jenis kelamin" htmlFor="bjk">
            <Pilih id="bjk" value={form.jenis_kelamin} onChange={(e) => ubah('jenis_kelamin', e.target.value)}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </Pilih>
          </Kolom>
          <Kolom label="Nama orang tua" htmlFor="bortu">
            <Input id="bortu" value={form.nama_orang_tua} onChange={(e) => ubah('nama_orang_tua', e.target.value)} placeholder="Nama ibu atau ayah" />
          </Kolom>

          {form.tanggal_lahir && (
            <p className="rounded-[var(--radius-control)] bg-[var(--accent-soft)] px-3.5 py-3 text-[15px] leading-relaxed text-accent">
              Usia saat ini {labelUsia(form.tanggal_lahir)} ({usiaBulan(form.tanggal_lahir)} bulan).
              Jadwal vaksin yang sesuai akan dibuatkan otomatis.
            </p>
          )}

          {galat && (
            <p role="alert" className="text-[15px] text-[var(--color-signal-rose)]">{galat}</p>
          )}
        </form>
      </Lembar>
    </div>
  )
}
