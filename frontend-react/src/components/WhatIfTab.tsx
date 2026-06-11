import { useState } from 'react'
import { TEAMS, predictLocal, fmtPct, momentumFallback, apiPost } from '../api'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

export default function WhatIfTab({ apiAvailable, setApiAvailable }: Props) {
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('England')
  const [baseA, setBaseA] = useState(58)
  const [baseB, setBaseB] = useState(42)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true); setNarrative('')
    const p = predictLocal(a, b, false, false)
    if (apiAvailable) {
      const r = await apiPost<{ narrative: string }>('/explain/momentum', {
        team_a: a, team_b: b, prob_a: baseA / 100, prob_b: baseB / 100,
      })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(momentumFallback(a, b, p.team_a_win_prob, p.team_b_win_prob)) }
    } else setNarrative(momentumFallback(a, b, p.team_a_win_prob, p.team_b_win_prob))
    setLoading(false)
  }

  return (
    <div>
      <div className="glass-card">
        <p style={{ color: 'var(--text-dim)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Adjust probabilities to simulate match scenarios — early goal, red card, or home advantage swing.
        </p>
        <div className="grid-2">
          <div><label>Team A</label><select value={a} onChange={e => setA(e.target.value)}>{TEAMS.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label>Team B</label><select value={b} onChange={e => setB(e.target.value)}>{TEAMS.map(t => <option key={t}>{t}</option>)}</select></div>
        </div>
        <div className="grid-2" style={{ marginTop: '1rem' }}>
          <div><label>{a} Win %: {baseA}%</label><input type="range" min={1} max={99} value={baseA} onChange={e => setBaseA(+e.target.value)} /></div>
          <div><label>{b} Win %: {baseB}%</label><input type="range" min={1} max={99} value={baseB} onChange={e => setBaseB(+e.target.value)} /></div>
        </div>
      </div>
      <button className="btn-primary" onClick={run} disabled={loading}>{loading ? <><span className="spinner" />Simulating...</> : '🔄 Run What-If'}</button>
      {narrative && <div className="granite-box" style={{ marginTop: '1rem' }}>{narrative}</div>}
    </div>
  )
}
