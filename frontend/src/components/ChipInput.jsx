import { FiX } from 'react-icons/fi'

function ChipInput({ label, values, onAdd, onRemove, placeholder = 'Type and press Enter' }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const value = event.currentTarget.value.trim()
      if (!value) return
      onAdd(value)
      event.currentTarget.value = ''
    }
  }

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
      />
      <div className="flex flex-wrap gap-2">
        {values.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs dark:bg-brand-900">
            {item}
            <button type="button" onClick={() => onRemove(index)}>
              <FiX size={12} />
            </button>
          </span>
        ))}
      </div>
    </label>
  )
}

export default ChipInput
