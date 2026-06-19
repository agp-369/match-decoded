import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function DoclingTab() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const upload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const r = await fetch(`${API}/docling/analyze`, { method: 'POST', body: formData })
      if (!r.ok) {
        const err = await r.text().catch(() => '')
        throw new Error(err || `Server returned ${r.status}`)
      }
      const data = await r.json()
      setResult(data.analysis || 'No analysis returned.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg.includes('Failed to fetch')
        ? 'Backend unavailable — start the FastAPI server.'
        : msg)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Docling Match Report Analysis
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Upload a PDF match report. IBM Docling parses the document, then Granite generates a tactical breakdown.
        </p>
        <label className={`upload-zone${file ? ' has-file' : ''}`}>
          <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
          {file ? (
            <div>
              <span className="upload-icon">📄</span>
              <div className="upload-text"><strong>{file.name}</strong></div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{(file.size / 1024).toFixed(0)} KB &middot; Click to change</div>
            </div>
          ) : (
            <div>
              <span className="upload-icon">📄</span>
              <div className="upload-text">Drop a match report here or <strong>click to browse</strong></div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.3rem' }}>Supports PDF files</div>
            </div>
          )}
        </label>
      </div>

      <button className="btn-primary" onClick={upload} disabled={loading || !file}>
        {loading ? <><span className="spinner" /> Parsing with Docling...</> : '🔍 Analyze Report'}
      </button>

      {error && <div className="error">{error}</div>}
      {result && <div className="granite-box" style={{ marginTop: '1rem' }}>{result}</div>}
    </div>
  )
}
