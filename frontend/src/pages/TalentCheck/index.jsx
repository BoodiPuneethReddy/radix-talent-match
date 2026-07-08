import { useEffect, useState } from 'react'
import { FaSyncAlt } from 'react-icons/fa'
import { moduleService } from '../../services/moduleService'

export default function TalentCheckPage() {
  const [status, setStatus] = useState({ code: 501, message: 'Talent Check module is under development.' })

  const loadStatus = async () => {
    try {
      await moduleService.getTalentCheckStatus()
    } catch (e) {
      setStatus({
        code: e.response?.status || 501,
        message: e.response?.data?.detail || 'Talent Check module is under development.'
      })
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  return (
    <section className="glass rounded-2xl p-6 shadow-premium">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold">Talent Check</h3>
        <button onClick={loadStatus} className="px-3 py-2 rounded-lg bg-slate-700 text-white inline-flex items-center gap-2"><FaSyncAlt /> Refresh Status</button>
      </div>
      <p className="opacity-80">HTTP {status.code}</p>
      <p className="mt-2">{status.message}</p>
    </section>
  )
}
