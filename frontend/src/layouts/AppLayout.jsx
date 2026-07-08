import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="flex min-h-screen flex-1 flex-col p-4 md:p-6 lg:p-8">
        <TopBar />
        <div className="mt-6 flex-1 rounded-2xl bg-white/80 p-4 shadow-card ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/90 dark:ring-slate-700 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
