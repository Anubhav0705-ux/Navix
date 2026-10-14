"""
Enrichment of remaining 9 flagship destinations in attractions.json, food.json, and hotels.json:
kasol, shimla, rishikesh, munnar, ooty, kochi, srinagar, leh, hampi.
"""
import json
import os

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo"))

with open(os.path.join(DATA_DIR, "attractions.json"), "r", encoding="utf-8") as f:
    attractions = json.load(f)

with open(os.path.join(DATA_DIR, "food.json"), "r", encoding="utf-8") as f:
    food = json.load(f)

with open(os.path.join(DATA_DIR, "hotels.json"), "r", encoding="utf-8") as f:
    hotels = json.load(f)

REMAINING_9 = {
    "kasol": {
        "attractions": [
            ("Chalal Riverside Pine Trek", "Nature", "Walking trail winding along roaring Parvati River across a suspension bridge through dense deodar forests.", 0.0, 120, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"),
            ("Manikaran Sahib Gurudwara & Hot Springs", "Spiritual", "Riverside Sikh pilgrimage site famous for natural boiling sulfur springs that cook community langar.", 0.0, 90, "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop"),
            ("Tosh Village & Glacial Trail", "Adventure", "Traditional wooden village perched at 2,400m at the far end of Parvati Valley with views of Tosh glacier.", 0.0, 180, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"),
            ("Rasol Alpine Mountain Trail", "Adventure", "Rewarding steep hike climbing through alpine meadows and apple orchards to traditional village Rasol.", 0.0, 240, "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop"),
            ("Kheerganga Hot Springs Trail Base", "Adventure", "Legendary meadow trail base where natural sulphur bath pools look out across snowy peaks.", 0.0, 300, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"),
            ("Grahan Ancient Forest Path", "Nature", "Secluded heritage village trail through ancient rhododendron and pine forest without road access.", 0.0, 240, "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop"),
            ("Parvati River Boulders & Beach", "Sightseeing", "Natural granite boulder clearings along the turquoise glacial torrent ideal for quiet mountain contemplation.", 0.0, 60, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"),
            ("Malana Hydro Viewpoint Trail", "Culture", "Valley viewpoint overlooking the ancient isolated community of Malana, known for unique democratic traditions.", 0.0, 150, "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop"),
            ("Pulga Fairy Forest & Pine Glades", "Nature", "Enchanting mossy pine forest walk near Pulga village with towering spruce and natural springs.", 0.0, 120, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"),
            ("Kasol Flea Market & Handloom Lane", "Shopping", "Bazaar street lined with woollen ponchos, hemp handicrafts, and silver jewellery.", 0.0, 60, "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Moon Dance Cafe Kasol", "Bakery / Continental", "Iconic central cafe serving fresh cinnamon rolls, Nutella crepes, woodfired pizzas, and espresso.", 500.0, "Cinnamon Roll & Shakshuka", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Evergreen Cafe Kasol", "Israeli / Italian", "Legendary traveler hangout with low seating and ambient music serving hearty falafel and hummus platters.", 600.0, "Special Evergreen Falafel Platter", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Bhoj Cafe Kasol", "Bohemian Cafe", "Psychedelic mural walls and cozy seating serving hot ginger lemon honey tea, pasta, and momos.", 450.0, "Trout Fish & Lemon Honey Tea", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Shambhu Momos Corner", "Street Food", "Famous wooden stall near the bridge making piping-hot steamed spinach cheese and mutton momos.", 150.0, "Steamed Mountain Momos & Thukpa", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Panjtara Bar & Grill", "Multi-Cuisine", "Riverside outdoor deck in Chalal with live acoustic music, wood-charcoal kebabs, and fondue.", 800.0, "Woodfired Pizza & Kashmiri Kahwa", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Little Italy Cafe Kasol", "Italian", "Stone cottage eatery making authentic thin-crust quattro formaggi pizza and creamy pasta.", 700.0, "Wood-fired Pizza Margherita", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"),
            ("Manikaran Langar Hall", "Community Meals", "Sacred temple community kitchen serving nourishing Dal, Sabzi, and Kheer cooked in hot spring waters.", 0.0, "Hot Spring Cooked Langar", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("The Hosteller Kasol", "Hostel", 750.0, "Riverside Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Kasol Riverside Camps & Cottages", "Standard", 2200.0, "Riverside Wooden Cottage", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Parvati Kuteer Heritage Cottages", "Premium", 4800.0, "Cedar Log Cabin", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Echor Riverside Resort Kasol", "Premium", 5400.0, "Mountain View Deluxe Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Whoopers Hostel Kasol", "Budget", 600.0, "Dorm Bunk Bed", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Alpine Guest House Chalal", "Budget", 1100.0, "Rustic Pine Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Himalayan Village Resort", "Luxury", 12500.0, "Machan Wooden Cottage", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "shimla": {
        "attractions": [
            ("The Ridge & Christ Church", "Heritage", "Neo-Gothic 1857 church and pedestrian public square overlooking snow-dusted Shivalik peaks.", 0.0, 75, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Mall Road Heritage Walk", "Sightseeing", "Traffic-free colonial promenade lined with heritage post offices, bookshops, and mountain view benches.", 0.0, 90, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Jakhoo Temple & Giant Hanuman Statue", "Spiritual", "Highest peak in Shimla (2,455m) crowned by a 108-foot orange Hanuman statue and alpine deodar forest.", 0.0, 90, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Viceregal Lodge (Rashtrapati Niwas)", "Heritage", "Scottish baronial mansion built in 1888 with teak interiors and manicured botanic lawns.", 100.0, 120, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Kalka-Shimla Toy Train Scenic Railway", "Sightseeing", "UNESCO World Heritage narrow-gauge train traversing 103 tunnels and stone-arch viaducts.", 150.0, 180, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Kufri Adventure Ridge & Mahasu Peak", "Adventure", "Mountain ridge famous for winter skiing, yak rides, and dense Himalayan cedar forests.", 50.0, 150, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Chadwick Cascading Waterfall", "Nature", "Forest waterfall tumbling down a 100-meter gorge within Glen deodar nature sanctuary.", 0.0, 90, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Annandale Army Heritage Museum & Ground", "Culture", "Historic colonial meadow and golf ground housing military history exhibits.", 0.0, 60, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Summer Hill Scenic Campus Trail", "Nature", "Peaceful forested suburb where Mahatma Gandhi resided, featuring walking paths.", 0.0, 60, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Lakkar Bazaar Wooden Craft Trail", "Shopping", "Traditional marketplace adjoining The Ridge specialized in carved cedar artifacts.", 0.0, 60, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Wake & Bake Cafe Mall Road", "Cafe / Bakery", "Top-floor colonial timber cafe serving French crepes, pour-over coffee, and freshly baked apple pie.", 500.0, "Buckwheat Crepe & Filter Coffee", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Cafe Simla Times", "Italian / Multi-Cuisine", "Heritage terrace with mural ceiling art and woodfired pizza ovens overlooking city lights.", 800.0, "Woodfired Quattro Formaggi Pizza", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Baljees Restaurant & Fascination", "Himachali / North Indian", "Historic Mall Road dining room famed for creamy Kurkure Khumb and warm Gulab Jamuns.", 600.0, "Himachali Madra & Gulab Jamun", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Kewal Ka Dhaba Sanjauli", "Traditional Breakfast", "Oldest dhaba in Shimla serving butter-soaked bun maska and spiced tea since 1931.", 100.0, "Bun Maska & Masala Chai", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Cecil Restaurant Oberoi", "Fine Dining", "Colonial grandeur dining hall with chandeliers serving Himachali Dham and European roasts.", 2400.0, "Himachali Traditional Thali", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Hide Out Cafe", "Cafe / Breakfast", "Cozy brick nook on Mall Road loved for English breakfasts, creamy mushroom pasta, and shakes.", 450.0, "Full English Breakfast & Cappuccino", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Himachali Rasoi", "Regional Specialty", "Dedicated regional restaurant serving authentic Kangri and Mandi Dham with siddu and ghee.", 400.0, "Steamed Siddu with Ghee & Dal", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("The Oberoi Cecil Heritage", "Luxury", 16500.0, "Colonial Luxury Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Shimla", "Hostel", 800.0, "Valley Facing Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Clarkes Hotel Heritage Landmark", "Premium", 7200.0, "Heritage Deluxe Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Wildflower Hall Resort Mashobra", "Luxury", 26000.0, "Mountain View Luxury Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Hotel Combermere Mall Road", "Standard", 3400.0, "Deluxe Mountain Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("The Hosteller Shimla", "Budget", 650.0, "Dorm Bunk Bed", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Woodville Palace Heritage Hotel", "Premium", 6800.0, "Royal Vintage Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "rishikesh": {
        "attractions": [
            ("Triveni Ghat Evening Ganga Aarti", "Spiritual", "Majestic riverside confluence where brass lamps and chanted hymns illuminate the Ganges at dusk.", 0.0, 90, "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=800&auto=format&fit=crop"),
            ("Lakshman Jhula & Suspension Bridge", "Sightseeing", "Historic 450-foot iron suspension bridge spanning the emerald river rapids, flanked by temples.", 0.0, 60, "https://images.unsplash.com/photo-1609137144820-221087cfef42?q=80&w=800&auto=format&fit=crop"),
            ("The Beatles Ashram (Chaurasi Kutia)", "Culture", "Transcendental meditation site where the Beatles stayed in 1968, filled with stone meditation domes.", 150.0, 120, "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=800&auto=format&fit=crop"),
            ("Neer Garh Waterfall Hike", "Nature", "Refreshing two-tier natural cascade accessed via a mountain walking trail through terraced foothills.", 50.0, 120, "https://images.unsplash.com/photo-1609137144820-221087cfef42?q=80&w=800&auto=format&fit=crop"),
            ("Shivpuri White Water River Rafting", "Adventure", "Thrilling 16km Ganges river rafting expedition navigating Class III rapids.", 1100.0, 180, "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=800&auto=format&fit=crop"),
            ("Parmarth Niketan Ashram & Gardens", "Spiritual", "Serene spiritual retreat by the river with clean courtyards, yoga halls, and riverside aarti.", 0.0, 75, "https://images.unsplash.com/photo-1609137144820-221087cfef42?q=80&w=800&auto=format&fit=crop"),
            ("Kunjapuri Devi Sunrise Temple Trek", "Adventure", "High ridge peak at 1,676m offering sunrise panoramas of the snow-clad Greater Himalayan peaks.", 100.0, 180, "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=800&auto=format&fit=crop"),
            ("Ram Jhula & Swarg Ashram Trail", "Sightseeing", "Spiritual pedestrian corridor connecting bustling bazaar lanes, bookshops, and ashrams.", 0.0, 75, "https://images.unsplash.com/photo-1609137144820-221087cfef42?q=80&w=800&auto=format&fit=crop"),
            ("Vashistha Cave (Gufa) on Ganges", "Spiritual", "Tranquil meditation cave beside a calm white-sand beach 25km upstream, used by sage Vashistha.", 0.0, 90, "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=800&auto=format&fit=crop"),
            ("Bungee Jumping Point Mohan Chatti", "Adventure", "India's highest fixed cantilever bungee platform (83 meters) operated by certified adventure jumpmasters.", 3700.0, 120, "https://images.unsplash.com/photo-1609137144820-221087cfef42?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Chotiwala Restaurant Swarg Ashram", "Vegetarian", "Historic pilgrimage eatery serving traditional satvik thalis, Garhwali rajma, and tandoori rotis.", 400.0, "Garhwali Thali & Rabri", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Little Buddha Cafe", "Continental / Israeli", "Treehouse-style multi-level wooden cafe overlooking the Ganges rapids, serving fresh salads and falafel.", 550.0, "Falafel Platter & Mint Lassi", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Beatles Cafe (The 60s Cafe)", "Cafe / Vegan", "Retro music-themed terrace cafe on Tapovan cliff serving artisanal vegan pasta and pour-over coffee.", 600.0, "Vegan Pesto Bowl & Herbal Latte", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Ganga Beach Restaurant", "North Indian / Cafe", "Open-air low-seating riverside terrace in Laxman Jhula with river soundscapes and wood-fired pizza.", 450.0, "Woodfired Margherita & Ginger Chai", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Pure Soul Cafe & Organic Kitchen", "Organic", "Modern organic kitchen overlooking Himalayan pine ridges serving gluten-free dishes and local greens.", 700.0, "Avocado Toast & Organic Thali", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Madras Cafe Tapovan", "South Indian", "Quick breakfast counter serving piping-hot ghee roast dosas, idli sambar, and filter coffee.", 220.0, "Mysore Masala Dosa & Filter Coffee", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Devraj Coffee Corner (German Bakery)", "Bakery", "Waterfront balcony right at Lakshman Jhula serving apple strudel, fresh baked cheesecake, and herbal teas.", 350.0, "Warm Apple Strudel & Black Coffee", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Zostel Rishikesh Tapovan", "Hostel", 750.0, "Community Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Ganga Kinare Riverside Boutique Resort", "Premium", 5200.0, "River Facing Deluxe Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Moustache Rishikesh Riverside", "Budget", 650.0, "Dorm Bunk Bed", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Ananda in the Himalayas", "Luxury", 28000.0, "Palace Himalayan Suite", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Aloha on the Ganges Resort", "Premium", 6800.0, "Ganga Facing Apartment", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Skyard Rishikesh Hostel", "Budget", 600.0, "Bunk in 6-Bed Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Hotel Narayana Palace", "Standard", 2100.0, "Standard Garden Cottage", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "munnar": {
        "attractions": [
            ("Eravikulam National Park (Nilgiri Tahr)", "Nature", "High altitude sanctuary protecting the endangered Nilgiri Tahr mountain goat and Anamudi peak vistas.", 200.0, 180, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Tata Tea Museum & Nallathanni Estate", "Culture", "Historic tea factory explaining century-old machinery, orthodox tea manufacturing, and tea tasting rooms.", 150.0, 90, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Mattupetty Dam & Eco Lake Point", "Sightseeing", "Concrete gravity dam flanked by tea slopes, renowned for speedboating and acoustic echo points.", 100.0, 90, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Top Station Historic Viewpoint", "Nature", "Highest point on Munnar border (1,880m) offering sweeping panoramic views of Western Ghats.", 50.0, 120, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Attukad Cascading Waterfalls", "Nature", "Dramatic mountain waterfall tumbling through jungle canyons between Munnar town and Pallivasal tea gardens.", 0.0, 60, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Kundala Lake & Kashmiri Shikara Rides", "Sightseeing", "Serene reservoir surrounded by eucalyptus trees where colorful pedal boats and shikaras glide quietly.", 150.0, 75, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Pothamedu Green Tea Viewpoint", "Sightseeing", "Panoramic mountain ridge overlook offering striking wide-angle views of tea, coffee, and cardamom plantations.", 0.0, 60, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Lockhart Tea Factory & Plantation Trail", "Culture", "Operational 1857 orthodox tea estate offering walking trails through misty slopes and tasting sessions.", 120.0, 90, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Chinnar Wildlife Sanctuary Border", "Adventure", "Dry deciduous forest sanctuary home to grizzled giant squirrels, star tortoises, and ancient dolmens.", 150.0, 150, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Blossom International Hydel Park", "Nature", "Landscaped floral park near river Muthirappuzha with walking trails, cycling tracks, and tree houses.", 40.0, 60, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Rapsy Restaurant Munnar Town", "Kerala / Non-Veg", "Famous town-center landmark serving flaky Malabar parottas, spiced beef fry, and mutton biryani.", 350.0, "Malabar Parotta & Beef Fry", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Saravana Bhavan Munnar", "South Indian Veg", "Dependable vegetarian spot serving steaming idlis, ghee masala dosas, and filter coffee.", 220.0, "Ghee Roast Dosa & Filter Coffee", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Guru's Restaurant", "Kerala Traditional", "Homestyle dining hall serving authentic banana-leaf sadhya with avial, thoran, sambar, and payasam.", 300.0, "Traditional Banana Leaf Sadhya", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Copper Castle Restaurant", "Multi-Cuisine", "Panoramic valley-view dining room serving aromatic Kerala spiced curries, tandoori items, and fresh tea.", 700.0, "Kerala Fish Curry & Rice", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Tea Tales Cafe Munnar", "Cafe / Bakery", "Cozy wooden cafe serving single-estate Munnar teas, carrot cake, homemade chocolates, and sandwiches.", 320.0, "Cardamom Tea & Carrot Cake", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("SN Restaurant Old Munnar", "South Indian", "Popular joint for piping hot appams with vegetable stew and egg curry alongside strong cardamom chai.", 240.0, "Appam with Vegetable Stew", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Hill Spice Heritage Restaurant", "Kerala Cuisine", "Cardamom-scented restaurant serving slow-cooked chicken roast, appams, and Malabar seafood curries.", 650.0, "Nadan Chicken Roast & Parotta", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Tea County Resort Munnar", "Premium", 4600.0, "Valley Facing Deluxe Cottage", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Munnar", "Hostel", 800.0, "Misty Valley Bunk", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Green Spaces Organic Homestay", "Standard", 2500.0, "Cardamom Estate Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Fragrant Nature Resort & Spa", "Luxury", 9800.0, "Tropic Green Luxury Suite", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("The Hosteller Munnar", "Budget", 650.0, "Dormitory Bunk Bed", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Munnar Tea Hills Resort", "Premium", 5200.0, "Horizon Tea Villa", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Eucalyptus Forest Homestay", "Budget", 1200.0, "Cozy Country Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "hampi": {
        "attractions": [
            ("Vijaya Vittala Temple & Stone Chariot", "Heritage", "15th-century architectural marvel featuring the iconic carved stone chariot and musical granite pillars.", 40.0, 150, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("Virupaksha Temple & River Ghat", "Spiritual", "Active 7th-century Dravidian pilgrimage temple complex dedicated to Lord Shiva, towering above Hampi Bazaar.", 25.0, 90, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Matanga Hill Sunrise Trek", "Nature", "Highest point in central Hampi offering panoramic 360-degree dawn vistas of granite boulders and temples.", 0.0, 90, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("Lotus Mahal & Elephant Stables", "Heritage", "Symmetric Indo-Islamic royal palace with arched pavilions alongside the monumental elephant stables.", 40.0, 90, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Hemakuta Hill Monolithic Monuments", "Heritage", "Gentle sloping hill dotted with pre-Vijayanagara temples, monolithic Ganesha shrines, and sunset boulders.", 0.0, 75, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("Coracle Boat Ride on Tungabhadra River", "Adventure", "Traditional circular woven wicker boat crossing between riverbanks past ancient carved boulders.", 150.0, 45, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Sanapur Lake Bouldering & Cliff Walk", "Nature", "Tranquil reservoir surrounded by giant granite boulders across the river in Hippie Island.", 0.0, 120, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("Queen's Bath & Royal Enclosure", "Heritage", "Ornate medieval stepped pool and stone aqueducts illustrating ancient Vijayanagara hydraulic engineering.", 40.0, 60, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Anegundi Historic Village & Monkey Temple", "Culture", "Mythological Kishkindha kingdom village featuring Anjaneya Hill temple.", 0.0, 120, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("Sasivekalu & Kadalekalu Ganesha", "Heritage", "Gigantic monolithic Ganesha statues carved directly from single granite boulders.", 0.0, 45, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Mango Tree Restaurant", "South Indian / Global", "Beloved relaxed garden restaurant serving delicious banana-leaf thalis, woodfired pizzas, and fresh fruit juices.", 450.0, "South Indian Thali & Nutella Pancake", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Gouthami German Bakery", "Bakery / Cafe", "Peaceful traveler hangout on the boulder side serving freshly baked croissants, shakshuka, and filter coffee.", 350.0, "Shakshuka & Brewed Coffee", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Laughing Buddha Cafe", "Israeli / Continental", "Riverfront cushion-seating cafe overlooking Tungabhadra river serving hummus platters and mint tea.", 400.0, "Hummus Falafel Platter", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Suresh Restaurant Hampi Bazaar", "Karnataka Traditional", "Simple and authentic local eatery serving steaming paddu, benne dosa, and spicy coconut chutney.", 150.0, "Crispy Paddu & Benne Dosa", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Archana Guest House Rooftop", "Multi-Cuisine", "Rooftop dining with direct vistas of Virupaksha Temple tower serving lemon rice and curries.", 380.0, "Lemon Rice & South Indian Curry", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Uma Shankar Veg Restaurant", "South Indian", "Fast-service vegetarian dining hall popular for unlimited noon thalis and curd rice.", 180.0, "Unlimited Karnataka Meals", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Chill Out Cafe Hampi", "Cafe", "Relaxed bamboo-hut dining spot with gentle sitar tunes serving pasta, ginger honey tea, and pancakes.", 320.0, "Banana Pancake & Ginger Tea", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Heritage Resort Hampi", "Premium", 5600.0, "Eco Villa with Verandah", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Hampi Gangavathi", "Hostel", 750.0, "Boulder View Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Kishkinda Heritage Resort", "Standard", 2800.0, "Garden Cottage", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Evolve Back Kamalapura Palace", "Luxury", 22000.0, "Palace Jal Mahal Suite", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Mowgli Guest House Hampi", "Budget", 1200.0, "Paddy Field Hut", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Shanthi Guest House Paddy View", "Standard", 2200.0, "Paddy Field Cottage", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Gopi Guesthouse Hampi Bazaar", "Budget", 1400.0, "Standard Double Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "leh": {
        "attractions": [
            ("Pangong Tso High Altitude Lake", "Nature", "Endorheic lake extending across 134km at 4,225m altitude, shifting from deep turquoise to cobalt blue.", 20.0, 240, "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop"),
            ("Khardung La Mountain Pass (5,359m)", "Adventure", "One of the world's highest motorable passes, adorned with fluttering Buddhist prayer flags.", 20.0, 120, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"),
            ("Nubra Valley & Hunder Sand Dunes", "Nature", "High-altitude desert valley with silver sand dunes and double-humped Bactrian camel rides.", 20.0, 240, "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop"),
            ("Shanti Stupa Sunrise Panorama", "Spiritual", "White-domed Buddhist stupa perched on Changspa hill offering vistas of Leh city.", 0.0, 90, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"),
            ("Thiksey Monastery (Mini Potala)", "Culture", "Twelve-story Tibetan Buddhist monastery housing a 15-meter statue of Maitreya Buddha.", 50.0, 120, "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop"),
            ("Leh Palace & Heritage Quarter", "Heritage", "Nine-story royal palace built in the 1600s by King Sengge Namgyal modeled on Lhasa's Potala Palace.", 100.0, 90, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"),
            ("Hemis Monastery & Museum", "Spiritual", "Wealthiest monastery in Ladakh founded in 1630, famous for its annual masked Cham dance festival.", 100.0, 90, "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop"),
            ("Magnetic Hill & Confluence (Sangam)", "Sightseeing", "Gravity-defying visual road slope paired with the meeting of Indus and Zanskar rivers.", 0.0, 90, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"),
            ("Diskit Monastery & Giant Buddha", "Culture", "Oldest monastery in Nubra valley featuring a 32-meter tall statue of Jampa Buddha.", 50.0, 90, "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop"),
            ("Leh Main Bazaar Cultural Stroll", "Shopping", "Pedestrian cobbled market bustling with Ladakhi women selling organic apricots, pashmina, and silver.", 0.0, 90, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("The Tibetan Kitchen Leh", "Tibetan", "Renowned Leh restaurant serving piping-hot Tingmo buns, steamed momos, and aromatic Thukpa.", 600.0, "Steamed Momos & Gyathuk Soup", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Gesmo Restaurant & German Bakery", "Bakery / Continental", "Historic 1989 backpacker landmark famous for Yak cheese pizza, apple pie, and cinnamon rolls.", 550.0, "Yak Cheese Pizza & Mint Tea", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Bon Appetit Leh", "Fine Dining", "Minimalist Ladakhi architectural restaurant with mountain views serving grilled trout and herbal infusions.", 1200.0, "Pan-seared Trout & Walnut Tart", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Lamayuru Restaurant", "Tibetan / Indian", "Cozy Main Bazaar restaurant loved by trekkers for nourishing thenthuk, chowmein, and butter tea.", 400.0, "Hand-pulled Thenthuk & Butter Tea", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Alchi Kitchen Leh Branch", "Traditional Ladakhi", "Specialist women-run kitchen making traditional Khambir bread with walnut chutney.", 650.0, "Stuffed Khambir & Chhutagi", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Chopsticks Noodle Bar", "Asian Fusion", "Vibrant dining venue in Leh market serving spicy Thai curries, wonton soups, and pan-fried noodles.", 700.0, "Wonton Soup & Pad Thai", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"),
            ("Dzomsa Organic Shop", "Organic Drinks", "Local eco-outlet dispensing warm seabuckthorn juice, dried apricots, and pure spring water refills.", 120.0, "Fresh Seabuckthorn Juice", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("The Grand Dragon Ladakh", "Luxury", 14500.0, "Luxury Mountain View Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Leh", "Hostel", 850.0, "Rooftop Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Gomang Boutique Hotel", "Premium", 6800.0, "Solar-Heated Boutique Suite", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("The Indus River Camp", "Luxury", 16000.0, "Luxury Glamping Tent", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Ree Yul Guesthouse", "Standard", 2200.0, "Traditional Ladakhi Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Raybo Hostel Leh", "Budget", 650.0, "Dorm Bunk Bed", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Singge Palace Hotel", "Standard", 3400.0, "Standard Heritage Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "ooty": {
        "name": "Ooty",
        "attractions": [
            ("Doddabetta Peak & Observatory", "Nature", "Highest summit in the Nilgiri Hills (2,637m) offering telescopes with vistas across Coimbatore plains.", 30.0, 90, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Nilgiri Mountain Railway (Toy Train)", "Sightseeing", "UNESCO rack-and-pinion steam railway traversing pine ridges and tea terraces to Coonoor.", 150.0, 180, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Government Botanical Gardens Ooty", "Nature", "55-acre terraced gardens established in 1848 holding 1,000 species including a fossilized tree trunk.", 50.0, 120, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Pykara Lake & Cascading Waterfalls", "Nature", "Sacred Toda river lake surrounded by shola forests with motorboat cruises and tiered falls.", 100.0, 120, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Government Rose Garden", "Nature", "Terraced garden on the slopes of Elk Hill containing over 20,000 varieties of blooming roses.", 40.0, 90, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Emerald & Avalanche Lake Sanctuary", "Nature", "Pristine tea valley reservoirs nestled in the Upper Bhavani wildlife region.", 50.0, 180, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Ooty Lake & Boathouse", "Sightseeing", "Artificial 65-acre lake constructed in 1824 with eucalyptus-shaded paths and pedal boating.", 50.0, 75, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Tea Park & Highfield Tea Factory", "Culture", "Operational tea manufacturing facility explaining CTC tea processing with tea gardens.", 30.0, 60, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("St. Stephen's Church Heritage Walk", "Heritage", "One of the oldest churches in the Nilgiris (1829) with timber beams salvaged from Tipu Sultan's palace.", 0.0, 45, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Commercial Road Chocolate Stroll", "Shopping", "Bustling downtown street packed with artisanal homemade dark chocolate boutiques and tea shops.", 0.0, 60, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Nahar's Sidewalk Cafe", "Italian / Pizza", "Famous wood-fired pizzeria in Charing Cross serving crisp thin-crust pizzas, pasta, and espresso.", 600.0, "Woodfired Pizza & Cappuccino", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Earl's Secret (King's Cliff)", "Continental Heritage", "Glass-enclosed conservatory restaurant in a 130-year heritage mansion serving roasts and steaks.", 1200.0, "Grilled Chicken Steak & Brownie", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Shinkows Chinese Restaurant", "Chinese Heritage", "Historic 1954 Chinese eatery run by authentic local family serving chili pork and noodles.", 650.0, "Chilli Pork & Steamed Wantons", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Place to Bee", "Italian / Slow Food", "Cozy garden cafe dedicated to slow food and local tribal honey serving handmade ravioli.", 500.0, "Handmade Ravioli & Wild Honey Crepe", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Adyar Ananda Bhavan (A2B) Ooty", "South Indian", "Reliable vegetarian tiffin spot serving ghee pongal, medu vada, and filter coffee.", 220.0, "Ghee Pongal & Filter Coffee", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Moddy's Chocolates Cafe", "Chocolates / Bakery", "Legendary homemade chocolate institution operating since 1951 famous for fudge and hot cocoa.", 350.0, "Belgian Hot Chocolate & Truffles", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Junior Kuppanna Ooty", "Kongu Cuisine", "Famous Tamil Nadu non-veg restaurant known for seeraga samba mutton biryani and pallipalayam chicken.", 600.0, "Mutton Biryani & Chicken Chukka", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Savoy - IHCL SeleQtions", "Luxury", 14500.0, "Colonial Heritage Cottage", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Ooty", "Hostel", 800.0, "Hillside Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("King's Cliff Heritage Hotel", "Premium", 5800.0, "Heritage Fireplace Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Sterling Ooty Fern Hill", "Standard", 3600.0, "Classic Valley Suite", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Hotel Lakeview Ooty", "Standard", 2400.0, "Valley Facing Private Cottage", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("The Hosteller Ooty", "Budget", 650.0, "Dorm Bunk Bed", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Sinclairs Retreat Ooty", "Premium", 6200.0, "Panoramic Hill View Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "kochi": {
        "name": "Kochi",
        "attractions": [
            ("Fort Kochi Chinese Fishing Nets", "Heritage", "Cantilevered shore-operated fishing nets introduced by Chinese traders in the 14th century.", 0.0, 60, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("Mattancherry Palace (Dutch Palace)", "Heritage", "1555 palace built by Portuguese with vibrant Hindu mythological murals and royal portraits.", 20.0, 75, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Paradesi Synagogue & Jew Town", "Culture", "1568 Jewish synagogue with hand-painted Chinese porcelain floor tiles and Belgian glass chandeliers.", 20.0, 60, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("St. Francis CSI Church", "Heritage", "Oldest European-built church in India (1503) where explorer Vasco da Gama was buried.", 0.0, 45, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Santa Cruz Cathedral Basilica", "Heritage", "Grand Gothic basilica featuring two towering spires and ceiling paintings by Italian Jesuit Brother Moscheni.", 0.0, 45, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("Kerala Kathakali Centre Performance", "Culture", "Intimate theater showcasing traditional makeup preparation and classical Kathakali dance-drama.", 400.0, 120, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Marine Drive Waterfront Promenade", "Sightseeing", "Scenic 3km harbor-facing walkway with Rainbow Bridge and sunset ferry cruises across Vembanad lake.", 50.0, 90, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("Princess Street Heritage Cafe Stroll", "Shopping", "Colonial lane filled with European architectural houses, spice boutiques, and antique stores.", 0.0, 75, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop"),
            ("Hill Palace Museum Tripunithura", "Culture", "54-acre royal palace complex of Cochin Maharajas housing crown jewels and archaeological exhibits.", 50.0, 120, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"),
            ("Cherai Beach & Vypin Island Ferry", "Nature", "Calm golden-sand coastal beach where backwaters meet the Arabian Sea, famous for swimming.", 0.0, 150, "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Kashi Art Cafe Fort Kochi", "Cafe / Bakery", "Celebrated courtyard gallery cafe serving organic coffees, French toast, and fresh carrot cake.", 550.0, "Cold Brew & Warm Carrot Cake", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Seagull Restaurant Fort Kochi", "Seafood / Waterfront", "Waterfront deck restaurant watching cargo ships glide by, famous for Kerala fish curry and beer.", 900.0, "Kerala Fish Curry & Appam", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Kayees Rahmathulla Cafe Mattancherry", "Malabar Biryani", "Legendary 1948 establishment renowned across Kerala for slow-cooked Dum Mutton Biryani.", 450.0, "Kayees Special Mutton Biryani", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Grand Pavilion MG Road", "Kerala Traditional", "Historic hotel dining room famous for Karimeen Pollichathu (pearl spot in banana leaf) and stew.", 850.0, "Karimeen Pollichathu & Appams", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Paragon Restaurant Lulu", "Malabar Cuisine", "Pioneering culinary brand serving flaky Malabar parottas, chicken stew, and fish mango curry.", 650.0, "Malabar Parotta & Fish Mango Curry", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Loafer's Corner Cafe Princess Street", "Cafe", "First-floor balcony cafe overlooking street life serving ginger lemonade and sandwiches.", 400.0, "Ginger Lemonade & Chicken Sandwich", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"),
            ("Dhe Puttu Edappally", "Kerala Specialty", "Creative restaurant dedicated to traditional steamed rice cylinders (puttu) with curries.", 500.0, "Erachi Puttu with Beef Roast", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Brunton Boatyard - CGH Earth", "Luxury", 18500.0, "Harbor View Heritage Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Kochi Fort Kochi", "Hostel", 800.0, "Heritage Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Old Harbour Hotel Fort Kochi", "Luxury", 14000.0, "Garden Heritage Suite", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Forte Kochi Heritage Hotel", "Premium", 7800.0, "Colonial Luxury Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Koder House Boutique Hotel", "Standard", 3800.0, "Jewish Heritage Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("The Hosteller Fort Kochi", "Budget", 650.0, "Dorm Bunk Bed", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Rossitta Wood Castle", "Standard", 2600.0, "Wooden Heritage Double Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "srinagar": {
        "attractions": [
            ("Dal Lake Shikara Cruise & Floating Markets", "Sightseeing", "Scenic traditional cedar canoe boat ride through water-lily channels and floating vegetable gardens.", 500.0, 120, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Mughal Gardens (Shalimar & Nishat Bagh)", "Heritage", "Terraced royal pleasure gardens laid out in 1619 by Emperor Jahangir with fountains and chinar trees.", 50.0, 120, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Pari Mahal (Palace of Fairies)", "Heritage", "Six-terraced Mughal palace perched high on Zabarwan mountain overlooking Dal Lake.", 50.0, 75, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Shankaracharya Hilltop Temple", "Spiritual", "Ancient 9th-century Shiva temple perched at 1,000 feet above the valley floor.", 0.0, 90, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Hazratbal Shrine & Dal Lake Shore", "Spiritual", "White marble shrine on the northern banks of Dal Lake containing a holy relic of Prophet Muhammad.", 0.0, 60, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Nigeen Lake Quiet Houseboat Walk", "Nature", "Quieter, jewel-toned neighbor to Dal Lake bordered by willow trees and heritage houseboats.", 0.0, 90, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Jamia Masjid Nowhatta Old City", "Heritage", "1402 Indo-Saracenic wooden mosque supported by 378 monumental Himalayan cedar pillars.", 0.0, 60, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Badamwari Almond Orchard Trail", "Nature", "Historic orchard at the foothills of Koh-e-Maran bursting into pink-and-white almond blossoms in spring.", 20.0, 60, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Lal Chowk & Polo View Handicrafts", "Shopping", "Central market precinct known for hand-knotted silk carpets, walnut wood carvings, and Pashmina shawls.", 0.0, 90, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Indira Gandhi Memorial Tulip Garden", "Nature", "Largest tulip garden in Asia (30 hectares) displaying 1.5 million blooming tulips in April.", 75.0, 90, "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Ahdoos Restaurant Residency Road", "Kashmiri Wazwan", "Historic 1918 culinary institution famed across India for authentic Rogan Josh, Rista, and Gushtaba.", 1100.0, "Traditional Rogan Josh & Rista", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Mughal Darbar Residency Road", "Wazwan Feasts", "Beloved local banquet dining hall serving authentic Trami wazwan platters on engraved copper plates.", 950.0, "Wazwan Trami Platter for Two", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Chai Jaai Tea Room Dhanji Buoy", "Tea Room / Heritage", "Charming riverside tea salon inspired by British-Kashmiri aesthetics serving noon chai and girda bread.", 450.0, "Pink Noon Chai with Lavasa Bread", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Shamyana Restaurant Boulevard", "North Indian / Kashmiri", "Waterfront dining room facing Dal Lake Ghat 2 serving sizzling kebabs and saffron biryani.", 800.0, "Tujji Kebabs & Saffron Rice", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Krishna Dhaba Dalgate", "Vegetarian Traditional", "Legendary pure-vegetarian dhaba beloved by tourists for thick rajma chawal and dal makhani.", 350.0, "Kashmiri Rajma Chawal & Kheer", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("14th Avenue Cafe & Grill", "Continental / Bakery", "Modern riverside bakery near Zero Bridge serving fresh croissants, cheesecakes, and coffee.", 550.0, "Walnut Brownie & Cappuccino", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"),
            ("Khayam Chowk Barbecue Street", "Street Barbecue", "Evening street alley where barbecue artisans grill spicy lamb tujji skewers over glowing charcoal embers.", 300.0, "Charcoal Lamb Tujji with Chutneys", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("The Lalit Grand Palace Srinagar", "Luxury", 24000.0, "Royal Chinar Luxury Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Heritage Houseboat Nigeen Lake", "Premium", 5500.0, "Carved Cedar Wood Houseboat", "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Srinagar Nishat", "Hostel", 850.0, "Apple Orchard Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Vivanta Dal View Srinagar", "Luxury", 18000.0, "Lake View Luxury Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Hotel Broadway Srinagar", "Standard", 3800.0, "Executive Double Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("The Hosteller Srinagar", "Budget", 700.0, "Dormitory Bunk Bed", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Nedou's Hotel Srinagar", "Premium", 6200.0, "Historic Colonial Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    }
}

# Update JSON
att_map = {}
for a in attractions:
    slug = a.get("destination_slug") or a.get("destination_id")
    att_map.setdefault(slug, []).append(a)

fd_map = {}
for f_item in food:
    slug = f_item.get("destination_slug") or f_item.get("destination_id")
    fd_map.setdefault(slug, []).append(f_item)

ht_map = {}
for h_item in hotels:
    slug = h_item.get("destination_slug") or h_item.get("destination_id")
    ht_map.setdefault(slug, []).append(h_item)

count = 0
for slug, dest_info in REMAINING_9.items():
    if slug in att_map:
        for idx, new_att in enumerate(dest_info["attractions"][:len(att_map[slug])]):
            att_map[slug][idx]["name"] = new_att[0]
            att_map[slug][idx]["category"] = new_att[1]
            att_map[slug][idx]["description"] = new_att[2]
            att_map[slug][idx]["demo_entry_fee"] = new_att[3]
            att_map[slug][idx]["visit_duration_minutes"] = new_att[4]
            att_map[slug][idx]["image"] = new_att[5]

    if slug in fd_map:
        for idx, new_food in enumerate(dest_info["food"][:len(fd_map[slug])]):
            fd_map[slug][idx]["name"] = new_food[0]
            fd_map[slug][idx]["cuisine"] = new_food[1]
            fd_map[slug][idx]["speciality"] = new_food[2]
            fd_map[slug][idx]["demo_cost_for_two"] = new_food[3]
            fd_map[slug][idx]["meal_suggestion"] = new_food[4]
            fd_map[slug][idx]["image"] = new_food[5]

    if slug in ht_map:
        for idx, new_hotel in enumerate(dest_info["hotels"][:len(ht_map[slug])]):
            ht_map[slug][idx]["name"] = new_hotel[0]
            ht_map[slug][idx]["tier"] = new_hotel[1]
            ht_map[slug][idx]["demo_price_per_night"] = new_hotel[2]
            ht_map[slug][idx]["room_type"] = new_hotel[3]
            ht_map[slug][idx]["image"] = new_hotel[4]

    count += 1

with open(os.path.join(DATA_DIR, "attractions.json"), "w", encoding="utf-8") as f:
    json.dump(attractions, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "food.json"), "w", encoding="utf-8") as f:
    json.dump(food, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "hotels.json"), "w", encoding="utf-8") as f:
    json.dump(hotels, f, indent=2, ensure_ascii=False)

print(f"Successfully enriched remaining {count} flagship destinations in attractions, food, and hotels!")
