"""
FastAPI backend — Match Decoded API
IBM Technologies: Granite (watsonx.ai) + LangChain + Docling + IBM Bob
Multilingual: EN, ES, FR, PT, DE
"""
import os
import sys
import tempfile
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import numpy as np
import json
import hashlib

from model import predictor
from granite import (
    generate_preview, generate_explain, generate_momentum, generate_tactical,
    generate_var_explanation, generate_story,
    generate_docling_analysis, generate_legends, generate_teach,
    generate_tactical_stream, generate_preview_stream,
    generate_explain_stream, generate_momentum_stream,
    generate_var_stream, generate_story_stream,
    generate_legends_stream, generate_teach_stream,
    AI_AVAILABLE, WATSONX_AVAILABLE, HF_AVAILABLE, LANG_NAMES,
)
from docling_parser import extract_match_details
from simulate import simulate_match_stream
from fastapi.responses import StreamingResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    loaded = predictor.load()
    print(f"Model loaded: {loaded}, teams: {len(predictor.get_team_names()) if loaded else 0}")
    print(f"AI providers — watsonx.ai: {WATSONX_AVAILABLE}, HuggingFace: {HF_AVAILABLE}")
    if AI_AVAILABLE:
        provider = "watsonx.ai" if WATSONX_AVAILABLE else "HuggingFace Inference API"
        print(f"  Active provider: {provider} (model: ibm/granite-3-8b-instruct)")
    else:
        print("  WARNING: No AI credentials set. AI narrative features will return 503.")
        print("  Set WATSONX_API_KEY+WATSONX_PROJECT_ID or HF_TOKEN.")
    yield


app = FastAPI(
    title="Match Decoded API",
    description="AI-powered football match explainability — IBM Granite (watsonx.ai) + LangChain + Docling",
    version="3.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    team_a: str
    team_b: str
    is_neutral: bool = True
    is_major_tournament: bool = True


class ExplainRequest(BaseModel):
    team_a: str
    team_b: str
    is_neutral: bool = True
    is_major_tournament: bool = True
    lang: str = "en"


class LegendsRequest(BaseModel):
    team_a: str
    team_b: str
    era_a: str = "Modern era"
    era_b: str = "Modern era"
    lang: str = "en"


class VARRequest(BaseModel):
    team_a: str = "Brazil"
    team_b: str = "Argentina"
    scenario: str = "A goal is disallowed for offside after a 3-minute VAR review"
    lang: str = "en"


def _ensure_ai():
    if not AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI narrative unavailable. Set WATSONX_API_KEY+WATSONX_PROJECT_ID (IBM watsonx.ai) or HF_TOKEN (HuggingFace, free) to enable.")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": predictor._loaded,
        "teams_available": len(predictor.get_team_names()),
        "ai_available": AI_AVAILABLE,
        "active_provider": "watsonx.ai" if WATSONX_AVAILABLE else "HuggingFace Inference API" if HF_AVAILABLE else "none",
        "data_source": "31,161 real international matches (1990-2026)",
        "model_accuracy": "66.6% (XGBoost ensemble, 3-class)",
        "languages_supported": list(LANG_NAMES.keys()),
        "ibm_technologies": [
            "IBM Granite 3-8B (watsonx.ai + HuggingFace Inference API)",
            "LangChain (prompt templates)",
            "IBM Docling (PDF parsing)",
            "IBM Bob (code assistant)",
        ],
    }


@app.get("/teams")
def list_teams():
    names = predictor.get_team_names()
    return {"teams": names, "count": len(names)}

@app.get("/teams/detail")
def list_teams_detail():
    if not predictor._loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    teams = []
    for name in sorted(predictor.team_stats.keys()):
        s = predictor.team_stats[name]
        teams.append({
            "name": name,
            "winrate": round(s["winrate"], 4),
            "goal_avg": round(s["goal_avg"], 4),
            "form": round(s["recent_form"], 4),
            "matches": s["matches_played"],
        })
    return {"teams": teams, "count": len(teams)}

@app.get("/worldcup/groups")
def worldcup_groups():
    top_nations = [
        "Argentina", "Brazil", "England", "France", "Germany", "Spain",
        "Portugal", "Netherlands", "Belgium", "Croatia", "Italy", "Uruguay",
        "Japan", "Korea Republic", "United States", "Mexico",
    ]
    groups = {"A": [], "B": [], "C": [], "D": []}
    for i, team in enumerate(top_nations):
        g = list(groups.keys())[i % 4]
        if predictor._loaded and team in predictor.team_stats:
            s = predictor.team_stats[team]
            groups[g].append({
                "name": team,
                "winrate": round(s["winrate"], 4),
                "goal_avg": round(s["goal_avg"], 4),
                "form": round(s["recent_form"], 4),
                "matches": s["matches_played"],
                "elo": round(s.get("elo", 1500)),
            })
        else:
            groups[g].append({"name": team, "winrate": 0.5, "goal_avg": 1.5, "form": 0.5, "matches": 500, "elo": 1500})
    return {"groups": groups, "total_teams": len(top_nations)}

@app.post("/worldcup/predict")
def worldcup_predict(req: PredictRequest):
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
        result["round"] = "Group Stage"
        result["stage"] = "World Cup 2026"
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=f"Model not loaded: {e}")


@app.post("/predict")
def predict_match(req: PredictRequest):
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=f"Model not loaded: {e}")


def _ai_generate(fn, *args, **kwargs):
    """Call an AI generation function with error handling."""
    _ensure_ai()
    try:
        return fn(*args, **kwargs)
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        raise HTTPException(status_code=503, detail=f"AI generation failed: {e}")

@app.post("/explain/preview")
def preview_match(req: ExplainRequest):
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    narrative = _ai_generate(generate_preview,
        result["team_a"], result["team_b"],
        result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
        result["stats_a"], result["stats_b"],
        result["is_neutral"], result["is_major_tournament"],
        lang=req.lang,
    )
    return {"prediction": result, "narrative": narrative}


@app.post("/explain/decision")
def explain_decision(req: ExplainRequest):
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    importances = predictor.get_feature_importances()
    top_features = [f["name"] for f in importances[:3]]
    explanation = _ai_generate(generate_explain,
        result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
        result["stats_a"], result["stats_b"],
        top_features, lang=req.lang,
    )
    return {
        "prediction": result,
        "explanation": explanation,
        "feature_importances": importances,
    }


class MomentumSimRequest(BaseModel):
    team_a: str
    team_b: str
    is_neutral: bool = True
    is_major_tournament: bool = True

@app.post("/simulate/momentum")
def simulate_momentum(req: MomentumSimRequest):
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    pa, pd, pb = result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"]
    rng = np.random.RandomState(abs(hash(req.team_a + req.team_b + str(req.is_neutral))) % (2**31))
    points = []
    cur_a, cur_d, cur_b = pa, pd, pb
    event_templates = [
        "Early possession", "First shot on target", "Yellow card (tactical foul)",
        "Corner kick danger", "VAR check", "Injury stoppage",
        "Half-time tactical shift", "Second-half intensity", "Breakaway chance",
        "Red card (second yellow)", "Defensive reshuffle", "Late substitution",
        "Free kick opportunity", "Penalty shout waved off", "Goal-line clearance",
        "Counter-attack", "Set piece prepared", "Long-range effort",
    ]
    indices = rng.choice(len(event_templates), size=6, replace=False)
    events = sorted([
        {"minute": int(rng.randint(5, 86)), "event": event_templates[i]}
        for i in indices
    ], key=lambda x: x["minute"])

    swing = (abs(pa - pb) + 0.05) * 0.06
    for m in range(0, 91, 5):
        ev = next((e for e in events if abs(e["minute"] - m) <= 3), None)
        if ev:
            direction = 1 if rng.rand() > 0.5 else -1
            shift = swing * (0.5 + rng.rand() * 0.5)
            if rng.rand() > 0.3:
                cur_a = max(0.05, min(0.85, cur_a + direction * shift * 0.7))
                cur_b = max(0.05, min(0.85, cur_b - direction * shift * 0.3))
            else:
                cur_b = max(0.05, min(0.85, cur_b + direction * shift * 0.7))
                cur_a = max(0.05, min(0.85, cur_a - direction * shift * 0.3))
            cur_d = max(0.05, 1 - cur_a - cur_b)
            if cur_d < 0.05: cur_d = 0.05; total = cur_a + cur_b + cur_d; cur_a /= total; cur_b /= total; cur_d /= total
            points.append({
                "minute": m, "a_prob": round(cur_a, 4), "d_prob": round(cur_d, 4),
                "b_prob": round(cur_b, 4), "event": ev["event"],
            })
        else:
            drift = rng.randn() * 0.008
            cur_a = max(0.05, min(0.85, cur_a + drift))
            cur_d = max(0.05, min(0.4, cur_d - drift * 0.3))
            cur_b = max(0.05, min(0.85, 1 - cur_a - cur_d))
            points.append({
                "minute": m, "a_prob": round(cur_a, 4), "d_prob": round(cur_d, 4),
                "b_prob": round(cur_b, 4),
            })
    return {"prediction": result, "momentum": points}

class TeachRequest(BaseModel):
    question: str = "How does offside work?"
    lang: str = "en"


class SimulateMatchRequest(BaseModel):
    team_a: str
    team_b: str
    is_neutral: bool = True
    is_major_tournament: bool = True

@app.post("/simulate/match")
async def simulate_match(req: SimulateMatchRequest):
    """SSE endpoint: live 90-minute match simulation with Granite commentary."""
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    seed = int(hashlib.md5(f"{req.team_a}:{req.team_b}:{req.is_neutral}".encode()).hexdigest()[:8], 16)
    prob_a = result["team_a_win_prob"]
    prob_b = result["team_b_win_prob"]
    stats_a = result["stats_a"]
    stats_b = result["stats_b"]

    return StreamingResponse(
        simulate_match_stream(req.team_a, req.team_b, prob_a, prob_b, stats_a, stats_b, seed),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@app.post("/explain/momentum")
def momentum_analysis(req: ExplainRequest):
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    analysis = _ai_generate(generate_momentum,
        result["team_a"], result["team_b"],
        result["team_a_win_prob"], result["team_b_win_prob"],
        lang=req.lang,
    )
    return {"prediction": result, "analysis": analysis}


@app.post("/explain/tactical")
def tactical_analysis(req: ExplainRequest):
    """Addresses: WHY did a tactical change succeed or fail? HOW might the match unfold?"""
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    analysis = _ai_generate(generate_tactical,
        req.team_a, req.team_b,
        result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
        result["stats_a"], result["stats_b"],
        result["is_neutral"], result["is_major_tournament"],
        lang=req.lang,
    )
    return {"prediction": result, "analysis": analysis}


def _event_stream(gen):
    """Wrap a token generator into SSE events."""
    try:
        for token in gen:
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@app.post("/explain/stream/tactical")
def tactical_analysis_stream(req: ExplainRequest):
    """SSE streaming version of tactical analysis."""
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    _ensure_ai()
    return StreamingResponse(
        _event_stream(generate_tactical_stream(
            req.team_a, req.team_b,
            result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
            result["stats_a"], result["stats_b"],
            result["is_neutral"], result["is_major_tournament"],
            lang=req.lang,
        )),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@app.post("/explain/stream/preview")
def preview_match_stream(req: ExplainRequest):
    """SSE streaming version of pre-match preview."""
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    _ensure_ai()
    return StreamingResponse(
        _event_stream(generate_preview_stream(
            result["team_a"], result["team_b"],
            result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
            result["stats_a"], result["stats_b"],
            result["is_neutral"], result["is_major_tournament"],
            lang=req.lang,
        )),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@app.post("/explain/stream/decision")
def explain_decision_stream(req: ExplainRequest):
    """SSE streaming version of decision trace."""
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    _ensure_ai()
    importances = predictor.get_feature_importances()
    top_features = [f["name"] for f in importances[:3]]
    return StreamingResponse(
        _event_stream(generate_explain_stream(
            result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
            result["stats_a"], result["stats_b"],
            top_features, lang=req.lang,
        )),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@app.post("/explain/stream/momentum")
def momentum_analysis_stream(req: ExplainRequest):
    """SSE streaming version of momentum analysis."""
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    _ensure_ai()
    return StreamingResponse(
        _event_stream(generate_momentum_stream(
            result["team_a"], result["team_b"],
            result["team_a_win_prob"], result["team_b_win_prob"],
            lang=req.lang,
        )),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@app.post("/explain/stream/var")
def var_explanation_stream(req: VARRequest):
    """SSE streaming version of VAR explained."""
    _ensure_ai()
    return StreamingResponse(
        _event_stream(generate_var_stream(req.team_a, req.team_b, req.scenario, lang=req.lang)),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@app.post("/explain/stream/story")
def match_story_stream(req: ExplainRequest):
    """SSE streaming version of match story."""
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    _ensure_ai()
    return StreamingResponse(
        _event_stream(generate_story_stream(
            req.team_a, req.team_b,
            result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
            result["stats_a"], result["stats_b"],
            result["is_neutral"], result["is_major_tournament"],
            lang=req.lang,
        )),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@app.post("/explain/stream/legends")
def legends_matchup_stream(req: LegendsRequest):
    """SSE streaming version of legends matchup."""
    _ensure_ai()
    try:
        if req.team_a not in predictor.team_stats:
            raise HTTPException(status_code=400, detail=f"Unknown team: {req.team_a}")
        if req.team_b not in predictor.team_stats:
            raise HTTPException(status_code=400, detail=f"Unknown team: {req.team_b}")
        stats_a = predictor.team_stats[req.team_a]
        stats_b = predictor.team_stats[req.team_b]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    return StreamingResponse(
        _event_stream(generate_legends_stream(
            req.team_a, req.team_b, req.era_a, req.era_b,
            stats_a, stats_b, lang=req.lang,
        )),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@app.post("/explain/stream/teach")
def teach_me_stream(req: TeachRequest):
    """SSE streaming version of teach me."""
    _ensure_ai()
    return StreamingResponse(
        _event_stream(generate_teach_stream(req.question, lang=req.lang)),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@app.post("/explain/var")
def var_explanation(req: VARRequest):
    """Addresses: WHY was a decision controversial or correct?"""
    explanation = _ai_generate(generate_var_explanation, req.team_a, req.team_b, req.scenario, lang=req.lang)
    return {"team_a": req.team_a, "team_b": req.team_b, "scenario": req.scenario, "explanation": explanation}


@app.post("/explain/story")
def match_story(req: ExplainRequest):
    """Tells the full match story — who dominates, key moments, how it ends."""
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    story = _ai_generate(generate_story,
        req.team_a, req.team_b,
        result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
        result["stats_a"], result["stats_b"],
        result["is_neutral"], result["is_major_tournament"],
        lang=req.lang,
    )
    return {"prediction": result, "story": story}


@app.post("/explain/legends")
def legends_matchup(req: LegendsRequest):
    try:
        if req.team_a not in predictor.team_stats:
            raise HTTPException(status_code=400, detail=f"Unknown team: {req.team_a}")
        if req.team_b not in predictor.team_stats:
            raise HTTPException(status_code=400, detail=f"Unknown team: {req.team_b}")
        stats_a = predictor.team_stats[req.team_a]
        stats_b = predictor.team_stats[req.team_b]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    narrative = _ai_generate(generate_legends,
        req.team_a, req.team_b, req.era_a, req.era_b,
        stats_a, stats_b, lang=req.lang,
    )
    return {
        "team_a": req.team_a, "team_b": req.team_b,
        "era_a": req.era_a, "era_b": req.era_b,
        "stats_a": {
            "winrate": round(stats_a["winrate"], 4),
            "goal_avg": round(stats_a["goal_avg"], 4),
            "matches": stats_a["matches_played"],
        },
        "stats_b": {
            "winrate": round(stats_b["winrate"], 4),
            "goal_avg": round(stats_b["goal_avg"], 4),
            "matches": stats_b["matches_played"],
        },
        "narrative": narrative,
    }


@app.post("/explain/teach")
def teach_me(req: TeachRequest):
    explanation = _ai_generate(generate_teach, req.question, lang=req.lang)
    return {"question": req.question, "explanation": explanation}


@app.post("/docling/analyze")
async def docling_analyze(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    try:
        content = await file.read()
        tmp.write(content)
        tmp.close()
        details = extract_match_details(tmp.name)
        if not details or not details.get("text"):
            raise HTTPException(status_code=422, detail="Could not extract text from PDF")
        analysis = generate_docling_analysis(details["text"])
        return {
            "filename": file.filename, "file_size": len(content),
            "text_length": len(details["text"]),
            "teams": details.get("teams", ["Unknown"]),
            "score": details.get("score", "Unknown"),
            "tournament": details.get("tournament", "Unknown"),
            "analysis": analysis,
        }
    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
