import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cachedTeams, teamFlag, apiPost, fmtPct, type Prediction } from '../api'

interface Props { apiAvailable: boolean; lang?: string }

export default function MatchStoryTab({ apiAvailable, lang = 'en' }: Props) {
  const [teams, setTeams] = useState<string[]>(['Brazil', 'Argentina', 'England', 'France', 'Germany'])
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('England')
  const [neutral, setNeutral] = useState(false)
  const [major, setMajor] = useState(true)
  const [story, setStory] = useState('')
  const [pred, setPred] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(false)

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
        .then(r => { if (r) setPred(r) })
    }
  }, [a, b])

  const run = async () => {
    if (!a || !b || a === b) return
    setLoading(true)
    setStory('')
    if (apiAvailable) {
      const [storyRes] = await Promise.allSettled([
        apiPost<{ story: string }>('/explain/story', {
          team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major, lang,
        }),
      ])
      if (storyRes.status === 'fulfilled' && storyRes.value?.story) setStory(storyRes.value.story)
    }
    setLoading(false)
  }

  const p = pred

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card gold-border">
        <div className="section-heading"><span className="accent">●</span> AI Match Story</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Not "who wins" but <strong>HOW</strong> the match comes alive. Granite writes a 3-act narrative based on real team statistics — how the first half unfolds, the key moment that changes everything, and how it ends.
        </p>
        <div className="grid-2" style={{ gap: '0.5rem', marginBottom: '0.8rem' }}>
          <div style={{ position: 'relative' }}>
            <input className="team-select-input" placeholder="Search teams..." value={`${teamFlag(a)} ${a}`} readOnly
              onFocus={e => { const dd = e.target.parentElement?.querySelector('.team-select-dropdown') as HTMLElement; if (dd) dd.style.display = 'block' }}
              onBlur={() => setTimeout(() => { document.querySelectorAll('.team-select-dropdown').forEach(d => (d as HTMLElement).style.display = 'none') }, 200)} />
            <div className="team-select-dropdown" style={{ display: 'none' }}>
              {teams.filter(t => t !== b).map(t => (
                <div key={t} className="team-select-option" onMouseDown={() => { setA(t) }}>
                  <span className="team-select-flag">{teamFlag(t)}</span> {t}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <input className="team-select-input" placeholder="Search teams..." value={`${teamFlag(b)} ${b}`} readOnly
              onFocus={e => { const dd = e.target.parentElement?.querySelector('.team-select-dropdown') as HTMLElement; if (dd) dd.style.display = 'block' }}
              onBlur={() => setTimeout(() => { document.querySelectorAll('.team-select-dropdown').forEach(d => (d as HTMLElement).style.display = 'none') }, 200)} />
            <div className="team-select-dropdown" style={{ display: 'none' }}>
              {teams.filter(t => t !== a).map(t => (
                <div key={t} className="team-select-option" onMouseDown={() => { setB(t) }}>
                  <span className="team-select-flag">{teamFlag(t)}</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="checkbox-group">
            <input type="checkbox" id="sn" checked={neutral} onChange={e => setNeutral(e.target.checked)} />
            <label htmlFor="sn">Neutral Venue</label>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="sm" checked={major} onChange={e => setMajor(e.target.checked)} />
            <label htmlFor="sm">Major Tournament</label>
          </div>
        </div>
      </div>

      {p && (
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div className="section-heading" style={{ fontSize: '0.95rem' }}><span className="accent">●</span> Line & Prediction</div>
          <div className="scoreboard" style={{ padding: '0.8rem 1rem', margin: 0 }}>
            <div className="scoreboard-team">
              <span className="flag">{teamFlag(p.team_a)}</span>
              <div className="name" style={{ fontSize: '0.75rem' }}>{p.team_a}</div>
              <div className="prob" style={{ fontSize: '1.3rem', color: '#22c55e' }}>{(p.team_a_win_prob * 100).toFixed(1)}%</div>
            </div>
            <div className="scoreboard-divider" />
            <div>
              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Draw</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 700 }}>{(p.draw_prob * 100).toFixed(1)}%</div>
            </div>
            <div className="scoreboard-divider" />
            <div className="scoreboard-team">
              <span className="flag">{teamFlag(p.team_b)}</span>
              <div className="name" style={{ fontSize: '0.75rem' }}>{p.team_b}</div>
              <div className="prob" style={{ fontSize: '1.3rem', color: '#ef4444' }}>{(p.team_b_win_prob * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      <button className="btn-primary" onClick={run} disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? <><span className="spinner" /> Writing story...</> : '📖 Tell the Match Story'}
      </button>

      {story && (
        <motion.div className="granite-box" style={{ marginTop: '0.8rem', lineHeight: 1.8 }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {story}
        </motion.div>
      )}
    </motion.div>
  )
}
