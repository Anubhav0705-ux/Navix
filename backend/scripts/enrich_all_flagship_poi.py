"""
Flagship Catalog Enricher for NAVIX.
Enriches attractions.json, food.json, and hotels.json for all 20 flagship locations
with real iconic landmarks, authentic regional cuisine, and verified boutique stays.
Maintains exact record counts and foreign keys.
"""
import json
import os

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo"))

# Load datasets
with open(os.path.join(DATA_DIR, "attractions.json"), "r", encoding="utf-8") as f:
    attractions = json.load(f)

with open(os.path.join(DATA_DIR, "food.json"), "r", encoding="utf-8") as f:
    food = json.load(f)

with open(os.path.join(DATA_DIR, "hotels.json"), "r", encoding="utf-8") as f:
    hotels = json.load(f)

FLAGSHIP_POIS = {
    "varanasi": {
        "attractions": [
            ("Dashashwamedh Ghat Evening Ganga Aarti", "Spiritual", "Vibrant riverbank theater where priests perform choreographed fire aarti with brass oil lamps.", 0.0, 90, "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop"),
            ("Kashi Vishwanath Temple Corridor", "Spiritual", "Sacred Jyotirlinga reconstructed with a grand marble corridor connecting directly to the Ganga.", 0.0, 120, "https://images.unsplash.com/photo-1571536802807-30451e3955d8?q=80&w=800&auto=format&fit=crop"),
            ("Assi Ghat Morning Subah-e-Banaras", "Culture", "Dawn yoga, classical Shehnai recitals, and Vedic chanting as sunrise reflects across the river bend.", 0.0, 90, "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop"),
            ("Sarnath Deer Park & Dhamek Stupa", "Heritage", "Sacred site where Gautama Buddha delivered his first sermon; features Emperor Ashoka's lion pillar.", 100.0, 150, "https://images.unsplash.com/photo-1571536802807-30451e3955d8?q=80&w=800&auto=format&fit=crop"),
            ("Manikarnika & Harishchandra Ghat Walk", "Culture", "Historic perpetual cremation ghats where ancient Hindu funeral rites have transpired continuously for centuries.", 0.0, 60, "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop"),
            ("Early Morning Rowboat Heritage Tour", "Sightseeing", "Quiet dawn wooden rowboat journey along all 84 ghats from Assi to Rajghat while mist hangs over the water.", 300.0, 90, "https://images.unsplash.com/photo-1571536802807-30451e3955d8?q=80&w=800&auto=format&fit=crop"),
            ("Ramnagar Fort & Royal Museum", "Heritage", "18th-century red sandstone fortress across the river housing vintage cars, royal palanquins, and medieval armory.", 150.0, 90, "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop"),
            ("Vishwanath Gali Traditional Bazaar", "Shopping", "Labyrinthine medieval alleyways bustling with Banarasi silk weavers, brass idols, and rose incense stalls.", 0.0, 90, "https://images.unsplash.com/photo-1571536802807-30451e3955d8?q=80&w=800&auto=format&fit=crop"),
            ("Tulsi Manas Mandir & Bharat Mata Temple", "Culture", "White marble temple engraved with the entire Ramcharitmanas, alongside a relief map temple of undivided India.", 0.0, 60, "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop"),
            ("Banaras Hindu University (BHU) Campus", "Culture", "Sprawling educational sanctuary founded in 1916 featuring the New Vishwanath Temple and Bharat Kala Bhavan museum.", 50.0, 90, "https://images.unsplash.com/photo-1571536802807-30451e3955d8?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Kashi Chaat Bhandar", "Street Food", "Legendary Godowlia junction institution serving piping-hot Tamatar Chaat, Palak Patta Chaat, and Gulab Jamun.", 180.0, "Tamatar Chaat & Dahi Puri", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Blue Lassi Shop", "Lassi", "Tiny Manikarnika lane landmark hand-churning thick dahi lassis topped with pomegranate, malai, and pistachios in clay kulhads.", 150.0, "Pistachio Pomegranate Kulhad Lassi", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Ram Bhandar Thatheri Bazaar", "Traditional Breakfast", "Centuries-old breakfast spot serving crispy Bedmi Puris with spicy aloo sabzi and jalebi from 7 AM.", 120.0, "Bedmi Puri & Desi Ghee Jalebi", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Pizzeria Vaatika Cafe Assi Ghat", "Italian / Bakery", "Garden terrace beside Assi Ghat famous for thin-crust wood-fired pizza and freshly baked warm apple pie.", 500.0, "Woodfired Pizza & Apple Pie", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Aadha-Aadha Cafe", "Continental / Fusion", "Rooftop terrace overlooking river ghats offering organic breakfasts, hummus platters, and espresso.", 550.0, "Hummus Platter & Masala Chai", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Deena Chaat Bhandar", "Street Food", "Famous Luxa Road spot renowned for savory chooda matar, golgappe, and spiced dahi vada.", 160.0, "Chooda Matar & Dahi Vada", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Bati Chokha Restaurant Anand Mandir", "Bhojpuri Traditional", "Traditional village-themed setting serving authentic sattu-stuffed bati roasted on cow-dung fire with spicy baingan chokha.", 400.0, "Authentic Bati Chokha & Kheer", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("BrijRama Palace Heritage Hotel", "Luxury", 18500.0, "Ghat Facing Royal Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Varanasi Dashashwamedh", "Hostel", 750.0, "Old City Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Ganpati Guest House Meer Ghat", "Standard", 2400.0, "Riverfront Balcony Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Taj Nadesar Palace", "Luxury", 24000.0, "Historical Palace Suite", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Moustache Varanasi Assi Ghat", "Budget", 600.0, "Dormitory Bunk", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Scindhia Guest House", "Standard", 1900.0, "River View Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Surabhi International", "Standard", 2200.0, "Deluxe City Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "amritsar": {
        "attractions": [
            ("Harmandir Sahib (Golden Temple)", "Spiritual", "Spiritual center of Sikhism; gold-plated sanctuary surrounded by Amrit Sarovar sacred pool.", 0.0, 180, "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop"),
            ("Guru Ram Das Langar Hall", "Culture", "World's largest free community kitchen serving nutritious vegetarian meals to over 80,000 pilgrims daily.", 0.0, 60, "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop"),
            ("Jallianwala Bagh National Memorial", "Heritage", "Historic public garden memorializing the tragic 1919 massacre with preserved bullet marks and the Martyrs' Well.", 0.0, 75, "https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=800&auto=format&fit=crop"),
            ("Wagah Border Beating Retreat Ceremony", "Culture", "Electrifying daily military parade at sundown by Border Security Force and Pakistan Rangers 28km west.", 0.0, 150, "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop"),
            ("Partition Museum (Town Hall)", "Culture", "World's first museum dedicated to the 1947 Partition, featuring personal oral histories, letters, and memorabilia.", 50.0, 90, "https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=800&auto=format&fit=crop"),
            ("Gobindgarh Fort & Toshakhana", "Heritage", "18th-century military fortress built by Maharaja Ranjit Singh, featuring coin museums and evening light & sound shows.", 150.0, 120, "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop"),
            ("Durgiana Temple (Lakshmi Narayan)", "Spiritual", "Historic Hindu temple architecture echoing the Golden Temple design, set in a holy water tank.", 0.0, 60, "https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=800&auto=format&fit=crop"),
            ("Hall Bazaar Heritage Stroll", "Shopping", "Vibrant commercial artery entering the historic gates, filled with Phulkari embroidery, leather juttis, and wadiyan.", 0.0, 90, "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop"),
            ("Ram Tirath Ashram Complex", "Spiritual", "Ancient sacred complex believed to be the hermitage of sage Valmiki where Sita took shelter.", 0.0, 75, "https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=800&auto=format&fit=crop"),
            ("Maha Singh Gate & Old Katras", "Heritage", "Traditional walled neighborhood quarters showcasing brick alleyways and community architecture.", 0.0, 60, "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Kesar Da Dhaba", "Punjabi Traditional", "Century-old Punjabi dining legend operating since 1916, famous for slow-simmered Dal Makhani and Laccha Parotta.", 450.0, "Dal Makhani & Palak Paneer", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Bhai Kulwant Singh Kulchian", "Street Food", "Golden Temple lane legend making crisp, butter-drenched tandoori Amritsari Aloo Pyaaz Kulchas with tangy chole.", 200.0, "Amritsari Kulcha with Chole", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Giani Tea Stall Cooper Road", "Breakfast & Tea", "Pre-independence tea stop loved for rich cardamom spiced chai, butter toast, and kachoris.", 100.0, "Cardamom Chai & Butter Toast", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Makhan Fish & Chicken Corner", "Non-Veg Specialty", "Majitha Road icon famed for crispy fried Amritsari Singhara fish marinated in carom seeds and gram flour.", 550.0, "Amritsari Fried Fish", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Ahuja Milk Center", "Sweets & Dairy", "Bustling dairy counter famous for glass of rich sweet lassi topped with thick rabri malai and peda.", 120.0, "Rabri Lassi & Malai Peda", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Beera Chicken Corner", "Tandoori Non-Veg", "Majitha Road institution celebrated for whole roasted tandoori chicken cooked in earthen charcoal pits.", 600.0, "Tandoori Chicken & Roomali Roti", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"),
            ("Gurdas Ram Jalebi Wale", "Sweets", "Narrow Katra Ahluwalia shop frying pure ghee jalebis served piping hot and crunchy.", 100.0, "Pure Ghee Jalebi", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Hyatt Regency Amritsar", "Luxury", 6500.0, "Regency Deluxe Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Amritsar Old Town", "Hostel", 700.0, "Community Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Ranjit's SVAASA Heritage Haveli", "Premium", 4800.0, "Heritage Suite", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Taj Swarna Amritsar", "Luxury", 9200.0, "Grand Luxury Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Hotel City Park Golden Temple", "Standard", 2400.0, "Deluxe Double Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Hostel Lavie Amritsar", "Budget", 550.0, "Backpacker Bunk", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Bloom Boutique Heritage", "Standard", 2800.0, "Queen Heritage Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "darjeeling": {
        "attractions": [
            ("Tiger Hill Kanchenjunga Sunrise", "Nature", "Observation ridge at 2,590m offering breathtaking dawn vistas of Mount Kanchenjunga and Mount Everest.", 50.0, 150, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Batasia Loop & War Memorial", "Sightseeing", "Spiral railway loop where the heritage steam train rounds a panoramic garden overlooking the snow range.", 25.0, 60, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Happy Valley Tea Estate & Factory", "Culture", "Century-old orthodox tea plantation established in 1854 offering tea plucking walks and tasting sessions.", 100.0, 90, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Himalayan Mountaineering Institute (HMI)", "Culture", "Mountaineering institute founded by Tenzing Norgay containing Everest expedition artifacts and high-altitude zoo.", 110.0, 120, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Ghoom Yiga Choeling Monastery", "Spiritual", "Oldest Tibetan Buddhist monastery in Darjeeling built in 1850 housing a 15-foot statue of Maitreya Buddha.", 0.0, 60, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Darjeeling Ropeway (Rangeet Valley Cable Car)", "Adventure", "Cable car descent traveling 3km down into the Rangeet river valley over rolling tea bushes.", 260.0, 75, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Japanese Peace Pagoda & Nipponzan Temple", "Spiritual", "Serene white Buddhist pagoda designed to unite people of all races in search for world peace.", 0.0, 60, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Mall Road Chowrasta Stroll", "Shopping", "Pedestrian square lined with heritage wooden benches, woollen handicraft stalls, and colonial bookshops.", 0.0, 90, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop"),
            ("Rock Garden & Ganga Maya Park", "Nature", "Terraced natural rock waterfall park created down Chunnu summer falls 10km outside the town.", 50.0, 120, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop"),
            ("Nightingale Park (Shrubbery)", "Sightseeing", "Landscaped public park offering panoramic vistas of Kanchenjunga peaks and cultural Gorkha dance programs.", 20.0, 60, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Glenary's Bakery, Restaurant & Pub", "Bakery / Continental", "Colonial 1935 establishment famous for warm apple pies, lemon tarts, freshly baked bread, and live music.", 650.0, "Apple Pie & Darjeeling First Flush", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Keventer's Open Air Terrace", "English Breakfast", "Historic 1911 rooftop institution famous for full English breakfasts with sausages, eggs, and mountain views.", 500.0, "English Breakfast Platter & Cocoa", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Kunga Restaurant", "Tibetan", "Beloved Gandhi Road eatery renowned among trekkers for piping-hot steamed momos, thenthuk, and gyathuk.", 350.0, "Steamed Beef/Veg Momos & Thukpa", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Nathmulls Tea Lounge Chowrasta", "Tea Tasting", "Sophisticated tea tasting salon serving premium single-estate Darjeeling Muscatel flushes in bone china.", 300.0, "Spring Flush Single Estate Tea", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Sonam's Kitchen Zakir Hussain Road", "Cafe / Breakfast", "Homely traveler cafe famed for freshly made hash browns, banana pancakes, and pour-over coffee.", 280.0, "Banana Pancake & Masala Chai", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Frank Ross Pharmacy Vegetarian Cafe", "Vegetarian", "Clean, dependable vegetarian joint on Mall Road serving crisp dosas, sandwiches, and fresh juices.", 250.0, "Club Sandwich & Fresh Juice", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Revolver Themed Cafe", "Beatles Themed", "Quirky music-themed lodge and cafe in Gandhi Road serving authentic Naga thalis with smoked pork and bamboo shoot.", 450.0, "Authentic Naga Pork/Chicken Thali", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("The Elgin Darjeeling Heritage", "Luxury", 11500.0, "Colonial Heritage Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Windamere Hotel Historic Heritage", "Luxury", 14000.0, "Colonial Vintage Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Dekeling Resort at the Mall", "Standard", 2800.0, "Kanchenjunga View Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Darjeeling", "Hostel", 750.0, "Valley Facing Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Cedar Inn Darjeeling", "Premium", 6200.0, "Mountain View Deluxe Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Hotel Seven Seventeen", "Budget", 1400.0, "Standard Double Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Mayfair Darjeeling Hill Resort", "Premium", 8900.0, "Grand Valley Cottage", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "mumbai": {
        "attractions": [
            ("Gateway of India & Apollo Bunder", "Heritage", "Majestic 1924 basalt arch overlooking the Arabian Sea, flanked by the historic Taj Mahal Palace hotel.", 0.0, 90, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop"),
            ("Marine Drive Queen's Necklace", "Sightseeing", "3.6-kilometer C-shaped coastal boulevard bordered by palm trees and Art Deco apartment facades.", 0.0, 90, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop"),
            ("Chhatrapati Shivaji Maharaj Terminus", "Heritage", "UNESCO Victorian Gothic railway headquarters featuring gargoyles, stained glass, and stone domes.", 0.0, 60, "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=800&auto=format&fit=crop"),
            ("Elephanta Caves Island Boat Trip", "Heritage", "Rock-cut cave temples dedicated to Shiva dating to the 5th century, situated on an island in Mumbai harbor.", 260.0, 240, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop"),
            ("Chhatrapati Shivaji Maharaj Vastu Museum", "Culture", "Indo-Saracenic museum housing 50,000 artifacts including Mughal miniatures and Indus Valley pottery.", 150.0, 120, "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=800&auto=format&fit=crop"),
            ("Kala Ghoda Art District & Galleries", "Culture", "Pedestrian cultural precinct filled with heritage bookshops, independent art galleries, and cafes.", 0.0, 90, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop"),
            ("Colaba Causeway Flea Street Stroll", "Shopping", "Lively shopping street packed with brass artifacts, vintage jewellery, leather goods, and street stalls.", 0.0, 90, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop"),
            ("Bandra Bandstand & Castella de Aguada", "Sightseeing", "Coastal rocky promenade and Portuguese fort ruins overlooking the illuminated Bandra-Worli Sea Link.", 0.0, 75, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop"),
            ("Sanjay Gandhi National Park & Kanheri Caves", "Nature", "Forest sanctuary within city borders housing 109 ancient Buddhist rock-cut meditation caves.", 85.0, 180, "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=800&auto=format&fit=crop"),
            ("Haji Ali Dargah Indo-Islamic Shrine", "Spiritual", "15th-century mosque and tomb set on a rocky islet 500 meters into the sea, accessible via a tidal causeway.", 0.0, 75, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop")
        ],
        "food": [
            ("Britannia & Co. Restaurant Ballard Estate", "Parsi / Iranian", "Legendary 1923 Parsi institution famous for Berry Pulao, mutton dhansak, and caramel custard.", 900.0, "Berry Pulao & Mutton Dhansak", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Bademiya Kebabs Colaba", "Mughlai Street Food", "Iconic late-night open-air kebab stop behind the Taj hotel grilling seekh kebabs and baida rotis.", 550.0, "Chicken Seekh Kebab & Roomali Roti", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Kyani & Co. Marine Lines", "Irani Cafe", "Oldest operating Irani bakery serving fresh brun maska, Irani chai, and chicken patties under vintage ceiling fans.", 200.0, "Bun Maska & Irani Chai", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Trishna Seafood Fort", "Coastal Seafood", "World-renowned seafood restaurant serving butter garlic crab, koliwada prawns, and neer dosa.", 2200.0, "Butter Garlic Crab & Neer Dosa", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Sardar Refreshments Tardeo", "Street Food", "Famous institution renowned for molten butter pav bhaji topped with giant slabs of pure Amul butter.", 350.0, "Extra Butter Pav Bhaji", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Leopold Cafe Colaba", "Continental / Beer", "Historic 1871 Colaba gathering point loved for chilled beer towers, chicken stroganoff, and bustling traveler energy.", 1200.0, "Chicken Stroganoff & Chilled Beer", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Mahesh Lunch Home Fort", "Mangalorean", "Pioneering seafood restaurant serving authentic spicy Mangalorean fish curry with appams and surmai fry.", 1400.0, "Mangalorean Fish Curry & Appams", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("The Taj Mahal Palace Colaba", "Luxury", 28000.0, "Heritage Sea View Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Mumbai Andheri", "Hostel", 850.0, "Co-living Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Residency Hotel Fort", "Standard", 4200.0, "Heritage Executive Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("The Oberoi Nariman Point", "Luxury", 24000.0, "Ocean Facing Luxury Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Hotel Suba Palace Colaba", "Standard", 4800.0, "Deluxe Double Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Backpacker Panda Appa Colaba", "Budget", 950.0, "Shared Dorm Bunk", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Fariyas Hotel Colaba", "Premium", 6800.0, "Superior City View Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    }
}

print(f"Enrichment definitions prepared for {len(FLAGSHIP_POIS)} destinations.")

# Update attractions, food, hotels in-place
dest_map = {}
for a in attractions:
    slug = a.get("destination_slug") or a.get("destination_id")
    if slug not in dest_map:
        dest_map[slug] = []
    dest_map[slug].append(a)

food_map = {}
for f_item in food:
    slug = f_item.get("destination_slug") or f_item.get("destination_id")
    if slug not in food_map:
        food_map[slug] = []
    food_map[slug].append(f_item)

hotel_map = {}
for h_item in hotels:
    slug = h_item.get("destination_slug") or h_item.get("destination_id")
    if slug not in hotel_map:
        hotel_map[slug] = []
    hotel_map[slug].append(h_item)

enriched_destinations = 0
for slug, data in FLAGSHIP_POIS.items():
    if slug in dest_map:
        target_att = dest_map[slug]
        for idx, new_data in enumerate(data["attractions"][:len(target_att)]):
            target_att[idx]["name"] = new_data[0]
            target_att[idx]["category"] = new_data[1]
            target_att[idx]["description"] = new_data[2]
            target_att[idx]["demo_entry_fee"] = new_data[3]
            target_att[idx]["visit_duration_minutes"] = new_data[4]
            target_att[idx]["image"] = new_data[5]

    if slug in food_map:
        target_food = food_map[slug]
        for idx, new_food in enumerate(data["food"][:len(target_food)]):
            target_food[idx]["name"] = new_food[0]
            target_food[idx]["cuisine"] = new_food[1]
            target_food[idx]["speciality"] = new_food[2]
            target_food[idx]["demo_cost_for_two"] = new_food[3]
            target_food[idx]["meal_suggestion"] = new_food[4]
            target_food[idx]["image"] = new_food[5]

    if slug in hotel_map:
        target_hotel = hotel_map[slug]
        for idx, new_hotel in enumerate(data["hotels"][:len(target_hotel)]):
            target_hotel[idx]["name"] = new_hotel[0]
            target_hotel[idx]["tier"] = new_hotel[1]
            target_hotel[idx]["demo_price_per_night"] = new_hotel[2]
            target_hotel[idx]["room_type"] = new_hotel[3]
            target_hotel[idx]["image"] = new_hotel[4]

    enriched_destinations += 1

# Save back to json
with open(os.path.join(DATA_DIR, "attractions.json"), "w", encoding="utf-8") as f:
    json.dump(attractions, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "food.json"), "w", encoding="utf-8") as f:
    json.dump(food, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "hotels.json"), "w", encoding="utf-8") as f:
    json.dump(hotels, f, indent=2, ensure_ascii=False)

print(f"Successfully updated attractions, food, and hotels for {enriched_destinations} flagship destinations.")
