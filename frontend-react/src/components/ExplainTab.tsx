import { useState } from 'react'
import { fmtPct, apiPost, generateMomentum } from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

const TOP_FEATURES = [
  { name: 'Historical ELO Rating (Home)', key: 'home_elo', importance: 0.185 },
  { name: 'Historical ELO Rating (Away)', key: 'away_elo', importance: 0.172 },
  { name: 'ELO Rating Difference', key: 'elo_diff', importance: 0.162 },
  { name: 'Recent Form (Home, last 10)', key: 'home_recent_form', importance: 0.142 },
  { name: 'Recent Form (Away, last 10)', key: 'away_recent_form', importance: 0.125 },
  { name: 'Goal Scoring Avg (Home)', key: 'home_goal_avg_rolling', importance: 0.098 },
  { name: 'Goal Scoring Avg (Away)', key: 'away_goal_avg_rolling', importance: 0.082 },
  { name: 'Head-to-Head Record', key: 'h2h', importance: 0.034 },
]

export default function ExplainTab({ apiAvailable, setApiAvailable }: Props) {
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  const run = async () => {
    setLoading(true)
    setNarrative('')
    if (apiAvailable) {
      const r = await apiPost<{ explanation: string }>('/explain/decision', {
        team_a: 'Brazil', team_b: 'Argentina', is_neutral: true, is_major_tournament: true,
      })
      if (r && r.explanation) setNarrative(r.explanation)
      else { setApiAvailable(false); setNarrative('') }
    } else {
      setNarrative('')
    }
    setLoading(false)
  }

  const momentum = showTimeline ? generateMomentum(0.423, 0.252, 0.325) : []

  return (
    <div>
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Model Decision Trace
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Every prediction is built from 10 factors. The XGBoost ensemble model evaluates these simultaneously, weighted by historical importance.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {TOP_FEATURES.map((f, i) => {
            const pct = (f.importance / TOP_FEATURES[0].importance) * 100
            return (
              <div key={f.key}>
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
