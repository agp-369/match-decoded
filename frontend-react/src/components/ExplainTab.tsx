import { useState, useEffect } from 'react'
import { fmtPct, apiPost, generateMomentum, type FeatureImportance } from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

export default function ExplainTab({ apiAvailable, setApiAvailable }: Props) {
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [features, setFeatures] = useState<FeatureImportance[] | null>(null)
  const [prediction, setPrediction] = useState<{ a: number; d: number; b: number } | null>(null)

  useEffect(() => {
    if (!features) {
      apiPost<{ prediction: { team_a_win_prob: number; draw_prob: number; team_b_win_prob: number }; feature_importances: FeatureImportance[] }>('/explain/decision', {
        team_a: 'Brazil', team_b: 'Argentina', is_neutral: true, is_major_tournament: true,
      }).then(r => {
        if (r) {
          setFeatures(r.feature_importances)
          setPrediction({ a: r.prediction.team_a_win_prob, d: r.prediction.draw_prob, b: r.prediction.team_b_win_prob })
        }
      })
    }
  }, [features])

  const run = async () => {
    setLoading(true)
    setNarrative('')
    if (apiAvailable) {
      const r = await apiPost<{ explanation: string; feature_importances: FeatureImportance[] }>('/explain/decision', {
        team_a: 'Brazil', team_b: 'Argentina', is_neutral: true, is_major_tournament: true,
      })
      if (r) {
        if (r.explanation) setNarrative(r.explanation)
        if (r.feature_importances) setFeatures(r.feature_importances)
      } else {
        setApiAvailable(false)
      }
    }
    setLoading(false)
  }

  const probs = prediction || { a: 0.423, d: 0.252, b: 0.325 }
  const momentum = showTimeline ? generateMomentum(probs.a, probs.d, probs.b) : []

  return (
    <div>
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Model Decision Trace
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Every prediction is built from 12 factors. The XGBoost ensemble model evaluates these simultaneously, weighted by historical importance.
        </p>
        {features ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {features.map((f, i) => {
              const maxImp = features[0].importance
              const pct = maxImp > 0 ? (f.importance / maxImp) * 100 : 0
              return (
                <div key={f.name}>
                  <div className="progress-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 700 }}>0{i + 1}</span>
                      {f.name}
                    </span>
                    <span style={{ color: 'var(--gold-light)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {(f.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
            Click "Explain with Granite" to load live feature importances from the model.
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn-primary" onClick={run} disabled={loading} style={{ flex: 1 }}>
          {loading ? <><span className="spinner" /> Analyzing...</> : '🤖 Explain with Granite'}
        </button>
        <button className="btn-secondary" onClick={() => setShowTimeline(!showTimeline)}>
          {showTimeline ? 'Hide Timeline' : 'Simulate Match'}
        </button>
      </div>

      {showTimeline && (
        <div className="glass-card" style={{ marginTop: '0.8rem' }}>
          <div className="section-heading">
            <span className="accent">●</span> Probability Timeline
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            Simulated probability over 90 minutes — showing how goals, cards, and tactics shift momentum.
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={momentum}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="minute" tick={{ fill: '#5a6a80', fontSize: 10 }} />
              <YAxis domain={[0, 1]} tick={{ fill: '#5a6a80', fontSize: 10 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: '#0a0e27', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '0.75rem' }}
                formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
              <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
              <Line type="monotone" dataKey="a_prob" stroke="#22c55e" strokeWidth={2} dot={false} name="Home" />
              <Line type="monotone" dataKey="b_prob" stroke="#ef4444" strokeWidth={2} dot={false} name="Away" />
              <Line type="monotone" dataKey="d_prob" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Draw" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
            {momentum.filter(p => p.event).map((p, i) => (
              <span key={i} className="momentum-event">{p.event} ({p.minute}')</span>
            ))}
          </div>
        </div>
      )}

      {narrative && <div className="granite-box" style={{ marginTop: '1rem' }}>{narrative}</div>}
    </div>
  )
}
