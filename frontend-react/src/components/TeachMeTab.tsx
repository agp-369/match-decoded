import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { apiPost, API } from '../api'
import { parseConfidence, ConfidenceBadge } from '../confidence'

const FAQ_QUESTIONS = [
  { q: 'How does offside work in football?', icon: '🚩' },
  { q: 'What is a 4-3-3 formation and how does it work?', icon: '📐' },
  { q: 'What is VAR and how does it review decisions?', icon: '📺' },
  { q: 'How do World Cup group stages work?', icon: '🌍' },
  { q: 'What makes a good counter-attack?', icon: '⚡' },
  { q: 'Explain the "false 9" position', icon: '🎯' },
  { q: 'What is Expected Goals (xG)?', icon: '📊' },
  { q: 'How does the transfer market work?', icon: '💰' },
  { q: 'What is gegenpressing?', icon: '🔥' },
  { q: 'How does the World Cup knockout bracket work?', icon: '🏆' },
]

interface Props { apiAvailable: boolean; lang?: string }

export default function TeachMeTab({ apiAvailable, lang = 'en' }: Props) {
  const [question, setQuestion] = useState(FAQ_QUESTIONS[0].q)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customQ, setCustomQ] = useState('')
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const runStream = async (q: string) => {
    setQuestion(q)
    setLoading(true)
    setStreaming(true)
    setAnswer('')
    setError('')

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const r = await fetch(`${API}/explain/stream/teach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, lang }),
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
            if (data.token) setAnswer(prev => prev + data.token)
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

  const runLegacy = async (q: string) => {
    setQuestion(q)
    setLoading(true)
    setStreaming(false)
    setAnswer('')
    setError('')
    if (apiAvailable) {
      const { data, error } = await apiPost<{ explanation: string }>('/explain/teach', { question: q, lang })
      if (error) setError(error)
      if (data?.explanation) setAnswer(data.explanation)
    }
    setLoading(false)
  }

  const run = async (q: string) => {
    if (apiAvailable) {
      try {
        const r = await fetch(`${API}/explain/stream/teach`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, lang }),
        })
        if (r.ok) { r.body?.cancel(); await runStream(q); return }
      } catch {}
    }
    await runLegacy(q)
  }

  const cancel = () => {
    abortRef.current?.abort()
    setLoading(false)
    setStreaming(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card gold-border">
        <div className="section-heading"><span className="accent">●</span> Teach Me — Football Explained</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Pick a question or ask your own. Granite explains football concepts in plain language — perfect for new fans discovering the beautiful game.
        </p>

        <div className="faq-grid">
          {FAQ_QUESTIONS.map((item, i) => (
            <motion.div key={i} className={`faq-card${question === item.q ? ' active' : ''}`}
              onClick={() => run(item.q)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.q}</span>
            </motion.div>
          ))}
        </div>

        <hr />
        <label>Ask your own football question</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
          <input type="text" className="team-select-input" placeholder="e.g. What's a tiki-taka?" style={{ flex: 1 }}
            value={customQ} onChange={e => setCustomQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && customQ.trim()) run(customQ.trim()) }} />
          <button className="btn-secondary" style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}
            onClick={() => { if (customQ.trim()) run(customQ.trim()) }} disabled={loading}>
            Ask
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          {loading && streaming ? 'Granite is streaming...' : loading ? 'Granite is thinking...' : (error ? 'AI unavailable' : (answer ? 'Answer from IBM Granite' : 'Select a question above'))}
        </div>
        {loading && (
          <button className="btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }} onClick={cancel}>
            ⏹ Cancel
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {answer && (
        <motion.div className="granite-box" style={{ marginTop: '0.5rem', maxHeight: 500, overflowY: 'auto' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} ref={outputRef}>
          {(() => { const { displayText, score } = parseConfidence(answer); return <>{displayText}{streaming && <span className="cursor-blink">|</span>}<ConfidenceBadge score={score} streaming={streaming} /></> })()}
        </motion.div>
      )}
    </motion.div>
  )
}
