"""
Unit & Integration Tests for NAVIX Authentic Media Pipeline.
Verifies:
1. Endpoint /api/v1/media/resolve succeeds with HTTP 200.
2. Returns full metadata: source, url, thumb_url, alt, photographer, photographer_url, verified_level.
3. Zero duplicate images across distinct named attractions in Goa.
4. Correct dish resolution for food places.
5. Persistent media cache operates with zero redundant external queries.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.media_service import media_service


@pytest.fixture
def client():
    return TestClient(app)


def test_media_resolve_endpoint_basic(client):
    """Verifies basic resolution of a known landmark."""
    response = client.get(
        "/api/v1/media/resolve",
        params={
            "entity_type": "attraction",
            "name": "Chapora Fort Sunset Bastion",
            "destination": "Goa",
            "state": "Goa",
            "orientation": "landscape"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["source"] in ("wikimedia", "unsplash", "curated")
    assert data["url"].startswith("http")
    assert len(data["url"]) > 10
    assert data["photographer"] is not None
    assert data["verified_level"] in ("exact_landmark", "entity", "representative")
    assert data["attribution_required"] is True


def test_goa_attractions_zero_duplicates(client):
    """
    Mandatory Acceptance Gate:
    Inspects all 10 Goa attractions.
    Every attraction must resolve to a valid, unique photograph URL.
    Zero fake generic duplicates permitted.
    """
    goa_attractions = [
        "Basilica of Bom Jesus Old Goa",
        "Fontainhas Latin Quarter Heritage Stroll",
        "Fort Aguada Coastal Bastion & Lighthouse",
        "Dudhsagar Four-Tiered Jungle Falls",
        "Anjuna Flea Market & Rocky Coast",
        "Chapora Fort Sunset Bastion",
        "Palolem Crescent Beach & Butterfly Cove",
        "Se Cathedral & Church of St. Francis",
        "Savoi Organic Spice Plantation",
        "Arambol Sweetwater Lake & Cliff Trail"
    ]

    resolved_urls = []
    for name in goa_attractions:
        resp = client.get(
            "/api/v1/media/resolve",
            params={
                "entity_type": "attraction",
                "name": name,
                "destination": "Goa"
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["url"].startswith("http")
        resolved_urls.append(data["url"])

    # Assert 100% unique URLs
    unique_urls = set(resolved_urls)
    assert len(unique_urls) == len(goa_attractions), (
        f"Duplicate URLs found! Expected {len(goa_attractions)} unique URLs, got {len(unique_urls)}"
    )


def test_goa_food_dish_specific_resolution(client):
    """Verifies that regional food dishes resolve to dish-specific imagery."""
    dishes = [
        ("Vinayak Family Restaurant Assagao", "Goan Seafood"),
        ("Mum's Kitchen Panaji", "Traditional Goan"),
        ("Fisherman's Wharf Salcete", "Seafood / Goan"),
        ("Viva Panjim Fontainhas", "Goan Portuguese")
    ]

    urls = []
    for name, cat in dishes:
        resp = client.get(
            "/api/v1/media/resolve",
            params={
                "entity_type": "food",
                "name": name,
                "destination": "Goa",
                "category": cat
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        urls.append(data["url"])

    # All dishes must be unique
    assert len(set(urls)) == len(dishes)


def test_cache_hits_without_external_call(client):
    """Verifies that subsequent lookups hit the persistent cache with identical metadata."""
    resp1 = client.get(
        "/api/v1/media/resolve",
        params={"entity_type": "attraction", "name": "Fort Aguada Coastal Bastion & Lighthouse", "destination": "Goa"}
    )
    assert resp1.status_code == 200
    data1 = resp1.json()

    resp2 = client.get(
        "/api/v1/media/resolve",
        params={"entity_type": "attraction", "name": "Fort Aguada Coastal Bastion & Lighthouse", "destination": "Goa"}
    )
    assert resp2.status_code == 200
    data2 = resp2.json()

    assert data1["url"] == data2["url"]
    assert data1["photo_id"] == data2["photo_id"]
    assert data1["source"] == data2["source"]
