import re
from typing import Optional


def normalize_name(name: str) -> str:
    """
    Normalizes geographic display names by stripping whitespace, handling unicode,
    and removing double spaces.
    """
    if not name:
        return ""
    # Strip leading/trailing whitespace
    clean = name.strip()
    # Replace multiple whitespaces with single space
    clean = re.sub(r"\s+", " ", clean)
    # Replace smart quotes with standard single quote
    clean = clean.replace("’", "'").replace("‘", "'")
    return clean


def normalize_code(code: Optional[str]) -> Optional[str]:
    """
    Normalizes provider/facility codes (e.g. IRCTC codes 'SLI', IATA codes 'DEL').
    """
    if not code:
        return None
    clean = code.strip().upper()
    # Remove non-alphanumeric characters except underscore/hyphen
    clean = re.sub(r"[^A-Z0-9_\-]", "", clean)
    return clean if clean else None


def normalize_pincode(pincode: Optional[str]) -> Optional[str]:
    """
    Normalizes 6-digit Indian Postal Index Numbers (PIN codes).
    """
    if not pincode:
        return None
    clean = re.sub(r"\D", "", str(pincode))
    if len(clean) == 6:
        return clean
    return None


def slugify_id(text: str) -> str:
    """
    Creates a deterministic lower-case alphanumeric slug for stable ID generation.
    """
    if not text:
        return "unknown"
    clean = text.lower().strip()
    clean = re.sub(r"[^a-z0-9]", "_", clean)
    clean = re.sub(r"_+", "_", clean).strip("_")
    return clean if clean else "unknown"
