import { motion } from 'framer-motion'

const cards = [
  { title: 'Active Profiles', value: '128', subtitle: 'Stored candidate profiles' },
  { title: 'Modules Ready', value: '6', subtitle: 'Stable architecture locked' },
  { title: 'Resume Queue', value: '24', subtitle: 'Pending parser integrations' }
]

export default function DashboardPage() {
  return (
    <section className="grid md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <motion.article
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 shadow-premium"
        >
          <p className="text-sm opacity-70">{card.title}</p>
          <h3 className="text-3xl font-bold my-2">{card.value}</h3>
          <p className="text-sm opacity-80">{card.subtitle}</p>
        </motion.article>
      ))}
    </section>
  )
}
