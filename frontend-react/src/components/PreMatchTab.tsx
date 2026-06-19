import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cachedTeams, teamFlag, apiPost, fetchMomentum, fmtPct, type Prediction, type MomentumPoint } from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const QUICK_MATCHUPS: [string, string][] = [
  ['Brazil', 'Argentina'], ['Germany', 'France'], ['England', 'Germany'],
  ['Argentina', 'France'], ['Portugal', 'Spain'], ['Netherlands', 'Belgium'],
  ['Italy', 'Spain'], ['Uruguay', 'Brazil'],
  ['England', 'France'], ['Croatia', 'Brazil'],
]

interface Props { apiAvailable: boolean; wcMode: boolean; lang?: string }

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

const containerVar = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVar = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

export default function PreMatchTab({ apiAvailable, wcMode, lang }: Props) {
  const [teams, setTeams] = useState<string[]>(['Brazil', 'Argentina', 'England', 'France', 'Germany'])
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('England')
  const [neutral, setNeutral] = useState(false)
  const [major, setMajor] = useState(true)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [pred, setPred] = useState<Prediction | null>(null)
  const [momentum, setMomentum] = useState<MomentumPoint[]>([])
  const [showMomentum, setShowMomentum] = useState(false)

  useEffect(() => {
    cachedTeams()
    const t = setTimeout(() => {
      const all = cachedTeams().map(x => x.name)
      setTeams(all)
      if (all.length > 0 && !all.includes(a)) setA(all[0])
      if (all.length > 0 && !all.includes(b)) setB(all[Math.min(1, all.length - 1)])
    }, 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!a || !b || a === b) return
    setPred(null); setNarrative(''); setMomentum([])
    if (apiAvailable) {
      apiPost<Prediction>('/predict', { team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major })
        .then(r => { if (r) setPred(r) })
    }
  }, [a, b])

  const quickMatchups = wcMode
    ? QUICK_MATCHUPS.filter(([x, y]) => teams.includes(x) && teams.includes(y))
    : QUICK_MATCHUPS

  const run = async () => {
    if (!a || !b || a === b) return
    setLoading(true)
    setNarrative('')
    setMomentum([])

    if (apiAvailable) {
      const [predRes, narrRes, momRes] = await Promise.allSettled([
        apiPost<Prediction>('/predict', { team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major }),
        apiPost<{ narrative: string }>('/explain/preview', { team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major, lang }),
        fetchMomentum(a, b, neutral, major),
      ])
      if (predRes.status === 'fulfilled' && predRes.value) setPred(predRes.value)
      if (narrRes.status === 'fulfilled' && narrRes.value?.narrative) setNarrative(narrRes.value.narrative)
      if (momRes.status === 'fulfilled' && momRes.value?.momentum) setMomentum(momRes.value.momentum)
    }
    setLoading(false)
  }

  const offlineMode = !apiAvailable
  const p = pred
  const homeProb = p?.team_a_win_prob ?? 0.4
  const drawProb = p?.draw_prob ?? 0.25
  const awayProb = p?.team_b_win_prob ?? 0.35

  return (
    <motion.div variants={containerVar} initial="hidden" animate="show">
      <div className="glass-card gold-border">
        <motion.div variants={itemVar} className="section-heading">
          <span className="accent">●</span> Match Selection
        </motion.div>
        <div className="grid-2" style={{ gap: '0.5rem', marginBottom: '0.8rem' }}>
          <TeamSelect value={a} onChange={setA} exclude={b} teams={teams} />
          <TeamSelect value={b} onChange={setB} exclude={a} teams={teams} />
        </div>
        <motion.div variants={itemVar} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem' }}>
          {quickMatchups.map(([ta, tb]) => (
            <motion.div key={`${ta}-${tb}`} className="matchup-card" onClick={() => { setA(ta); setB(tb) }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <span>{teamFlag(ta)} {ta}</span>
              <span className="matchup-vs">vs</span>
              <span>{teamFlag(tb)} {tb}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={itemVar} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="checkbox-group">
            <input type="checkbox" id="pn" checked={neutral} onChange={e => setNeutral(e.target.checked)} />
            <label htmlFor="pn">Neutral Venue</label>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="pm" checked={major} onChange={e => setMajor(e.target.checked)} />
            <label htmlFor="pm">Major Tournament</label>
          </div>
        </motion.div>
      </div>

      {!p && apiAvailable === false && (
        <motion.div variants={itemVar} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span className="offline-badge">API Offline</span> — Prediction unavailable. Start the backend to see live analysis.
        </motion.div>
      )}
      {p && (
        <motion.div variants={itemVar} className="glass-card gold-border">
          <div className="section-heading"><span className="accent">●</span> Prediction</div>
          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="team-card team-a">
              <span className="team-flag">{teamFlag(p.team_a)}</span>
              <div className="team-name">{p.team_a}</div>
              <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value">{fmtPct(p.stats_a.winrate)}</span></div>
              <div className="team-stat"><span className="team-stat-label">Goals/Game</span><span className="team-stat-value">{p.stats_a.goal_avg.toFixed(2)}</span></div>
              <div className="team-stat"><span className="team-stat-label">Recent Form</span><span className="team-stat-value">{fmtPct(p.stats_a.form)}</span></div>
              <div className="team-stat"><span className="team-stat-label">Matches</span><span className="team-stat-value">{p.stats_a.matches.toLocaleString()}</span></div>
            </div>
            <div className="team-card team-b">
              <span className="team-flag">{teamFlag(p.team_b)}</span>
              <div className="team-name">{p.team_b}</div>
              <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value">{fmtPct(p.stats_b.winrate)}</span></div>
              <div className="team-stat"><span className="team-stat-label">Goals/Game</span><span className="team-stat-value">{p.stats_b.goal_avg.toFixed(2)}</span></div>
              <div className="team-stat"><span className="team-stat-label">Recent Form</span><span className="team-stat-value">{fmtPct(p.stats_b.form)}</span></div>
              <div className="team-stat"><span className="team-stat-label">Matches</span><span className="team-stat-value">{p.stats_b.matches.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="scoreboard">
            <div className="scoreboard-team">
              <span className="flag">{teamFlag(p.team_a)}</span>
              <div className="name" style={{ fontSize: '0.8rem' }}>{p.team_a}</div>
              <motion.div className="prob" style={{ color: '#22c55e' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
                {(homeProb * 100).toFixed(1)}%
              </motion.div>
            </div>
            <div className="scoreboard-divider" />
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Draw</div>
              <div style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 700 }}>{(drawProb * 100).toFixed(1)}%</div>
              <div style={{ marginTop: '0.3rem' }}>
                <div className="progress-bar" style={{ width: '80px', margin: '0 auto' }}>
                  <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${drawProb * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
            </div>
            <div className="scoreboard-divider" />
            <div className="scoreboard-team">
              <span className="flag">{teamFlag(p.team_b)}</span>
              <div className="name" style={{ fontSize: '0.8rem' }}>{p.team_b}</div>
              <motion.div className="prob" style={{ color: '#ef4444' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
                {(awayProb * 100).toFixed(1)}%
              </motion.div>
            </div>
          </div>

          <div className="insight-cards">
            <div className="insight-card">
              <div className="insight-label">Home Win</div>
              <div className="progress-bar"><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${homeProb * 100}%` }} transition={{ duration: 0.8 }} style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a)' }} /></div>
            </div>
            <div className="insight-card">
              <div className="insight-label">Away Win</div>
              <div className="progress-bar"><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${awayProb * 100}%` }} transition={{ duration: 0.8 }} style={{ background: 'linear-gradient(90deg, #ef4444, #dc2626)' }} /></div>
            </div>
            <div className="insight-card insight-card-edge">
              <div className="insight-label">Predicted Outcome</div>
              <div className="insight-value">
                {homeProb > awayProb && homeProb > drawProb ? `🏠 ${p.team_a} wins` :
                 awayProb > homeProb && awayProb > drawProb ? `✈️ ${p.team_b} wins` : '🤝 Draw'}
                {' · '}
                {homeProb > 0.6 ? 'High confidence' : homeProb > 0.45 ? 'Moderate' : 'Toss-up'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
            <button className="btn-primary" onClick={run} disabled={loading} style={{ flex: 1 }}>
              {loading ? <><span className="spinner" /> Analyzing...</> : '🤖 Analyze with Granite'}
            </button>
            <button className="btn-secondary" onClick={() => { if (momentum.length === 0) fetchMomentum(a, b, neutral, major).then(r => { if (r?.momentum) setMomentum(r.momentum); setShowMomentum(!showMomentum) }); else setShowMomentum(!showMomentum) }}>
              {showMomentum ? 'Hide Timeline' : '📈 Match Timeline'}
            </button>
          </div>

          {showMomentum && momentum.length > 0 && (
            <motion.div className="glass-card" style={{ marginTop: '0.8rem', padding: '1rem' }}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <div className="section-heading" style={{ fontSize: '0.95rem' }}>
                <span className="accent">●</span> Simulated Match Momentum
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                Momentum simulation based on team strength differences — shows how key events shift win probability over 90 minutes.
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={momentum}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="minute" tick={{ fill: '#5a6a80', fontSize: 9 }} />
                  <YAxis domain={[0, 1]} tick={{ fill: '#5a6a80', fontSize: 9 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip contentStyle={{ background: '#0a0e27', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '0.7rem' }}
                    formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                  <Legend wrapperStyle={{ fontSize: '0.65rem' }} />
                  <Line type="monotone" dataKey="a_prob" stroke="#22c55e" strokeWidth={2} dot={false} name={p?.team_a || 'Home'} />
                  <Line type="monotone" dataKey="b_prob" stroke="#ef4444" strokeWidth={2} dot={false} name={p?.team_b || 'Away'} />
                  <Line type="monotone" dataKey="d_prob" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Draw" />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
                {momentum.filter(p => p.event).map((p, i) => (
                  <span key={i} className="momentum-event">{p.event} ({p.minute}')</span>
                ))}
              </div>
            </motion.div>
          )}

          {narrative && (
            <motion.div className="granite-box" style={{ marginTop: '1rem' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {narrative}
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
