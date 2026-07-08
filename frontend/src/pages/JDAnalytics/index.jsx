import { useEffect, useMemo, useState } from 'react'
import { FaCloudUploadAlt, FaDownload, FaFileAlt, FaRecycle, FaSearch, FaTrash } from 'react-icons/fa'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { jdAnalyticsService } from '../../services/jdAnalyticsService'

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function JDAnalyticsPage() {
  const [file, setFile] = useState(null)
  const [uploaded, setUploaded] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categoryData = useMemo(() => {
    const categories = analysis?.categories || {}
    return Object.entries(categories).map(([name, values]) => ({ name, count: values.length }))
  }, [analysis])

  const loadExisting = async () => {
    try {
      const [fileResp, analysisResp] = await Promise.allSettled([
        jdAnalyticsService.getUploadedFile(),
        jdAnalyticsService.getAnalysis()
      ])
      if (fileResp.status === 'fulfilled') setUploaded(fileResp.value.data.data)
      if (analysisResp.status === 'fulfilled') setAnalysis(analysisResp.value.data.data)
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    loadExisting()
  }, [])

  const uploadFile = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const { data } = await jdAnalyticsService.uploadJD(file)
      setUploaded(data.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'JD upload failed.')
    } finally {
      setLoading(false)
    }
  }

  const analyze = async (isReanalyze = false) => {
    setLoading(true)
    setError('')
    try {
      const { data } = isReanalyze ? await jdAnalyticsService.reanalyze() : await jdAnalyticsService.analyze()
      setAnalysis(data.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'JD analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const deleteUploaded = async () => {
    setLoading(true)
    setError('')
    try {
      await jdAnalyticsService.deleteUploadedFile()
      setUploaded(null)
      setAnalysis(null)
      setFile(null)
    } catch (e) {
      setError(e.response?.data?.detail || 'Delete failed.')
    } finally {
      setLoading(false)
    }
  }

  const downloadJson = async () => {
    try {
      const response = await jdAnalyticsService.downloadAnalysis()
      downloadBlob(response.data, 'jd-analysis.json')
    } catch {
      setError('Download failed.')
    }
  }

  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-5 shadow-premium">
        <h3 className="text-xl font-semibold mb-4">JD Analytics</h3>
        <div className="grid lg:grid-cols-[1fr_auto] gap-3">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
          />
          <button onClick={uploadFile} disabled={!file || loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white inline-flex items-center gap-2">
            <FaCloudUploadAlt /> Upload JD
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={() => analyze(false)} disabled={!uploaded || loading} className="px-3 py-2 rounded-lg bg-emerald-600 text-white inline-flex items-center gap-2"><FaSearch /> Analyze JD</button>
          <button onClick={() => analyze(true)} disabled={!uploaded || loading} className="px-3 py-2 rounded-lg bg-sky-600 text-white inline-flex items-center gap-2"><FaRecycle /> Re-analyze</button>
          <button onClick={downloadJson} disabled={!analysis || loading} className="px-3 py-2 rounded-lg bg-slate-700 text-white inline-flex items-center gap-2"><FaDownload /> Download JSON</button>
          <button onClick={deleteUploaded} disabled={!uploaded || loading} className="px-3 py-2 rounded-lg bg-rose-600 text-white inline-flex items-center gap-2"><FaTrash /> Delete Uploaded File</button>
        </div>

        {uploaded && (
          <div className="mt-3 text-sm rounded-lg bg-slate-500/10 p-3">
            <p className="font-medium inline-flex items-center gap-2"><FaFileAlt /> Uploaded File: {uploaded.file_name}</p>
            <p className="opacity-80">Uploaded at: {new Date(uploaded.uploaded_at).toLocaleString()}</p>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      </div>

      {analysis && (
        <div className="grid xl:grid-cols-2 gap-4">
          <article className="glass rounded-2xl p-5 shadow-premium space-y-2">
            <h4 className="text-lg font-semibold">Extracted Details</h4>
            <p><strong>Company:</strong> {analysis.company || '-'}</p>
            <p><strong>Role:</strong> {analysis.role || '-'}</p>
            <p><strong>Experience:</strong> {analysis.experience || '-'}</p>
            <p><strong>Technologies:</strong> {analysis.technologies?.join(', ') || '-'}</p>
            <p><strong>Required Skills:</strong> {analysis.required_skills?.join(', ') || '-'}</p>
            <div>
              <p className="font-semibold">Responsibilities</p>
              <ul className="list-disc pl-5">
                {(analysis.responsibilities || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </article>

          <article className="glass rounded-2xl p-5 shadow-premium">
            <h4 className="text-lg font-semibold mb-3">Skill Categories</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>
      )}
    </section>
  )
}
