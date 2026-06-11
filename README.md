# 🏆 Match Decoded

### AI-powered football explainability — powered by IBM Granite (watsonx.ai) + LangChain + Docling + IBM Bob

**IBM AI Builders Challenge 2026 · "AI Inside the Match" — World Cup Edition**

[![IBM watsonx.ai](https://img.shields.io/badge/IBM-watsonx.ai-00b4ff)](https://cloud.ibm.com) [![HuggingFace](https://img.shields.io/badge/🤗-HuggingFace%20API-FFD21E)](https://huggingface.co/ibm-granite/granite-3-8b-instruct)
[![IBM Granite](https://img.shields.io/badge/IBM-Granite_3--8B-00b4ff)](https://ibm.com/granite) [![LangChain](https://img.shields.io/badge/LangChain-IBM-00b4ff)](https://python.langchain.com/)
[![Docling](https://img.shields.io/badge/IBM-Docling-00b4ff)](https://github.com/IBM/docling) [![Built with IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-00b4ff)](https://bob.ibm.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-66.6%25-22c55e)](https://xgboost.readthedocs.io/) [![Tests](https://img.shields.io/badge/Tests-22%20passing-22c55e)](https://github.com/)
[![CI/CD](https://img.shields.io/badge/CI/CD-GitHub%20Actions-00b4ff)](https://github.com/)

---

## 🌐 Try It Live
| Service | URL | Stack |
|---------|-----|-------|
| **Frontend** | [match-decoded.vercel.app](https://match-decoded.vercel.app) | React 19 + Vite + framer-motion |
| **Backend API** | [match-decoded-api.onrender.com](https://match-decoded-api.onrender.com) | FastAPI + XGBoost + Granite |
| **GitHub** | [github.com/agp-369/match-decoded](https://github.com/agp-369/match-decoded) | CI/CD · 22 tests · Open source |

---

## 📺 The Problem Worth Solving

**For 154 years, match intelligence lived inside broadcast trucks and analytics departments.**

The average fan watches 90 minutes of football with zero insight into *why* a team is winning. Broadcasters have the data but no scalable way to explain it to millions of viewers. Leagues have the footage but no automated way to produce match analysis at volume.

**Match Decoded gives every fan an AI analyst — powered by IBM Granite — to decode any match, in plain English, in seconds.**

### Real-World Impact (Quantified)

| Metric | Value |
|--------|-------|
| Matches analyzed | 31,161 real international matches (1990–2026) |
| Teams covered | **224 nations** (every FIFA-ranked team) |
| Prediction accuracy | **66.6%** (3-class: home/draw/away; baseline 48.2%) |
| Cross-validation | 66.2% (5-fold, ±0.58%) |
| AI narratives | 100% live-generated — **zero hardcoded text** |
| Test coverage | 22 tests, all passing |
| Deployment | CI/CD pipeline, auto-deploy to Render + Vercel |

---

## 🧠 How It Works: 9 Analytical Tabs

### "Why" over "What" — each tab answers a different football question

| Tab | Question It Answers | Who It Serves |
|-----|-------------------|---------------|
| **🧠 Tactical Analysis** | **WHY** does one team have the edge? **WHAT** tactical change could flip it? | Coaches, pundits, tactical fans |
| **📊 Pre-Match Preview** | **HOW** will the match play out? What does the data say? | Broadcasters, fans, bettors |
| **⚖️ VAR Explained** | **WHY** was that decision made? Was it right or controversial? | Fans, media, new viewers |
| **📖 Match Story** | **HOW** does the match come alive? A 3-act narrative of the game | Storytellers, content creators |
| **🔄 What-If Simulator** | **WHAT IF** form, venue, or tournament changes the outcome? | Coaches, analysts, journalists |
| **🏆 Legends Matchup** | **WHO** had the stronger legacy across eras? | Historians, debaters |
| **🔍 Decision Trace** | **HOW** does the model decide? Full feature transparency | **Judges, regulators, transparency advocates** |
| **📚 Teach Me** | **WHAT** does this football term mean? Learn the game | New fans, casual viewers |
| **📄 Docling Analysis** | **WHAT** does this match report reveal? AI document analysis | Media archives, match officials |

### 🌐 Multilingual
AI narratives in **5 languages**: English, Español, Français, Português, Deutsch — selectable from the global nav.

### 🏆 World Cup 2026 Mode
Toggle World Cup mode to filter matchups by tournament-qualified teams and get World Cup-specific analysis — built for the June "AI Inside the Match" theme.

---

## 🔧 IBM Technologies at the Core

| Technology | Role | Integration Depth |
|------------|------|-------------------|
| **IBM Granite 3-8B** (watsonx.ai) | Primary AI engine — all match narratives | `ibm_watsonx_ai` SDK, full prompt control |
| **IBM Granite 3-8B** (HuggingFace API) | Fallback AI engine (free tier, no credit card) | `requests` POST, same prompts |
| **LangChain** | Structured prompt engineering (5 templates) | `ChatPromptTemplate` from `langchain_core` |
| **IBM Docling** | PDF match report parsing | Native `docling` library + PyMuPDF fallback |
| **IBM Bob** | AI code assistant throughout development | Prompt engineering, debugging, architecture |

### AI Provider Architecture

```
Request → query_granite()
            ├── watsonx.ai available? → _query_watsonx() → return
            └── watsonx.ai failed? → _query_huggingface() → return
                                      └── both failed? → RuntimeError("No AI provider")
```

Both providers serve the **same IBM Granite 3-8B-Instruct** model with identical prompts and parameters. The API returns **503** if neither is configured — no silent degradation, no hardcoded fallback text.

### Real Data Pipeline

```
49,329 raw matches (results.csv 1872–2026)
    → Filter 1990+, ≥50 matches/team → 31,161 matches, 224 teams
    → Compute ELO ratings (K-factor by goal margin)
    → Rolling form (10-match window) + goal averages
    → Head-to-head win rates
    → 12 features → XGBoost (400 trees, max_depth=5)
    → 66.6% test accuracy · 66.2% CV · 0.788 log loss
```

---

## 🏟️ Business Value for IBM Sports & Entertainment Partners

For **Pamela Jacob** (CSR, Sports & Entertainment) and **Elizabeth O'Brien** (Sports & Entertainment Partnerships):

| Use Case | Value | Revenue/Impact Potential |
|----------|-------|--------------------------|
| **Broadcast enhancement** | Auto-generated match analysis for 200+ nations | Production cost reduction (no human analyst needed per game) |
| **Fan engagement** | Interactive what-if tools + explainable predictions | Increased app retention, ad impressions |
| **League partnerships** | White-label match analysis for FIFA, UEFA, CONMEBOL | B2B SaaS licensing |
| **Youth development** | Accessible analytics for emerging football nations | CSR alignment, brand goodwill |
| **Media archive** | Docling-powered analysis of 50+ years of match reports | Content monetization from archival footage |

---

## ⚡ Why This Wins (Judging Criteria)

| Criterion | Score Target | How We Deliver |
|-----------|-------------|----------------|
| **Technical Execution** | 5/5 | FastAPI + React + XGBoost + dual AI provider + CI/CD + 22 tests |
| **Innovation** | 5/5 | Tactical analysis, VAR explainer, match story, "teach me" assistant, what-if simulator, cross-era legends, Docling |
| **Challenge Fit** | 5/5 | Answers "WHY did momentum shift?", "WHY did a tactical change succeed/fail?", "WHY was a decision controversial?" — no prediction-only features |
| **Implementation & Feasibility** | 5/5 | Deployed on Render + Vercel, real data, 66.6% accuracy, 224 teams, multilingual |

---

## 🚀 Quick Start

```bash
# Backend
git clone https://github.com/agp-369/match-decoded.git
cd match-decoded
pip install -r requirements.txt

# AI credentials (pick one):
# Option A: IBM watsonx.ai (primary)
set WATSONX_API_KEY=your-key
set WATSONX_PROJECT_ID=your-id
# Option B: HuggingFace (fallback, free, no credit card)
set HF_TOKEN=your-token

uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Frontend (separate terminal)
cd frontend-react
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

### Run Tests
```bash
python -m pytest tests/ -v     # 22 tests
```

---

## 🧪 Test Suite (22 Tests)

| Test Group | Count | What It Validates |
|-----------|-------|-------------------|
| Model Loading | 5 | Files exist, model loads, 224 teams, stats integrity |
| Predictions | 7 | Probability calibration, home advantage, all pairs, errors |
| Feature Importances | 1 | Sorted, names readable |
| API Health | 4 | Health, teams, predict, error handling |
| Docling Parser | 2 | Imports, nonexistent file |
| Training Script | 1 | Features match model |
| Data Integrity | 1 | Realistic winrate/goal ranges |

---

## 🎬 Demo Video (3 min max)

**Script Outline:**
1. **0:00–0:10** — Open with "Every fan deserves to know why." Show 31K+ matches, 224 teams.
2. **0:10–0:30** — 🧠 **Tactical Analysis** (first tab!). Select Brazil vs Argentina. Click "Analyze Tactics with Granite." Granite answers: WHY Brazil has the edge, WHAT tactical change could flip it.
3. **0:30–0:45** — ⚖️ **VAR Explained**. Pick a controversial scenario. Granite explains: what the law says, why it's controversial, how VAR checks it.
4. **0:45–1:00** — 📖 **Match Story**. Click "Tell the Match Story." Granite writes a 3-act narrative — first half, key moment, final outcome.
5. **1:00–1:15** — 🌐 **Multilingual**. Change language selector to ES/FR/PT/DE. Same AI narrative, different language. Shows global scalability.
6. **1:15–1:30** — 📊 **Pre-Match Preview**. Show prediction + momentum timeline + Granite narrative.
7. **1:30–1:45** — 📚 **Teach Me**. Show FAQ grid. Click a question. Granite explains football concepts for new fans.
8. **1:45–2:00** — 🔍 **Decision Trace**. 12 feature importances + AI explains the model's reasoning.
9. **2:00–2:20** — 🔄 **What-If Simulator**. Drag form sliders. Show probability shifting.
10. **2:20–2:35** — 🏆 **Legends Matchup**. Radar chart + cross-era comparison.
11. **2:35–2:50** — IBM Tech Status Bar + CI/CD. Show watsonx.ai active, 22 tests passing, GitHub Actions.
12. **2:50–3:00** — Close: "Match Decoded — built with IBM Granite 3-8B, LangChain, Docling, and IBM Bob. Every fan deserves to know why."

---

## 👨‍💻 Built With

| Technology | Purpose |
|------------|---------|
| **IBM Granite 3-8B** (watsonx.ai + 🤗 API) | AI match explainability — dual-provider, live, no hardcoded text |
| **LangChain** | Structured prompt engineering (8 templates: preview, explain, momentum, tactical, VAR, story, legends, teach) |
| **IBM Docling** | PDF match report parsing |
| **IBM Bob** | AI code assistant |
| **XGBoost + scikit-learn** | Ensemble prediction model (66.6%) |
| **React 19 + Vite + framer-motion** | Interactive frontend with animations |
| **Recharts** | Data visualizations (radar, line charts, progress bars) |
| **FastAPI + uvicorn** | Backend API |
| **Pytest** | 22 tests |
| **GitHub Actions** | CI/CD pipeline (model + frontend) |
| **Render + Vercel** | Production deployment |

---

## 📝 License
Apache 2.0 — Built for the IBM AI Builders Challenge 2026

---

<div align="center">
  <em>"Every fan deserves to know why their team won or lost."</em><br/>
  <em>Inspired by the work of <strong>IBM Sports & Entertainment Partnerships</strong>.</em><br/><br/>
  <strong>Match Decoded</strong> — IBM AI Builders Challenge 2026<br/>
  Built by a student who believes football intelligence should be free.
</div>
