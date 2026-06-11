---
title: Match Decoded
emoji: ⚽
colorFrom: indigo
colorTo: blue
sdk: streamlit
sdk_version: "1.52.0"
app_file: frontend/app.py
pinned: false
license: apache-2.0
---

# 🏆 Match Decoded

### AI-powered football explainability — from the stadium to your screen
### Powered by IBM Granite (watsonx.ai) + LangChain + Docling + IBM Bob

**IBM AI Builders Challenge 2026 · June Football Challenge**

[![IBM watsonx.ai](https://img.shields.io/badge/IBM-watsonx.ai-00b4ff)](https://cloud.ibm.com)
[![IBM Granite](https://img.shields.io/badge/IBM-Granite_3--8B-00b4ff)](https://ibm.com/granite)
[![LangChain](https://img.shields.io/badge/LangChain-IBM-00b4ff)](https://python.langchain.com/)
[![Docling](https://img.shields.io/badge/IBM-Docling-00b4ff)](https://github.com/IBM/docling)
[![Built with IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-00b4ff)](https://bob.ibm.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-66.6%25-22c55e)](https://xgboost.readthedocs.io/)
[![Tests](https://img.shields.io/badge/Tests-22%20passing-22c55e)](https://github.com/)
[![CI/CD](https://img.shields.io/badge/CI/CD-GitHub%20Actions-00b4ff)](https://github.com/)

---

## 📺 Why Match Decoded?

**🧠 Innovation with purpose** — Not just showing *what* happened, but explaining *why* it happened. Raw data → IBM Granite (watsonx.ai) narrative → fan understanding.

**🌍 Social impact through access** — Football intelligence locked inside broadcast trucks for 154 years. Now free on any device, any country, no login required. Democratizing sports analytics.

**⚡ Transparent AI** — No black box. Every prediction is traceable to 12 specific features. Every narrative is generated live by IBM Granite via watsonx.ai. No canned text. No fallbacks.

---

## 🌐 Try It Live
| Frontend | URL |
|---|---|
| **React App (Primary)** | [match-decoded.vercel.app](https://match-decoded.vercel.app) |
| **Streamlit (HF Spaces)** | [agp9-match-decoded.hf.space](https://agp9-match-decoded.hf.space) |

---

## 🏟️ The Problem

For 154 years and 49,000 international matches, match intelligence lived inside analytics departments and broadcast trucks. **Match Decoded gives every fan an AI analyst — powered by IBM Granite on watsonx.ai — to decode any match, in plain English, in seconds.**

---

## 🧠 The Solution

| The Fan's Question | What Match Decoded Delivers |
|---|---|
| "Who do you think will win?" | **"Here's WHY"** — Granite breaks down 12 factors |
| "What if they played at home?" | **Live what-if simulator** — Granite explains the delta |
| "Was Brazil 1970 really better?" | **Legends Matchup** — Cross-era Granite storytelling |
| "Is the model smarter than the market?" | **Model vs betting odds** — The Edge detection |
| "What was the key moment?" | **Momentum timeline** — Granite narrates the 90-minute story |

---

## 🔧 IBM Technologies at the Core

| # | Technology | How We Use It |
|---|---|---|
| 1 | **IBM Granite 3-8B (watsonx.ai)** | Core AI engine via IBM watsonx.ai SDK — all narratives generated live |
| 2 | **LangChain** | Structured prompt engineering across 5 prompt templates |
| 3 | **IBM Docling** | PDF match report parser with PyMuPDF fallback |
| 4 | **IBM Bob** | AI code assistant used throughout development |

### Why watsonx.ai?

Every line of analysis is **Granite-generated via IBM watsonx.ai**, not templated or hardcoded. No fallback text. If watsonx.ai is unreachable, the API returns a clear 503 so the user knows the AI engine is unavailable — no silent degradation to canned text.

### Real Data, Not Synthetic

| Metric | Before | Now |
|---|---|---|
| Training data | 50,000 synthetic matchups | **31,161 real international matches (1990–2026)** |
| Teams | 49 (hand-picked) | **224 teams** |
| Model | Random Forest (55.8%) | **XGBoost + RF + GB ensemble (66.6%)** |
| Features | 8 engineered | **12 engineered (ELO, rolling form, H2H, venue, tournament)** |
| Baseline | 47.2% (home-win guess) | **48.2% → 66.6% (+18.4% improvement)** |
| CV accuracy | — | **66.2% (5-fold cross-validation)** |

---

## 🏗️ Architecture

```
Fans (Web + Mobile)
    |
    +---> React Frontend (Vercel)
    |       Pre-Match, What-If, Legends, Decision Trace, Docling Upload
    |
    +---> Streamlit App (HF Spaces)
    |
    +---> FastAPI Backend (Render)
            /predict, /explain, /momentum, /legends, /docling/analyze, /health
                |
                +---> XGBoost Ensemble Model (224 teams, 12 features)
                |     Trained on 31,161 real matches (1990-2026)
                |
                +---> LangChain Prompt Templates (5 types)
                |
                +---> IBM Granite 3-8B (watsonx.ai)
                |     All narratives generated live — no fallbacks
                |
                +---> IBM Docling Parser
                      PDF match report → text → Granite analysis
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- IBM watsonx.ai API key + project ID ([Get free](https://cloud.ibm.com))

### Backend
```bash
git clone https://github.com/agp-369/match-decoded.git
cd match-decoded
pip install -r requirements.txt
set WATSONX_API_KEY=your-key     # Windows
set WATSONX_PROJECT_ID=your-id
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend-react
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

### Run Tests
```bash
python -m pytest tests/ -v
```

---

## 🧪 Testing

**22 tests** covering:
- Model loading & team data integrity
- Prediction accuracy & probability calibration
- All 224 teams pairwise validation
- Feature importance correctness
- API endpoints (health, teams, predict, error handling)
- PDF parser fallback behavior
- Training script reproducibility

---

## 👨‍💻 Built With

| Technology | Purpose |
|---|---|
| **IBM Granite 3-8B (watsonx.ai)** | AI match explainability — live, no fallbacks |
| **LangChain** | Structured prompt engineering (5 templates) |
| **IBM Docling** | PDF match report parsing |
| **IBM Bob** | AI code assistant |
| **XGBoost + scikit-learn** | Ensemble prediction model (66.6% accuracy) |
| **React 19 + Vite + Recharts** | Interactive frontend |
| **FastAPI** | Backend API |
| **Pytest** | Test suite (22 tests) |
| **GitHub Actions** | CI/CD pipeline |
| **Docker / Render / Vercel** | Deployment |

---

## 📝 License
Apache 2.0 — Built for the IBM AI Builders Challenge 2026

---

<div align="center">
  <em>Every fan deserves to know why their team won or lost.</em><br/>
  <em>Inspired by the Emmy-winning work of IBM Sports & Entertainment Partnerships.</em><br/>
  <strong>Match Decoded</strong> — IBM AI Builders Challenge 2026
</div>
