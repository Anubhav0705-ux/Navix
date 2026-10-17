"""
Verification of authentic images across Goa, Manali, Jaipur, Udaipur.
"""
import json
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data", "demo")

def check_dataset(filename, slug):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        items = json.load(f)
    dest_items = [x for x in items if (x.get("destination_slug") == slug or x.get("destination_id") == slug)]
    images = [x.get("image") for x in dest_items if x.get("image")]
    unique_images = set(images)
    print(f"[{slug.upper()}] {filename}: Total={len(dest_items)}, With Image={len(images)}, Unique={len(unique_images)}")
    for x in dest_items:
        print(f"  * {x.get('name')}: {x.get('image')}")
    print()

def main():
    for slug in ["goa", "jaipur", "manali", "udaipur"]:
        check_dataset("attractions.json", slug)
        check_dataset("food.json", slug)
        check_dataset("hotels.json", slug)

if __name__ == "__main__":
    main()
