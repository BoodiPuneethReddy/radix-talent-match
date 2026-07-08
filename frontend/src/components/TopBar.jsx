import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../hooks/useTheme'

function TopBar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">RADIX Talent Match</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Modern hiring workflow workspace</p>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-xl border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {theme === 'dark' ? <FiSun /> : <FiMoon />}
      </button>
    </div>
  )
}

export default TopBar
