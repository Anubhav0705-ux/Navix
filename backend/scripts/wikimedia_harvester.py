"""
Harvests authentic, verified photography from Wikimedia Commons public API,
converts assets to optimized WebP format, and writes them into frontend/public/media/.
"""
import os
import io
import re
import json
import time
import requests
from PIL import Image

HEADERS = {
    'User-Agent': 'NAVIX-Travel-Platform/1.0 (academic/travel-defense; contact: travel@navix.internal)'
}

MEDIA_BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "media"))

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean = re.sub(r'<.*?>', '', str(raw_html))
    return clean.strip()

def search_wikimedia(query):
    """Searches Wikimedia Commons API for the exact query and returns best candidate metadata."""
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": 6,  # File namespace
        "gsrlimit": 5,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size|mime",
        "format": "json"
    }
    try:
        r = requests.get(url, params=params, headers=HEADERS, timeout=12)
        if r.status_code != 200:
            return None
        data = r.json()
        pages = data.get("query", {}).get("pages", {})
        if not pages:
            return None
        
        candidates = []
        for pid, page in pages.items():
            info_list = page.get("imageinfo", [])
            if not info_list:
                continue
            info = info_list[0]
            mime = info.get("mime", "")
            if not (mime.startswith("image/jpeg") or mime.startswith("image/png") or mime.startswith("image/webp")):
                continue
            
            width = info.get("width", 0)
            height = info.get("height", 0)
            if width < 500 or height < 350:
                continue
                
            title = page.get("title", "")
            meta = info.get("extmetadata", {})
            artist = clean_html(meta.get("Artist", {}).get("value", "Wikimedia Contributor"))
            license_name = meta.get("LicenseShortName", {}).get("value", "CC BY-SA / Public Domain")
            description = clean_html(meta.get("ImageDescription", {}).get("value", title))
            source_page = info.get("descriptionurl", f"https://commons.wikimedia.org/wiki/{title.replace(' ', '_')}")
            direct_url = info.get("url", "")
            
            candidates.append({
                "title": title,
                "url": direct_url,
                "width": width,
                "height": height,
                "artist": artist[:80] if artist else "Wikimedia Contributor",
                "license": license_name,
                "description": description[:150],
                "source_page": source_page
            })
            
        return candidates[0] if candidates else None
    except Exception as e:
        print(f"Error searching for '{query}': {e}")
        return None

def download_and_optimize(image_url, dest_path, max_dim=1200, quality=82):
    """Downloads image and converts it to WebP format."""
    try:
        r = requests.get(image_url, headers=HEADERS, timeout=18)
        if r.status_code != 200:
            print(f"Failed download {image_url} (HTTP {r.status_code})")
            return False
            
        img = Image.open(io.BytesIO(r.content))
        if img.mode in ('RGBA', 'P', 'LA'):
            img = img.convert('RGB')
        
        # Calculate aspect-ratio preserving resize
        w, h = img.size
        if w > max_dim or h > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        img.save(dest_path, format="WEBP", quality=quality, method=6)
        print(f"  -> Saved {dest_path} ({os.path.getsize(dest_path)} bytes)")
        return True
    except Exception as e:
        print(f"Failed to process {image_url}: {e}")
        return False
