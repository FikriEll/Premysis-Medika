import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTema } from '../context/ThemeContext'
import { roleLabels } from '../data/mockData'
import { IconMenu, IconBell, IconLogout, IconSun, IconMoon } from './Icons'
import { IconButton } from './ui'

// Topbar: tinggi tetap 64px (batas skill 80px), satu baris di desktop.
// Blur latar hanya dipakai di elemen sticky (aman untuk performa).
export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
  const { gelap, toggleTema } = useTema()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-3 border-b border-hairline bg-[var(--surface-canvas)]/85 px-4 backdrop-blur-md lg:px-6" style={{ zIndex: 'var(--z-sticky)' }}>
      <IconButton label="Buka menu" onClick={onMenuClick} className="lg:hidden">
        <IconMenu size={20} />
      </IconButton>

      <h2 className="truncate text-[15px] font-medium tracking-tight text-primary">{title}</h2>

      <div className="ml-auto flex items-center gap-1">
        <IconButton label="Notifikasi" className="relative">
          <IconBell size={19} />
          {/* Titik ini menyatakan keadaan nyata: ada notifikasi belum dibaca. */}
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-signal-rose)]" aria-hidden="true" />
        </IconButton>

        <IconButton label={gelap ? 'Mode terang' : 'Mode gelap'} onClick={toggleTema}>
          {gelap ? <IconSun size={19} /> : <IconMoon size={19} />}
        </IconButton>

        <div className="mx-1 hidden h-6 w-px bg-[var(--border-hairline)] sm:block" aria-hidden="true" />

        <div className="hidden items-center gap-2.5 sm:flex">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[12.5px] font-semibold text-accent">
            {user?.nama?.charAt(0) ?? '-'}
          </span>
          <div className="leading-tight">
            <p className="max-w-[150px] truncate text-[13px] font-medium text-primary">{user?.nama}</p>
            <p className="text-[11.5px] text-muted">{roleLabels[user?.peran]}</p>
          </div>
        </div>

        <IconButton label="Keluar" tone="danger" onClick={handleLogout} className="ml-0.5">
          <IconLogout size={19} />
        </IconButton>
      </div>
    </header>
  )
}
