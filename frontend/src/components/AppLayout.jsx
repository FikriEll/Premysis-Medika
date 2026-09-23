import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const titles = {
  '/': 'Dashboard',
  '/pasien': 'Pasien',
  '/appointment': 'Appointment',
  '/pemeriksaan': 'Pemeriksaan',
  '/vaksinasi': 'Vaksinasi',
  '/resep': 'Resep',
  '/produk': 'Produk & Obat',
  '/stok': 'Stok',
  '/pesanan': 'Pesanan',
  '/pengguna': 'Pengguna',
  '/laporan': 'Laporan',
}

const COLLAPSE_KEY = 'premysis_sidebar_lipat'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')
  const { pathname } = useLocation()
  const title = titles[pathname] || 'Premysis Medika'

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  return (
    <div className="min-h-full">
      {/* Layer tekstur: fixed + pointer-events-none, tidak pernah
          ditempel ke container yang bergulir (guardrail performa). */}
      <div className="grain-overlay" aria-hidden="true" />

      <a href="#konten-utama" className="skip-link">
        Lompat ke konten
      </a>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className={`transition-[padding] duration-300 ease-[var(--ease-in-out-soft)] ${collapsed ? 'lg:pl-[68px]' : 'lg:pl-[252px]'}`}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main id="konten-utama" className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-7 lg:py-7">
          <div key={pathname} className="animate-rise">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
