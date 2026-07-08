import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function AppLayout({ theme, onToggleTheme }) {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px_1fr] gap-4">
        <Sidebar />
        <main className="space-y-4">
          <Header theme={theme} onToggleTheme={onToggleTheme} />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
