import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { FiBarChart2, FiCheckCircle, FiFileText, FiGrid, FiSettings, FiUser, FiUsers } from 'react-icons/fi'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/jd-analytics', label: 'JD Analytics', icon: FiBarChart2 },
  { to: '/resume-parser', label: 'Resume Parser', icon: FiFileText },
  { to: '/profile-builder', label: 'Profile Builder', icon: FiUser },
  { to: '/talent-check', label: 'Talent Check', icon: FiCheckCircle },
  { to: '/skill-matching', label: 'Skill Matching', icon: FiUsers },
  { to: '/settings', label: 'Settings', icon: FiSettings },
]

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-slate-200 bg-white/80 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:block">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-brand-500">RADIX</p>
        <h1 className="text-xl font-semibold">Talent Match</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="block">
            {({ isActive }) => (
              <motion.div whileHover={{ x: 4 }} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}>
                <Icon size={16} />
                {label}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
