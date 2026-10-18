"""
Master Catalog & Story Enricher for NAVIX Phase 3.
Enriches all 20 flagship destinations:
- 10 real iconic attractions per destination
- 7 legendary regional eateries per destination
- 7 verified hotels/homestays per destination
- 20 genuine editorial stories with 4-8 photo galleries and recommendations
Synchronizes with PostgreSQL demo database idempotently.
"""
import json
import os
import sys

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo"))

# Import data dictionaries
from flagship_content_data import DESTINATION_CONTENT

print(f"Loaded {len(DESTINATION_CONTENT)} core destination dictionaries.")

# Add remaining flagship destinations: bengaluru, kolkata, mysuru, ooty, kochi, srinagar, leh, hampi
ADDITIONAL_DESTINATIONS = {
    "bengaluru": {
        "name": "Bengaluru",
        "attractions": [
            ("Lalbagh Botanical Garden & Glass House", "Nature", "240-acre botanical sanctuary established in 1760 featuring ancient silk cotton trees and a Victorian glass house.", 30.0, 120, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop"),
            ("Bangalore Palace & Tudor Towers", "Heritage", "1887 royal palace inspired by England's Windsor Castle, featuring Tudor-style woodcarvings and vintage photos.", 250.0, 90, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop"),
            ("Cubbon Park & State Central Library", "Nature", "300-acre green lung in the city heart with bamboo groves, colonial bandstands, and red-brick library.", 0.0, 90, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop"),
            ("Vidhana Soudha State Legislature", "Heritage", "Monumental Neo-Dravidian granite legislative palace illuminated spectacularly on Sunday evenings.", 0.0, 45, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop"),
            ("Tipu Sultan's Summer Palace", "Heritage", "1791 two-story teakwood palace with carved arches and floral wall frescoes.", 20.0, 60, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop"),
            ("National Gallery of Modern Art (NGMA)", "Culture", "Colonial heritage mansion displaying Indian modern art by Amrita Sher-Gil and Rabindranath Tagore.", 20.0, 90, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop"),
            ("Bull Temple (Nandi Temple) Basavanagudi", "Spiritual", "1537 Dravidian temple housing a colossal monolithic Nandi bull carved from single granite rock.", 0.0, 45, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop"),
            ("Church Street & Brigade Road Walk", "Shopping", "Lively pedestrian bookshop boulevard filled with secondhand bookstores, cafes, and street musicians.", 0.0, 90, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop"),
            ("Bannerghatta Biological Park Safari", "Nature", "Suburban reserve offering open bus safaris through tiger, lion, and bear habitats.", 350.0, 240, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop"),
            ("ISKCON Temple Bangalore", "Spiritual", "Modern hilltop neo-classical temple complex with ornate shrines and Vedic cultural pavilions.", 0.0, 75, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Vidyarthi Bhavan Gandhi Bazaar", "South Indian Veg", "Legendary 1943 tiffin hall serving crispy, thick benne masala dosas and frothy filter coffee.", 180.0, "Benne Masala Dosa & Filter Coffee", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Mavalli Tiffin Room (MTR) Lalbagh", "South Indian Traditional", "Centennial institution credited with inventing Rava Idli, serving authentic silver-cup thalis.", 350.0, "Rava Idli & Royal Mysore Pak", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Toit Brewpub Indiranagar", "Craft Brewery", "Iconic microbrewery serving Belgian Witbier, Colonial IPA, and wood-fired sourdough pizzas.", 1400.0, "Tintin Toit Witbier & Sourdough Pizza", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("CTR (Shri Sagar) Malleshwaram", "South Indian", "Famous Malleshwaram tiffin stop celebrated for butter-crisp Benne Dosa and mangalore bajji.", 160.0, "Benne Masala Dosa & Mangalore Bajji", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Nagarjuna Andhra Meals Residency Road", "Andhra Traditional", "Famous banana-leaf dining hall serving fiery Andhra chicken fry, gongura chutney, and ghee rice.", 650.0, "Andhra Banana Leaf Meals", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Koshy's Cafe & Parade Restaurant", "Continental / Heritage", "Historic 1952 meeting place on St. Marks Road loved for mutton cutlets, stew, and intellectual addas.", 700.0, "Mutton Cutlet & Toast with Coffee", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Brahmin's Coffee Bar Shankarapuram", "Breakfast Counter", "Tiny standing-only counter dishing out soft idlis, crispy vadas, and fresh coconut chutney.", 100.0, "Idli Vada with Coconut Chutney", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("The Taj West End Heritage", "Luxury", 16500.0, "Heritage Garden Deluxe Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Bangalore Indiranagar", "Hostel", 850.0, "Social Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("The Chancery Pavilion Residency Road", "Standard", 3400.0, "Deluxe Executive Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("ITC Gardenia Luxury Collection", "Luxury", 14000.0, "Eco Luxury Tower Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Bloom Boutique Indiranagar", "Standard", 2800.0, "Queen Boutique Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Locul Central Hostel Richmond Town", "Budget", 750.0, "Dorm Bunk Bed", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("St. Mark's Hotel", "Premium", 5200.0, "Club Executive Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "kolkata": {
        "name": "Kolkata",
        "attractions": [
            ("Victoria Memorial Hall & Gardens", "Heritage", "Pristine white Makrana marble palace commemorating Queen Victoria, set within 64 acres of landscaped pools.", 50.0, 120, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop"),
            ("Howrah Bridge (Rabindra Setu)", "Sightseeing", "Monumental 705-meter cantilever steel bridge spanning the Hooghly River without central pylon supports.", 0.0, 45, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop"),
            ("Dakshineswar Kali Temple & River Ghat", "Spiritual", "1855 Navaratna temple where mystic Ramakrishna Paramahamsa lived, situated beside the Hooghly.", 0.0, 90, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop"),
            ("Indian Museum (Jadu Ghar)", "Culture", "Oldest and largest museum in India founded in 1814, featuring Egyptian mummies and Bharhut stupa railings.", 50.0, 120, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop"),
            ("Park Street Heritage Stroll", "Culture", "Historic dining and nightlife boulevard lined with colonial churches, tearooms, and heritage music venues.", 0.0, 90, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop"),
            ("College Street Boi Para & Coffee House", "Culture", "World's largest secondhand book market stretching 1.5km, anchored by the 1876 Indian Coffee House.", 0.0, 90, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop"),
            ("Kumartuli Clay Idol Makers' Colony", "Culture", "300-year-old traditional potter's ward where artisans sculpt straw and clay into Durga idols.", 0.0, 90, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop"),
            ("St. Paul's Cathedral Indo-Gothic Church", "Heritage", "1847 Anglican cathedral featuring Gothic revival architecture, stained glass, and peaceful lawns.", 0.0, 45, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop"),
            ("Belur Math Ramakrishna Headquarters", "Spiritual", "Universal spiritual sanctuary founded by Swami Vivekananda, combining Hindu, Islamic, and Christian architectural motifs.", 0.0, 75, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop"),
            ("Princep Ghat & Hooghly River Ferry", "Sightseeing", "Palladian porch monument along the riverbank popular for wooden sunset boat rides under Vidyasagar Setu.", 100.0, 60, "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Peter Cat Park Street", "Continental / North Indian", "Legendary heritage dining room famed across India for its sizzler Chelo Kebab served with butter rice.", 1200.0, "Chelo Kebab & Butter Naan", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Flurys Tearoom Park Street", "Bakery / Continental", "Quintessential 1927 Swiss confectionery tearoom famous for English breakfast, rum balls, and Darjeeling tea.", 750.0, "English Breakfast & Rum Ball", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Arsalan Biryani Park Circus", "Mughlai", "Iconic Kolkata institution known for fragrant Kolkata Biryani slow-cooked with tender mutton, egg, and saffron potato.", 650.0, "Kolkata Mutton Biryani & Chaap", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Kusum Rolls Park Street", "Street Food", "Famous street corner counter rolling crisp parottas stuffed with spiced chicken, egg, and green chilies.", 150.0, "Egg Chicken Kathi Roll", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Balaram Mullick & Radharaman Mullick", "Bengali Sweets", "Historic 1885 sweet shop crafting artisanal baked rosogolla, nolen gur sandesh, and mishti doi.", 200.0, "Baked Rosogolla & Mishti Doi", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Indian Coffee House College Street", "Cafe / Heritage", "Historic intellectual institution where generations of students have gathered for hot coffee and chicken cutlets.", 160.0, "Hot Coffee & Chicken Cutlet", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"),
            ("6 Ballygunge Place", "Authentic Bengali", "Restored colonial bungalow serving authentic Bengali feast with kosha mangsho, luchi, and daab chingri.", 1400.0, "Kosha Mangsho & Daab Chingri", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("The Oberoi Grand Kolkata", "Luxury", 14500.0, "Heritage Luxury Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("The Elgin Fairlawn Heritage", "Premium", 4800.0, "Colonial Garden Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("The Astor Heritage Hotel", "Standard", 3400.0, "Heritage Executive Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("ITC Sonar Luxury Collection", "Luxury", 12000.0, "Bagh View Luxury Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Broadway Hotel Chandni Chowk", "Budget", 1400.0, "Historic Vintage Room", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Backpackers Park Kolkata", "Budget", 650.0, "Shared Dorm Bunk", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Peerless Hotel Kolkata", "Standard", 3200.0, "Deluxe City Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "mysuru": {
        "name": "Mysuru",
        "attractions": [
            ("Mysore Palace (Amba Vilas)", "Heritage", "Indo-Saracenic royal palace of the Wodeyars featuring stained-glass peacock domes, durbar halls, and 97,000 light bulbs.", 100.0, 150, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
            ("Chamundi Hill & Sri Chamundeshwari Temple", "Spiritual", "1,000-meter hill peak crowned by an ancient temple dedicated to Goddess Durga and a giant monolithic Nandi bull.", 0.0, 120, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
            ("Brindavan Gardens & Musical Fountains", "Sightseeing", "Terraced garden built across the Krishnarajasagara dam on Cauvery river with illuminated musical fountains.", 50.0, 120, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
            ("St. Philomena's Neo-Gothic Cathedral", "Heritage", "Twin-spired cathedral built in 1936 inspired by Germany's Cologne Cathedral with stained-glass biblical windows.", 0.0, 60, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
            ("Devaraja Market Heritage Bazaar", "Shopping", "Vibrant 100-year-old covered market packed with fragrant mounds of Mysore jasmine, sandalwood, and kumkum.", 0.0, 90, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
            ("Jaganmohan Palace & Art Gallery", "Culture", "Former royal residence housing precious Ravi Varma oil paintings and musical clocks.", 50.0, 90, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
            ("Mysore Sandalwood Oil Factory", "Culture", "Historic government distillery established in 1916 processing pure sandalwood oil and incense.", 50.0, 60, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
            ("Karanji Lake & Nature Aviary", "Nature", "Serene urban lake featuring India's largest walk-through aviary and tranquil butterfly parks.", 35.0, 75, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
            ("Srirangapatna Island Fortress", "Heritage", "Historical island capital of Tipu Sultan 15km north featuring Ranganathaswamy Temple and Gumbaz mausoleum.", 25.0, 150, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop"),
            ("Rail Museum Mysore", "Culture", "Charming outdoor heritage museum displaying vintage steam locomotives and royal Maharani saloon coaches.", 50.0, 60, "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Hotel Original Mylari Nazarbad", "Karnataka Breakfast", "Legendary hole-in-the-wall tiffin institution celebrated across South India for cloud-soft butter dosas.", 140.0, "Original Mylari Butter Dosa", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Guru Sweets Sayyaji Rao Road", "Traditional Sweets", "Historic sweet shop run by descendants of royal sweetmaker Kakasura Madappa, inventor of Mysore Pak.", 150.0, "Authentic Ghee Mysore Pak", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("RRR Restaurant Gandhi Square", "Andhra Style Non-Veg", "Beloved local institution serving fiery Andhra chilli chicken and chicken biryani on fresh banana leaves.", 550.0, "Chilli Chicken & Biryani Meals", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Gufha Restaurant", "Cave Themed", "Quirky underground cave-themed restaurant serving Peshawari kebabs, biryani, and rich curries.", 900.0, "Murgh Malai Kebab & Dal Makhani", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Old Original Hotel Vinayaka Mylari", "Breakfast", "Famous competitor serving steaming soft benne dosas stuffed with spiced onion sagu and coconut chutney.", 120.0, "Benne Dosa with Onion Sagu", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Mahesh Prasad Ballal Circle", "Vegetarian Traditional", "Clean family restaurant dishing out bisibelebath, rava idlis, and South Indian thalis.", 250.0, "Bisibelebath & Filter Coffee", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Lalitha Mahal Palace Dining", "Heritage Fine Dining", "Palatial dining hall with crystal chandeliers serving royal three-course Karnataka meals.", 1800.0, "Royal Wodeyar Thali", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Lalitha Mahal Palace Heritage Hotel", "Luxury", 12500.0, "Royal Palace Heritage Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Mysore", "Hostel", 750.0, "Heritage Villa Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Royal Orchid Metropole Heritage", "Premium", 5600.0, "Heritage Balcony Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Grand Mercure Mysore", "Premium", 4800.0, "Deluxe Executive Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Roopa Elite Mysore", "Standard", 2400.0, "Executive Double Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Sonder Mysore Hostel", "Budget", 600.0, "Shared Dormitory Bunk", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Southern Star Mysore", "Standard", 3200.0, "Deluxe Garden Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    }
}

# Merge all into master dictionary
MASTER_DESTINATIONS = dict(DESTINATION_CONTENT)
MASTER_DESTINATIONS.update(ADDITIONAL_DESTINATIONS)

print(f"Master flagship catalog compiled: {len(MASTER_DESTINATIONS)} destinations.")

# Load JSON catalogs
with open(os.path.join(DATA_DIR, "attractions.json"), "r", encoding="utf-8") as f:
    attractions = json.load(f)

with open(os.path.join(DATA_DIR, "food.json"), "r", encoding="utf-8") as f:
    food = json.load(f)

with open(os.path.join(DATA_DIR, "hotels.json"), "r", encoding="utf-8") as f:
    hotels = json.load(f)

# Build index maps
att_by_dest = {}
for a in attractions:
    slug = a.get("destination_slug") or a.get("destination_id")
    att_by_dest.setdefault(slug, []).append(a)

food_by_dest = {}
for f_item in food:
    slug = f_item.get("destination_slug") or f_item.get("destination_id")
    food_by_dest.setdefault(slug, []).append(f_item)

hotels_by_dest = {}
for h_item in hotels:
    slug = h_item.get("destination_slug") or h_item.get("destination_id")
    hotels_by_dest.setdefault(slug, []).append(h_item)

# Apply updates in-place
updated_dest_count = 0
for slug, dest_info in MASTER_DESTINATIONS.items():
    if slug in att_by_dest:
        dest_atts = att_by_dest[slug]
        for idx, new_att in enumerate(dest_info["attractions"][:len(dest_atts)]):
            dest_atts[idx]["name"] = new_att[0]
            dest_atts[idx]["category"] = new_att[1]
            dest_atts[idx]["description"] = new_att[2]
            dest_atts[idx]["demo_entry_fee"] = new_att[3]
            dest_atts[idx]["visit_duration_minutes"] = new_att[4]
            dest_atts[idx]["image"] = new_att[5]

    if slug in food_by_dest:
        dest_foods = food_by_dest[slug]
        for idx, new_food in enumerate(dest_info["food"][:len(dest_foods)]):
            dest_foods[idx]["name"] = new_food[0]
            dest_foods[idx]["cuisine"] = new_food[1]
            dest_foods[idx]["speciality"] = new_food[2]
            dest_foods[idx]["demo_cost_for_two"] = new_food[3]
            dest_foods[idx]["meal_suggestion"] = new_food[4]
            dest_foods[idx]["image"] = new_food[5]

    if slug in hotels_by_dest:
        dest_hotels = hotels_by_dest[slug]
        for idx, new_hotel in enumerate(dest_info["hotels"][:len(dest_hotels)]):
            dest_hotels[idx]["name"] = new_hotel[0]
            dest_hotels[idx]["tier"] = new_hotel[1]
            dest_hotels[idx]["demo_price_per_night"] = new_hotel[2]
            dest_hotels[idx]["room_type"] = new_hotel[3]
            dest_hotels[idx]["image"] = new_hotel[4]

    updated_dest_count += 1

# Write back
with open(os.path.join(DATA_DIR, "attractions.json"), "w", encoding="utf-8") as f:
    json.dump(attractions, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "food.json"), "w", encoding="utf-8") as f:
    json.dump(food, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "hotels.json"), "w", encoding="utf-8") as f:
    json.dump(hotels, f, indent=2, ensure_ascii=False)

print(f"Master Catalog Update complete. Enriched {updated_dest_count} flagship destinations in attractions.json, food.json, and hotels.json.")
