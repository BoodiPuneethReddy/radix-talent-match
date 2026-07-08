import { motion } from 'framer-motion'
import { useRef } from 'react'
import { FiUploadCloud } from 'react-icons/fi'

function FileDropzone({ label, onFileSelect, accept, fileName }) {
  const fileRef = useRef(null)

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <motion.div
        whileHover={{ scale: 1.01 }}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-4 text-center dark:border-brand-800 dark:bg-brand-900/20"
      >
        <FiUploadCloud className="mx-auto mb-2" />
        <p className="text-sm">Drag and drop or click to upload</p>
        <p className="text-xs text-slate-500">{fileName || 'No file selected'}</p>
      </motion.div>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFileSelect(file)
        }}
      />
    </div>
  )
}

export default FileDropzone
