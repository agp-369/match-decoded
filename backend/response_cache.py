"""
Response cache — instant SSE on cold start.
Stores Granite responses keyed by prompt hash.
Seeded with common demo pairs so first request never waits.
"""
import json
import hashlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

CACHE_PATH = Path(__file__).parent / "response_cache.json"

_cache: dict[str, str] = {}
_dirty = False


def _hash(system: str, human: str) -> str:
    return hashlib.sha256(f"{system}||{human}".encode()).hexdigest()[:16]


def load():
    global _cache
    if CACHE_PATH.exists():
        try:
            _cache = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
            logger.info(f"Loaded {len(_cache)} cached responses")
        except Exception as e:
            logger.warning(f"Failed to load cache: {e}")
            _cache = {}
    else:
        _cache = {}


def get(system: str, human: str) -> str | None:
    return _cache.get(_hash(system, human))


def put(system: str, human: str, response: str):
    global _dirty
    key = _hash(system, human)
    if key not in _cache:
        _cache[key] = response
        _dirty = True


def save():
    global _dirty
    if _dirty and _cache:
        try:
            CACHE_PATH.write_text(
                json.dumps(_cache, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            _dirty = False
            logger.info(f"Saved {len(_cache)} cached responses")
        except Exception as e:
            logger.warning(f"Failed to save cache: {e}")
