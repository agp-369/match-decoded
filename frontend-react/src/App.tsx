import { useState, useEffect } from 'react'
import { API, TEAM_STATS } from './api'
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
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 3000)
    fetch(`${API}/health`, { signal: ctrl.signal })
      .then(r => { clearTimeout(t); setApiAvailableInternal(r.ok) })
      .catch(() => { clearTimeout(t); setApiAvailableInternal(false) })
  }, [])

  return (
    <div className="container">
      {}
      <section className="hero">
        <svg className="hero-logo" viewBox="0 0 100 100" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ballGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef3c7"/>
              <stop offset="25%" stopColor="#fbbf24"/>
              <stop offset="65%" stopColor="#f59e0b"/>
              <stop offset="100%" stopColor="#92400e"/>
            </radialGradient>
            <radialGradient id="panelGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(180,83,9,0.15)"/>
              <stop offset="100%" stopColor="rgba(180,83,9,0.35)"/>
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#ballGrad)" stroke="#d97706" strokeWidth="1.2"/>
          <polygon points="50,30 67.1,42.4 60.6,62.5 39.4,62.5 32.9,42.4" fill="url(#panelGrad)" stroke="#92400e" strokeWidth="1.3"/>
          <line x1="50" y1="30" x2="50" y2="3" stroke="#92400e" strokeWidth="0.9" strokeLinecap="round"/>
          <line x1="67.1" y1="42.4" x2="85" y2="22" stroke="#92400e" strokeWidth="0.9" strokeLinecap="round"/>
          <line x1="60.6" y1="62.5" x2="78" y2="80" stroke="#92400e" strokeWidth="0.9" strokeLinecap="round"/>
          <line x1="39.4" y1="62.5" x2="22" y2="80" stroke="#92400e" strokeWidth="0.9" strokeLinecap="round"/>
          <line x1="32.9" y1="42.4" x2="15" y2="22" stroke="#92400e" strokeWidth="0.9" strokeLinecap="round"/>
          <ellipse cx="35" cy="28" rx="10" ry="6" fill="rgba(255,255,255,0.15)" transform="rotate(-25,35,28)"/>
        </svg>
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
