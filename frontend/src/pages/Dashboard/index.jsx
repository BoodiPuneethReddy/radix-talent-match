import { useEffect, useMemo, useState } from 'react'
import { FaSyncAlt } from 'react-icons/fa'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { jdAnalyticsService } from '../../services/jdAnalyticsService'
import { resumeParserService } from '../../services/resumeParserService'
import { profileService } from '../../services/profileService'

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b']

export default function DashboardPage() {
  const [stats, setStats] = useState({ jd: 0, candidate: 0, profile: 0, modules: 5 })

  const loadStats = async () => {
    const [jd, candidate, profile] = await Promise.allSettled([
      jdAnalyticsService.getAnalysis(),
      resumeParserService.getLastParsed(),
      profileService.getProfile()
    ])

    setStats({
      jd: jd.status === 'fulfilled' ? 1 : 0,
      candidate: candidate.status === 'fulfilled' ? 1 : 0,
      profile: profile.status === 'fulfilled' ? 1 : 0,
      modules: 5
    })
  }

  useEffect(() => {
    loadStats()
  }, [])

  const chartData = useMemo(
    () => [
      { name: 'JD Analyses', value: stats.jd },
      { name: 'Parsed Candidates', value: stats.candidate },
      { name: 'Saved Profiles', value: stats.profile },
      { name: 'Module Architectures', value: stats.modules }
    ],
    [stats]
  )

  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-5 shadow-premium">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Dashboard</h3>
          <button onClick={loadStats} className="px-3 py-2 rounded-lg bg-slate-700 text-white inline-flex items-center gap-2"><FaSyncAlt /> Refresh</button>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {chartData.map((item) => (
          <article key={item.name} className="glass rounded-2xl p-5 shadow-premium">
            <p className="text-sm opacity-70">{item.name}</p>
            <h4 className="text-3xl font-bold mt-2">{item.value}</h4>
          </article>
        ))}
      </div>
      <article className="glass rounded-2xl p-5 shadow-premium h-80">
        <h4 className="text-lg font-semibold mb-3">Platform Snapshot</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={95} dataKey="value" label>
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </article>
    </section>
  )
}
