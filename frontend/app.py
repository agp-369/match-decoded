"""
Match Decoded — AI Football Match Explainer
Powered by IBM Granite + LangChain + Docling
"""
import os
import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="Match Decoded",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── GLASSMORPHIC STADIUM THEME ─────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
    * { font-family: 'Outfit', sans-serif; }
    .main > div { padding: 0 2rem; }
    .stApp {
        background: linear-gradient(135deg, #0a0a1a 0%, #0f0f2a 40%, #141430 100%);
    }
    .block-container { max-width: 1300px; }
    h1, h2, h3 { color: #f0f0ff; font-weight: 700; }
    h1 { font-size: 2.8rem !important; background: linear-gradient(135deg, #00d4ff, #7b2ff7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .glass-card {
        background: rgba(255,255,255,0.03);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        padding: 1.5rem;
        margin: 0.8rem 0;
        transition: all 0.3s ease;
    }
    .glass-card:hover { border-color: rgba(0,212,255,0.3); transform: translateY(-2px); }
    .granite-box {
        background: linear-gradient(135deg, rgba(0,20,50,0.6), rgba(20,0,60,0.4));
        backdrop-filter: blur(16px);
        border-left: 4px solid #00d4ff;
        border-radius: 12px;
        padding: 1.4rem;
        margin: 1rem 0;
        color: #d0e0f0;
        font-size: 1rem;
        line-height: 1.7;
        box-shadow: 0 0 40px rgba(0,212,255,0.08);
    }
    .granite-box::before {
        content: "🧠 IBM Granite";
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: #00d4ff;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 0.6rem;
    }
    .stProgress > div > div { background: linear-gradient(90deg, #00d4ff, #7b2ff7); }
    .footer {
        text-align: center;
        color: #404060;
        font-size: 0.75rem;
        margin-top: 3rem;
        padding: 1.5rem;
        border-top: 1px solid rgba(255,255,255,0.04);
    }
    div[data-testid="stMetricValue"] {
        font-size: 2.2rem !important;
        font-weight: 800 !important;
        background: linear-gradient(135deg, #f0f0ff, #a0a0d0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    div[data-testid="stMetricLabel"] { color: #7070a0 !important; font-size: 0.85rem !important; }
    div[data-testid="stMetric"] {
        background: rgba(255,255,255,0.03);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 1rem;
    }
    .stButton > button {
        background: linear-gradient(135deg, #00d4ff, #7b2ff7) !important;
        border: none !important;
        color: white !important;
        font-weight: 600 !important;
        border-radius: 10px !important;
        padding: 0.6rem 1.5rem !important;
        transition: all 0.3s ease !important;
    }
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0,212,255,0.3) !important;
    }
    .stSelectbox label, .stCheckbox label { color: #8080b0 !important; font-weight: 500 !important; }
    .stSelectbox > div > div {
        background: rgba(255,255,255,0.04) !important;
        border: 1px solid rgba(255,255,255,0.08) !important;
        border-radius: 10px !important;
        color: #e0e0f0 !important;
    }
    .stTabs [data-baseweb="tab-list"] { gap: 0.5rem; }
    .stTabs [data-baseweb="tab"] {
        background: rgba(255,255,255,0.03) !important;
        border-radius: 10px 10px 0 0 !important;
        padding: 0.6rem 1.2rem !important;
        font-weight: 600 !important;
    }
    .stTabs [aria-selected="true"] {
        background: rgba(0,212,255,0.1) !important;
        border-bottom: 2px solid #00d4ff !important;
    }
    .stExpander { background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid rgba(255,255,255,0.04); }
    .tech-badge {
        display: inline-block;
        background: rgba(0,212,255,0.1);
        border: 1px solid rgba(0,212,255,0.2);
        border-radius: 20px;
        padding: 0.2rem 0.8rem;
        font-size: 0.7rem;
        color: #00d4ff;
        margin: 0.15rem;
        font-weight: 500;
    }
    .upload-section {
        border: 2px dashed rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        background: rgba(255,255,255,0.02);
        transition: all 0.3s ease;
    }
    .upload-section:hover { border-color: rgba(0,212,255,0.4); background: rgba(0,212,255,0.03); }
    .stTable { background: transparent !important; }
    .stTable td, .stTable th { color: #c0c0e0 !important; background: transparent !important; border-color: rgba(255,255,255,0.05) !important; }
    .stPlotlyChart { background: transparent !important; }
</style>
""", unsafe_allow_html=True)

# ─── API ─────────────────────────────────────────
API_URL = os.environ.get("API_URL", "http://localhost:8000")


def call_api(endpoint: str, payload: dict = None, method: str = "POST") -> dict:
    try:
        url = f"{API_URL}{endpoint}"
        if method == "GET":
            r = requests.get(url, timeout=10)
        else:
            r = requests.post(url, json=payload, timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        st.error(f"API error: {e}")
        return None


def call_api_upload(endpoint: str, files: dict) -> dict:
    try:
        r = requests.post(f"{API_URL}{endpoint}", files=files, timeout=60)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        st.error(f"Upload error: {e}")
        return None


def get_teams() -> list:
    try:
        r = requests.get(f"{API_URL}/teams", timeout=5)
        r.raise_for_status()
        return r.json().get("teams", [])
    except:
        return ["Brazil", "Argentina", "Germany", "France", "England", "Spain",
                "Italy", "Netherlands", "Portugal", "Belgium", "Croatia",
                "Uruguay", "Colombia", "Morocco", "Japan", "South Korea",
                "Senegal", "Switzerland", "USA", "Mexico", "Australia"]


# ─── HEADER ──────────────────────────────────────
col1, col2, col3 = st.columns([1, 8, 3])
with col1:
    st.markdown("# ⚽")
with col2:
    st.markdown("# Match Decoded")
    st.markdown("<span class='tech-badge'>IBM Granite</span> <span class='tech-badge'>LangChain</span> <span class='tech-badge'>Docling</span> <span class='tech-badge'>IBM Bob</span>", unsafe_allow_html=True)
with col3:
    st.markdown("### ")
    st.markdown("<div style='text-align:right; color:#505070; font-size:0.85rem;'>Every fan deserves to know <strong style='color:#8080b0;'>WHY</strong></div>", unsafe_allow_html=True)

st.divider()

teams = get_teams()

# ─── 4 TABS ──────────────────────────────────────
tab_preview, tab_sim, tab_legends, tab_trace = st.tabs([
    "🔮 Pre-Match Preview",
    "🔀 What-If Simulator",
    "🏆 Legends Matchup",
    "📋 Match Report Analyzer",
])

# ═══════════════════════════════════════════════════════
# TAB 1: Pre-Match Preview
# ═══════════════════════════════════════════════════════
with tab_preview:
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("### 🏟️ Match Preview")
    st.markdown("Select two teams. IBM Granite + LangChain deliver a tactical breakdown of what to expect.")
    c1, c2 = st.columns(2)
    with c1:
        team_a = st.selectbox("Home / Team A", teams, index=teams.index("Brazil") if "Brazil" in teams else 0, key="t1a")
    with c2:
        team_b = st.selectbox("Away / Team B", teams, index=teams.index("Argentina") if "Argentina" in teams else 1, key="t1b")
    cc1, cc2 = st.columns(2)
    with cc1:
        neutral = st.checkbox("Neutral venue", value=True, key="t1n")
    with cc2:
        major = st.checkbox("Major tournament", value=True, key="t1m")
    if st.button("🔮 Decode Match", type="primary", use_container_width=True, key="t1btn"):
        if team_a == team_b:
            st.error("Please select two different teams.")
        else:
            with st.spinner("Analyzing 49,000 matches with IBM Granite + LangChain..."):
                result = call_api("/explain/preview", {
                    "team_a": team_a, "team_b": team_b,
                    "is_neutral": neutral, "is_major_tournament": major,
                })
            if result:
                pred = result["prediction"]
                narrative = result["narrative"]
                st.markdown("### 📊 Prediction")
                mc1, mc2, mc3 = st.columns(3)
                mc1.metric(f"{pred['team_a']} Win", f"{pred['team_a_win_prob']*100:.1f}%")
                mc2.metric("Draw", f"{pred['draw_prob']*100:.1f}%")
                mc3.metric(f"{pred['team_b']} Win", f"{pred['team_b_win_prob']*100:.1f}%")
                st.progress(pred['team_a_win_prob'], text=f"{pred['team_a']}")
                st.progress(pred['draw_prob'], text="Draw")
                st.progress(pred['team_b_win_prob'], text=f"{pred['team_b']}")
                st.markdown(f"<div class='granite-box'>{narrative}</div>", unsafe_allow_html=True)
                st.markdown("### 📋 Team Stats Comparison")
                df_s = pd.DataFrame({
                    "Stat": ["Win Rate", "Avg Goals", "Recent Form", "Matches"],
                    pred['team_a']: [f"{pred['stats_a']['winrate']:.1%}", f"{pred['stats_a']['goal_avg']:.2f}", f"{pred['stats_a']['recent_form']:.1%}", pred['stats_a']['matches_played']],
                    pred['team_b']: [f"{pred['stats_b']['winrate']:.1%}", f"{pred['stats_b']['goal_avg']:.2f}", f"{pred['stats_b']['recent_form']:.1%}", pred['stats_b']['matches_played']],
                })
                st.table(df_s)
    st.markdown("</div>", unsafe_allow_html=True)

    with st.expander("How does this work?"):
        st.markdown("""
        - **Prediction model**: Random Forest (55.8% accuracy vs 47.2% baseline) trained on 49K international matches
        - **AI narration**: IBM Granite 3.1-2B via LangChain prompt templates generates tactical previews
        - **Features**: 8 factors — win rates, goal averages, recent form, venue, tournament type
        - **Training**: Matches pre-2018 for training, 2018+ for testing — no data leakage
        """)

# ═══════════════════════════════════════════════════════
# TAB 2: What-If Simulator
# ═══════════════════════════════════════════════════════
with tab_sim:
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("### 🔀 What-If Simulator")
    st.markdown("Change venue and tournament type. Watch the prediction shift in real time. IBM Granite explains the delta.")
    c1, c2 = st.columns(2)
    with c1:
        sim_a = st.selectbox("Team A", teams, index=teams.index("Germany") if "Germany" in teams else 0, key="t2a")
    with c2:
        sim_b = st.selectbox("Team B", teams, index=teams.index("Brazil") if "Brazil" in teams else 1, key="t2b")
    s1, s2 = st.columns(2)
    with s1:
        sim_neutral = st.checkbox("Neutral venue", value=True, key="t2n")
    with s2:
        sim_major = st.checkbox("Major tournament", value=True, key="t2m")
    if st.button("🔀 Simulate", type="primary", use_container_width=True, key="t2btn"):
        if sim_a == sim_b:
            st.error("Please select two different teams.")
        else:
            with st.spinner("Running comparison..."):
                r1 = call_api("/predict", {"team_a": sim_a, "team_b": sim_b, "is_neutral": True, "is_major_tournament": True})
                r2 = call_api("/predict", {"team_a": sim_a, "team_b": sim_b, "is_neutral": sim_neutral, "is_major_tournament": sim_major})
            if r1 and r2:
                sc1, sc2 = st.columns(2)
                with sc1:
                    st.markdown("**Baseline** (Neutral + Tournament)")
                    sc1.metric(f"{r1['team_a']} Win", f"{r1['team_a_win_prob']*100:.1f}%")
                    sc1.metric("Draw", f"{r1['draw_prob']*100:.1f}%")
                    sc1.metric(f"{r1['team_b']} Win", f"{r1['team_b_win_prob']*100:.1f}%")
                with sc2:
                    vl = "Neutral" if sim_neutral else f"{sim_a} Home"
                    tl = "Tournament" if sim_major else "Friendly"
                    st.markdown(f"**Scenario** ({vl} + {tl})")
                    sc2.metric(f"{r2['team_a']} Win", f"{r2['team_a_win_prob']*100:.1f}%")
                    sc2.metric("Draw", f"{r2['draw_prob']*100:.1f}%")
                    sc2.metric(f"{r2['team_b']} Win", f"{r2['team_b_win_prob']*100:.1f}%")
                st.markdown("### Delta")
                da, db, dd = (r2['team_a_win_prob'] - r1['team_a_win_prob'])*100, (r2['team_b_win_prob'] - r1['team_b_win_prob'])*100, (r2['draw_prob'] - r1['draw_prob'])*100
                cc = st.columns(3)
                cc[0].metric(f"{r2['team_a']} Δ", f"{da:+.1f}%")
                cc[1].metric("Draw Δ", f"{dd:+.1f}%")
                cc[2].metric(f"{r2['team_b']} Δ", f"{db:+.1f}%")
                with st.spinner("IBM Granite analyzing the delta..."):
                    dn = call_api("/explain/momentum", {"team_a": sim_a, "team_b": sim_b, "is_neutral": sim_neutral, "is_major_tournament": sim_major})
                if dn:
                    st.markdown("### 🧠 IBM Granite — Scenario Analysis")
                    st.markdown(f"<div class='granite-box'>{dn['analysis']}</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════
# TAB 3: Legends Matchup
# ═══════════════════════════════════════════════════════
with tab_legends:
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("### 🏆 Legends Matchup")
    st.markdown("Compare teams across eras. Who had the stronger legacy? IBM Granite settles the debate.")
    eras = ["1870s-1890s (Early football)", "1900s-1920s (Pre-WWII)", "1930s-1950s (Golden age)", "1960s-1980s (Modern foundations)", "1990s-2000s (Global era)", "2010s-Present (Modern era)"]
    c1, c2 = st.columns(2)
    with c1:
        lg_a = st.selectbox("Team A", teams, index=teams.index("Brazil") if "Brazil" in teams else 0, key="t3a")
        era_a = st.selectbox("Era", eras, index=5, key="t3ea")
    with c2:
        lg_b = st.selectbox("Team B", teams, index=teams.index("Germany") if "Germany" in teams else 1, key="t3b")
        era_b = st.selectbox("Era", eras, index=3, key="t3eb")
    if st.button("🏆 Compare Legends", type="primary", use_container_width=True, key="t3btn"):
        if lg_a == lg_b:
            st.error("Please select two different teams.")
        else:
            with st.spinner("IBM Granite analyzing historical legacies..."):
                result = call_api("/explain/legends", {"team_a": lg_a, "team_b": lg_b, "era_a": era_a, "era_b": era_b})
            if result:
                mc1, mc2 = st.columns(2)
                mc1.metric(f"{result['team_a']} ({result['era_a']})", f"{result['stats_a']['winrate']*100:.1f}% WR")
                mc2.metric(f"{result['team_b']} ({result['era_b']})", f"{result['stats_b']['winrate']*100:.1f}% WR")
                sc1, sc2 = st.columns(2)
                sc1.metric("Avg Goals", f"{result['stats_a']['goal_avg']:.2f}", help=f"{result['team_a']} avg goals per match")
                sc1.metric("Matches Played", f"{result['stats_a']['matches_played']}")
                sc2.metric("Avg Goals", f"{result['stats_b']['goal_avg']:.2f}", help=f"{result['team_b']} avg goals per match")
                sc2.metric("Matches Played", f"{result['stats_b']['matches_played']}")
                st.markdown(f"<div class='granite-box'>{result['narrative']}</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════
# TAB 4: Match Report Analyzer (Docling)
# ═══════════════════════════════════════════════════════
with tab_trace:
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("### 📋 Match Report Analyzer")
    st.markdown("Upload a football match report PDF. **IBM Docling** extracts the text, **IBM Granite + LangChain** analyzes it.")
    st.markdown("<div class='upload-section'>", unsafe_allow_html=True)
    uploaded = st.file_uploader("Upload a match report (PDF)", type="pdf", label_visibility="collapsed")
    if uploaded is not None:
        with st.spinner("Parsing PDF with IBM Docling. Analyzing content with IBM Granite + LangChain..."):
            files = {"file": (uploaded.name, uploaded.getvalue(), "application/pdf")}
            result = call_api_upload("/docling/analyze", files)
        if result:
            st.success(f"Analyzed {result['filename']} ({result['text_length']} chars extracted)")
            if result.get("teams") and result["teams"] != ["Unknown"]:
                st.markdown(f"**Teams detected:** {' vs '.join(result['teams'])}")
            if result.get("score") and result["score"] != "Unknown":
                st.markdown(f"**Score:** {result['score']}")
            if result.get("tournament") and result["tournament"] != "Unknown":
                st.markdown(f"**Tournament:** {result['tournament']}")
            st.markdown("### 🧠 IBM Granite — Analysis")
            st.markdown(f"<div class='granite-box'>{result['analysis']}</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # Decision Trace within this tab too
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.markdown("### 🔍 Decision Trace")
    st.markdown("Every prediction is fully traceable. Select teams to see the model's reasoning.")
    c1, c2 = st.columns(2)
    with c1:
        dt_a = st.selectbox("Team A", teams, index=teams.index("Portugal") if "Portugal" in teams else 0, key="t4a")
    with c2:
        dt_b = st.selectbox("Team B", teams, index=teams.index("France") if "France" in teams else 1, key="t4b")
    dc1, dc2 = st.columns(2)
    with dc1:
        dt_n = st.checkbox("Neutral venue", value=True, key="t4n")
    with dc2:
        dt_m = st.checkbox("Major tournament", value=True, key="t4m")
    if st.button("🔍 Explain", type="primary", use_container_width=True, key="t4btn"):
        if dt_a == dt_b:
            st.error("Please select two different teams.")
        else:
            with st.spinner("Tracing decision path with IBM Granite..."):
                result = call_api("/explain/decision", {"team_a": dt_a, "team_b": dt_b, "is_neutral": dt_n, "is_major_tournament": dt_m})
            if result:
                pred, explanation, features = result["prediction"], result["explanation"], result["feature_importances"]
                mc1, mc2, mc3 = st.columns(3)
                mc1.metric(f"{pred['team_a']} Win", f"{pred['team_a_win_prob']*100:.1f}%")
                mc2.metric("Draw", f"{pred['draw_prob']*100:.1f}%")
                mc3.metric(f"{pred['team_b']} Win", f"{pred['team_b_win_prob']*100:.1f}%")
                st.markdown(f"<div class='granite-box'>{explanation}</div>", unsafe_allow_html=True)
                df_f = pd.DataFrame(features)
                fig = px.bar(df_f, x="importance", y="name", orientation="h",
                             title="What drives the prediction?",
                             color="importance", color_continuous_scale="blues",
                             text_auto=".1%")
                fig.update_layout(height=350, yaxis={"categoryorder": "total ascending"},
                                  plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                                  font_color="#a0a0b8", xaxis_title="Importance", yaxis_title="")
                st.plotly_chart(fig, use_container_width=True)
    st.markdown("</div>", unsafe_allow_html=True)

# ─── FOOTER ──────────────────────────────────────
st.divider()
st.markdown("""
<div class='footer'>
    <strong>Match Decoded</strong> — IBM AI Builders Challenge 2026 · June Football Challenge<br>
    <strong>IBM Technologies:</strong> IBM Granite 3.1-2B · LangChain Prompt Templates · IBM Docling · IBM Bob<br>
    <strong>Built with:</strong> Streamlit · FastAPI · Python 3.11 · Random Forest · 49,000 international matches<br>
    <em>Every fan deserves to understand WHY their team won or lost.</em>
</div>
""", unsafe_allow_html=True)
