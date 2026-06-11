import { useState } from 'react'
import { TEAMS, predictLocal, fmtPct, teamFlag, previewFallback, apiPost } from '../api'

interface Props {
  apiAvailable: boolean
  setApiAvailable: (v: boolean) => void
}

export default function PreMatchTab({ apiAvailable, setApiAvailable }: Props) {
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('Argentina')
  const [neutral, setNeutral] = useState(false)
  const [major, setMajor] = useState(false)
  const [pred, setPred] = useState<ReturnType<typeof predictLocal> | null>(null)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setNarrative('')
    const p = predictLocal(a, b, neutral, major)
    setPred(p)
    if (apiAvailable) {
      const r = await apiPost<{ narrative: string }>('/predict', {
        team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major,
      })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(previewFallback(a, b, p.team_a_win_prob, p.draw_prob, p.team_b_win_prob)) }
    } else {
      setNarrative(previewFallback(a, b, p.team_a_win_prob, p.draw_prob, p.team_b_win_prob))
    }
    setLoading(false)
  }

  const p = pred || predictLocal(a, b, neutral, major)
  const flagA = teamFlag(a)
  const flagB = teamFlag(b)
  const aw = (p.team_a_win_prob * 100)
  const bw = (p.team_b_win_prob * 100)
  const dw = (p.draw_prob * 100)
  const aIsFav = aw > bw

  return (
    <div>
      <div className="grid-2">
        <div className="team-card team-a">
          <span className="team-flag">{flagA}</span>
          <div className="team-name">{a}</div>
          <div style={{ marginTop: '0.5rem' }}>
            <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value">{fmtPct(p.stats_a.winrate)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Goals/Game</span><span className="team-stat-value">{p.stats_a.goal_avg.toFixed(2)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Matches</span><span className="team-stat-value">{p.stats_a.matches}</span></div>
          </div>
        </div>
        <div className="team-card team-b">
          <span className="team-flag">{flagB}</span>
          <div className="team-name">{b}</div>
          <div style={{ marginTop: '0.5rem' }}>
            <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value">{fmtPct(p.stats_b.winrate)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Goals/Game</span><span className="team-stat-value">{p.stats_b.goal_avg.toFixed(2)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Matches</span><span className="team-stat-value">{p.stats_b.matches}</span></div>
          </div>
        </div>
      </div>

      <div className="glass-card gold-border">
        <div className="checkbox-group">
          <input type="checkbox" id="neutral" checked={neutral} onChange={e => setNeutral(e.target.checked)} />
          <label htmlFor="neutral">Neutral Venue</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="major" checked={major} onChange={e => setMajor(e.target.checked)} />
          <label htmlFor="major">Major Tournament (World Cup / Euro / Copa)</label>
        </div>
      </div>

      <button className="btn-primary" onClick={run} disabled={loading}>
        {loading ? <><span className="spinner" /> Analyzing...</> : '🎯 Analyze Match'}
      </button>

      {}
      {(pred || narrative) && (
        <div className="glass-card gold-border" style={{ marginTop: '1rem' }}>
          <div className="section-heading">
            <span className="accent">●</span> Match Prediction
          </div>

          <div className="scoreboard">
            <div className="scoreboard-team">
              <span className="flag">{flagA}</span>
              <div className="name">{a}</div>
              <div className="prob" style={{ color: aIsFav ? '#22c55e' : '#94a3b8' }}>{aw.toFixed(1)}%</div>
            </div>
            <div className="scoreboard-divider" />
            <div className="scoreboard-vs">vs</div>
            <div className="scoreboard-vs" style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.3rem' }}>
              Draw {dw.toFixed(1)}%
            </div>
            <div className="scoreboard-divider" />
            <div className="scoreboard-team">
              <span className="flag">{flagB}</span>
              <div className="name">{b}</div>
              <div className="prob" style={{ color: !aIsFav ? '#22c55e' : '#94a3b8' }}>{bw.toFixed(1)}%</div>
            </div>
          </div>

          <div style={{ margin: '0.5rem 0' }}>
            <div className="progress-label">
              <span>{a}</span>
              <span>{fmtPct(p.team_a_win_prob)}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${aw}%` }} />
            </div>
          </div>
          <div style={{ margin: '0.5rem 0' }}>
            <div className="progress-label">
              <span>Draw</span>
              <span>{fmtPct(p.draw_prob)}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${dw}%`, background: 'linear-gradient(90deg, #64748b, #94a3b8)' }} />
            </div>
          </div>
          <div style={{ margin: '0.5rem 0' }}>
            <div className="progress-label">
              <span>{b}</span>
              <span>{fmtPct(p.team_b_win_prob)}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${bw}%`, background: 'linear-gradient(90deg, #ef4444, #dc2626)' }} />
            </div>
          </div>

          {narrative && <div className="granite-box">{narrative}</div>}
        </div>
      )}
    </div>
  )
}
