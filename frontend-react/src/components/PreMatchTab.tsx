import { useState } from 'react'
import { TEAMS, predictLocal, fmtPct, previewFallback, momentumFallback, explainFallback, legendsFallback, TEAM_STATS, apiPost } from '../api'

interface Props {
  apiAvailable: boolean
  setApiAvailable: (v: boolean) => void
}

export default function PreMatchTab({ apiAvailable, setApiAvailable }: Props) {
  const [a, setA] = useState('Brazil')
  const [b, setB] = useState('Argentina')
  const [neutral, setNeutral] = useState(false)
  const [major, setMajor] = useState(false)
  const [pred, setPred] = useState<ReturnType<typeof predictLocal> | null>(null)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true); setNarrative('')
    setPred(predictLocal(a, b, neutral, major))
    const p = predictLocal(a, b, neutral, major)
    if (apiAvailable) {
      const r = await apiPost<{ team_a: string; team_b: string; narrative: string }>('/predict', {
        team_a: a, team_b: b, is_neutral: neutral, is_major_tournament: major,
      })
      if (r) setNarrative(r.narrative)
      else { setApiAvailable(false); setNarrative(previewFallback(p.team_a, p.team_b, p.team_a_win_prob, p.draw_prob, p.team_b_win_prob)) }
    } else setNarrative(previewFallback(p.team_a, p.team_b, p.team_a_win_prob, p.draw_prob, p.team_b_win_prob))
    setLoading(false)
  }

  const p = pred || predictLocal(a, b, neutral, major)

  return (
    <div>
      <div className="grid-2">
        <div className="glass-card">
          <label>Team A</label>
          <select value={a} onChange={e => setA(e.target.value)}>{TEAMS.map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <div className="glass-card">
          <label>Team B</label>
          <select value={b} onChange={e => setB(e.target.value)}>{TEAMS.map(t => <option key={t}>{t}</option>)}</select>
        </div>
      </div>
      <div className="glass-card">
        <div className="checkbox-group"><input type="checkbox" id="neutral" checked={neutral} onChange={e => setNeutral(e.target.checked)} /><label htmlFor="neutral">Neutral venue</label></div>
        <div className="checkbox-group"><input type="checkbox" id="major" checked={major} onChange={e => setMajor(e.target.checked)} /><label htmlFor="major">Major tournament (World Cup / Euro / Copa)</label></div>
      </div>
      <button className="btn-primary" onClick={run} disabled={loading}>{loading ? <><span className="spinner" />Analyzing...</> : '🔮 Analyze Match'}</button>

      {(pred || narrative) && <div className="glass-card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.8rem', color: '#a0a0d0' }}>Prediction</h3>
        <div className="grid-3" style={{ marginBottom: '1rem' }}>
          <div className="metric"><div className="metric-label">{p.team_a} Win</div><div className="metric-value" style={{ color: '#00d4ff' }}>{fmtPct(p.team_a_win_prob)}</div></div>
          <div className="metric"><div className="metric-label">Draw</div><div className="metric-value" style={{ fontSize: '1.6rem' }}>{fmtPct(p.draw_prob)}</div></div>
          <div className="metric"><div className="metric-label">{p.team_b} Win</div><div className="metric-value" style={{ color: '#7b2ff7' }}>{fmtPct(p.team_b_win_prob)}</div></div>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.team_a_win_prob * 100}%` }} /></div>
        {narrative && <div className="granite-box">{narrative}</div>}
      </div>}
    </div>
  )
}
