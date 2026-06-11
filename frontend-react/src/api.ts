export const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface TeamStats { winrate: number; goal_avg: number; form: number; matches: number; }

export interface Prediction {
  team_a: string; team_b: string;
  team_a_win_prob: number; draw_prob: number; team_b_win_prob: number;
  is_neutral: boolean; is_major_tournament: boolean;
  stats_a: TeamStats; stats_b: TeamStats;
}

export interface FeatureImportance { name: string; importance: number; }

export interface MomentumPoint { minute: number; a_prob: number; d_prob: number; b_prob: number; event?: string; }

export interface TeamDetail { name: string; winrate: number; goal_avg: number; form: number; matches: number; }

export const TEAM_FLAGS: Record<string, string> = {
  Argentina: '🇦🇷', Australia: '🇦🇺', Austria: '🇦🇹', Belgium: '🇧🇪', Brazil: '🇧🇷',
  Cameroon: '🇨🇲', Canada: '🇨🇦', Chile: '🇨🇱', Colombia: '🇨🇴', CostaRica: '🇨🇷',
  Croatia: '🇭🇷', CzechRepublic: '🇨🇿', Denmark: '🇩🇰', Ecuador: '🇪🇨', Egypt: '🇪🇬',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', France: '🇫🇷', Germany: '🇩🇪', Ghana: '🇬🇭', Greece: '🇬🇷',
  Hungary: '🇭🇺', Iceland: '🇮🇸', Iran: '🇮🇷', Italy: '🇮🇹', IvoryCoast: '🇨🇮',
  Jamaica: '🇯🇲', Japan: '🇯🇵', KoreaRepublic: '🇰🇷', Mexico: '🇲🇽', Morocco: '🇲🇦',
  Netherlands: '🇳🇱', Nigeria: '🇳🇬', Norway: '🇳🇴', Paraguay: '🇵🇾', Peru: '🇵🇪',
  Poland: '🇵🇱', Portugal: '🇵🇹', Romania: '🇷🇴', Russia: '🇷🇺', SaudiArabia: '🇸🇦',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Senegal: '🇸🇳', Serbia: '🇷🇸', Slovakia: '🇸🇰', Slovenia: '🇸🇮',
  SouthAfrica: '🇿🇦', Spain: '🇪🇸', Sweden: '🇸🇪', Switzerland: '🇨🇭', Tunisia: '🇹🇳',
  Turkey: '🇹🇷', Ukraine: '🇺🇦', UnitedStates: '🇺🇸', Uruguay: '🇺🇾', Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
};

const FALLBACK_TEAM_STATS: Record<string, TeamStats> = {
  Argentina: { winrate: 0.552, goal_avg: 1.89, form: 0.60, matches: 1069 },
  Australia: { winrate: 0.380, goal_avg: 1.35, form: 0.40, matches: 625 },
  Austria: { winrate: 0.428, goal_avg: 1.58, form: 0.50, matches: 832 },
  Belgium: { winrate: 0.525, goal_avg: 1.82, form: 0.65, matches: 812 },
  Brazil: { winrate: 0.632, goal_avg: 2.17, form: 0.30, matches: 1060 },
  Cameroon: { winrate: 0.385, goal_avg: 1.28, form: 0.35, matches: 568 },
  Canada: { winrate: 0.342, goal_avg: 1.22, form: 0.45, matches: 412 },
  Chile: { winrate: 0.445, goal_avg: 1.52, form: 0.40, matches: 798 },
  Colombia: { winrate: 0.472, goal_avg: 1.55, form: 0.50, matches: 682 },
  Croatia: { winrate: 0.468, goal_avg: 1.62, form: 0.60, matches: 538 },
  CzechRepublic: { winrate: 0.465, goal_avg: 1.58, form: 0.40, matches: 742 },
  Denmark: { winrate: 0.478, goal_avg: 1.72, form: 0.55, matches: 688 },
  Ecuador: { winrate: 0.412, goal_avg: 1.42, form: 0.50, matches: 562 },
  Egypt: { winrate: 0.445, goal_avg: 1.48, form: 0.55, matches: 698 },
  England: { winrate: 0.523, goal_avg: 1.88, form: 0.60, matches: 1050 },
  France: { winrate: 0.538, goal_avg: 1.95, form: 0.70, matches: 870 },
  Germany: { winrate: 0.578, goal_avg: 2.24, form: 0.50, matches: 1032 },
  Ghana: { winrate: 0.395, goal_avg: 1.32, form: 0.35, matches: 542 },
  Greece: { winrate: 0.408, goal_avg: 1.38, form: 0.40, matches: 612 },
  Hungary: { winrate: 0.435, goal_avg: 1.55, form: 0.35, matches: 898 },
  Iceland: { winrate: 0.365, goal_avg: 1.25, form: 0.35, matches: 382 },
  Iran: { winrate: 0.395, goal_avg: 1.30, form: 0.50, matches: 612 },
  Italy: { winrate: 0.525, goal_avg: 1.68, form: 0.45, matches: 942 },
  IvoryCoast: { winrate: 0.418, goal_avg: 1.42, form: 0.40, matches: 528 },
  Japan: { winrate: 0.435, goal_avg: 1.48, form: 0.55, matches: 682 },
  KoreaRepublic: { winrate: 0.412, goal_avg: 1.42, form: 0.40, matches: 712 },
  Mexico: { winrate: 0.462, goal_avg: 1.55, form: 0.50, matches: 868 },
  Morocco: { winrate: 0.415, goal_avg: 1.38, form: 0.60, matches: 558 },
  Netherlands: { winrate: 0.515, goal_avg: 1.92, form: 0.55, matches: 799 },
  Nigeria: { winrate: 0.428, goal_avg: 1.45, form: 0.40, matches: 612 },
  Norway: { winrate: 0.412, goal_avg: 1.52, form: 0.35, matches: 742 },
  Paraguay: { winrate: 0.398, goal_avg: 1.35, form: 0.35, matches: 688 },
  Peru: { winrate: 0.405, goal_avg: 1.38, form: 0.40, matches: 632 },
  Poland: { winrate: 0.445, goal_avg: 1.55, form: 0.50, matches: 848 },
  Portugal: { winrate: 0.482, goal_avg: 1.65, form: 0.60, matches: 683 },
  Romania: { winrate: 0.425, goal_avg: 1.48, form: 0.35, matches: 722 },
  Russia: { winrate: 0.445, goal_avg: 1.52, form: 0.40, matches: 612 },
  SaudiArabia: { winrate: 0.355, goal_avg: 1.18, form: 0.35, matches: 548 },
  Scotland: { winrate: 0.395, goal_avg: 1.42, form: 0.35, matches: 748 },
  Senegal: { winrate: 0.428, goal_avg: 1.42, form: 0.50, matches: 498 },
  Serbia: { winrate: 0.435, goal_avg: 1.52, form: 0.45, matches: 618 },
  Spain: { winrate: 0.510, goal_avg: 1.72, form: 0.55, matches: 956 },
  Sweden: { winrate: 0.448, goal_avg: 1.58, form: 0.40, matches: 798 },
  Switzerland: { winrate: 0.455, goal_avg: 1.55, form: 0.50, matches: 712 },
  Turkey: { winrate: 0.425, goal_avg: 1.48, form: 0.45, matches: 598 },
  Ukraine: { winrate: 0.418, goal_avg: 1.42, form: 0.45, matches: 528 },
  UnitedStates: { winrate: 0.428, goal_avg: 1.48, form: 0.55, matches: 742 },
  Uruguay: { winrate: 0.540, goal_avg: 1.82, form: 0.40, matches: 642 },
  Wales: { winrate: 0.375, goal_avg: 1.32, form: 0.40, matches: 612 },
};

let _allTeams: TeamDetail[] | null = null;
let _teamsPromise: Promise<TeamDetail[]> | null = null;

export function getAllTeams(): Promise<TeamDetail[]> {
  if (_allTeams) return Promise.resolve(_allTeams);
  if (_teamsPromise) return _teamsPromise;
  _teamsPromise = (async () => {
    try {
      const r = await fetch(`${API}/teams/detail`);
      if (!r.ok) throw new Error('API unavailable');
      const data = await r.json();
      _allTeams = data.teams;
      return data.teams as TeamDetail[];
    } catch {
      const fallback: TeamDetail[] = Object.entries(FALLBACK_TEAM_STATS).map(([name, s]) => ({
        name, winrate: s.winrate, goal_avg: s.goal_avg, form: s.form, matches: s.matches,
      }));
      _allTeams = fallback;
      return fallback;
    }
  })();
  return _teamsPromise;
}

export function cachedTeams(): TeamDetail[] {
  return _allTeams || Object.entries(FALLBACK_TEAM_STATS).map(([name, s]) => ({
    name, winrate: s.winrate, goal_avg: s.goal_avg, form: s.form, matches: s.matches,
  }));
}

export function teamFlag(name: string): string {
  return TEAM_FLAGS[name] || '⚽';
}

export function teamFlagFromCode(code: string): string {
  if (!code || code.length < 2) return '⚽';
  const cp = code.toUpperCase();
  if (TEAM_FLAGS[cp]) return TEAM_FLAGS[cp];
  const flag = String.fromCodePoint(0x1F1E6 + cp.charCodeAt(0) - 65, 0x1F1E6 + cp.charCodeAt(1) - 65);
  return flag;
}

export function fmtPct(v: number) { return `${(v * 100).toFixed(1)}%`; }

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T | null> {
  try {
    const r = await fetch(`${API}${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

export async function fetchHealth(): Promise<{
  status: string; model_loaded: boolean; teams_available: number;
  ai_available: boolean; active_provider: string; ibm_technologies: string[];
} | null> {
  try {
    const r = await fetch(`${API}/health`);
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

export async function fetchMomentum(ta: string, tb: string, neutral: boolean, major: boolean):
  Promise<{ prediction: Prediction; momentum: MomentumPoint[] } | null> {
  return apiPost('/simulate/momentum', { team_a: ta, team_b: tb, is_neutral: neutral, is_major_tournament: major });
}

export async function fetchWorldCupGroups(): Promise<Record<string, {
  name: string; winrate: number; goal_avg: number; form: number; matches: number; elo: number;
}[]> | null> {
  try {
    const r = await fetch(`${API}/worldcup/groups`);
    if (!r.ok) return null;
    const data = await r.json();
    return data.groups;
  } catch { return null; }
}

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
  { code: 'de', name: 'Deutsch' },
]

export function predictLocal(a: string, b: string, neutral: boolean, major: boolean): Prediction {
  const sa = FALLBACK_TEAM_STATS[a] || { winrate: 0.5, goal_avg: 1.5, form: 0.5, matches: 500 };
  const sb = FALLBACK_TEAM_STATS[b] || { winrate: 0.5, goal_avg: 1.5, form: 0.5, matches: 500 };
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

export function generateMomentum(aProb: number, dProb: number, bProb: number): MomentumPoint[] {
  const points: MomentumPoint[] = [];
  const events: { min: number; label: string }[] = [];
  const opts = ['Early goal!', 'Yellow card', 'Tactical substitution', 'Penalty shout', 'Injury stoppage', 'Goal disallowed (VAR)', 'Red card!', 'Half-time adjustment'];
  const opts2 = ['Counter-attack', 'Free kick danger', 'Corner pressure', 'Long-range shot', 'Defensive reshuffle', 'Captain injured', 'Formation change', 'Set piece goal!'];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * opts.length);
    events.push({ min: 10 + Math.floor(Math.random() * 70), label: i === 0 ? opts[idx] : opts2[(idx + i * 3) % opts2.length] });
  }
  events.sort((a, b) => a.min - b.min);
  let curA = aProb + (Math.random() - 0.5) * 0.06;
  let curD = dProb + (Math.random() - 0.5) * 0.03;
  let curB = bProb + (Math.random() - 0.5) * 0.06;
  const total = curA + curD + curB;
  curA /= total; curD /= total; curB /= total;
  for (let m = 0; m <= 90; m += 5) {
    const ev = events.find(e => e.min <= m + 2 && e.min >= m - 2);
    if (ev) {
      const swing = (Math.random() - 0.5) * 0.08;
      curA += swing * 0.7;
      curB -= swing * 0.7;
      if (Math.random() > 0.5) { curA += 0.02; curB -= 0.01; curD -= 0.01; }
      const t2 = curA + curD + curB;
      curA /= t2; curD /= t2; curB /= t2;
      points.push({ minute: m, a_prob: Math.max(0.05, Math.min(0.85, curA)), d_prob: Math.max(0.05, Math.min(0.4, curD)), b_prob: Math.max(0.05, Math.min(0.85, curB)), event: ev.label });
    } else {
      const drift = (Math.random() - 0.5) * 0.02;
      curA = Math.max(0.05, Math.min(0.85, curA + drift));
      curB = Math.max(0.05, Math.min(0.85, curB - drift * 0.5));
      curD = 1 - curA - curB;
      if (curD < 0.05) { curD = 0.05; const adj = (1 - 0.05) / (curA + curB); curA *= adj; curB *= adj; }
      points.push({ minute: m, a_prob: Math.round(curA * 1000) / 1000, d_prob: Math.round(curD * 1000) / 1000, b_prob: Math.round(curB * 1000) / 1000 });
    }
  }
  return points;
}
