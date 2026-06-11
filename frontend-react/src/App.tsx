import { useState, useEffect } from 'react'
import { TEAM_STATS } from './api'
import PreMatchTab from './components/PreMatchTab'
import WhatIfTab from './components/WhatIfTab'
import LegendsTab from './components/LegendsTab'
import ExplainTab from './components/ExplainTab'
import DoclingTab from './components/DoclingTab'

type Tab = 'prematch' | 'whatif' | 'legends' | 'explain' | 'docling'
const TABS: { key: Tab; label: string }[] = [
  { key: 'prematch', label: '📊 Pre-Match Preview' },
  { key: 'whatif', label: '🔄 What-If Simulator' },
  { key: 'legends', label: '🏆 Legends Matchup' },
  { key: 'explain', label: '🔍 Decision Trace' },
  { key: 'docling', label: '📄 Docling Analysis' },
]

const totalMatches = Object.values(TEAM_STATS).reduce((s, t) => s + t.matches, 0)

export default function App() {
  const [tab, setTab] = useState<Tab>('prematch')
  const [apiAvailable, setApiAvailableInternal] = useState<boolean | null>(null)

  const setApiAvailable = (v: boolean) => setApiAvailableInternal(v)

  useEffect(() => {
    fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(3000) })
      .then(r => setApiAvailableInternal(r.ok))
      .catch(() => setApiAvailableInternal(false))
  }, [])

  return (
    <div className="container">
      {}
      <section className="hero">
        <span className="hero-icon">🏆</span>
        <div className="hero-badge">World Cup · International Football</div>
        <h1 className="hero-title">Match Decoded</h1>
        <p className="hero-subtitle">
          <strong>Understand the game.</strong> Explain the moments.
        </p>
        <div className="tech-row">
          <span className="tech-badge">✦ IBM Granite</span>
          <span className="tech-badge">✦ LangChain</span>
          <span className="tech-badge">✦ IBM Docling</span>
          <span className="tech-badge">✦ IBM Bob</span>
        </div>
        {}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{totalMatches.toLocaleString()}</div>
            <div className="hero-stat-label">Matches Analyzed</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{Object.keys(TEAM_STATS).length}</div>
            <div className="hero-stat-label">Teams Tracked</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">55.8%</div>
            <div className="hero-stat-label">Model Accuracy</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value" style={{ fontSize: '0.85rem', fontFamily: 'var(--font)' }}>
              {apiAvailable === null ? '···' : apiAvailable ? '✓ Online' : '✦ Standalone'}
            </div>
            <div className="hero-stat-label">System Status</div>
          </div>
        </div>
      </section>

      {}
      <div className="gold-divider">World Cup Match Analysis</div>

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
      <footer className="footer">
        Match Decoded <span className="dot">·</span> IBM AI Builders Challenge
        <span className="dot">·</span> Built with IBM Granite 3.1-2B
        <span className="dot">·</span> <a href="https://github.com/agp-369/match-decoded" target="_blank" rel="noopener">GitHub</a>
      </footer>
    </div>
  )
}
