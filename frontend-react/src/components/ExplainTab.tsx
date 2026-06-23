import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cachedTeams, teamFlag, apiPost, fetchMomentum, fmtPct, generateMomentum, type FeatureImportance, type MomentumPoint } from '../api'
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

export default function ExplainTab({ apiAvailable, lang }: Props) {
  const [teams, setTeams] = useState<string[]>(['Brazil', 'Argentina', 'England', 'France', 'Germany'])
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('Argentina')
  const [neutral, setNeutral] = useState(true)
  const [major, setMajor] = useState(true)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [features, setFeatures] = useState<FeatureImportance[] | null>(null)
  const [prediction, setPrediction] = useState<{ a: number; d: number; b: number } | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [momentum, setMomentum] = useState<MomentumPoint[]>([])

  useEffect(() => {
    const all = cachedTeams().map(x => x.name)
    setTeams(all)
    if (all.length > 0 && !all.includes(a)) setA(all[0])
    if (all.length > 0 && !all.includes(b)) setB(all[1] !== all[0] ? all[1] : all[Math.min(2, all.length - 1)])
  }, [])

  const fetchFeatures = (ta: string, tb: string) => {
    if (!apiAvailable || !ta || !tb || ta === tb) return
    apiPost<{ prediction: { team_a_win_prob: number; draw_prob: number; team_b_win_prob: number }; feature_importances: FeatureImportance[] }>(
      '/explain/decision', { team_a: ta, team_b: tb, is_neutral: neutral, is_major_tournament: major, lang }
    ).then(({ data, error }) => {
      if (error) { setError(error); return }
      if (data) {
        setFeatures(data.feature_importances)
        setPrediction({ a: data.prediction.team_a_win_prob, d: data.prediction.draw_prob, b: data.prediction.team_b_win_prob })
      }
    })
  }

  useEffect(() => { fetchFeatures(a, b) }, [a, b])

  const run = async () => {
    if (!a || !b || a === b) return
    setLoading(true)
    setNarrative('')
    setMomentum([])
    setError('')
    if (apiAvailable) {
      const [r, mom] = await Promise.allSettled([
        apiPost<{ explanation: string; feature_importances: FeatureImportance[]; prediction: { team_a_win_prob: number; draw_prob: number; team_b_win_prob: number } }>(
          '/explain/decision', { team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major, lang }
        ),
        fetchMomentum(a, b, neutral, major),
      ])
      if (r.status === 'fulfilled' && r.value.data) {
        if (r.value.data.explanation) setNarrative(r.value.data.explanation)
        if (r.value.data.feature_importances) setFeatures(r.value.data.feature_importances)
        if (r.value.data.prediction) setPrediction({ a: r.value.data.prediction.team_a_win_prob, d: r.value.data.prediction.draw_prob, b: r.value.data.prediction.team_b_win_prob })
      }
      if (r.status === 'fulfilled' && r.value.error) setError(r.value.error)
      if (mom.status === 'fulfilled' && mom.value?.momentum) setMomentum(mom.value.momentum)
    }
    setLoading(false)
  }

  const offlineMode = !apiAvailable && !prediction
  const isClientMomentum = momentum.length === 0 && prediction !== null
  const momentumData = showTimeline && prediction
    ? (momentum.length > 0 ? momentum : generateMomentum(prediction.a, prediction.d, prediction.b))
    : []

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Model Decision Trace
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Every prediction is built from 12 factors. The XGBoost ensemble model evaluates these simultaneously, weighted by historical importance. Select teams then click "Explain with Granite".
        </p>

        <div className="grid-2" style={{ gap: '0.5rem', marginBottom: '0.8rem' }}>
          <TeamSelect value={a} onChange={setA} exclude={b} teams={teams} />
          <TeamSelect value={b} onChange={setB} exclude={a} teams={teams} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
          <div className="checkbox-group">
            <input type="checkbox" id="en" checked={neutral} onChange={e => setNeutral(e.target.checked)} />
            <label htmlFor="en">Neutral Venue</label>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="em" checked={major} onChange={e => setMajor(e.target.checked)} />
            <label htmlFor="em">Major Tournament</label>
          </div>
        </div>

        {features ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {features.map((f, i) => {
              const maxImp = features[0].importance
              const pct = maxImp > 0 ? (f.importance / maxImp) * 100 : 0
              return (
                <motion.div key={f.name}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
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
                    <motion.div className="progress-fill"
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
            {apiAvailable ? 'Loading feature importances...' : 'API offline — click "Explain with Granite" to load live feature importances.'}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn-primary" onClick={run} disabled={loading} style={{ flex: 1 }}>
          {loading ? <><span className="spinner" /> Analyzing...</> : '🤖 Explain with Granite'}
        </button>
        <button className="btn-secondary" onClick={() => setShowTimeline(!showTimeline)}>
          {showTimeline ? 'Hide Timeline' : '📈 Simulate Match'}
        </button>
      </div>

      {showTimeline && momentumData.length > 0 && (
        <motion.div className="glass-card" style={{ marginTop: '0.8rem', padding: '1rem' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-heading" style={{ fontSize: '0.95rem' }}>
            <span className="accent">●</span> Probability Timeline
            {isClientMomentum && <span className="offline-badge" style={{ marginLeft: '0.5rem' }}>Simulated (client-side)</span>}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={momentumData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="minute" tick={{ fill: '#5a6a80', fontSize: 10 }} />
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
        <motion.div className="granite-box" style={{ marginTop: '1rem' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {narrative}
        </motion.div>
      )}
    </motion.div>
  )
}
