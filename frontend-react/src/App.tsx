import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWorldCupGroups, cachedTeams, getAllTeams } from './api'
import PreMatchTab from './components/PreMatchTab'
import WhatIfTab from './components/WhatIfTab'
import LegendsTab from './components/LegendsTab'
import ExplainTab from './components/ExplainTab'
import DoclingTab from './components/DoclingTab'
import TacticalAnalysisTab from './components/TacticalAnalysisTab'
import VARExplainedTab from './components/VARExplainedTab'
import MatchStoryTab from './components/MatchStoryTab'
import TeachMeTab from './components/TeachMeTab'
import LiveMatchTab from './components/LiveMatchTab'
import LangFlowTab from './components/LangFlowTab'

type Tab = 'prematch' | 'whatif' | 'legends' | 'explain' | 'docling' | 'tactical' | 'var' | 'story' | 'teach' | 'livematch' | 'langflow'
const TABS: { key: Tab; label: string; icon: string; desc: string }[] = [
  { key: 'livematch', label: 'Live Match', icon: '⚽', desc: '90-min simulation + AI commentary' },
  { key: 'prematch', label: 'Pre-Match Preview', icon: '📊', desc: 'Prediction + Narrative' },
  { key: 'tactical', label: 'Tactical Analysis', icon: '🧠', desc: 'WHY each side wins' },
  { key: 'var', label: 'VAR Explained', icon: '⚖️', desc: 'WHY decisions are made' },
  { key: 'story', label: 'Match Story', icon: '📖', desc: 'HOW the match unfolds' },
  { key: 'whatif', label: 'What-If Simulator', icon: '🔄', desc: 'Change the narrative' },
  { key: 'legends', label: 'Legends Matchup', icon: '🏆', desc: 'Cross-era debate' },
  { key: 'explain', label: 'Decision Trace', icon: '🔍', desc: 'Model transparency' },
  { key: 'teach', label: 'Teach Me', icon: '📚', desc: 'Learn the game' },
  { key: 'docling', label: 'Docling Analysis', icon: '📄', desc: 'Report parsing' },
  { key: 'langflow', label: 'LangFlow', icon: '🔀', desc: 'Visual workflow' },
]

const LANG_OPTIONS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('livematch')
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)
  const [healthData, setHealthData] = useState<{
    ai_available: boolean; active_provider: string; teams_available: number; ibm_technologies: string[];
  } | null>(null)
  const [wcMode, setWcMode] = useState(false)
  const [teamCount, setTeamCount] = useState(48)
  const [totalMatches, setTotalMatches] = useState(31161)
  const [lang, setLang] = useState('en')
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => {
    getAllTeams().then(teams => setTeamCount(teams.length))
    fetchWorldCupGroups()
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 60000)
    fetch(`https://match-decoded-api.onrender.com/health`, { signal: ctrl.signal })
      .then(async r => {
        clearTimeout(t)
        if (r.ok) {
          setApiAvailable(true)
          const h = await r.json()
          setHealthData(h)
          if (h.teams_available) setTeamCount(h.teams_available)
        } else setApiAvailable(false)
      })
      .catch(() => { clearTimeout(t); setApiAvailable(false) })
  }, [])

  const isOnline = apiAvailable === true
  const aiProvider = healthData?.active_provider || 'standalone'
  const aiLabel = aiProvider === 'watsonx.ai' ? 'IBM watsonx.ai' : aiProvider === 'HuggingFace Inference API' ? 'HuggingFace Granite' : 'Offline'

  return (
    <div className="container">
      <AnimatePresence mode="wait">
        <motion.div key={tab + lang} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
          <section className="hero">
            <svg className="hero-logo" viewBox="0 0 100 100" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="ballGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef3c7"/><stop offset="25%" stopColor="#fbbf24"/>
                  <stop offset="65%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#92400e"/>
                </radialGradient>
                <radialGradient id="panelGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(180,83,9,0.15)"/><stop offset="100%" stopColor="rgba(180,83,9,0.35)"/>
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
            <div className="hero-badge">{wcMode ? '⚽ World Cup 2026 · AI Match Explainability' : '🌍 International Football · AI Match Explainability'}</div>
            <h1 className="hero-title">Match Decoded</h1>
            <p className="hero-subtitle">
              <strong>Every fan deserves to know why.</strong><br/>
              <span style={{fontSize:'0.8em', fontWeight:400, opacity:0.8}}>AI-powered match explainability — IBM Granite · LangChain · Docling · IBM Bob</span>
            </p>
            <div className="tech-row">
              <span className={`tech-badge ${healthData?.active_provider === 'watsonx.ai' ? 'active' : ''}`}>
                {healthData?.active_provider === 'watsonx.ai' ? '●' : '○'} IBM Granite (watsonx.ai)
              </span>
              <span className="tech-badge">✦ LangChain</span>
              <span className="tech-badge">✦ IBM Docling</span>
              <span className="tech-badge">✦ IBM Bob</span>
              <span className="tech-badge">✦ LangFlow</span>
              <span className="tech-badge">✦ Context Forge MCP</span>
            </div>
            <div className="hero-stats">
              <motion.div className="hero-stat" whileHover={{ scale: 1.05 }}>
                <div className="hero-stat-value">{totalMatches.toLocaleString()}</div>
                <div className="hero-stat-label">Real Matches Analyzed</div>
              </motion.div>
              <motion.div className="hero-stat" whileHover={{ scale: 1.05 }}>
                <div className="hero-stat-value">{teamCount}</div>
                <div className="hero-stat-label">International Teams</div>
              </motion.div>
              <motion.div className="hero-stat" whileHover={{ scale: 1.05 }}>
                <div className="hero-stat-value">66.6%</div>
                <div className="hero-stat-label">3-Class Prediction Accuracy</div>
              </motion.div>
              <motion.div className="hero-stat" whileHover={{ scale: 1.05 }}>
                <div className="hero-stat-value" style={{ fontSize: '0.85rem', fontFamily: 'var(--font)' }}>
                  {apiAvailable === null ? '···' : apiAvailable ? '✓ Online' : '✦ Standalone'}
                </div>
                <div className="hero-stat-label">System Status</div>
              </motion.div>
            </div>
          </section>

          <div className="ibm-status-bar">
            <div className="ibm-status-left">
              <span className={`ibm-dot ${healthData?.ai_available ? 'green' : 'yellow'}`} />
              <span className="ibm-provider">AI: <strong>{aiLabel}</strong></span>
              {healthData?.ai_available && (
                <span className="ibm-model">ibm/granite-3-8b-instruct</span>
              )}
            </div>
            <div className="ibm-status-right">
              <span className="ibm-tech">IBM Granite</span>
              <span className="ibm-tech-sep">·</span>
              <span className="ibm-tech">LangChain</span>
              <span className="ibm-tech-sep">·</span>
              <span className="ibm-tech">Docling</span>
              <span className="ibm-tech-sep">·</span>
              <span className="ibm-tech">IBM Bob</span>
              <span className="ibm-tech-sep">·</span>
              <span className="ibm-tech">LangFlow</span>
              <span className="ibm-tech-sep">·</span>
              <span className="ibm-tech">Context Forge MCP</span>
            </div>
          </div>

          <div className="gold-divider">
            {wcMode ? '⚽ World Cup 2026 Match Analysis' : '🌍 International Match Analysis'}
            <span style={{ flex: 1 }} />
            <div className="lang-selector" style={{ position: 'relative', display: 'inline-block' }}>
              <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
                🌐 {LANG_OPTIONS.find(l => l.code === lang)?.label || 'EN'}
              </button>
              {langOpen && (
                <div className="lang-dropdown" onMouseLeave={() => setLangOpen(false)}>
                  {LANG_OPTIONS.map(l => (
                    <div key={l.code} className={`lang-option${lang === l.code ? ' active' : ''}`}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}>
                      {l.label} — {l.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="wc-toggle" onClick={() => setWcMode(!wcMode)}>
              {wcMode ? '🌍 All Teams' : '⚽ World Cup 2026'}
            </button>
          </div>

          <div className="tabs">
            {TABS.map(t => (
              <motion.button
                key={t.key}
                className={`tab${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.icon} {t.label}
              </motion.button>
            ))}
          </div>

          {tab === 'livematch' && <LiveMatchTab apiAvailable={isOnline} />}
          {tab === 'prematch' && <PreMatchTab apiAvailable={isOnline} wcMode={wcMode} lang={lang} />}
          {tab === 'tactical' && <TacticalAnalysisTab apiAvailable={isOnline} lang={lang} />}
          {tab === 'var' && <VARExplainedTab apiAvailable={isOnline} lang={lang} />}
          {tab === 'story' && <MatchStoryTab apiAvailable={isOnline} lang={lang} />}
          {tab === 'whatif' && <WhatIfTab apiAvailable={isOnline} lang={lang} />}
          {tab === 'legends' && <LegendsTab apiAvailable={isOnline} lang={lang} />}
          {tab === 'explain' && <ExplainTab apiAvailable={isOnline} lang={lang} />}
          {tab === 'teach' && <TeachMeTab apiAvailable={isOnline} lang={lang} />}
          {tab === 'docling' && <DoclingTab />}
          {tab === 'langflow' && <LangFlowTab />}

          <footer className="footer">
            Match Decoded <span className="dot">·</span> IBM AI Builders Challenge
            <span className="dot">·</span> Built with IBM Granite 3-8B + IBM Bob
            <span className="dot">·</span> <a href="https://github.com/agp-369/match-decoded" target="_blank" rel="noopener">GitHub</a>
          </footer>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
