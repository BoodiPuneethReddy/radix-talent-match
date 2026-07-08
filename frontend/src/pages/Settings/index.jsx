import { useState } from 'react'
import { FaSave, FaUndo } from 'react-icons/fa'

const KEY = 'radix-settings'

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(KEY)
    return saved
      ? JSON.parse(saved)
      : {
          aiProvider: 'none',
          aiModel: '',
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
        }
  })
  const [savedAt, setSavedAt] = useState('')

  const onSave = () => {
    localStorage.setItem(KEY, JSON.stringify(settings))
    setSavedAt(new Date().toLocaleString())
  }

  const onReset = () => {
    localStorage.removeItem(KEY)
    setSettings({
      aiProvider: 'none',
      aiModel: '',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    })
    setSavedAt('')
  }

  return (
    <section className="glass rounded-2xl p-6 shadow-premium space-y-4">
      <h3 className="text-xl font-semibold">Settings</h3>
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">AI Provider</label>
          <select value={settings.aiProvider} onChange={(e) => setSettings((prev) => ({ ...prev, aiProvider: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2">
            <option value="none">None</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">AI Model</label>
          <input value={settings.aiModel} onChange={(e) => setSettings((prev) => ({ ...prev, aiModel: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">API Base URL</label>
          <input value={settings.apiBaseUrl} onChange={(e) => setSettings((prev) => ({ ...prev, apiBaseUrl: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="px-3 py-2 rounded-lg bg-indigo-600 text-white inline-flex items-center gap-2"><FaSave /> Save Settings</button>
        <button onClick={onReset} className="px-3 py-2 rounded-lg bg-slate-700 text-white inline-flex items-center gap-2"><FaUndo /> Reset</button>
      </div>
      {savedAt && <p className="text-sm opacity-70">Saved at {savedAt}</p>}
    </section>
  )
}
