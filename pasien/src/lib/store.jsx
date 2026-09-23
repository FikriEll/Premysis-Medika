// =============================================================
// Store aplikasi pasien.
//
// Semua data diambil dari REST API bersama (server/index.js).
// Aplikasi pasien TIDAK menyimpan salinan data di localStorage,
// kecuali: sesi login dan isi keranjang (keduanya memang milik
// perangkat ini). Dengan begitu data pasien, pesanan, stok, dan
// resep selalu sama dengan yang dilihat dashboard admin - PRD N-05.
// =============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from './api'

const StoreContext = createContext(null)

const KUNCI_SESI = 'premysis_pasien'
const KUNCI_KERANJANG = 'premysis_keranjang'

function bacaJSON(kunci, bawaan) {
  try {
    const raw = window.localStorage.getItem(kunci)
    return raw ? JSON.parse(raw) : bawaan
  } catch {
    return bawaan
  }
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [galatMuat, setGalatMuat] = useState(null)
  const [user, setUser] = useState(() => bacaJSON(KUNCI_SESI, null))
  const [keranjang, setKeranjang] = useState(() => bacaJSON(KUNCI_KERANJANG, []))
  const [toast, setToast] = useState(null)

  // --- Muat seluruh data dari API ---
  const muat = useCallback(async () => {
    try {
      const s = await api.state()
      setData(s)
      setGalatMuat(null)
      return s
    } catch (e) {
      setGalatMuat(e.message)
      return null
    } finally {
      setMemuat(false)
    }
  }, [])

  useEffect(() => {
    muat()
  }, [muat])

  // --- Sinkronkan sesi & keranjang ke localStorage ---
  useEffect(() => {
    if (user) window.localStorage.setItem(KUNCI_SESI, JSON.stringify(user))
    else window.localStorage.removeItem(KUNCI_SESI)
  }, [user])

  useEffect(() => {
    window.localStorage.setItem(KUNCI_KERANJANG, JSON.stringify(keranjang))
  }, [keranjang])

  // --- Toast ringan untuk umpan balik aksi ---
  const beriToast = useCallback((pesan, tone = 'info') => {
    setToast({ pesan, tone, id: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  // ===========================================================
  // Autentikasi - R-01 Pasien
  // ===========================================================
  const login = useCallback(async (identitas, password) => {
    const p = await api.loginPasien(identitas, password)
    setUser(p)
    await muat()
    return p
  }, [muat])

  const registrasi = useCallback(async (form) => {
    const p = await api.registrasi(form)
    setUser(p)
    await muat()
    return p
  }, [muat])

  const logout = useCallback(() => {
    setUser(null)
    setKeranjang([])
    window.localStorage.removeItem(KUNCI_KERANJANG)
  }, [])

  // ===========================================================
  // Keranjang (milik perangkat, disimpan lokal)
  // ===========================================================
  const tambahKeranjang = useCallback((idProduk, jumlah = 1) => {
    setKeranjang((k) => {
      const ada = k.find((x) => x.id_produk === idProduk)
      if (ada) return k.map((x) => (x.id_produk === idProduk ? { ...x, jumlah: x.jumlah + jumlah } : x))
      return [...k, { id_produk: idProduk, jumlah }]
    })
  }, [])

  const setJumlahKeranjang = useCallback((idProduk, jumlah) => {
    setKeranjang((k) =>
      jumlah <= 0
        ? k.filter((x) => x.id_produk !== idProduk)
        : k.map((x) => (x.id_produk === idProduk ? { ...x, jumlah } : x)),
    )
  }, [])

  const hapusDariKeranjang = useCallback((idProduk) => {
    setKeranjang((k) => k.filter((x) => x.id_produk !== idProduk))
  }, [])

  const kosongkanKeranjang = useCallback(() => setKeranjang([]), [])

  // ===========================================================
  // Aksi yang menembak API lalu menyegarkan data
  // ===========================================================
  const checkout = useCallback(
    async (payload) => {
      const pesanan = await api.checkout(payload)
      kosongkanKeranjang()
      await muat()
      beriToast(`Pesanan ${pesanan.nomor_pesanan} berhasil dibuat.`, 'sukses')
      return pesanan
    },
    [muat, kosongkanKeranjang, beriToast],
  )

  const bayarPesanan = useCallback(
    async (id, data) => {
      const p = await api.bayarPesanan(id, { id_pasien: user?.id, ...data })
      await muat()
      beriToast('Bukti pembayaran terkirim. Klinik akan memeriksanya.', 'sukses')
      return p
    },
    [muat, user, beriToast],
  )

  const batalkanPesanan = useCallback(
    async (id) => {
      await api.batalkanPesanan(id, user?.id)
      await muat()
      beriToast('Pesanan dibatalkan.', 'info')
    },
    [muat, user, beriToast],
  )

  const buatAppointment = useCallback(
    async (form) => {
      const a = await api.create('appointment', {
        id_pasien: user.id,
        id_bidan: form.id_bidan || 1,
        status: 'Menunggu Konfirmasi', // BR-02 titik awal pengajuan pasien
        catatan: '',
        ...form,
      })
      await muat()
      return a
    },
    [muat, user],
  )

  const batalkanAppointment = useCallback(
    async (id) => {
      await api.update('appointment', id, { status: 'Dibatalkan' })
      await muat()
    },
    [muat],
  )

  const tambahBayi = useCallback(
    async (form) => {
      const b = await api.create('bayi', { id_pasien: user.id, ...form })
      await muat()
      beriToast(`Data ${b.nama} tersimpan. Jadwal vaksin dibuat otomatis.`, 'sukses')
      return b
    },
    [muat, user, beriToast],
  )

  const ubahProfil = useCallback(
    async (perubahan) => {
      const p = await api.update('pasien', user.id, perubahan)
      setUser(p)
      await muat()
      beriToast('Profil diperbarui.', 'sukses')
      return p
    },
    [muat, user, beriToast],
  )

  const bacaNotifikasi = useCallback(
    async (id) => {
      await api.bacaNotifikasi(id)
      await muat()
    },
    [muat],
  )

  const bacaSemuaNotifikasi = useCallback(async () => {
    if (!user) return
    await api.bacaSemuaNotifikasi(user.id)
    await muat()
  }, [muat, user])

  // ===========================================================
  // Selector (dihitung dari data, bukan disimpan terpisah)
  // ===========================================================
  const nilai = useMemo(() => {
    const d = data || {}
    const produk = d.produk || []
    const pasien = d.pasien || []
    const bayi = d.bayi || []
    const appointment = d.appointment || []
    const pemeriksaan = d.pemeriksaan || []
    const resep = d.resep || []
    const pesanan = d.pesanan || []
    const notifikasi = d.notifikasi || []
    const jadwalVaksin = d.jadwalVaksin || []
    const kategori = d.kategori || []
    const jenisVaksin = d.jenisVaksin || []

    const idSaya = user?.id

    const produkAktif = produk.filter((p) => p.status === 'Aktif')

    const itemKeranjang = keranjang
      .map((k) => ({ ...k, produk: produk.find((p) => p.id === k.id_produk) }))
      .filter((x) => x.produk)

    const subtotal = itemKeranjang.reduce((s, x) => s + x.produk.harga * x.jumlah, 0)
    const jumlahKeranjang = itemKeranjang.reduce((s, x) => s + x.jumlah, 0)

    const appointmentSaya = appointment
      .filter((a) => a.id_pasien === idSaya)
      .sort((a, b) => (a.tanggal + a.waktu < b.tanggal + b.waktu ? 1 : -1))

    const pemeriksaanSaya = pemeriksaan
      .filter((p) => p.id_pasien === idSaya)
      .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))

    const resepSaya = resep.filter((r) => r.id_pasien === idSaya)

    const pesananSaya = pesanan
      .filter((p) => p.id_pasien === idSaya)
      .sort((a, b) => (a.waktu_pemesanan < b.waktu_pemesanan ? 1 : -1))

    const notifikasiSaya = notifikasi
      .filter((n) => n.id_pasien === idSaya)
      .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))

    const belumDibaca = notifikasiSaya.filter((n) => !n.status_baca).length

    const bayiSaya = bayi.filter((b) => b.id_pasien === idSaya)
    const idBayiSaya = new Set(bayiSaya.map((b) => b.id))
    const jadwalVaksinSaya = jadwalVaksin
      .filter((j) => idBayiSaya.has(j.id_bayi))
      .sort((a, b) => (a.tanggal_terjadwal > b.tanggal_terjadwal ? 1 : -1))

    // Produk yang boleh dibeli pasien ini (BR-05):
    // produk wajib-resep hanya jika ada resep aktif yang menautkannya.
    const idProdukResepAktif = new Set(
      resepSaya
        .filter((r) => r.status === 'Aktif')
        .flatMap((r) => (r.detail || []).map((x) => x.id_produk))
        .filter(Boolean),
    )
    const bolehBeli = (p) => !p.wajib_resep || idProdukResepAktif.has(p.id)

    const appointmentMendatang = appointmentSaya
      .filter((a) => a.status === 'Menunggu Konfirmasi' || a.status === 'Dikonfirmasi')
      .sort((a, b) => (a.tanggal + a.waktu > b.tanggal + b.waktu ? 1 : -1))

    // Slot waktu yang sudah dipakai pada satu tanggal.
    // Dipakai wizard langkah 4 supaya pasien tidak memilih jam yang
    // sudah terisi dan harus mengulang dari awal (brief §8).
    const slotTerisi = (tanggal) =>
      new Set(
        appointment
          .filter((a) => a.tanggal === tanggal && a.status !== 'Dibatalkan')
          .map((a) => a.waktu),
      )

    // Produk aktif dikelompokkan per kategori (brief §10).
    const produkPerKategori = (idKategori) =>
      produkAktif.filter((p) => p.id_kategori === Number(idKategori))

    const vaksinMendatang = jadwalVaksinSaya.filter((j) => j.status === 'Terjadwal')

    return {
      data: d,
      produk, produkAktif, kategori, jenisVaksin,
      pasien, bayi, bayiSaya, jadwalVaksinSaya, vaksinMendatang,
      appointment, appointmentSaya, appointmentMendatang,
      pemeriksaanSaya, resepSaya, pesananSaya, notifikasiSaya, belumDibaca,
      idProdukResepAktif, bolehBeli, slotTerisi, produkPerKategori,
      itemKeranjang, subtotal, jumlahKeranjang,
      cariProduk: (id) => produk.find((p) => p.id === id),
      cariKategori: (id) => kategori.find((k) => k.id === id),
      cariBayi: (id) => bayi.find((b) => b.id === id),
      namaProduk: (id) => produk.find((p) => p.id === id)?.nama || '-',
    }
  }, [data, user, keranjang])

  const nilaiAkhir = {
    ...nilai,
    user, memuat, galatMuat, toast,
    login, registrasi, logout, muat,
    keranjang, tambahKeranjang, setJumlahKeranjang, hapusDariKeranjang, kosongkanKeranjang,
    checkout, batalkanPesanan, bayarPesanan,
    buatAppointment, batalkanAppointment, tambahBayi, ubahProfil,
    bacaNotifikasi, bacaSemuaNotifikasi, beriToast,
  }

  return <StoreContext.Provider value={nilaiAkhir}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore harus dipakai di dalam StoreProvider')
  return ctx
}

// Alias supaya halaman bisa memakai nama yang lebih akrab.
export const useAuth = useStore
