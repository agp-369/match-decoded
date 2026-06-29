import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cachedTeams, teamFlag, apiPost, fmtPct, API } from '../api'
import { parseConfidence, ConfidenceBadge } from '../confidence'

const TACTICAL_QS = [
  'Why does the predicted winner have the edge? What tactical factors drive this matchup?',
  'If the underdog wants to win, what tactical change must they make?',
  'What formation and style would each team play? How does the battle unfold?',
]

interface Props { apiAvailable: boolean; lang?: string }

export default function TacticalAnalysisTab({ apiAvailable, lang = 'en' }: Props) {
  const [teams, setTeams] = useState<string[]>(['Brazil', 'Argentina', 'England', 'France', 'Germany'])
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('England')
  const [neutral, setNeutral] = useState(false)
  const [major, setMajor] = useState(true)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const all = cachedTeams().map(x => x.name)
    setTeams(all)
    if (all.length > 0 && !all.includes(a)) setA(all[0])
    if (all.length > 0 && !all.includes(b)) setB(all[Math.min(1, all.length - 1)])
  }, [])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [analysis])

  const runStream = async () => {
    if (!a || !b || a === b) return
    setLoading(true)
    setStreaming(true)
    setAnalysis('')
    setError('')

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const r = await fetch(`${API}/explain/stream/tactical`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major, lang }),
        signal: ctrl.signal,
      })
      if (!r.ok) {
        const text = await r.text().catch(() => '')
        setError(`Server error: ${r.status}${text ? ` — ${text.slice(0, 100)}` : ''}`)
        return
      }

      const reader = r.body?.getReader()
      if (!reader) { setError('No response body'); return }

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
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue

          try {
            const data = JSON.parse(payload)
            if (data.error) { setError(data.error); continue }
            if (data.token) setAnalysis(prev => prev + data.token)
          } catch { continue }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(`Connection error: ${err.message}`)
      }
    } finally {
      setLoading(false)
      setStreaming(false)
      abortRef.current = null
    }
  }

  const runLegacy = async () => {
    if (!a || !b || a === b) return
    setLoading(true)
    setStreaming(false)
    setAnalysis('')
    setError('')
    const { data, error } = await apiPost<{ analysis: string }>('/explain/tactical', {
      team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major, lang,
    })
    if (error) setError(error)
    if (data?.analysis) setAnalysis(data.analysis)
    setLoading(false)
  }

  const run = async () => {
    if (apiAvailable) {
      try {
        const r = await fetch(`${API}/explain/stream/tactical`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major, lang }),
        })
        if (r.ok) { r.body?.cancel(); await runStream(); return }
      } catch {}
    }
    await runLegacy()
  }

  const cancel = () => {
    abortRef.current?.abort()
    setLoading(false)
    setStreaming(false)
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

      <div style={{ display: 'flex', gap: 8, marginTop: '0.5rem' }}>
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && streaming ? <><span className="spinner" /> Streaming analysis...</> :
           loading ? <><span className="spinner" /> Analyzing tactics...</> :
           '🧠 Analyze Tactics with Granite'}
        </button>
        {loading && (
          <button className="btn-secondary" onClick={cancel}>
            ⏹ Cancel
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {analysis && (
        <motion.div className="granite-box" style={{ marginTop: '0.8rem', maxHeight: 500, overflowY: 'auto' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} ref={outputRef}>
          {(() => { const { displayText, score } = parseConfidence(analysis); return <>{displayText}{streaming && <span className="cursor-blink">|</span>}<ConfidenceBadge score={score} streaming={streaming} /></> })()}
        </motion.div>
      )}
    </motion.div>
  )
}
