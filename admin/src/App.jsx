import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pasien from './pages/Pasien'
import Appointment from './pages/Appointment'
import Pemeriksaan from './pages/Pemeriksaan'
import Vaksinasi from './pages/Vaksinasi'
import Resep from './pages/Resep'
import Produk from './pages/Produk'
import Kategori from './pages/Kategori'
import Stok from './pages/Stok'
import Pesanan from './pages/Pesanan'
import Promo from './pages/Promo'
import Budget from './pages/Budget'
import Pengguna from './pages/Pengguna'
import Laporan from './pages/Laporan'
import Pengembalian from './pages/Pengembalian'
import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'

// Route yang dilindungi RBAC (modul mengikuti PRD §5.1)
function Protected({ modul, children }) {
  const { user, can } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (modul && !can(modul)) return <Forbidden />
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center text-muted">
        Memuat…
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<Protected modul="dashboard"><Dashboard /></Protected>} />
        <Route path="pasien" element={<Protected modul="pasien"><Pasien /></Protected>} />
        <Route path="appointment" element={<Protected modul="appointment"><Appointment /></Protected>} />
        <Route path="pemeriksaan" element={<Protected modul="pemeriksaan"><Pemeriksaan /></Protected>} />
        <Route path="vaksinasi" element={<Protected modul="vaksinasi"><Vaksinasi /></Protected>} />
        <Route path="resep" element={<Protected modul="resep"><Resep /></Protected>} />
        <Route path="produk" element={<Protected modul="produk"><Produk /></Protected>} />
        <Route path="kategori" element={<Protected modul="produk"><Kategori /></Protected>} />
        <Route path="stok" element={<Protected modul="stok"><Stok /></Protected>} />
        <Route path="pesanan" element={<Protected modul="pesanan"><Pesanan /></Protected>} />
        <Route path="pengembalian" element={<Protected modul="pesanan"><Pengembalian /></Protected>} />
        <Route path="promo" element={<Protected modul="produk"><Promo /></Protected>} />
        <Route path="budget" element={<Protected modul="laporan"><Budget /></Protected>} />
        <Route path="pengguna" element={<Protected modul="pengguna"><Pengguna /></Protected>} />
        <Route path="laporan" element={<Protected modul="laporan"><Laporan /></Protected>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
