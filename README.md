# Match Decoded

AI-powered football match explainability — IBM Granite · LangChain · Docling · IBM Bob

**IBM AI Builders Challenge 2026 · "AI Inside the Match"**

[![IBM Granite](https://img.shields.io/badge/IBM-Granite_3--8B-00b4ff)](https://ibm.com/granite)
[![LangChain](https://img.shields.io/badge/LangChain-00b4ff)](https://python.langchain.com/)
[![Docling](https://img.shields.io/badge/IBM-Docling-00b4ff)](https://github.com/IBM/docling)
[![IBM Bob](https://img.shields.io/badge/IBM%20Bob-00b4ff)](https://bob.ibm.com/)
[![Tests](https://img.shields.io/badge/Tests-21%20passing-22c55e)](https://github.com/agp-369/match-decoded)

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | [match-decoded.vercel.app](https://match-decoded.vercel.app) |
| Backend API | [match-decoded-api.onrender.com](https://match-decoded-api.onrender.com) |
| Repository | [github.com/agp-369/match-decoded](https://github.com/agp-369/match-decoded) |

---

## Problem

The average football fan watches 90 minutes of play with little insight into why a team is winning or losing. Broadcasters and leagues have the data but lack a scalable way to explain match dynamics to millions of viewers in real time. This project explores whether AI — specifically IBM Granite — can bridge that gap.

## Approach

A FastAPI backend serves an XGBoost ensemble model trained on 31,161 real international matches (1990-2026, 224 teams) to predict match outcomes (66.6% 3-class accuracy). Each prediction is accompanied by an AI-generated narrative from IBM Granite that explains _why_ the model predicts what it does — covering tactical factors, key match events, and feature-level decision transparency.

The frontend (React 19 + Vite) provides an interactive interface with 9 analytical views.

## Features

- **Tactical Analysis** — Granite explains why one team has the edge, what tactical change could flip it, and how the match might unfold
- **Pre-Match Preview** — Prediction card, win/draw probabilities, momentum simulation, and AI match preview
- **VAR Explained** — Select a controversial scenario; Granite explains the law, review process, and whether the call was correct
- **Match Story** — 3-act narrative (first half, key moment, final outcome) written by Granite
- **What-If Simulator** — Drag form sliders to explore how changes affect predicted probabilities
- **Legends Matchup** — Radar chart comparing teams across 5 dimensions; Granite narrates the comparison
- **Decision Trace** — 12 ranked feature importances with AI explanation of the model's reasoning
- **Teach Me** — FAQ grid and custom question input; Granite explains football concepts for new fans
- **Docling Analysis** — Upload a PDF match report; Docling extracts text and Granite generates a tactical breakdown
- **Multilingual** — AI narratives in English, Spanish, French, Portuguese, and German

## Potential Applications

This project explores how AI could support sports broadcasting and fan engagement:

- **Broadcast enhancement** — A broadcaster could use the Tactical Analysis and Pre-Match Preview to generate match analysis for any of 224 national teams without a dedicated analyst
- **Fan growth** — The Teach Me and Multilingual features help new and international audiences understand the game, lowering barriers for emerging football markets
- **Transparency** — The VAR Explainer and Decision Trace show how refereeing and model decisions are made, building trust with audiences
- **What-if exploration** — Coaches and journalists could use the simulator to explore how form and venue changes affect match outcomes

## IBM Technologies Used

| Technology | Role |
|------------|------|
| **IBM Granite 3-8B** (watsonx.ai + HuggingFace) | AI narrative generation — dual-provider fallback |
| **LangChain** | Structured prompt templates (8 templates) |
| **IBM Docling** | PDF match report parsing |
| **IBM Bob** | AI code assistant during development |

### AI Architecture

```
Request → query_granite()
            ├── watsonx.ai available? → _query_watsonx() → return
            └── watsonx.ai failed? → _query_huggingface() → return
                                      └── both failed? → 503 error
```

### Data Pipeline

```
49,329 raw matches (results.csv 1872-2026)
    → Filter 1990+, >=50 matches/team → 31,161 matches, 224 teams
    → Compute ELO ratings (K-factor by goal margin)
    → Rolling form (10-match window) + goal averages
    → Head-to-head win rates
    → 12 features → XGBoost (400 trees, max_depth=5)
    → 66.6% test accuracy · 66.2% 5-fold CV · 0.788 log loss
```

## Quick Start

```bash
# Backend
git clone https://github.com/agp-369/match-decoded.git
cd match-decoded
pip install -r requirements.txt

# Set AI credentials (pick one):
# Option A: IBM watsonx.ai
set WATSONX_API_KEY=your-key
set WATSONX_PROJECT_ID=your-id
# Option B: HuggingFace (free, no credit card)
set HF_TOKEN=your-token

uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Frontend (separate terminal)
cd frontend-react
npm install
npm run dev
```

### Tests

```bash
python -m pytest tests/ -v
```

## Test Suite

| Test Group | Count | What It Validates |
|-----------|-------|-------------------|
| Model Loading | 5 | Files exist, model loads, 224 teams, stats integrity |
| Predictions | 7 | Probability calibration, home advantage, edge cases |
| Feature Importances | 1 | Sorted, names readable |
| API Health | 4 | Health, teams, predict, error handling |
| Docling Parser | 2 | Imports, nonexistent file |
| Training Script | 1 | Features match model |
| Data Integrity | 1 | Realistic winrate/goal ranges |

## Built With

- **IBM Granite 3-8B** — AI engine (watsonx.ai + HuggingFace Inference API)
- **LangChain** — Prompt engineering
- **IBM Docling** — PDF parsing
- **IBM Bob** — AI code assistant
- **XGBoost + scikit-learn** — Prediction model
- **React 19 + Vite** — Frontend framework
- **Recharts** — Data visualizations
- **FastAPI** — Backend API
- **Pytest** — Testing
- **Render + Vercel** — Deployment

## License

Apache 2.0 — Built for the IBM AI Builders Challenge 2026
