import { FiPlus, FiTrash } from 'react-icons/fi'

function DynamicTextList({ title, values, onChange, placeholder }) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <button type="button" onClick={() => onChange([...values, ''])} className="text-brand-500">
          <FiPlus />
        </button>
      </div>
      {values.map((value, index) => (
        <div key={`${title}-${index}`} className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              const next = [...values]
              next[index] = event.target.value
              onChange(next)
            }}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, valueIndex) => valueIndex !== index))}
            className="rounded-lg p-2 text-rose-500"
          >
            <FiTrash />
          </button>
        </div>
      ))}
    </div>
  )
}

export default DynamicTextList
