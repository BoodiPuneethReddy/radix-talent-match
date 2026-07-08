import { motion } from 'framer-motion'

function PlaceholderModule({ title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/60"
    >
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">{description}</p>
      <div className="mx-auto max-w-xl rounded-xl bg-white p-4 text-sm font-medium text-brand-600 shadow-card dark:bg-slate-900 dark:text-brand-100">
        This module will be implemented by Team Member.
      </div>
    </motion.div>
  )
}

export default PlaceholderModule
