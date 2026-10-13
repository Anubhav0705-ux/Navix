#!/usr/bin/env python3
"""
NAVIX Demo Dataset Generator
Generates curated, deterministic Indian travel catalog for the 48-Hour Presentation Release:
- 65 Destinations (Covering all regions & states of India)
- 650 Attractions (8-15 per destination)
- 455 Food places (7 per destination)
- 455 Hotels (7 per destination across Budget, Standard, Premium)
- 320 Transport connections (Trains, Volvo buses, flights, cabs)
- 32 Travel Stories & Guides
"""

import json
import os
from decimal import Decimal

# Base curated destinations metadata
DESTINATIONS_DATA = [
    # Maharashtra & Western India
    {"slug": "sangli", "name": "Sangli", "city": "Sangli", "state": "Maharashtra", "lat": 16.8524, "lon": 74.5815, "categories": ["City", "Heritage", "Budget"], "tagline": "Turmeric capital & historic Krishna river ghats", "duration": "2-3 Days", "season": "October to March", "budget": 1800, "img": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "pune", "name": "Pune", "city": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "categories": ["City", "Heritage", "Food"], "tagline": "Cultural capital with Maratha heritage & cafes", "duration": "3-4 Days", "season": "July to February", "budget": 2400, "img": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "mumbai", "name": "Mumbai", "city": "Mumbai", "state": "Maharashtra", "lat": 18.9400, "lon": 72.8354, "categories": ["City", "Heritage", "Food", "Romantic"], "tagline": "The vibrant coastal city that never sleeps", "duration": "3-5 Days", "season": "November to February", "budget": 3500, "img": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "nashik", "name": "Nashik", "city": "Nashik", "state": "Maharashtra", "lat": 19.9975, "lon": 73.7898, "categories": ["Spiritual", "Nature", "Romantic"], "tagline": "Wine capital of India & sacred Godavari riverbanks", "duration": "2-3 Days", "season": "October to March", "budget": 2200, "img": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "aurangabad", "name": "Chhatrapati Sambhajinagar", "city": "Aurangabad", "state": "Maharashtra", "lat": 19.8762, "lon": 75.3433, "categories": ["Heritage", "City"], "tagline": "Gateway to the UNESCO Ajanta & Ellora caves", "duration": "3-4 Days", "season": "October to March", "budget": 2100, "img": "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "nagpur", "name": "Nagpur", "city": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882, "categories": ["Nature", "City"], "tagline": "Heart of India & gateway to tiger reserves", "duration": "2-3 Days", "season": "October to March", "budget": 2000, "img": "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "mahabaleshwar", "name": "Mahabaleshwar", "city": "Mahabaleshwar", "state": "Maharashtra", "lat": 17.9237, "lon": 73.6586, "categories": ["Mountains", "Nature", "Romantic"], "tagline": "Misty Sahyadri peaks, strawberry farms & viewpoints", "duration": "3-4 Days", "season": "Year-round", "budget": 2600, "img": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "lonavala", "name": "Lonavala", "city": "Lonavala", "state": "Maharashtra", "lat": 18.7557, "lon": 73.4091, "categories": ["Nature", "Adventure", "Budget"], "tagline": "Cascading monsoon waterfalls & Sahyadri forts", "duration": "2 Days", "season": "July to October", "budget": 2000, "img": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "alibaug", "name": "Alibaug", "city": "Alibaug", "state": "Maharashtra", "lat": 18.6414, "lon": 72.8722, "categories": ["Beach", "Romantic", "Relaxed"], "tagline": "Coconut palms, sea forts & quiet coastal shores", "duration": "2-3 Days", "season": "November to March", "budget": 2500, "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "goa", "name": "Goa", "city": "Goa", "state": "Goa", "lat": 15.2993, "lon": 74.1240, "categories": ["Beach", "Nature", "Food", "Romantic"], "tagline": "Sun-drenched beaches, Portuguese villas & seafood", "duration": "4-6 Days", "season": "November to April", "budget": 3200, "img": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop"},

    # North India & Himalayas
    {"slug": "delhi", "name": "New Delhi", "city": "Delhi", "state": "Delhi", "lat": 28.6430, "lon": 77.2194, "categories": ["City", "Heritage", "Food"], "tagline": "Ancient monuments, bustling bazaars & Mughal flavours", "duration": "3-5 Days", "season": "October to March", "budget": 2800, "img": "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "agra", "name": "Agra", "city": "Agra", "state": "Uttar Pradesh", "lat": 27.1767, "lon": 78.0081, "categories": ["Heritage", "Romantic"], "tagline": "Home to the eternal wonder Taj Mahal & Mughal forts", "duration": "1-2 Days", "season": "October to March", "budget": 2200, "img": "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "jaipur", "name": "Jaipur", "city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "categories": ["Heritage", "Culture", "Food"], "tagline": "The Pink City of grand palaces, forts & royalty", "duration": "3-4 Days", "season": "October to March", "budget": 2600, "img": "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "udaipur", "name": "Udaipur", "city": "Udaipur", "state": "Rajasthan", "lat": 24.5854, "lon": 73.7125, "categories": ["Romantic", "Heritage", "Nature"], "tagline": "City of Lakes with floating palaces & royal sunsets", "duration": "3-4 Days", "season": "September to March", "budget": 3200, "img": "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "jodhpur", "name": "Jodhpur", "city": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lon": 73.0243, "categories": ["Heritage", "Culture"], "tagline": "The Blue City beneath towering Mehrangarh Fort", "duration": "2-3 Days", "season": "October to March", "budget": 2400, "img": "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "jaisalmer", "name": "Jaisalmer", "city": "Jaisalmer", "state": "Rajasthan", "lat": 26.9157, "lon": 70.9083, "categories": ["Adventure", "Heritage", "Romantic"], "tagline": "Golden sands, desert camping & the living fort", "duration": "3-4 Days", "season": "November to February", "budget": 2700, "img": "https://images.unsplash.com/photo-1579618218290-25a242f3fa59?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "amritsar", "name": "Amritsar", "city": "Amritsar", "state": "Punjab", "lat": 31.6340, "lon": 74.8723, "categories": ["Spiritual", "Heritage", "Food"], "tagline": "Sacred Golden Temple serenity & legendary Punjabi food", "duration": "2-3 Days", "season": "October to March", "budget": 2000, "img": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "chandigarh", "name": "Chandigarh", "city": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lon": 76.7794, "categories": ["City", "Nature", "Budget"], "tagline": "India's first planned garden city & Himalayan gateway", "duration": "2 Days", "season": "October to March", "budget": 2200, "img": "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "manali", "name": "Manali & Old Manali", "city": "Manali", "state": "Himachal Pradesh", "lat": 32.2396, "lon": 77.1887, "categories": ["Mountains", "Adventure", "Nature", "Romantic"], "tagline": "Alpine pine forests, snowy passes & bohemian cafes", "duration": "5-6 Days", "season": "March to June, Oct to Feb", "budget": 2500, "img": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "shimla", "name": "Shimla", "city": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lon": 77.1734, "categories": ["Mountains", "Heritage", "Romantic"], "tagline": "Queen of the Hills with colonial charm & pine ridges", "duration": "3-4 Days", "season": "Year-round", "budget": 2700, "img": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "dharamshala", "name": "Dharamshala & McLeodGanj", "city": "Dharamshala", "state": "Himachal Pradesh", "lat": 32.2190, "lon": 76.3234, "categories": ["Mountains", "Spiritual", "Nature"], "tagline": "Little Lhasa amidst deodar forests & Dhauladhar peaks", "duration": "3-4 Days", "season": "September to June", "budget": 2100, "img": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "kasol", "name": "Kasol & Parvati Valley", "city": "Kasol", "state": "Himachal Pradesh", "lat": 32.0100, "lon": 77.3148, "categories": ["Mountains", "Adventure", "Budget"], "tagline": "Backpacker haven by the rushing turquoise river", "duration": "4-5 Days", "season": "March to November", "budget": 1700, "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "rishikesh", "name": "Rishikesh", "city": "Rishikesh", "state": "Uttarakhand", "lat": 30.0869, "lon": 78.2676, "categories": ["Spiritual", "Adventure", "Nature"], "tagline": "Yoga capital of the world with white-water river rafting", "duration": "3-4 Days", "season": "September to May", "budget": 2000, "img": "https://images.unsplash.com/photo-1596761226507-6f030f81d113?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "haridwar", "name": "Haridwar", "city": "Haridwar", "state": "Uttarakhand", "lat": 29.9457, "lon": 78.1642, "categories": ["Spiritual", "Heritage"], "tagline": "Sacred Ganga aarti at Har Ki Pauri & ancient ghats", "duration": "2 Days", "season": "October to March", "budget": 1600, "img": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "dehradun", "name": "Dehradun", "city": "Dehradun", "state": "Uttarakhand", "lat": 30.3165, "lon": 78.0322, "categories": ["City", "Nature", "Budget"], "tagline": "Picturesque valley capital nestled between Ganga and Yamuna", "duration": "2-3 Days", "season": "March to June, Oct to Feb", "budget": 2100, "img": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "mussoorie", "name": "Mussoorie", "city": "Mussoorie", "state": "Uttarakhand", "lat": 30.4598, "lon": 78.0644, "categories": ["Mountains", "Romantic", "Nature"], "tagline": "The Queen of Hills with views of the snow-clad Garhwal range", "duration": "3-4 Days", "season": "Year-round", "budget": 2800, "img": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "srinagar", "name": "Srinagar", "city": "Srinagar", "state": "Jammu and Kashmir", "lat": 34.0837, "lon": 74.7973, "categories": ["Romantic", "Nature", "Mountains"], "tagline": "Houseboats on Dal Lake, Mughal gardens & Shikara glides", "duration": "4-5 Days", "season": "April to October", "budget": 3500, "img": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "gulmarg", "name": "Gulmarg", "city": "Gulmarg", "state": "Jammu and Kashmir", "lat": 34.0484, "lon": 74.3805, "categories": ["Mountains", "Adventure", "Romantic"], "tagline": "Meadow of flowers & world's premier powder snow ski bowl", "duration": "2-3 Days", "season": "December to April", "budget": 4200, "img": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "leh", "name": "Leh & Ladakh", "city": "Leh", "state": "Ladakh", "lat": 34.1526, "lon": 77.5771, "categories": ["Adventure", "Mountains", "Spiritual"], "tagline": "High-altitude desert passes, monasteries & sapphire lakes", "duration": "6-8 Days", "season": "May to September", "budget": 3800, "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "varanasi", "name": "Varanasi", "city": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739, "categories": ["Spiritual", "Heritage", "Culture"], "tagline": "The eternal city of Ghats, morning boat chants & silk", "duration": "3-4 Days", "season": "October to March", "budget": 1800, "img": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "lucknow", "name": "Lucknow", "city": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "categories": ["Food", "Heritage", "Culture"], "tagline": "City of Nawabs, Awadhi royal kebabs & Chikankari craft", "duration": "2-3 Days", "season": "October to March", "budget": 2000, "img": "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"},

    # East & North East India
    {"slug": "kolkata", "name": "Kolkata", "city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "categories": ["City", "Heritage", "Food"], "tagline": "City of Joy with grand colonial architecture & arts", "duration": "3-4 Days", "season": "October to March", "budget": 2200, "img": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "darjeeling", "name": "Darjeeling", "city": "Darjeeling", "state": "West Bengal", "lat": 27.0410, "lon": 88.2663, "categories": ["Mountains", "Nature", "Romantic"], "tagline": "Kanchenjunga vistas, heritage toy trains & tea gardens", "duration": "4-5 Days", "season": "October to May", "budget": 2500, "img": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "gangtok", "name": "Gangtok", "city": "Gangtok", "state": "Sikkim", "lat": 27.3389, "lon": 88.6065, "categories": ["Mountains", "Nature", "Adventure"], "tagline": "Clean mountain capital with Buddhist monasteries & peaks", "duration": "4-5 Days", "season": "March to June, Oct to Dec", "budget": 2800, "img": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "guwahati", "name": "Guwahati", "city": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362, "categories": ["City", "Spiritual", "Nature"], "tagline": "Gateway to the Northeast on the majestic Brahmaputra", "duration": "2-3 Days", "season": "October to April", "budget": 2100, "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "shillong", "name": "Shillong", "city": "Shillong", "state": "Meghalaya", "lat": 25.5788, "lon": 91.8933, "categories": ["Mountains", "Nature", "Romantic"], "tagline": "Scotland of the East with pine hills & live music", "duration": "3-4 Days", "season": "September to May", "budget": 2600, "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "kaziranga", "name": "Kaziranga", "city": "Kaziranga", "state": "Assam", "lat": 26.5775, "lon": 93.1711, "categories": ["Nature", "Adventure"], "tagline": "World sanctuary of the Great Indian One-Horned Rhinoceros", "duration": "2-3 Days", "season": "November to April", "budget": 3000, "img": "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "bhubaneswar", "name": "Bhubaneswar", "city": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lon": 85.8245, "categories": ["Heritage", "Spiritual", "City"], "tagline": "Temple City with exquisite ancient Kalinga architecture", "duration": "2-3 Days", "season": "October to March", "budget": 1900, "img": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "puri", "name": "Puri", "city": "Puri", "state": "Odisha", "lat": 19.8135, "lon": 85.8312, "categories": ["Beach", "Spiritual", "Budget"], "tagline": "Sacred Jagannath Dham & golden ocean beaches", "duration": "2-3 Days", "season": "October to March", "budget": 1800, "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"},

    # South India
    {"slug": "bengaluru", "name": "Bengaluru", "city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "categories": ["City", "Nature", "Food"], "tagline": "The Garden City of craft breweries, startups & pleasant weather", "duration": "3-4 Days", "season": "Year-round", "budget": 2800, "img": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "mysuru", "name": "Mysuru", "city": "Mysuru", "state": "Karnataka", "lat": 12.2958, "lon": 76.6394, "categories": ["Heritage", "Culture", "Romantic"], "tagline": "Royal palaces, fragrant sandalwood & grand Dasara heritage", "duration": "2-3 Days", "season": "October to March", "budget": 2000, "img": "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "hampi", "name": "Hampi", "city": "Hampi", "state": "Karnataka", "lat": 15.3350, "lon": 76.4600, "categories": ["Heritage", "Adventure", "Budget"], "tagline": "Boulder-strewn UNESCO empire of Vijayanagara ruins", "duration": "3-4 Days", "season": "October to March", "budget": 1700, "img": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "coorg", "name": "Coorg (Madikeri)", "city": "Coorg", "state": "Karnataka", "lat": 12.4244, "lon": 75.7382, "categories": ["Nature", "Mountains", "Romantic"], "tagline": "Verdant coffee plantations, mist and Kodava hospitality", "duration": "3-4 Days", "season": "October to May", "budget": 2800, "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "gokarna", "name": "Gokarna", "city": "Gokarna", "state": "Karnataka", "lat": 14.5479, "lon": 74.3188, "categories": ["Beach", "Spiritual", "Budget"], "tagline": "Pristine crescent beaches & tranquil coastal temples", "duration": "3-4 Days", "season": "October to March", "budget": 1800, "img": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "hyderabad", "name": "Hyderabad", "city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "categories": ["City", "Heritage", "Food"], "tagline": "City of Pearls, Charminar & world-famous Dum Biryani", "duration": "3-4 Days", "season": "October to March", "budget": 2400, "img": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "chennai", "name": "Chennai", "city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "categories": ["City", "Beach", "Heritage", "Food"], "tagline": "Gateway to the South with Marina beach & classical arts", "duration": "3-4 Days", "season": "November to February", "budget": 2400, "img": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "pondicherry", "name": "Pondicherry", "city": "Pondicherry", "state": "Puducherry", "lat": 11.9416, "lon": 79.8083, "categories": ["Beach", "Heritage", "Romantic", "Food"], "tagline": "French colonial quarters, bougainvillea streets & cafes", "duration": "3-4 Days", "season": "October to March", "budget": 2600, "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "ooty", "name": "Ooty (Udhagamandalam)", "city": "Ooty", "state": "Tamil Nadu", "lat": 11.4102, "lon": 76.6950, "categories": ["Mountains", "Nature", "Romantic"], "tagline": "Blue Nilgiri hills, tea estates & vintage toy train", "duration": "3-4 Days", "season": "Year-round", "budget": 2500, "img": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "kodaikanal", "name": "Kodaikanal", "city": "Kodaikanal", "state": "Tamil Nadu", "lat": 10.2381, "lon": 77.4892, "categories": ["Mountains", "Nature", "Romantic"], "tagline": "Princess of Hill Stations with misty lakes and pine trails", "duration": "3-4 Days", "season": "September to May", "budget": 2400, "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "madurai", "name": "Madurai", "city": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lon": 78.1198, "categories": ["Spiritual", "Heritage", "Food"], "tagline": "Ancient temple city centered on iconic Meenakshi Amman", "duration": "2 Days", "season": "October to March", "budget": 1800, "img": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "kochi", "name": "Kochi (Cochin)", "city": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673, "categories": ["Heritage", "Food", "Beach", "Culture"], "tagline": "Queen of the Arabian Sea with Chinese fishing nets & art", "duration": "3-4 Days", "season": "October to April", "budget": 2600, "img": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "munnar", "name": "Munnar", "city": "Munnar", "state": "Kerala", "lat": 10.0889, "lon": 77.0595, "categories": ["Mountains", "Nature", "Romantic"], "tagline": "Endless rolling green tea estates, waterfalls & cool air", "duration": "3-4 Days", "season": "September to May", "budget": 2700, "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "alleppey", "name": "Alleppey (Alappuzha)", "city": "Alleppey", "state": "Kerala", "lat": 9.4981, "lon": 76.3388, "categories": ["Romantic", "Nature", "Relaxed"], "tagline": "Serene backwaters, traditional houseboats & paddy canals", "duration": "2-3 Days", "season": "October to March", "budget": 3400, "img": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "thiruvananthapuram", "name": "Thiruvananthapuram", "city": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lon": 76.9366, "categories": ["City", "Spiritual", "Beach"], "tagline": "Kerala's green capital & Padmanabhaswamy temple", "duration": "2-3 Days", "season": "October to March", "budget": 2200, "img": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "varkala", "name": "Varkala", "city": "Varkala", "state": "Kerala", "lat": 8.7379, "lon": 76.7163, "categories": ["Beach", "Romantic", "Relaxed"], "tagline": "Dramatic red laterite cliffs over the Arabian Sea & sunset cafes", "duration": "3-4 Days", "season": "October to March", "budget": 2100, "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"},

    # Central & Western India
    {"slug": "ahmedabad", "name": "Ahmedabad", "city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "categories": ["Heritage", "City", "Food"], "tagline": "UNESCO heritage city, Sabarmati ashram & street food", "duration": "2-3 Days", "season": "October to March", "budget": 2000, "img": "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "vadodara", "name": "Vadodara", "city": "Vadodara", "state": "Gujarat", "lat": 22.3072, "lon": 73.1812, "categories": ["Heritage", "City"], "tagline": "Palatial grandeur at Laxmi Vilas & cultural hub", "duration": "2 Days", "season": "October to March", "budget": 1900, "img": "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "surat", "name": "Surat", "city": "Surat", "state": "Gujarat", "lat": 21.1702, "lon": 72.8311, "categories": ["City", "Food", "Budget"], "tagline": "Diamond hub & renowned food paradise of Gujarat", "duration": "2 Days", "season": "October to March", "budget": 1800, "img": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "indore", "name": "Indore", "city": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lon": 75.8577, "categories": ["City", "Food", "Budget"], "tagline": "India's cleanest city & midnight street food at Sarafa Bazaar", "duration": "2-3 Days", "season": "October to March", "budget": 1800, "img": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "bhopal", "name": "Bhopal", "city": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126, "categories": ["City", "Heritage", "Nature"], "tagline": "City of Lakes & gateway to UNESCO Sanchi Stupa", "duration": "2-3 Days", "season": "October to March", "budget": 1900, "img": "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "khajuraho", "name": "Khajuraho", "city": "Khajuraho", "state": "Madhya Pradesh", "lat": 24.8318, "lon": 79.9199, "categories": ["Heritage", "Culture"], "tagline": "UNESCO masterpieces of medieval Hindu & Jain sculpture", "duration": "2 Days", "season": "October to March", "budget": 2200, "img": "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "pachmarhi", "name": "Pachmarhi", "city": "Pachmarhi", "state": "Madhya Pradesh", "lat": 22.4674, "lon": 78.4346, "categories": ["Mountains", "Nature", "Relaxed"], "tagline": "Queen of the Satpuras with prehistoric caves & waterfalls", "duration": "3-4 Days", "season": "Year-round", "budget": 2100, "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "raipur", "name": "Raipur", "city": "Raipur", "state": "Chhattisgarh", "lat": 21.2514, "lon": 81.6296, "categories": ["City", "Nature", "Budget"], "tagline": "Gateway to Bastar tribal arts, dense forests & waterfalls", "duration": "2 Days", "season": "October to March", "budget": 1700, "img": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "mount-abu", "name": "Mount Abu", "city": "Mount Abu", "state": "Rajasthan", "lat": 24.5926, "lon": 72.7156, "categories": ["Mountains", "Heritage", "Romantic"], "tagline": "Rajasthan's only hill station & exquisite Dilwara temples", "duration": "2-3 Days", "season": "Year-round", "budget": 2300, "img": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop"},
    {"slug": "nainital", "name": "Nainital", "city": "Nainital", "state": "Uttarakhand", "lat": 29.3919, "lon": 79.4542, "categories": ["Mountains", "Nature", "Romantic"], "tagline": "Emerald eye lake surrounded by Kumaon pine peaks", "duration": "3-4 Days", "season": "March to June, Oct to Feb", "budget": 2500, "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"},
]

def generate_catalog():
    print(f"Generating full demo catalog for {len(DESTINATIONS_DATA)} destinations...")
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data", "demo")
    os.makedirs(out_dir, exist_ok=True)

    destinations = []
    attractions = []
    foods = []
    hotels = []
    nodes = []

    # Category images lookup
    CAT_IMAGES = {
        "Nature": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
        "Heritage": "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=800&auto=format&fit=crop",
        "Adventure": "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800&auto=format&fit=crop",
        "Spiritual": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop",
        "Beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
        "Viewpoint": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800&auto=format&fit=crop",
        "Museum": "https://images.unsplash.com/photo-1565034946487-077786996e27?q=80&w=800&auto=format&fit=crop",
        "Market": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop",
    }

    # Food images
    FOOD_IMAGES = [
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop",
    ]

    # Hotel images
    HOTEL_IMAGES = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop",
    ]

    for d in DESTINATIONS_DATA:
        dest_id = f"dest_{d['slug']}"
        dest_obj = {
            "id": dest_id,
            "slug": d["slug"],
            "name": d["name"],
            "city": d["city"],
            "state": d["state"],
            "country": "IN",
            "latitude": d["lat"],
            "longitude": d["lon"],
            "categories": d["categories"],
            "tagline": d["tagline"],
            "description": f"{d['name']} is one of India's most celebrated travel experiences in {d['state']}. Known for {d['tagline'].lower()}, it offers travelers a perfect combination of cultural richness, local gastronomy, and immersive scenery.",
            "ideal_duration": d["duration"],
            "best_season": d["season"],
            "average_daily_budget": d["budget"],
            "hero_image": d["img"],
            "popularity_rating": 4.8,
            "data_state": "DEMO_SEED"
        }
        destinations.append(dest_obj)

        # Transit Node
        nodes.append({
            "node_id": f"node_{d['slug'].upper()}",
            "node_name": f"{d['city']} Central Hub",
            "city": d["city"],
            "latitude": d["lat"],
            "longitude": d["lon"]
        })

        # 10 Attractions per destination (Total: 650 attractions!)
        sample_attractions = [
            ("Historic Fort & Panorama", "Heritage", 120, 50, "09:00", "18:00", "Ancient fortress with expansive valley views and centuries of history."),
            ("Sacred River Ghats & Walk", "Spiritual", 90, 0, "06:00", "20:00", "Peaceful riverside promenades with morning prayers and sacred evening aarti."),
            ("Botanical Gardens & Flora Park", "Nature", 120, 30, "08:30", "18:30", "Lush green oasis with rare alpine and tropical flowers and walking trails."),
            ("Sunset Peak Viewpoint", "Viewpoint", 90, 0, "06:00", "19:00", "Spectacular vantage point overlooking mountain ridges and the city skyline."),
            ("Heritage Museum & Art Gallery", "Museum", 120, 100, "10:00", "17:00", "Curated regional artifacts, royal portraits, and archaeological discoveries."),
            ("Old City Artisan Bazaar", "Market", 120, 0, "10:30", "21:00", "Vibrant narrow alleys filled with handcrafted textiles, spices, and souvenirs."),
            ("Scenic Waterfall Trek", "Adventure", 180, 50, "08:00", "17:00", "Exciting trail through lush forest leading to a cascading freshwater pool."),
            ("Ancient Rock Temple", "Spiritual", 90, 20, "07:00", "19:00", "Intricately carved stone temple dedicated to local deities."),
            ("Lake Promenade & Boating Point", "Nature", 120, 150, "09:00", "18:00", "Calm freshwater lake with pedal boats, shaded benches, and breeze."),
            ("Cultural Heritage Center", "Culture", 90, 80, "10:00", "18:00", "Live demonstrations of traditional dance, music, and local craftsmanship."),
        ]

        # Destination specific overrides for Sangli & Manali
        if d["slug"] == "sangli":
            sample_attractions[0] = ("Sangli Fort & Museum", "Heritage", 120, 20, "09:00", "18:00", "Historic seat of Patwardhan dynasty on the banks of Krishna river.")
            sample_attractions[1] = ("Ganpati Temple Sangli", "Spiritual", 90, 0, "06:00", "21:00", "Renowned 1843 stone temple known for majestic idol and peaceful courtyard.")
            sample_attractions[2] = ("Krishna River Ghats", "Spiritual", 60, 0, "06:00", "20:00", "Picturesque stone steps along the sacred river Krishna.")
            sample_attractions[6] = ("Sagareshwar Wildlife Sanctuary", "Adventure", 180, 50, "08:00", "17:30", "India's first man-made wildlife sanctuary sheltering deer and peacocks.")
            sample_attractions[3] = ("Dandoba Hill Forest Reserve", "Nature", 150, 0, "07:00", "18:00", "Scenic hill station with ancient Shiva temple and trekking trails.")
        elif d["slug"] == "manali":
            sample_attractions[0] = ("Hadimba Devi Temple", "Heritage", 90, 50, "08:00", "18:00", "Ancient wooden pagoda temple set amidst dense giant deodar cedar forests.")
            sample_attractions[1] = ("Old Manali Village & Manu Temple", "Culture", 120, 0, "07:00", "20:00", "Charming traditional wooden houses, bohemian cafes, and cobblestone lanes.")
            sample_attractions[2] = ("Solang Valley Snow Point", "Adventure", 240, 200, "08:30", "17:30", "High altitude valley offering paragliding, zorbing, and ropeway cable cars.")
            sample_attractions[3] = ("Jogini Waterfalls Trail", "Nature", 180, 0, "07:00", "18:00", "Scenic nature trail passing apple orchards and cascading mountain waters.")
            sample_attractions[6] = ("Vashisht Hot Water Springs", "Spiritual", 90, 0, "07:00", "20:00", "Natural sulfur thermal springs with ancient stone baths and mountain views.")

        for idx, (aname, acat, adur, afee, aopen, aclose, adesc) in enumerate(sample_attractions, start=1):
            attractions.append({
                "id": f"att_{d['slug']}_{idx:02d}",
                "name": f"{d['name']} {aname}" if not aname.startswith(d['name']) else aname,
                "destination_id": dest_id,
                "destination_slug": d["slug"],
                "category": acat,
                "latitude": round(d["lat"] + (idx * 0.007) - 0.035, 4),
                "longitude": round(d["lon"] + (idx * 0.007) - 0.035, 4),
                "rating": round(4.5 + (idx % 5) * 0.09, 1),
                "visit_duration_minutes": adur,
                "demo_entry_fee": afee,
                "opening_time": aopen,
                "closing_time": aclose,
                "description": adesc,
                "image": CAT_IMAGES.get(acat, d["img"]),
                "recommended_score": 85 + (idx % 15),
                "data_state": "DEMO_SEED",
                "price_state": "DEMO_ESTIMATE"
            })

        # 7 Food Places per destination (Total: 455 restaurants!)
        sample_food = [
            ("Heritage Thali House", "Local Indian Thali", "Vegetarian", 450, "Full authentic thali with local breads and regional curries"),
            ("Riverside Cafe & Bakery", "Cafe & Continental", "Both", 750, "Artisan coffee, fresh woodfired pizzas, and herbal teas"),
            ("Spice Bazaar Dhaba", "North Indian & Tandoor", "Both", 550, "Smoky tandoori delicacies, creamy dals, and butter naans"),
            ("Coastal Spice Eatery", "Regional Coastal & Seafood", "Both", 850, "Fresh spiced curries, crispy fried catches, and steamed rice"),
            ("Pure Veg Rasoi", "Traditional Sattvik", "Vegetarian", 350, "Wholesome home-style cooked food with zero garlic or onion on request"),
            ("Sunset Rooftop Bistro", "Multi-Cuisine & Grills", "Both", 1100, "Panoramic evening views with handcrafted mocktails and platters"),
            ("Old Town Sweet & Chaat House", "Street Food & Sweets", "Vegetarian", 250, "Crispy chaat, kachoris, hot jalebis, and regional milk desserts"),
        ]

        if d["slug"] == "sangli":
            sample_food[0] = ("Sangli Bhadang & Misal House", "Maharashtrian", "Vegetarian", 250, "Fiery authentic Kolhapuri-Sangli misal pav and spicy bhadang.")
            sample_food[1] = ("Krishna Valley Family Restaurant", "Maharashtrian & Thali", "Both", 500, "Traditional Marathi vegetarian and chicken thalis.")
        elif d["slug"] == "manali":
            sample_food[0] = ("Cafe 1947 Old Manali", "Italian & Continental", "Both", 800, "Riverside seating by the Beas with woodfired pizzas & live acoustic sets.")
            sample_food[1] = ("Drifters' Cafe & Inn", "Cafe & Tibetan", "Both", 650, "Siddu with local ghee, freshly brewed espresso, and waffles.")

        for fidx, (fname, fcuis, ftype, fcost, fspec) in enumerate(sample_food, start=1):
            foods.append({
                "id": f"food_{d['slug']}_{fidx:02d}",
                "name": f"{d['name']} {fname}" if not fname.startswith(d['name']) else fname,
                "destination_id": dest_id,
                "destination_slug": d["slug"],
                "cuisine": fcuis,
                "food_type": ftype,
                "rating": round(4.4 + (fidx % 6) * 0.08, 1),
                "demo_cost_for_two": fcost,
                "opening_hours": "10:30 AM - 10:30 PM",
                "latitude": round(d["lat"] + (fidx * 0.005) - 0.02, 4),
                "longitude": round(d["lon"] + (fidx * 0.005) - 0.02, 4),
                "speciality": fspec,
                "image": FOOD_IMAGES[fidx % len(FOOD_IMAGES)],
                "meal_suggestion": "Lunch & Dinner" if fcost > 400 else "Breakfast & Snacks",
                "data_state": "DEMO_SEED",
                "price_state": "DEMO_ESTIMATE"
            })

        # 7 Hotels per destination (Total: 455 stays across Budget, Standard, Premium!)
        sample_hotels = [
            ("Backpacker Hosteller", "Budget", 650, "Cozy bunk bed in 6-bed mountain dorm with high-speed WiFi", ["Free WiFi", "Locker", "Cafe", "Common Lounge"]),
            ("Green Valley Homestay", "Budget", 1200, "Clean private room with garden views and home-cooked breakfast", ["Hot Water", "Breakfast", "Balcony"]),
            ("Travellers Haven Inn", "Budget", 1500, "Standard double room close to central transit hub", ["Room Service", "Free WiFi", "AC"]),
            ("Comfort Pine Guest House", "Standard", 2400, "Spacious deluxe room with balcony, attached bath, and dining", ["Balcony", "Restaurant", "Mountain/City View", "Free Parking"]),
            ("Royal Heritage Residency", "Standard", 3400, "Refined heritage-style suite with modern amenities and courtyard", ["Complimentary Breakfast", "Courtyard", "Room Service"]),
            ("The Grand Vista Resort", "Premium", 6500, "Luxury mountain/coastal chalet with panoramic heated pool and spa", ["Spa & Wellness", "Swimming Pool", "Multi-Cuisine Dining", "Valet"]),
            ("Elysium Luxury Retreat & Spa", "Premium", 9800, "Presidential suite with butler service and private terrace jacuzzi", ["Luxury Spa", "Private Jacuzzi", "Fine Dining", "Airport Shuttle"]),
        ]

        if d["slug"] == "sangli":
            sample_hotels[0] = ("Sangli Central Lodge", "Budget", 750, "Economy room near railway station", ["Free WiFi", "Hot Water"])
            sample_hotels[3] = ("Hotel Great Maratha", "Standard", 2500, "Clean executive air-conditioned room with restaurant", ["AC", "Restaurant", "Parking"])
        elif d["slug"] == "manali":
            sample_hotels[0] = ("Zostel Old Manali", "Budget", 850, "Iconic backpacker hostel with mountain views and garden cafe", ["High Speed WiFi", "Cafe", "Games Room"])
            sample_hotels[3] = ("Riverside Pine Chalet", "Standard", 2800, "Riverside wooden cottage with heated blankets and balcony", ["Balcony", "Heater", "River View"])
            sample_hotels[5] = ("The Himalayan Luxury Resort", "Premium", 8200, "Medieval-style Victorian castle resort with pine forest spa", ["Heated Pool", "Spa", "Fireplace", "Bar"])

        for hidx, (hname, htier, hprice, hroom, hamen) in enumerate(sample_hotels, start=1):
            hotels.append({
                "id": f"stay_{d['slug']}_{hidx:02d}",
                "name": f"{d['name']} {hname}" if not hname.startswith(d['name']) else hname,
                "destination_id": dest_id,
                "destination_slug": d["slug"],
                "tier": htier,
                "latitude": round(d["lat"] + (hidx * 0.004) - 0.015, 4),
                "longitude": round(d["lon"] + (hidx * 0.004) - 0.015, 4),
                "demo_price_per_night": hprice,
                "rating": round(4.3 + (hidx % 6) * 0.09, 1),
                "room_type": hroom,
                "amenities": hamen,
                "image": HOTEL_IMAGES[hidx % len(HOTEL_IMAGES)],
                "availability": "Available",
                "data_state": "DEMO_SEED",
                "price_state": "DEMO_ESTIMATE"
            })

    # Generate 320 Transport connections across India (Trains, Buses, Flights, Cabs)
    # Guaranteed presentation corridors:
    # 1. Sangli -> Manali (Multi-modal options: Sangli-Pune-Delhi-Manali, Sangli-Mumbai-Delhi-Manali, direct cab)
    # 2. Pune -> Goa
    # 3. Mumbai -> Jaipur
    # 4. Delhi -> Manali
    # 5. Delhi -> Jaipur
    # 6. Bengaluru -> Mysuru
    # 7. Chennai -> Pondicherry
    # 8. Kochi -> Munnar
    # 9. Kolkata -> Darjeeling
    # 10. Mumbai -> Goa

    MAJOR_CORRIDORS = [
        # Sangli connections
        ("Sangli", "Pune", "TRAIN", "Indian Railways", "17412 Mahalaxmi Express", "07:00", "12:15", 315, 185),
        ("Sangli", "Pune", "BUS", "MSRTC Shivneri AC", "Shivneri Multi-Axle", "08:30", "13:30", 300, 480),
        ("Sangli", "Pune", "CAB", "Intercity Cab Direct", "Sedan Express Transfer", "06:00", "10:30", 270, 3200),
        ("Sangli", "Mumbai", "TRAIN", "Indian Railways", "11030 Koyna Express", "08:15", "16:45", 510, 240),
        ("Sangli", "Mumbai", "BUS", "Purple Travels AC Sleeper", "Bharat Benz Sleeper", "21:30", "06:30", 540, 950),
        ("Sangli", "Goa", "BUS", "Kadamba AC Volvo", "Interstate Express", "07:30", "13:30", 360, 650),
        ("Sangli", "Bengaluru", "TRAIN", "Indian Railways", "16590 Rani Chennamma", "19:00", "06:30", 690, 410),

        # Pune connections
        ("Pune", "Goa", "TRAIN", "Indian Railways", "17419 Goa Express", "04:30", "14:15", 585, 360),
        ("Pune", "Goa", "BUS", "IntrCity SmartBus", "AC Volvo Sleeper 2+1", "20:00", "06:30", 630, 1100),
        ("Pune", "Goa", "FLIGHT", "IndiGo", "6E-442 Non-Stop", "11:20", "12:25", 65, 3400),
        ("Pune", "Goa", "CAB", "Goa Coastal Cab", "SUV Intercity", "06:00", "14:30", 510, 7500),
        ("Pune", "Delhi", "TRAIN", "Indian Railways", "12263 Duronto Express", "11:10", "06:55", 1185, 1850),
        ("Pune", "Delhi", "FLIGHT", "Air India", "AI-850 Non-Stop", "07:30", "09:40", 130, 4200),
        ("Pune", "Mumbai", "TRAIN", "Indian Railways", "12124 Deccan Queen", "07:15", "10:25", 190, 140),
        ("Pune", "Mumbai", "CAB", "Cool Cabs Express", "Mumbai-Pune Expressway Cab", "07:00", "10:00", 180, 2200),
        ("Pune", "Jaipur", "FLIGHT", "IndiGo", "6E-728 Non-Stop", "08:15", "10:05", 110, 4500),
        ("Pune", "Jaipur", "TRAIN", "Indian Railways", "12939 Pune Jaipur Superfast", "15:30", "13:40", 1330, 890),

        # Mumbai connections
        ("Mumbai", "Goa", "TRAIN", "Indian Railways", "22229 Vande Bharat Express", "05:25", "13:10", 465, 1450),
        ("Mumbai", "Goa", "TRAIN", "Indian Railways", "12051 Jan Shatabdi", "05:10", "14:30", 560, 420),
        ("Mumbai", "Goa", "FLIGHT", "IndiGo", "6E-512 Daily Flight", "08:30", "09:45", 75, 2900),
        ("Mumbai", "Goa", "BUS", "Paulo Travels Volvo", "Multi-Axle AC Sleeper", "20:00", "07:30", 690, 1200),
        ("Mumbai", "Jaipur", "TRAIN", "Indian Railways", "12955 Mumbai Jaipur Superfast", "19:05", "12:45", 1060, 720),
        ("Mumbai", "Jaipur", "FLIGHT", "Akasa Air", "QP-1412 Non-Stop", "09:10", "11:00", 110, 3800),
        ("Mumbai", "Delhi", "TRAIN", "Indian Railways", "12951 Tejas Rajdhani", "17:00", "08:32", 932, 2400),
        ("Mumbai", "Delhi", "FLIGHT", "IndiGo", "6E-201 Non-Stop", "06:00", "08:10", 130, 4200),
        ("Mumbai", "Udaipur", "FLIGHT", "IndiGo", "6E-994 Daily", "10:00", "11:25", 85, 3600),

        # Delhi connections
        ("Delhi", "Manali", "BUS", "HRTC Himsuta Volvo", "AC Volvo 2+2 Semi-Sleeper", "20:00", "08:00", 720, 1400),
        ("Delhi", "Manali", "BUS", "Zingbus Luxury Electric", "Luxury AC Sleeper", "19:30", "07:15", 705, 1600),
        ("Delhi", "Manali", "FLIGHT", "Alliance Air", "9I-805 Delhi to Bhuntar (Kullu)", "06:45", "08:05", 80, 5200),
        ("Delhi", "Manali", "CAB", "Himalayan Cab Express", "Toyota Innova Private Transfer", "05:00", "16:00", 660, 9500),
        ("Delhi", "Jaipur", "TRAIN", "Indian Railways", "20978 Vande Bharat Express", "15:15", "19:05", 230, 890),
        ("Delhi", "Jaipur", "BUS", "RSRTC Goldline Volvo", "Super Luxury AC", "07:00", "12:00", 300, 650),
        ("Delhi", "Jaipur", "CAB", "Delhi-Jaipur Highway Cab", "Sedan Door-to-Door", "08:00", "12:30", 270, 3200),
        ("Delhi", "Agra", "TRAIN", "Indian Railways", "12050 Gatimaan Express", "08:10", "09:50", 100, 750),
        ("Delhi", "Chandigarh", "TRAIN", "Indian Railways", "12011 Kalka Shatabdi", "07:40", "11:05", 205, 620),
        ("Delhi", "Rishikesh", "TRAIN", "Indian Railways", "22457 Vande Bharat", "17:50", "22:15", 265, 950),
        ("Delhi", "Amritsar", "TRAIN", "Indian Railways", "12013 Amritsar Shatabdi", "16:30", "22:30", 360, 980),
        ("Delhi", "Varanasi", "TRAIN", "Indian Railways", "22436 Vande Bharat", "06:00", "14:00", 480, 1750),
        ("Delhi", "Shimla", "BUS", "HRTC Volvo", "Himsuta AC", "21:00", "05:30", 510, 1050),
        ("Delhi", "Srinagar", "FLIGHT", "IndiGo", "6E-501 Non-Stop", "09:00", "10:30", 90, 3900),
        ("Delhi", "Leh", "FLIGHT", "Air India", "AI-445 Mountain Flight", "06:30", "07:55", 85, 4800),

        # Chandigarh & Himachal connectors
        ("Chandigarh", "Manali", "BUS", "HRTC Volvo", "Himsuta AC", "08:00", "16:30", 510, 950),
        ("Chandigarh", "Manali", "CAB", "Shimla-Kullu Cab", "Sedan Mountain Cab", "07:00", "14:00", 420, 5500),
        ("Chandigarh", "Shimla", "TRAIN", "Indian Railways Toy Train", "52451 Shivalik Deluxe", "05:45", "10:35", 290, 450),

        # South India Corridors
        ("Bengaluru", "Mysuru", "TRAIN", "Indian Railways", "20607 Vande Bharat Express", "10:15", "12:20", 125, 520),
        ("Bengaluru", "Mysuru", "BUS", "KSRTC Flybus / Airavat", "Club Class Multi-Axle", "08:00", "11:00", 180, 380),
        ("Bengaluru", "Mysuru", "CAB", "Bangalore-Mysore Expressway Cab", "Fast Sedan Transfer", "07:00", "09:15", 135, 2400),
        ("Bengaluru", "Coorg", "BUS", "KSRTC Airavat", "Diamond Class AC", "22:30", "05:00", 390, 750),
        ("Bengaluru", "Hampi", "TRAIN", "Indian Railways", "16592 Hampi Express", "21:50", "07:10", 560, 450),
        ("Bengaluru", "Ooty", "BUS", "KSRTC Airavat", "Night Sleeper", "22:00", "06:30", 510, 850),
        ("Bengaluru", "Goa", "FLIGHT", "IndiGo", "6E-711 Non-Stop", "07:00", "08:15", 75, 2800),
        ("Bengaluru", "Kochi", "FLIGHT", "Air India Express", "IX-522 Non-Stop", "08:45", "09:50", 65, 2600),

        # Chennai & Tamil Nadu Corridors
        ("Chennai", "Pondicherry", "BUS", "PRTC Volvo AC", "East Coast Road Express", "07:00", "09:45", 165, 350),
        ("Chennai", "Pondicherry", "CAB", "ECR Coastal Cab", "Scenic Drive Sedan", "08:00", "10:30", 150, 2200),
        ("Chennai", "Pondicherry", "TRAIN", "Indian Railways", "16115 Chennai Egmore Express", "18:10", "22:15", 245, 140),
        ("Chennai", "Madurai", "TRAIN", "Indian Railways", "20601 Vande Bharat", "05:45", "11:35", 350, 1150),
        ("Chennai", "Bengaluru", "TRAIN", "Indian Railways", "20607 Vande Bharat Express", "05:50", "10:10", 260, 995),

        # Kerala Corridors
        ("Kochi", "Munnar", "BUS", "KSRTC AC Low Floor", "Hill Highway Express", "08:00", "12:30", 270, 320),
        ("Kochi", "Munnar", "CAB", "Kerala Spices Cab", "Hill Station Transfer", "07:00", "10:45", 225, 2800),
        ("Kochi", "Alleppey", "TRAIN", "Indian Railways", "16308 Executive Express", "08:30", "09:35", 65, 80),
        ("Kochi", "Alleppey", "CAB", "Backwater Transfer", "Sedan Taxi", "09:00", "10:15", 75, 1400),
        ("Kochi", "Varkala", "TRAIN", "Indian Railways", "12626 Kerala Express", "15:20", "17:45", 145, 150),
        ("Alleppey", "Thiruvananthapuram", "TRAIN", "Indian Railways", "20631 Vande Bharat", "09:40", "11:45", 125, 590),

        # East Corridors
        ("Kolkata", "Darjeeling", "TRAIN", "Indian Railways", "22301 Vande Bharat to NJP", "05:55", "13:25", 450, 1560),
        ("Kolkata", "Darjeeling", "FLIGHT", "IndiGo to Bagdogra", "6E-651 Flight + Cab", "09:10", "10:15", 195, 3800),
        ("Kolkata", "Puri", "TRAIN", "Indian Railways", "22895 Vande Bharat Express", "06:10", "12:35", 385, 1260),
        ("Kolkata", "Varanasi", "TRAIN", "Indian Railways", "12317 Akal Takht Express", "07:40", "18:00", 620, 550),
        ("Guwahati", "Shillong", "CAB", "Meghalaya Tourism Cab", "Khasi Hills Shared Cab", "08:00", "11:00", 180, 1800),
        ("Guwahati", "Kaziranga", "BUS", "ASTC Luxury Bus", "National Highway Express", "07:30", "12:00", 270, 450),
    ]

    schedules = []
    sched_id_counter = 1

    for orig, dest, mode, op, sname, dtime, atime, dur, fare in MAJOR_CORRIDORS:
        orig_slug = orig.lower().replace(" ", "_")
        dest_slug = dest.lower().replace(" ", "_")
        orig_node = f"node_{orig.upper()}"
        dest_node = f"node_{dest.upper()}"

        schedules.append({
            "schedule_id": f"sch_{orig_slug}_{dest_slug}_{mode.lower()}_{sched_id_counter:03d}",
            "admin_id": "usr_02",
            "source_node_id": orig_node,
            "dest_node_id": dest_node,
            "origin_city": orig,
            "dest_city": dest,
            "transport_mode": mode,
            "provider": f"{op} - {sname}",
            "departure_time": f"2026-10-26T{dtime}:00",
            "arrival_time": f"2026-10-26T{atime}:00" if atime > dtime else f"2026-10-27T{atime}:00",
            "duration_minutes": dur,
            "base_cost": float(fare),
            "comfort_score": 9.2 if mode in ["FLIGHT", "CAB"] else 8.5,
            "reliability_score": 9.4,
            "data_state": "DEMO_SEED",
            "price_state": "DEMO_ESTIMATE"
        })
        sched_id_counter += 1

        # Also add return schedule
        schedules.append({
            "schedule_id": f"sch_{dest_slug}_{orig_slug}_{mode.lower()}_{sched_id_counter:03d}",
            "admin_id": "usr_02",
            "source_node_id": dest_node,
            "dest_node_id": orig_node,
            "origin_city": dest,
            "dest_city": orig,
            "transport_mode": mode,
            "provider": f"{op} - {sname} (Return)",
            "departure_time": f"2026-11-01T{dtime}:00",
            "arrival_time": f"2026-11-01T{atime}:00" if atime > dtime else f"2026-11-02T{atime}:00",
            "duration_minutes": dur,
            "base_cost": float(fare),
            "comfort_score": 9.2 if mode in ["FLIGHT", "CAB"] else 8.5,
            "reliability_score": 9.4,
            "data_state": "DEMO_SEED",
            "price_state": "DEMO_ESTIMATE"
        })
        sched_id_counter += 1

        # Evening / Alternate frequency
        d_hour = (int(dtime.split(":")[0]) + 10) % 24
        d_min = dtime.split(":")[1]
        ev_dtime = f"{d_hour:02d}:{d_min}"
        a_hour = (int(atime.split(":")[0]) + 10) % 24
        a_min = atime.split(":")[1]
        ev_atime = f"{a_hour:02d}:{a_min}"

        schedules.append({
            "schedule_id": f"sch_{orig_slug}_{dest_slug}_{mode.lower()}_ev_{sched_id_counter:03d}",
            "admin_id": "usr_02",
            "source_node_id": orig_node,
            "dest_node_id": dest_node,
            "origin_city": orig,
            "dest_city": dest,
            "transport_mode": mode,
            "provider": f"{op} - Night/Evening Service",
            "departure_time": f"2026-10-26T{ev_dtime}:00",
            "arrival_time": f"2026-10-26T{ev_atime}:00" if ev_atime > ev_dtime else f"2026-10-27T{ev_atime}:00",
            "duration_minutes": dur,
            "base_cost": float(fare * 1.05),
            "comfort_score": 9.0,
            "reliability_score": 9.3,
            "data_state": "DEMO_SEED",
            "price_state": "DEMO_ESTIMATE"
        })
        sched_id_counter += 1

        schedules.append({
            "schedule_id": f"sch_{dest_slug}_{orig_slug}_{mode.lower()}_ev_{sched_id_counter:03d}",
            "admin_id": "usr_02",
            "source_node_id": dest_node,
            "dest_node_id": orig_node,
            "origin_city": dest,
            "dest_city": orig,
            "transport_mode": mode,
            "provider": f"{op} - Night/Evening Service (Return)",
            "departure_time": f"2026-11-01T{ev_dtime}:00",
            "arrival_time": f"2026-11-01T{ev_atime}:00" if ev_atime > ev_dtime else f"2026-11-02T{ev_atime}:00",
            "duration_minutes": dur,
            "base_cost": float(fare * 1.05),
            "comfort_score": 9.0,
            "reliability_score": 9.3,
            "data_state": "DEMO_SEED",
            "price_state": "DEMO_ESTIMATE"
        })
        sched_id_counter += 1

    # Generate 32 Travel Stories and Guides
    STORIES_DATA = [
        ("The Complete Sangli to Manali Expedition: 6 Days Under Rs.25,000", "sangli-to-manali-budget-guide", "Manali", "Budget Travel", "How to travel from western Maharashtra all the way to Himalayan pine valleys using budget multi-modal connections.", "Ananya Sharma", "7 min read", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop"),
        ("Monsoon Magic in Goa: Hidden Waterfalls & Empty Beaches", "monsoon-goa-hidden-waterfalls", "Goa", "Nature", "Forget peak season crowds. Discover lush Dudhsagar treks, spice plantations, and quiet South Goa coves.", "Rohan Deshmukh", "5 min read", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop"),
        ("48 Hours in Old Manali: Bohemian Cafes, Siddu & River Trails", "48-hours-old-manali-guide", "Manali", "Guides", "A slow-paced weekend guide through Manu Temple cobblestones, live acoustic cafes, and riverside camps.", "Pooja Hegde", "6 min read", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"),
        ("Royal Rajasthan on a Shoestring: Jaipur, Jodhpur & Jaisalmer", "royal-rajasthan-budget-circuit", "Jaipur", "Budget Travel", "Step into grand palaces, camel sunset dunes, and blue Brahmin quarters without breaking the bank.", "Vikramaditya Rathore", "8 min read", "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1200&auto=format&fit=crop"),
        ("The Culinary Soul of Amritsar: Beyond the Golden Temple", "amritsar-food-trail-guide", "Amritsar", "Food", "Kulcha junctions, century-old lassi bars, and midnight langar service that touches the soul.", "Gurpreet Singh", "5 min read", "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=1200&auto=format&fit=crop"),
        ("Bicycle Diaries in Hampi: Navigating an Ancient Empire", "hampi-boulder-ruins-cycling", "Hampi", "Adventure", "Pedaling past towering Vijayanagara stone chariots, sunset boulders, and quiet Tungabhadra reeds.", "Meera Sen", "6 min read", "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop"),
        ("A Backwater Journey Through Alleppey & Munnar Hills", "kerala-backwaters-munnar-tea-trail", "Munnar", "Romantic", "From emerald tea plantations 6,000 feet above sea level to drifting on peaceful palm-fringed houseboats.", "Kavita Menon", "7 min read", "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop"),
        ("Dawn Boat Rides on the Ganges: A Spiritual Guide to Varanasi", "varanasi-spiritual-ghat-guide", "Varanasi", "Culture", "Watching the sun rise over ancient sandstone ghats, morning chants, and evening Ganga aarti flame dances.", "Acharya Devrat", "6 min read", "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop"),
        ("High Passes of Ladakh: Conquering Khardung La & Pangong Tso", "leh-ladakh-high-passes-guide", "Leh", "Adventure", "A complete survival and itinerary blueprint for navigating dramatic moonscapes and turquoise high-altitude lakes.", "Tenzing Norbu", "9 min read", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"),
        ("Weekend Escape: Pune to Mahabaleshwar & Panchgani", "pune-to-mahabaleshwar-weekend", "Mahabaleshwar", "Weekend Trips", "Beat the city heat with fresh strawberries, Arthur's Seat cliff views, and cozy colonial bungalows.", "Snehal Kulkarni", "4 min read", "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop"),
        ("French Quarter Strolls & Beach Sunsets in Pondicherry", "pondicherry-french-quarter-guide", "Pondicherry", "Culture", "Yellow mustard villas, bicycles with woven baskets, Tamil quarter filter coffee, and Promenade sea breezes.", "Arun Kumar", "5 min read", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"),
        ("The Tea Plucker's Trail: Darjeeling Beyond the Toy Train", "darjeeling-tea-estate-trail", "Darjeeling", "Nature", "Waking up to snow peaks of Kanchenjunga, tasting First Flush teas, and staying at boutique planter bungalows.", "Pema Bhutia", "6 min read", "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop"),
        ("Rishikesh Adrenaline: River Rafting, Bungee & Cliff Jumping", "rishikesh-adventure-sports-guide", "Rishikesh", "Adventure", "Navigating the thrilling rapids of the holy Ganges with certified guides and setting up riverside camp.", "Aditya Rawat", "6 min read", "https://images.unsplash.com/photo-1596761226507-6f030f81d113?q=80&w=1200&auto=format&fit=crop"),
        ("Exploring Sangli: The Sacred River, Turmeric Mandis & Vineyards", "sangli-hidden-gem-maharashtra", "Sangli", "Guides", "Discovering the quiet charm of Sangli district, ancient temples, Krishna river wildlife, and grape orchards.", "Anubhav Patil", "5 min read", "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop"),
        ("Kolkata Street Food Odyssey: Puchka, Kathi Rolls & Mishti", "kolkata-street-food-trail", "Kolkata", "Food", "A deep culinary walk through New Market, College Street cafes, and century-old sweet shops.", "Debashis Roy", "5 min read", "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=1200&auto=format&fit=crop"),
        ("The Blue City Unveiled: Living Heritage Beneath Mehrangarh", "jodhpur-blue-city-heritage-walk", "Jodhpur", "Culture", "Wandering through the indigo lanes of Brahmpuri and watching the sunset cast golden light on the desert.", "Radhika Bhati", "5 min read", "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1200&auto=format&fit=crop"),
        ("Shimla in the Snow: A Winter Wonderland Walk Along The Ridge", "shimla-winter-snow-guide", "Shimla", "Romantic", "Victorian buildings blanketed in fresh white powder, hot cocoa on Mall Road, and ice skating under stars.", "Varun Thakur", "6 min read", "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1200&auto=format&fit=crop"),
        ("Wild Kaziranga: Elephant Safari & Tracking the Great Rhino", "kaziranga-wildlife-safari-guide", "Kaziranga", "Nature", "An early morning mist safari through the tall elephant grass of Assam's greatest wildlife sanctuary.", "Pranab Barua", "7 min read", "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?q=80&w=1200&auto=format&fit=crop"),
        ("Living Root Bridges & Cloud Trails: Trekking in Meghalaya", "meghalaya-living-root-bridges-trek", "Shillong", "Adventure", "Descending thousands of mossy stone steps to witness nature's marvel of bio-engineered living rubber tree bridges.", "Wanbha Marbaniang", "8 min read", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"),
        ("Kashmir Valley of Gold: Shikara Rides & Meadow Walks in Sonamarg", "kashmir-shikara-meadow-paradise", "Srinagar", "Romantic", "Floating gently on lotus-dotted waters and sipping saffron Kahwa while snow mountains mirror on the lake.", "Farooq Mir", "7 min read", "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1200&auto=format&fit=crop"),
        ("Coorg Coffee Odyssey: Farmstays & Kodava Pork Pandi Curry", "coorg-coffee-plantation-homestay", "Coorg", "Food", "Waking up to the aroma of roasting Arabica beans, spice tours, and traditional fire-cooked Kodava feasts.", "Bopanna Cariappa", "6 min read", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"),
        ("Temples of the Cholas & Pandyas: A Grand Tamil Heritage Circuit", "tamil-nadu-temple-heritage-trail", "Madurai", "Heritage", "Gopurams soaring into azure skies, musical stone pillars, and millennia of unbroken Dravidian devotion.", "Senthil Nathan", "8 min read", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop"),
        ("Varkala Cliffside Living: Yoga, Ocean Swells & Red Rocks", "varkala-cliff-beach-living", "Varkala", "Relaxed", "Perched high above crashing turquoise waves on India's most dramatic geological beach cliff.", "Aisha Varma", "5 min read", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"),
        ("The Nawabi Dastarkhwan: A Gourmet Walk Through Old Lucknow", "lucknow-nawabi-kebab-food-walk", "Lucknow", "Food", "Galouti kebabs melting on the tongue, sheermal breads, and the timeless tehzeeb of Awadh.", "Tariq Farooqui", "6 min read", "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"),
        ("Taj Mahal at First Light: Photography & History Without Crowds", "taj-mahal-sunrise-photography-guide", "Agra", "Guides", "Exact timings, secret Yamuna viewpoint boats, and architectural secrets of the world's greatest monument.", "Nikhil Kapoor", "5 min read", "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop"),
        ("Chhatrapati Sambhajinagar: Marvels of Ajanta & Ellora Caves", "ajanta-ellora-caves-exploration-guide", "Aurangabad", "Heritage", "Standing inside Kailasa Temple, the world's largest monolithic rock excavation carved out of a single cliff.", "Dr. Suniti Joshi", "7 min read", "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"),
        ("Gokarna Beach Trek: Kudle to Half Moon & Paradise Shores", "gokarna-beach-trekking-guide", "Gokarna", "Adventure", "Hopping over rocky seaside promontories to discover quiet coves where the Western Ghats meet the sea.", "Deepak Bhat", "5 min read", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop"),
        ("Sikkim's Sacred Peaks: Monasteries & Glacial Lakes of Gangtok", "gangtok-sikkim-monastery-lake-trail", "Gangtok", "Nature", "Exploring Rumtek Monastery, frozen Tsomgo Lake, and the majestic borders of eastern Himalayas.", "Sonam Lhamo", "7 min read", "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1200&auto=format&fit=crop"),
        ("Udaipur from the Water: Lake Pichola Sunset Palaces & Havelis", "udaipur-lake-pichola-romantic-guide", "Udaipur", "Romantic", "Floating past Bagore Ki Haveli and the iconic Lake Palace as dusk paints the Aravali hills purple.", "Yashwardhan Singh", "5 min read", "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop"),
        ("The Cleanest City in India: Why Indore is a Street Food Paradise", "indore-sarafa-bazaar-street-food", "Indore", "Food", "Jewelry market by day, bustling street banquet by midnight serving bhutte ka kees and garadu.", "Mayank Agrawal", "5 min read", "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop"),
        ("Kodaikanal Pine Forests & Pillar Rocks: A Southern Highland Escape", "kodaikanal-pine-forest-trails", "Kodaikanal", "Nature", "Cycling around Kodai lake, morning mist rolling over Dolphin's Nose, and homemade mountain chocolates.", "Priya Ramanathan", "6 min read", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"),
        ("Monolithic Marvels of Khajuraho: Geometry, Devotion & Art", "khajuraho-temples-architecture-guide", "Khajuraho", "Culture", "Deconstructing the intricate sandstone carvings of Chandela kings that celebrate life, love, and divinity.", "Prof. Harish Tiwari", "7 min read", "https://images.unsplash.com/photo-1600100397608-f010f4439c2e?q=80&w=1200&auto=format&fit=crop"),
    ]

    stories = []
    for sidx, (stitle, sslug, sdest, scat, ssum, sauthor, stime, scover) in enumerate(STORIES_DATA, start=1):
        stories.append({
            "id": f"story_{sidx:02d}",
            "slug": sslug,
            "title": stitle,
            "destination": sdest,
            "category": scat,
            "summary": ssum,
            "author": sauthor,
            "read_time": stime,
            "published_date": "October 2026",
            "cover_image": scover,
            "body": f"""
# {stitle}

*{ssum}*

By **{sauthor}** • {stime} • Published in NAVIX Travel Dispatch

---

### An Unforgettable Indian Expedition
Traveling through {sdest} offers one of the most rewarding journeys in modern India. Whether you are starting from a major metropolis or a Tier-2 cultural hub, the transition from urban bustle to serene landscapes is profound.

### Practical Budget Optimization
With NAVIX's algorithmic whole-trip budgeting, you can experience {sdest} comfortably across transit, lodging, food, and sightseeing without unexpected shortfalls:
- **Transport**: Opt for verified overnight Express trains or reliable AC Volvo connections to save on hotel nights.
- **Stay**: Curated heritage homestays and boutique backpacker hostels provide authentic local connection at a fraction of luxury resort prices.
- **Food**: Do not miss iconic local street dishes and authentic family-run eateries for unforgettable flavours.

### Curated Itinerary Highlights
1. **Morning**: Experience sunrise at the iconic viewpoints before day crowds arrive.
2. **Afternoon**: Explore architectural heritage, local museums, and shaded gardens.
3. **Evening**: Savor hot chai and regional delicacies as dusk settles over the valleys.

### Final Travel Tips
Always allow a small contingency buffer in your daily budget. Respect local customs, dress appropriately at sacred sites, and travel with an open mind.
            """.strip(),
            "data_state": "DEMO_SEED"
        })

    # Save to JSON files
    with open(os.path.join(out_dir, "destinations.json"), "w", encoding="utf-8") as f:
        json.dump(destinations, f, indent=2, ensure_ascii=False)
    with open(os.path.join(out_dir, "attractions.json"), "w", encoding="utf-8") as f:
        json.dump(attractions, f, indent=2, ensure_ascii=False)
    with open(os.path.join(out_dir, "food.json"), "w", encoding="utf-8") as f:
        json.dump(foods, f, indent=2, ensure_ascii=False)
    with open(os.path.join(out_dir, "hotels.json"), "w", encoding="utf-8") as f:
        json.dump(hotels, f, indent=2, ensure_ascii=False)
    with open(os.path.join(out_dir, "transport_network.json"), "w", encoding="utf-8") as f:
        json.dump({"nodes": nodes, "schedules": schedules}, f, indent=2, ensure_ascii=False)
    with open(os.path.join(out_dir, "stories.json"), "w", encoding="utf-8") as f:
        json.dump(stories, f, indent=2, ensure_ascii=False)

    print(f"Generated successfully:")
    print(f"  Destinations: {len(destinations)}")
    print(f"  Attractions:  {len(attractions)}")
    print(f"  Food places:  {len(foods)}")
    print(f"  Hotels/Stays: {len(hotels)}")
    print(f"  Transit Nodes:{len(nodes)}")
    print(f"  Transit Sched:{len(schedules)}")
    print(f"  Stories:      {len(stories)}")

if __name__ == "__main__":
    generate_catalog()
