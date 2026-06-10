"""
Prediction model wrapper — loads Random Forest trained in the lab
"""
import os
import joblib
import pandas as pd
from pathlib import Path

MODELS_DIR = Path(os.path.dirname(os.path.dirname(__file__))) / "models"


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

        row = pd.DataFrame([{
            "team_a_winrate": a["winrate"],
            "team_b_winrate": b["winrate"],
            "team_a_goal_avg": a["goal_avg"],
            "team_b_goal_avg": b["goal_avg"],
            "team_a_recent_form": a["recent_form"],
            "team_b_recent_form": b["recent_form"],
            "is_neutral": int(is_neutral),
            "is_major_tournament": int(is_major_tournament),
        }])[self.feature_cols]

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
                "recent_form": round(a["recent_form"], 4),
                "matches_played": a["matches_played"],
            },
            "stats_b": {
                "winrate": round(b["winrate"], 4),
                "goal_avg": round(b["goal_avg"], 4),
                "recent_form": round(b["recent_form"], 4),
                "matches_played": b["matches_played"],
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
        imps = self.model.feature_importances_
        return [{"name": n, "importance": round(float(i), 4)}
                for n, i in sorted(zip(names, imps), key=lambda x: -x[1])]


# Singleton
predictor = MatchPredictor()
