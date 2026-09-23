import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import { Toast } from './ui'
import { useStore } from '../lib/store'

export default function AppLayout() {
  const { toast } = useStore()

  return (
    <div className="min-h-dvh surface-canvas">
      <Header />
      <main className="mx-auto max-w-[560px] px-4 pb-nav pt-4">
        <Outlet />
      </main>
      <BottomNav />
      <Toast toast={toast} />
    </div>
  )
}
