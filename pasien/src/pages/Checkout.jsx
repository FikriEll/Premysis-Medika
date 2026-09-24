import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import { fmtRupiah } from '../../../shared/format'
import {
  Kartu, Tombol, Kolom, Input, AreaTeks, JudulSeksi, BarisInfo, PilihanKotak, Konfirmasi, Lencana, Memuat,
} from '../components/ui'
import {
  IconLokasi, IconKirim, IconDompet, IconPeringatan, IconKembali,
  IconCentangBulat, IconJam, IconTambah,
} from '../components/Icons'

// F-08 Checkout - 3 langkah.
//
//   1. Terima Pesanan (ambil di apotek / kirim ke alamat)
//   2. Cara Bayar (Transfer/online atau COD bila diizinkan)
//   3. Konfirmasi Pesanan
//
// Semua aturan bisnis (stok, COD, resep, promo, ongkir) ditegakkan
// oleh server apotek. Halaman ini hanya memandu; ongkir dihitung
// server lewat /shipping/calculate agar tidak bisa dipalsukan klien.
const LANGKAH = ['Terima Pesanan', 'Cara Bayar', 'Konfirmasi Pesanan']

export default function Checkout() {
  const nav = useNavigate()
  const {
    itemKeranjang, subtotal, beratKeranjang, adaProdukResep, alamat,
    tambahAlamat, checkout, beriToast,
  } = useStore()

  const [langkah, setLangkah] = useState(1)
  const [ringkasan, setRingkasan] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')
  const [sibuk, setSibuk] = useState(false)
  const [tanya, setTanya] = useState(false)

  // Langkah 1
  const [mode, setMode] = useState('ambil') // 'ambil' | 'kirim'
  const [alamatId, setAlamatId] = useState('')
  const [alamatBaru, setAlamatBaru] = useState(false)
  const [form, setForm] = useState({ recipient_name: '', phone: '', address_line: '', city: '', province: '', postal_code: '' })
  const [metodeId, setMetodeId] = useState('')

  // Langkah 2
  const [bayar, setBayar] = useState('midtrans')
  const [promoKode, setPromoKode] = useState('')
  const [promo, setPromo] = useState(null)
  const [promoGalat, setPromoGalat] = useState('')
  const [catatan, setCatatan] = useState('')

  // Ongkir dari server
  const [ongkir, setOngkir] = useState(null)
  const [hitung, setHitung] = useState(false)

  // Muat ringkasan checkout dari server (alamat + metode kirim + promo).
  useEffect(() => {
    let batal = false
    api
      .ringkasanCheckout()
      .then((r) => {
        if (batal) return
        setRingkasan(r)
        setAlamatId(r.addresses?.find((a) => a.is_default)?.id || r.addresses?.[0]?.id || '')
        setMetodeId(r.shipping_methods?.[0]?.id || '')
        setGalat('')
      })
      .catch((e) => !batal && setGalat(e.message))
      .finally(() => !batal && setMemuat(false))
    return () => {
      batal = true
    }
  }, [])

  const metode = ringkasan?.shipping_methods?.find((m) => m.id === Number(metodeId))
  const pickup = metode?.code === 'PICKUP'
  const codBoleh = !!metode?.is_cod_available

  // Metode kirim harus cocok dengan pilihan terima pesanan:
  // "Ambil di Apotek" memakai PICKUP (ongkir 0), "Kirim ke Alamat"
  // memakai kurir. Tanpa ini, pengambilan di apotek bisa ikut dikenai
  // ongkos kirim kurir.
  useEffect(() => {
    const daftar = ringkasan?.shipping_methods || []
    if (daftar.length === 0) return
    const sekarang = daftar.find((m) => m.id === Number(metodeId))
    if (mode === 'ambil' && sekarang?.code !== 'PICKUP') {
      const p = daftar.find((m) => m.code === 'PICKUP')
      if (p) setMetodeId(p.id)
    } else if (mode === 'kirim' && sekarang?.code === 'PICKUP') {
      const k = daftar.find((m) => m.code !== 'PICKUP')
      if (k) setMetodeId(k.id)
    }
  }, [mode, ringkasan, metodeId])

  // Kalau mode berubah / metode kirim berubah, hitung ongkir di server.
  useEffect(() => {
    if (!metode || mode !== 'kirim') {
      setOngkir(null)
      return
    }
    let batal = false
    setHitung(true)
    api
      .hitungKirim(metode.id, beratKeranjang || 0)
      .then((r) => !batal && setOngkir(r.cost))
      .catch(() => !batal && setOngkir(null))
      .finally(() => !batal && setHitung(false))
    return () => {
      batal = true
    }
  }, [metode, mode, beratKeranjang])

  // COD tidak berlaku bila metode kirim tidak mendukungnya.
  useEffect(() => {
    if (bayar === 'cod' && !codBoleh) setBayar('midtrans')
  }, [bayar, codBoleh])

  const biayaKirim = mode === 'kirim' ? ongkir || 0 : 0
  const diskon = promo?.discount || 0
  const total = Math.max(0, subtotal + biayaKirim - diskon)

  const cekPromo = async () => {
    setPromoGalat('')
    setPromo(null)
    if (!promoKode.trim()) return
    try {
      const r = await api.validasiPromo(promoKode.trim(), subtotal)
      setPromo({ ...r.promo, discount: r.discount })
      beriToast(`Promo ${r.promo.code} dipakai.`, 'sukses')
    } catch (e) {
      setPromoGalat(e.message)
    }
  }

  const simpanAlamatBaru = async () => {
    if (!form.recipient_name.trim() || !form.phone.trim() || !form.address_line.trim()) {
      setGalat('Lengkapi nama penerima, nomor HP, dan alamat.')
      return null
    }
    await tambahAlamat({
      label: 'Rumah',
      recipient_name: form.recipient_name.trim(),
      phone: form.phone.trim(),
      address_line: form.address_line.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      postal_code: form.postal_code.trim(),
      is_default: alamat.length === 0,
    })
    const daftar = await api.alamat()
    const baru = (Array.isArray(daftar) ? daftar : daftar?.data || []).slice(-1)[0]
    setAlamatBaru(false)
    if (baru) setAlamatId(baru.id)
    return baru
  }

  const proses = async () => {
    setGalat('')
    if (mode === 'kirim' && !alamatId && !alamatBaru) {
      setGalat('Pilih atau tambahkan alamat pengiriman dulu.')
      setLangkah(1)
      return
    }
    setSibuk(true)
    try {
      let idKirim = alamatId
      if (mode === 'kirim' && alamatBaru) {
        const baru = await simpanAlamatBaru()
        if (!baru) {
          setSibuk(false)
          return
        }
        idKirim = baru.id
      }

      const payload = {
        shipping_method_id: Number(metodeId),
        payment_method: bayar,
        promo_code: promo?.code || promoKode.trim() || undefined,
        note: catatan.trim() || undefined,
      }
      if (mode === 'kirim') payload.address_id = idKirim
      else {
        payload.recipient_name = ringkasan?.addresses?.[0]?.recipient_name || 'Ambil di Apotek'
        payload.recipient_phone = ringkasan?.addresses?.[0]?.phone || '081211112222'
        payload.full_address = 'Ambil sendiri di Apotek Premysis Medika'
      }

      const pesanan = await checkout(payload)
      setTanya(false)
      if (pesanan.payment_method === 'midtrans' && pesanan.status === 'pending_payment') {
        nav(`/pesanan/${pesanan.order_number}/bayar`, { replace: true })
      } else {
        nav('/pesanan', { replace: true })
      }
    } catch (e) {
      setGalat(e.message)
      beriToast(e.message, 'galat')
      setTanya(false)
    } finally {
      setSibuk(false)
    }
  }

  if (itemKeranjang.length === 0) {
    return (
      <Kartu>
        <p className="text-[17px] leading-relaxed text-secondary">
          Keranjang Anda masih kosong, belum ada yang bisa dipesan.
        </p>
        <Tombol className="mt-4" size="lg" penuh onClick={() => nav('/toko')}>
          Belanja Sekarang
        </Tombol>
      </Kartu>
    )
  }

  if (memuat) return <Memuat baris={4} />

  const bisaLanjut = langkah === 1 ? mode === 'ambil' || !!alamatId || alamatBaru : true

  return (
    <div className="mx-auto w-full max-w-[820px] space-y-5">
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

      {/* --- Langkah 1: terima pesanan --- */}
      {langkah === 1 && (
        <section className="space-y-3">
          <h2 className="text-[20.5px] font-bold tracking-tight text-primary">
            Bagaimana Anda ingin menerima pesanan?
          </h2>

          <div className="space-y-2.5">
            <PilihanKotak
              Ikon={IconLokasi}
              judul="Ambil di Apotek"
              ket="Tanpa biaya kirim. Datang dan ambil pesanan Anda."
              terpilih={mode === 'ambil'}
              onClick={() => setMode('ambil')}
            />
            <PilihanKotak
              Ikon={IconKirim}
              judul="Kirim ke Alamat"
              ket="Diantar kurir. Ongkos kirim sesuai berat & metode."
              terpilih={mode === 'kirim'}
              onClick={() => setMode('kirim')}
            />
          </div>

          {mode === 'ambil' && (
            <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3.5">
              <p className="text-[16px] font-semibold text-primary">Alamat pengambilan</p>
              <p className="mt-1 text-[16px] leading-relaxed text-secondary">
                Apotek Premysis Medika — Jl. Kesehatan Raya No. 45, Depok
              </p>
              <p className="numeric mt-1 text-[16px] text-secondary">0812-1111-2222</p>
            </div>
          )}

          {mode === 'kirim' && (
            <>
              {/* Pilih alamat tersimpan */}
              {alamat.length > 0 && !alamatBaru && (
                <div className="space-y-2.5">
                  <p className="text-[17px] font-bold text-primary">Alamat pengiriman</p>
                  {alamat.map((a) => (
                    <PilihanKotak
                      key={a.id}
                      Ikon={IconLokasi}
                      judul={`${a.label || 'Alamat'} — ${a.recipient_name}`}
                      ket={a.full_address}
                      terpilih={alamatId === a.id}
                      onClick={() => setAlamatId(a.id)}
                    />
                  ))}
                  <Tombol variant="secondary" penuh onClick={() => setAlamatBaru(true)}>
                    <IconTambah size={19} weight="bold" />
                    Pakai Alamat Baru
                  </Tombol>
                </div>
              )}

              {(alamatBaru || alamat.length === 0) && (
                <Kartu className="space-y-4">
                  <JudulSeksi>Alamat Baru</JudulSeksi>
                  <Kolom label="Nama penerima" wajib htmlFor="rc">
                    <Input id="rc" value={form.recipient_name} onChange={(e) => setForm((f) => ({ ...f, recipient_name: e.target.value }))} placeholder="Nama yang menerima paket" />
                  </Kolom>
                  <Kolom label="Nomor HP penerima" wajib htmlFor="ph">
                    <Input id="ph" inputMode="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="0812-3456-7890" />
                  </Kolom>
                  <Kolom label="Alamat lengkap" wajib htmlFor="ad" bantuan="Jalan, nomor rumah, RT/RW, kelurahan.">
                    <AreaTeks id="ad" value={form.address_line} onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))} placeholder="Contoh: Jl. Melati No. 12" />
                  </Kolom>
                  <div className="grid grid-cols-2 gap-3">
                    <Kolom label="Kota" htmlFor="ct">
                      <Input id="ct" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Depok" />
                    </Kolom>
                    <Kolom label="Provinsi" htmlFor="pv">
                      <Input id="pv" value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} placeholder="Jawa Barat" />
                    </Kolom>
                  </div>
                  <Kolom label="Kode pos" htmlFor="pc">
                    <Input id="pc" inputMode="numeric" value={form.postal_code} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} placeholder="16411" />
                  </Kolom>
                  {alamat.length > 0 && (
                    <Tombol variant="secondary" penuh onClick={() => setAlamatBaru(false)}>
                      Pakai Alamat Tersimpan
                    </Tombol>
                  )}
                </Kartu>
              )}

              {/* Metode pengiriman */}
              <div className="space-y-2.5">
                <p className="text-[17px] font-bold text-primary">Pilih pengiriman</p>
                {(ringkasan?.shipping_methods || []).filter((m) => m.code !== 'PICKUP').map((m) => (
                  <PilihanKotak
                    key={m.id}
                    Ikon={IconKirim}
                    judul={m.name}
                    ket={`Estimasi ${m.est_days} · mulai ${fmtRupiah(m.base_cost)}${m.cost_per_kg ? ` + ${fmtRupiah(m.cost_per_kg)}/kg` : ''}`}
                    terpilih={Number(metodeId) === m.id}
                    onClick={() => setMetodeId(m.id)}
                  />
                ))}
              </div>
            </>
          )}

          {mode === 'ambil' && (
            <div className="space-y-2.5">
              <p className="text-[17px] font-bold text-primary">Metode</p>
              {(ringkasan?.shipping_methods || []).filter((m) => m.code === 'PICKUP').map((m) => (
                <PilihanKotak
                  key={m.id}
                  Ikon={IconLokasi}
                  judul={m.name}
                  ket={m.est_days}
                  terpilih={Number(metodeId) === m.id}
                  onClick={() => setMetodeId(m.id)}
                />
              ))}
            </div>
          )}

          {/* Ringkasan ongkir */}
          {mode === 'kirim' && (
            <div className="rounded-[var(--radius-control)] surface-1 px-4 py-3.5">
              <BarisInfo label="Berat total">
                <span className="numeric">{(beratKeranjang / 1000).toFixed(2)} kg</span>
              </BarisInfo>
              <BarisInfo label="Ongkos kirim">
                <span className="numeric font-semibold text-accent">
                  {hitung ? 'Menghitung...' : ongkir != null ? fmtRupiah(ongkir) : '-'}
                </span>
              </BarisInfo>
            </div>
          )}

          {adaProdukResep && (
            <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--color-signal-amber-soft)] px-4 py-3.5 text-[16px] leading-relaxed text-[var(--color-signal-amber)]">
              <IconPeringatan size={20} weight="bold" className="mt-0.5 shrink-0" />
              <span>
                Keranjang Anda memuat produk yang memerlukan resep. Unggah foto resep setelah pesanan
                dibuat; apotek akan memverifikasinya sebelum memproses.
              </span>
            </p>
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
              judul="Transfer / Pembayaran Online"
              ket="Bayar lewat transfer bank atau kanal pembayaran online."
              terpilih={bayar === 'midtrans'}
              onClick={() => setBayar('midtrans')}
            />
            {codBoleh ? (
              <PilihanKotak
                Ikon={IconDompet}
                judul="Bayar di Tempat (COD)"
                ket="Bayar tunai saat pesanan diterima."
                terpilih={bayar === 'cod'}
                onClick={() => setBayar('cod')}
              />
            ) : (
              <div className="rounded-[var(--radius-control)] surface-sunken px-4 py-3.5">
                <p className="flex items-center gap-2.5 text-[16px] leading-relaxed text-secondary">
                  <IconPeringatan size={19} weight="bold" className="shrink-0 text-muted" />
                  <span>Metode pengiriman yang dipilih tidak mendukung pembayaran di tempat (COD).</span>
                </p>
              </div>
            )}
          </div>

          {/* Promo */}
          <Kartu className="space-y-3">
            <JudulSeksi>Kode Promo</JudulSeksi>
            <div className="flex items-end gap-2.5">
              <div className="min-w-0 flex-1">
                <Input
                  value={promoKode}
                  onChange={(e) => setPromoKode(e.target.value.toUpperCase())}
                  placeholder="Mis. WELCOME10"
                />
              </div>
              <Tombol onClick={cekPromo} disabled={!promoKode.trim()}>
                Pakai
              </Tombol>
            </div>
            {promoGalat && (
              <p role="alert" className="text-[15.5px] leading-relaxed text-[var(--color-signal-rose)]">
                {promoGalat}
              </p>
            )}
            {promo && (
              <p className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-[var(--color-signal-green-soft)] px-3.5 py-2.5 text-[15.5px] text-[var(--color-signal-green)]">
                <span className="font-semibold">{promo.name}</span>
                <span className="numeric font-bold">- {fmtRupiah(diskon)}</span>
              </p>
            )}
            {(ringkasan?.promos || []).length > 0 && (
              <p className="text-[15px] leading-relaxed text-muted">
                Promo tersedia: {(ringkasan.promos || []).map((p) => p.code).join(', ')}
              </p>
            )}
          </Kartu>

          <Kolom label="Catatan untuk apotek" htmlFor="catatan" bantuan="Boleh dikosongkan.">
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
                <li key={x.id} className="flex items-start justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-[17px] font-medium text-primary">{x.product?.name}</span>
                    <span className="numeric block text-[15.5px] text-secondary">
                      {x.qty} x {fmtRupiah(x.product?.price || 0)}
                    </span>
                  </span>
                  <span className="numeric shrink-0 text-[17px] font-semibold text-primary">
                    {fmtRupiah(x.subtotal || (x.product?.price || 0) * x.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </Kartu>

          <Kartu className="divide-y divide-[var(--border-hairline)]">
            <BarisInfo label="Cara terima">{mode === 'kirim' ? 'Kirim ke Alamat' : 'Ambil di Apotek'}</BarisInfo>
            {mode === 'kirim' && metode && <BarisInfo label="Pengiriman">{metode.name}</BarisInfo>}
            {mode === 'kirim' && (
              <BarisInfo label="Alamat">
                {alamat.find((a) => a.id === Number(alamatId))?.full_address || 'Alamat baru diisi saat memesan'}
              </BarisInfo>
            )}
            <BarisInfo label="Cara bayar">{bayar === 'cod' ? 'Bayar di Tempat (COD)' : 'Transfer / Pembayaran Online'}</BarisInfo>
            {promo && <BarisInfo label="Promo">{promo.code}</BarisInfo>}
            {catatan && <BarisInfo label="Catatan">{catatan}</BarisInfo>}
          </Kartu>

          <Kartu>
            <BarisInfo label="Subtotal">
              <span className="numeric">{fmtRupiah(subtotal)}</span>
            </BarisInfo>
            {mode === 'kirim' && (
              <BarisInfo label="Ongkos kirim">
                <span className="numeric">{biayaKirim ? fmtRupiah(biayaKirim) : 'Gratis'}</span>
              </BarisInfo>
            )}
            {diskon > 0 && (
              <BarisInfo label="Diskon promo">
                <span className="numeric text-[var(--color-signal-green)]">- {fmtRupiah(diskon)}</span>
              </BarisInfo>
            )}
            <BarisInfo label="Total bayar" className="border-t border-hairline">
              <span className="numeric text-[22px] font-bold text-accent">{fmtRupiah(total)}</span>
            </BarisInfo>
          </Kartu>

          <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] surface-sunken px-4 py-3.5 text-[16px] leading-relaxed text-secondary">
            <IconPeringatan size={19} weight="bold" className="mt-0.5 shrink-0 text-muted" />
            <span>
              Pesanan akan berstatus <strong className="font-semibold text-primary">Menunggu Pembayaran</strong>.
              {bayar === 'midtrans'
                ? ' Setelah pesanan dibuat, Anda langsung diarahkan ke halaman pembayaran.'
                : ' Anda membayar saat pesanan diterima.'}
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
          <Tombol size="lg" penuh disabled={!bisaLanjut} onClick={() => setLangkah((n) => n + 1)}>
            {langkah === 1 ? 'Lanjut ke Cara Bayar' : 'Lanjut ke Konfirmasi'}
          </Tombol>
        ) : (
          <Tombol size="lg" penuh disabled={sibuk} onClick={() => setTanya(true)}>
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
        pesan={`Pesanan sebesar ${fmtRupiah(total)} akan dibuat. Anda dapat membatalkan pesanan selama masih berstatus Menunggu Pembayaran.`}
        labelYa="Ya, Buat Pesanan"
      />
    </div>
  )
}
