import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { API } from '../api'

const NODE_COLORS: Record<string, string> = {
  ChatInput: 'var(--accent)',
  HuggingFace: 'var(--green)',
  ChatOutput: 'var(--gold)',
}

export default function LangFlowTab() {
  const [flow, setFlow] = useState<{ nodes: number; edges: number } | null>(null)

  useEffect(() => {
    fetch(`${API}/langflow/info`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.flows?.[0]) {
          setFlow({ nodes: data.flows[0].nodes, edges: 1 })
        }
      })
      .catch(() => {})
  }, [])

  const nodes = [
    { id: '1', type: 'ChatInput', label: 'Chat Input', desc: 'User asks a question' },
    { id: '2', type: 'HuggingFace', label: 'IBM Granite 3.1', desc: 'HuggingFace Inference API' },
    { id: '3', type: 'ChatOutput', label: 'Chat Output', desc: 'Granite replies' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card gold-border">
        <div className="section-heading"><span className="accent">●</span> LangFlow Integration</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Match Decoded uses <strong>LangFlow</strong> — IBM's visual workflow builder for AI pipelines. The flow below represents the <strong>Teach Me Q&A</strong> feature using <strong>IBM Granite 3.1 8B</strong> via HuggingFace Inference API.
        </p>
      </div>

      <div className="glass-card" style={{ marginTop: '0.75rem', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          ⚡ Teach Me Q&A — Flow Diagram
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          {nodes.map((n, i) => (
            <motion.div key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: 8,
                background: NODE_COLORS[n.type] || 'var(--surface)',
                border: `1px solid ${NODE_COLORS[n.type] || 'var(--border)'}`,
                textAlign: 'center',
              }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>{n.label}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{n.desc}</div>
            </motion.div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
          {['Question', 'Inference', 'Answer'].map((l, i) => (
            <span key={l} style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>{l}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          {['HF_TOKEN → 0.7 temp', '3 nodes, 2 edges', 'max 512 tokens'].map((tag, i) => (
            <span key={i} style={{
              fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: 4,
              background: 'rgba(251,191,36,0.1)', color: 'var(--gold)',
              border: '1px solid rgba(251,191,36,0.2)',
            }}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📄 Flow File</h3>
          <code style={{ fontSize: '0.7rem', wordBreak: 'break-all', display: 'block', marginBottom: '0.5rem' }}>
            backend/langflow_flows/teach_me_granite.json
          </code>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            {flow ? `${flow.nodes} nodes · exported via lfx SDK` : 'Loading...'}
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>🚀 Run It</h3>
          <code style={{ fontSize: '0.7rem', wordBreak: 'break-all', display: 'block', marginBottom: '0.5rem' }}>
            lfx serve backend/langflow_flows/teach_me_granite.json
          </code>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            Requires: HUGGINGFACEHUB_API_TOKEN env var
          </span>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '0.75rem', padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>🧩 Components</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { name: 'ChatInput', desc: 'Receives user question' },
            { name: 'HuggingFaceModel', desc: 'Granite 3.1 8B via HF Inference API' },
            { name: 'ChatOutput', desc: 'Returns AI response' },
          ].map(c => (
            <div key={c.name} style={{
              padding: '0.5rem 0.75rem', borderRadius: 6, fontSize: '0.75rem',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <strong style={{ color: 'var(--accent)' }}>{c.name}</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem', marginTop: '0.15rem' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '0.75rem', padding: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          <strong>LangFlow</strong> is an IBM open-source visual framework for building multi-agent AI workflows.
          Match Decoded's flow uses a Chat Input → Model → Chat Output pipeline powered by
          <strong> IBM Granite 3.1 8B</strong> through HuggingFace Inference API. The flow can be imported into
          LangFlow UI or served via <code>lfx</code> (LangFlow Executor).
        </div>
      </div>
    </motion.div>
  )
}
