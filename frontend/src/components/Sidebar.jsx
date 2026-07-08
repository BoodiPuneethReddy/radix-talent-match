import { NavLink } from 'react-router-dom'
import { FaHome, FaFileAlt, FaUserEdit, FaCheckCircle, FaProjectDiagram, FaCog, FaSearch } from 'react-icons/fa'

const links = [
  { to: '/', label: 'Dashboard', icon: FaHome },
  { to: '/jd-analytics', label: 'JD Analytics', icon: FaSearch },
  { to: '/resume-parser', label: 'Resume Parser', icon: FaFileAlt },
  { to: '/profile-builder', label: 'Profile Builder', icon: FaUserEdit },
  { to: '/talent-check', label: 'Talent Check', icon: FaCheckCircle },
  { to: '/skill-matching', label: 'Skill Matching', icon: FaProjectDiagram },
  { to: '/settings', label: 'Settings', icon: FaCog }
]

export default function Sidebar() {
  return (
    <aside className="glass w-full lg:w-72 rounded-2xl p-4 shadow-premium">
      <h1 className="text-lg font-semibold mb-4">RADIX Talent Match</h1>
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
