import { useEffect, useState } from 'react'
import { FaFileExcel, FaFilePdf, FaSyncAlt, FaUpload } from 'react-icons/fa'
import { resumeParserService } from '../../services/resumeParserService'

export default function ResumeParserPage() {
  const [resumeFile, setResumeFile] = useState(null)
  const [excelFile, setExcelFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadLastParsed = async () => {
    try {
      const { data } = await resumeParserService.getLastParsed()
      setResult(data.data)
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    loadLastParsed()
  }, [])

  const parseFiles = async () => {
    if (!resumeFile && !excelFile) {
      setError('Please upload resume, excel, or both.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const { data } = await resumeParserService.parse({ resumeFile, excelFile })
      setResult(data.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Resume parsing failed.')
    } finally {
      setLoading(false)
    }
  }

  const candidate = result?.candidate

  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-5 shadow-premium">
        <h3 className="text-xl font-semibold mb-4">Resume Parser</h3>
        <div className="grid xl:grid-cols-2 gap-4">
          <label className="rounded-xl border border-dashed border-slate-400/40 p-4 cursor-pointer">
            <p className="font-medium inline-flex items-center gap-2"><FaFilePdf /> Upload Resume (PDF/DOCX)</p>
            <p className="text-sm opacity-70">{resumeFile?.name || 'No resume selected'}</p>
            <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
          </label>
          <label className="rounded-xl border border-dashed border-slate-400/40 p-4 cursor-pointer">
            <p className="font-medium inline-flex items-center gap-2"><FaFileExcel /> Import Candidate Excel</p>
            <p className="text-sm opacity-70">{excelFile?.name || 'No excel selected'}</p>
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={(e) => setExcelFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={parseFiles} disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white inline-flex items-center gap-2">
            <FaUpload /> Parse & Merge
          </button>
          <button onClick={loadLastParsed} disabled={loading} className="px-4 py-2 rounded-lg bg-slate-700 text-white inline-flex items-center gap-2">
            <FaSyncAlt /> Load Last Parsed
          </button>
        </div>
        {error && <p className="text-sm text-rose-500 mt-3">{error}</p>}
      </div>

      {candidate && (
        <div className="grid xl:grid-cols-2 gap-4">
          <article className="glass rounded-2xl p-5 shadow-premium space-y-2">
            <h4 className="text-lg font-semibold">Standardized Candidate JSON</h4>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {candidate.name || '-'}</p>
              <p><strong>Email:</strong> {candidate.email || '-'}</p>
              <p><strong>Phone:</strong> {candidate.phone || '-'}</p>
              <p><strong>Education:</strong> {candidate.education?.join(', ') || '-'}</p>
              <p><strong>Projects:</strong> {candidate.projects?.join(', ') || '-'}</p>
              <p><strong>Experience:</strong> {candidate.experience?.join(', ') || '-'}</p>
              <p><strong>Skills:</strong> {candidate.skills?.join(', ') || '-'}</p>
              <p><strong>Hackathons:</strong> {candidate.hackathons?.join(', ') || '-'}</p>
              <p><strong>Internships:</strong> {candidate.internships?.join(', ') || '-'}</p>
              <p><strong>Achievements:</strong> {candidate.achievements?.join(', ') || '-'}</p>
              <p><strong>Certifications:</strong> {candidate.certifications?.join(', ') || '-'}</p>
              <p><strong>Languages:</strong> {candidate.languages?.join(', ') || '-'}</p>
              <p><strong>GitHub:</strong> {candidate.github || '-'}</p>
              <p><strong>LinkedIn:</strong> {candidate.linkedin || '-'}</p>
              <p><strong>Portfolio:</strong> {candidate.portfolio || '-'}</p>
            </div>
          </article>

          <article className="glass rounded-2xl p-5 shadow-premium space-y-3">
            <h4 className="text-lg font-semibold">Auto-mapped Excel Columns</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(result.column_mapping || {}).length === 0 ? (
                <p className="opacity-70">No Excel file mapping present.</p>
              ) : (
                Object.entries(result.column_mapping || {}).map(([field, column]) => (
                  <p key={field}><strong>{field}:</strong> {column}</p>
                ))
              )}
            </div>
            <h5 className="font-semibold pt-2">Raw JSON Preview</h5>
            <pre className="rounded-lg bg-slate-500/10 p-3 text-xs overflow-auto max-h-80">{JSON.stringify(result, null, 2)}</pre>
          </article>
        </div>
      )}
    </section>
  )
}
