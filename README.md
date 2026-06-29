# Match Decoded

AI-powered football match explainability — IBM Granite · LangChain · LangFlow · Docling · Context Forge · IBM Bob

**IBM AI Builders Challenge 2026 · "AI Inside the Match"**

[![IBM Granite](https://img.shields.io/badge/IBM-Granite_3--8B-00b4ff)](https://ibm.com/granite)
[![LangChain](https://img.shields.io/badge/LangChain-00b4ff)](https://python.langchain.com/)
[![LangFlow](https://img.shields.io/badge/LangFlow-00b4ff)](https://www.langflow.org)
[![Docling](https://img.shields.io/badge/IBM-Docling-00b4ff)](https://github.com/IBM/docling)
[![Context Forge MCP](https://img.shields.io/badge/MCP-00b4ff)](https://ibm.github.io/mcp-context-forge/)
[![IBM Bob](https://img.shields.io/badge/IBM%20Bob-00b4ff)](https://bob.ibm.com/)
[![Tests](https://img.shields.io/badge/Tests-21%20passing-22c55e)](https://github.com/agp-369/match-decoded)

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | [match-decoded.vercel.app](https://match-decoded.vercel.app) |
| Backend API | [match-decoded-api.onrender.com](https://match-decoded-api.onrender.com) |
| Repository | [github.com/agp-369/match-decoded](https://github.com/agp-369/match-decoded) |
| Demo Video | [youtu.be/AkHqovHjmNo](https://youtu.be/AkHqovHjmNo) |

---

## Problem

The average football fan watches 90 minutes of play with little insight into why a team is winning or losing. Broadcasters and leagues have the data but lack a scalable way to explain match dynamics to millions of viewers in real time. This project explores whether AI — specifically IBM Granite — can bridge that gap.

## Approach

A FastAPI backend serves an XGBoost ensemble model trained on 31,161 real international matches (1990-2026, 224 teams) with per-team ELO ratings and a head-to-head win-rate matrix (6,285 pairs) to predict match outcomes (67.4% test accuracy). Each prediction is accompanied by an AI-generated narrative from IBM Granite that explains _why_ the model predicts what it does — covering tactical factors, key match events, and feature-level decision transparency.

The frontend (React 19 + Vite) provides an interactive interface with 11 analytical views and SSE streaming for real-time AI responses across all endpoints.

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
- **Live Match Simulation** — Real-time SSE streaming 90-minute match simulation with Granite AI commentary on every key event (goals, cards, VAR reviews, tactical shifts), momentum tracker, live scoreboard
- **ELO + Head-to-Head Analytics** — Per-team ELO ratings (224 teams) and H2H win rates (6,285 pairs) computed from 31,089 historical matches; featured in every prediction and decision trace
- **LangFlow Runtime Endpoint** — `POST /langflow/teach` and `/langflow/teach/stream` invoke the same Granite Q&A pipeline as the exported LangFlow JSON, with SSE streaming
- **Context Forge MCP** — Model Context Protocol server with REST mirrors exposing 5 tools (list_teams, get_team_stats, compare_teams, feature_importances, data_summary) for AI agent integration
- **SSE Streaming** — All 8 explain + LangFlow endpoints stream Granite responses token-by-token via Server-Sent Events (true token streaming via watsonx.ai `generate_text_stream()`)
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
| **IBM Granite 3.1 8B** (watsonx.ai + HuggingFace) | AI narrative generation — dual-provider fallback, true token streaming |
| **LangChain** | Structured prompt templates (7 templates covering all 11 tabs) |
| **LangFlow** | Visual Q&A workflow — exported flow, runtime endpoint (`/langflow/teach`), SSE streaming |
| **IBM Docling** | PDF match report parsing with text extraction |
| **Context Forge MCP** | Model Context Protocol server (5 tools) + REST mirrors for browser access |
| **IBM Bob** | AI code assistant during development |

### AI Architecture

```
Request → query_granite() / query_granite_chat_stream()
            ├── watsonx.ai available? → _query_watsonx() / _query_watsonx_stream() → return
            └── watsonx.ai failed? → _hf_chat() / _hf_chat_stream() → return
                                      └── both failed? → 503 error
```

### Data Pipeline

```
49,329 raw matches (results.csv 1872-2026)
    → Filter 1990+, >=50 matches/team → 31,161 matches, 224 teams
    → Compute ELO ratings (K-factor by goal margin) — stored per team
    → Rolling form (10-match window) + goal averages
    → Head-to-head win rates (6,285 team pairs)
    → 12 features (incl. elo_a, elo_b, elo_diff, h2h_hw, h2h_aw)
      → XGBoost (400 trees, max_depth=5) trained on team_data.pkl
    → Inference features (ELO + H2H) patched into team_data.pkl
      via scripts/compute_inference_features.py
    → 67.4% test accuracy · 66.3% 5-fold CV · 0.767 log loss
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
| Model Loading | 5 | Files exist, model loads, 224 teams, stats integrity, ELO ratings |
| Predictions | 7 | Probability calibration, home advantage, edge cases, H2H fields |
| Feature Importances | 1 | Sorted, names readable, ELO ranked among top features |
| API Health | 4 | Health, teams, predict, error handling |
| Docling Parser | 2 | Imports, nonexistent file |
| Training Script | 1 | Features match model |
| Data Integrity | 1 | Realistic winrate/goal ranges |

## Built With

- **IBM Granite 3.1 8B** — AI engine (watsonx.ai + HuggingFace Inference API, true token streaming)
- **LangChain** — Prompt engineering (7 prompt templates)
- **LangFlow** — Visual Q&A workflow + runtime endpoint with SSE streaming
- **IBM Docling** — PDF parsing
- **Context Forge MCP** — Team stats & prediction MCP server + REST mirror endpoints
- **IBM Bob** — AI code assistant
- **XGBoost + scikit-learn** — Prediction model
- **React 19 + Vite** — Frontend framework
- **Recharts** — Data visualizations
- **FastAPI** — Backend API
- **Pytest** — Testing
- **Render + Vercel** — Deployment

## License

Apache 2.0 — Built for the IBM AI Builders Challenge 2026
