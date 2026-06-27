"""
Compute ELO ratings and H2H matrix from historical match data for inference.
Patches team_data.pkl with real feature values so predictions are not using defaults.
"""
import os, sys, json, joblib
import numpy as np
import pandas as pd
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

MODELS_DIR = Path(__file__).parent.parent / "models"
DATA_PATH = Path(__file__).parent.parent.parent / "IBM-hands-on-labs" / "02_football_lab_june" / "04_data" / "results.csv"

TEAM_NAME_MAP = {
    'Czech Republic': 'CzechRepublic', 'South Korea': 'KoreaRepublic',
    'United States': 'UnitedStates', 'Saudi Arabia': 'SaudiArabia',
    'Ivory Coast': 'IvoryCoast',
}

def map_team(name):
    return TEAM_NAME_MAP.get(name, name)

print("Loading existing model data...")
data = joblib.load(MODELS_DIR / "team_data.pkl")
team_stats = data["team_stats"]
valid_teams = set(team_stats.keys())
print(f"  {len(valid_teams)} teams loaded")

print("Loading historical matches...")
df = pd.read_csv(DATA_PATH, low_memory=False)
df['home_team'] = df['home_team'].apply(map_team)
df['away_team'] = df['away_team'].apply(map_team)
df['date'] = pd.to_datetime(df['date'])
df = df[df['date'].dt.year >= 1990].copy()
df = df[df['home_team'].isin(valid_teams) & df['away_team'].isin(valid_teams)].copy()
df['goal_diff'] = df['home_score'] - df['away_score']
df = df.dropna(subset=['goal_diff']).copy()
df = df.sort_values('date').reset_index(drop=True)
print(f"  {len(df)} matches loaded (after dropping NaN scores)")

print("Computing final ELO ratings...")
elo = {team: 1500 for team in valid_teams}
for i, row in df.iterrows():
    home, away = row['home_team'], row['away_team']
    elo_h, elo_a = elo[home], elo[away]
    expected_h = 1 / (1 + 10 ** ((elo_a - elo_h) / 400))
    expected_a = 1 - expected_h
    actual_h = 1.0 if row['goal_diff'] > 0 else (0.5 if row['goal_diff'] == 0 else 0.0)
    actual_a = 1.0 if row['goal_diff'] < 0 else (0.5 if row['goal_diff'] == 0 else 0.0)
    margin = min(abs(row['goal_diff']), 6)
    K = 32 * (1 + np.log1p(margin))
    elo[home] += K * (actual_h - expected_h)
    elo[away] += K * (actual_a - expected_a)

for team in valid_teams:
    if team in team_stats:
        team_stats[team]['elo'] = round(elo[team], 1)

print("Computing H2H matrix...")
h2h = {}
for _, row in df.iterrows():
    home, away = row['home_team'], row['away_team']
    key = tuple(sorted([home, away]))
    if key not in h2h:
        h2h[key] = {'hw': 0, 'aw': 0, 'n': 0}
    rec = h2h[key]
    diff = row['goal_diff']
    if diff > 0: rec['hw'] += 1
    elif diff < 0: rec['aw'] += 1
    rec['n'] += 1

data['elo_ratings'] = {team: round(elo[team], 1) for team in valid_teams}
data['h2h_matrix'] = {f"{k[0]}||{k[1]}": v for k, v in h2h.items()}

joblib.dump(data, MODELS_DIR / "team_data.pkl", compress=3)
print(f"  Saved {len(h2h)} H2H pairs, {len(elo)} ELO ratings")

print("Verifying sample predictions:")
from model import MatchPredictor
p = MatchPredictor()
p.load()
for ta, tb in [("Brazil", "England"), ("Argentina", "France"), ("Germany", "Spain")]:
    r = p.predict(ta, tb)
    s = p.team_stats
    print(f"  {ta} vs {tb}: elo={s[ta].get('elo', 1500):.0f}/{s[tb].get('elo', 1500):.0f}, "
          f"h2h_hw={r.get('h2h_hw', 0.5):.3f}, h2h_aw={r.get('h2h_aw', 0.5):.3f}, win={r['team_a_win_prob']:.3f}")
