import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cachedTeams, teamFlag, API } from '../api'

interface Props { apiAvailable: boolean; lang?: string }

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

export default function LiveMatchTab({ apiAvailable }: Props) {
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

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="input-label">Home Team</label>
            <select className="team-select-input" value={a} onChange={e => setA(e.target.value)}
              disabled={running} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 14 }}>
              {teams.filter(t => t !== b).map(t => <option key={t} value={t}>{teamFlag(t)} {t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="input-label">Away Team</label>
            <select className="team-select-input" value={b} onChange={e => setB(e.target.value)}
              disabled={running} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 14 }}>
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

        {/* Scoreboard and Clock */}
        {(running || finished || events.length > 0) && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16, position: 'relative' }}>
              <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: 4, color: '#fbbf24', marginBottom: 4 }}>
                {scoreA} — {scoreB}
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>
                {teamFlag(a)} {a} vs {teamFlag(b)} {b}
              </div>
              <div style={{
                display: 'inline-block', padding: '4px 20px', borderRadius: 20,
                background: running ? '#f59e0b33' : finished ? '#22c55e33' : '#334155',
                color: running ? '#fbbf24' : finished ? '#22c55e' : '#94a3b8',
                fontSize: 20, fontWeight: 700,
              }}>
                {running ? `▸ ${minuteStr}` : finished ? '✅ Full Time' : minuteStr}
              </div>
            </div>

            {/* Momentum Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                <span>{teamFlag(a)} {a}</span>
                <span>Momentum</span>
                <span>{teamFlag(b)} {b}</span>
              </div>
              <div style={{ height: 20, background: '#1e293b', borderRadius: 10, overflow: 'hidden', display: 'flex' }}>
                <div style={{
                  width: `${momentumPctA}%`, background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                  transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: 'white', minWidth: momentumPctA > 15 ? 0 : undefined,
                }}>
                  {momentumPctA > 15 ? `${momentumPctA}%` : ''}
                </div>
                <div style={{
                  width: `${momentumPctB}%`, background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                  transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: 'white', minWidth: momentumPctB > 15 ? 0 : undefined,
                }}>
                  {momentumPctB > 15 ? `${momentumPctB}%` : ''}
                </div>
              </div>
            </div>

            {/* Event Feed */}
            <div ref={feedRef} style={{
              maxHeight: 400, overflowY: 'auto', background: '#0f172a', borderRadius: 8,
              padding: 12, border: '1px solid #1e293b',
            }}>
              {events.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                  Match events will appear here as the simulation runs...
                </div>
              )}
              {events.map((ev, i) => (
                <div key={i} style={{
                  padding: '10px 12px', marginBottom: 6, borderRadius: 6,
                  background: ev.type === 'GOAL' || ev.type === 'GOAL_AGAINST' ? '#f59e0b15' :
                    ev.type === 'RED_CARD' ? '#dc262615' :
                    ev.type === 'HALF_TIME' || ev.type === 'FULL_TIME' ? '#3b82f615' : '#1e293b',
                  borderLeft: `3px solid ${
                    ev.type === 'GOAL' || ev.type === 'GOAL_AGAINST' ? '#f59e0b' :
                    ev.type === 'RED_CARD' ? '#dc2626' :
                    ev.type === 'HALF_TIME' || ev.type === 'FULL_TIME' ? '#3b82f6' :
                    ev.type === 'VAR_REVIEW' || ev.type === 'VAR_OVERTURN' ? '#a855f7' : '#334155'
                  }`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{EVENT_ICONS[ev.type] || '•'}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>{ev.minute}'</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{ev.label}</span>
                    {(ev.type === 'GOAL' || ev.type === 'GOAL_AGAINST') && (
                      <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700 }}>
                        {ev.score_a} — {ev.score_b}
                      </span>
                    )}
                  </div>
                  {ev.commentary && (
                    <div style={{ fontSize: 13, color: '#c0c0c0', lineHeight: 1.5, fontStyle: 'italic', paddingLeft: 26 }}>
                      “{ev.commentary}”
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Match Summary */}
            {finished && events.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 16, padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #22c55e33' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>
                  Match Complete
                </div>
                <div style={{ fontSize: 14, color: '#94a8b3' }}>
                  {teamFlag(a)} {a} {scoreA} — {scoreB} {teamFlag(b)} {b}
                  {scoreA > scoreB ? ` — ${a} wins!` : scoreB > scoreA ? ` — ${b} wins!` : ' — Draw'}
                </div>
              </div>
            )}
          </>
        )}

        {!running && events.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚽</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              Select two teams and click <strong>Start Simulation</strong> to watch a live AI-commentated match unfold.
              <br />Each minute of match time ≈ 1 second. Full match in ~90 seconds.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
