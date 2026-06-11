import { useState, useEffect } from 'react'
import { TEAM_STATS } from './api'
import PreMatchTab from './components/PreMatchTab'
import WhatIfTab from './components/WhatIfTab'
import LegendsTab from './components/LegendsTab'
import ExplainTab from './components/ExplainTab'
import DoclingTab from './components/DoclingTab'

type Tab = 'prematch' | 'whatif' | 'legends' | 'explain' | 'docling'
const TABS: { key: Tab; label: string }[] = [
  { key: 'prematch', label: '🔮 Pre-Match Preview' },
  { key: 'whatif', label: '⚡ What-If Simulator' },
  { key: 'legends', label: '⚔️ Legends Matchup' },
  { key: 'explain', label: '🧠 Decision Trace' },
  { key: 'docling', label: '📄 Docling Analysis' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('prematch')
  const [apiAvailable, setApiAvailableInternal] = useState<boolean | null>(null)

  const setApiAvailable = (v: boolean) => setApiAvailableInternal(v)

  useEffect(() => {
    fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(3000) })
      .then(r => { setApiAvailableInternal(r.ok) })
      .catch(() => setApiAvailableInternal(false))
  }, [])

  return (
    <div className="container">
      {}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>⚽</span>
          <div>
            <span className="header-title">Match Decoded</span>
            <div style={{ marginTop: '0.2rem' }}>
              <span className="tech-badge">IBM Granite</span>
              <span className="tech-badge">LangChain</span>
              <span className="tech-badge">Docling</span>
              <span className="tech-badge">Bob</span>
            </div>
          </div>
        </div>
        <div className="header-tagline">
          <strong>Understand the game.</strong> Explain the moments.<br />
          <span style={{ fontSize: '0.75rem', color: apiAvailable === null ? 'var(--text-dim)' : apiAvailable ? '#4ade80' : '#ff6b6b' }}>
            {apiAvailable === null ? '· checking API' : apiAvailable ? '· API online' : '· Standalone mode'}
          </span>
        </div>
      </header>

      {}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {}
      {tab === 'prematch' && <PreMatchTab apiAvailable={apiAvailable === true} setApiAvailable={setApiAvailable} />}
      {tab === 'whatif' && <WhatIfTab apiAvailable={apiAvailable === true} setApiAvailable={setApiAvailable} />}
      {tab === 'legends' && <LegendsTab apiAvailable={apiAvailable === true} setApiAvailable={setApiAvailable} />}
      {tab === 'explain' && <ExplainTab apiAvailable={apiAvailable === true} setApiAvailable={setApiAvailable} />}
      {tab === 'docling' && <DoclingTab />}

      {}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Data: historical international football (1872–2024, 44k+ matches)</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            <span className="tech-badge">IBM Granite 3.1-2B</span>
            <span className="tech-badge">LangChain</span>
            <span className="tech-badge">Docling</span>
            <span className="tech-badge">Random Forest (55.8%)</span>
          </span>
        </div>
      </div>

      {}
      <footer className="footer">
        Match Decoded &middot; IBM AI Builders Challenge &middot; Built with IBM Granite &middot; <a href="https://github.com/agp-369/match-decoded" style={{ color: 'var(--accent)', textDecoration: 'none' }}>GitHub</a>
      </footer>
    </div>
  )
}
