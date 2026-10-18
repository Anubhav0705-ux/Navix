import json
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data", "demo")
CACHE_FILE = os.path.join(BASE_DIR, "data", "media_cache.json")

def main():
    with open(os.path.join(DATA_DIR, "attractions.json"), encoding="utf-8") as f:
        atts = json.load(f)
    with open(os.path.join(DATA_DIR, "food.json"), encoding="utf-8") as f:
        foods = json.load(f)
    with open(os.path.join(DATA_DIR, "hotels.json"), encoding="utf-8") as f:
        hotels = json.load(f)
    
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, encoding="utf-8") as f:
            cache = json.load(f)
    else:
        cache = {}

    for a in atts:
        if a.get("image"):
            slug = (a.get("destination_slug") or "").lower()
            name = (a.get("name") or "").lower()
            key = f"attraction:{slug}:{name}"
            source = "wikimedia" if "wikimedia" in a["image"] else "unsplash"
            cache[key] = {
                "source": source,
                "photo_id": a["id"],
                "url": a["image"],
                "thumb_url": a["image"],
                "alt": f"{a['name']} — landmark in {slug.title()}",
                "photographer": "Wikimedia Commons" if source == "wikimedia" else "Unsplash Contributor",
                "photographer_url": "https://commons.wikimedia.org" if source == "wikimedia" else "https://unsplash.com?utm_source=navix&utm_medium=referral",
                "source_url": "https://commons.wikimedia.org" if source == "wikimedia" else "https://unsplash.com?utm_source=navix&utm_medium=referral",
                "download_location": None,
                "query": f"{a['name']} {slug}",
                "verified_level": "exact_landmark" if source == "wikimedia" else "entity",
                "attribution_required": True
            }

    for f_item in foods:
        if f_item.get("image"):
            slug = (f_item.get("destination_slug") or "").lower()
            name = (f_item.get("name") or "").lower()
            key = f"food:{slug}:{name}"
            source = "wikimedia" if "wikimedia" in f_item["image"] else "unsplash"
            cache[key] = {
                "source": source,
                "photo_id": f_item["id"],
                "url": f_item["image"],
                "thumb_url": f_item["image"],
                "alt": f"{f_item['name']} ({f_item.get('cuisine', '')})",
                "photographer": "Wikimedia Commons" if source == "wikimedia" else "Unsplash Contributor",
                "photographer_url": "https://commons.wikimedia.org" if source == "wikimedia" else "https://unsplash.com?utm_source=navix&utm_medium=referral",
                "source_url": "https://commons.wikimedia.org" if source == "wikimedia" else "https://unsplash.com?utm_source=navix&utm_medium=referral",
                "download_location": None,
                "query": f"{f_item.get('speciality', '')} {slug}",
                "verified_level": "dish",
                "attribution_required": True
            }

    for h in hotels:
        if h.get("image"):
            slug = (h.get("destination_slug") or "").lower()
            name = (h.get("name") or "").lower()
            key = f"hotel:{slug}:{name}"
            source = "wikimedia" if "wikimedia" in h["image"] else "unsplash"
            cache[key] = {
                "source": source,
                "photo_id": h["id"],
                "url": h["image"],
                "thumb_url": h["image"],
                "alt": f"{h['name']} in {slug.title()}",
                "photographer": "Wikimedia Commons" if source == "wikimedia" else "Unsplash Contributor",
                "photographer_url": "https://commons.wikimedia.org" if source == "wikimedia" else "https://unsplash.com?utm_source=navix&utm_medium=referral",
                "source_url": "https://commons.wikimedia.org" if source == "wikimedia" else "https://unsplash.com?utm_source=navix&utm_medium=referral",
                "download_location": None,
                "query": f"{h['name']} {slug}",
                "verified_level": "exact_landmark" if source == "wikimedia" else "representative",
                "attribution_required": True
            }

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

    print(f"Total cached media records in media_cache.json: {len(cache)}")

if __name__ == "__main__":
    main()
