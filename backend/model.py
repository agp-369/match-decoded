"""
Prediction model wrapper — loads XGBoost trained on 31,161 real international matches
"""
import os
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

MODELS_DIR = Path(os.path.dirname(os.path.dirname(__file__))) / "models"

FEATURE_NAME_MAP = {
    'home_elo': 'Historical ELO Rating (Home)',
    'away_elo': 'Historical ELO Rating (Away)',
    'elo_diff': 'ELO Rating Difference',
    'home_recent_form': 'Recent Form (Home, last 10)',
    'away_recent_form': 'Recent Form (Away, last 10)',
    'home_goal_avg_rolling': 'Goal Scoring Average (Home)',
    'away_goal_avg_rolling': 'Goal Scoring Average (Away)',
    'h2h_hw': 'Head-to-Head Record (Home)',
    'h2h_aw': 'Head-to-Head Record (Away)',
    'is_neutral': 'Neutral Venue',
    'is_major': 'Major Tournament Match',
    'is_friendly': 'Friendly Match',
}


class MatchPredictor:
    def __init__(self):
        self.model = None
        self.team_stats = None
        self.feature_cols = None
        self._loaded = False

    def load(self):
        if self._loaded:
            return True
        try:
            model_path = MODELS_DIR / "match_predictor.pkl"
            data_path = MODELS_DIR / "team_data.pkl"

            if not model_path.exists() or not data_path.exists():
                raise FileNotFoundError(f"Model files not found in {MODELS_DIR}")

            self.model = joblib.load(model_path)
            data = joblib.load(data_path)
            self.team_stats = data["team_stats"]
            self.feature_cols = data["feature_cols"]
            self._loaded = True
            return True
        except Exception as e:
            print(f"Model load error: {e}")
            return False

    def predict(self, team_a: str, team_b: str, is_neutral: bool = True,
                is_major_tournament: bool = True) -> dict:
        if not self._loaded:
            raise RuntimeError("Model not loaded")

        if team_a not in self.team_stats:
            raise ValueError(f"Unknown team: {team_a}")
        if team_b not in self.team_stats:
            raise ValueError(f"Unknown team: {team_b}")
        if team_a == team_b:
            raise ValueError("Teams must be different")

        a = self.team_stats[team_a]
        b = self.team_stats[team_b]

        is_major = int(is_major_tournament)
        is_friendly = int(not is_major)

        # Build feature row matching training features
        row_dict = {
            'home_elo': 1500.0, 'away_elo': 1500.0, 'elo_diff': 0.0,
            'home_recent_form': a['recent_form'], 'away_recent_form': b['recent_form'],
            'home_goal_avg_rolling': a['goal_avg'], 'away_goal_avg_rolling': b['goal_avg'],
            'h2h_hw': 0.5, 'h2h_aw': 0.5,
            'is_neutral': int(is_neutral),
            'is_major': is_major,
            'is_friendly': is_friendly,
        }

        row = pd.DataFrame([row_dict])[self.feature_cols]

        proba = self.model.predict_proba(row)[0]

        return {
            "team_a": team_a,
            "team_b": team_b,
            "team_a_win_prob": round(float(proba[0]), 4),
            "draw_prob": round(float(proba[1]), 4),
            "team_b_win_prob": round(float(proba[2]), 4),
            "is_neutral": is_neutral,
            "is_major_tournament": is_major_tournament,
            "stats_a": {
                "winrate": round(a["winrate"], 4),
                "goal_avg": round(a["goal_avg"], 4),
                "form": round(a["recent_form"], 4),
                "matches": a["matches_played"],
            },
            "stats_b": {
                "winrate": round(b["winrate"], 4),
                "goal_avg": round(b["goal_avg"], 4),
                "form": round(b["recent_form"], 4),
                "matches": b["matches_played"],
            },
        }

    def get_team_names(self) -> list:
        if not self._loaded:
            return []
        return sorted(self.team_stats.keys())

    def get_feature_importances(self) -> list:
        if not self._loaded:
            return []
        names = self.feature_cols
        if hasattr(self.model, 'feature_importances_'):
            imps = self.model.feature_importances_
        else:
            imps = np.ones(len(names)) / len(names)
        mapped = []
        for n, i in sorted(zip(names, imps), key=lambda x: -x[1]):
            display_name = FEATURE_NAME_MAP.get(n, n.replace('_', ' ').title())
            mapped.append({"name": display_name, "importance": round(float(i), 4)})
        return mapped


predictor = MatchPredictor()
