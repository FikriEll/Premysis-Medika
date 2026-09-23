import { useEffect, useState, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import { fmtRupiah } from '../../../shared/format'
import {
  Kartu, Tombol, Kolom, Input, AreaTeks, JudulSeksi, BarisInfo, PilihanKotak, Konfirmasi, Lencana,
} from '../components/ui'
import {
  IconLokasi, IconLokasiSaya, IconKirim, IconDompet, IconPeringatan, IconKembali,
  IconCentangBulat, IconJam,
} from '../components/Icons'
import { KLINIK } from '../lib/layanan'

// Peta dimuat hanya saat benar-benar dipakai, supaya pasien yang
// memilih "Ambil di Klinik" tidak mengunduh pustaka peta (~150 kB).
const PetaLokasi = lazy(() => import('../components/PetaLokasi'))

// Kerangka peta sambil menunggu pustaka selesai diunduh.
function KerangkaPeta({ tinggi = 260 }) {
  return (
    <div
      className="flex items-center justify-center rounded-[var(--radius-card)] border border-strong surface-sunken"
      style={{ height: tinggi }}
      role="status"
    >
      <p className="text-[16px] text-secondary">Menyiapkan peta...</p>
    </div>
  )
}

// F-08 Checkout - brief §13 (3 langkah).
//
//   1. Ambil di Klinik atau Kirim ke Alamat (dengan peta + jarak)
//   2. Cara bayar
//   3. Konfirmasi pesanan
//
// Dua aturan dari pemilik klinik ditegakkan di sini DAN di server:
//
//   a. Pembayaran Tunai hanya untuk "Ambil di Klinik". Kalau barang
//      dikirim, uang harus sudah diterima sebelum kurir berangkat,
//      jadi pilihannya Transfer saja.
//   b. Jarak ke klinik menentukan cara kirim dan ongkirnya. Kalau
//      perjalanannya lebih dari 1 hari, pesanan tidak boleh dibuat.
//
// Ongkir TIDAK dihitung di sini. Angkanya datang dari server
// (POST /api/pengiriman/hitung) supaya pasien tidak bisa memalsukan
// jarak, dan supaya angka di layar sama dengan yang ditegakkan saat
// checkout.
const LANGKAH = ['Terima Pesanan', 'Cara Bayar', 'Konfirmasi Pesanan']

export default function Checkout() {
  const nav = useNavigate()
  const { itemKeranjang, subtotal, user, checkout, beriToast } = useStore()
  const [langkah, setLangkah] = useState(1)
  const [ambil, setAmbil] = useState('Ambil di Klinik')
  const [bayar, setBayar] = useState('Transfer Bank')
  const [alamat, setAlamat] = useState(user?.alamat || '')
  const [catatan, setCatatan] = useState('')
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState(false)
  const [tanya, setTanya] = useState(false)

  // Titik lokasi kirim + hasil hitungan server.
  const [titik, setTitik] = useState(null)
  const [info, setInfo] = useState(null)
  const [hitung, setHitung] = useState(false)
  const [cariLokasi, setCariLokasi] = useState(false)
  const [galatPeta, setGalatPeta] = useState('')

  const kirim = ambil === 'Dikirim'

  // Setiap titik berubah, tanya server: berapa jaraknya, kena
  // ongkir berapa, dan boleh dikirim atau tidak.
  useEffect(() => {
    if (!kirim || !titik) {
      setInfo(null)
      return
    }
    let batal = false
    setHitung(true)
    setGalatPeta('')
    api
      .hitungPengiriman(titik.lat, titik.lng)
      .then((h) => {
        if (!batal) setInfo(h)
      })
      .catch((e) => {
        if (!batal) setGalatPeta(e.message || 'Tidak bisa menghitung jarak.')
      })
      .finally(() => {
        if (!batal) setHitung(false)
      })
    return () => {
      batal = true
    }
  }, [titik, kirim])

  // Saat pindah ke "Ambil di Klinik", Tunai selalu aman.
  // Saat pindah ke "Kirim ke Alamat", Tunai tidak berlaku.
  useEffect(() => {
    if (kirim && bayar === 'Tunai') setBayar('Transfer Bank')
  }, [kirim, bayar])

  const biayaKirim = kirim && info?.boleh ? info.ongkir : 0
  const total = subtotal + biayaKirim
  const kejauhan = kirim && info && !info.boleh

  const pakaiLokasiSaya = () => {
    setGalatPeta('')
    if (!navigator.geolocation) {
      setGalatPeta('Ponsel ini tidak bisa membaca lokasi otomatis. Silakan ketuk peta untuk menandai lokasi kirim.')
      return
    }
    setCariLokasi(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTitik({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setCariLokasi(false)
      },
      () => {
        setGalatPeta('Izin lokasi tidak diberikan. Silakan ketuk peta untuk menandai lokasi kirim.')
        setCariLokasi(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  if (itemKeranjang.length === 0) {
    return (
      <Kartu>
        <p className="text-[17px] leading-relaxed text-secondary">
          Keranjang Anda masih kosong, belum ada yang bisa dipesan.
        </p>
        <Tombol className="mt-4" size="lg" penuh onClick={() => nav('/toko')}>
          Beli Obat
        </Tombol>
      </Kartu>
    )
  }

  const proses = async () => {
    setGalat('')
    if (kirim && !alamat.trim()) {
      setGalat('Alamat pengiriman wajib diisi bila memilih Kirim ke Alamat.')
      setLangkah(1)
      return
    }
    if (kirim && !titik) {
      setGalat('Tandai lokasi kirim di peta dulu, supaya klinik tahu jaraknya.')
      setLangkah(1)
      return
    }
    if (kejauhan) {
      setGalat(info.alasan)
      setLangkah(1)
      return
    }
    setSibuk(true)
    try {
      const pesanan = await checkout({
        id_pasien: user.id,
        items: itemKeranjang.map((x) => ({ id_produk: x.id_produk, jumlah: x.jumlah })),
        metode_ambil: ambil,
        metode_bayar: bayar,
        alamat_pengiriman: kirim ? alamat.trim() : '-',
        titik_tujuan: kirim ? titik : null,
        catatan: catatan.trim(),
      })
      setTanya(false)
      // Transfer Bank: arahkan langsung ke langkah pembayaran supaya
      // pasien tidak lupa membayar (Fitur Minimal #5). Tunai tetap ke
      // daftar pesanan karena dibayar saat mengambil di klinik.
      if (pesanan.metode_bayar === 'Transfer Bank') {
        nav(`/pesanan/${pesanan.id}/bayar`, { replace: true })
      } else {
        nav('/pesanan', { replace: true, state: { sorot: pesanan.id } })
      }
    } catch (e) {
      setGalat(e.message)
      beriToast(e.message, 'galat')
      setTanya(false)
    } finally {
      setSibuk(false)
    }
  }

  const bisaLanjut =
    langkah === 1 ? !kirim || (alamat.trim() && titik && info?.boleh) : true

  return (
    <div className="space-y-5">
      {/* Indikator langkah */}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[17px] font-bold text-accent">Langkah {langkah} dari 3</p>
          <p className="text-[17px] font-semibold text-primary">{LANGKAH[langkah - 1]}</p>
        </div>
        <div
          className="mt-2 flex gap-1.5"
          role="progressbar"
          aria-valuenow={langkah}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Langkah ${langkah} dari 3`}
        >
          {[1, 2, 3].map((i) => (
            <span key={i} className={`h-2 flex-1 rounded-full ${i <= langkah ? 'bg-accent' : 'bg-[var(--border-strong)]'}`} />
          ))}
        </div>
      </div>

      {/* --- Langkah 1: ambil atau kirim --- */}
      {langkah === 1 && (
        <section className="space-y-3">
          <h2 className="text-[20.5px] font-bold tracking-tight text-primary">
            Bagaimana Anda ingin menerima pesanan?
          </h2>

          <div className="space-y-2.5">
            <PilihanKotak
              Ikon={IconLokasi}
              judul="Ambil di Klinik"
              ket="Tanpa biaya kirim. Bisa bayar tunai di klinik."
              terpilih={ambil === 'Ambil di Klinik'}
              onClick={() => setAmbil('Ambil di Klinik')}
            />
            <PilihanKotak
              Ikon={IconKirim}
              judul="Kirim ke Alamat"
              ket="Diantar kurir. Ongkos kirim sesuai jarak dari klinik."
              terpilih={ambil === 'Dikirim'}
              onClick={() => setAmbil('Dikirim')}
            />
          </div>

          {ambil === 'Ambil di Klinik' && (
            <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3.5">
              <p className="text-[16px] font-semibold text-primary">Alamat pengambilan</p>
              <p className="mt-1 text-[16px] leading-relaxed text-secondary">{KLINIK.alamat}</p>
              <p className="numeric mt-1 text-[16px] text-secondary">{KLINIK.telepon}</p>
            </div>
          )}

          {kirim && (
            <>
              <Kolom
                label="Alamat pengiriman"
                wajib
                htmlFor="alamat"
                bantuan="Tulis nama jalan, nomor rumah, kelurahan, dan kota."
              >
                <AreaTeks
                  id="alamat"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Melati No. 12, Depok"
                />
              </Kolom>

              {/* Peta penanda lokasi kirim */}
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[17px] font-bold text-primary">Tandai lokasi kirim</p>
                  <Lencana tone={info?.boleh === false ? 'rose' : 'neutral'} ikon={IconLokasi}>
                    {info?.boleh === false ? 'Di luar jangkauan' : 'Peta'}
                  </Lencana>
                </div>
                <p className="text-[16px] leading-relaxed text-secondary">
                  Ketuk peta untuk menaruh pin, atau tekan tombol di bawah untuk memakai
                  lokasi Anda sekarang. Titik ini dipakai untuk menghitung jarak dari klinik.
                </p>

                <Suspense fallback={<KerangkaPeta tinggi={260} />}>
                  <PetaLokasi titikAwal={titik} onPilih={setTitik} tinggi={260} />
                </Suspense>

                <Tombol
                  variant="secondary"
                  size="lg"
                  penuh
                  disabled={cariLokasi}
                  onClick={pakaiLokasiSaya}
                >
                  <IconLokasiSaya size={20} weight="bold" />
                  {cariLokasi ? 'Mencari lokasi...' : 'Pakai Lokasi Saya'}
                </Tombol>

                {galatPeta && (
                  <p role="alert" className="text-[16px] leading-relaxed text-[var(--color-signal-rose)]">
                    {galatPeta}
                  </p>
                )}

                {!titik && !galatPeta && (
                  <p className="text-[16px] leading-relaxed text-muted">
                    Lokasi kirim belum ditandai.
                  </p>
                )}

                {hitung && (
                  <p className="text-[16px] text-secondary" role="status">
                    Menghitung jarak dari klinik...
                  </p>
                )}

                {/* Hasil hitungan: boleh kirim */}
                {info?.boleh && (
                  <div className="rounded-[var(--radius-card)] surface-1 px-4 py-3.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[17px] font-bold text-primary">
                        {info.jarak_km} km dari klinik
                      </p>
                      <Lencana tone="green">{info.label_zona}</Lencana>
                    </div>
                    <dl className="mt-2.5 space-y-1.5 text-[16px] leading-relaxed">
                      <div className="flex justify-between gap-3">
                        <dt className="text-secondary">Dikirim dengan</dt>
                        <dd className="text-right font-semibold text-primary">{info.kurir}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-secondary">Perkiraan sampai</dt>
                        <dd className="numeric text-right font-semibold text-primary">
                          sekitar {info.estimasi_jam} jam
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-secondary">Ongkos kirim</dt>
                        <dd className="numeric text-right font-semibold text-accent">
                          {fmtRupiah(info.ongkir)}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-2.5 text-[15.5px] leading-relaxed text-muted">
                      Ongkos kirim adalah perkiraan dari jarak. Tarif resmi kurir bisa berbeda
                      sedikit dan akan dikonfirmasi klinik.
                    </p>
                  </div>
                )}

                {/* Hasil hitungan: kejauhan, tidak boleh pesan */}
                {kejauhan && (
                  <div
                    role="alert"
                    className="rounded-[var(--radius-card)] bg-[var(--color-signal-rose-soft)] px-4 py-3.5"
                  >
                    <p className="flex items-center gap-2.5 text-[17px] font-bold text-[var(--color-signal-rose)]">
                      <IconPeringatan size={21} weight="bold" className="shrink-0" />
                      Tidak bisa dikirim ke lokasi ini
                    </p>
                    <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-signal-rose)]">
                      {info.alasan}
                    </p>
                    <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-signal-rose)]">
                      {info.saran}
                    </p>
                    <Tombol
                      className="mt-3"
                      variant="secondary"
                      size="lg"
                      penuh
                      onClick={() => {
                        setAmbil('Ambil di Klinik')
                        setTitik(null)
                        setInfo(null)
                      }}
                    >
                      <IconLokasi size={20} weight="bold" />
                      Ganti ke Ambil di Klinik
                    </Tombol>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* --- Langkah 2: cara bayar --- */}
      {langkah === 2 && (
        <section className="space-y-3">
          <h2 className="text-[20.5px] font-bold tracking-tight text-primary">
            Bagaimana Anda ingin membayar?
          </h2>
          <div className="space-y-2.5">
            <PilihanKotak
              Ikon={IconDompet}
              judul="Transfer Bank"
              ket="Bayar lewat transfer, lalu kirim bukti ke klinik"
              terpilih={bayar === 'Transfer Bank'}
              onClick={() => setBayar('Transfer Bank')}
            />
            {/* Tunai hanya untuk pengambilan di klinik (aturan pemilik
                klinik). Saat barang dikirim, opsi ini disembunyikan. */}
            {!kirim ? (
              <PilihanKotak
                Ikon={IconDompet}
                judul="Tunai"
                ket="Bayar langsung saat mengambil pesanan di klinik"
                terpilih={bayar === 'Tunai'}
                onClick={() => setBayar('Tunai')}
              />
            ) : (
              <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3.5">
                <p className="flex items-center gap-2.5 text-[16px] leading-relaxed text-secondary">
                  <IconPeringatan size={19} weight="bold" className="shrink-0 text-muted" />
                  <span>
                    Pembayaran tunai tidak tersedia untuk pesanan yang dikirim. Uang harus
                    sudah diterima klinik sebelum kurir berangkat, jadi silakan pakai Transfer
                    Bank. Ingin bayar tunai? Pilih <strong className="font-semibold text-primary">Ambil di Klinik</strong>.
                  </span>
                </p>
              </div>
            )}
          </div>

          <Kolom label="Catatan untuk klinik" htmlFor="catatan" bantuan="Boleh dikosongkan.">
            <Input
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: tolong siapkan sebelum jam 3 sore"
            />
          </Kolom>
        </section>
      )}

      {/* --- Langkah 3: konfirmasi --- */}
      {langkah === 3 && (
        <section className="space-y-3">
          <h2 className="text-[20.5px] font-bold tracking-tight text-primary">
            Periksa kembali pesanan Anda
          </h2>

          <Kartu>
            <JudulSeksi>Barang yang dipesan</JudulSeksi>
            <ul className="divide-y divide-[var(--border-hairline)]">
              {itemKeranjang.map((x) => (
                <li key={x.id_produk} className="flex items-start justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-[17px] font-medium text-primary">{x.produk.nama}</span>
                    <span className="numeric block text-[15.5px] text-secondary">
                      {x.jumlah} x {fmtRupiah(x.produk.harga)}
                    </span>
                  </span>
                  <span className="numeric shrink-0 text-[17px] font-semibold text-primary">
                    {fmtRupiah(x.produk.harga * x.jumlah)}
                  </span>
                </li>
              ))}
            </ul>
          </Kartu>

          <Kartu className="divide-y divide-[var(--border-hairline)]">
            <BarisInfo label="Cara terima">{kirim ? 'Kirim ke Alamat' : 'Ambil di Klinik'}</BarisInfo>
            {kirim && <BarisInfo label="Alamat">{alamat}</BarisInfo>}
            {kirim && info?.boleh && (
              <>
                <BarisInfo label="Jarak dari klinik">
                  <span className="numeric">{info.jarak_km} km</span>
                </BarisInfo>
                <BarisInfo label="Dikirim dengan">{info.kurir}</BarisInfo>
                <BarisInfo label="Perkiraan sampai">
                  <span className="flex items-center justify-end gap-1.5">
                    <IconJam size={18} weight="bold" className="text-muted" />
                    sekitar {info.estimasi_jam} jam
                  </span>
                </BarisInfo>
              </>
            )}
            <BarisInfo label="Cara bayar">{bayar}</BarisInfo>
            {catatan && <BarisInfo label="Catatan">{catatan}</BarisInfo>}
          </Kartu>

          <Kartu>
            <BarisInfo label="Subtotal">
              <span className="numeric">{fmtRupiah(subtotal)}</span>
            </BarisInfo>
            <BarisInfo label="Ongkos kirim">
              <span className="numeric">{biayaKirim ? fmtRupiah(biayaKirim) : 'Gratis'}</span>
            </BarisInfo>
            <BarisInfo label="Total bayar" className="border-t border-hairline">
              <span className="numeric text-[22px] font-bold text-accent">{fmtRupiah(total)}</span>
            </BarisInfo>
          </Kartu>

          <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] surface-sunken px-4 py-3.5 text-[16px] leading-relaxed text-secondary">
            <IconPeringatan size={19} weight="bold" className="mt-0.5 shrink-0 text-muted" />
            <span>
              Pesanan akan berstatus <strong className="font-semibold text-primary">Menunggu Pembayaran</strong>.
              {bayar === 'Transfer Bank'
                ? ' Setelah pesanan dibuat, Anda langsung diarahkan ke halaman pembayaran untuk transfer dan unggah bukti.'
                : ' Anda membayar tunai saat mengambil pesanan di klinik, lalu klinik menandainya sudah dibayar.'}
            </span>
          </p>
        </section>
      )}

      {galat && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-rose)]"
        >
          <IconPeringatan size={19} weight="bold" className="mt-0.5 shrink-0" />
          <span>{galat}</span>
        </p>
      )}

      {/* Tombol tindakan */}
      <div className="space-y-2.5 pb-2">
        {langkah < 3 ? (
          <Tombol
            size="lg"
            penuh
            disabled={!bisaLanjut}
            onClick={() => setLangkah((n) => n + 1)}
          >
            {langkah === 1 ? 'Lanjut ke Cara Bayar' : 'Lanjut ke Konfirmasi'}
          </Tombol>
        ) : (
          <Tombol size="lg" penuh disabled={sibuk || kejauhan} onClick={() => setTanya(true)}>
            <IconCentangBulat size={21} weight="bold" />
            Buat Pesanan
          </Tombol>
        )}

        <Tombol
          variant="secondary"
          size="lg"
          penuh
          disabled={sibuk}
          onClick={() => (langkah > 1 ? setLangkah((n) => n - 1) : nav('/keranjang'))}
        >
          <IconKembali size={19} weight="bold" />
          {langkah === 1 ? 'Kembali ke Keranjang' : 'Kembali ke langkah sebelumnya'}
        </Tombol>
      </div>

      <Konfirmasi
        buka={tanya}
        onTutup={() => setTanya(false)}
        onYa={proses}
        sibuk={sibuk}
        tone="primary"
        judul="Buat pesanan ini?"
        pesan={`Pesanan sebesar ${fmtRupiah(total)} akan dibuat dengan cara bayar ${bayar}. Anda dapat membatalkan pesanan selama masih berstatus Menunggu Pembayaran.`}
        labelYa="Ya, Buat Pesanan"
      />
    </div>
  )
}
