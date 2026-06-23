import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { cachedTeams, teamFlag, apiPost, type TeamDetail } from '../api'

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

export default function LegendsTab({ apiAvailable, lang }: Props) {
  const [teams, setTeams] = useState<string[]>(['Brazil', 'Argentina', 'England', 'France', 'Germany'])
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('Argentina')
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statA, setStatA] = useState<TeamDetail | null>(null)
  const [statB, setStatB] = useState<TeamDetail | null>(null)

  useEffect(() => {
    const all = cachedTeams().map(x => x.name)
    setTeams(all)
    if (all.length > 0 && !all.includes(a)) setA(all[0])
    if (all.length > 0 && !all.includes(b)) setB(all[1] !== all[0] ? all[1] : all[Math.min(2, all.length - 1)])
  }, [])

  useEffect(() => {
    const all = cachedTeams()
    setStatA(all.find(t => t.name === a) || null)
    setStatB(all.find(t => t.name === b) || null)
  }, [a, b])

  const radarData = (() => {
    if (!statA || !statB) return []
    const maxWr = Math.max(statA.winrate, statB.winrate, 0.5)
    const maxGa = Math.max(statA.goal_avg, statB.goal_avg, 1.5)
    return [
      { metric: 'Win Rate', [a]: +(statA.winrate / maxWr * 100).toFixed(0), [b]: +(statB.winrate / maxWr * 100).toFixed(0) },
      { metric: 'Goals/Game', [a]: +(statA.goal_avg / maxGa * 100).toFixed(0), [b]: +(statB.goal_avg / maxGa * 100).toFixed(0) },
      { metric: 'Recent Form', [a]: +(statA.form * 100).toFixed(0), [b]: +(statB.form * 100).toFixed(0) },
      { metric: 'Experience', [a]: Math.min(100, +(statA.matches / 10).toFixed(0)), [b]: Math.min(100, +(statB.matches / 10).toFixed(0)) },
      { metric: 'Attacking', [a]: +Math.min(100, (statA.goal_avg * 40 + (1 - statA.winrate) * 30 + statA.form * 30)).toFixed(0), [b]: +Math.min(100, (statB.goal_avg * 40 + (1 - statB.winrate) * 30 + statB.form * 30)).toFixed(0) },
    ]
  })()

  const run = async () => {
    if (!a || !b) return
    setLoading(true)
    setNarrative('')
    setError('')
    if (apiAvailable) {
      const { data, error } = await apiPost<{ narrative: string }>('/explain/legends', { team_a: a, team_b: b, era_a: 'Modern era', era_b: 'Modern era', lang })
      if (error) setError(error)
      if (data?.narrative) setNarrative(data.narrative)
    }
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Cross-Era Legends Matchup
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Compare two teams across five dimensions. Stats pulled from real match data (31,161 international matches, 1990-2026).
        </p>
        <div className="grid-2" style={{ gap: '0.5rem', marginBottom: '0.8rem' }}>
          <TeamSelect value={a} onChange={setA} exclude={b} teams={teams} />
          <TeamSelect value={b} onChange={setB} exclude={a} teams={teams} />
        </div>
      </div>

      {statA && statB && radarData.length > 0 && (
        <motion.div className="glass-card"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <div className="section-heading"><span className="accent">●</span> Dimensional Comparison</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(240,244,255,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#c8d6e5', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#5a6a80', fontSize: 9 }} />
              <Radar name={a} dataKey={a} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              <Radar name={b} dataKey={b} stroke="#64748b" fill="#64748b" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={{ background: '#0a0e27', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '0.75rem' }}
                formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid-2" style={{ gap: '0.8rem', marginTop: '0.5rem' }}>
            <div className="team-card team-a">
              <span className="team-flag">{teamFlag(a)}</span>
              <div className="team-name">{a}</div>
              <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value">{(statA.winrate * 100).toFixed(1)}%</span></div>
              <div className="team-stat"><span className="team-stat-label">Goals/Game</span><span className="team-stat-value">{statA.goal_avg.toFixed(2)}</span></div>
              <div className="team-stat"><span className="team-stat-label">Form</span><span className="team-stat-value">{(statA.form * 100).toFixed(0)}%</span></div>
              <div className="team-stat"><span className="team-stat-label">Matches</span><span className="team-stat-value">{statA.matches.toLocaleString()}</span></div>
            </div>
            <div className="team-card team-b">
              <span className="team-flag">{teamFlag(b)}</span>
              <div className="team-name">{b}</div>
              <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value">{(statB.winrate * 100).toFixed(1)}%</span></div>
              <div className="team-stat"><span className="team-stat-label">Goals/Game</span><span className="team-stat-value">{statB.goal_avg.toFixed(2)}</span></div>
              <div className="team-stat"><span className="team-stat-label">Form</span><span className="team-stat-value">{(statB.form * 100).toFixed(0)}%</span></div>
              <div className="team-stat"><span className="team-stat-label">Matches</span><span className="team-stat-value">{statB.matches.toLocaleString()}</span></div>
            </div>
          </div>
        </motion.div>
      )}

      <button className="btn-primary" onClick={run} disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? <><span className="spinner" /> Generating...</> : '🏟️ Compare with Granite'}
      </button>

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
