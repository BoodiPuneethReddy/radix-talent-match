import { motion } from 'framer-motion'

const cards = [
  'JD Analytics',
  'Resume Parser',
  'Profile Builder',
  'Talent Check',
  'Skill Matching',
]

function DashboardPage() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Dashboard</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-card dark:border-slate-700 dark:from-slate-900 dark:to-slate-800"
          >
            <p className="text-sm text-slate-500">Module</p>
            <h4 className="mt-2 text-lg font-semibold">{card}</h4>
            <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full w-2/3 rounded-full bg-brand-500" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
