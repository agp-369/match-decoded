"""
IBM Granite integration — Match Decoded
Primary: IBM watsonx.ai  |  Fallback: HuggingFace Inference API (same Granite model)
Multilingual: EN, ES, FR, PT, DE
"""
import os
import json
import logging
import requests
from typing import Optional

from backend.langchain_prompts import (
    PREVIEW_TEMPLATE, EXPLAIN_TEMPLATE, MOMENTUM_TEMPLATE, TACTICAL_TEMPLATE,
    VAR_TEMPLATE, STORY_TEMPLATE, DOCLING_ANALYSIS_TEMPLATE, LEGENDS_TEMPLATE,
    TEACH_TEMPLATE,
    make_prompt, LANG_NAMES,
)

logger = logging.getLogger(__name__)

GRANITE_MODEL_ID = "ibm/granite-3-8b-instruct"
HF_MODEL_IDS = [
    "ibm-granite/granite-4.1-8b-instruct",
    "ibm-granite/granite-3.1-8b-instruct",
    "ibm-granite/granite-3-8b-instruct",
    "meta-llama/Llama-3.1-8B-Instruct",
]
HF_API_BASE = "https://router.huggingface.co/v1"

WATSONX_API_KEY = os.environ.get("WATSONX_API_KEY", "")
WATSONX_PROJECT_ID = os.environ.get("WATSONX_PROJECT_ID", "")
WATSONX_URL = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
HF_TOKEN = os.environ.get("HF_TOKEN", "")

WATSONX_AVAILABLE = bool(WATSONX_API_KEY and WATSONX_PROJECT_ID)
HF_AVAILABLE = bool(HF_TOKEN)
AI_AVAILABLE = WATSONX_AVAILABLE or HF_AVAILABLE

_hf_working_model: str | None = None


def _query_watsonx(prompt: str, max_tokens: int) -> str:
    """Query IBM Granite via watsonx.ai SDK."""
    from ibm_watsonx_ai.foundation_models import ModelInference
    from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as Params

    params = {
        Params.DECODING_METHOD: "sample",
        Params.TEMPERATURE: 0.7,
        Params.TOP_P: 0.9,
        Params.MAX_NEW_TOKENS: max_tokens,
        Params.MIN_NEW_TOKENS: 30,
        Params.REPETITION_PENALTY: 1.05,
    }

    model = ModelInference(
        model_id=GRANITE_MODEL_ID,
        params=params,
        credentials={"apikey": WATSONX_API_KEY, "url": WATSONX_URL},
        project_id=WATSONX_PROJECT_ID,
    )

    response = model.generate_text(prompt=prompt)
    if response and response.strip():
        return response.strip()
    raise RuntimeError("Empty response from watsonx.ai")


def _query_huggingface(prompt: str, max_tokens: int) -> str:
    """Query via HuggingFace Inference Providers (OpenAI-compatible API).
    Tries multiple model IDs; caches the first working one.
    """
    global _hf_working_model
    import time

    models_to_try = [_hf_working_model] if _hf_working_model else []
    models_to_try += [m for m in HF_MODEL_IDS if m != _hf_working_model]
    last_error = ""

    for model_id in models_to_try:
        for attempt in range(2):
            try:
                resp = requests.post(
                    f"{HF_API_BASE}/chat/completions",
                    json={
                        "model": model_id,
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": max_tokens,
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "repetition_penalty": 1.05,
                    },
                    headers={
                        "Authorization": f"Bearer {HF_TOKEN}",
                        "Content-Type": "application/json",
                    },
                    timeout=90,
                )
                if resp.status_code == 503:
                    if attempt < 1:
                        time.sleep(15)
                        continue
                if resp.status_code == 401:
                    last_error = f"Unauthorized for {model_id} (check HF_TOKEN)"
                    break
                if resp.status_code != 200:
                    last_error = f"HF error {resp.status_code} for {model_id}: {resp.text[:200]}"
                    break
                result = resp.json()
                text = (result.get("choices") or [{}])[0].get("message", {}).get("content", "")
                if text.strip():
                    _hf_working_model = model_id
                    return text.strip()
                last_error = f"Empty response from {model_id}"
            except requests.exceptions.Timeout:
                last_error = f"Timeout for {model_id}"
                continue
            except requests.exceptions.RequestException as e:
                last_error = f"Request failed for {model_id}: {e}"
                break

    raise RuntimeError(f"HuggingFace API unavailable: {last_error}")


def query_granite(prompt: str, max_tokens: int = 300) -> str:
    """Query IBM Granite — watsonx.ai primary, HuggingFace fallback."""
    errors = []
    if WATSONX_AVAILABLE:
        try:
            result = _query_watsonx(prompt, max_tokens)
            logger.info("Granite response via watsonx.ai")
            return result
        except Exception as e:
            logger.warning(f"watsonx.ai failed, trying HuggingFace: {e}")
            errors.append(f"watsonx.ai: {e}")

    if HF_AVAILABLE:
        try:
            result = _query_huggingface(prompt, max_tokens)
            logger.info("Granite response via HuggingFace Inference API")
            return result
        except Exception as e:
            logger.error(f"HuggingFace also failed: {e}")
            errors.append(f"HuggingFace: {e}")

    msg = (
        "No AI provider available. "
        "Set WATSONX_API_KEY + WATSONX_PROJECT_ID (IBM Cloud — free tier) "
        "or HF_TOKEN (HuggingFace — free, no credit card) "
        "to enable AI match narratives."
    )
    if errors:
        msg += " Errors: " + "; ".join(errors)
    raise RuntimeError(msg)


def _render(prompt_template, lang: str = "en", **kwargs) -> str:
    """Render a prompt template with language support and query Granite."""
    tpl = make_prompt(prompt_template, lang) if lang != "en" else prompt_template
    msg = tpl.format_prompt(**kwargs)
    return query_granite(msg.to_string())


def generate_preview(team_a: str, team_b: str, prob_a: float, prob_draw: float, prob_b: float,
                      stats_a: dict, stats_b: dict, neutral: bool, major: bool,
                      lang: str = "en") -> str:
    venue = "Neutral venue" if neutral else f"{team_a} is home"
    tournament = "Major tournament match" if major else "Friendly match"
    return _render(PREVIEW_TEMPLATE, lang,
        team_a=team_a, team_b=team_b,
        prob_a_pct=f"{prob_a*100:.1f}", prob_draw_pct=f"{prob_draw*100:.1f}",
        prob_b_pct=f"{prob_b*100:.1f}",
        winrate_a=f"{stats_a['winrate']:.1%}", goal_avg_a=f"{stats_a['goal_avg']:.2f}",
        form_a=f"{stats_a['form']:.1%}",
        winrate_b=f"{stats_b['winrate']:.1%}", goal_avg_b=f"{stats_b['goal_avg']:.2f}",
        form_b=f"{stats_b['form']:.1%}",
        venue=venue, tournament=tournament,
    )


def generate_explain(prob_a: float, prob_draw: float, prob_b: float,
                      stats_a: dict, stats_b: dict, feature_importances: list,
                      lang: str = "en") -> str:
    return _render(EXPLAIN_TEMPLATE, lang,
        prob_a_pct=f"{prob_a*100:.1f}", prob_draw_pct=f"{prob_draw*100:.1f}",
        prob_b_pct=f"{prob_b*100:.1f}",
        features=", ".join(feature_importances) if feature_importances else "historical win rates, goal averages, recent form",
    )


def generate_momentum(team_a: str, team_b: str, prob_a: float, prob_b: float,
                       lang: str = "en") -> str:
    return _render(MOMENTUM_TEMPLATE, lang,
        team_a=team_a, team_b=team_b,
        prob_a_pct=f"{prob_a*100:.1f}", prob_b_pct=f"{prob_b*100:.1f}",
    )


def generate_tactical(team_a: str, team_b: str, prob_a: float, prob_draw: float, prob_b: float,
                       stats_a: dict, stats_b: dict, neutral: bool, major: bool,
                       lang: str = "en") -> str:
    return _render(TACTICAL_TEMPLATE, lang,
        team_a=team_a, team_b=team_b,
        prob_a_pct=f"{prob_a*100:.1f}", prob_draw_pct=f"{prob_draw*100:.1f}",
        prob_b_pct=f"{prob_b*100:.1f}",
        form_a_pct=f"{stats_a['form']*100:.0f}", form_b_pct=f"{stats_b['form']*100:.0f}",
        goal_avg_a=f"{stats_a['goal_avg']:.2f}", goal_avg_b=f"{stats_b['goal_avg']:.2f}",
        venue_desc="neutral venue" if neutral else f"{team_a} home game",
        tournament_desc="major tournament match" if major else "friendly match",
    )


def generate_var_explanation(team_a: str, team_b: str, scenario: str, lang: str = "en") -> str:
    return _render(VAR_TEMPLATE, lang,
        team_a=team_a, team_b=team_b, scenario=scenario,
    )


def generate_story(team_a: str, team_b: str, prob_a: float, prob_draw: float, prob_b: float,
                    stats_a: dict, stats_b: dict, neutral: bool, major: bool,
                    lang: str = "en") -> str:
    return _render(STORY_TEMPLATE, lang,
        team_a=team_a, team_b=team_b,
        prob_a_pct=f"{prob_a*100:.1f}", prob_draw_pct=f"{prob_draw*100:.1f}",
        prob_b_pct=f"{prob_b*100:.1f}",
        winrate_a=f"{stats_a['winrate']:.1%}", goal_avg_a=f"{stats_a['goal_avg']:.2f}",
        form_a_pct=f"{stats_a['form']*100:.0f}", matches_a=int(stats_a['matches']),
        winrate_b=f"{stats_b['winrate']:.1%}", goal_avg_b=f"{stats_b['goal_avg']:.2f}",
        form_b_pct=f"{stats_b['form']*100:.0f}", matches_b=int(stats_b['matches']),
        venue_desc="neutral venue" if neutral else f"{team_a} home",
        tournament_desc="major tournament" if major else "friendly",
    )


def generate_docling_analysis(report_text: str, lang: str = "en") -> str:
    return _render(DOCLING_ANALYSIS_TEMPLATE, lang, report_text=report_text[:3000])


def generate_legends(team_a: str, team_b: str, era_a: str, era_b: str,
                      stats_a: dict, stats_b: dict, lang: str = "en") -> str:
    return _render(LEGENDS_TEMPLATE, lang,
        team_a=team_a, team_b=team_b, era_a=era_a, era_b=era_b,
        winrate_a=f"{stats_a['winrate']:.1%}", goal_avg_a=f"{stats_a['goal_avg']:.2f}",
        matches_a=stats_a.get('matches', stats_a.get('matches_played', 0)),
        winrate_b=f"{stats_b['winrate']:.1%}", goal_avg_b=f"{stats_b['goal_avg']:.2f}",
        matches_b=stats_b.get('matches', stats_b.get('matches_played', 0)),
    )


def generate_teach(question: str, lang: str = "en") -> str:
    return _render(TEACH_TEMPLATE, lang, question=question)
