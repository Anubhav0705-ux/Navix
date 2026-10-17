import os
import sys
import json
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.dirname(__file__))
from wikimedia_harvester import search_wikimedia, download_and_optimize

PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public"))
MANIFEST_PUB = os.path.join(PUBLIC_DIR, "media", "manifest.json")
MANIFEST_LIB = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "lib", "mediaManifest.json"))

with open(MANIFEST_PUB, "r", encoding="utf-8") as f:
    manifest = json.load(f)

STAYS_TO_PATCH = [
    {
        "id": "stay_jaipur_01",
        "name": "Umaid Bhawan Heritage House",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "stays",
        "query": "Haveli courtyard Jaipur interior",
        "rel_path": "stays/jaipur_umaid_bhawan.webp",
        "classification": "representative"
    },
    {
        "id": "stay_goa_05",
        "name": "The Hosteller Goa Candolim",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "stays",
        "query": "Candolim Beach Goa palm trees",
        "rel_path": "stays/goa_hosteller_candolim.webp",
        "classification": "representative"
    },
    {
        "id": "stay_manali_02",
        "name": "The Himalayan Spa Resort",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "stays",
        "query": "Manali resort mountain view snowfall",
        "rel_path": "stays/manali_the_himalayan.webp",
        "classification": "representative"
    },
    {
        "id": "stay_jaipur_05",
        "name": "Alsisar Haveli Boutique Retreat",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "stays",
        "query": "Haveli courtyard Rajasthan architecture",
        "rel_path": "stays/jaipur_alsisar_haveli.webp",
        "classification": "representative"
    },
    {
        "id": "stay_rishikesh_02",
        "name": "Ganga Kinare Riverside Boutique Resort",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "stays",
        "query": "Rishikesh Ganges river bank view",
        "rel_path": "stays/rishikesh_ganga_kinare.webp",
        "classification": "representative"
    }
]

for item in STAYS_TO_PATCH:
    print(f"Patching: {item['name']}...")
    res = search_wikimedia(item["query"])
    if not res:
        res = search_wikimedia(" ".join(item["query"].split()[:2]))
    if res and res.get("url"):
        dest_path = os.path.join(PUBLIC_DIR, "media", item["rel_path"])
        ok = download_and_optimize(res["url"], dest_path)
        if ok:
            manifest[item["id"]] = {
                "entityId": item["id"],
                "entityName": item["name"],
                "destination": item["destination"],
                "destinationSlug": item["destination_slug"],
                "category": item["category"],
                "webPath": f"/media/{item['rel_path']}",
                "localPath": dest_path,
                "classification": item["classification"],
                "verificationStatus": "representative_curated",
                "license": res["license"],
                "attribution": res["artist"],
                "source": res["source_page"],
                "originalUrl": res["url"]
            }
            print(f"  -> Successfully patched {item['id']}")

with open(MANIFEST_PUB, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
with open(MANIFEST_LIB, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print("Patch complete! Manifest updated.")
