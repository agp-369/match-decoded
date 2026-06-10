"""
FastAPI backend — Match Decoded API
IBM Technologies: Granite + LangChain + Docling + IBM Bob
"""
import os
import sys
import shutil
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import predictor
from granite import (
    generate_preview, generate_explain, generate_momentum,
    generate_docling_analysis, generate_legends,
)
from docling_parser import extract_match_details

app = FastAPI(
    title="Match Decoded API",
    description="AI-powered football match explainability — IBM Granite + LangChain + Docling",
    version="2.0.0",
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


class LegendsRequest(BaseModel):
    team_a: str
    team_b: str
    era_a: str = "Modern era"
    era_b: str = "Modern era"


@app.on_event("startup")
def startup():
    loaded = predictor.load()
    print(f"Model loaded: {loaded}, teams: {len(predictor.get_team_names()) if loaded else 0}")

    try:
        import docling_parser
        print(f"Docling available: {docling_parser.DOCLING_AVAILABLE}")
    except:
        print("Docling not available")

    try:
        import langchain
        print(f"LangChain available: {langchain.__version__}")
    except:
        print("LangChain not available")


@app.get("/health")
def health():
    ibm_techs = ["IBM Granite (HuggingFace Inference API)", "LangChain (prompt templates)"]
    try:
        import docling_parser
        if docling_parser.DOCLING_AVAILABLE:
            ibm_techs.append("Docling (PDF parsing)")
    except:
        pass

    return {
        "status": "ok",
        "model_loaded": predictor._loaded,
        "teams_available": len(predictor.get_team_names()),
        "ibm_technologies": ibm_techs,
    }


@app.get("/teams")
def list_teams():
    names = predictor.get_team_names()
    return {"teams": names, "count": len(names)}


@app.post("/predict")
def predict_match(req: PredictRequest):
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=f"Model not loaded: {e}")


@app.post("/explain/preview")
def preview_match(req: ExplainRequest):
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    narrative = generate_preview(
        result["team_a"], result["team_b"],
        result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
        result["stats_a"], result["stats_b"],
        result["is_neutral"], result["is_major_tournament"],
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

    explanation = generate_explain(
        result["team_a_win_prob"], result["draw_prob"], result["team_b_win_prob"],
        result["stats_a"], result["stats_b"],
        top_features,
    )
    return {
        "prediction": result,
        "explanation": explanation,
        "feature_importances": importances,
    }


@app.post("/explain/momentum")
def momentum_analysis(req: ExplainRequest):
    try:
        result = predictor.predict(req.team_a, req.team_b, req.is_neutral, req.is_major_tournament)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    analysis = generate_momentum(
        result["team_a"], result["team_b"],
        result["team_a_win_prob"], result["team_b_win_prob"],
    )
    return {"prediction": result, "analysis": analysis}


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

    narrative = generate_legends(
        req.team_a, req.team_b, req.era_a, req.era_b,
        stats_a, stats_b,
    )

    return {
        "team_a": req.team_a,
        "team_b": req.team_b,
        "era_a": req.era_a,
        "era_b": req.era_b,
        "stats_a": {
            "winrate": round(stats_a["winrate"], 4),
            "goal_avg": round(stats_a["goal_avg"], 4),
            "matches_played": stats_a["matches_played"],
        },
        "stats_b": {
            "winrate": round(stats_b["winrate"], 4),
            "goal_avg": round(stats_b["goal_avg"], 4),
            "matches_played": stats_b["matches_played"],
        },
        "narrative": narrative,
    }


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
            "filename": file.filename,
            "file_size": len(content),
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
