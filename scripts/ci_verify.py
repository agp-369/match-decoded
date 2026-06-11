"""CI verification script — validates model loads and metadata integrity."""
import sys, joblib
from pathlib import Path

sys.path.insert(0, '.')
models_dir = Path('models')

# Step 1: Verify model loads
from backend.model import predictor
predictor.load()
teams = predictor.get_team_names()
print(f'Model loaded: {len(teams)} teams')
assert len(teams) >= 49

r = predictor.predict('Brazil', 'Argentina', True, True)
total = r['team_a_win_prob'] + r['draw_prob'] + r['team_b_win_prob']
print(f'Brazil vs Argentina: {r["team_a_win_prob"]:.3f} / {r["draw_prob"]:.3f} / {r["team_b_win_prob"]:.3f} (sum={total:.3f})')
assert abs(total - 1.0) < 0.02
print('Model validation PASSED')

# Step 2: Verify training metadata
assert (models_dir / 'match_predictor.pkl').exists()
assert (models_dir / 'team_data.pkl').exists()
metadata = joblib.load(models_dir / 'model_metadata.json')
print(f'Accuracy: {metadata["test_accuracy"]}')
print(f'CV Mean: {metadata["cv_mean"]}')
print(f'Matches: {metadata["n_matches"]}')
print(f'Teams: {metadata["n_teams"]}')
print(f'Data Range: {metadata["data_range"]}')
assert metadata['n_matches'] >= 30000, 'Expected >=30k matches'
print('Training validation PASSED')
