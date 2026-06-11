import { useState } from 'react'
import { TEAMS, teamFlag, momentumFallback, apiPost } from '../api'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

export default function WhatIfTab({ apiAvailable, setApiAvailable }: Props) {
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('England')
  const [probA, setProbA] = useState(58)
  const [probB, setProbB] = useState(42)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setNarrative('')
    if (apiAvailable) {
      const r = await apiPost<{ narrative: string }>('/explain/momentum', {
        team_a: a, team_b: b, prob_a: probA / 100, prob_b: probB / 100,
      })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(momentumFallback(a, b, probA / 100, probB / 100)) }
    } else {
      setNarrative(momentumFallback(a, b, probA / 100, probB / 100))
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Match Scenario
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Adjust the probabilities to simulate match events — an early goal, a red card, or a momentum swing.
        </p>
        <div className="grid-2">
          <div className="team-card team-a" style={{ padding: '1rem' }}>
            <span className="team-flag">{teamFlag(a)}</span>
            <div className="team-name" style={{ fontSize: '1rem' }}>{a}</div>
          </div>
          <div className="team-card team-b" style={{ padding: '1rem' }}>
            <span className="team-flag">{teamFlag(b)}</span>
            <div className="team-name" style={{ fontSize: '1rem' }}>{b}</div>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: '0.5rem' }}>
          <div>
            <label>{a} Win Probability</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <input type="range" min={1} max={99} value={probA} onChange={e => { const v = +e.target.value; setProbA(v); setProbB(100 - v) }} />
              <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.1rem', minWidth: '3rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{probA}%</span>
            </div>
          </div>
          <div>
            <label>{b} Win Probability</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <input type="range" min={1} max={99} value={probB} onChange={e => { const v = +e.target.value; setProbB(v); setProbA(100 - v) }} />
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem', minWidth: '3rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{probB}%</span>
            </div>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={run} disabled={loading}>
        {loading ? <><span className="spinner" /> Simulating...</> : '🔄 Run What-If Analysis'}
      </button>

      {narrative && <div className="granite-box" style={{ marginTop: '1rem' }}>{narrative}</div>}
    </div>
  )
}
