"""
Replaces deprecated thumb.wikimedia.org with official canonical upload.wikimedia.org.
"""
import os
import json
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

files_to_fix = [
    os.path.join(ROOT_DIR, "frontend", "src", "lib", "mediaResolver.ts"),
    os.path.join(BASE_DIR, "data", "media_cache.json"),
    os.path.join(BASE_DIR, "scripts", "flagship_content_data.py"),
    os.path.join(BASE_DIR, "data", "demo", "attractions.json"),
    os.path.join(BASE_DIR, "data", "demo", "food.json"),
    os.path.join(BASE_DIR, "data", "demo", "hotels.json"),
]

for file_path in files_to_fix:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        count = content.count("thumb.wikimedia.org")
        if count > 0:
            new_content = content.replace("thumb.wikimedia.org", "upload.wikimedia.org")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated {file_path}: replaced {count} occurrences of thumb.wikimedia.org -> upload.wikimedia.org")
        else:
            print(f"Clean: {file_path}")

# Also update PostgreSQL database
sys.path.insert(0, BASE_DIR)
from app.database.session import SessionLocal
from app.models.demo_catalog import DemoAttraction, DemoFoodPlace, DemoHotel

db = SessionLocal()
try:
    for model in [DemoAttraction, DemoFoodPlace, DemoHotel]:
        records = db.query(model).filter(model.image.like("%thumb.wikimedia.org%")).all()
        for r in records:
            r.image = r.image.replace("thumb.wikimedia.org", "upload.wikimedia.org")
        print(f"Updated {len(records)} DB records for {model.__tablename__}")
    db.commit()
finally:
    db.close()

print("ALL DOMAIN FIXES APPLIED SUCCESSFULLY!")
