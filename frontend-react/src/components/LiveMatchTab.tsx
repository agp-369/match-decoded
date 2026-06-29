import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cachedTeams, teamFlag, API } from '../api'

interface Props { apiAvailable: boolean }

interface MatchEvent {
  type: string; minute: number; team_a: string; team_b: string;
  score_a: number; score_b: number; momentum_a: number; momentum_b: number;
  commentary: string; label: string;
}

const EVENT_ICONS: Record<string, string> = {
  GOAL: '⚽', GOAL_AGAINST: '⚽', YELLOW_CARD: '🟨', RED_CARD: '🟥',
  VAR_REVIEW: '📺', VAR_OVERTURN: '🔄', PENALTY: '⬜',
  TACTICAL_SHIFT: '📋', SUBSTITUTION: '🔄', INJURY: '🆘',
  HALF_TIME: '⏸️', SECOND_HALF: '▶️', MOMENTUM_SHIFT: '📈',
  GOAL_DISALLOWED: '🚫', WOODWORK: '💥', FULL_TIME: '🏁', KICK_OFF: '⚡',
}

function eventClass(ev: MatchEvent): string {
  if (ev.type === 'GOAL' || ev.type === 'GOAL_AGAINST') return 'goal'
  if (ev.type === 'RED_CARD') return 'red-card'
  if (ev.type === 'HALF_TIME' || ev.type === 'FULL_TIME') return 'period'
  if (ev.type === 'VAR_REVIEW' || ev.type === 'VAR_OVERTURN') return 'var'
  return 'default'
}

function clockClass(running: boolean, finished: boolean): string {
  if (running) return 'running'
  if (finished) return 'finished'
  return 'idle'
}

export default function LiveMatchTab({ apiAvailable: _apiAvailable }: Props) {
  const [teams, setTeams] = useState<string[]>(['Brazil', 'Argentina', 'England', 'France', 'Germany'])
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('England')
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [currentMinute, setCurrentMinute] = useState(0)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [momentumA, setMomentumA] = useState(0.5)
  const [momentumB, setMomentumB] = useState(0.5)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const all = cachedTeams().map(x => x.name)
    setTeams(all)
    if (all.length > 0 && !all.includes(a)) setA(all[0])
    if (all.length > 0 && !all.includes(b)) setB(all[Math.min(1, all.length - 1)])
  }, [])

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [events])

  const startSimulation = async () => {
    if (!a || !b || a === b || running) return
    setRunning(true)
    setFinished(false)
    setEvents([])
    setCurrentMinute(0)
    setScoreA(0)
    setScoreB(0)
    setMomentumA(0.5)
    setMomentumB(0.5)
    setError('')

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const r = await fetch(`${API}/simulate/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_a: a, team_b: b, is_neutral: false, is_major_tournament: true }),
        signal: ctrl.signal,
      })
      if (!r.ok) {
        const text = await r.text().catch(() => '')
        setError(`Server error: ${r.status} ${text.slice(0, 100)}`)
        setRunning(false)
        return
      }

      const reader = r.body?.getReader()
      if (!reader) { setError('No response body'); setRunning(false); return }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))

          if (data.type === 'MATCH_START') continue
          if (data.type === 'MATCH_END') {
            setFinished(true)
            setRunning(false)
            continue
          }

          const ev = data as MatchEvent
          setEvents(prev => [...prev, ev])
          setCurrentMinute(ev.minute)
          setScoreA(ev.score_a)
          setScoreB(ev.score_b)
          setMomentumA(ev.momentum_a)
          setMomentumB(ev.momentum_b)
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(`Connection error: ${err.message}`)
      }
    } finally {
      setRunning(false)
      abortRef.current = null
    }
  }

  const stopSimulation = () => {
    abortRef.current?.abort()
    setRunning(false)
  }

  const resetSimulation = () => {
    stopSimulation()
    setEvents([])
    setCurrentMinute(0)
    setScoreA(0)
    setScoreB(0)
    setMomentumA(0.5)
    setMomentumB(0.5)
    setFinished(false)
    setError('')
  }

  const minuteStr = `${currentMinute}'`
  const momentumPctA = Math.round(momentumA * 100)
  const momentumPctB = Math.round(momentumB * 100)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card gold-border">
        <div className="section-heading"><span className="accent">●</span> Live Match Simulation</div>
        <p className="section-desc" style={{ marginBottom: 16 }}>
          Simulate a full 90-minute World Cup match in ~90 seconds with AI commentary on every key event.
        </p>

        <div className="live-match-controls">
          <div className="live-match-select-group">
            <label className="input-label">Home Team</label>
            <select className="live-match-select team-select-input" value={a} onChange={e => setA(e.target.value)} disabled={running}>
              {teams.filter(t => t !== b).map(t => <option key={t} value={t}>{teamFlag(t)} {t}</option>)}
            </select>
          </div>
          <div className="live-match-select-group">
            <label className="input-label">Away Team</label>
            <select className="live-match-select team-select-input" value={b} onChange={e => setB(e.target.value)} disabled={running}>
              {teams.filter(t => t !== a).map(t => <option key={t} value={t}>{teamFlag(t)} {t}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            {!running && !finished && (
              <button className="btn-primary" onClick={startSimulation} disabled={a === b}>
                ▶ Start Simulation
              </button>
            )}
            {running && (
              <button className="btn-secondary" onClick={stopSimulation}>
                ⏹ Stop
              </button>
            )}
            {finished && (
              <button className="btn-primary" onClick={resetSimulation}>
                🔄 New Simulation
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {(running || finished || events.length > 0) && (
          <>
            <div className="live-match-scoreboard">
              <div className="live-match-score">{scoreA} — {scoreB}</div>
              <div className="live-match-team-names">{teamFlag(a)} {a} vs {teamFlag(b)} {b}</div>
              <div className={`live-match-clock ${clockClass(running, finished)}`}>
                {running ? `▸ ${minuteStr}` : finished ? '✅ Full Time' : minuteStr}
              </div>
            </div>

            <div className="live-match-momentum">
              <div className="live-match-momentum-labels">
                <span>{teamFlag(a)} {a}</span>
                <span>Momentum</span>
                <span>{teamFlag(b)} {b}</span>
              </div>
              <div className="live-match-momentum-bar">
                <div className="live-match-momentum-side team-a" style={{ width: `${momentumPctA}%` }}>
                  {momentumPctA > 15 ? `${momentumPctA}%` : ''}
                </div>
                <div className="live-match-momentum-side team-b" style={{ width: `${momentumPctB}%` }}>
                  {momentumPctB > 15 ? `${momentumPctB}%` : ''}
                </div>
              </div>
            </div>

            <div ref={feedRef} className="live-match-feed">
              {events.length === 0 && (
                <div className="live-match-empty">
                  Match events will appear here as the simulation runs...
                </div>
              )}
              {events.map((ev, i) => (
                <div key={i} className={`live-match-event ${eventClass(ev)}`}>
                  <div className="live-match-event-header">
                    <span className="live-match-event-icon">{EVENT_ICONS[ev.type] || '•'}</span>
                    <span className="live-match-event-minute">{ev.minute}'</span>
                    <span className="live-match-event-label">{ev.label}</span>
                    {(ev.type === 'GOAL' || ev.type === 'GOAL_AGAINST') && (
                      <span className="live-match-event-score">{ev.score_a} — {ev.score_b}</span>
                    )}
                  </div>
                  {ev.commentary && (
                    <div className="live-match-commentary">“{ev.commentary}”</div>
                  )}
                </div>
              ))}
            </div>

            {finished && events.length > 0 && (
              <div className="live-match-summary">
                <div className="live-match-summary-title">Match Complete</div>
                <div className="live-match-summary-score">
                  {teamFlag(a)} {a} {scoreA} — {scoreB} {teamFlag(b)} {b}
                  {scoreA > scoreB ? ` — ${a} wins!` : scoreB > scoreA ? ` — ${b} wins!` : ' — Draw'}
                </div>
              </div>
            )}
          </>
        )}

        {!running && events.length === 0 && !error && (
          <div className="live-match-placeholder">
            <div className="live-match-placeholder-icon">⚽</div>
            <div className="live-match-placeholder-text">
              Select two teams and click <strong>Start Simulation</strong> to watch a live AI-commentated match unfold.
              <br />Each minute of match time ≈ 1 second. Full match in ~90 seconds.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
