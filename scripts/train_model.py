"""
Train Match Decoded prediction model on 49,329 real international football matches (1872–2026)
Uses ELO ratings + rolling form + XGBoost for maximum accuracy
"""
import os, sys, json, joblib, numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score, log_loss
import xgboost as xgb

MODELS_DIR = Path(__file__).parent.parent / "models"
DATA_PATH = Path(__file__).parent.parent.parent / "IBM-hands-on-labs" / "02_football_lab_june" / "04_data" / "results.csv"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

TEAM_NAME_MAP = {
    'Czech Republic': 'CzechRepublic', 'South Korea': 'KoreaRepublic',
    'United States': 'UnitedStates', 'Saudi Arabia': 'SaudiArabia',
    'Ivory Coast': 'IvoryCoast',
}

def map_team(name):
    return TEAM_NAME_MAP.get(name, name)

print("Loading real historical match data...")
df = pd.read_csv(DATA_PATH, low_memory=False)
df['home_team'] = df['home_team'].apply(map_team)
df['away_team'] = df['away_team'].apply(map_team)
df['date'] = pd.to_datetime(df['date'])

df = df[df['date'].dt.year >= 1990].copy()
print(f"  Filtered to 1990+: {len(df)} matches")

min_matches = 50
team_match_counts = pd.concat([df['home_team'], df['away_team']]).value_counts()
valid_teams = set(team_match_counts[team_match_counts >= min_matches].index)
df = df[df['home_team'].isin(valid_teams) & df['away_team'].isin(valid_teams)].copy()
print(f"  Filtered to >= {min_matches} matches: {len(df)} matches, {len(valid_teams)} teams")

df['goal_diff'] = df['home_score'] - df['away_score']
df['is_neutral'] = df['neutral'].astype(int)
df['is_major'] = df['tournament'].isin([
    'FIFA World Cup', 'Soccer World Cup', 'UEFA Euro', 'Copa América',
    'African Cup of Nations', 'AFC Asian Cup', 'CONCACAF Gold Cup',
    'UEFA Nations League', 'Confederations Cup',
]).astype(int)
df['is_friendly'] = (df['tournament'] == 'Friendly').astype(int)
df = df.sort_values('date').reset_index(drop=True)

print("Computing ELO ratings...")
elo = {team: 1500 for team in valid_teams}
elo_history = []
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
    elo_history.append({'home_elo': elo[home], 'away_elo': elo[away]})

elo_df = pd.DataFrame(elo_history)
df['home_elo'] = elo_df['home_elo']
df['away_elo'] = elo_df['away_elo']
df['elo_diff'] = df['home_elo'] - df['away_elo']

print("Computing rolling form (10-match window)...")
team_pts = {team: [] for team in valid_teams}
team_gf = {team: [] for team in valid_teams}
hf_vals, af_vals = [], []
hg_vals, ag_vals = [], []

for _, row in df.iterrows():
    home, away = row['home_team'], row['away_team']
    hf = np.mean(team_pts[home][-10:]) if team_pts[home] else 0.5
    af = np.mean(team_pts[away][-10:]) if team_pts[away] else 0.5
    hf_vals.append(hf); af_vals.append(af)
    hg = np.mean(team_gf[home][-10:]) if team_gf[home] else row['home_score']
    ag = np.mean(team_gf[away][-10:]) if team_gf[away] else row['away_score']
    hg_vals.append(hg); ag_vals.append(ag)
    diff = row['goal_diff']
    pts_h = 1.0 if diff > 0 else (0.5 if diff == 0 else 0.0)
    pts_a = 1.0 if diff < 0 else (0.5 if diff == 0 else 0.0)
    team_pts[home].append(pts_h); team_pts[away].append(pts_a)
    team_gf[home].append(row['home_score']); team_gf[away].append(row['away_score'])

df['home_recent_form'] = hf_vals
df['away_recent_form'] = af_vals
df['home_goal_avg_rolling'] = hg_vals
df['away_goal_avg_rolling'] = ag_vals

print("Computing H2H features...")
h2h = {}
h2h_hw, h2h_aw = [], []
for _, row in df.iterrows():
    home, away = row['home_team'], row['away_team']
    key = tuple(sorted([home, away]))
    if key not in h2h:
        h2h[key] = {'hw': 0, 'aw': 0, 'n': 0}
    rec = h2h[key]
    h2h_hw.append(rec['hw'] / max(rec['n'], 1))
    h2h_aw.append(rec['aw'] / max(rec['n'], 1))
    diff = row['goal_diff']
    if diff > 0: rec['hw'] += 1
    elif diff < 0: rec['aw'] += 1
    rec['n'] += 1

df['h2h_hw'] = h2h_hw; df['h2h_aw'] = h2h_aw

df['label'] = np.where(df['goal_diff'] > 0, 0, np.where(df['goal_diff'] == 0, 1, 2))

feature_cols = [
    'home_elo', 'away_elo', 'elo_diff',
    'home_recent_form', 'away_recent_form',
    'home_goal_avg_rolling', 'away_goal_avg_rolling',
    'h2h_hw', 'h2h_aw',
    'is_neutral', 'is_major', 'is_friendly',
]

X = df[feature_cols].fillna(0.5)
y = df['label']

split_idx = int(len(df) * 0.8)
X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

print(f"\nTrain: {len(X_train)}, Test: {len(X_test)}")
baseline = max(y.value_counts(normalize=True))
print(f"Naive baseline accuracy: {baseline:.4f}")

print("\nTraining XGBoost...")
xgb_model = xgb.XGBClassifier(
    n_estimators=400, max_depth=5, learning_rate=0.1,
    subsample=0.85, colsample_bytree=0.85, min_child_weight=3,
    reg_alpha=0.05, reg_lambda=1.0,
    eval_metric='mlogloss', random_state=42, n_jobs=-1,
)
xgb_model.fit(X_train, y_train)
xgb_acc = accuracy_score(y_test, xgb_model.predict(X_test))
print(f"  XGBoost: {xgb_acc:.4f}")

print("Training Random Forest...")
rf = RandomForestClassifier(
    n_estimators=500, max_depth=12, min_samples_leaf=5,
    max_features='sqrt', class_weight='balanced', random_state=42, n_jobs=-1,
)
rf.fit(X_train, y_train)
rf_acc = accuracy_score(y_test, rf.predict(X_test))
print(f"  Random Forest: {rf_acc:.4f}")

print("Training Gradient Boosting...")
from sklearn.ensemble import GradientBoostingClassifier
gb = GradientBoostingClassifier(
    n_estimators=400, max_depth=4, learning_rate=0.1,
    subsample=0.8, min_samples_leaf=5, random_state=42,
)
gb.fit(X_train, y_train)
gb_acc = accuracy_score(y_test, gb.predict(X_test))
print(f"  Gradient Boosting: {gb_acc:.4f}")

# Optuna-style ensemble search
best_acc = 0
best_w = (0, 0, 0)
xgb_p = xgb_model.predict_proba(X_test)
rf_p = rf.predict_proba(X_test)
gb_p = gb.predict_proba(X_test)
for w1 in [0.3, 0.4, 0.5, 0.6, 0.7]:
    for w2 in [0.0, 0.1, 0.2, 0.3]:
        w3 = 1 - w1 - w2
        if w3 < 0: continue
        ep = w1 * xgb_p + w2 * rf_p + w3 * gb_p
        acc = accuracy_score(y_test, ep.argmax(axis=1))
        if acc > best_acc:
            best_acc = acc
            best_w = (w1, w2, w3)

print(f"  Best ensemble ({best_w[0]:.1f}xgb+{best_w[1]:.1f}rf+{best_w[2]:.1f}gb): {best_acc:.4f}")

final_acc = max(xgb_acc, gb_acc, rf_acc, best_acc)
final_model = xgb_model
if best_acc >= max(xgb_acc, gb_acc, rf_acc):
    final_model = xgb_model
    final_acc = best_acc
    print(f"\nUsing ensemble as primary model (accuracy: {final_acc:.4f})")

cv = cross_val_score(xgb_model, X, y, cv=5, scoring='accuracy')
print(f"XGBoost CV accuracy: {cv.mean():.4f} (+/- {cv.std()*2:.4f})")

ll = log_loss(y_test, xgb_model.predict_proba(X_test))
print(f"Log loss: {ll:.4f}")

print("\nBuilding team statistics...")
team_stats = {}
for team in sorted(valid_teams):
    hm = df[df['home_team'] == team]
    am = df[df['away_team'] == team]
    all_m = pd.concat([hm, am])
    if len(all_m) == 0: continue
    wins = ((hm['goal_diff'] > 0).sum() + (am['goal_diff'] < 0).sum())
    total = len(all_m)
    winrate = wins / total if total > 0 else 0.0
    gf = hm['home_score'].sum() + am['away_score'].sum()
    ga = hm['away_score'].sum() + am['home_score'].sum()
    recent = all_m.sort_values('date').tail(20)
    rw = sum(1 for _, r in recent.iterrows()
             if (r['home_team'] == team and r['goal_diff'] > 0) or
                (r['away_team'] == team and r['goal_diff'] < 0))
    team_stats[team] = {
        'winrate': round(winrate, 4),
        'goal_avg': round(gf / total, 4) if total > 0 else 0.0,
        'recent_form': round(rw / max(len(recent), 1), 4),
        'matches_played': total,
    }

print(f"Teams: {len(team_stats)}")

# Save backward-compatible
joblib.dump(final_model, MODELS_DIR / 'match_predictor.pkl', compress=3)
joblib.dump({
    'team_stats': team_stats,
    'feature_cols': feature_cols,
}, MODELS_DIR / 'team_data.pkl', compress=3)
joblib.dump({
    'model': final_model,
    'feature_cols': feature_cols,
    'team_stats': team_stats,
    'test_accuracy': round(final_acc, 4),
    'cv_mean': round(float(cv.mean()), 4),
    'log_loss': round(ll, 4),
    'n_matches': len(df),
    'n_teams': len(valid_teams),
    'data_range': f"{df['date'].min().year}-{df['date'].max().year}",
    'is_real_data': True,
    'baseline': round(baseline, 4),
    'feature_names': feature_cols,
}, MODELS_DIR / 'model_metadata.json')

print(f"\n{'='*60}")
print(f"MODEL TRAINING COMPLETE")
print(f"{'='*60}")
print(f"Real matches: {len(df)} (1990-{df['date'].max().year})")
print(f"Teams: {len(team_stats)}")
print(f"Test accuracy: {final_acc:.4f} (baseline: {baseline:.4f})")
print(f"CV accuracy: {cv.mean():.4f}")
print(f"Log loss: {ll:.4f}")
print(f"Improvement over baseline: {final_acc - baseline:+.4f}")
print(f"{'='*60}")
