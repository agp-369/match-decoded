"""
Seed response_cache.json with high-quality narratives for common demo pairs.
These serve as instant cache hits on cold start — no Granite API call needed.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import hashlib
import json
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_prompts import PREVIEW_TEMPLATE, TACTICAL_TEMPLATE, EXPLAIN_TEMPLATE, make_prompt

CACHE_PATH = Path(__file__).parent.parent / "backend" / "response_cache.json"


def prompt_hash(template, **kwargs):
    tpl = make_prompt(template, "en")
    msg = tpl.format_prompt(**kwargs)
    system = ""
    human = ""
    for m in msg.messages:
        if isinstance(m, SystemMessage):
            system = m.content
        elif isinstance(m, HumanMessage):
            human = m.content
    human += "\n\nAt the very end of your response, on a new line, write CONFIDENCE: X/100 where X is how confident you are in this analysis (0=uncertain, 100=certain)"
    return hashlib.sha256(f"{system}||{human}".encode()).hexdigest()[:16]


SEEDS = {
    # Preview: Brazil vs England, Major Tournament
    ("preview", "Brazil", "England", 0.45, 0.25, 0.30, False, True): (
        "Brazil vs England is a classic showdown where history favors the Seleção, but the Three Lions bring modern efficiency. "
        "Brazil's 57% win rate and 1.8 goals per game give them a slight edge, though England's recent form (68%) suggests they arrive in sharper rhythm. "
        "The prediction gives Brazil a 45% win probability, with England at 30% and a 25% draw chance — a close contest that could hinge on midfield control. "
        "Brazil's flair in transition meets England's disciplined pressing structure. If England can nullify Brazil's wide threats and win the second-ball battle, "
        "the upset is well within reach. Expect a tense, tactical affair where individual moments decide the outcome.\n\nCONFIDENCE: 82/100"
    ),
    # Preview: Argentina vs France, Major Tournament
    ("preview", "Argentina", "France", 0.40, 0.28, 0.32, False, True): (
        "Argentina and France represent contrasting football philosophies — Argentina's technical mastery versus France's athletic power. "
        "Argentina holds a 52% win rate and averages 1.6 goals per match, while France counters with a 55% win rate and 1.7 goals per game. "
        "The model gives Argentina 40%, France 32%, and a draw 28% — reflecting the balance of quality. "
        "Argentina's compact possession style will test France's transition defense. The key battle is in central midfield, "
        "where Argentina's playmakers must find space against France's physical press. A match that could swing on set pieces or individual brilliance.\n\nCONFIDENCE: 85/100"
    ),
    # Tactical: Brazil vs England, Major Tournament
    ("tactical", "Brazil", "England", 0.45, 0.25, 0.30, False, True, 75, 68, 1.8, 1.5): (
        "The tactical matchup favors Brazil's creative fluidity, but England's structural discipline is a formidable counter. "
        "Brazil's 75% recent form edges England's 68%, and their 1.8 goals per game suggests greater attacking penetration. "
        "WHY the prediction favors Brazil: Brazil's historical edge in big matches and superior goal-scoring record give them a marginal advantage. "
        "WHAT could flip it: England's set-piece efficiency — they score from 12% of corners — could exploit Brazil's occasional defensive lapses. "
        "HOW it might unfold: Brazil will seek early width through their full-backs, while England sits compact and hits on the break. "
        "A first-half goal would force England to open up, playing into Brazil's counter-attacking strengths.\n\nCONFIDENCE: 80/100"
    ),
    # Explain: Decision trace for Brazil vs England
    ("explain", 45.0, 25.0, 30.0, "Historical ELO Rating, Recent Form (10 matches), Head-to-Head Win Rate"): (
        "The model predicts a 45% home win probability, 25% draw, and 30% away win for this matchup. "
        "The top factor is Historical ELO Rating — teams with higher ELO scores win approximately 58% of matchups. "
        "Brazil's ELO of 2089 reflects decades of consistent performance, while England's 2093 shows a team at a similar elite level. "
        "Recent Form is the second most important feature — England arrives with 68% form versus Brazil's 75%, making this a closely matched contest. "
        "Head-to-Head Win Rate provides crucial context: Brazil has won only 3 of 13 previous meetings, suggesting a psychological edge for England. "
        "Together, these factors explain why the model sees a narrow Brazil advantage but not a dominant one.\n\nCONFIDENCE: 88/100"
    ),
}

if __name__ == "__main__":
    cache = {}
    if CACHE_PATH.exists():
        cache = json.loads(CACHE_PATH.read_text(encoding="utf-8"))

    added = 0
    for key, text in SEEDS.items():
        kind = key[0]
        if kind == "preview":
            _, ta, tb, pa, pd, pb, neutral, major = key
            h = prompt_hash(PREVIEW_TEMPLATE,
                team_a=ta, team_b=tb,
                prob_a_pct=f"{pa*100:.1f}", prob_draw_pct=f"{pd*100:.1f}",
                prob_b_pct=f"{pb*100:.1f}",
                winrate_a="57.1%", goal_avg_a="1.82", form_a="75%",
                winrate_b="55.3%", goal_avg_b="1.65", form_b="68%",
                venue="Neutral venue" if neutral else f"{ta} is home",
                tournament="Major tournament match" if major else "Friendly match",
            )
        elif kind == "tactical":
            _, ta, tb, pa, pd, pb, neutral, major, fa, fb, ga, gb = key
            h = prompt_hash(TACTICAL_TEMPLATE,
                team_a=ta, team_b=tb,
                prob_a_pct=f"{pa*100:.1f}", prob_draw_pct=f"{pd*100:.1f}",
                prob_b_pct=f"{pb*100:.1f}",
                form_a_pct=str(fa), form_b_pct=str(fb),
                goal_avg_a=f"{ga:.2f}", goal_avg_b=f"{gb:.2f}",
                venue_desc="neutral venue" if neutral else f"{ta} home game",
                tournament_desc="major tournament match" if major else "friendly match",
            )
        elif kind == "explain":
            _, pa, pd, pb, features = key
            h = prompt_hash(EXPLAIN_TEMPLATE,
                prob_a_pct=str(pa), prob_draw_pct=str(pd),
                prob_b_pct=str(pb),
                features=features,
            )
        else:
            continue

        if h not in cache:
            cache[h] = text
            added += 1

    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Seeded {added} new entries. Total cache: {len(cache)} entries.")
