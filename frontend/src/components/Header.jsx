import { FaMoon, FaSun } from 'react-icons/fa'

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="glass rounded-2xl px-4 py-3 flex items-center justify-between shadow-premium">
      <div>
        <p className="text-xs uppercase tracking-wide opacity-70">Talent Intelligence Suite</p>
        <h2 className="text-lg font-semibold">Workspace</h2>
      </div>
      <button
        type="button"
        onClick={onToggleTheme}
        className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:opacity-90"
      >
        {theme === 'dark' ? <FaSun /> : <FaMoon />}
      </button>
    </header>
  )
}
