const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface TeamStats { winrate: number; goal_avg: number; form: number; matches: number; }

export interface Prediction {
  team_a: string; team_b: string;
  team_a_win_prob: number; draw_prob: number; team_b_win_prob: number;
  is_neutral: boolean; is_major_tournament: boolean;
  stats_a: TeamStats; stats_b: TeamStats;
}

export interface FeatureImportance { name: string; importance: number; }

export const TEAM_STATS: Record<string, TeamStats> = {
  Brazil: { winrate: 0.632, goal_avg: 2.17, form: 0.30, matches: 1060 },
  Argentina: { winrate: 0.552, goal_avg: 1.89, form: 0.60, matches: 1069 },
  Germany: { winrate: 0.578, goal_avg: 2.24, form: 0.50, matches: 1032 },
  France: { winrate: 0.538, goal_avg: 1.95, form: 0.70, matches: 870 },
  England: { winrate: 0.523, goal_avg: 1.88, form: 0.60, matches: 1050 },
  Spain: { winrate: 0.510, goal_avg: 1.72, form: 0.55, matches: 956 },
  Italy: { winrate: 0.525, goal_avg: 1.68, form: 0.45, matches: 942 },
  Netherlands: { winrate: 0.515, goal_avg: 1.92, form: 0.55, matches: 799 },
  Portugal: { winrate: 0.482, goal_avg: 1.65, form: 0.60, matches: 683 },
  Uruguay: { winrate: 0.540, goal_avg: 1.82, form: 0.40, matches: 642 },
};

export const TEAMS = Object.keys(TEAM_STATS);

export const FEATURES: FeatureImportance[] = [
  { name: 'team_b_winrate', importance: 0.221 },
  { name: 'team_a_winrate', importance: 0.206 },
  { name: 'team_b_goal_avg', importance: 0.188 },
  { name: 'team_a_goal_avg', importance: 0.183 },
  { name: 'team_b_recent_form', importance: 0.075 },
  { name: 'team_a_recent_form', importance: 0.075 },
  { name: 'is_neutral', importance: 0.027 },
  { name: 'is_major_tournament', importance: 0.025 },
];

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T | null> {
  try {
    const r = await fetch(`${API}${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

export function predictLocal(a: string, b: string, neutral: boolean, major: boolean): Prediction {
  const sa = TEAM_STATS[a] || { winrate: 0.5, goal_avg: 1.5, form: 0.5, matches: 500 };
  const sb = TEAM_STATS[b] || { winrate: 0.5, goal_avg: 1.5, form: 0.5, matches: 500 };
  let scoreA = sa.winrate * 3 + sa.goal_avg * 0.5 + sa.form * 0.3;
  let scoreB = sb.winrate * 3 + sb.goal_avg * 0.5 + sb.form * 0.3;
  if (neutral) scoreA *= 0.95;
  if (major) { scoreA *= 1.02; scoreB *= 1.02; }
  const total = scoreA + scoreB + 1;
  return {
    team_a: a, team_b: b,
    team_a_win_prob: Math.round((scoreA / total) * 10000) / 10000,
    draw_prob: Math.round((1 / total) * 10000) / 10000,
    team_b_win_prob: Math.round((scoreB / total) * 10000) / 10000,
    is_neutral: neutral, is_major_tournament: major,
    stats_a: { winrate: sa.winrate, goal_avg: sa.goal_avg, form: sa.form, matches: sa.matches },
    stats_b: { winrate: sb.winrate, goal_avg: sb.goal_avg, form: sb.form, matches: sb.matches },
  };
}

export function fmtPct(v: number) { return `${(v * 100).toFixed(1)}%`; }

export function previewFallback(a: string, b: string, pa: number, pd: number, pb: number): string {
  const edge = pa > pb ? a : b;
  return `Based on historical data, ${edge} enters as the favourite. ${a} has a ${fmtPct(pa)} chance of winning, while ${b} sits at ${fmtPct(pb)}. The draw probability is ${fmtPct(pd)}.`;
}

export function momentumFallback(a: string, b: string, pa: number, pb: number): string {
  const diff = Math.abs(pa - pb) * 100;
  return `With ${a} at ${fmtPct(pa)} and ${b} at ${fmtPct(pb)}, the model suggests ${diff < 10 ? 'a tight contest' : 'one team has a clear edge'}. Momentum in football often shifts through an early goal, a red card, or a tactical substitution.`;
}

export function explainFallback(): string {
  return `The prediction was driven primarily by team_b_winrate. The model analyzed 8 factors including historical win rates, goal averages, recent form, venue, and tournament importance. Accuracy: 55.8% on unseen data (vs 47.2% baseline).`;
}

export function legendsFallback(a: string, b: string, sa: TeamStats, sb: TeamStats): string {
  return `${a} has a win rate of ${fmtPct(sa.winrate)} across ${sa.matches} matches, averaging ${sa.goal_avg.toFixed(2)} goals per game. ${b} has a win rate of ${fmtPct(sb.winrate)} across ${sb.matches} matches, averaging ${sb.goal_avg.toFixed(2)} goals per game. While cross-era comparison is subjective, ${sa.winrate > sb.winrate ? a : b} has the statistical edge.`;
}
