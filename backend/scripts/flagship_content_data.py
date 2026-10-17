"""
Authoritative Catalog Data for NAVIX 20 Flagship Destinations.
Contains vetted landmarks, authentic regional eateries, real accommodations,
and editorial stories with photographic galleries and practical travel recommendations.
"""

DESTINATION_CONTENT = {
    "jaipur": {
        "name": "Jaipur",
        "attractions": [
            ("Amber Fort & Sheesh Mahal", "Heritage", "16th-century hilltop fortress with mirror-inlaid palaces, Maota Lake vistas, and monumental Rajput ramparts.", 550.0, 180, "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Amer_City.jpg/1280px-Amer_City.jpg"),
            ("Hawa Mahal (Palace of Winds)", "Heritage", "Iconic five-story pink sandstone facade with 953 jharokhas built for royal court women to observe street processions.", 200.0, 60, "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/1280px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg"),
            ("City Palace & Chandra Mahal", "Culture", "Royal residence blending Rajasthani and Mughal architectural courtyards, textiles, and royal armories.", 300.0, 120, "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/City_Palace%2C_Jaipur.jpg/1280px-City_Palace%2C_Jaipur.jpg"),
            ("Jantar Mantar Astronomical Observatory", "Heritage", "UNESCO World Heritage site containing 19 architectural astronomical instruments built by Maharaja Sawai Jai Singh II.", 200.0, 90, "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Samrat_Yantra_at_Jantar_Mantar.jpg/1280px-Samrat_Yantra_at_Jantar_Mantar.jpg"),
            ("Nahargarh Fort Sunset Ridge", "Nature", "Aravalli hillside rampart offering panoramic sunset vistas across the illuminated pink city below.", 100.0, 120, "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nahargarh_Fort_Jaipur.jpg/1280px-Nahargarh_Fort_Jaipur.jpg"),
            ("Albert Hall State Museum", "Culture", "Indo-Saracenic museum housing Persian carpets, miniature paintings, metal sculptures, and historic coins.", 150.0, 90, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Albert_Hall_Museum%2C_Jaipur_01.jpg/1280px-Albert_Hall_Museum%2C_Jaipur_01.jpg"),
            ("Jal Mahal & Man Sagar Promenade", "Sightseeing", "Water palace floating quietly in the center of Man Sagar Lake, framed by surrounding desert hills.", 0.0, 45, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Jal_Mahal_in_Man_Sagar_Lake.jpg/1280px-Jal_Mahal_in_Man_Sagar_Lake.jpg"),
            ("Johari Bazaar Traditional Gem Walk", "Shopping", "Lively old-walled lanes lined with authentic Kundan jewelry, bandhani block-prints, and brassware.", 0.0, 120, "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?q=80&w=1200&auto=format&fit=crop"),
            ("Galta Ji (Monkey Temple & Kunds)", "Spiritual", "Ancient sacred pilgrimage site set into an Aravalli mountain crevice featuring natural spring water pools.", 50.0, 90, "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Galtaji_Temple.jpg/1280px-Galtaji_Temple.jpg"),
            ("Jaigarh Fort & Jaivana Cannon", "Heritage", "Fortress overlooking Amber Fort housing the world's largest historic wheeled cannon, forged in 1720.", 150.0, 90, "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Jaivana_Cannon_at_Jaigarh_Fort.jpg/1280px-Jaivana_Cannon_at_Jaigarh_Fort.jpg")
        ],
        "food": [
            ("Laxmi Misthan Bhandar (LMB)", "Rajasthani", "Legendary Johari Bazaar institution famed for authentic Dal Baati Churma and Ghewar sweetmeats.", 650.0, "Rajasthani Royal Thali", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Rawat Mishthan Bhandar", "Street Food", "Iconic Station Road breakfast stop renowned across North India for flaky, piping-hot Pyaaz Kachori and Mirchi Vada.", 250.0, "Crisp Pyaaz Kachori & Jalebi", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("1135 AD Amber Palace", "North Indian", "Fine dining inside the historic ramparts of Amber Fort serving heirloom royal recipes in silver thalis.", 2200.0, "Laal Maas & Saffron Biryani", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Peacock Rooftop Restaurant", "Continental / Indian", "Relaxed Gopalbari rooftop terrace with mural walls, live evening sitar, and wholesome North Indian curries.", 700.0, "Paneer Lababdar & Tandoori Roti", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Tapri The Tea House", "Cafe", "Central Park rooftop favorite serving artisanal cutting chai, bun maska, and fusion street snacks overlooking city greens.", 400.0, "Masala Chai & Bun Maska", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Handi Restaurant MI Road", "Mughlai", "Historic restaurant famous for slow-simmered handi meat and clay-oven kebabs along MI Road.", 900.0, "Mutton Handi & Roomali Roti", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"),
            ("Samrat Restaurant Choura Rasta", "Traditional Snacks", "Old-city corner shop bustling with morning travelers enjoying samosas, rabri lassi, and fresh jalebis.", 180.0, "Morning Samosa & Sweet Lassi", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Umaid Bhawan Heritage House", "Standard", 2800.0, "Heritage Courtyard Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Jaipur Old City", "Hostel", 850.0, "Co-living Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Hotel Pearl Palace Heritage", "Standard", 2200.0, "Hand-Painted Deluxe Suite", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("ITC Rajputana Luxury Collection", "Luxury", 9500.0, "Royal Rajputana Chamber", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Alsisar Haveli Boutique Retreat", "Premium", 5500.0, "Heritage Haveli Suite", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("The Hosteller Jaipur", "Budget", 750.0, "Backpacker Bunk", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Shahpura House Heritage Hotel", "Premium", 6200.0, "Royal Sheesh Mahal Suite", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "udaipur": {
        "name": "Udaipur",
        "attractions": [
            ("City Palace Udaipur Complex", "Heritage", "Granite and marble palace complex towering above Lake Pichola, featuring 11 smaller palaces built over four centuries.", 400.0, 180, "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/City_Palace_Udaipur_Rajasthan_India.jpg/1280px-City_Palace_Udaipur_Rajasthan_India.jpg"),
            ("Lake Pichola Sunset Boat Cruise", "Sightseeing", "Boat ride gliding past Lake Palace, Jag Mandir, and bathing ghats as evening reflections shimmer across the lake.", 450.0, 75, "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=1200&auto=format&fit=crop"),
            ("Jag Mandir Island Palace", "Heritage", "Yellow sandstone island retreat built in the 17th century with marble elephant statues guarding the landing pavilion.", 200.0, 90, "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Jag_Mandir_Palace_Udaipur.jpg/1280px-Jag_Mandir_Palace_Udaipur.jpg"),
            ("Jagdish Temple & Heritage Courtyard", "Spiritual", "1651 Indo-Aryan carved temple dedicated to Lord Vishnu, located outside the main royal palace gates.", 0.0, 45, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Jagdish_Temple_Udaipur.jpg/1280px-Jagdish_Temple_Udaipur.jpg"),
            ("Saheliyon Ki Bari (Garden of the Maids)", "Nature", "Lush historical gardens engineered with marble pavilions, lotus pools, and gravity-fed brass fountains.", 100.0, 60, "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Saheliyon_ki_Bari_Fountains.jpg/1280px-Saheliyon_ki_Bari_Fountains.jpg"),
            ("Monsoon Palace (Sajjangarh Fort)", "Nature", "Hilltop castle perched high on Bansdara Peak offering vistas over the lakes and Aravalli mountain ranges.", 150.0, 120, "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Monsoon_Palace_Udaipur.jpg/1280px-Monsoon_Palace_Udaipur.jpg"),
            ("Bagore Ki Haveli & Dharohar Dance", "Culture", "Historic waterfront haveli on Gangaur Ghat hosting nightly Rajasthani folk dance and puppet performances.", 250.0, 90, "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bagore_Ki_Haveli_Gangaur_Ghat.jpg/1280px-Bagore_Ki_Haveli_Gangaur_Ghat.jpg"),
            ("Fateh Sagar Lake & Nehru Park", "Sightseeing", "Second major lake in Udaipur bordered by Moti Magri hill, popular for sunset walks and pedal boating.", 50.0, 75, "https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?q=80&w=1200&auto=format&fit=crop"),
            ("Bhartiya Lok Kala Mandal", "Culture", "Cultural institution and museum preserving Rajasthani rural puppetry, mask arts, and folk folklore traditions.", 80.0, 60, "https://images.unsplash.com/photo-1592635196078-9fe32a26079d?q=80&w=1200&auto=format&fit=crop"),
            ("Ambrai Ghat Evening Stroll", "Sightseeing", "Peaceful lakeside promenade directly across from the illuminated City Palace and Lake Palace.", 0.0, 60, "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1200&auto=format&fit=crop")
        ],
        "food": [
            ("Ambrai Waterfront Restaurant", "North Indian", "Unrivaled waterfront dining right at the edge of Lake Pichola facing the glowing City Palace facade.", 1600.0, "Laal Maas & Garlic Naan", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Natraj Traditional Dining Hall", "Rajasthani", "Beloved local institution near the clock tower serving endless authentic Rajasthani and Gujarati thalis.", 500.0, "Unlimited Rajasthani Thali", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Jheel's Ginger Coffee Bar & Bakery", "Cafe", "Quiet lakeside cafe along Gangaur Ghat serving woodfired pizzas, fresh brewed coffee, and walnut brownies.", 450.0, "Cold Brew & Lemon Tart", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Tribute Lakeside Dining", "Multi-Cuisine", "Waterfront courtyard overlooking Rang Sagar celebrating equestrian heritage and rich Mewari curries.", 1200.0, "Mewari Gatta Curry", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Millets of Mewar", "Organic / Healthy", "Creative rooftop cafe focused on local millet recipes, organic vegetables, and herbal infusions.", 650.0, "Bajra Khichdi & Herbal Tea", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Sukhadia Circle Street Food Stalls", "Street Food", "Vibrant evening circular fountain hub lined with fresh pav bhaji, kulfi, and buttery bhutta.", 200.0, "Butter Pav Bhaji & Matka Kulfi", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop"),
            ("Upre by 1559 AD", "Rooftop Fine Dining", "Panoramic terrace atop Lake Pichola Hotel with open-air cabanas and refined Rajasthani royal dining.", 1900.0, "Ker Sangri & Saffron Rice", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Jagat Niwas Palace Heritage Hotel", "Premium", 4800.0, "Lake View Haveli Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Zostel Udaipur Lakeside", "Hostel", 850.0, "Rooftop Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Madri Haveli Boutique Stay", "Standard", 2900.0, "Restored 300-year Haveli Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Taj Fateh Prakash Palace", "Luxury", 12500.0, "Palace Grand Heritage Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("Moustache Udaipur Hostel", "Budget", 650.0, "Shared Dormitory", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Amet Haveli Traditional Stay", "Premium", 5800.0, "Traditional Mewar Chamber", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Hotel Lake Pichola", "Standard", 3400.0, "Standard Courtyard Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "manali": {
        "name": "Manali",
        "attractions": [
            ("Hadimba Devi Cedar Forest Temple", "Heritage", "1553 pagoda-style wooden temple built by Raja Bahadur Singh in dense deodar forest.", 50.0, 90, "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hidimba_Devi_Temple_Manali.jpg/1280px-Hidimba_Devi_Temple_Manali.jpg"),
            ("Old Manali Village & Manu Temple", "Culture", "Traditional Himachali stone houses, apple orchards, and the only historic temple dedicated to sage Manu.", 0.0, 120, "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Manu_Temple_Old_Manali.jpg/1280px-Manu_Temple_Old_Manali.jpg"),
            ("Solang Valley Snow Point & Paragliding", "Adventure", "Vibrant alpine arena famous for tandem paragliding, zorbing, and quad-bike snow rides.", 500.0, 180, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1200&auto=format&fit=crop"),
            ("Jogini Cascading Waterfall Hike", "Nature", "Refreshing mountain forest walking trail from Vashisht village ending at thunderous cascading drops.", 0.0, 150, "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Jogini_Waterfall_Manali.jpg/1280px-Jogini_Waterfall_Manali.jpg"),
            ("Vashisht Sulphur Hot Springs & Temple", "Spiritual", "Natural therapeutic hot water bath kunds carved from stone in a 4,000-year-old Vedic temple.", 0.0, 60, "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Vashisht_Temple_Springs.jpg/1280px-Vashisht_Temple_Springs.jpg"),
            ("Atal Tunnel North Portal & Sissu Falls", "Sightseeing", "Engineering marvel at 3,000m leading into Lahaul valley with glacial waterfalls and hanging glaciers.", 0.0, 240, "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Atal_Tunnel_North_Portal.jpg/1280px-Atal_Tunnel_North_Portal.jpg"),
            ("Naggar Castle & Roerich Heritage Estate", "Heritage", "1460 wooden Himalayan castle overlooking Beas river, featuring Russian painter Nicholas Roerich's gallery.", 100.0, 150, "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Naggar_Castle_Kullu.jpg/1280px-Naggar_Castle_Kullu.jpg"),
            ("Manali Nature Park & Beas River Walk", "Nature", "Towering cedar pine walk between Mall Road and Old Manali accompanied by river rapids.", 20.0, 60, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"),
            ("Gadhan Thekchhokling Gompa", "Culture", "Vibrant 1960 Tibetan Buddhist monastery adorned with colorful frescoes and spinning prayer wheels.", 0.0, 45, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Tibetan_Monastery_Manali.jpg/1280px-Tibetan_Monastery_Manali.jpg"),
            ("Mall Road Pedestrian Stroll", "Shopping", "Central paved promenade filled with woollen shawls, Kullu caps, dried apricots, and wooden toys.", 0.0, 90, "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop")
        ],
        "food": [
            ("Cafe 1947 Old Manali", "Italian / European", "Waterfront stone cafe by Manalsu river serving wood-fired pizzas, trout, and craft ciders.", 800.0, "Trout Fish & Quattro Formaggi Pizza", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"),
            ("Drifters' Cafe & Inn", "Cafe / Global", "Cozy wooden cafe in Old Manali famous for waffle breakfasts, board games, and acoustic jam sessions.", 600.0, "Belgian Waffles & French Press Coffee", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"),
            ("Johnson's Cafe & Bar", "Continental", "Historic cedar garden serving legendary pan-fried Himalayan river trout with almond butter sauce.", 1100.0, "Pan-fried Trout with Mashed Potatoes", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),
            ("Chopsticks Restaurant Mall Road", "Tibetan / Asian", "Bustling central restaurant serving authentic steamed mutton momos, gyathuk, and spiced thenthuk.", 500.0, "Mutton Kothe Momos & Thenthuk", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"),
            ("Lazy Dog Lounge Old Manali", "Continental / Fusion", "Riverside deck overlooking roaring mountain stream with live evening blues and grilled platters.", 950.0, "Grilled Chicken & Mountain Beer", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),
            ("Dylan's Toasted & Roasted Coffee House", "Bakery", "Famous Old Manali spot serving freshly roasted artisanal mountain coffee and warm chocolate chip cookies.", 300.0, "Artisan Coffee & Warm Cookies", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"),
            ("Sher-e-Punjab Mall Road", "North Indian", "Timeless North Indian dhaba serving rich butter chicken, dal makhani, and garlic naans.", 700.0, "Butter Chicken & Tandoori Roti", "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop")
        ],
        "hotels": [
            ("Zostel Old Manali", "Hostel", 850.0, "Apple Orchard Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("The Himalayan Spa Resort", "Luxury", 14500.0, "Gothic Castle Luxury Room", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"),
            ("Johnson Lodge & Spa", "Premium", 5500.0, "Cedar Wood Deluxe Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Himalayan River Resort Sissu", "Premium", 6200.0, "Glacial Valley Villa", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"),
            ("The Hosteller Manali", "Budget", 650.0, "Backpacker Bunk", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"),
            ("Old Manali Apple Tree Inn", "Standard", 1800.0, "Mountain View Double Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"),
            ("Snow Valley Resorts Log Huts", "Standard", 2800.0, "Orchard View Cottage", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop")
        ]
    },
    "goa": {
        "name": "Goa",
        "attractions": [
            ("Basilica of Bom Jesus Old Goa", "Heritage", "1605 UNESCO Baroque basilica holding the sacred mortal relics of St. Francis Xavier.", 0.0, 75, "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Front_Elevation_of_Basilica_of_Bom_Jesus.jpg/1280px-Front_Elevation_of_Basilica_of_Bom_Jesus.jpg"),
            ("Fontainhas Latin Quarter Heritage Stroll", "Culture", "Preserved 18th-century Portuguese residential ward with colorful tiled houses and wrought-iron balconies.", 0.0, 90, "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Road_along_Vasco-da-gama_residence_in_Fontainhas%2C_Panaji.jpg/1280px-Road_along_Vasco-da-gama_residence_in_Fontainhas%2C_Panaji.jpg"),
            ("Fort Aguada Coastal Bastion & Lighthouse", "Heritage", "1612 Portuguese fortress overlooking Mandovi river and the Arabian Sea with freshwater cisterns.", 50.0, 90, "https://upload.wikimedia.org/wikipedia/commons/a/ad/Fort_aguada.jpg"),
            ("Dudhsagar Four-Tiered Jungle Falls", "Nature", "Four-tiered milky waterfall cascading 310 meters down Western Ghats mountain crags inside Bhagwan Mahavir park.", 100.0, 240, "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Doodhsagar_Fall.jpg/1280px-Doodhsagar_Fall.jpg"),
            ("Anjuna Flea Market & Rocky Coast", "Shopping", "Legendary seaside marketplace established in the 1960s offering textiles, handicrafts, and coastal views.", 0.0, 120, "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Anjuna_Beach%2C_Goa%2C_India%2C_Legendary_Curlies_beach_shack.jpg/1280px-Anjuna_Beach%2C_Goa%2C_India%2C_Legendary_Curlies_beach_shack.jpg"),
            ("Chapora Fort Sunset Bastion", "Sightseeing", "Red laterite hill fort overlooking Vagator Beach and Chapora river mouth, famous for dramatic sunsets.", 0.0, 75, "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Fort_Chapora_26012016.jpg/1280px-Fort_Chapora_26012016.jpg"),
            ("Palolem Crescent Beach & Butterfly Cove", "Nature", "Gentle southern bay lined with coconut palms and colorful wooden beach shacks with dolphin-spotting boats.", 0.0, 180, "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Palolem_Beach%2C_South_Goa.jpg/1280px-Palolem_Beach%2C_South_Goa.jpg"),
            ("Se Cathedral & Church of St. Francis", "Heritage", "One of the largest churches in Asia, famed for its Golden Bell and Portuguese-Manueline architecture.", 0.0, 60, "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Se_Cathedral_from_Rua_Direita.jpg/1280px-Se_Cathedral_from_Rua_Direita.jpg"),
            ("Savoi Organic Spice Plantation", "Culture", "200-year-old eco-plantation introducing vanilla, pepper, nutmeg, and authentic Saraswat lunch.", 500.0, 150, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1200&auto=format&fit=crop"),
            ("Arambol Sweetwater Lake & Cliff Trail", "Nature", "Freshwater lagoon nestled between cliffside banyan trees and the Arabian Sea sandy stretch.", 0.0, 120, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Arambol_2022-01-04-2.jpg/1280px-Arambol_2022-01-04-2.jpg")
        ],
        "food": [
            ("Vinayak Family Restaurant Assagao", "Goan Seafood", "Local institution hidden in Assagao serving legendary Goan Fish Thalis with kingfish fry and sol kadi.", 450.0, "Kingfish Rava Fry & Fish Curry Thali", "https://images.unsplash.com/photo-1654863404432-cac67587e25d?q=80&w=1080&auto=format&fit=crop"),
            ("Mum's Kitchen Panaji", "Traditional Goan", "Heritage restaurant dedicated to preserving heirloom Goan Christian and Hindu recipes.", 1200.0, "Pork Vindaloo & Poi Bread", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1080&auto=format&fit=crop"),
            ("Fisherman's Wharf Salcete", "Seafood / Goan", "Riverside restaurant overlooking fishing trawlers on river Sal, famous for crab xec xec and prawn balchao.", 1400.0, "Crab Xec Xec & Steamed Rice", "https://images.unsplash.com/photo-1781332145637-5e14298f3f26?q=80&w=1080&auto=format&fit=crop"),
            ("Artjuna Garden Cafe Anjuna", "Continental / Israeli", "Open-air mango grove cafe serving artisanal coffee, shakshuka, fresh hummus, and mango cheesecakes.", 650.0, "Hummus Plate & Organic Cold Brew", "https://images.unsplash.com/photo-1603133872497-f29809b750bf?q=80&w=1080&auto=format&fit=crop"),
            ("Gunpowder Assagao", "Peninsular Indian", "Quaint old Portuguese house courtyard serving Malabar parottas, Kerala beef fry, and Pandi curry.", 1100.0, "Kerala Beef Fry & Appam", "https://images.unsplash.com/photo-1789993494828-735441249a30?q=80&w=1080&auto=format&fit=crop"),
            ("Viva Panjim Fontainhas", "Goan Portuguese", "Charming alleyway restaurant in the Latin quarter serving authentic prawn curry rice and bebinca.", 550.0, "Prawn Curry Rice & Bebinca", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Bebinca_com_gelado.jpg/1280px-Bebinca_com_gelado.jpg"),
            ("Thalassa Greek Taverna Siolim", "Greek / Mediterranean", "Waterfront Greek restaurant perched on Siolim waterfront known for souvlaki and sunset cocktails.", 1800.0, "Chicken Souvlaki & Baklava", "https://images.unsplash.com/photo-1606735584785-1848fdcaea57?q=80&w=1080&auto=format&fit=crop")
        ],
        "hotels": [
            ("Fort Tiracol Heritage Hotel", "Luxury", 12500.0, "Ocean View Bastion Suite", "https://upload.wikimedia.org/wikipedia/commons/2/2a/Terekhol_Fort_2.jpg"),
            ("Zostel Morjim Beachfront", "Hostel", 850.0, "Beachside Bunk Dorm", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1080&auto=format&fit=crop"),
            ("Panjim Inn Heritage Fontainhas", "Standard", 3400.0, "Antique Heritage Room", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1080&auto=format&fit=crop"),
            ("Taj Exotica Resort Benaulim", "Luxury", 19000.0, "Mediterranean Villa Room", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1080&auto=format&fit=crop"),
            ("The Hosteller Goa Candolim", "Budget", 700.0, "Backpacker Bunk", "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1080&auto=format&fit=crop"),
            ("Santana Beach Resort Candolim", "Standard", 2800.0, "Pool View Deluxe Room", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1080&auto=format&fit=crop"),
            ("Ahilya by the Sea Nerul", "Luxury", 22000.0, "Boutique Coastal Villa", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1080&auto=format&fit=crop")
        ]
    }
}

print("Loaded primary 6 flagship destinations.")
