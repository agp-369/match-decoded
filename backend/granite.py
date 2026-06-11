"""
IBM Granite integration via IBM watsonx.ai — Match Decoded
Uses LangChain prompt templates + IBM watsonx.ai SDK
"""
import os
import json
import logging
from typing import Optional

from backend.langchain_prompts import (
    PREVIEW_TEMPLATE, EXPLAIN_TEMPLATE, MOMENTUM_TEMPLATE,
    DOCLING_ANALYSIS_TEMPLATE, LEGENDS_TEMPLATE,
)

logger = logging.getLogger(__name__)

WATSONX_API_KEY = os.environ.get("WATSONX_API_KEY", "")
WATSONX_PROJECT_ID = os.environ.get("WATSONX_PROJECT_ID", "")
WATSONX_URL = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
GRANITE_MODEL_ID = "ibm/granite-3-8b-instruct"

WATSONX_AVAILABLE = bool(WATSONX_API_KEY and WATSONX_PROJECT_ID)


def get_model():
    """Lazy-init watsonx.ai model inference."""
    if not WATSONX_AVAILABLE:
        raise RuntimeError(
            "IBM watsonx.ai not configured. Set WATSONX_API_KEY, WATSONX_PROJECT_ID, "
            "and optionally WATSONX_URL in environment."
        )
    from ibm_watsonx_ai.foundation_models import ModelInference
    from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as Params

    params = {
        Params.DECODING_METHOD: "sample",
        Params.TEMPERATURE: 0.7,
        Params.TOP_P: 0.9,
        Params.MAX_NEW_TOKENS: 300,
        Params.MIN_NEW_TOKENS: 30,
        Params.REPETITION_PENALTY: 1.05,
    }

    model = ModelInference(
        model_id=GRANITE_MODEL_ID,
        params=params,
        credentials={"apikey": WATSONX_API_KEY, "url": WATSONX_URL},
        project_id=WATSONX_PROJECT_ID,
    )
    return model


def query_granite(prompt: str, max_tokens: int = 300) -> str:
    """Query IBM Granite via IBM watsonx.ai. Returns AI-generated text or raises on failure."""
    if not WATSONX_AVAILABLE:
        raise RuntimeError(
            "IBM watsonx.ai is not configured. "
            "Set WATSONX_API_KEY and WATSONX_PROJECT_ID environment variables."
        )
    try:
        model = get_model()
        params = model._params
        params[model._ParamsClass.MAX_NEW_TOKENS] = max_tokens
        response = model.generate_text(prompt=prompt)
        if response and response.strip():
            return response.strip()
        raise RuntimeError("Empty response from watsonx.ai")
    except Exception as e:
        logger.error(f"IBM watsonx.ai Granite query failed: {e}")
        raise RuntimeError(f"IBM Granite (watsonx.ai) generation failed: {e}")


def generate_preview(team_a: str, team_b: str, prob_a: float, prob_draw: float, prob_b: float,
                      stats_a: dict, stats_b: dict, neutral: bool, major: bool) -> str:
    venue = "Neutral venue" if neutral else f"{team_a} is home"
    tournament = "Major tournament match" if major else "Friendly match"
    prompt = PREVIEW_TEMPLATE.format(
        team_a=team_a, team_b=team_b,
        prob_a_pct=f"{prob_a*100:.1f}", prob_draw_pct=f"{prob_draw*100:.1f}",
        prob_b_pct=f"{prob_b*100:.1f}",
        winrate_a=f"{stats_a['winrate']:.1%}", goal_avg_a=f"{stats_a['goal_avg']:.2f}",
        form_a=f"{stats_a['recent_form']:.1%}",
        winrate_b=f"{stats_b['winrate']:.1%}", goal_avg_b=f"{stats_b['goal_avg']:.2f}",
        form_b=f"{stats_b['recent_form']:.1%}",
        venue=venue, tournament=tournament,
    )
    return query_granite(prompt)


def generate_explain(prob_a: float, prob_draw: float, prob_b: float,
                      stats_a: dict, stats_b: dict, feature_importances: list) -> str:
    prompt = EXPLAIN_TEMPLATE.format(
        prob_a_pct=f"{prob_a*100:.1f}", prob_draw_pct=f"{prob_draw*100:.1f}",
        prob_b_pct=f"{prob_b*100:.1f}",
        features=", ".join(feature_importances) if feature_importances else "historical win rates, goal averages, recent form",
    )
    return query_granite(prompt)


def generate_momentum(team_a: str, team_b: str, prob_a: float, prob_b: float) -> str:
    prompt = MOMENTUM_TEMPLATE.format(
        team_a=team_a, team_b=team_b,
        prob_a_pct=f"{prob_a*100:.1f}", prob_b_pct=f"{prob_b*100:.1f}",
    )
    return query_granite(prompt)


def generate_docling_analysis(report_text: str) -> str:
    prompt = DOCLING_ANALYSIS_TEMPLATE.format(report_text=report_text[:3000])
    return query_granite(prompt, max_tokens=400)


def generate_legends(team_a: str, team_b: str, era_a: str, era_b: str,
                      stats_a: dict, stats_b: dict) -> str:
    prompt = LEGENDS_TEMPLATE.format(
        team_a=team_a, team_b=team_b, era_a=era_a, era_b=era_b,
        winrate_a=f"{stats_a['winrate']:.1%}", goal_avg_a=f"{stats_a['goal_avg']:.2f}",
        matches_a=stats_a['matches_played'],
        winrate_b=f"{stats_b['winrate']:.1%}", goal_avg_b=f"{stats_b['goal_avg']:.2f}",
        matches_b=stats_b['matches_played'],
    )
    return query_granite(prompt)
