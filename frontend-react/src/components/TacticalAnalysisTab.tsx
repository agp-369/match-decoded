import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cachedTeams, teamFlag, apiPost, fmtPct } from '../api'

const TACTICAL_QS = [
  'Why does the predicted winner have the edge? What tactical factors drive this matchup?',
  'If the underdog wants to win, what tactical change must they make?',
  'What formation and style would each team play? How does the battle unfold?',
]

interface Props { apiAvailable: boolean; setApiAvailable: (v: boolean) => void; lang?: string }

export default function TacticalAnalysisTab({ apiAvailable, lang = 'en' }: Props) {
  const [teams, setTeams] = useState<string[]>(['Brazil', 'Argentina', 'England', 'France', 'Germany'])
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('England')
  const [neutral, setNeutral] = useState(false)
  const [major, setMajor] = useState(true)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const all = cachedTeams().map(x => x.name)
    setTeams(all)
    if (all.length > 0 && !all.includes(a)) setA(all[0])
    if (all.length > 0 && !all.includes(b)) setB(all[Math.min(1, all.length - 1)])
  }, [])

  const run = async () => {
    if (!a || !b || a === b) return
    setLoading(true)
    setAnalysis('')
    if (apiAvailable) {
      const r = await apiPost<{ analysis: string }>('/explain/tactical', {
        team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major, lang,
      })
      if (r?.analysis) setAnalysis(r.analysis)
    }
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card gold-border">
        <div className="section-heading"><span className="accent">●</span> Tactical Analysis</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Every match has a tactical story. Select two teams and Granite will explain <strong>WHY</strong> the matchup favors one side, <strong>WHAT</strong> tactical change could flip it, and <strong>HOW</strong> the game might unfold.
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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
          <div className="checkbox-group">
            <input type="checkbox" id="tn" checked={neutral} onChange={e => setNeutral(e.target.checked)} />
            <label htmlFor="tn">Neutral Venue</label>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="tm" checked={major} onChange={e => setMajor(e.target.checked)} />
            <label htmlFor="tm">Major Tournament</label>
          </div>
        </div>
        <div className="insight-cards" style={{ marginTop: '0.5rem' }}>
          {TACTICAL_QS.map((q, i) => (
            <div key={i} className="insight-card" style={{ gridColumn: i === 0 ? '1 / -1' : undefined }}>
              <div className="insight-label">Question {i + 1}</div>
              <div className="insight-value" style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{q}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={run} disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? <><span className="spinner" /> Analyzing tactics...</> : '🧠 Analyze Tactics with Granite'}
      </button>

      {analysis && (
        <motion.div className="granite-box" style={{ marginTop: '0.8rem' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {analysis}
        </motion.div>
      )}
    </motion.div>
  )
}
