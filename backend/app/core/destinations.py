"""
Canonical Destination & Alias Reference Model for NAVIX.
Provides consistent geographic identities across routing, search, budget optimization,
and itinerary generation layers.
"""
from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func

from app.models.demo_catalog import DemoDestination

# Comprehensive canonical alias mapping for Indian cities and transit nodes
DESTINATION_ALIASES: Dict[str, str] = {
    # Major Metro & State Capital Aliases
    "bangalore": "bengaluru",
    "bombay": "mumbai",
    "cochin": "kochi",
    "banaras": "varanasi",
    "benares": "varanasi",
    "kashi": "varanasi",
    "alleppey": "alappuzha",
    "old manali": "manali",
    "manali & old manali": "manali",
    "aurangabad": "chhatrapati sambhajinagar",
    "sambhajinagar": "chhatrapati sambhajinagar",
    "madras": "chennai",
    "calcutta": "kolkata",
    "poona": "pune",
    "baroda": "vadodara",
    "trivandrum": "thiruvananthapuram",
    "pondicherry": "puducherry",
    "mysore": "mysuru",
    "simla": "shimla",
    "belgaum": "belagavi",
    "hubli": "hubballi",
    "dharwad": "hubballi",
    "calicut": "kozhikode",
    "panjim": "goa",
    "panaji": "goa",
    "north goa": "goa",
    "north goa (calangute & anjuna)": "goa",
    "south goa": "goa",
    "south goa (palolem & benaulim)": "goa",
    "gurgaon": "gurugram",
    "prayag": "prayagraj",
    "allahabad": "prayagraj",
    "ootacamund": "ooty",
    "udhagamandalam": "ooty",
    "hospet": "hampi",
    "hosapete": "hampi"
}


def normalize_city_name(name: str) -> str:
    """Normalizes whitespace, casing, and standard Indian city aliases."""
    if not name:
        return ""
    cleaned = name.strip().lower()
    # Remove common qualifiers like "(SLI)", "(PUNE)", "City", "Central", "Hub", "Junction"
    for qualifier in [" station", " junction", " central", " hub", " bus stand", " isbt", " city"]:
        if cleaned.endswith(qualifier):
            cleaned = cleaned[:-len(qualifier)].strip()

    # Apply alias mapping if present
    if cleaned in DESTINATION_ALIASES:
        return DESTINATION_ALIASES[cleaned]
    
    return cleaned


def resolve_canonical_destination(db: Session, query: str) -> Optional[DemoDestination]:
    """
    Deterministically resolves a destination query (slug, name, city, or alias)
    to a canonical DemoDestination database record.
    """
    if not query or not query.strip():
        return None
    
    raw = query.strip()
    normalized = normalize_city_name(raw)

    # 1. Exact match on slug (case-insensitive)
    dest = db.scalar(
        select(DemoDestination).where(func.lower(DemoDestination.slug) == normalized)
    )
    if dest:
        return dest

    # 2. Exact match on city or name (case-insensitive)
    dest = db.scalar(
        select(DemoDestination).where(
            or_(
                func.lower(DemoDestination.city) == normalized,
                func.lower(DemoDestination.name) == normalized
            )
        )
    )
    if dest:
        return dest

    # 3. Exact match using raw query
    dest = db.scalar(
        select(DemoDestination).where(
            or_(
                func.lower(DemoDestination.city) == raw.lower(),
                func.lower(DemoDestination.name) == raw.lower(),
                func.lower(DemoDestination.slug) == raw.lower()
            )
        )
    )
    if dest:
        return dest

    # 4. Substring / ilike pattern matching
    pattern = f"%{normalized}%"
    dest = db.scalar(
        select(DemoDestination).where(
            or_(
                func.lower(DemoDestination.name).like(pattern),
                func.lower(DemoDestination.city).like(pattern),
                DemoDestination.slug.like(pattern)
            )
        )
    )
    if dest:
        return dest

    # 5. Raw pattern matching fallback
    raw_pattern = f"%{raw.lower()}%"
    dest = db.scalar(
        select(DemoDestination).where(
            or_(
                func.lower(DemoDestination.name).like(raw_pattern),
                func.lower(DemoDestination.city).like(raw_pattern),
                DemoDestination.slug.like(raw_pattern)
            )
        )
    )
    return dest
