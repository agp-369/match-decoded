import { useState } from 'react'
import { TEAMS, TEAM_STATS, fmtPct, teamFlag, legendsFallback, apiPost } from '../api'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts'

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

export default function LegendsTab({ apiAvailable, setApiAvailable }: Props) {
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('Germany')
  const [loading, setLoading] = useState(false)
  const [narrative, setNarrative] = useState('')

  const sa = TEAM_STATS[a]
  const sb = TEAM_STATS[b]

  const radarData = [
    { stat: 'Win Rate', [a]: +(sa.winrate * 100).toFixed(1), [b]: +(sb.winrate * 100).toFixed(1) },
    { stat: 'Goals/Game', [a]: +(sa.goal_avg * 50).toFixed(1), [b]: +(sb.goal_avg * 50).toFixed(1) },
    { stat: 'Recent Form', [a]: +(sa.form * 100).toFixed(1), [b]: +(sb.form * 100).toFixed(1) },
    { stat: 'Experience', [a]: +Math.min(sa.matches / 20, 100).toFixed(1), [b]: +Math.min(sb.matches / 20, 100).toFixed(1) },
    { stat: 'Attacking', [a]: +(sa.goal_avg * 20 + sa.winrate * 40).toFixed(1), [b]: +(sb.goal_avg * 20 + sb.winrate * 40).toFixed(1) },
  ]

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
      <div className="glass-card gold-border">
        <div className="section-heading">
          <span className="accent">●</span> Compare Two Teams
        </div>
        <div className="grid-2" style={{ gap: '0.5rem' }}>
          <TeamSelect value={a} onChange={setA} exclude={b} />
          <TeamSelect value={b} onChange={setB} exclude={a} />
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '0.8rem' }}>
        <div className="section-heading">
          <span className="accent">●</span> Team Comparison
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(245,158,11,0.15)" />
            <PolarAngleAxis dataKey="stat" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#5a6a80', fontSize: 10 }} />
            <Radar name={a} dataKey={a} stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
            <Radar name={b} dataKey={b} stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2">
        <div className="team-card team-a">
          <span className="team-flag">{teamFlag(a)}</span>
          <div className="team-name" style={{ fontSize: '1.4rem' }}>{a}</div>
          <div style={{ marginTop: '0.8rem' }}>
            <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value" style={{ fontSize: '1.3rem', color: 'var(--gold-light)' }}>{fmtPct(sa.winrate)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Goals Per Game</span><span className="team-stat-value">{sa.goal_avg.toFixed(2)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Total Matches</span><span className="team-stat-value">{sa.matches.toLocaleString()}</span></div>
            <div className="team-stat"><span className="team-stat-label">Recent Form</span><span className="team-stat-value">{fmtPct(sa.form)}</span></div>
          </div>
        </div>
        <div className="team-card team-b">
          <span className="team-flag">{teamFlag(b)}</span>
          <div className="team-name" style={{ fontSize: '1.4rem' }}>{b}</div>
          <div style={{ marginTop: '0.8rem' }}>
            <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value" style={{ fontSize: '1.3rem', color: 'var(--gold-light)' }}>{fmtPct(sb.winrate)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Goals Per Game</span><span className="team-stat-value">{sb.goal_avg.toFixed(2)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Total Matches</span><span className="team-stat-value">{sb.matches.toLocaleString()}</span></div>
            <div className="team-stat"><span className="team-stat-label">Recent Form</span><span className="team-stat-value">{fmtPct(sb.form)}</span></div>
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
