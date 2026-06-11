import { useState } from 'react'
import { TEAMS, TEAM_STATS, teamFlag, momentumFallback, apiPost, predictLocalWithForm, fmtPct, generateMomentum } from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

function TeamSelect({ value, onChange, exclude }: { value: string; onChange: (v: string) => void; exclude: string }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const filtered = TEAMS.filter(t => t !== exclude && t.toLowerCase().includes(q.toLowerCase())).slice(0, 30)
  return (
    <div style={{ position: 'relative' }}>
      <input className="team-select-input" placeholder="Select team..."
        value={open ? q : `${teamFlag(value)} ${value}`}
        onFocus={() => { setOpen(true); setQ('') }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onChange={e => setQ(e.target.value)}
      />
      {open && (
        <div className="team-select-dropdown">
          {filtered.map(t => (
            <div key={t} className="team-select-option" onMouseDown={() => { onChange(t); setOpen(false) }}>
              <span className="team-select-flag">{teamFlag(t)}</span> {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function WhatIfTab({ apiAvailable, setApiAvailable }: Props) {
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('England')
  const [formA, setFormA] = useState(TEAM_STATS[a]?.form ?? 0.5)
  const [formB, setFormB] = useState(TEAM_STATS[b]?.form ?? 0.5)
  const [neutral, setNeutral] = useState(false)
  const [major, setMajor] = useState(true)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMomentum, setShowMomentum] = useState(false)

  const p = predictLocalWithForm(a, b, neutral, major, formA, formB)

  const run = async () => {
    setLoading(true)
    setNarrative('')
    if (apiAvailable) {
      const r = await apiPost<{ narrative: string }>('/explain/momentum', {
        team_a: a, team_b: b, prob_a: p.team_a_win_prob, prob_b: p.team_b_win_prob,
      })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(momentumFallback(a, b, p.team_a_win_prob, p.team_b_win_prob)) }
    } else {
      setNarrative(momentumFallback(a, b, p.team_a_win_prob, p.team_b_win_prob))
    }
    setLoading(false)
  }

  const momentum = showMomentum ? generateMomentum(p.team_a_win_prob, p.draw_prob, p.team_b_win_prob) : []

  return (
    <div>
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Match Scenario
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Adjust team form, venue, and tournament type. Watch the prediction shift in real time.
        </p>
        <div className="grid-2" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
          <TeamSelect value={a} onChange={v => { setA(v); setFormA(TEAM_STATS[v]?.form ?? 0.5) }} exclude={b} />
          <TeamSelect value={b} onChange={v => { setB(v); setFormB(TEAM_STATS[v]?.form ?? 0.5) }} exclude={a} />
        </div>

        <div style={{ margin: '0.8rem 0' }}>
          <div className="progress-label">
            <span style={{ color: '#22c55e' }}>{teamFlag(a)} {a} — Recent Form</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{(formA * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.1} max={0.9} step={0.05} value={formA}
            onChange={e => setFormA(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ margin: '0.8rem 0' }}>
          <div className="progress-label">
            <span style={{ color: '#ef4444' }}>{teamFlag(b)} {b} — Recent Form</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{(formB * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.1} max={0.9} step={0.05} value={formB}
            onChange={e => setFormB(+e.target.value)} style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <div className="checkbox-group">
            <input type="checkbox" id="wn" checked={neutral} onChange={e => setNeutral(e.target.checked)} />
            <label htmlFor="wn">Neutral Venue</label>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="wm" checked={major} onChange={e => setMajor(e.target.checked)} />
            <label htmlFor="wm">Major Tournament</label>
          </div>
        </div>

        <div className="scoreboard" style={{ marginTop: '1rem' }}>
          <div className="scoreboard-team">
            <span className="flag">{teamFlag(a)}</span>
            <div className="name" style={{ fontSize: '0.8rem' }}>{a}</div>
            <div className="prob" style={{ color: '#22c55e' }}>{(p.team_a_win_prob * 100).toFixed(1)}%</div>
          </div>
          <div className="scoreboard-divider" />
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Draw</div>
            <div style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 700 }}>{(p.draw_prob * 100).toFixed(1)}%</div>
          </div>
          <div className="scoreboard-divider" />
          <div className="scoreboard-team">
            <span className="flag">{teamFlag(b)}</span>
            <div className="name" style={{ fontSize: '0.8rem' }}>{b}</div>
            <div className="prob" style={{ color: '#ef4444' }}>{(p.team_b_win_prob * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn-primary" onClick={run} disabled={loading} style={{ flex: 1 }}>
          {loading ? <><span className="spinner" /> Simulating...</> : '🔄 Analyze What-If'}
        </button>
        <button className="btn-secondary" onClick={() => setShowMomentum(!showMomentum)}>
          {showMomentum ? 'Hide Timeline' : 'Show Timeline'}
        </button>
      </div>

      {showMomentum && (
        <div className="glass-card" style={{ marginTop: '0.8rem' }}>
          <div className="section-heading">
            <span className="accent">●</span> Match Momentum Timeline
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={momentum}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="minute" tick={{ fill: '#5a6a80', fontSize: 10 }} label={{ value: 'Minute', fill: '#5a6a80', fontSize: 10 }} />
              <YAxis domain={[0, 1]} tick={{ fill: '#5a6a80', fontSize: 10 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: '#0a0e27', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '0.75rem' }}
                formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
              <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
              <Line type="monotone" dataKey="a_prob" stroke="#22c55e" strokeWidth={2} dot={false} name={a} />
              <Line type="monotone" dataKey="b_prob" stroke="#ef4444" strokeWidth={2} dot={false} name={b} />
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
