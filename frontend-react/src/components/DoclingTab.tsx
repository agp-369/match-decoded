import { useState } from 'react'
import { apiPost } from '../api'

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
      const text = await file.text()
      const r = await apiPost<{ summary: string; narrative: string }>('/docling/analyze', { text })
      if (r && r.narrative) setResult(r.narrative)
      else setError('Backend unavailable — Docling requires the FastAPI backend to be running.')
    } catch {
      setError('Could not read file. Try a plain text or PDF match report.')
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
          Upload a match report (PDF or TXT). IBM Docling parses the document, then Granite generates a tactical breakdown.
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
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.3rem' }}>Supports PDF and text files</div>
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
