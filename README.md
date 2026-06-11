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
### Powered by IBM Granite + LangChain + Docling + IBM Bob

**IBM AI Builders Challenge 2026 · June Football Challenge**

[![IBM Granite](https://img.shields.io/badge/IBM-Granite-00b4ff)](https://ibm.com/granite)
[![LangChain](https://img.shields.io/badge/LangChain-IBM-00b4ff)](https://python.langchain.com/)
[![Docling](https://img.shields.io/badge/IBM-Docling-00b4ff)](https://github.com/IBM/docling)
[![Built with IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-00b4ff)](https://bob.ibm.com/)
[![React](https://img.shields.io/badge/React-19-00b4ff)](https://react.dev)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-00b4ff)](https://vercel.com)
[![Emmy](https://img.shields.io/badge/Inspired%20by-Emmy%20Award%20Winner-00b4ff)](https://www.ibm.com/sports)

---

## 📺 Why Match Decoded?

This project sits at the intersection of everything IBM Sports & Entertainment stands for:

**🧠 Innovation with purpose** — What happens when you take IBM's Emmy-winning sports AI (Wimbledon Highlights, US Open commentary, ESPN Fantasy Football) and ask: *"What comes next?"* The answer: not just showing *what* happened, but explaining *why* it happened. Raw data → Granite narrative → fan understanding.

**🌍 Social impact through access** — Football intelligence has always been locked inside broadcast production trucks and analytics departments. Match Decoded gives it away for **free, on any device, in any country, with no login required.** A fan in Lagos, São Paulo, or Jakarta gets the same AI analyst as a network broadcaster. This is what democratizing sports knowledge looks like.

**⚡ Innovation that serves people** — Not a black-box prediction. A transparent AI analyst that explains its reasoning in plain English. Every prediction is traceable. Every narrative is generated live by IBM Granite. Designed for the fan, not the data scientist.

---

## 🌐 Try It Live

| Frontend | URL |
|---|---|
| **React App (Primary)** | [match-decoded.vercel.app](https://match-decoded.vercel.app) |
| **Mirror** | [frontend-react-mauve-nu.vercel.app](https://frontend-react-mauve-nu.vercel.app) |
| **Streamlit (HF Spaces)** | [agp9-match-decoded.hf.space](https://agp9-match-decoded.hf.space) |
| **Backend API (Render)** | [match-decoded-api.onrender.com](https://match-decoded-api.onrender.com/health) |

---

## 🏟️ The Problem: The Billion-Fan Information Gap

**It's World Cup semi-final day. Argentina vs Brazil. 80,000 fans in the stadium. A billion watching worldwide.**

The pundits argue. The stats flash on screen. The betting odds shift. But the average fan still asks one question:

> *"WHY is Argentina favoured? What makes Messi's Argentina different from the teams that lost before? Is it form? History? The venue?"*

For 154 years and 49,000 international matches, that answer lived inside analytics departments, broadcast production trucks, and betting models that fans never had access to. **Match Decoded gives every fan an AI analyst — powered by IBM Granite — to decode any match, in plain English, in seconds. Just like IBM did for Wimbledon highlights and ESPN fantasy football.**

---

## 🧠 The Solution: Fan Engagement Through Explainability

Match Decoded is not a score predictor. It's a **fan education platform** — an AI analyst that explains *why* outcomes are likely, using IBM Granite to generate narratives that anyone can understand.

| The Fan's Question | What Match Decoded Delivers |
|---|---|
| "Who do you think will win?" | **"Here's WHY — Granite breaks down the 8 factors driving this prediction"** |
| "What if they played at home?" | **Live what-if simulator — Granite explains the delta in context** |
| "Was Brazil 1970 really better?" | **Legends Matchup — cross-era Granite comparison with storytelling** |
| "The pundit says X. Is that right?" | **Full decision trace — 8 feature importance bars, no black box** |
| "What was the key moment?" | **Momentum timeline — Granite narrates the 90-minute story** |
| "Is the model smarter than the market?" | **Model vs betting odds — The Edge detects undervalued picks** |

---

## 🔧 IBM Technologies at the Core

| # | Technology | How We Use It | Status |
|---|---|---|---|
| 1 | **IBM Granite 3.1-2B** | Core AI engine — generates tactical previews, decision explanations, momentum analysis, legends matchups, and match report analysis via HuggingFace Inference API | ✅ Live on Render |
| 2 | **LangChain** | `ChatPromptTemplate` for all 5 prompt types — structured, type-safe prompt engineering that turns raw data into fan-friendly narratives | ✅ Live |
| 3 | **IBM Docling** | PDF match report parser — extracts structured text from football report PDFs, feeds parsed data to Granite for AI analysis | ✅ Integrated |
| 4 | **IBM Bob** | AI code assistant used throughout development — architecture, debugging, deployment | ✅ Documented |

### Why Granite Is the Star

Every line of analysis in Match Decoded is **Granite-generated**, not templated. The tactical preview, the decision trace explanation, the momentum timeline narrative, the legends debate, the what-if delta analysis — all generated live by IBM Granite via the HuggingFace Inference API.

---

## ✨ Features

### 📊 Pre-Match Preview
Pick any two teams from 50+ international sides. See predicted outcome with probability breakdown, model vs market odds comparison, The Edge (undervalued/overpriced detection), predicted scoreline, tactical insight cards, and a **Granite-generated tactical preview** explaining WHY one team has the edge.

### 🔀 What-If Simulator
Adjust venue (neutral/home), tournament type (major/friendly), and recent form sliders for both teams. Watch the prediction shift in real time on an interactive scoreboard. **Granite explains the delta** — what changed and why. See the 90-minute momentum timeline with key events.

### 🏆 Legends Matchup
Cross-era comparisons — Brazil 1970 vs Germany 2014? England 1966 vs France 2018? Interactive radar chart comparing 5 performance dimensions. **Granite settles the debate** with statistical context and passionate football storytelling.

### 📋 Match Report Analyzer (Docling)
Upload a football match report PDF. **IBM Docling** extracts the text. **Granite + LangChain** analyzes the tactics, key moments, and what decided the match.

### 🔍 Decision Trace
Every prediction is fully transparent. View 8 feature importance bars, Granite's natural language explanation of the model's reasoning, model accuracy, and a momentum timeline chart showing how probability swings over 90 minutes.

---

## 🏗️ Architecture

```
                       Fans (Web + Mobile)
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
    ┌────────────────────┐       ┌──────────────────┐
    │  React Frontend    │       │  Streamlit App   │
    │  (Vercel · Live)   │       │  (HF Spaces)     │
    │  • Pre-Match       │       │  • Same features │
    │  • What-If         │       │  • Standalone    │
    │  • Legends         │       │  • No backend    │
    │  • Decision Trace  │       │                  │
    │  • Docling Upload  │       │                  │
    └────────┬───────────┘       └──────────────────┘
             │                                   
             ▼                                   
    ┌──────────────────────────────────────────┐
    │         FastAPI Backend (Render)         │
    │  /predict  /explain  /momentum /legends │
    │  /docling/analyze  /health              │
    └────────┬──────────┬──────────┬──────────┘
             ▼          ▼          ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  Random  │ │ LangChain│ │  IBM     │
    │  Forest  │ │  Prompt  │ │  Docling │
    │  Model   │ │ Templates│ │  Parser  │
    └──────────┘ └─────┬────┘ └──────────┘
                       ▼
                ┌───────────┐
                │IBM Granite│
                │ 3.1-2B    │
                │(HF API)   │
                └───────────┘
```

---

## 📺 Partnership Potential

| Partner | How Match Decoded Could Extend Their Experience |
|---|---|
| **FIFA / World Cup** | Real-time match explainability for broadcasters — "Why the favourite is struggling" |
| **UEFA Champions League** | Post-match tactical breakdowns powered by Granite for the UEFA website and app |
| **ESPN / Sky Sports** | AI-generated pre-match and post-match analysis segments — like ESPN Fantasy Football insights, but for real matches |
| **Wimbledon (IBM Partner)** | Extend AI Highlights with "Why This Moment Mattered" — Granite explaining the turning point |
| **The Masters (IBM Partner)** | "Why the leaderboard shifted" — Granite analysis of tournament dynamics |
| **Premier League** | Match-by-match fan education — helping global fans understand tactical narratives |
| **Betting Operators** | Explainable odds — "Why the model disagrees with the market" for responsible gambling |

---

## 🌍 Social Impact — Knowledge Is a Right, Not a Privilege

Pamela Jacob leads IBM's North America CSR — SkillsBuild, AI education, and using technology as a force for equity. Match Decoded was built in that same spirit.

| CSR Principle | How Match Decoded Delivers |
|---|---|
| **Democratizing access** | Free, no login, no paywall. Works on any phone or browser — a fan in any country gets the same AI analyst as a broadcaster |
| **Education through AI** | Teaches fans to think critically about match analysis — "Why is Argentina favoured?" becomes a learning moment about form, history, and context |
| **Responsible, transparent AI** | Every prediction comes with a full decision trace — 8 feature importance bars + Granite's natural language reasoning. No black box. The fan can verify the AI's thinking |
| **Global reach** | Football is the world's game (3.5B fans). Web app means zero installation. Works in low-bandwidth environments |
| **Built with IBM SkillsBuild mindset** | The same open, accessible philosophy — take powerful technology and put it directly into the hands of people who need it most |

> *"The goal isn't to predict scores. It's to help a billion fans understand the game they love — starting with the question: WHY."*

---

## 🎯 Judging Criteria Alignment

| Criterion | How Match Decoded Delivers |
|---|---|
| **Fan Engagement** | Broadcast-quality UI with stadium atmosphere, gold trophy theme, glassmorphic cards. Every feature serves one purpose: helping a fan understand the game better. No technical jargon unless explained. |
| **Sports AI Innovation** | First platform to combine Granite-generated tactical narratives + what-if simulation + cross-era legends comparison + momentum timeline + model-vs-market odds comparison + PDF report analysis in a single fan-facing experience. |
| **IBM Technology Showcase** | 4 IBM technologies working together: Granite (the voice), LangChain (the structure), Docling (the input), Bob (the builder). Granite is the star — every narrative is live-generated, not templated. |
| **Challenge Fit** | Football theme with World Cup context. "Every fan deserves to know why" — directly aligned with IBM's sports partnership mission of fan education through AI. |
| **Feasibility & Polish** | Live at 4 URLs (React + Streamlit + Backend API + GitHub). Free tier deployment (Vercel + Render + HF Spaces). Mobile responsive. Works with or without backend. 50+ teams ready instantly. |
| **Explainability** | Every prediction fully traceable: 8 feature importance bars, Granite natural language reasoning, model accuracy, market comparison. No black box. Designed for the non-technical fan. |
| **Production Quality** | Stadium background, 3D gold trophy logo, ESPN-style scoreboards, Recharts radar + timeline charts, glassmorphic design system, consistent navy/gold broadcast palette. |

---

## 🎬 Demo Video Script

```
[OPEN with stadium atmosphere — crowd roar fades in]

"It's World Cup semi-final day. A billion people are watching.

But here's the question IBM has been answering at Wimbledon,
the US Open, and with ESPN Fantasy Football:

How do you make the game make sense — for every fan in the stands,
and every viewer at home?

That's what Match Decoded does. For football.

[OPEN APP — the gold trophy logo, stadium background, broadcast UI]

I select Argentina vs Brazil — the biggest rivalry in world football.
One click. And IBM Granite delivers a full tactical preview.

Not just 'Argentina is favoured.' But WHY.
Because of Messi's recent form. Because of head-to-head history.
Because of tournament pressure. Granite explains it all.

[Show What-If — toggle Neutral venue]

What if this was at the Maracanã? I slide the venue toggle.
The prediction shifts. Granite explains the delta —
what changed, and why a home crowd matters in a World Cup semi.

[Show Momentum Timeline]

Every match has a story. The momentum timeline shows how probability
swings over 90 minutes. Red card? Penalty? Late equalizer?
Granite narrates each turning point.

[Show Model vs Market — The Edge]

Is our AI smarter than the betting market?
The Edge compares both — and highlights where the model disagrees.
For fans who want to go beyond the odds.

[Show Decision Trace]

And every prediction is transparent. Eight factors.
Granite's reasoning. Model accuracy. No black box.

Wimbledon got AI highlights. ESPN got AI fantasy insights.
Now football fans get something neither had before:

A Granite-powered analyst in their pocket.

Match Decoded — powered by IBM Granite, LangChain, Docling, and IBM Bob.

Every fan deserves to know WHY."
```

---

## 🚀 Quick Start

### React (Primary Frontend)
```bash
git clone https://github.com/agp-369/match-decoded.git
cd match-decoded/frontend-react
npm install
echo "VITE_API_URL=https://match-decoded-api.onrender.com" > .env
npm run dev
```
Open `http://localhost:3000`

### Streamlit (Standalone)
```bash
git clone https://github.com/agp-369/match-decoded.git
cd match-decoded
pip install -r requirements.txt
streamlit run frontend/app.py
```
Open `http://localhost:8501`

---

## 📁 Project Structure

```
match-decoded/
├── backend/                  # FastAPI on Render
│   ├── main.py              # 6 API endpoints
│   ├── model.py             # Random Forest
│   ├── granite.py           # IBM Granite integration
│   ├── langchain_prompts.py # 5 prompt templates
│   └── docling_parser.py    # IBM Docling
├── frontend/                 # Streamlit (HF Spaces)
├── frontend-react/           # React (Vercel)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── components/
│   │   └── index.css
│   └── package.json
├── models/                   # Trained RF model
├── render.yaml               # Render deployment
├── scripts/train_model.py
└── README.md
```

---

## 👨‍💻 Built With

| Technology | Purpose |
|---|---|
| **IBM Granite 3.1-2B** | AI match explainability (live via HF API) |
| **LangChain** | Structured prompt engineering (5 templates) |
| **IBM Docling** | PDF match report parsing |
| **IBM Bob** | AI code assistant |
| **React 19 + Vite** | Interactive frontend |
| **Recharts** | Radar + line chart visualizations |
| **FastAPI** | Backend API |
| **scikit-learn** | Random Forest prediction model (49 teams) |
| **Vercel + Render** | Production deployment (free tier) |
| **HuggingFace Spaces** | Streamlit deployment (free tier) |

---

## 📝 License

Apache 2.0 — Built for the IBM AI Builders Challenge 2026

---

<div align="center">
  <em>Every fan deserves to know why their team won or lost.</em><br/>
  <em>Inspired by the Emmy-winning work of IBM Sports & Entertainment Partnerships.</em><br/>
  <strong>Match Decoded</strong> — IBM AI Builders Challenge 2026
</div>
