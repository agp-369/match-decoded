import { useState } from 'react'
import { TEAMS, TEAM_STATS, fmtPct, teamFlag, legendsFallback, apiPost } from '../api'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

export default function LegendsTab({ apiAvailable, setApiAvailable }: Props) {
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('Germany')
  const [loading, setLoading] = useState(false)
  const [narrative, setNarrative] = useState('')

  const sa = TEAM_STATS[a]
  const sb = TEAM_STATS[b]

  const run = async () => {
    setLoading(true)
    setNarrative('')
    if (apiAvailable) {
      const r = await apiPost<{ narrative: string }>('/explain/legends', { team_a: a, team_b: b })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(legendsFallback(a, b, sa, sb)) }
    } else {
      setNarrative(legendsFallback(a, b, sa, sb))
    }
    setLoading(false)
  }

  return (
    <div>
      {}
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Compare Two Teams
        </div>
        <div className="grid-2">
          <select value={a} onChange={e => setA(e.target.value)}>{TEAMS.map(t => <option key={t}>{t}</option>)}</select>
          <select value={b} onChange={e => setB(e.target.value)}>{TEAMS.map(t => <option key={t}>{t}</option>)}</select>
        </div>
      </div>

      {}
      <div className="grid-2">
        <div className="team-card team-a">
          <span className="team-flag">{teamFlag(a)}</span>
          <div className="team-name" style={{ fontSize: '1.4rem' }}>{a}</div>
          <div style={{ marginTop: '0.8rem' }}>
            <div className="team-stat">
              <span className="team-stat-label">Win Rate</span>
              <span className="team-stat-value" style={{ fontSize: '1.3rem', color: 'var(--gold-light)' }}>{fmtPct(sa.winrate)}</span>
            </div>
            <div className="team-stat">
              <span className="team-stat-label">Goals Per Game</span>
              <span className="team-stat-value">{sa.goal_avg.toFixed(2)}</span>
            </div>
            <div className="team-stat">
              <span className="team-stat-label">Total Matches</span>
              <span className="team-stat-value">{sa.matches.toLocaleString()}</span>
            </div>
            <div className="team-stat">
              <span className="team-stat-label">Recent Form</span>
              <span className="team-stat-value">{fmtPct(sa.form)}</span>
            </div>
          </div>
        </div>
        <div className="team-card team-b">
          <span className="team-flag">{teamFlag(b)}</span>
          <div className="team-name" style={{ fontSize: '1.4rem' }}>{b}</div>
          <div style={{ marginTop: '0.8rem' }}>
            <div className="team-stat">
              <span className="team-stat-label">Win Rate</span>
              <span className="team-stat-value" style={{ fontSize: '1.3rem', color: 'var(--gold-light)' }}>{fmtPct(sb.winrate)}</span>
            </div>
            <div className="team-stat">
              <span className="team-stat-label">Goals Per Game</span>
              <span className="team-stat-value">{sb.goal_avg.toFixed(2)}</span>
            </div>
            <div className="team-stat">
              <span className="team-stat-label">Total Matches</span>
              <span className="team-stat-value">{sb.matches.toLocaleString()}</span>
            </div>
            <div className="team-stat">
              <span className="team-stat-label">Recent Form</span>
              <span className="team-stat-value">{fmtPct(sb.form)}</span>
            </div>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={run} disabled={loading}>
        {loading ? <><span className="spinner" /> Analyzing...</> : '⚔️ Compare Legends'}
      </button>

      {narrative && <div className="granite-box" style={{ marginTop: '1rem' }}>{narrative}</div>}
    </div>
  )
}
