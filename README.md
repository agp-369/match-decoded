# ⚽ Match Decoded

### AI-powered football match explainability — powered by IBM Granite

**IBM AI Builders Challenge 2026 · June Football Challenge**

[![IBM Granite](https://img.shields.io/badge/IBM-Granite-00b4ff)](https://ibm.com/granite)
[![LangChain](https://img.shields.io/badge/LangChain-IBM-00b4ff)](https://python.langchain.com/)
[![Docling](https://img.shields.io/badge/IBM-Docling-00b4ff)](https://github.com/IBM/docling)
[![Built with IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-00b4ff)](https://bob.ibm.com/)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-00b4ff)](https://python.org)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.54-00b4ff)](https://streamlit.io)

---

## 🏟️ The Problem

**49,000 international football matches. 215 teams. 154 years of data.**

And yet, when a fan watches a match, they hear commentary about *what* happened — but rarely *why*.

> *"Brazil lost to Argentina. But was it because of form? Venue? Historical matchup? Tournament pressure?"*

Fans deserve to understand the invisible forces shaping every match. Teams have million-dollar analytics departments. Fans have bias and guesswork. **Match Decoded bridges that gap.**

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

This is NOT a score predictor. This is a **match decoder** — an AI that explains *why* outcomes are likely, so every fan understands the game at a deeper level.

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
┌─────────────────────────────────────────────────────┐
│                  Streamlit Frontend                  │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ │
│  │  Preview  │ │What-If   │ │Legends │ │ Docling  │ │
│  │           │ │Simulator │ │Matchup │ │Analyzer  │ │
│  └─────┬─────┘ └────┬─────┘ └───┬────┘ └────┬─────┘ │
└────────┼─────────────┼───────────┼───────────┼───────┘
         │             │           │           │
         ▼             ▼           ▼           ▼
┌─────────────────────────────────────────────────────┐
│                  FastAPI Backend                      │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ │
│  │/predict  │ │/explain/ │ │/explain│ │/docling/ │ │
│  │          │ │preview   │ │/legends│ │analyze   │ │
│  │decision  │ │momentum  │ │        │ │          │ │
│  └─────┬────┘ └────┬─────┘ └───┬────┘ └────┬─────┘ │
└────────┼────────────┼───────────┼───────────┼───────┘
         │            │           │           │
         ▼            ▼           ▼           ▼
┌────────┐   ┌───────────┐  ┌────────┐  ┌──────────┐
│ Random │   │  LangChain│  │ IBM    │  │ IBM      │
│ Forest │   │ Prompt    │  │ Granite│  │ Docling  │
│ Model  │   │ Templates │  │via HF  │  │ PDFParser│
└────────┘   └───────────┘  └────────┘  └──────────┘
```

---

## 🎯 Judging Criteria Alignment

| Criterion | How Match Decoded Addresses It |
|---|---|
| **Technical Execution** | 5 FastAPI endpoints, Random Forest ML model (55.8% acc), LangChain prompt chains, Docling PDF parsing, Streamlit UI with Plotly charts |
| **Innovation** | Explainability-first approach — not just prediction but WHY. Cross-era Legends Matchup. What-if simulator with AI delta analysis. Docling match report analysis |
| **Challenge Fit** | Direct football theme. "Understand the game. Explain the moments." — every feature is about fan understanding, not pure prediction |
| **Feasibility** | Live prototype with 215 teams, 49K matches, 5 working endpoints. Runs on free HuggingFace Spaces. Zero credit card required |
| **Use of IBM Tech** | 4 IBM technologies: **Granite** (LLM), **LangChain** (prompts), **Docling** (PDF parsing), **Bob** (development assistance) |
| **User Experience** | Polished glassmorphic UI, mobile-friendly, 4 interactive tabs, real-time animations, stadium-themed design |
| **Explainability** | Fully traceable predictions. Feature importance displayed. Granite explains every decision in plain language. No black box |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- HuggingFace token (for Granite Inference API — included in code)

### Installation

```bash
# Clone
git clone https://github.com/agp-369/match-decoded.git
cd match-decoded

# Install dependencies
pip install -r requirements.txt

# Start the backend API
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# In a new terminal, start the frontend
streamlit run frontend/app.py
```

Open your browser to `http://localhost:8501`

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
├── backend/
│   ├── main.py              # FastAPI (5 endpoints)
│   ├── model.py             # Random Forest wrapper
│   ├── granite.py           # IBM Granite + LangChain integration
│   ├── langchain_prompts.py # LangChain prompt templates
│   ├── docling_parser.py    # IBM Docling PDF parsing
│   └── requirements.txt     # Backend deps
├── frontend/
│   ├── app.py               # Streamlit UI (4 tabs)
│   └── requirements.txt     # Frontend deps
├── models/
│   ├── match_predictor.pkl  # Trained Random Forest
│   └── team_data.pkl        # Team statistics
├── requirements.txt         # Combined deps
├── .huggingface.yaml        # HuggingFace Spaces config
└── README.md
```

---

## 🎬 Demo Video

### Pitch Script

```
"Every football fan has watched a match and wondered: WHY did they win?

Match Decoded answers that question.

Powered by IBM Granite, LangChain, Docling, and built with IBM Bob,
Match Decoded analyzes 49,000 international matches to explain
the invisible forces shaping every game.

Select any two teams. Granite delivers a tactical preview explaining
why one has the edge. Change the venue — watch the prediction shift.
Compare legends across eras — Granite settles the debate.
Upload a match report — Docling extracts the tactics, Granite analyzes them.

Teams have million-dollar analytics. Fans have guesswork.
Match Decoded bridges that gap.

Built with IBM Granite. LangChain. Docling. IBM Bob.

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
