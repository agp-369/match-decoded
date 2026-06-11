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

## 🧠 How It Works: 5 Analytical Tabs

| Tab | What It Does | Who It Serves |
|-----|------------|---------------|
| **📊 Pre-Match Preview** | Real XGBoost prediction + Granite narrative explaining *why* one team is favored | Broadcasters, fans, bettors |
| **🔄 What-If Simulator** | Adjust team form, venue, tournament type — watch the prediction shift in real-time | Coaches, analysts, journalists |
| **🏆 Legends Matchup** | Cross-era team comparison across 5 dimensions with Granite storytelling | Content creators, historians |
| **🔍 Decision Trace** | 12 feature importances shown + Granite explains the model's reasoning | **Judges, regulators, transparency advocates** |
| **📄 Docling Analysis** | Upload PDF match reports — IBM Docling parses, Granite analyzes | Media archives, match officials |

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
| **Innovation** | 5/5 | Explainable match AI + what-if simulator + cross-era legends + Docling integration |
| **Challenge Fit** | 5/5 | "AI Inside the Match" — pre-match, during (momentum), post-match (Docling) |
| **Implementation & Feasibility** | 5/5 | Deployed on Render + Vercel, real data, 66.6% accuracy, 224 teams |

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
1. **0:00–0:15** — Open with 66.6% accuracy badge, show 31K+ matches analyzed
2. **0:15–0:45** — Pre-Match Preview. Select Brazil vs Argentina. Click "Analyze with Granite." Show AI narrative appear.
3. **0:45–1:00** — Decision Trace. Show 12 feature importances animate in. Click "Explain with Granite." Show the AI explanation.
4. **1:00–1:20** — What-If Simulator. Drag form sliders. Show probability shifting in real-time. Click "Analyze What-If."
5. **1:20–1:35** — World Cup mode toggle. Show filtered matchups.
6. **1:35–1:50** — Legends Matchup. Show radar chart. Run comparison.
7. **1:50–2:20** — IBM Tech Status Bar. Show watsonx.ai active. Mention dual provider strategy. Show 22 tests passing in terminal.
8. **2:20–2:45** — CI/CD pipeline. Show GitHub Actions passing. Deployment to Render/Vercel.
9. **2:45–3:00** — Close with "Every fan deserves to know why." Show GitHub stars. Call to action.

---

## 👨‍💻 Built With

| Technology | Purpose |
|------------|---------|
| **IBM Granite 3-8B** (watsonx.ai + 🤗 API) | AI match explainability — dual-provider, live, no hardcoded text |
| **LangChain** | Structured prompt engineering (5 templates) |
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
