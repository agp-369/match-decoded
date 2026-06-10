"""
LangChain prompt templates for Match Decoded — IBM Granite integration
"""
from langchain.prompts import ChatPromptTemplate
from langchain.schema import SystemMessage, HumanMessage

SYSTEM_PROMPT = """You are Match Decoded, a football AI explainer powered by IBM Granite. Your role is to explain soccer matches to fans in clear, engaging language.

Rules:
- Always start with "IBM Granite — "
- Explain WHY, not just WHAT
- Be specific — reference team names, stats, and probabilities
- Write for a fan audience (plain English, not technical jargon)
- Keep responses under 150 words
- Never claim to predict the future with certainty — always note probabilities"""

PREVIEW_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=SYSTEM_PROMPT),
    HumanMessage(content=(
        "Preview the match {team_a} vs {team_b}. "
        "{team_a} has {prob_a_pct}% win probability, draw {prob_draw_pct}%, "
        "{team_b} has {prob_b_pct}%. "
        "{team_a} stats: win rate {winrate_a}, "
        "avg goals {goal_avg_a}, recent form {form_a}. "
        "{team_b} stats: win rate {winrate_b}, "
        "avg goals {goal_avg_b}, recent form {form_b}. "
        "{venue}. "
        "{tournament}. "
        "Write a tactical preview explaining WHY one team has the edge."
    )),
])

EXPLAIN_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=SYSTEM_PROMPT),
    HumanMessage(content=(
        "A match prediction gives {prob_a_pct}% home win, "
        "{prob_draw_pct}% draw, {prob_b_pct}% away win. "
        "Top factors: {features}. "
        "Explain why the model predicts this outcome in plain language for a football fan."
    )),
])

MOMENTUM_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=SYSTEM_PROMPT),
    HumanMessage(content=(
        "In a match between {team_a} and {team_b}, the current prediction "
        "gives {team_a} {prob_a_pct}% and {team_b} {prob_b_pct}%. "
        "Explain what would need to change in the match for momentum to shift. "
        "Write for a football fan."
    )),
])

DOCLING_ANALYSIS_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=SYSTEM_PROMPT),
    HumanMessage(content=(
        "Analyze the following match report from a football match:\n\n"
        "{report_text}\n\n"
        "Summarize the key moments, tactical insights, and what decided the match. "
        "Write for a football fan who wants to understand WHY the match unfolded this way."
    )),
])

LEGENDS_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=SYSTEM_PROMPT),
    HumanMessage(content=(
        "Compare two football teams from different eras: {team_a} ({era_a}) "
        "vs {team_b} ({era_b}). "
        "{team_a}: win rate {winrate_a}, avg goals {goal_avg_a}, "
        "matches played {matches_a}. "
        "{team_b}: win rate {winrate_b}, avg goals {goal_avg_b}, "
        "matches played {matches_b}. "
        "Explain who had the stronger legacy and WHY. "
        "Write passionately for football fans who love historical debates."
    )),
])
