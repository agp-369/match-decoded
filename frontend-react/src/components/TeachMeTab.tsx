import { useState } from 'react'
import { motion } from 'framer-motion'
import { apiPost } from '../api'

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
  const [customQ, setCustomQ] = useState('')

  const run = async (q: string) => {
    setQuestion(q)
    setLoading(true)
    setAnswer('')
    if (apiAvailable) {
      const r = await apiPost<{ explanation: string }>('/explain/teach', { question: q, lang })
      if (r?.explanation) setAnswer(r.explanation)
    }
    setLoading(false)
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

      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '-0.3rem', marginBottom: '0.5rem' }}>
        {loading ? 'Granite is thinking...' : (answer ? 'Answer from IBM Granite' : 'Select a question above')}
      </div>

      {answer && (
        <motion.div className="granite-box" style={{ marginTop: '0.5rem' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {answer}
        </motion.div>
      )}
    </motion.div>
  )
}
