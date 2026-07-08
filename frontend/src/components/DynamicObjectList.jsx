import { FiPlus, FiTrash } from 'react-icons/fi'

function DynamicObjectList({ title, fields, values, onChange }) {
  const addRow = () => {
    const blank = fields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {})
    onChange([...values, blank])
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <button type="button" onClick={addRow} className="text-brand-500">
          <FiPlus />
        </button>
      </div>
      {values.map((item, index) => (
        <div key={`${title}-${index}`} className="grid gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700 md:grid-cols-2">
          {fields.map((field) => (
            <input
              key={field.key}
              type="text"
              placeholder={field.label}
              value={item[field.key] || ''}
              onChange={(event) => {
                const next = [...values]
                next[index] = { ...item, [field.key]: event.target.value }
                onChange(next)
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            className="justify-self-end rounded-lg p-2 text-rose-500"
          >
            <FiTrash />
          </button>
        </div>
      ))}
    </div>
  )
}

export default DynamicObjectList
