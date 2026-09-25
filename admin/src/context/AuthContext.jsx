import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

// =============================================================
// AuthContext - login nyata ke server apotek (Laravel).
//
// Sebelumnya login disimulasikan di peramban (cocokkan email dengan
// data mock). Sekarang kredensial diverifikasi server lewat
// POST /api/admin/auth/login-admin, sehingga akun nonaktif benar-benar
// ditolak dan sesi mengikuti data pengguna di basis data.
//
// Matriks hak akses mengikuti PRD §5.1.
// =============================================================

const AuthContext = createContext(null)

// Matriks hak akses per peran (PRD §5.1 - versi gabungan: Asisten 1 + Asisten 2)
// Nilai: true = boleh akses modul
export const permissions = {
  bidan: ['dashboard', 'pasien', 'appointment', 'pemeriksaan', 'vaksinasi', 'resep', 'produk', 'stok', 'pesanan', 'pengguna', 'laporan'],
  // Gabungan hak Asisten 1 (pasien, appointment) + Asisten 2 (produk, stok, pesanan)
  asisten: ['dashboard', 'pasien', 'appointment', 'produk', 'stok', 'pesanan', 'laporan'],
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Pulihkan sesi dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('premysis_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('premysis_user')
      }
    }
    setLoading(false)
  }, [])

  // Login nyata: verifikasi email & password ke server apotek.
  const login = async (email, password) => {
    if (!password || password.length < 1) {
      return { ok: false, message: 'Password wajib diisi.' }
    }
    try {
      const found = await api.loginAdmin(email, password)
      setUser(found)
      localStorage.setItem('premysis_user', JSON.stringify(found))
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.message || 'Gagal masuk.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('premysis_user')
  }

  const can = (modul) => {
    if (!user) return false
    return permissions[user.peran]?.includes(modul) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
