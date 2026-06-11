"""
LangChain prompt templates for Match Decoded — IBM Granite integration
Multilingual: supports EN, ES, FR, PT, DE
"""
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage

LANG_NAMES = {"en": "English", "es": "Spanish", "fr": "French", "pt": "Portuguese", "de": "German"}
LANG_INSTRUCTIONS = {
    "en": "Write in English.",
    "es": "Escribe en español.",
    "fr": "Écrivez en français.",
    "pt": "Escreva em português.",
    "de": "Schreiben Sie auf Deutsch.",
}

def _sys(lang: str = "en") -> str:
    li = LANG_INSTRUCTIONS.get(lang, LANG_INSTRUCTIONS["en"])
    return f"""You are Match Decoded, a football AI explainer powered by IBM Granite. Your role is to explain soccer matches to fans in clear, engaging language.

Rules:
- Explain WHY, not just WHAT — focus on causes, context, and meaning
- Be specific — reference team names, stats, and probabilities
- Write for a fan audience (plain language, no technical jargon)
- Keep responses under 150 words unless asked for more detail
- Never claim to predict the future with certainty — always note probabilities
- {li}"""

def make_prompt(template: ChatPromptTemplate, lang: str = "en") -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        SystemMessage(content=_sys(lang)),
        *template.messages[1:],
    ])

PREVIEW_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=_sys()),
    HumanMessage(content=(
        "Preview the match {team_a} vs {team_b}. "
        "{team_a} has {prob_a_pct}% win probability, draw {prob_draw_pct}%, "
        "{team_b} has {prob_b_pct}%. "
        "{team_a} stats: win rate {winrate_a}, "
        "avg goals {goal_avg_a}, recent form {form_a}. "
        "{team_b} stats: win rate {winrate_b}, "
        "avg goals {goal_avg_b}, recent form {form_b}. "
        "{venue}. {tournament}. "
        "Write a tactical preview explaining WHY one team has the edge."
    )),
])

EXPLAIN_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=_sys()),
    HumanMessage(content=(
        "A match prediction gives {prob_a_pct}% home win, "
        "{prob_draw_pct}% draw, {prob_b_pct}% away win. "
        "Top factors: {features}. "
        "Explain why the model predicts this outcome in plain language for a football fan."
    )),
])

MOMENTUM_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=_sys()),
    HumanMessage(content=(
        "In a match between {team_a} and {team_b}, the current prediction "
        "gives {team_a} {prob_a_pct}% and {team_b} {prob_b_pct}%. "
        "Explain what would need to change in the match for momentum to shift. "
        "Write for a football fan."
    )),
])

TACTICAL_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=_sys()),
    HumanMessage(content=(
        "Analyze the tactical matchup between {team_a} and {team_b}. "
        "{team_a} has {prob_a_pct}% win probability, draw {prob_draw_pct}%, "
        "{team_b} has {prob_b_pct}%. "
        "{team_a} recent form: {form_a_pct}%, {team_b} recent form: {form_b_pct}%. "
        "{team_a} avg goals: {goal_avg_a}, {team_b} avg goals: {goal_avg_b}. "
        "This is a {venue_desc} in a {tournament_desc}. "
        "Answer these questions:\n"
        "1. WHY does the prediction favor one team?\n"
        "2. WHAT tactical change could flip the match?\n"
        "3. HOW might the match unfold tactically?\n"
        "Write for a football fan who wants to understand the tactical story."
    )),
])

VAR_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=_sys()),
    HumanMessage(content=(
        "A football fan is asking about a VAR (Video Assistant Referee) decision "
        "in a match between {team_a} and {team_b}. "
        "The scenario involves: {scenario}. "
        "Explain the VAR decision process in plain language:\n"
        "1. What does the law say?\n"
        "2. Why is this decision controversial or clear?\n"
        "3. How does VAR check this?\n"
        "Be educational — help fans understand WHY referees make these calls."
    )),
])

STORY_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=_sys()),
    HumanMessage(content=(
        "Tell the story of a match between {team_a} and {team_b} "
        "as it might unfold based on their real statistics.\n\n"
        "{team_a} stats: win rate {winrate_a}, avg goals {goal_avg_a}, "
        "recent form {form_a_pct}%, {matches_a} matches played.\n"
        "{team_b} stats: win rate {winrate_b}, avg goals {goal_avg_b}, "
        "recent form {form_b_pct}%, {matches_b} matches played.\n\n"
        "Prediction: {team_a} {prob_a_pct}%, Draw {prob_draw_pct}%, {team_b} {prob_b_pct}%.\n"
        "Venue: {venue_desc}. Tournament: {tournament_desc}.\n\n"
        "Write a 3-paragraph match story:\n"
        "1. First half — how does it start? Which team dominates?\n"
        "2. Key moment — what changes the match?\n"
        "3. Final outcome — how does it end?\n"
        "Focus on WHY things happen tactically, not just what happens."
    )),
])

LEGENDS_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=_sys()),
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

TEACH_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=_sys()),
    HumanMessage(content=(
        "A football fan asks: '{question}'. "
        "Answer in plain language for a beginner audience. "
        "Explain the concept clearly with examples from real matches "
        "or World Cup history. Keep it under 150 words."
    )),
])
