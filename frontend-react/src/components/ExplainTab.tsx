import { useState } from 'react'
import { FEATURES, fmtPct, explainFallback, apiPost } from '../api'

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
}

export default function ExplainTab({ apiAvailable, setApiAvailable }: Props) {
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)

  const topFeatures = FEATURES.filter(f => f.importance > 0.02).slice(0, 6)

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

  return (
    <div>
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Model Feature Importance
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Every prediction is built from 8 factors. Here's how the model weights each one — sorted by influence.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
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

      <button className="btn-primary" onClick={run} disabled={loading}>
        {loading ? <><span className="spinner" /> Analyzing...</> : '🤖 Explain with Granite'}
      </button>

      {narrative && <div className="granite-box" style={{ marginTop: '1rem' }}>{narrative}</div>}
    </div>
  )
}
