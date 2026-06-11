import { useState } from 'react'
import { apiPost } from '../api'

export default function DoclingTab() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const upload = async () => {
    if (!file) return
    setLoading(true); setError(''); setResult('')
    const text = await file.text()
    const r = await apiPost<{ summary: string; narrative: string }>('/docling/analyze', { text })
    if (r && r.narrative) setResult(r.narrative)
    else setError('Backend not available (Docling requires FastAPI backend)')
    setLoading(false)
  }

  return (
    <div>
      <div className="glass-card">
        <p style={{ color: 'var(--text-dim)', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
          Upload a match report (PDF or text) — IBM Docling parses the document, Granite generates a tactical breakdown.
        </p>
        <label className="upload-zone" style={{ display: 'block' }}>
          <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
          {file ? <span style={{ color: 'var(--accent)' }}>{file.name}</span> : <span style={{ color: 'var(--text-dim)' }}>📄 Drop a match report here or click to browse</span>}
        </label>
      </div>
      <button className="btn-primary" onClick={upload} disabled={loading || !file}>{loading ? <><span className="spinner" />Parsing...</> : '🔍 Analyze with Docling'}</button>
      {error && <div className="error">{error}</div>}
      {result && <div className="granite-box" style={{ marginTop: '1rem' }}>{result}</div>}
    </div>
  )
}
