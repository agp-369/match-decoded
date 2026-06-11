import { useState } from 'react'
import { FEATURES, fmtPct, explainFallback, apiPost, generateMomentum } from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

const FEATURE_LABELS: Record<string, string> = {
  team_b_winrate: 'Opponent Win Rate',
  team_a_winrate: 'Team Win Rate',
  team_b_goal_avg: 'Opponent Goals/Game',
  team_a_goal_avg: 'Team Goals/Game',
  team_b_recent_form: 'Opponent Recent Form',
  team_a_recent_form: 'Team Recent Form',
  is_neutral: 'Neutral Venue',
  is_major_tournament: 'Major Tournament',
  team_a_defense: 'Team Defense',
  team_b_defense: 'Opponent Defense',
}

export default function ExplainTab({ apiAvailable, setApiAvailable }: Props) {
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  const topFeatures = FEATURES.filter(f => f.importance > 0.02).slice(0, 8)

  const run = async () => {
    setLoading(true)
    setNarrative('')
    if (apiAvailable) {
      const r = await apiPost<{ narrative: string }>('/explain/decision', {
        prediction: { team_a_win_prob: 0.423, draw_prob: 0.252, team_b_win_prob: 0.325 },
        features: FEATURES,
      })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(explainFallback()) }
    } else {
      setNarrative(explainFallback())
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
          Every prediction is built from 10 factors. The Random Forest model evaluates these simultaneously, weighted by historical importance.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {topFeatures.map((f, i) => {
            const pct = (f.importance / FEATURES[0].importance) * 100
            return (
              <div key={f.name}>
                <div className="progress-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 700 }}>0{i + 1}</span>
                    {FEATURE_LABELS[f.name] || f.name.replace(/_/g, ' ')}
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
