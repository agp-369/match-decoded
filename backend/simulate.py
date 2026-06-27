"""
Live match simulation engine — Match Decoded
Simulates a 90-minute match with AI-generated Granite commentary at key events.
Uses SSE to stream events in real time.
"""
import asyncio
import json
import logging
import random
import time
from typing import AsyncGenerator

from granite import query_granite_chat, AI_AVAILABLE

logger = logging.getLogger(__name__)

EVENT_TYPES = {
    "KICK_OFF": "Kick Off",
    "EARLY_CHANCE": "Early Chance",
    "GOAL": "Goal!",
    "YELLOW_CARD": "Yellow Card",
    "RED_CARD": "Red Card",
    "VAR_REVIEW": "VAR Review",
    "VAR_OVERTURN": "VAR Overturn",
    "PENALTY": "Penalty Awarded",
    "PENALTY_MISSED": "Penalty Missed",
    "TACTICAL_SHIFT": "Tactical Change",
    "SUBSTITUTION": "Substitution",
    "INJURY": "Injury Stoppage",
    "HALF_TIME": "Half Time",
    "SECOND_HALF": "Second Half Kick Off",
    "MOMENTUM_SHIFT": "Momentum Shift",
    "GOAL_DISALLOWED": "Goal Disallowed",
    "WOODWORK": "Hit the Woodwork",
    "FULL_TIME": "Full Time",
}

def _generate_event_description(event_type: str, team_a: str, team_b: str, minute: int, score_a: int, score_b: int) -> str:
    """Generate a structured event description for Granite to comment on."""
    descs = {
        "KICK_OFF": f"The match kicks off between {team_a} and {team_b}.",
        "EARLY_CHANCE": f"{team_a} create the first chance of the match with an incisive through ball.",
        "GOAL": f"GOAL! {team_a} take the lead! Score is now {team_a} {score_a} - {score_b} {team_b}.",
        "GOAL_AGAINST": f"GOAL! {team_b} equalize! Score is now {team_a} {score_a} - {score_b} {team_b}.",
        "YELLOW_CARD": f"Yellow card shown to a {team_a} player for a tactical foul.",
        "RED_CARD": f"RED CARD! A {team_a} player is sent off! {team_a} down to 10 men.",
        "VAR_REVIEW": f"VAR check underway for a potential incident in the {team_b} penalty area.",
        "VAR_OVERTURN": f"VAR review complete — the on-field decision has been overturned!",
        "PENALTY": f"PENALTY to {team_a}! The referee points to the spot after a foul in the box.",
        "PENALTY_MISSED": f"The penalty is SAVED! {team_b}'s goalkeeper keeps it out!",
        "TACTICAL_SHIFT": f"{team_a} are shifting to a more attacking formation, pushing players forward.",
        "SUBSTITUTION": f"Double substitution for {team_b} — fresh legs to change the game.",
        "INJURY": f"Play stopped — a {team_a} player is down receiving treatment.",
        "HALF_TIME": f"Half time! {team_a} {score_a} - {score_b} {team_b}. A chance for both sides to regroup.",
        "SECOND_HALF": f"The second half is underway! {team_a} restart the action.",
        "MOMENTUM_SHIFT": f"Momentum swinging {team_a}'s way after a dominant passage of play.",
        "GOAL_DISALLOWED": f"GOAL DISALLOWED! The flag goes up for offside. Score remains {team_a} {score_a} - {score_b} {team_b}.",
        "WOODWORK": f"Shot crashes off the crossbar for {team_b}! So close to a goal!",
        "FULL_TIME": f"Full time! The final whistle blows. {team_a} {score_a} - {score_b} {team_b}.",
    }
    return descs.get(event_type, f"Match event at {minute}'.")

async def _granite_commentary(event_type: str, team_a: str, team_b: str, minute: int,
                               score_a: int, score_b: int, stats_a: dict, stats_b: dict) -> str:
    """Call Granite for AI commentary on a match event (non-blocking via to_thread)."""
    label = EVENT_TYPES.get(event_type, "Match Event")
    desc = _generate_event_description(event_type, team_a, team_b, minute, score_a, score_b)

    system = (
        "You are a football commentator powered by IBM Granite. "
        "Provide 2-3 sentences of insightful, engaging commentary about this match event. "
        "Explain WHY it matters tactically or emotionally. "
        "Be specific — mention team names, the scoreline, and the match context. "
        "Write in plain English for a global audience of football fans."
    )
    user = (
        f"Match minute: {minute}'\n"
        f"Event: {label}\n"
        f"Description: {desc}\n"
        f"Current score: {team_a} {score_a} - {score_b} {team_b}\n"
        f"{team_a} stats: win rate {stats_a.get('winrate', 0.5):.1%}, form {stats_a.get('form', 0.5):.1%}\n"
        f"{team_b} stats: win rate {stats_b.get('winrate', 0.5):.1%}, form {stats_b.get('form', 0.5):.1%}\n\n"
        f"Provide commentary on this event and how it affects the match."
    )

    try:
        return await asyncio.to_thread(query_granite_chat, system, user, 120)
    except Exception as e:
        logger.warning(f"Granite commentary failed: {e}")
        return "An intriguing moment in this match — one that could shift the balance."


def _simulate_events(team_a: str, team_b: str, prob_a: float, prob_b: float, seed: int):
    """
    Generate a deterministic sequence of match events based on team probabilities.
    Returns list of (minute, event_type) tuples.
    """
    rng = random.Random(seed)
    events = []

    # Goal chances based on team strength
    a_goals = 0
    b_goals = 0
    goal_scale = max(1, int(2 * (prob_a + prob_b)))

    # Generate event timeline
    minute = 0
    while minute < 90:
        minute += rng.randint(2, 6)
        if minute > 90:
            break

        # Determine event type by probability weights
        roll = rng.random()
        if roll < 0.15 * prob_a * 2:
            # Goal for team A
            a_goals += 1
            events.append((minute, "GOAL", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2:
            # Goal for team B
            b_goals += 1
            events.append((minute, "GOAL_AGAINST", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.08:
            events.append((minute, "YELLOW_CARD", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.12:
            if rng.random() < 0.3:
                events.append((minute, "RED_CARD", a_goals, b_goals))
            else:
                events.append((minute, "YELLOW_CARD", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.18:
            events.append((minute, "VAR_REVIEW", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.22:
            events.append((minute, "PENALTY", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.28:
            events.append((minute, "TACTICAL_SHIFT", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.32:
            events.append((minute, "WOODWORK", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.36:
            events.append((minute, "SUBSTITUTION", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.40:
            events.append((minute, "INJURY", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.44:
            events.append((minute, "MOMENTUM_SHIFT", a_goals, b_goals))
        elif roll < 0.15 * (prob_a + prob_b) * 2 + 0.48:
            events.append((minute, "GOAL_DISALLOWED", a_goals, b_goals))
        else:
            # Minor event — skip commentary
            pass

    # Insert structural events
    events.insert(0, (0, "KICK_OFF", 0, 0))
    # Half time at ~45
    events.append((45, "HALF_TIME", a_goals, b_goals))
    events.append((46, "SECOND_HALF", a_goals, b_goals))
    events.append((90, "FULL_TIME", a_goals, b_goals))

    events.sort(key=lambda x: x[0])
    return events, a_goals, b_goals


async def simulate_match_stream(
    team_a: str, team_b: str,
    prob_a: float, prob_b: float,
    stats_a: dict, stats_b: dict,
    seed: int,
    speed: float = 1.0,
) -> AsyncGenerator[str, None]:
    """
    Simulate a 90-minute match and stream events via SSE.
    speed: 1.0 = real time (90s), 2.0 = 2x (45s), 0.5 = 0.5x (180s)
    """
    events, final_a_goals, final_b_goals = _simulate_events(team_a, team_b, prob_a, prob_b, seed)

    # Calculate momentum: running average of recent events
    momentum_a = 0.5
    momentum_b = 0.5

    yield f"data: {json.dumps({'type': 'MATCH_START', 'team_a': team_a, 'team_b': team_b, 'total_minutes': 90})}\n\n"

    for minute, event_type, score_a, score_b in events:
        # Calculate delay: 1 second real time ≈ 1 match minute
        delay = 1.0 / speed
        await asyncio.sleep(delay)

        # Update momentum based on event
        if event_type == "GOAL":
            momentum_a = min(1.0, momentum_a + 0.08)
            momentum_b = max(0.0, momentum_b - 0.05)
        elif event_type == "GOAL_AGAINST":
            momentum_b = min(1.0, momentum_b + 0.08)
            momentum_a = max(0.0, momentum_a - 0.05)
        elif event_type == "RED_CARD":
            momentum_a = max(0.0, momentum_a - 0.12)
            momentum_b = min(1.0, momentum_b + 0.08)
        elif event_type == "MOMENTUM_SHIFT":
            shift = 0.06
            if random.random() > 0.5:
                momentum_a = min(1.0, momentum_a + shift)
                momentum_b = max(0.0, momentum_b - shift * 0.5)
            else:
                momentum_b = min(1.0, momentum_b + shift)
                momentum_a = max(0.0, momentum_a - shift * 0.5)
        else:
            # Natural drift
            momentum_a += (random.random() - 0.5) * 0.02
            momentum_b += (random.random() - 0.5) * 0.02
            momentum_a = max(0.05, min(0.95, momentum_a))
            momentum_b = max(0.05, min(0.95, momentum_b))

        # Generate Granite commentary for key events (non-blocking)
        needs_commentary = event_type in ("GOAL", "GOAL_AGAINST", "RED_CARD", "VAR_REVIEW",
                                           "PENALTY", "GOAL_DISALLOWED", "HALF_TIME", "FULL_TIME",
                                           "MOMENTUM_SHIFT", "TACTICAL_SHIFT", "VAR_OVERTURN")
        commentary = ""
        if needs_commentary and AI_AVAILABLE:
            try:
                commentary = await _granite_commentary(
                    event_type, team_a, team_b, minute, score_a, score_b, stats_a, stats_b
                )
            except Exception:
                commentary = ""

        event_data = {
            "type": event_type,
            "minute": minute,
            "team_a": team_a,
            "team_b": team_b,
            "score_a": score_a,
            "score_b": score_b,
            "momentum_a": round(momentum_a, 3),
            "momentum_b": round(momentum_b, 3),
            "commentary": commentary,
            "label": EVENT_TYPES.get(event_type, "Match Event"),
        }

        yield f"data: {json.dumps(event_data)}\n\n"

    # Match summary
    winner = f"{team_a}" if final_a_goals > final_b_goals else f"{team_b}" if final_b_goals > final_a_goals else "Draw"
    summary = {
        "type": "MATCH_END",
        "team_a": team_a, "team_b": team_b,
        "score_a": final_a_goals, "score_b": final_b_goals,
        "winner": winner,
    }
    yield f"data: {json.dumps(summary)}\n\n"
