import { createContext, useContext, useEffect, useState } from 'react'
import { users } from '../data/mockData'

// =============================================================
// AuthContext - simulasi login & RBAC (frontend-only, mock)
// Nanti diganti autentikasi sungguhan (REST API + token).
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

  // Login mock: cocokkan email dengan data pengguna, password apa pun diterima
  const login = (email, password) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!found) {
      return { ok: false, message: 'Email tidak terdaftar.' }
    }
    if (!found.status_aktif) {
      return { ok: false, message: 'Akun tidak aktif. Hubungi Bidan.' }
    }
    if (!password || password.length < 1) {
      return { ok: false, message: 'Password wajib diisi.' }
    }
    setUser(found)
    localStorage.setItem('premysis_user', JSON.stringify(found))
    return { ok: true }
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
