import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cachedTeams, teamFlag, apiPost, fetchMomentum, fmtPct, generateMomentum, type Prediction, type MomentumPoint } from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props { apiAvailable: boolean; lang?: string }

function TeamSelect({ value, onChange, exclude, teams }: { value: string; onChange: (v: string) => void; exclude: string; teams: string[] }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const filtered = teams.filter(t => t !== exclude && t.toLowerCase().includes(q.toLowerCase())).slice(0, 30)
  return (
    <div style={{ position: 'relative' }}>
      <input className="team-select-input" placeholder="Search 224 teams..."
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

export default function WhatIfTab({ apiAvailable, lang }: Props) {
  const [teams, setTeams] = useState<string[]>(['Brazil', 'Argentina', 'England', 'France', 'Germany'])
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('England')
  const [formA, setFormA] = useState(0.5)
  const [formB, setFormB] = useState(0.5)
  const [neutral, setNeutral] = useState(false)
  const [major, setMajor] = useState(true)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMomentum, setShowMomentum] = useState(false)
  const [basePred, setBasePred] = useState<Prediction | null>(null)
  const [momentum, setMomentum] = useState<MomentumPoint[]>([])

  useEffect(() => {
    const all = cachedTeams().map(x => x.name)
    setTeams(all)
    if (all.length > 0 && !all.includes(a)) setA(all[0])
    if (all.length > 0 && !all.includes(b)) setB(all[Math.min(1, all.length - 1)])
  }, [])

  useEffect(() => {
    if (!a || !b || a === b) return
    if (apiAvailable) {
      apiPost<Prediction>('/predict', { team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major })
        .then(({ data }) => { if (data) { setBasePred(data); setFormA(data.stats_a.form); setFormB(data.stats_b.form) } })
    } else {
      setBasePred(null)
    }
  }, [a, b])

  const teamFormA = basePred?.stats_a?.form ?? 0.5
  const teamFormB = basePred?.stats_b?.form ?? 0.5

  const offlineFallback = !apiAvailable && !basePred
  const p = (() => {
    if (!basePred) return null
    const adjA = basePred.team_a_win_prob * (formA / teamFormA)
    const adjB = basePred.team_b_win_prob * (formB / teamFormB)
    const adjD = basePred.draw_prob
    const total = adjA + adjB + adjD
    return { team_a_win_prob: adjA / total, draw_prob: adjD / total, team_b_win_prob: adjB / total }
  })()

  const run = async () => {
    if (!a || !b || a === b || !p) return
    setLoading(true)
    setNarrative('')
    setError('')
    if (apiAvailable) {
      const [narrRes, momRes] = await Promise.allSettled([
        apiPost<{ analysis: string }>('/explain/momentum', {
          team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major, lang,
        }),
        fetchMomentum(a, b, neutral, major),
      ])
      if (narrRes.status === 'fulfilled' && narrRes.value.data?.analysis) setNarrative(narrRes.value.data.analysis)
      if (narrRes.status === 'fulfilled' && narrRes.value.error) setError(narrRes.value.error)
      if (momRes.status === 'fulfilled' && momRes.value?.momentum) setMomentum(momRes.value.momentum)
    }
    setLoading(false)
  }

  const isClientMomentum = momentum.length === 0 && p !== null
  const momentumData = showMomentum && p
    ? (momentum.length > 0 ? momentum : generateMomentum(p.team_a_win_prob, p.draw_prob, p.team_b_win_prob))
    : []

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> What-If Scenario Simulator
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Adjust team form, venue, and tournament type. The base prediction comes from our real XGBoost model — the form sliders let you explore "what if" scenarios.
        </p>
        <div className="grid-2" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
          <TeamSelect value={a} onChange={setA} exclude={b} teams={teams} />
          <TeamSelect value={b} onChange={setB} exclude={a} teams={teams} />
        </div>

        <div style={{ margin: '0.8rem 0' }}>
          <div className="progress-label">
            <span style={{ color: '#22c55e' }}>{teamFlag(a)} {a} — Simulated Form</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{(formA * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.1} max={0.9} step={0.05} value={formA}
            onChange={e => setFormA(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ margin: '0.8rem 0' }}>
          <div className="progress-label">
            <span style={{ color: '#ef4444' }}>{teamFlag(b)} {b} — Simulated Form</span>
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

        {offlineFallback ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span className="offline-badge">API Offline</span> — Start the backend to enable the What-If simulator.
          </div>
        ) : p ? (
          <div className="scoreboard" style={{ marginTop: '1rem' }}>
            <div className="scoreboard-team">
              <span className="flag">{teamFlag(a)}</span>
              <div className="name" style={{ fontSize: '0.8rem' }}>{a}</div>
              <motion.div className="prob" style={{ color: '#22c55e' }}
                key={`wa-${formA.toFixed(2)}`}
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                {(p.team_a_win_prob * 100).toFixed(1)}%
              </motion.div>
            </div>
            <div className="scoreboard-divider" />
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Draw</div>
              <motion.div style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 700 }}
                key={`wd-${formA.toFixed(2)}`}
                initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                {(p.draw_prob * 100).toFixed(1)}%
              </motion.div>
            </div>
            <div className="scoreboard-divider" />
            <div className="scoreboard-team">
              <span className="flag">{teamFlag(b)}</span>
              <div className="name" style={{ fontSize: '0.8rem' }}>{b}</div>
              <motion.div className="prob" style={{ color: '#ef4444' }}
                key={`wb-${formB.toFixed(2)}`}
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                {(p.team_b_win_prob * 100).toFixed(1)}%
              </motion.div>
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn-primary" onClick={run} disabled={loading} style={{ flex: 1 }}>
          {loading ? <><span className="spinner" /> Simulating...</> : '🔄 Analyze What-If'}
        </button>
        <button className="btn-secondary" onClick={() => setShowMomentum(!showMomentum)}>
          {showMomentum ? 'Hide Timeline' : '📈 Timeline'}
        </button>
      </div>

      {showMomentum && momentumData.length > 0 && (
        <motion.div className="glass-card" style={{ marginTop: '0.8rem', padding: '1rem' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-heading" style={{ fontSize: '0.95rem' }}>
            <span className="accent">●</span> Match Momentum Timeline
            {isClientMomentum && <span className="offline-badge" style={{ marginLeft: '0.5rem' }}>Simulated (client-side)</span>}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={momentumData}>
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
            {momentumData.filter(p => p.event).map((p, i) => (
              <span key={i} className="momentum-event">{p.event} ({p.minute}')</span>
            ))}
          </div>
        </motion.div>
      )}

      {error && <div className="error">{error}</div>}

      {narrative && (
        <motion.div className="granite-box" style={{ marginTop: '0.8rem' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {narrative}
        </motion.div>
      )}
    </motion.div>
  )
}
