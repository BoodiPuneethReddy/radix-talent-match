import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function FileDropzone({ label, accept, onFileSelect }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`rounded-xl border-2 border-dashed p-4 cursor-pointer transition ${
        dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-400/40'
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(file)
        }}
      />
      <p className="font-medium">{label}</p>
      <p className="text-sm opacity-70">Drag and drop file here or click to upload.</p>
    </motion.div>
  )
}
