import { useState } from 'react'
import { TEAMS, TEAM_STATS, predictLocal, fmtPct, teamFlag, previewFallback, apiPost, getH2H, distance } from '../api'

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void }

const FAMOUS_MATCHUPS = [
  ['Brazil', 'Argentina'], ['Germany', 'France'], ['England', 'Germany'],
  ['Netherlands', 'Argentina'], ['Portugal', 'Spain'], ['Italy', 'Brazil'],
]

const INSIGHTS: Record<string, Record<string, string>> = {
  Brazil: { Argentina: 'Brazil dominates the H2H (43-38) but Argentina has won 2 of the last 3 competitive meetings. The gap is narrowing.' },
  Argentina: { Brazil: 'Argentina has won only 3 of the last 15 against Brazil in neutral venues. They rely on tournament pressure to close the gap.' },
  Germany: { France: 'Germany leads the H2H 15-14 but France has won 3 of the last 4. The balance of power has shifted across eras.' },
  France: { Germany: 'France has won 3 of the last 4 vs Germany after losing 4 of the previous 6. Momentum is with Les Bleus.' },
  England: { Germany: 'Penalties. England leads the H2H 13-12 but Germany has won both World Cup knockout meetings. The psychological edge is real.' },
  Netherlands: { Argentina: 'Netherlands-Argentina is a modern classic: 4 draws in the last 6. No team has won by more than 1 goal since 1978.' },
  Portugal: { Spain: 'Spain dominates H2H 17-6 but Portugal has lost only 1 of the last 5. The gap has closed dramatically.' },
  Italy: { Brazil: 'Brazil leads 11-6 in 24 meetings. Italy has not beaten Brazil in a competitive match since 1982.' },
}

const MARKET_ODDS: Record<string, Record<string, { model: number; market: number }>> = {
  Brazil: { Argentina: { model: 58, market: 55 }, Germany: { model: 52, market: 54 }, France: { model: 55, market: 52 }, England: { model: 60, market: 58 }, Italy: { model: 56, market: 53 } },
  Argentina: { Brazil: { model: 55, market: 58 }, Netherlands: { model: 50, market: 52 }, Uruguay: { model: 58, market: 55 } },
  Germany: { France: { model: 48, market: 50 }, England: { model: 52, market: 55 }, Netherlands: { model: 53, market: 51 }, Spain: { model: 54, market: 52 }, Italy: { model: 47, market: 49 } },
  England: { Germany: { model: 48, market: 48 }, France: { model: 52, market: 50 }, Spain: { model: 55, market: 53 }, Italy: { model: 50, market: 48 } },
  France: { Germany: { model: 52, market: 50 }, England: { model: 48, market: 50 }, Portugal: { model: 55, market: 52 } },
  Spain: { Portugal: { model: 58, market: 55 }, Germany: { model: 46, market: 48 }, Italy: { model: 48, market: 50 }, England: { model: 45, market: 48 } },
  Netherlands: { Germany: { model: 47, market: 49 }, Argentina: { model: 50, market: 48 }, Italy: { model: 48, market: 50 }, Spain: { model: 46, market: 45 } },
  Portugal: { Spain: { model: 42, market: 45 }, France: { model: 45, market: 48 } },
  Italy: { Brazil: { model: 44, market: 42 }, Germany: { model: 53, market: 51 }, Spain: { model: 52, market: 50 }, Netherlands: { model: 52, market: 54 } },
  Uruguay: { Argentina: { model: 42, market: 45 }, Brazil: { model: 38, market: 40 } },
}

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
  const [pred, setPred] = useState<ReturnType<typeof predictLocal> | null>(null)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async (ta = a, tb = b, n = neutral, m = major) => {
    setLoading(true)
    setNarrative('')
    const p = predictLocal(ta, tb, n, m)
    setPred(p)
    if (apiAvailable) {
      const r = await apiPost<{ narrative: string }>('/predict', {
        team_a: ta, team_b: tb, is_neutral: n, is_major_tournament: m,
      })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(previewFallback(ta, tb, p.team_a_win_prob, p.draw_prob, p.team_b_win_prob)) }
    } else {
      setNarrative(previewFallback(ta, tb, p.team_a_win_prob, p.draw_prob, p.team_b_win_prob))
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
  const insight = INSIGHTS[a]?.[b] || INSIGHTS[b]?.[a]
  const odds = MARKET_ODDS[a]?.[b] || MARKET_ODDS[b]?.[a]
  const marketLine = odds ? (odds.model > odds.market ? `${a} is undervalued by the market` : `${b} is overpriced by the market`) : null
  const predScore = `${a} ${Math.round(p.stats_a.goal_avg)}–${Math.round(p.stats_b.goal_avg)} ${b}`

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

          <div className="insight-cards">
            <div className="insight-card">
              <div className="insight-label">Predicted Scoreline</div>
              <div className="insight-value">{predScore}</div>
            </div>
            <div className="insight-card">
              <div className="insight-label">Our Model</div>
              <div className="insight-value" style={{ color: '#22c55e' }}>{aIsFav ? a : b} {fmtPct(Math.max(p.team_a_win_prob, p.team_b_win_prob) / 100)}</div>
            </div>
            {odds && (
              <div className="insight-card">
                <div className="insight-label">Market Average</div>
                <div className="insight-value" style={{ color: '#f59e0b' }}>{aIsFav ? odds.market : (100 - odds.market)}%</div>
              </div>
            )}
            {odds && (
              <div className="insight-card insight-card-edge">
                <div className="insight-label">The Edge</div>
                <div className="insight-value" style={{ color: marketLine?.includes('undervalued') ? '#22c55e' : '#ef4444', fontSize: '0.75rem' }}>
                  {marketLine}
                </div>
              </div>
            )}
          </div>

          {insight && <div className="granite-box" style={{ fontSize: '0.83rem', padding: '0.7rem 1rem' }}>💡 {insight}</div>}

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
