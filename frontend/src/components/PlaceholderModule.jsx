import { motion } from 'framer-motion'

export default function PlaceholderModule({ title, description }) {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 shadow-premium">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="opacity-80 mb-4">{description}</p>
      <div className="rounded-xl border border-dashed border-indigo-500 p-8 text-center bg-indigo-500/5">
        <p className="text-lg font-medium">This module will be implemented by Team Member.</p>
        <p className="text-sm opacity-70 mt-2">API is intentionally returning HTTP 501.</p>
      </div>
    </motion.section>
  )
}
