import { useState } from 'react'
import { TEAMS, TEAM_STATS, fmtPct, legendsFallback, apiPost } from '../api'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

export default function LegendsTab({ apiAvailable, setApiAvailable }: Props) {
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('Germany')
  const [loading, setLoading] = useState(false)
  const [narrative, setNarrative] = useState('')

  const sa = TEAM_STATS[a]; const sb = TEAM_STATS[b]

  const run = async () => {
    setLoading(true); setNarrative('')
    if (apiAvailable) {
      const r = await apiPost<{ narrative: string }>('/explain/legends', { team_a: a, team_b: b })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(legendsFallback(a, b, sa, sb)) }
    } else setNarrative(legendsFallback(a, b, sa, sb))
    setLoading(false)
  }

  return (
    <div>
      <div className="grid-2">
        <div className="glass-card">
          <label>Team A</label>
          <select value={a} onChange={e => setA(e.target.value)}>{TEAMS.map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <div className="glass-card">
          <label>Team B</label>
          <select value={b} onChange={e => setB(e.target.value)}>{TEAMS.map(t => <option key={t}>{t}</option>)}</select>
        </div>
      </div>
      <div className="grid-2">
        <div className="glass-card">
          <div className="metric-label">{a}</div>
          <div className="metric-value" style={{ fontSize: '1.4rem' }}>{fmtPct(sa.winrate)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{sa.matches} matches &middot; {sa.goal_avg.toFixed(1)} goals/game</div>
        </div>
        <div className="glass-card">
          <div className="metric-label">{b}</div>
          <div className="metric-value" style={{ fontSize: '1.4rem' }}>{fmtPct(sb.winrate)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{sb.matches} matches &middot; {sb.goal_avg.toFixed(1)} goals/game</div>
        </div>
      </div>
      <button className="btn-primary" onClick={run} disabled={loading}>{loading ? <><span className="spinner" />Analyzing...</> : '⚔️ Compare Legends'}</button>
      {narrative && <div className="granite-box" style={{ marginTop: '1rem' }}>{narrative}</div>}
    </div>
  )
}
