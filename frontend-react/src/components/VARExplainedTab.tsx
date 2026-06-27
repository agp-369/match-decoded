import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cachedTeams, teamFlag, apiPost, API } from '../api'

const VAR_SCENARIOS = [
  'A goal is disallowed for offside after a 3-minute VAR review',
  'A penalty is awarded after VAR spots a handball in the box',
  'A red card is issued after VAR review for a dangerous tackle',
  'A goal is allowed to stand after a tight offside check',
  'A penalty shout is overturned by VAR — the player simulated',
  'A goal is ruled out for a foul in the buildup spotted by VAR',
]

interface Props { apiAvailable: boolean; lang?: string }

export default function VARExplainedTab({ apiAvailable, lang = 'en' }: Props) {
  const [teams, setTeams] = useState<string[]>(['Brazil', 'Argentina', 'England', 'France', 'Germany'])
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('Argentina')
  const [scenario, setScenario] = useState(VAR_SCENARIOS[0])
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const explanationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const all = cachedTeams().map(x => x.name)
    setTeams(all)
    if (all.length > 0 && !all.includes(a)) setA(all[0])
    if (all.length > 0 && !all.includes(b)) setB(all[Math.min(1, all.length - 1)])
  }, [])

  useEffect(() => {
    if (explanationRef.current) explanationRef.current.scrollTop = explanationRef.current.scrollHeight
  }, [explanation])

  const runStream = async (body: Record<string, unknown>): Promise<boolean> => {
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const r = await fetch(`${API}/explain/stream/var`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: ctrl.signal,
      })
      if (!r.ok) { r.body?.cancel(); return false }
      const reader = r.body?.getReader()
      if (!reader) return false
      const decoder = new TextDecoder()
      let buffer = ''
      setExplanation('')
      setStreaming(true)
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
            if (data.token) setExplanation(prev => prev + data.token)
          } catch { continue }
        }
      }
      return true
    } catch { return false }
    finally { setStreaming(false); abortRef.current = null }
  }

  const run = async () => {
    if (!a || !b || a === b) return
    setLoading(true)
    setExplanation('')
    setError('')

    const body = { team_a: a, team_b: b, scenario, lang }

    if (apiAvailable) {
      const streamed = await runStream(body)
      if (!streamed) {
        const { data, error } = await apiPost<{ explanation: string }>('/explain/var', body)
        if (error) setError(error)
        if (data?.explanation) setExplanation(data.explanation)
      }
    }
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card gold-border">
        <div className="section-heading"><span className="accent">●</span> VAR Decision Explainer</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          <strong>WHY</strong> was that decision made? Select a match and a VAR scenario. Granite explains the law, the review process, and why the call was right or controversial.
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

        <label style={{ marginTop: '0.5rem' }}>VAR Scenario</label>
        <select value={scenario} onChange={e => setScenario(e.target.value)} style={{ marginTop: '0.3rem' }}>
          {VAR_SCENARIOS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <button className="btn-primary" onClick={run} disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading && streaming ? <><span className="spinner" /> Streaming explanation...</> :
         loading ? <><span className="spinner" /> Analyzing decision...</> :
         '⚖️ Explain with Granite'}
      </button>

      {error && <div className="error">{error}</div>}

      {explanation && (
        <motion.div className="granite-box" style={{ marginTop: '0.8rem', maxHeight: 400, overflowY: 'auto' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} ref={explanationRef}>
          {explanation}{streaming && <span className="cursor-blink">|</span>}
        </motion.div>
      )}
    </motion.div>
  )
}
