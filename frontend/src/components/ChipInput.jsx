import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'

export default function ChipInput({ label, values, onChange, placeholder = 'Add item' }) {
  const [input, setInput] = useState('')

  const addChip = () => {
    const next = input.trim()
    if (!next || values.includes(next)) return
    onChange([...values, next])
    setInput('')
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChip())}
        />
        <button type="button" onClick={addChip} className="px-3 py-2 rounded-lg bg-indigo-600 text-white">
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((chip) => (
          <span key={chip} className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-sm">
            {chip}
            <button type="button" onClick={() => onChange(values.filter((c) => c !== chip))}>
              <FaTimes size={10} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
