import json

attractions = json.load(open('data/demo/attractions.json', encoding='utf-8'))
food = json.load(open('data/demo/food.json', encoding='utf-8'))
hotels = json.load(open('data/demo/hotels.json', encoding='utf-8'))

for slug in ['manali', 'goa', 'jaipur', 'udaipur', 'munnar', 'rishikesh']:
    matched_a = [a for a in attractions if a.get('destination_slug') == slug]
    matched_f = [f for f in food if f.get('destination_slug') == slug]
    matched_h = [h for h in hotels if h.get('destination_slug') == slug]
    
    print(f"\n=================== {slug.upper()} ===================")
    print("Attractions (top 4):")
    for a in matched_a[:4]:
        print(f"  * {a['name']} ({a['category']}) - Rs.{a.get('demo_entry_fee', a.get('entry_fee', 0))}")
    print("Food (top 3):")
    for f in matched_f[:3]:
        print(f"  * {f['name']} ({f['cuisine']}) - Rs.{f.get('demo_cost_for_two', f.get('cost_for_two', 0))}")
    print("Hotels (top 3):")
    for h in matched_h[:3]:
        print(f"  * {h['name']} ({h.get('tier', h.get('category'))}) - Rs.{h.get('demo_price_per_night', h.get('price_per_night', 0))}")
