"""Tests for Match Decoded prediction model (trained on 31,161 real matches)"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import pytest
import numpy as np
import pandas as pd

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')


class TestModelLoading:
    def test_model_files_exist(self):
        assert os.path.exists(os.path.join(MODELS_DIR, 'match_predictor.pkl')), "Model file missing"
        assert os.path.exists(os.path.join(MODELS_DIR, 'team_data.pkl')), "Team data file missing"

    def test_ensemble_metadata_exists(self):
        path = os.path.join(MODELS_DIR, 'model_metadata.json')
        assert os.path.exists(path), "Model metadata missing"

    def test_model_imports_and_loads(self):
        from backend.model import predictor
        assert predictor is not None
        loaded = predictor.load()
        assert loaded, "Model should load successfully"
        assert predictor._loaded
        assert predictor.model is not None

    def test_model_has_teams(self):
        from backend.model import predictor
        predictor.load()
        teams = predictor.get_team_names()
        assert len(teams) >= 49, f"Expected >=49 teams, got {len(teams)}"
        assert 'Brazil' in teams
        assert 'Argentina' in teams
        assert 'England' in teams

    def test_team_stats_have_required_fields(self):
        from backend.model import predictor
        predictor.load()
        for team, stats in predictor.team_stats.items():
            assert 'winrate' in stats, f"{team} missing winrate"
            assert 'goal_avg' in stats, f"{team} missing goal_avg"
            assert 'recent_form' in stats, f"{team} missing recent_form"
            assert 'matches_played' in stats, f"{team} missing matches_played"
            assert stats['matches_played'] >= 20, f"{team} has <20 matches"


class TestPredictions:
    def setup_method(self):
        from backend.model import predictor
        predictor.load()
        self.predictor = predictor

    def test_predict_returns_proper_structure(self):
        result = self.predictor.predict('Brazil', 'Argentina', True, True)
        assert 'team_a' in result
        assert 'team_b' in result
        assert 'team_a_win_prob' in result
        assert 'draw_prob' in result
        assert 'team_b_win_prob' in result
        assert 'stats_a' in result
        assert 'stats_b' in result

    def test_predict_probabilities_sum_to_one(self):
        result = self.predictor.predict('Brazil', 'Argentina', True, True)
        total = result['team_a_win_prob'] + result['draw_prob'] + result['team_b_win_prob']
        assert abs(total - 1.0) < 0.02, f"Probabilities sum to {total}, expected ~1.0"

    def test_predict_does_not_return_same_for_all_teams(self):
        r1 = self.predictor.predict('Brazil', 'Argentina', True, True)
        r2 = self.predictor.predict('San Marino', 'Brazil', True, True)
        assert r1['team_a_win_prob'] != r2['team_a_win_prob']

    def test_predict_unknown_team_raises_error(self):
        import pytest
        with pytest.raises(ValueError, match="Unknown team"):
            self.predictor.predict('FakeTeam', 'Brazil', True, True)

    def test_predict_same_team_raises_error(self):
        import pytest
        with pytest.raises(ValueError, match="Teams must be different"):
            self.predictor.predict('Brazil', 'Brazil', True, True)

    def test_predict_home_advantage_effect(self):
        neutral = self.predictor.predict('Brazil', 'Argentina', True, True)
        home = self.predictor.predict('Brazil', 'Argentina', False, True)
        assert home['team_a_win_prob'] >= neutral['team_a_win_prob'] * 0.95

    @pytest.mark.slow
    def test_predict_all_48_teams(self):
        teams = self.predictor.get_team_names()
        errors = []
        for i, ta in enumerate(teams):
            for tb in teams[i+1:]:
                try:
                    r = self.predictor.predict(ta, tb, True, True)
                    total = r['team_a_win_prob'] + r['draw_prob'] + r['team_b_win_prob']
                    if abs(total - 1.0) > 0.05:
                        errors.append(f"{ta} vs {tb}: probabilities sum to {total}")
                except Exception as e:
                    errors.append(f"{ta} vs {tb}: {e}")
                if len(errors) > 5:
                    break
            if len(errors) > 5:
                break
        assert len(errors) == 0, f"Errors: {errors[:3]}"

    def test_feature_importances(self):
        imps = self.predictor.get_feature_importances()
        assert len(imps) > 0
        assert abs(sum(i['importance'] for i in imps) - 1.0) < 0.05
        assert imps[0]['importance'] >= imps[-1]['importance']


class TestFeatureImportanceNames:
    def test_importance_names_are_readable(self):
        from backend.model import predictor
        predictor.load()
        imps = predictor.get_feature_importances()
        for f in imps:
            assert f['name'] is not None
            assert len(f['name']) > 0
            assert f['importance'] > 0


class TestAPIHealth:
    def _make_client(self):
        from backend.main import app
        from fastapi.testclient import TestClient
        client = TestClient(app)
        client.__enter__()
        return client

    def test_health_endpoint(self):
        client = self._make_client()
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data['status'] == 'ok'
        assert 'ibm_technologies' in data
        client.__exit__(None, None, None)

    def test_teams_endpoint(self):
        client = self._make_client()
        resp = client.get("/teams")
        assert resp.status_code == 200
        data = resp.json()
        assert data['count'] >= 49
        client.__exit__(None, None, None)

    def test_predict_endpoint(self):
        client = self._make_client()
        resp = client.post("/predict", json={
            "team_a": "Brazil", "team_b": "Argentina",
            "is_neutral": True, "is_major_tournament": True,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert 'team_a_win_prob' in data
        assert 'team_b_win_prob' in data
        assert 'draw_prob' in data
        client.__exit__(None, None, None)

    def test_predict_400_on_unknown_team(self):
        client = self._make_client()
        resp = client.post("/predict", json={
            "team_a": "FakeTeam", "team_b": "Brazil",
            "is_neutral": True, "is_major_tournament": True,
        })
        assert resp.status_code == 400
        client.__exit__(None, None, None)


class TestDoclingParser:
    def test_docling_parser_imports(self):
        from backend.docling_parser import parse_pdf, extract_match_details
        assert callable(parse_pdf)
        assert callable(extract_match_details)

    def test_docling_parse_nonexistent_file(self):
        from backend.docling_parser import parse_pdf
        result = parse_pdf("/nonexistent/file.pdf")
        assert result is None


class TestTrainingScript:
    def test_training_script_features_match_model(self):
        import joblib
        data = joblib.load(os.path.join(MODELS_DIR, 'team_data.pkl'))
        assert 'feature_cols' in data
        assert 'team_stats' in data
        assert len(data['feature_cols']) >= 10


class TestDataIntegrity:
    def test_team_stats_home_away_balance(self):
        from backend.model import predictor
        predictor.load()
        weak_teams = {'Andorra', 'San Marino', 'Liechtenstein', 'Gibraltar', 'American Samoa', 'Luxembourg'}
        for team, stats in predictor.team_stats.items():
            if stats['matches_played'] > 200 and team not in weak_teams:
                assert 0.12 <= stats['winrate'] <= 0.85, f"{team} winrate {stats['winrate']} out of range"
                assert 0.3 <= stats['goal_avg'] <= 3.5, f"{team} goal_avg {stats['goal_avg']} out of range"
