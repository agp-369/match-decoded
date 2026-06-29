export function parseConfidence(text: string): { displayText: string; score: number | null } {
  const m = text.match(/CONFIDENCE:\s*(\d{1,3})\s*\/?\s*100\s*$/mi)
  if (m) {
    const score = Math.min(100, Math.max(0, parseInt(m[1], 10)))
    return { displayText: text.slice(0, m.index).trim(), score }
  }
  return { displayText: text, score: null }
}

export function confidenceLabel(score: number): string {
  if (score >= 80) return 'High'
  if (score >= 60) return 'Moderate'
  return 'Low'
}

export function confidenceColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

export function ConfidenceBadge({ score, streaming }: { score: number | null; streaming: boolean }) {
  if (streaming || score === null) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: 600,
      padding: '0.1rem 0.4rem', borderRadius: '4px',
      background: `${confidenceColor(score)}15`,
      color: confidenceColor(score),
      border: `1px solid ${confidenceColor(score)}40`,
      whiteSpace: 'nowrap', verticalAlign: 'middle',
    }}>
      <span style={{ fontSize: '0.5rem' }}>●</span>
      {confidenceLabel(score)} ({score}/100)
    </span>
  )
}
