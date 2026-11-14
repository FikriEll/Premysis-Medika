// =============================================================
// DataContext (Dashboard Admin)
//
// Sebelumnya setiap halaman memakai data mock lokal, sehingga
// perubahan di satu halaman tidak terlihat di halaman lain, dan
// data yang dibuat pasien tidak pernah muncul di sini.
//
// Sekarang semua data berasal dari REST API bersama (server/index.js),
// sama dengan yang dipakai aplikasi pasien. Dengan begitu satu
// pesanan yang dibuat pasien langsung terlihat oleh admin - PRD N-05.
// =============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { setSnapshot } from '../data/mockData'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState(null)

  const muat = useCallback(async () => {
    try {
      const s = await api.state()
      setSnapshot(s) // supaya helper nama* di mockData ikut data hidup
      setData(s)
      setGalat(null)
      return s
    } catch (e) {
      setGalat(e.message)
      return null
    } finally {
      setMemuat(false)
    }
  }, [])

  useEffect(() => {
    muat()
  }, [muat])

  // --- Aksi generik ---
  const tambah = useCallback(async (koleksi, isi) => {
    const row = await api.create(koleksi, isi)
    await muat()
    return row
  }, [muat])

  const ubah = useCallback(async (koleksi, id, isi) => {
    const row = await api.update(koleksi, id, isi)
    await muat()
    return row
  }, [muat])

  const hapus = useCallback(async (koleksi, id) => {
    const row = await api.remove(koleksi, id)
    await muat()
    return row
  }, [muat])

  // --- Aksi beraturan bisnis ---
  const ubahStatusPesanan = useCallback(async (id, status, idPengguna) => {
    const row = await api.ubahStatusPesanan(id, status, idPengguna)
    await muat()
    return row
  }, [muat])

  const konfirmasiPembayaran = useCallback(async (id, idPengguna, metode) => {
    const row = await api.konfirmasiPembayaran(id, idPengguna, metode)
    await muat()
    return row
  }, [muat])

  const tolakPembayaran = useCallback(async (id, idPengguna, alasan) => {
    const row = await api.tolakPembayaran(id, idPengguna, alasan)
    await muat()
    return row
  }, [muat])

  const ubahStatusAppointment = useCallback(async (id, status, idPengguna) => {
    const row = await api.ubahStatusAppointment(id, status, idPengguna)
    await muat()
    return row
  }, [muat])

  const nilai = useMemo(() => {
    const d = data || {}
    return {
      data: d,
      memuat,
      galat,
      muat,
      tambah,
      ubah,
      hapus,
      ubahStatusPesanan,
      konfirmasiPembayaran,
      tolakPembayaran,
      ubahStatusAppointment,
      // koleksi siap pakai
      users: d.users || [],
      pasien: d.pasien || [],
      bayi: d.bayi || [],
      jenisVaksin: d.jenisVaksin || [],
      jadwalVaksin: d.jadwalVaksin || [],
      appointment: d.appointment || [],
      pemeriksaan: d.pemeriksaan || [],
      kategori: d.kategori || [],
      produk: d.produk || [],
      stokMutasi: d.stokMutasi || [],
      resep: d.resep || [],
      pesanan: d.pesanan || [],
      notifikasi: d.notifikasi || [],
      logAktivitas: d.logAktivitas || [],
      pembayaran: d.pembayaran || [],
      promo: d.promo || [],
      budget: d.budget || [],
    }
  }, [data, memuat, galat, muat, tambah, ubah, hapus, ubahStatusPesanan, konfirmasiPembayaran, tolakPembayaran, ubahStatusAppointment])

  return <DataContext.Provider value={nilai}>{children}</DataContext.Provider>
}

export const useData = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData harus dipakai di dalam DataProvider')
  return ctx
}
