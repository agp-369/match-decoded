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

### AI-powered World Cup match explainability — powered by IBM Granite + LangChain + Docling

**IBM AI Builders Challenge 2026 · June Football Challenge**

[![IBM Granite](https://img.shields.io/badge/IBM-Granite-00b4ff)](https://ibm.com/granite)
[![LangChain](https://img.shields.io/badge/LangChain-IBM-00b4ff)](https://python.langchain.com/)
[![Docling](https://img.shields.io/badge/IBM-Docling-00b4ff)](https://github.com/IBM/docling)
[![Built with IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-00b4ff)](https://bob.ibm.com/)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-00b4ff)](https://python.org)
[![React](https://img.shields.io/badge/React-19-00b4ff)](https://react.dev)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-00b4ff)](https://vercel.com)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.54-00b4ff)](https://streamlit.io)

---

## 🌐 Try It Live

| Frontend | URL |
|---|---|
| **React App (Primary)** | [match-decoded.vercel.app](https://match-decoded.vercel.app) |
| **Mirror** | [frontend-react-mauve-nu.vercel.app](https://frontend-react-mauve-nu.vercel.app) |
| **Streamlit (HF Spaces)** | [agp9-match-decoded.hf.space](https://agp9-match-decoded.hf.space) |

---

## 🏟️ The Problem

**It's World Cup semi-final day. Argentina vs Brazil. 80,000 fans in the stadium. A billion watching worldwide.**

The pundits argue. The stats flash on screen. But the average fan still asks one question:

> *"WHY is Argentina favoured? Is it Messi's form? Brazil's historical edge? The venue? Tournament pressure?"*

For 154 years and 49,000 international matches, that answer lived inside analytics departments that fans never had access to. **Match Decoded is the first platform that gives every fan an AI analyst — powered by IBM Granite — to decode any match, in plain English, in seconds.**

---

## 🧠 The Solution

Match Decoded is an AI-powered football explainability platform that transforms raw match data into **Granite-generated tactical narratives**, **what-if simulations**, and **fully traceable decision explanations**.

| Fan Experience | Match Decoded |
|---|---|
| "Who do you think will win?" | **"Here's WHY — based on 8 factors from 49K historical matches"** |
| "What if it was a home game?" | **Real-time what-if simulator with AI analysis of the delta** |
| "Was Brazil 1970 better than Spain 2010?" | **Legends Matchup — cross-era Granite-powered comparison** |
| "The pundit says X. Is that right?" | **Full decision trace with feature importance — no black box** |

### Key Insight: Explainability Over Prediction

This is NOT a score predictor. It's a **match decoder** — an AI analyst that explains *why* outcomes are likely. No charts. No code. Pick two teams, click analyze, get a Granite-generated breakdown anyone can understand.

> *"Finally, a football tool for fans, not data scientists."*

---

## 🔧 IBM Technologies Used

| # | Technology | How We Use It | Status |
|---|---|---|---|
| 1 | **IBM Granite 3.1-2B** | Core AI engine — generates tactical previews, decision explanations, momentum analysis, legends matchups, and match report analysis via HuggingFace Inference API | ✅ Live |
| 2 | **LangChain** | `ChatPromptTemplate` for all 5 prompt types (preview, explain, momentum, legends, docling analysis) — structured, type-safe prompt engineering | ✅ Live |
| 3 | **IBM Docling** | PDF match report parser — extracts structured text from football report PDFs, feeds parsed data to Granite for AI analysis | ✅ Integrated |
| 4 | **IBM Bob** | AI code assistant used throughout development — architecture design, debugging, deployment setup | ✅ Documented |

### IBM Granite is the Star

Unlike projects where AI is a wrapper around a deterministic engine, Match Decoded puts Granite at the center:
- Every tactical preview is **Granite-generated**, not templated
- Every decision trace includes **Granite's natural language reasoning**
- Every momentum analysis is **Granite explaining probabilities in context**
- Every legends matchup is **Granite's take on historical football debate**
- Every match report analysis uses **Granite to extract tactical insight from raw text**

---

## ✨ Features

### 🔮 Pre-Match Preview
Select any two teams from 215 international sides. See the predicted outcome with probability breakdown, then read a **Granite-generated tactical preview** explaining WHY one team has the edge.

### 🔀 What-If Simulator
Change venue (neutral/home) and tournament type (major/friendly). Watch the prediction shift in real time. **Granite explains the delta** — what changed and why.

### 🏆 Legends Matchup
Cross-era comparisons — Brazil 1970 vs Germany 2014? England 1966 vs France 2018? **Granite settles the debate** with statistical context and passionate football storytelling.

### 📋 Match Report Analyzer (Docling)
Upload a football match report PDF. **IBM Docling** extracts the text. **Granite + LangChain** analyzes the tactics, key moments, and what decided the match.

### 🔍 Decision Trace
Every prediction is fully transparent. View:
- **Feature importance** — which factors drove the prediction
- **Granite explanation** — AI-generated narrative of the model's reasoning
- **Model metrics** — accuracy, feature weights, training methodology

### 🧠 Model Transparency
- **Algorithm**: Random Forest (200 trees, max depth 12)
- **Accuracy**: 55.8% on unseen data (vs 47.2% baseline)
- **Training**: 24,179 matches (pre-2018)
- **Testing**: 7,652 matches (2018+)
- **Features**: 8 factors — win rates, goal averages, recent form, venue, tournament type

---

## 🏗️ Architecture

```
                          Users
                  ┌───────┴───────┐
                  ▼               ▼
    ┌────────────────────┐  ┌──────────────┐
    │  React Frontend    │  │ Streamlit    │
    │  (Vercel · Prod)   │  │ (HF Spaces)  │
    │  • Pre-Match       │  │ • Same tabs  │
    │  • What-If         │  │ • Standalone │
    │  • Legends         │  │ • No backend │
    │  • Decision Trace  │  │   required   │
    │  • Docling Upload  │  │              │
    └────────┬───────────┘  └──────┬───────┘
             │                     │
             ▼                     ▼
    ┌─────────────────────────────────────┐
    │          FastAPI Backend             │
    │  ┌────────┐ ┌─────────┐ ┌─────────┐ │
    │  │/predict│ │/explain │ │/docling │ │
    │  │        │ │/preview │ │/analyze │ │
    │  │        │ │/decision│ │         │ │
    │  │        │ │/momentum│ │         │ │
    │  │        │ │/legends │ │         │ │
    │  └───┬────┘ └────┬────┘ └────┬────┘ │
    └──────┼───────────┼───────────┼───────┘
           ▼           ▼           ▼
    ┌────────┐ ┌───────────┐ ┌──────────┐
    │ Random │ │ LangChain │ │ IBM      │
    │ Forest │ │ Prompt    │ │ Docling  │
    │ Model  │ │ Templates │ │ Parser   │
    └────────┘ └─────┬─────┘ └──────────┘
                     ▼
              ┌────────────┐
              │ IBM Granite│
              │ 3.1-2B     │
              │ via HF API │
              └────────────┘
```

---

## 🎯 Judging Criteria Alignment

| Criterion | How Match Decoded Addresses It |
|---|---|---|
| **Technical Execution** | 2 frontends (React + Streamlit), 5 FastAPI endpoints, Random Forest ML model (55.8% acc, 200 trees), LangChain prompt chains with 5 templates, Docling PDF parser, Vercel + HF Spaces deployment |
| **Innovation** | Explainability-first — not just prediction but Granite-generated WHY. Cross-era Legends Matchup. What-if simulator with AI delta analysis. Docling match report analysis. Interactive scoreboard visualisation |
| **Challenge Fit** | Direct football theme aligned with June challenge. "Understand the game. Explain the moments." — every feature serves match understanding, not pure prediction |
| **Feasibility** | Live at 3 URLs: React on Vercel, Streamlit on HF Spaces, GitHub open source. Zero cost to run. 10 teams available instantly. Works fully offline in standalone mode |
| **Use of IBM Tech** | 4 IBM technologies: **Granite 3.1-2B** (LLM via HF Inference API), **LangChain** (prompt engineering), **Docling** (PDF parsing), **Bob** (AI code assistant) |
| **User Experience** | Premium football broadcast UI with stadium background. Gold/World Cup trophy theme. Scoreboard-style displays. Glassmorphic cards. Team flags. Mobile responsive. 4.5-click analysis flow |
| **Explainability** | Every prediction is fully traceable: 8 feature importance bars, Granite natural language explanation, model accuracy displayed. No black box. Designed for non-technical fans |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- HuggingFace token (for Granite Inference API — included in code)

### Quick Start (Streamlit)

```bash
git clone https://github.com/agp-369/match-decoded.git
cd match-decoded
pip install -r requirements.txt

# Start the backend API
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# In a new terminal, start the Streamlit frontend
streamlit run frontend/app.py
```
Open `http://localhost:8501`

### Quick Start (React)

```bash
git clone https://github.com/agp-369/match-decoded.git
cd match-decoded/frontend-react
npm install

# Set backend URL (omit for standalone mode)
echo "VITE_API_URL=http://localhost:8000" > .env

npm run dev
```
Open `http://localhost:3000`

### Environment Variables
Create a `.env` file in the project root:
```env
HF_TOKEN=your_huggingface_token_here  # Get yours at https://huggingface.co/settings/tokens
API_URL=http://localhost:8000         # Backend URL (auto-detected)
```

---

## 📁 Project Structure

```
match-decoded/
├── backend/                  # FastAPI backend
│   ├── main.py              # 5 API endpoints
│   ├── model.py             # Random Forest wrapper (55.8% acc)
│   ├── granite.py           # IBM Granite + LangChain integration
│   ├── langchain_prompts.py # LangChain prompt templates (5 types)
│   ├── docling_parser.py    # IBM Docling PDF match report parser
│   └── requirements.txt
├── frontend/                 # Streamlit app (HF Spaces)
│   ├── app.py               # 5 tabs, standalone mode
│   └── requirements.txt
├── frontend-react/           # React app (Vercel · production)
│   ├── src/
│   │   ├── App.tsx          # Hero + tabs + stats
│   │   ├── api.ts           # Prediction logic + team data
│   │   ├── components/      # 5 tab components
│   │   └── index.css        # Premium gold/navy theme
│   ├── vercel.json          # Vercel deployment config
│   └── package.json
├── models/
│   ├── match_predictor.pkl  # Trained Random Forest
│   └── team_data.pkl        # Team statistics
├── requirements.txt
└── README.md
```

---

## 🎬 Demo Video

### Pitch Script (World Cup Context)

```
"It's World Cup semi-final day. Argentina vs Brazil.

A billion people are watching. But most of them don't know
WHY the favourite is the favourite.

That's where Match Decoded comes in.

[OPEN APP — select Brazil vs Argentina, click Analyze]

I pick Brazil and Argentina. One click. And IBM Granite
delivers a full tactical preview — explaining exactly why
the model predicts what it does, in plain English.

[Show What-If Simulator — toggle Neutral Venue]

What if it's a neutral venue? Watch the prediction shift.
Granite explains the delta — what changed and why.

[Show Legends Matchup — Brazil vs Germany]

Compare Brazil vs Germany across eras. Granite settles
the debate with statistical context and football storytelling.

[Show Decision Trace]

Every prediction is fully transparent. View the 8 factors
that drove the decision. No black box.

For 154 years, that insight lived inside analytics departments.
Now every fan has an AI analyst in their pocket.

Powered by IBM Granite. LangChain. Docling. IBM Bob.

Match Decoded — Every fan deserves to know WHY."
```

---

## 👨‍💻 Built With

| Technology | Purpose |
|---|---|
| **IBM Granite 3.1-2B** | AI-powered match explainability |
| **LangChain** | Structured prompt engineering (5 templates) |
| **IBM Docling** | PDF match report parsing |
| **IBM Bob** | AI code assistant |
| **React 19** | Interactive frontend UI |
| **Vite** | Fast build tooling |
| **Vercel** | Production deployment |
| **Streamlit** | Interactive web frontend |
| **FastAPI** | High-performance backend API |
| **scikit-learn** | Random Forest prediction model |
| **Plotly** | Interactive data visualizations |
| **HuggingFace Spaces** | Free deployment (zero credit card) |

---

## 📊 Training Data

- **Source**: International football results dataset (1872-2026)
- **Total matches**: 49,329
- **Teams**: 215 international sides
- **Training set**: 24,179 matches (pre-2018)
- **Test set**: 7,652 matches (2018+)
- **Model**: Random Forest (200 trees, max depth 12)
- **Accuracy**: 55.8% (vs 47.2% baseline)
- **Features**: 8 factors — team_a_winrate, team_b_winrate, team_a_goal_avg, team_b_goal_avg, team_a_recent_form, team_b_recent_form, is_neutral, is_major_tournament

---

## 📝 License

Apache 2.0 — Built for the IBM AI Builders Challenge 2026

---

<div align="center">
  <em>Every fan deserves to understand WHY their team won or lost.</em><br>
  <strong>Match Decoded</strong> — IBM AI Builders Challenge 2026
</div>
