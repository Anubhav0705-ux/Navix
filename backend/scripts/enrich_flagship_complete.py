"""
Full enrichment script for NAVIX 20 Flagship Destinations:
Attractions, Food Places, Hotels, and Curated Stories.
"""
import json
import os
import sys

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo"))

# Load files
with open(os.path.join(DATA_DIR, "attractions.json"), "r", encoding="utf-8") as f:
    attractions = json.load(f)

with open(os.path.join(DATA_DIR, "food.json"), "r", encoding="utf-8") as f:
    food = json.load(f)

with open(os.path.join(DATA_DIR, "hotels.json"), "r", encoding="utf-8") as f:
    hotels = json.load(f)

with open(os.path.join(DATA_DIR, "stories.json"), "r", encoding="utf-8") as f:
    stories = json.load(f)

print(f"Loaded existing: {len(attractions)} attractions, {len(food)} food places, {len(hotels)} hotels, {len(stories)} stories.")

# We will read flagship data dictionaries and apply updates in-place
