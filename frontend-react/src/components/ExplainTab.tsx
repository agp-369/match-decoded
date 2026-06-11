import { useState } from 'react'
import { FEATURES, fmtPct, explainFallback, apiPost } from '../api'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

export default function ExplainTab({ apiAvailable, setApiAvailable }: Props) {
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true); setNarrative('')
    if (apiAvailable) {
      const r = await apiPost<{ narrative: string }>('/explain/decision', {
        prediction: { team_a_win_prob: 0.423, draw_prob: 0.252, team_b_win_prob: 0.325 },
        features: FEATURES,
      })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(explainFallback()) }
    } else setNarrative(explainFallback())
    setLoading(false)
  }

  return (
    <div>
      <div className="glass-card">
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>Model factors sorted by importance:</p>
        <div className="glass-card" style={{ padding: '0.8rem' }}>
          {FEATURES.filter(f => f.importance > 0.02).map((f, i) => (
            <div key={f.name} style={{ marginBottom: i < 5 ? '0.6rem' : 0 }}>
              <div className="progress-label" style={{ display: 'flex', justifyContent: 'space-between', textTransform: 'capitalize' }}>
                <span>{f.name.replace(/_/g, ' ')}</span><span>{(f.importance * 100).toFixed(1)}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${f.importance * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <button className="btn-primary" onClick={run} disabled={loading}>{loading ? <><span className="spinner" />Analyzing...</> : '🧠 Explain Decision'}</button>
      {narrative && <div className="granite-box" style={{ marginTop: '1rem' }}>{narrative}</div>}
    </div>
  )
}
