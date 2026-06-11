"""
Generate model files for Match Decoded backend (run once before deployment)
Creates match_predictor.pkl and team_data.pkl in the models/ directory
"""
import os, sys, json, joblib, numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

TEAM_STATS = {
  'Argentina': [0.552, 1.89, 0.60, 1069], 'Australia': [0.380, 1.35, 0.40, 625],
  'Austria': [0.428, 1.58, 0.50, 832], 'Belgium': [0.525, 1.82, 0.65, 812],
  'Brazil': [0.632, 2.17, 0.30, 1060], 'Cameroon': [0.385, 1.28, 0.35, 568],
  'Canada': [0.342, 1.22, 0.45, 412], 'Chile': [0.445, 1.52, 0.40, 798],
  'Colombia': [0.472, 1.55, 0.50, 682], 'Croatia': [0.468, 1.62, 0.60, 538],
  'CzechRepublic': [0.465, 1.58, 0.40, 742], 'Denmark': [0.478, 1.72, 0.55, 688],
  'Ecuador': [0.412, 1.42, 0.50, 562], 'Egypt': [0.445, 1.48, 0.55, 698],
  'England': [0.523, 1.88, 0.60, 1050], 'France': [0.538, 1.95, 0.70, 870],
  'Germany': [0.578, 2.24, 0.50, 1032], 'Ghana': [0.395, 1.32, 0.35, 542],
  'Greece': [0.408, 1.38, 0.40, 612], 'Hungary': [0.435, 1.55, 0.35, 898],
  'Iceland': [0.365, 1.25, 0.35, 382], 'Iran': [0.395, 1.30, 0.50, 612],
  'Italy': [0.525, 1.68, 0.45, 942], 'IvoryCoast': [0.418, 1.42, 0.40, 528],
  'Japan': [0.435, 1.48, 0.55, 682], 'KoreaRepublic': [0.412, 1.42, 0.40, 712],
  'Mexico': [0.462, 1.55, 0.50, 868], 'Morocco': [0.415, 1.38, 0.60, 558],
  'Netherlands': [0.515, 1.92, 0.55, 799], 'Nigeria': [0.428, 1.45, 0.40, 612],
  'Norway': [0.412, 1.52, 0.35, 742], 'Paraguay': [0.398, 1.35, 0.35, 688],
  'Peru': [0.405, 1.38, 0.40, 632], 'Poland': [0.445, 1.55, 0.50, 848],
  'Portugal': [0.482, 1.65, 0.60, 683], 'Romania': [0.425, 1.48, 0.35, 722],
  'Russia': [0.445, 1.52, 0.40, 612], 'SaudiArabia': [0.355, 1.18, 0.35, 548],
  'Scotland': [0.395, 1.42, 0.35, 748], 'Senegal': [0.428, 1.42, 0.50, 498],
  'Serbia': [0.435, 1.52, 0.45, 618], 'Spain': [0.510, 1.72, 0.55, 956],
  'Sweden': [0.448, 1.58, 0.40, 798], 'Switzerland': [0.455, 1.55, 0.50, 712],
  'Turkey': [0.425, 1.48, 0.45, 598], 'Ukraine': [0.418, 1.42, 0.45, 528],
  'UnitedStates': [0.428, 1.48, 0.55, 742], 'Uruguay': [0.540, 1.82, 0.40, 642],
  'Wales': [0.375, 1.32, 0.40, 612],
}

np.random.seed(42)
rows = []
teams = list(TEAM_STATS.keys())
for _ in range(50000):
    ta, tb = np.random.choice(teams, 2, replace=False)
    sa, sb = TEAM_STATS[ta], TEAM_STATS[tb]
    is_n = int(np.random.random() > 0.6)
    is_m = int(np.random.random() > 0.7)
    score_a = sa[0] * 3 + sa[1] * 0.5 + sa[2] * 0.3
    score_b = sb[0] * 3 + sb[1] * 0.5 + sb[2] * 0.3
    if is_n: score_a *= 0.95
    if is_m: score_a *= 1.02; score_b *= 1.02
    total = score_a + score_b + 1
    pa, pd_, pb = score_a / total, 1 / total, score_b / total
    r = np.random.random()
    if r < pa: label = 0
    elif r < pa + pd_: label = 1
    else: label = 2
    rows.append({ 'team_a': ta, 'team_b': tb, 'team_a_winrate': sa[0], 'team_b_winrate': sb[0],
      'team_a_goal_avg': sa[1], 'team_b_goal_avg': sb[1], 'team_a_recent_form': sa[2],
      'team_b_recent_form': sb[2], 'is_neutral': is_n, 'is_major_tournament': is_m, 'label': label })

data = pd.DataFrame(rows)
feature_cols = ['team_a_winrate', 'team_b_winrate', 'team_a_goal_avg', 'team_b_goal_avg',
                'team_a_recent_form', 'team_b_recent_form', 'is_neutral', 'is_major_tournament']
X = data[feature_cols]
y = data['label']

model = RandomForestClassifier(n_estimators=80, max_depth=10, random_state=42, n_jobs=-1, min_samples_leaf=5)
model.fit(X, y)
acc = model.score(X, y)
print(f"Model trained. Accuracy: {acc:.3f}")

team_stats = {}
for name, stats in TEAM_STATS.items():
    team_stats[name] = { 'winrate': stats[0], 'goal_avg': stats[1], 'recent_form': stats[2], 'matches_played': stats[3] }

joblib.dump(model, os.path.join(MODELS_DIR, 'match_predictor.pkl'), compress=3)
joblib.dump({ 'team_stats': team_stats, 'feature_cols': feature_cols }, os.path.join(MODELS_DIR, 'team_data.pkl'), compress=3)
print(f"Files saved to {MODELS_DIR}/")
print(f"Teams: {len(team_stats)}")
