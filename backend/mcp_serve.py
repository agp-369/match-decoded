"""
Context Forge MCP Server — Match Decoded
Exposes team stats, match predictions, and head-to-head data via Model Context Protocol.
AI agents can query this server for rich football context.
"""
import os
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import joblib
import pandas as pd
import numpy as np
from mcp.server.fastmcp import FastMCP

MODELS_DIR = Path(__file__).parent.parent / "models"

mcp = FastMCP(
    "Context Forge — Match Decoded",
    instructions="Football team stats, match predictions, and head-to-head data powered by 31,161 real international matches",
)


def _load_data():
    """Load model and team data."""
    data_path = MODELS_DIR / "team_data.pkl"
    model_path = MODELS_DIR / "match_predictor.pkl"
    if not data_path.exists() or not model_path.exists():
        return None, None, None
    try:
        data = joblib.load(data_path)
        model = joblib.load(model_path)
        return model, data.get("team_stats"), data.get("feature_cols")
    except Exception:
        return None, None, None


MODEL, TEAM_STATS, FEATURE_COLS = _load_data()
TEAM_NAMES = sorted(TEAM_STATS.keys()) if TEAM_STATS else []

def _load_elo_h2h():
    """Load ELO ratings and H2H matrix from team_data.pkl."""
    data_path = MODELS_DIR / "team_data.pkl"
    if not data_path.exists():
        return {}, {}
    try:
        data = joblib.load(data_path)
        return data.get("elo_ratings", {}), data.get("h2h_matrix", {})
    except Exception:
        return {}, {}

ELO_RATINGS, H2H_MATRIX = _load_elo_h2h()

def _get_h2h(team_a: str, team_b: str) -> tuple[float, float]:
    """Look up H2H win rates from precomputed matrix."""
    key = tuple(sorted([team_a, team_b]))
    lookup_key = f"{key[0]}||{key[1]}"
    rec = H2H_MATRIX.get(lookup_key)
    if not rec or rec['n'] == 0:
        return 0.5, 0.5
    is_a_home = (key[0] == team_a)
    if is_a_home:
        return rec['hw'] / rec['n'], rec['aw'] / rec['n']
    else:
        return rec['aw'] / rec['n'], rec['hw'] / rec['n']


@mcp.tool(
    name="list_teams",
    description="List all available international football teams in the dataset (224 teams)",
)
def list_teams() -> str:
    """Return a comma-separated list of all available team names."""
    if not TEAM_NAMES:
        return "No team data available. Model not loaded."
    return ", ".join(TEAM_NAMES)


@mcp.tool(
    name="get_team_stats",
    description="Get detailed statistics for a specific international football team",
)
def get_team_stats(team_name: str) -> str:
    """Return winrate, goal average, recent form, and total matches for a team."""
    if not TEAM_STATS:
        return "Team data not loaded."
    if team_name not in TEAM_STATS:
        similar = [t for t in TEAM_NAMES if team_name.lower() in t.lower()][:5]
        hint = f" Did you mean: {', '.join(similar)}?" if similar else ""
        return f"Team '{team_name}' not found.{hint}"
    s = TEAM_STATS[team_name]
    elo_val = ELO_RATINGS.get(team_name, s.get('elo', 1500))
    return json.dumps({
        "team": team_name,
        "winrate": round(s["winrate"], 4),
        "goal_avg": round(s["goal_avg"], 4),
        "recent_form": round(s["recent_form"], 4),
        "matches_played": s["matches_played"],
        "elo": round(elo_val, 1),
    }, indent=2)


@mcp.tool(
    name="compare_teams",
    description="Compare two teams side-by-side with their stats and a predicted match outcome",
)
def compare_teams(team_a: str, team_b: str, is_neutral: bool = True, is_major_tournament: bool = True) -> str:
    """Head-to-head comparison with predicted probabilities."""
    if not TEAM_STATS or MODEL is None:
        return "Model data not loaded."
    for t in [team_a, team_b]:
        if t not in TEAM_STATS:
            return f"Team '{t}' not found."
    if team_a == team_b:
        return "Cannot compare a team with itself."

    a = TEAM_STATS[team_a]
    b = TEAM_STATS[team_b]
    is_major = int(is_major_tournament)
    is_friendly = int(not is_major)

    home_elo = ELO_RATINGS.get(team_a, a.get('elo', 1500.0))
    away_elo = ELO_RATINGS.get(team_b, b.get('elo', 1500.0))
    h2h_hw, h2h_aw = _get_h2h(team_a, team_b)

    row_dict = {
        "home_elo": home_elo, "away_elo": away_elo, "elo_diff": home_elo - away_elo,
        "home_recent_form": a["recent_form"], "away_recent_form": b["recent_form"],
        "home_goal_avg_rolling": a["goal_avg"], "away_goal_avg_rolling": b["goal_avg"],
        "h2h_hw": h2h_hw, "h2h_aw": h2h_aw,
        "is_neutral": int(is_neutral),
        "is_major": is_major,
        "is_friendly": is_friendly,
    }
    row = pd.DataFrame([row_dict])[FEATURE_COLS]
    proba = MODEL.predict_proba(row)[0]

    return json.dumps({
        "team_a": {"name": team_a, "winrate": round(a["winrate"], 4),
                   "goal_avg": round(a["goal_avg"], 4), "form": round(a["recent_form"], 4),
                   "matches": a["matches_played"], "elo": round(home_elo, 1)},
        "team_b": {"name": team_b, "winrate": round(b["winrate"], 4),
                   "goal_avg": round(b["goal_avg"], 4), "form": round(b["recent_form"], 4),
                   "matches": b["matches_played"], "elo": round(away_elo, 1)},
        "prediction": {
            f"{team_a}_win_prob": round(float(proba[0]), 4),
            "draw_prob": round(float(proba[1]), 4),
            f"{team_b}_win_prob": round(float(proba[2]), 4),
        },
        "h2h": {"home_win_rate": round(h2h_hw, 4), "away_win_rate": round(h2h_aw, 4)},
        "context": {
            "is_neutral": is_neutral,
            "is_major_tournament": is_major_tournament,
        }
    }, indent=2)


@mcp.tool(
    name="feature_importances",
    description="Show which features the model considers most important for predictions",
)
def feature_importances() -> str:
    """Return model feature importances sorted by impact."""
    if MODEL is None or not FEATURE_COLS:
        return "Model not loaded."
    if not hasattr(MODEL, "feature_importances_"):
        return "Feature importances not available for this model."

    FEATURE_NAME_MAP = {
        "home_elo": "Historical ELO Rating (Home)",
        "away_elo": "Historical ELO Rating (Away)",
        "elo_diff": "ELO Rating Difference",
        "home_recent_form": "Recent Form (Home, last 10)",
        "away_recent_form": "Recent Form (Away, last 10)",
        "home_goal_avg_rolling": "Goal Scoring Average (Home)",
        "away_goal_avg_rolling": "Goal Scoring Average (Away)",
        "h2h_hw": "Head-to-Head Record (Home)",
        "h2h_aw": "Head-to-Head Record (Away)",
        "is_neutral": "Neutral Venue",
        "is_major": "Major Tournament Match",
        "is_friendly": "Friendly Match",
    }

    imps = MODEL.feature_importances_
    results = []
    for n, i in sorted(zip(FEATURE_COLS, imps), key=lambda x: -x[1]):
        display_name = FEATURE_NAME_MAP.get(n, n.replace("_", " ").title())
        results.append({"feature": display_name, "importance": round(float(i), 4)})
    return json.dumps({"feature_importances": results}, indent=2)


@mcp.tool(
    name="data_summary",
    description="Get summary statistics about the dataset powering Match Decoded predictions",
)
def data_summary() -> str:
    """Return dataset size, accuracy, and team count."""
    if not TEAM_STATS:
        return "No data loaded."
    team_count = len(TEAM_STATS)
    total_matches = sum(s.get("matches_played", 0) for s in TEAM_STATS.values())
    avg_winrate = np.mean([s["winrate"] for s in TEAM_STATS.values()])
    return json.dumps({
        "dataset": "31,161 real international matches (1990-2026)",
        "teams_count": team_count,
        "total_team_matches": total_matches,
        "unique_matches": total_matches // 2,
        "average_winrate": round(float(avg_winrate), 4),
        "model_accuracy": "66.6% (XGBoost ensemble, 3-class)",
        "provider": "Context Forge MCP — Match Decoded",
        "note": "total_team_matches double-counts each match (once per team); unique_matches is the true count",
    }, indent=2)


if __name__ == "__main__":
    print(f"Context Forge MCP Server — Match Decoded")
    print(f"Teams loaded: {len(TEAM_NAMES)}")
    print(f"Model loaded: {MODEL is not None}")
    print("Starting server...")
    mcp.run(transport="stdio")
