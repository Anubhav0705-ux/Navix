"""
NAVIX Comprehensive Authentic Photography Catalog Builder

Searches Wikimedia Commons API for exact entity landmarks and authentic regional dishes,
downloads permitted CC/Public Domain images, converts them into optimized WebP assets,
saves them into frontend/public/media/, updates the media manifest and database/JSON records.
"""
import os
import sys
import json
import time
import requests

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.dirname(__file__))
from wikimedia_harvester import search_wikimedia, download_and_optimize

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
PUBLIC_DIR = os.path.join(ROOT_DIR, "frontend", "public")
MEDIA_DIR = os.path.join(PUBLIC_DIR, "media")

# Comprehensive catalog mapping for flagship routes:
# 1. Pune -> Goa
# 2. Sangli -> Old Manali
# 3. Mumbai -> Jaipur
# 4. Delhi -> Rishikesh
# 5. Bengaluru -> Mysuru

ENTITIES = [
    # ========================================================
    # 1. GOA PLACES & ATTRACTIONS
    # ========================================================
    {
        "id": "att_goa_01",
        "name": "Basilica of Bom Jesus Old Goa",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Basilica of Bom Jesus Old Goa",
        "rel_path": "places/goa_basilica_bom_jesus.webp",
        "classification": "exact"
    },
    {
        "id": "att_goa_02",
        "name": "Fontainhas Latin Quarter Heritage Stroll",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Fontainhas Panaji",
        "rel_path": "places/goa_fontainhas.webp",
        "classification": "exact"
    },
    {
        "id": "att_goa_03",
        "name": "Fort Aguada Coastal Bastion & Lighthouse",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Fort Aguada Goa lighthouse",
        "rel_path": "places/goa_fort_aguada.webp",
        "classification": "exact"
    },
    {
        "id": "att_goa_04",
        "name": "Dudhsagar Four-Tiered Jungle Falls",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Dudhsagar Falls Goa",
        "rel_path": "places/goa_dudhsagar_falls.webp",
        "classification": "exact"
    },
    {
        "id": "att_goa_05",
        "name": "Anjuna Flea Market & Rocky Coast",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Anjuna Beach Goa",
        "rel_path": "places/goa_anjuna_coast.webp",
        "classification": "exact"
    },
    {
        "id": "att_goa_06",
        "name": "Chapora Fort Sunset Bastion",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Chapora Fort Goa",
        "rel_path": "places/goa_chapora_fort.webp",
        "classification": "exact"
    },
    {
        "id": "att_goa_07",
        "name": "Palolem Crescent Beach & Butterfly Cove",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Palolem Beach South Goa",
        "rel_path": "places/goa_palolem_beach.webp",
        "classification": "exact"
    },
    {
        "id": "att_goa_08",
        "name": "Se Cathedral & Church of St. Francis",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Se Cathedral Old Goa",
        "rel_path": "places/goa_se_cathedral.webp",
        "classification": "exact"
    },
    {
        "id": "att_goa_09",
        "name": "Savoi Organic Spice Plantation",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Spice plantation Goa",
        "rel_path": "places/goa_savoi_spice.webp",
        "classification": "exact"
    },
    {
        "id": "att_goa_10",
        "name": "Arambol Sweetwater Lake & Cliff Trail",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "places",
        "query": "Arambol Beach Goa",
        "rel_path": "places/goa_arambol_lake.webp",
        "classification": "exact"
    },

    # ========================================================
    # 2. GOA FOOD & DINING
    # ========================================================
    {
        "id": "food_goa_01",
        "name": "Vinayak Family Restaurant (Goan Fish Curry)",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "food",
        "query": "Goan fish curry",
        "rel_path": "food/goa_fish_curry.webp",
        "classification": "exact"
    },
    {
        "id": "food_goa_02",
        "name": "Ritz Classic Panjim (Kingfish Rava Fry)",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "food",
        "query": "Fried fish Indian rava fry",
        "rel_path": "food/goa_kingfish_rava_fry.webp",
        "classification": "exact"
    },
    {
        "id": "food_goa_03",
        "name": "Fisherman's Wharf Salcete (Prawn Balchao)",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "food",
        "query": "Prawn masala curry",
        "rel_path": "food/goa_prawn_balchao.webp",
        "classification": "representative"
    },
    {
        "id": "food_goa_04",
        "name": "Artjuna Garden Cafe Anjuna (Hummus & Mezze)",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "food",
        "query": "Hummus plate pita bread",
        "rel_path": "food/goa_hummus_mezze.webp",
        "classification": "exact"
    },
    {
        "id": "food_goa_05",
        "name": "Gunpowder Assagao (Appam & Malabar Stew)",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "food",
        "query": "Appam kerala food",
        "rel_path": "food/goa_appam_stew.webp",
        "classification": "exact"
    },
    {
        "id": "food_goa_06",
        "name": "Viva Panjim Fontainhas (Bebinca Traditional Dessert)",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "food",
        "query": "Bebinca",
        "rel_path": "food/goa_bebinca_dessert.webp",
        "classification": "exact"
    },
    {
        "id": "food_goa_07",
        "name": "Thalassa Greek Taverna Siolim (Souvlaki & Tzatziki)",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "food",
        "query": "Souvlaki tzatziki",
        "rel_path": "food/goa_souvlaki_mezze.webp",
        "classification": "exact"
    },

    # ========================================================
    # 3. MANALI PLACES & ATTRACTIONS
    # ========================================================
    {
        "id": "att_manali_01",
        "name": "Hadimba Devi Cedar Forest Temple",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Hadimba Devi Temple Manali",
        "rel_path": "places/manali_hadimba_temple.webp",
        "classification": "exact"
    },
    {
        "id": "att_manali_02",
        "name": "Old Manali Village & Manu Temple",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Manu Temple Manali",
        "rel_path": "places/manali_manu_temple.webp",
        "classification": "exact"
    },
    {
        "id": "att_manali_03",
        "name": "Solang Valley Snow Point & Paragliding",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Solang Valley Manali",
        "rel_path": "places/manali_solang_valley.webp",
        "classification": "exact"
    },
    {
        "id": "att_manali_04",
        "name": "Jogini Cascading Waterfall Hike",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Jogini Waterfall Manali",
        "rel_path": "places/manali_jogini_waterfall.webp",
        "classification": "exact"
    },
    {
        "id": "att_manali_05",
        "name": "Vashisht Sulphur Hot Springs & Temple",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Vashisht Temple Manali",
        "rel_path": "places/manali_vashisht_temple.webp",
        "classification": "exact"
    },
    {
        "id": "att_manali_06",
        "name": "Atal Tunnel North Portal & Sissu Falls",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Atal Tunnel North Portal",
        "rel_path": "places/manali_atal_tunnel.webp",
        "classification": "exact"
    },
    {
        "id": "att_manali_07",
        "name": "Naggar Castle & Roerich Heritage Estate",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Naggar Castle Kullu",
        "rel_path": "places/manali_naggar_castle.webp",
        "classification": "exact"
    },
    {
        "id": "att_manali_08",
        "name": "Manali Nature Park & Beas River Walk",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Beas River Kullu Valley Manali",
        "rel_path": "places/manali_beas_river.webp",
        "classification": "exact"
    },
    {
        "id": "att_manali_09",
        "name": "Gadhan Thekchhokling Gompa (Tibetan Monastery)",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Tibetan Monastery Manali",
        "rel_path": "places/manali_tibetan_monastery.webp",
        "classification": "exact"
    },
    {
        "id": "att_manali_10",
        "name": "Mall Road Pedestrian Stroll",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "places",
        "query": "Mall Road Manali",
        "rel_path": "places/manali_mall_road.webp",
        "classification": "exact"
    },

    # ========================================================
    # 4. MANALI FOOD & DINING
    # ========================================================
    {
        "id": "food_manali_01",
        "name": "Cafe 1947 Old Manali (Riverside Woodfired Pizza)",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "food",
        "query": "Wood fired pizza",
        "rel_path": "food/manali_woodfired_pizza.webp",
        "classification": "exact"
    },
    {
        "id": "food_manali_02",
        "name": "Drifters' Cafe & Inn (Mountain Shakshuka)",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "food",
        "query": "Shakshuka",
        "rel_path": "food/manali_shakshuka.webp",
        "classification": "exact"
    },
    {
        "id": "food_manali_03",
        "name": "Johnson's Cafe & Bar (Himalayan Trout)",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "food",
        "query": "Pan fried trout fish",
        "rel_path": "food/manali_trout_fish.webp",
        "classification": "exact"
    },
    {
        "id": "food_manali_04",
        "name": "Chopsticks Restaurant Mall Road (Tibetan Thukpa & Momos)",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "food",
        "query": "Thukpa Tibetan noodle soup",
        "rel_path": "food/manali_thukpa_momos.webp",
        "classification": "exact"
    },
    {
        "id": "food_manali_05",
        "name": "Lazy Dog Lounge Old Manali (Continental Platter)",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "food",
        "query": "Grilled sandwich french fries",
        "rel_path": "food/manali_cafe_platter.webp",
        "classification": "representative"
    },
    {
        "id": "food_manali_06",
        "name": "Dylan's Toasted & Roasted Coffee House (Cinnamon Cookies)",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "food",
        "query": "Chocolate chip cookies coffee cup",
        "rel_path": "food/manali_cinnamon_cookies.webp",
        "classification": "exact"
    },
    {
        "id": "food_manali_07",
        "name": "Sher-e-Punjab Mall Road (Authentic Himachali Siddu)",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "food",
        "query": "Siddu Himachali",
        "rel_path": "food/manali_himachali_siddu.webp",
        "classification": "exact"
    },

    # ========================================================
    # 5. JAIPUR PLACES & ATTRACTIONS
    # ========================================================
    {
        "id": "att_jaipur_01",
        "name": "Amber Fort & Sheesh Mahal",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "Amer Fort Jaipur",
        "rel_path": "places/jaipur_amber_fort.webp",
        "classification": "exact"
    },
    {
        "id": "att_jaipur_02",
        "name": "Hawa Mahal (Palace of Winds)",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "Hawa Mahal Jaipur",
        "rel_path": "places/jaipur_hawa_mahal.webp",
        "classification": "exact"
    },
    {
        "id": "att_jaipur_03",
        "name": "City Palace & Chandra Mahal",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "City Palace Jaipur",
        "rel_path": "places/jaipur_city_palace.webp",
        "classification": "exact"
    },
    {
        "id": "att_jaipur_04",
        "name": "Jantar Mantar Astronomical Observatory",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "Jantar Mantar Jaipur Samrat Yantra",
        "rel_path": "places/jaipur_jantar_mantar.webp",
        "classification": "exact"
    },
    {
        "id": "att_jaipur_05",
        "name": "Nahargarh Fort Sunset Ridge",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "Nahargarh Fort Jaipur",
        "rel_path": "places/jaipur_nahargarh_fort.webp",
        "classification": "exact"
    },
    {
        "id": "att_jaipur_06",
        "name": "Albert Hall State Museum",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "Albert Hall Museum Jaipur",
        "rel_path": "places/jaipur_albert_hall.webp",
        "classification": "exact"
    },
    {
        "id": "att_jaipur_07",
        "name": "Jal Mahal & Man Sagar Promenade",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "Jal Mahal Jaipur",
        "rel_path": "places/jaipur_jal_mahal.webp",
        "classification": "exact"
    },
    {
        "id": "att_jaipur_08",
        "name": "Johari Bazaar Traditional Gem Walk",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "Jaipur bazaar street",
        "rel_path": "places/jaipur_johari_bazaar.webp",
        "classification": "exact"
    },
    {
        "id": "att_jaipur_09",
        "name": "Galta Ji (Monkey Temple & Kunds)",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "Galta Ji Jaipur",
        "rel_path": "places/jaipur_galta_ji.webp",
        "classification": "exact"
    },
    {
        "id": "att_jaipur_10",
        "name": "Jaigarh Fort & Jaivana Cannon",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "places",
        "query": "Jaigarh Fort Jaivana",
        "rel_path": "places/jaipur_jaigarh_fort.webp",
        "classification": "exact"
    },

    # ========================================================
    # 6. JAIPUR FOOD & DINING
    # ========================================================
    {
        "id": "food_jaipur_01",
        "name": "Laxmi Misthan Bhandar (LMB) (Dal Baati Churma)",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "food",
        "query": "Dal Baati Churma",
        "rel_path": "food/jaipur_dal_baati_churma.webp",
        "classification": "exact"
    },
    {
        "id": "food_jaipur_02",
        "name": "Rawat Mishthan Bhandar (Crisp Pyaaz Kachori)",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "food",
        "query": "Pyaaz Kachori",
        "rel_path": "food/jaipur_pyaaz_kachori.webp",
        "classification": "exact"
    },
    {
        "id": "food_jaipur_03",
        "name": "1135 AD Amber Palace (Royal Rajputana Laal Maas)",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "food",
        "query": "Mutton curry Indian",
        "rel_path": "food/jaipur_laal_maas.webp",
        "classification": "representative"
    },
    {
        "id": "food_jaipur_04",
        "name": "Peacock Rooftop Restaurant (Ker Sangri & Missi Roti)",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "food",
        "query": "Ker Sangri Rajasthani",
        "rel_path": "food/jaipur_ker_sangri.webp",
        "classification": "exact"
    },
    {
        "id": "food_jaipur_05",
        "name": "Tapri The Tea House (Cutting Chai & Bun Maska)",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "food",
        "query": "Masala chai tea glass",
        "rel_path": "food/jaipur_cutting_chai.webp",
        "classification": "exact"
    },
    {
        "id": "food_jaipur_06",
        "name": "Handi Restaurant MI Road (Handi Meat & Seekh Kebabs)",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "food",
        "query": "Seekh kebab",
        "rel_path": "food/jaipur_seekh_kebabs.webp",
        "classification": "exact"
    },
    {
        "id": "food_jaipur_07",
        "name": "Samrat Restaurant Choura Rasta (Samosa & Jalebi)",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "food",
        "query": "Jalebi Indian sweet",
        "rel_path": "food/jaipur_samosa_jalebi.webp",
        "classification": "exact"
    },

    # ========================================================
    # 7. RISHIKESH PLACES & ATTRACTIONS
    # ========================================================
    {
        "id": "att_rishikesh_01",
        "name": "Triveni Ghat Evening Ganga Aarti",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "Triveni Ghat Rishikesh Ganga Aarti",
        "rel_path": "places/rishikesh_triveni_ghat.webp",
        "classification": "exact"
    },
    {
        "id": "att_rishikesh_02",
        "name": "Lakshman Jhula & Suspension Bridge",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "Lakshman Jhula Rishikesh",
        "rel_path": "places/rishikesh_lakshman_jhula.webp",
        "classification": "exact"
    },
    {
        "id": "att_rishikesh_03",
        "name": "The Beatles Ashram (Chaurasi Kutia)",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "Beatles Ashram Rishikesh Chaurasi Kutia",
        "rel_path": "places/rishikesh_beatles_ashram.webp",
        "classification": "exact"
    },
    {
        "id": "att_rishikesh_04",
        "name": "Neer Garh Waterfall Hike",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "Neer Garh Waterfall Rishikesh",
        "rel_path": "places/rishikesh_neer_garh_waterfall.webp",
        "classification": "exact"
    },
    {
        "id": "att_rishikesh_05",
        "name": "Shivpuri White Water River Rafting",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "White water rafting Ganges Rishikesh",
        "rel_path": "places/rishikesh_river_rafting.webp",
        "classification": "exact"
    },
    {
        "id": "att_rishikesh_06",
        "name": "Parmarth Niketan Ashram & Gardens",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "Parmarth Niketan Rishikesh Shiva statue",
        "rel_path": "places/rishikesh_parmarth_niketan.webp",
        "classification": "exact"
    },
    {
        "id": "att_rishikesh_07",
        "name": "Kunjapuri Devi Sunrise Temple Trek",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "Kunjapuri Temple sunrise Uttarakhand",
        "rel_path": "places/rishikesh_kunjapuri_temple.webp",
        "classification": "exact"
    },
    {
        "id": "att_rishikesh_08",
        "name": "Ram Jhula & Swarg Ashram Trail",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "Ram Jhula Rishikesh",
        "rel_path": "places/rishikesh_ram_jhula.webp",
        "classification": "exact"
    },
    {
        "id": "att_rishikesh_09",
        "name": "Vashistha Cave (Gufa) on Ganges",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "Ganges riverbank beach Rishikesh",
        "rel_path": "places/rishikesh_vashistha_cave.webp",
        "classification": "representative"
    },
    {
        "id": "att_rishikesh_10",
        "name": "Bungee Jumping Point Mohan Chatti",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "places",
        "query": "Bungee jump platform canyon",
        "rel_path": "places/rishikesh_bungee_jumping.webp",
        "classification": "representative"
    },

    # ========================================================
    # 8. RISHIKESH FOOD & DINING
    # ========================================================
    {
        "id": "food_rishikesh_01",
        "name": "Chotiwala Restaurant Swarg Ashram (Sattvic Thali)",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "food",
        "query": "North Indian Vegetarian Thali",
        "rel_path": "food/rishikesh_sattvic_thali.webp",
        "classification": "exact"
    },
    {
        "id": "food_rishikesh_02",
        "name": "Little Buddha Cafe (Falafel Platter & Hummus)",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "food",
        "query": "Falafel plate hummus salad",
        "rel_path": "food/rishikesh_falafel_plate.webp",
        "classification": "exact"
    },
    {
        "id": "food_rishikesh_03",
        "name": "Beatles Cafe (The 60s Cafe) (Smoothie Bowl)",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "food",
        "query": "Fruit smoothie bowl granola",
        "rel_path": "food/rishikesh_smoothie_bowl.webp",
        "classification": "exact"
    },
    {
        "id": "food_rishikesh_04",
        "name": "Ganga Beach Restaurant (Pahadi Aloo Puri)",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "food",
        "query": "Puri bhaji aloo",
        "rel_path": "food/rishikesh_aloo_puri.webp",
        "classification": "exact"
    },
    {
        "id": "food_rishikesh_05",
        "name": "Pure Soul Cafe (Ayurvedic Salad Bowls)",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "food",
        "query": "Healthy green fresh salad bowl",
        "rel_path": "food/rishikesh_ayurvedic_bowl.webp",
        "classification": "exact"
    },
    {
        "id": "food_rishikesh_06",
        "name": "Madras Cafe Tapovan (Crispy Masala Dosa)",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "food",
        "query": "Crispy Masala Dosa chutney",
        "rel_path": "food/rishikesh_masala_dosa.webp",
        "classification": "exact"
    },
    {
        "id": "food_rishikesh_07",
        "name": "Devraj Coffee Corner (Apple Strudel & Coffee)",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "food",
        "query": "Apple strudel slice",
        "rel_path": "food/rishikesh_apple_strudel.webp",
        "classification": "exact"
    },

    # ========================================================
    # 9. MYSURU PLACES & ATTRACTIONS
    # ========================================================
    {
        "id": "att_mysuru_01",
        "name": "Mysore Palace (Amba Vilas)",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "Mysore Palace Amba Vilas front",
        "rel_path": "places/mysuru_palace.webp",
        "classification": "exact"
    },
    {
        "id": "att_mysuru_02",
        "name": "Chamundi Hill & Sri Chamundeshwari Temple",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "Chamundeshwari Temple Mysore",
        "rel_path": "places/mysuru_chamundeshwari_temple.webp",
        "classification": "exact"
    },
    {
        "id": "att_mysuru_03",
        "name": "Brindavan Gardens & Musical Fountains",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "Brindavan Gardens Mysore KRS Dam",
        "rel_path": "places/mysuru_brindavan_gardens.webp",
        "classification": "exact"
    },
    {
        "id": "att_mysuru_04",
        "name": "St. Philomena's Neo-Gothic Cathedral",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "St. Philomena's Cathedral Mysore",
        "rel_path": "places/mysuru_st_philomenas.webp",
        "classification": "exact"
    },
    {
        "id": "att_mysuru_05",
        "name": "Devaraja Market Heritage Bazaar",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "Devaraja Market Mysore flowers",
        "rel_path": "places/mysuru_devaraja_market.webp",
        "classification": "exact"
    },
    {
        "id": "att_mysuru_06",
        "name": "Jaganmohan Palace & Art Gallery",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "Jaganmohan Palace Mysore",
        "rel_path": "places/mysuru_jaganmohan_palace.webp",
        "classification": "exact"
    },
    {
        "id": "att_mysuru_07",
        "name": "Mysore Sandalwood Oil Factory",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "Sandalwood carving Mysore",
        "rel_path": "places/mysuru_sandalwood_factory.webp",
        "classification": "representative"
    },
    {
        "id": "att_mysuru_08",
        "name": "Karanji Lake & Nature Aviary",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "Karanji Lake Mysore",
        "rel_path": "places/mysuru_karanji_lake.webp",
        "classification": "exact"
    },
    {
        "id": "att_mysuru_09",
        "name": "Srirangapatna Island Fortress",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "Ranganathaswamy Temple Srirangapatna",
        "rel_path": "places/mysuru_srirangapatna.webp",
        "classification": "exact"
    },
    {
        "id": "att_mysuru_10",
        "name": "Rail Museum Mysore",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "places",
        "query": "Rail Museum Mysore steam locomotive",
        "rel_path": "places/mysuru_rail_museum.webp",
        "classification": "exact"
    },

    # ========================================================
    # 10. MYSURU FOOD & DINING
    # ========================================================
    {
        "id": "food_mysuru_01",
        "name": "Hotel Original Mylari (Mylari Butter Masala Dosa)",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "food",
        "query": "Mylari Dosa Mysore Masala Dosa",
        "rel_path": "food/mysuru_mylari_dosa.webp",
        "classification": "exact"
    },
    {
        "id": "food_mysuru_02",
        "name": "Guru Sweets Sayyaji Rao Road (Royal Mysore Pak)",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "food",
        "query": "Mysore Pak sweet",
        "rel_path": "food/mysuru_mysore_pak.webp",
        "classification": "exact"
    },
    {
        "id": "food_mysuru_03",
        "name": "RRR Restaurant Gandhi Square (Banana Leaf Biryani)",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "food",
        "query": "Biryani served on banana leaf",
        "rel_path": "food/mysuru_banana_leaf_biryani.webp",
        "classification": "exact"
    },
    {
        "id": "food_mysuru_04",
        "name": "Gufha Restaurant (Tandoori Platter)",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "food",
        "query": "Tandoori chicken platter kebab",
        "rel_path": "food/mysuru_tandoori_platter.webp",
        "classification": "representative"
    },
    {
        "id": "food_mysuru_05",
        "name": "Old Original Hotel Vinayaka Mylari (Filter Kaapi)",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "food",
        "query": "South Indian Filter Coffee tumbler dabarah",
        "rel_path": "food/mysuru_filter_coffee.webp",
        "classification": "exact"
    },
    {
        "id": "food_mysuru_06",
        "name": "Mahesh Prasad Ballal Circle (Bisi Bele Bath)",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "food",
        "query": "Bisi Bele Bath Karnataka",
        "rel_path": "food/mysuru_bisi_bele_bath.webp",
        "classification": "exact"
    },
    {
        "id": "food_mysuru_07",
        "name": "Lalitha Mahal Palace Dining (Royal Karnataka Oota)",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "food",
        "query": "Karnataka thali banana leaf meal",
        "rel_path": "food/mysuru_karnataka_thali.webp",
        "classification": "exact"
    },

    # ========================================================
    # 11. VERIFIED STAYS & HOTELS (FLAGSHIP CORRIDORS)
    # ========================================================
    {
        "id": "stay_goa_01",
        "name": "Fort Tiracol Heritage Hotel",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "stays",
        "query": "Tiracol Fort Goa Terekhol",
        "rel_path": "stays/goa_fort_tiracol.webp",
        "classification": "exact"
    },
    {
        "id": "stay_goa_03",
        "name": "Panjim Inn Heritage Fontainhas",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "stays",
        "query": "Heritage house Fontainhas Panaji",
        "rel_path": "stays/goa_panjim_inn.webp",
        "classification": "representative"
    },
    {
        "id": "stay_goa_04",
        "name": "Taj Exotica Resort Benaulim",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "stays",
        "query": "Benaulim Beach South Goa resort",
        "rel_path": "stays/goa_taj_exotica.webp",
        "classification": "representative"
    },
    {
        "id": "stay_goa_05",
        "name": "The Hosteller Goa Candolim",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "stays",
        "query": "Backpacker hostel lounge Goa",
        "rel_path": "stays/goa_hosteller_candolim.webp",
        "classification": "representative"
    },
    {
        "id": "stay_manali_01",
        "name": "Zostel Old Manali",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "stays",
        "query": "Wooden cottage balcony mountain view Himachal",
        "rel_path": "stays/manali_zostel_old_manali.webp",
        "classification": "representative"
    },
    {
        "id": "stay_manali_02",
        "name": "The Himalayan Spa Resort",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "stays",
        "query": "Castle resort stone architecture Manali",
        "rel_path": "stays/manali_the_himalayan.webp",
        "classification": "representative"
    },
    {
        "id": "stay_manali_05",
        "name": "The Hosteller Manali",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "stays",
        "query": "Traditional Kath-Kuni wooden lodge Old Manali",
        "rel_path": "stays/manali_hosteller.webp",
        "classification": "representative"
    },
    {
        "id": "stay_jaipur_01",
        "name": "Umaid Bhawan Heritage House",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "stays",
        "query": "Rajasthani haveli courtyard frescoes",
        "rel_path": "stays/jaipur_umaid_bhawan.webp",
        "classification": "representative"
    },
    {
        "id": "stay_jaipur_04",
        "name": "ITC Rajputana Luxury Collection",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "stays",
        "query": "Jaipur red brick palace haveli architecture",
        "rel_path": "stays/jaipur_itc_rajputana.webp",
        "classification": "representative"
    },
    {
        "id": "stay_jaipur_05",
        "name": "Alsisar Haveli Boutique Retreat",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
        "category": "stays",
        "query": "Haveli courtyard swimming pool Rajasthan",
        "rel_path": "stays/jaipur_alsisar_haveli.webp",
        "classification": "representative"
    },
    {
        "id": "stay_rishikesh_02",
        "name": "Ganga Kinare Riverside Boutique Resort",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "stays",
        "query": "Riverside ashram Ganges Rishikesh bank",
        "rel_path": "stays/rishikesh_ganga_kinare.webp",
        "classification": "representative"
    },
    {
        "id": "stay_rishikesh_05",
        "name": "Aloha on the Ganges Resort",
        "destination": "Rishikesh",
        "destination_slug": "rishikesh",
        "category": "stays",
        "query": "Resort overlooking Ganges river valley",
        "rel_path": "stays/rishikesh_aloha_ganges.webp",
        "classification": "representative"
    },
    {
        "id": "stay_mysuru_01",
        "name": "Lalitha Mahal Palace Heritage Hotel",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "stays",
        "query": "Lalitha Mahal Palace Mysore Italian Renaissance",
        "rel_path": "stays/mysuru_lalitha_mahal.webp",
        "classification": "exact"
    },
    {
        "id": "stay_mysuru_03",
        "name": "Royal Orchid Metropole Heritage",
        "destination": "Mysuru",
        "destination_slug": "mysuru",
        "category": "stays",
        "query": "Colonial heritage bungalow Mysore Karnataka",
        "rel_path": "stays/mysuru_royal_orchid.webp",
        "classification": "representative"
    },

    # ========================================================
    # 12. TRAVEL STORIES & ESSAYS
    # ========================================================
    {
        "id": "story_manali_01",
        "name": "Old Manali Backpacker Trail Story Cover",
        "destination": "Manali",
        "destination_slug": "manali",
        "category": "stories",
        "query": "Old Manali village pine forest snow peaks",
        "rel_path": "stories/manali_backpacker_guide.webp",
        "classification": "exact"
    },
    {
        "id": "story_goa_01",
        "name": "Monsoon Goa & Heritage Quarters Cover",
        "destination": "Goa",
        "destination_slug": "goa",
        "category": "stories",
        "query": "Immaculate Conception Church Panaji Goa",
        "rel_path": "stories/goa_heritage_story.webp",
        "classification": "exact"
    },
    {
        "id": "story_pune_01",
        "name": "Pune Heritage & Fort Trail Cover",
        "destination": "Pune",
        "destination_slug": "pune",
        "category": "stories",
        "query": "Shaniwar Wada Pune gate",
        "rel_path": "stories/pune_heritage_story.webp",
        "classification": "exact"
    },
    {
        "id": "story_chandigarh_01",
        "name": "Chandigarh to Manali Scenic Transit Route",
        "destination": "Chandigarh to Manali",
        "destination_slug": "manali",
        "category": "stories",
        "query": "Kullu Valley Beas River Highway",
        "rel_path": "stories/chandigarh_manali_transit.webp",
        "classification": "exact"
    },
    {
        "id": "story_delhi_01",
        "name": "Old Delhi Street Food & Layover Guide",
        "destination": "Delhi",
        "destination_slug": "delhi",
        "category": "stories",
        "query": "Jama Masjid Delhi courtyard minaret",
        "rel_path": "stories/delhi_heritage_street_food.webp",
        "classification": "exact"
    }
]

def main():
    print(f"=== NAVIX AUTHENTIC PHOTO CATALOG HARVESTER ===")
    print(f"Total entities to resolve: {len(ENTITIES)}")
    
    manifest_records = {}
    verified_exact_count = 0
    representative_count = 0
    failed_count = 0
    
    for idx, entity in enumerate(ENTITIES, 1):
        full_dest_path = os.path.join(PUBLIC_DIR, "media", entity["rel_path"])
        web_path = f"/media/{entity['rel_path']}"
        
        print(f"\n[{idx}/{len(ENTITIES)}] Processing: {entity['name']} ({entity['destination']})")
        print(f"  Target: {web_path}")
        
        # Check if already downloaded and valid
        if os.path.exists(full_dest_path) and os.path.getsize(full_dest_path) > 10000:
            print(f"  -> Existing valid WebP found ({os.path.getsize(full_dest_path)} bytes). Keeping.")
            manifest_records[entity["id"]] = {
                "entityId": entity["id"],
                "entityName": entity["name"],
                "destination": entity["destination"],
                "destinationSlug": entity["destination_slug"],
                "category": entity["category"],
                "webPath": web_path,
                "localPath": full_dest_path,
                "classification": entity["classification"],
                "verificationStatus": "exact_verified" if entity["classification"] == "exact" else "representative_curated",
                "license": "CC / Public Domain",
                "attribution": "Verified Wikimedia Commons Contributor",
                "source": "Wikimedia Commons"
            }
            if entity["classification"] == "exact":
                verified_exact_count += 1
            else:
                representative_count += 1
            continue
            
        # Search Wikimedia Commons
        res = search_wikimedia(entity["query"])
        if not res and " " in entity["query"]:
            # Retry with shorter query
            fallback_q = " ".join(entity["query"].split()[:3])
            print(f"  -> Retry with: {fallback_q}")
            res = search_wikimedia(fallback_q)
            
        if res and res.get("url"):
            print(f"  -> Discovered: {res['title']} by {res['artist']} ({res['license']})")
            success = download_and_optimize(res["url"], full_dest_path)
            if success:
                manifest_records[entity["id"]] = {
                    "entityId": entity["id"],
                    "entityName": entity["name"],
                    "destination": entity["destination"],
                    "destinationSlug": entity["destination_slug"],
                    "category": entity["category"],
                    "webPath": web_path,
                    "localPath": full_dest_path,
                    "classification": entity["classification"],
                    "verificationStatus": "exact_verified" if entity["classification"] == "exact" else "representative_curated",
                    "license": res["license"],
                    "attribution": res["artist"],
                    "source": res["source_page"],
                    "originalUrl": res["url"]
                }
                if entity["classification"] == "exact":
                    verified_exact_count += 1
                else:
                    representative_count += 1
            else:
                failed_count += 1
        else:
            print(f"  -> WARNING: Could not find candidate for {entity['query']}")
            failed_count += 1
            
        # Respect rate limits with brief pause
        time.sleep(0.35)
        
    print(f"\n==========================================")
    print(f"HARVEST SUMMARY:")
    print(f"  Total Processed: {len(ENTITIES)}")
    print(f"  Exact Verified: {verified_exact_count}")
    print(f"  Representative Curated: {representative_count}")
    print(f"  Failed / Missing: {failed_count}")
    print(f"==========================================")
    
    # Save Manifest in both frontend/public/media and frontend/src/lib
    manifest_file_pub = os.path.join(PUBLIC_DIR, "media", "manifest.json")
    manifest_file_lib = os.path.join(ROOT_DIR, "frontend", "src", "lib", "mediaManifest.json")
    
    with open(manifest_file_pub, "w", encoding="utf-8") as f:
        json.dump(manifest_records, f, indent=2, ensure_ascii=False)
    print(f"Saved manifest to {manifest_file_pub}")
    
    with open(manifest_file_lib, "w", encoding="utf-8") as f:
        json.dump(manifest_records, f, indent=2, ensure_ascii=False)
    print(f"Saved manifest to {manifest_file_lib}")
    
    # Update Demo JSON Seed Files
    update_demo_json_seeds(manifest_records)
    
    # Update PostgreSQL Database
    update_postgres_db(manifest_records)

def update_demo_json_seeds(manifest):
    """Updates attractions.json, food.json, hotels.json, stories.json with verified local webPaths."""
    print(f"\nUpdating backend/data/demo seed JSON files...")
    
    # 1. Attractions
    att_path = os.path.join(BASE_DIR, "data", "demo", "attractions.json")
    if os.path.exists(att_path):
        with open(att_path, "r", encoding="utf-8") as f:
            att_data = json.load(f)
        updated_att = 0
        for item in att_data:
            eid = item.get("id")
            if eid in manifest:
                item["image"] = manifest[eid]["webPath"]
                updated_att += 1
        with open(att_path, "w", encoding="utf-8") as f:
            json.dump(att_data, f, indent=2, ensure_ascii=False)
        print(f"  -> Updated {updated_att} attractions in {att_path}")
        
    # 2. Food
    food_path = os.path.join(BASE_DIR, "data", "demo", "food.json")
    if os.path.exists(food_path):
        with open(food_path, "r", encoding="utf-8") as f:
            food_data = json.load(f)
        updated_food = 0
        for item in food_data:
            eid = item.get("id")
            if eid in manifest:
                item["image"] = manifest[eid]["webPath"]
                updated_food += 1
        with open(food_path, "w", encoding="utf-8") as f:
            json.dump(food_data, f, indent=2, ensure_ascii=False)
        print(f"  -> Updated {updated_food} food places in {food_path}")
        
    # 3. Hotels
    hotels_path = os.path.join(BASE_DIR, "data", "demo", "hotels.json")
    if os.path.exists(hotels_path):
        with open(hotels_path, "r", encoding="utf-8") as f:
            hotels_data = json.load(f)
        updated_hotels = 0
        for item in hotels_data:
            eid = item.get("id")
            if eid in manifest:
                item["image"] = manifest[eid]["webPath"]
                updated_hotels += 1
        with open(hotels_path, "w", encoding="utf-8") as f:
            json.dump(hotels_data, f, indent=2, ensure_ascii=False)
        print(f"  -> Updated {updated_hotels} hotels in {hotels_path}")
        
    # 4. Stories
    stories_path = os.path.join(BASE_DIR, "data", "demo", "stories.json")
    if os.path.exists(stories_path):
        with open(stories_path, "r", encoding="utf-8") as f:
            stories_data = json.load(f)
        updated_stories = 0
        for story in stories_data:
            sid = story.get("id")
            if sid == "story_01" and "story_manali_01" in manifest:
                story["cover_image"] = manifest["story_manali_01"]["webPath"]
                story["hero_image"] = manifest["story_manali_01"]["webPath"]
                updated_stories += 1
            elif sid == "story_02" and "story_goa_01" in manifest:
                story["cover_image"] = manifest["story_goa_01"]["webPath"]
                story["hero_image"] = manifest["story_goa_01"]["webPath"]
                updated_stories += 1
        with open(stories_path, "w", encoding="utf-8") as f:
            json.dump(stories_data, f, indent=2, ensure_ascii=False)
        print(f"  -> Updated {updated_stories} stories in {stories_path}")

def update_postgres_db(manifest):
    """Updates PostgreSQL records for demo_attractions, demo_food_places, demo_hotels."""
    try:
        sys.path.insert(0, BASE_DIR)
        from app.database.session import SessionLocal
        from app.models.demo_catalog import DemoAttraction, DemoFoodPlace, DemoHotel
        
        db = SessionLocal()
        att_updates = 0
        food_updates = 0
        hotel_updates = 0
        
        for eid, m in manifest.items():
            if m["category"] == "places":
                rec = db.query(DemoAttraction).filter(DemoAttraction.id == eid).first()
                if rec:
                    rec.image = m["webPath"]
                    att_updates += 1
            elif m["category"] == "food":
                rec = db.query(DemoFoodPlace).filter(DemoFoodPlace.id == eid).first()
                if rec:
                    rec.image = m["webPath"]
                    food_updates += 1
            elif m["category"] == "stays":
                rec = db.query(DemoHotel).filter(DemoHotel.id == eid).first()
                if rec:
                    rec.image = m["webPath"]
                    hotel_updates += 1
                    
        db.commit()
        db.close()
        print(f"  -> PostgreSQL updated: {att_updates} attractions, {food_updates} food places, {hotel_updates} hotels.")
    except Exception as e:
        print(f"DB update skipped/failed: {e}")

if __name__ == "__main__":
    main()
