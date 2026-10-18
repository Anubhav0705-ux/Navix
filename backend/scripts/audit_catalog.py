import json
from collections import Counter

destinations = json.load(open('data/demo/destinations.json', encoding='utf-8'))
attractions = json.load(open('data/demo/attractions.json', encoding='utf-8'))
food = json.load(open('data/demo/food.json', encoding='utf-8'))
hotels = json.load(open('data/demo/hotels.json', encoding='utf-8'))

print(f"Total Destinations: {len(destinations)}")
print(f"Total Attractions: {len(attractions)}")
print(f"Total Food: {len(food)}")
print(f"Total Hotels: {len(hotels)}")

attr_dest_ids = Counter([a['destination_id'] for a in attractions])
food_dest_ids = Counter([f['destination_id'] for f in food])
hotel_dest_ids = Counter([h['destination_id'] for h in hotels])

missing_attr = []
missing_food = []
missing_hotels = []

for d in destinations:
    did = d['id']
    if did not in attr_dest_ids:
        missing_attr.append(d['name'])
    if did not in food_dest_ids:
        missing_food.append(d['name'])
    if did not in hotel_dest_ids:
        missing_hotels.append(d['name'])

print(f"Destinations missing attractions: {len(missing_attr)} {missing_attr}")
print(f"Destinations missing food: {len(missing_food)} {missing_food}")
print(f"Destinations missing hotels: {len(missing_hotels)} {missing_hotels}")

print("\nSample destination data:")
d0 = destinations[0]
print(f"First dest: {d0['id']} | {d0['name']} | {d0['city']}, {d0['state']} | ({d0['latitude']}, {d0['longitude']})")
