"""
Docling integration — Match Decoded PDF match report analysis
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Try to import Docling ─────────────────────────────
DOCLING_AVAILABLE = False
try:
    from docling.document_converter import DocumentConverter
    DOCLING_AVAILABLE = True
    logger.info("Docling available for PDF analysis")
except ImportError:
    logger.info("Docling not installed — using PyMuPDF fallback")


def parse_pdf(file_path: str) -> Optional[str]:
    """Parse a PDF file and extract text content.

    Uses IBM Docling if available, falls back to PyMuPDF.
    """
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return None

    try:
        if DOCLING_AVAILABLE:
            converter = DocumentConverter()
            doc = converter.convert(file_path)
            return doc.text
        else:
            return _fallback_extract_text(file_path)
    except Exception as e:
        logger.error(f"PDF parsing failed: {e}")
        try:
            return _fallback_extract_text(file_path)
        except Exception as e2:
            logger.error(f"Fallback also failed: {e2}")
            return None


def _fallback_extract_text(file_path: str) -> str:
    """Extract text from PDF using PyMuPDF (lightweight fallback)."""
    import fitz
    doc = fitz.open(file_path)
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text())
    doc.close()
    return "\n".join(text_parts)


def extract_match_details(file_path: str) -> Optional[dict]:
    """Extract structured match details from a PDF match report.

    Returns a dict with keys: text, teams, score, tournament, date
    """
    text = parse_pdf(file_path)
    if not text:
        return None

    result = {
        "text": text,
        "teams": [],
        "score": None,
        "tournament": None,
        "date": None,
    }

    lines = text.strip().split("\n")
    for i, line in enumerate(lines):
        line = line.strip()
        lower = line.lower()
        if " vs " in line or " v " in line:
            parts = line.split(" vs ") if " vs " in line else line.split(" v ")
            if len(parts) == 2:
                result["teams"] = [parts[0].strip(), parts[1].strip()]
        if "tournament" in lower or "competition" in lower or "cup" in lower:
            result["tournament"] = line
        if any(c.isdigit() for c in line) and "-" in line and len(line) < 20:
            candidates = [s.strip() for s in line.split("-")]
            if all(c.isdigit() or c == "" for c in candidates):
                result["score"] = line

    return result
