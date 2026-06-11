import { useState } from 'react'
import { TEAMS, predictLocal, fmtPct, teamFlag, apiPost, getH2H, distance, type Prediction, type TeamStats } from '../api'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

const FAMOUS_MATCHUPS = [
  ['Brazil', 'Argentina'], ['Germany', 'France'], ['England', 'Germany'],
  ['Netherlands', 'Argentina'], ['Portugal', 'Spain'], ['Italy', 'Brazil'],
]

function TeamSelect({ value, onChange, exclude, side }: { value: string; onChange: (v: string) => void; exclude: string; side: 'a' | 'b' }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const filtered = TEAMS.filter(t => t !== exclude && t.toLowerCase().includes(q.toLowerCase())).slice(0, 30)
  return (
    <div style={{ position: 'relative' }}>
      <input className="team-select-input"
        placeholder={side === 'a' ? 'Home team...' : 'Away team...'}
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
          {filtered.length === 0 && <div className="team-select-option" style={{ opacity: 0.5 }}>No teams found</div>}
        </div>
      )}
    </div>
  )
}

export default function PreMatchTab({ apiAvailable, setApiAvailable }: Props) {
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('Argentina')
  const [neutral, setNeutral] = useState(false)
  const [major, setMajor] = useState(false)
  const [pred, setPred] = useState<Prediction | null>(null)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async (ta = a, tb = b, n = neutral, m = major) => {
    setLoading(true)
    setNarrative('')
    setPred(null)

    if (apiAvailable) {
      const [predRes, narrRes] = await Promise.allSettled([
        apiPost<Prediction>('/predict', { team_a: ta, team_b: tb, is_neutral: n, is_major_tournament: m }),
        apiPost<{ narrative: string }>('/explain/preview', { team_a: ta, team_b: tb, is_neutral: n, is_major_tournament: m }),
      ])
      if (predRes.status === 'fulfilled' && predRes.value) {
        setPred(predRes.value)
      } else {
        setPred(predictLocal(ta, tb, n, m))
        setApiAvailable(false)
      }
      if (narrRes.status === 'fulfilled' && narrRes.value?.narrative) {
        setNarrative(narrRes.value.narrative)
      }
    } else {
      setPred(predictLocal(ta, tb, n, m))
    }
    setLoading(false)
  }

  const quickPick = (ta: string, tb: string) => {
    setA(ta); setB(tb); setNeutral(true); setMajor(true)
    run(ta, tb, true, true)
  }

  const p = pred || predictLocal(a, b, neutral, major)
  const flagA = teamFlag(a)
  const flagB = teamFlag(b)
  const aw = p.team_a_win_prob * 100
  const bw = p.team_b_win_prob * 100
  const dw = p.draw_prob * 100
  const aIsFav = aw > bw
  const h2h = getH2H(a, b)
  const dist = distance(a, b)

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '0.8rem' }}>
        <div className="section-heading" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="accent">●</span> Quick Pick
        </div>
        <div className="matchup-grid">
          {FAMOUS_MATCHUPS.map(([ta, tb]) => (
            <div key={`${ta}-${tb}`} className="matchup-card" onClick={() => quickPick(ta, tb)}>
              <span>{teamFlag(ta)} {ta}</span>
              <span className="matchup-vs">vs</span>
              <span>{teamFlag(tb)} {tb}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '0.8rem' }}>
        <TeamSelect value={a} onChange={v => { setA(v); setPred(null); setNarrative('') }} exclude={b} side="a" />
        <TeamSelect value={b} onChange={v => { setB(v); setPred(null); setNarrative('') }} exclude={a} side="b" />
      </div>

      <div className="grid-2">
        <div className="team-card team-a">
          <span className="team-flag">{flagA}</span>
          <div className="team-name">{a}</div>
          <div style={{ marginTop: '0.5rem' }}>
            <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value">{fmtPct(p.stats_a.winrate)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Goals/Game</span><span className="team-stat-value">{p.stats_a.goal_avg.toFixed(2)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Matches</span><span className="team-stat-value">{p.stats_a.matches}</span></div>
          </div>
        </div>
        <div className="team-card team-b">
          <span className="team-flag">{flagB}</span>
          <div className="team-name">{b}</div>
          <div style={{ marginTop: '0.5rem' }}>
            <div className="team-stat"><span className="team-stat-label">Win Rate</span><span className="team-stat-value">{fmtPct(p.stats_b.winrate)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Goals/Game</span><span className="team-stat-value">{p.stats_b.goal_avg.toFixed(2)}</span></div>
            <div className="team-stat"><span className="team-stat-label">Matches</span><span className="team-stat-value">{p.stats_b.matches}</span></div>
          </div>
        </div>
      </div>

      {h2h && (
        <div className="glass-card" style={{ margin: '0.8rem 0', padding: '0.8rem 1rem' }}>
          <div className="section-heading" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <span className="accent">●</span> Head-to-Head Record
          </div>
          <div className="h2h-row">
            <div className="h2h-stat"><span className="h2h-value" style={{ color: '#22c55e' }}>{h2h.a_wins}</span><span className="h2h-label">{a} wins</span></div>
            <div className="h2h-stat"><span className="h2h-value" style={{ color: '#94a3b8' }}>{h2h.draws}</span><span className="h2h-label">Draws</span></div>
            <div className="h2h-stat"><span className="h2h-value" style={{ color: '#ef4444' }}>{h2h.b_wins}</span><span className="h2h-label">{b} wins</span></div>
            <div className="h2h-stat"><span className="h2h-value" style={{ color: '#f59e0b' }}>{h2h.total}</span><span className="h2h-label">Total meetings</span></div>
          </div>
        </div>
      )}

      {dist && <div className="context-line">{flagA} {a} · {dist} · {flagB} {b}</div>}

      <div className="glass-card gold-border">
        <div className="checkbox-group">
          <input type="checkbox" id="neutral" checked={neutral} onChange={e => setNeutral(e.target.checked)} />
          <label htmlFor="neutral">Neutral Venue</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="major" checked={major} onChange={e => setMajor(e.target.checked)} />
          <label htmlFor="major">Major Tournament (World Cup / Euro / Copa)</label>
        </div>
      </div>

      <button className="btn-primary" onClick={() => run()} disabled={loading}>
        {loading ? <><span className="spinner" /> Analyzing...</> : '🎯 Analyze Match'}
      </button>

      {(pred || narrative) && (
        <div className="glass-card gold-border" style={{ marginTop: '1rem' }}>
          <div className="section-heading">
            <span className="accent">●</span> Match Prediction
          </div>

          <div className="scoreboard">
            <div className="scoreboard-team">
              <span className="flag">{flagA}</span>
              <div className="name">{a}</div>
              <div className={`prob ${aIsFav ? 'prob-fav' : ''}`} style={{ color: aIsFav ? '#22c55e' : '#94a3b8' }}>{aw.toFixed(1)}%</div>
            </div>
            <div className="scoreboard-divider" />
            <div className="scoreboard-vs">vs</div>
            <div className="scoreboard-vs" style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.3rem' }}>
              Draw {dw.toFixed(1)}%
            </div>
            <div className="scoreboard-divider" />
            <div className="scoreboard-team">
              <span className="flag">{flagB}</span>
              <div className="name">{b}</div>
              <div className={`prob ${!aIsFav ? 'prob-fav' : ''}`} style={{ color: !aIsFav ? '#22c55e' : '#94a3b8' }}>{bw.toFixed(1)}%</div>
            </div>
          </div>

          <div style={{ margin: '0.5rem 0' }}>
            <div className="progress-label"><span>{a}</span><span>{fmtPct(p.team_a_win_prob)}</span></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${aw}%` }} /></div>
          </div>
          <div style={{ margin: '0.5rem 0' }}>
            <div className="progress-label"><span>Draw</span><span>{fmtPct(p.draw_prob)}</span></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${dw}%`, background: 'linear-gradient(90deg, #64748b, #94a3b8)' }} /></div>
          </div>
          <div style={{ margin: '0.5rem 0' }}>
            <div className="progress-label"><span>{b}</span><span>{fmtPct(p.team_b_win_prob)}</span></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${bw}%`, background: 'linear-gradient(90deg, #ef4444, #dc2626)' }} /></div>
          </div>

          {narrative && <div className="granite-box">{narrative}</div>}
        </div>
      )}
    </div>
  )
}
