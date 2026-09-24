import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useStore } from '../lib/store'
import {
  Kartu, KepalaHalaman, JudulSeksi, Tombol, Kolom, Input, Lembar, Konfirmasi, Lencana,
  Kosong, Memuat, Galat, BarisInfo, PilihanKotak,
} from '../components/ui'
import {
  IconLokasi, IconTambah, IconEdit, IconHapus, IconCentangBulat, IconKirim, IconPeringatan,
  IconLokasiSaya, IconTerverifikasi,
} from '../components/Icons'
import { IlustrasiAlamat, IlustrasiPengiriman, IlustrasiKosong } from '../components/Ilustrasi'
import { fmtRupiah } from '../../../shared/format'

// Halaman Pengaturan Pengiriman.
//
// Dua bagian: daftar alamat pengiriman (bisa tambah, ubah, hapus,
// jadikan utama) dan informasi metode pengiriman beserta biayanya.
// Biaya dihitung server lewat contoh berat 1 kg, jadi angkanya
// konsisten dengan yang muncul saat checkout.
const KOSONG = {
  label: 'Rumah',
  recipient_name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  postal_code: '',
  address_line: '',
  is_default: false,
}

const LABEL_ALAMAT = ['Rumah', 'Kantor', 'Kos', 'Lainnya']

export default function PengaturanPengiriman() {
  const {
    user, alamat, tambahAlamat, ubahAlamat, hapusAlamat, jadikanAlamatUtama, beriToast,
  } = useStore()

  const [metode, setMetode] = useState(null)
  const [galatMetode, setGalatMetode] = useState('')
  const [lembar, setLembar] = useState(null) // null | { mode: 'tambah' | 'ubah', data }
  const [form, setForm] = useState(KOSONG)
  const [galatForm, setGalatForm] = useState({})
  const [sibuk, setSibuk] = useState(false)
  const [hapusTarget, setHapusTarget] = useState(null)

  useEffect(() => {
    let batal = false
    api
      .metodeKirim()
      .then((r) => !batal && setMetode(r.data || r || []))
      .catch((e) => !batal && setGalatMetode(e.message))
    return () => {
      batal = true
    }
  }, [])

  const bukaTambah = () => {
    setForm({ ...KOSONG, recipient_name: user?.name || '', phone: user?.phone || '' })
    setGalatForm({})
    setLembar({ mode: 'tambah' })
  }

  const bukaUbah = (a) => {
    setForm({
      label: a.label || 'Rumah',
      recipient_name: a.recipient_name || '',
      phone: a.phone || '',
      province: a.province || '',
      city: a.city || '',
      district: a.district || '',
      postal_code: a.postal_code || '',
      address_line: a.address_line || '',
      is_default: !!a.is_default,
    })
    setGalatForm({})
    setLembar({ mode: 'ubah', id: a.id })
  }

  const ubah = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setGalatForm((g) => ({ ...g, [k]: undefined, umum: undefined }))
  }

  const periksa = () => {
    const g = {}
    if (!form.recipient_name.trim()) g.recipient_name = 'Nama penerima wajib diisi.'
    if (!form.phone.trim()) g.phone = 'Nomor HP penerima wajib diisi.'
    else if (!/^[0-9+\-\s()]{8,20}$/.test(form.phone.trim())) g.phone = 'Nomor HP tidak valid. Contoh: 0812-3456-7890'
    if (!form.address_line.trim()) g.address_line = 'Alamat lengkap wajib diisi.'
    if (!form.city.trim()) g.city = 'Kota atau kabupaten wajib diisi.'
    if (!form.district.trim()) g.district = 'Kecamatan wajib diisi.'
    return g
  }

  const simpan = async (e) => {
    e?.preventDefault()
    const g = periksa()
    setGalatForm(g)
    if (Object.keys(g).length) return

    setSibuk(true)
    try {
      const payload = { ...form }
      if (lembar.mode === 'ubah') await ubahAlamat(lembar.id, payload)
      else await tambahAlamat(payload)
      setLembar(null)
    } catch (err) {
      beriToast(err.message, 'galat')
      setGalatForm({ umum: err.message })
    } finally {
      setSibuk(false)
    }
  }

  const lakukanHapus = async () => {
    setSibuk(true)
    try {
      await hapusAlamat(hapusTarget.id)
      setHapusTarget(null)
    } catch (err) {
      beriToast(err.message, 'galat')
    } finally {
      setSibuk(false)
    }
  }

  const daftar = alamat || []

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <KepalaHalaman
        className="lg:col-span-2"
        judul="Pengaturan Pengiriman"
        pengantar="Atur alamat dan pilih cara pengiriman yang paling nyaman untuk Anda."
        ilustrasi={<IlustrasiAlamat size={148} />}
      />

      {/* --- Alamat --- */}
      <section className="lg:col-span-1">
        <JudulSeksi aksi={
          <Tombol size="sm" onClick={bukaTambah}>
            <IconTambah size={18} weight="bold" />
            Tambah
          </Tombol>
        }>
          Alamat Pengiriman
        </JudulSeksi>

        {daftar.length === 0 ? (
          <Kartu padat>
            <Kosong
              judul="Belum ada alamat"
              pesan="Tambahkan alamat pengiriman agar pesanan obat bisa dikirim ke tempat Anda."
              ilustrasi={<IlustrasiKosong size={128} />}
              aksi={
                <Tombol size="lg" onClick={bukaTambah}>
                  <IconTambah size={20} weight="bold" />
                  Tambah Alamat
                </Tombol>
              }
            />
          </Kartu>
        ) : (
          <ul className="space-y-3">
            {daftar.map((a) => (
              <li key={a.id}>
                <Kartu className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full permukaan-coral">
                      <IconLokasi size={21} weight="bold" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[17.5px] font-semibold text-primary">{a.recipient_name}</p>
                        <Lencana tone="neutral">{a.label || 'Alamat'}</Lencana>
                        {a.is_default && (
                          <Lencana tone="green" ikon={<IconTerverifikasi size={14} weight="bold" />}>
                            Utama
                          </Lencana>
                        )}
                      </div>
                      <p className="numeric mt-1 text-[15.5px] text-secondary">{a.phone}</p>
                    </div>
                  </div>

                  <p className="text-[16.5px] leading-relaxed text-secondary">
                    {a.address_line}
                    {a.district ? `, Kec. ${a.district}` : ''}
                    {a.city ? `, ${a.city}` : ''}
                    {a.province ? `, ${a.province}` : ''}
                    {a.postal_code ? ` ${a.postal_code}` : ''}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {!a.is_default && (
                      <Tombol size="sm" variant="secondary" onClick={() => jadikanAlamatUtama(a.id)}>
                        <IconCentangBulat size={17} weight="bold" />
                        Jadikan Utama
                      </Tombol>
                    )}
                    <Tombol size="sm" variant="secondary" onClick={() => bukaUbah(a)}>
                      <IconEdit size={17} weight="bold" />
                      Ubah
                    </Tombol>
                    <Tombol size="sm" variant="ghost" onClick={() => setHapusTarget(a)}>
                      <IconHapus size={17} weight="bold" />
                      Hapus
                    </Tombol>
                  </div>
                </Kartu>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Metode pengiriman & biaya --- */}
      <section className="lg:col-span-1">
        <JudulSeksi>Metode Pengiriman &amp; Biaya</JudulSeksi>

        {galatMetode ? (
          <Galat judul="Gagal memuat metode kirim" pesan={galatMetode} onCoba={() => window.location.reload()} />
        ) : !metode ? (
          <Memuat baris={2} />
        ) : metode.length === 0 ? (
          <Kartu>
            <p className="text-[16.5px] text-secondary">Belum ada metode pengiriman yang aktif.</p>
          </Kartu>
        ) : (
          <>
            <ul className="space-y-2.5">
              {metode.map((m) => {
                const pickup = m.code === 'PICKUP'
                const contoh = (m.base_cost || 0) + (m.cost_per_kg || 0) * 1
                return (
                  <li key={m.id}>
                    <Kartu className="space-y-3">
                      <div className="flex items-start gap-3.5">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${pickup ? 'permukaan-honey' : 'permukaan-sky'}`}>
                          {pickup ? <IconLokasiSaya size={22} weight="bold" /> : <IconKirim size={22} weight="bold" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[17.5px] font-semibold leading-snug text-primary">{m.name}</p>
                          <p className="mt-0.5 text-[15.5px] text-secondary">
                            Estimasi {m.est_days || 'sesuai area'}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[var(--radius-control)] border border-hairline px-4 py-1">
                        <BarisInfo label="Biaya dasar">
                          <span className="numeric">{m.base_cost ? fmtRupiah(m.base_cost) : 'Gratis'}</span>
                        </BarisInfo>
                        {m.cost_per_kg > 0 && (
                          <BarisInfo label="Tambahan per kg">
                            <span className="numeric">{fmtRupiah(m.cost_per_kg)}</span>
                          </BarisInfo>
                        )}
                        <BarisInfo label="Contoh 1 kg" className="border-t border-hairline">
                          <span className="numeric font-bold text-accent">{contoh ? fmtRupiah(contoh) : 'Gratis'}</span>
                        </BarisInfo>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {m.is_cod_available ? (
                          <Lencana tone="green" ikon={<IconCentangBulat size={14} weight="bold" />}>
                            Bisa bayar di tempat
                          </Lencana>
                        ) : (
                          <Lencana tone="neutral">Bayar di muka</Lencana>
                        )}
                        {pickup && <Lencana tone="accent">Ambil sendiri</Lencana>}
                      </div>
                    </Kartu>
                  </li>
                )
              })}
            </ul>

            <p className="mt-3 flex items-start gap-2 text-[15.5px] leading-relaxed text-muted">
              <IconPeringatan size={17} className="mt-0.5 shrink-0" />
              <span>
                Biaya akhir dihitung dari berat total belanja Anda saat menyelesaikan pesanan. Angka
                di atas adalah gambaran untuk 1 kg.
              </span>
            </p>
          </>
        )}
      </section>

      {/* --- Cara kerja pengiriman --- */}
      <section className="lg:col-span-2">
        <JudulSeksi>Bagaimana Pesanan Dikirim</JudulSeksi>
        <Kartu className="space-y-3">
          <div className="flex justify-center">
            <IlustrasiPengiriman size={150} />
          </div>
          <ol className="space-y-3.5">
            {[
              'Pesanan dan pembayaran Anda kami konfirmasi lebih dulu.',
              'Apoteker menyiapkan dan memeriksa obat, termasuk kelayakan masa simpannya.',
              'Kurir mengantar ke alamat utama, atau Anda bisa memilih Ambil di Apotek.',
              'Anda dapat memantau status pengiriman dari halaman Pesanan.',
            ].map((t, i) => (
              <li key={i} className="flex gap-3.5">
                <span className="numeric flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[15.5px] font-bold text-accent">
                  {i + 1}
                </span>
                <span className="text-[16.5px] leading-relaxed text-secondary">{t}</span>
              </li>
            ))}
          </ol>
        </Kartu>
      </section>

      {/* --- Lembar tambah/ubah alamat --- */}
      <Lembar
        buka={!!lembar}
        onTutup={() => setLembar(null)}
        judul={lembar?.mode === 'ubah' ? 'Ubah Alamat' : 'Tambah Alamat Baru'}
        subjudul="Isi sesuai alamat tempat Anda menerima pesanan."
        footer={
          <div className="space-y-2.5">
            <Tombol size="lg" penuh disabled={sibuk} onClick={simpan}>
              {sibuk ? 'Menyimpan...' : 'Simpan Alamat'}
            </Tombol>
            <Tombol variant="secondary" size="lg" penuh disabled={sibuk} onClick={() => setLembar(null)}>
              Batal
            </Tombol>
          </div>
        }
      >
        <div className="space-y-4">
          <Kolom label="Jenis alamat" wajib>
            <div className="flex flex-wrap gap-2">
              {LABEL_ALAMAT.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => ubah('label', l)}
                  aria-pressed={form.label === l}
                  className={`min-h-11 rounded-full border-2 px-4 text-[16px] font-semibold transition-colors ${
                    form.label === l
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-accent'
                      : 'border-hairline surface-raised text-primary'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </Kolom>

          <Kolom label="Nama penerima" wajib htmlFor="penerima" galat={galatForm.recipient_name}>
            <Input id="penerima" value={form.recipient_name} onChange={(e) => ubah('recipient_name', e.target.value)} placeholder="Nama orang yang menerima" />
          </Kolom>

          <Kolom label="Nomor HP penerima" wajib htmlFor="hp" galat={galatForm.phone}>
            <Input id="hp" type="tel" inputMode="tel" value={form.phone} onChange={(e) => ubah('phone', e.target.value)} placeholder="0812-3456-7890" />
          </Kolom>

          <Kolom label="Alamat lengkap" wajib htmlFor="jalan" galat={galatForm.address_line} bantuan="Nama jalan, nomor rumah, RT/RW, dan patokan bila ada.">
            <Input id="jalan" value={form.address_line} onChange={(e) => ubah('address_line', e.target.value)} placeholder="Contoh: Jl. Ganesha No. 10, RT 02/RW 03" />
          </Kolom>

          <div className="grid grid-cols-2 gap-3">
            <Kolom label="Kecamatan" wajib htmlFor="kec" galat={galatForm.district}>
              <Input id="kec" value={form.district} onChange={(e) => ubah('district', e.target.value)} placeholder="Coblong" />
            </Kolom>
            <Kolom label="Kota/Kabupaten" wajib htmlFor="kota" galat={galatForm.city}>
              <Input id="kota" value={form.city} onChange={(e) => ubah('city', e.target.value)} placeholder="Kota Bandung" />
            </Kolom>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Kolom label="Provinsi" htmlFor="prov">
              <Input id="prov" value={form.province} onChange={(e) => ubah('province', e.target.value)} placeholder="Jawa Barat" />
            </Kolom>
            <Kolom label="Kode pos" htmlFor="pos">
              <Input id="pos" inputMode="numeric" value={form.postal_code} onChange={(e) => ubah('postal_code', e.target.value)} placeholder="40132" />
            </Kolom>
          </div>

          <PilihanKotak
            Ikon={IconTerverifikasi}
            judul="Jadikan alamat utama"
            ket="Alamat utama dipakai otomatis saat Anda menyelesaikan pesanan."
            terpilih={!!form.is_default}
            onClick={() => ubah('is_default', !form.is_default)}
          />

          {galatForm.umum && (
            <p role="alert" className="flex items-start gap-2 text-[16px] leading-relaxed text-[var(--color-signal-rose)]">
              <IconPeringatan size={18} weight="bold" className="mt-0.5 shrink-0" />
              <span>{galatForm.umum}</span>
            </p>
          )}
        </div>
      </Lembar>

      <Konfirmasi
        buka={!!hapusTarget}
        onTutup={() => setHapusTarget(null)}
        onYa={lakukanHapus}
        sibuk={sibuk}
        judul="Hapus alamat ini?"
        pesan={hapusTarget ? `Alamat "${hapusTarget.label}" untuk ${hapusTarget.recipient_name} akan dihapus dari daftar Anda.` : ''}
        labelYa="Ya, Hapus"
      />
    </div>
  )
}
