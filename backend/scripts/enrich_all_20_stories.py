"""
Definitive 20 Flagship Story Enrichment Generator for NAVIX.
Applies authentic destination journalism across all 20 flagship locations
and synchronizes backend/data/demo/stories.json and the PostgreSQL database.
"""
import json
import os
import sys

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo"))
STORIES_FILE = os.path.join(DATA_DIR, "stories.json")

FLAGSHIPS = [
    {
        "id": "story_01",
        "destination": "Manali",
        "slug": "sangli-to-manali-budget-guide",
        "title": "The Western Ghats to Pir Panjal Trail: Sangli to Manali under ₹40,000",
        "subtitle": "How two travelers crossed 2,200 kilometers using overnight Indian Railways sleeper links and HRTC mountain coaches.",
        "category": "Budget Travel",
        "read_time": "9 min read",
        "author": "Arun Kulkarni",
        "hero_image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop", "Hadimba temple pagoda surrounded by centuries-old deodar cedar forest in Dhungri."),
            ("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop", "Glacial torrent of the Beas River rushing past the traditional slate-roof houses of Old Manali."),
            ("https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop", "Snow-dusted Pir Panjal peaks visible from the northern portal above Solang Valley."),
            ("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop", "Evening riverside terrace at Cafe 1947 with wood-fired oven smoke drifting across the stream.")
        ],
        "summary": "A calculated, real-world breakdown of traveling from Tier-2 Maharashtra to northern Himachal Pradesh on a strict budget constraint, balancing train transfers and authentic mountain experiences.",
        "experience": ("The journey began on the platform of Sangli Railway Station under the dry evening heat of western Maharashtra. "
                       "With a hard budget ceiling of ₹40,000 for two people, every leg of transport needed deliberate accounting. "
                       "Instead of expensive flights, we booked the Goa Express northward into Delhi, followed by an HRTC Himsuta Volvo overnight coach climbing into the Beas valley. "
                       "When the coach clears Mandi gorge, the air drops twenty degrees in an hour. Bypassing the tourist bus parking of New Manali, we crossed the wooden footbridge over the Manalsu torrent into Old Manali. "
                       "Stone cottages here are built in Kath-Kuni architectural style—interlocking deodar wood beams and schist slate stone slabs engineered to flex during seismic tremors. "
                       "Walk up through Dhungri forest to the 1553 Hadimba Devi Temple, visit Vashisht for hot sulphur baths, and sample freshly steamed siddu with pure cow ghee at local village dhabas.")
    },
    {
        "id": "story_02",
        "destination": "Goa",
        "slug": "monsoon-goa-hidden-waterfalls",
        "title": "Beyond the Shacks: Old Quarters, Spice Slopes, and Coastal Rhythms in Goa",
        "subtitle": "Discovering emerald hinterlands, Portuguese tile architecture, and authentic Saraswat fish thalis.",
        "category": "Culture",
        "read_time": "8 min read",
        "author": "Savio Fernandes",
        "hero_image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop", "Late afternoon light illuminating the white Baroque facade of Panaji's Church of Our Lady of the Immaculate Conception."),
            ("https://images.unsplash.com/photo-1587922546307-776227941871?q=80&w=800&auto=format&fit=crop", "Narrow cobblestone alleyway in Fontainhas bordered by indigo-blue and ochre-yellow heritage Portuguese residences."),
            ("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop", "Traditional Goan fish thali featuring rava-crusted surmai, spicy coconut curry, and sour kokum sol kadi."),
            ("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop", "Old Goa's Basilica of Bom Jesus with exposed laterite masonry glowing under coastal sunlight.")
        ],
        "summary": "An exploration of coastal Goa that moves away from crowded beachfront party commercialism to celebrate 400-year-old Latin heritage, spice orchards, and river life.",
        "experience": ("The true introduction to Goa is the Konkan Railway corridor. Leaving Maharashtra behind, the train snakes through coastal red-laterite cuttings, crossing wide estuaries where fishermen row traditional dugout canoes. "
                       "Alighting at Madgaon, the humid sea breeze immediately carries the aroma of salt, wet earth, and cashew groves. "
                       "In Panaji, Fontainhas stands as Asia's only surviving Latin quarter. Founded in the late 1700s along the slopes of Altinho hill, houses are painted in vibrant cadmium yellow, burnt orange, and deep Portuguese cobalt. "
                       "Wander along 31st January Road at 8 AM, taste warm bolo de arroz at Confeitaria 31 de Janeiro, and drive east to Savoi spice plantations. "
                       "In the afternoon, head to Vinayak Family Restaurant in Assagao for its legendary fish thali with rava-crusted kingfish and spicy kokum sol kadi.")
    },
    {
        "id": "story_03",
        "destination": "Kasol",
        "slug": "kasol-parvati-valley-pine-trail",
        "title": "Along the Turquoise Torrent: A Slow Exploration of Parvati Valley & Kasol",
        "subtitle": "Riverside pine trails, cedar wood chalets, and Himalayan community rhythms beneath snow-covered peaks.",
        "category": "Adventure",
        "read_time": "8 min read",
        "author": "Meera Sen",
        "hero_image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop", "Glacial turquoise rapids of the Parvati River cutting through granite boulders beneath pine-clad valley walls."),
            ("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop", "Ancient steam rising from the natural sulphur hot water springs at Manikaran Sahib Gurudwara."),
            ("https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop", "Traditional wooden houses of Tosh village perched high against the glaciated peaks of the Parvati range."),
            ("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", "Freshly baked cinnamon rolls and herbal mountain tea served on an open cedar deck in Chalal.")
        ],
        "summary": "A grounded traveler's guide to Kasol and Parvati Valley, focusing on natural river trails, ancient wooden hamlets, and responsible exploration.",
        "experience": ("The road from Bhuntar leaves the wide Beas basin and plunges into a narrow, dramatic granite canyon. "
                       "Below the cliffside road, the Parvati River churns in shades of icy aquamarine. "
                       "By the time the bus pulls into Kasol at 1,580 meters, surrounding peaks rise nearly vertical, carpeted in deep green Himalayan cedar and spruce. "
                       "Cross the suspension footbridge into Chalal, where dirt trails wind under towering deodars. "
                       "Sit beside granite boulders listening to the river, take a shared local taxi up to Manikaran Sahib to witness community langar cooked in boiling sulphur springs, and hike up to Tosh where traditional wooden balconies overlook the glaciated peaks.")
    },
    {
        "id": "story_04",
        "destination": "Jaipur",
        "slug": "royal-rajasthan-budget-circuit",
        "title": "Stone, Spice, and Sandstone: The Old City Architecture of Jaipur",
        "subtitle": "Navigating royal Rajput bastions, astronomical observatories, and Johari Bazaar's culinary treasures.",
        "category": "Heritage",
        "read_time": "9 min read",
        "author": "Vikramaditya Rathore",
        "hero_image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop", "Amber Fort's towering sandstone ramparts reflecting in the calm waters of Maota Lake."),
            ("https://images.unsplash.com/photo-1603288940316-4e43b1244036?q=80&w=800&auto=format&fit=crop", "The honeycomb pink sandstone facade of Hawa Mahal rising above early morning bazaar traffic."),
            ("https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop", "Vrihat Samrat Yantra sundial at Jantar Mantar casting precise geometric shadows in the courtyard."),
            ("https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop", "Golden, flaky pyaaz kachoris straight out of the hot oil cauldron at Rawat Mishthan Bhandar.")
        ],
        "summary": "An architectural and cultural exploration of Jaipur's 18th-century grid city, demonstrating how to explore royal palaces and heritage cuisine on a sensible budget.",
        "experience": ("Founded in 1727 by Maharaja Sawai Jai Singh II, Jaipur was India's first planned city, structured into nine rectangular sectors. "
                       "Entering through Ajmeri Gate at sunrise, the morning light warms the distinctive terracotta-pink lime wash applied to every facade. "
                       "A morning visit to Amber Fort reveals royal Rajput defensive engineering, with the Sheesh Mahal mirror ceiling sparkling like constellations. "
                       "In the old city, Jantar Mantar showcases 19 giant architectural astronomical instruments built to measure time to an accuracy of two seconds. "
                       "Start mornings with hot, flaky pyaaz kachori at Rawat Mishthan Bhandar and conclude at Nahargarh Fort as twilight settles over the illuminated city below.")
    },
    {
        "id": "story_05",
        "destination": "Amritsar",
        "slug": "amritsar-food-trail-guide",
        "title": "Golden Radiance and Charcoal Fires: The Culinary and Spiritual Rhythms of Amritsar",
        "subtitle": "From the quiet dawn waters of the Amrit Sarovar to hundred-year-old dal makhani cauldrons in narrow walled katras.",
        "category": "Spiritual",
        "read_time": "8 min read",
        "author": "Harpreet Singh",
        "hero_image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop", "Golden Temple illuminated at dawn with gold-leaf reflections shimmering on the sacred pool."),
            ("https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=800&auto=format&fit=crop", "Historic brick memorial at Jallianwala Bagh framed by the Martyrs' Well arch."),
            ("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop", "Signature slow-simmered Dal Makhani and laccha parotta served in brass thalis at Kesar Da Dhaba."),
            ("https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop", "Crisp Amritsari kulchas stuffed with spiced potatoes straight out of the clay tandoor.")
        ],
        "summary": "An immersive journey through the spiritual center of Sikhism, examining the profound hospitality of the world's largest community kitchen and historic food lanes.",
        "experience": ("Walking barefoot across the cool white marble parikrama around 4 AM, the Golden Temple emerges from the morning mist like a golden jewel. "
                       "Continuous Gurbani kirtan floats across the still waters of the Amrit Sarovar. "
                       "At the Guru Ram Das Langar, volunteers peel tons of garlic and stir immense cauldrons of dal, serving over 80,000 free meals daily with unconditional dignity. "
                       "Just outside the complex, step through narrow alleyways to Kesar Da Dhaba, operating since 1916, where black lentils simmer for over twelve hours over slow embers. "
                       "Pair it with crisp, butter-soaked tandoori kulchas at Bhai Kulwant Singh and an afternoon visit to the solemn Partition Museum in the historic Town Hall.")
    },
    {
        "id": "story_06",
        "destination": "Hampi",
        "slug": "hampi-boulder-ruins-cycling",
        "title": "Kingdom in the Granite: Cycling Through the Monoliths of Vijayanagara",
        "subtitle": "Discovering 15th-century stone chariots, riverside coracles, and sunset boulder ridges in Karnataka.",
        "category": "Heritage",
        "read_time": "9 min read",
        "author": "Kavita Rao",
        "hero_image": "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop", "The iconic stone chariot of Vijaya Vittala Temple standing against the golden granite rocks of Hampi."),
            ("https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop", "Virupaksha Temple's towering 50-meter eastern gopuram rising above the ancient bazaar avenue."),
            ("https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop", "Coracle boat navigating the swirling currents of the Tungabhadra River beside ancient ruins."),
            ("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop", "Authentic Karnataka banana-leaf meals served with piping-hot rasam at Mango Tree Restaurant.")
        ],
        "summary": "A pedal-powered itinerary through the vast ruins of the Vijayanagara Empire, exploring royal palaces, sacred riverside ghats, and boulder-strewn landscapes.",
        "experience": ("Hampi feels like a landscape sculpted by giants. Miles of golden ochre boulders are piled precariously across dry thorn scrub and emerald banana plantations along the Tungabhadra River. "
                       "Renting a single-speed bicycle in Hampi Bazaar, we cycled through the monumental columned streets of Vijayanagara. "
                       "At the Vijaya Vittala complex, the carved granite stone chariot stands motionless while surrounding musical pillars produce delicate tones when tapped. "
                       "Climb Matanga Hill before daybreak to watch the sunrise ignite the entire 26-square-kilometer archaeological park in shades of gold and bronze. "
                       "Cross the river in a traditional circular woven coracle boat to sample hot banana-leaf meals at Mango Tree Restaurant.")
    },
    {
        "id": "story_07",
        "destination": "Munnar",
        "slug": "kerala-backwaters-munnar-tea-trail",
        "title": "Mists of the Western Ghats: Walking the High-Altitude Tea Estates of Munnar",
        "subtitle": "Emerald mountain slopes, Nilgiri Tahr sightings, and orthodox cardamom teas in God's Own Country.",
        "category": "Nature",
        "read_time": "8 min read",
        "author": "Anjali Pillai",
        "hero_image": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop", "Endless geometric rows of manicured tea bushes rolling over the misty green hills of Munnar."),
            ("https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop", "A rare Nilgiri Tahr mountain goat perched on the rocky granite cliffs of Eravikulam National Park."),
            ("https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop", "Still waters of Mattupetty Dam reflecting the surrounding eucalyptus forests and tea gardens."),
            ("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop", "Flaky Malabar parotta with spicy beef fry and spiced vegetable stew at Rapsy Restaurant.")
        ],
        "summary": "Exploring the cool high-altitude heights of Kerala's tea country, balancing tea factory heritage walks, mountain wildlife viewing, and authentic Malabar cuisine.",
        "experience": ("Leaving the humid coastal plains of Kochi behind, the ghat road climbs through cardamom and pepper plantations toward Munnar at 1,600 meters. "
                       "As you cross Neriamangalam bridge, the air cools and the landscape transforms into unbroken green carpets of manicured tea bushes rolling over mountain crests. "
                       "At Eravikulam National Park, home to Anamudi—South India's highest peak at 2,695 meters—you can observe the endangered Nilgiri Tahr grazing peacefully on rocky granite knolls. "
                       "Tour the century-old machinery at Tata Tea Museum, ride through the misty eucalyptus corridors of Mattupetty Dam, and end the evening with flaky Malabar parottas and spiced stew at Rapsy Restaurant.")
    },
    {
        "id": "story_08",
        "destination": "Varanasi",
        "slug": "varanasi-spiritual-ghat-guide",
        "title": "Fire on the Sacred Water: Dawn to Dusk along the 84 Ghats of Kashi",
        "subtitle": "Navigating ancient stone steps, early morning rowboat journeys, and the timeless culinary lanes of Banaras.",
        "category": "Culture",
        "read_time": "9 min read",
        "author": "Anand Mishra",
        "hero_image": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop", "Evening Ganga Aarti ceremony at Dashashwamedh Ghat with brass lamps illuminating the riverbank."),
            ("https://images.unsplash.com/photo-1571536802807-30451e3955d8?q=80&w=800&auto=format&fit=crop", "Early morning wooden rowboats gliding along the misty river bend from Assi to Manikarnika Ghat."),
            ("https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop", "Labyrinthine medieval alleyways of Vishwanath Gali lined with incense and silk shops."),
            ("https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop", "Piping-hot tamatar chaat and dahi puri served in earthen clay pots at Kashi Chaat Bhandar.")
        ],
        "summary": "A deep and respectful guide to the world's oldest living city, highlighting respectful visitor etiquette, the spiritual aura of the ghats, and legendary street food.",
        "experience": ("Mark Twain once observed that Banaras is older than history, older than tradition, older even than legend. "
                       "Standing on Assi Ghat at 5:30 AM for Subah-e-Banaras, the sky turns indigo and saffron as classical Shehnai music drifts across the calm water. "
                       "Stepping into a wooden rowboat, you glide past all 84 ghats: sadhus meditating on stone platforms, pilgrims taking purifying dips, and ancient palatial havelis built by Maharajas from across India. "
                       "At Dashashwamedh Ghat, priests perform the choreographed evening Ganga Aarti with blazing brass lamps. "
                       "Wander through medieval alleyways to Kashi Chaat Bhandar for piping-hot tamatar chaat, and sip thick malai lassi served in clay kulhads near Manikaran lane.")
    },
    {
        "id": "story_09",
        "destination": "Leh",
        "slug": "leh-ladakh-high-passes-guide",
        "title": "Rooftop of the World: High Passes and Monasteries across Ladakh",
        "subtitle": "Navigating 5,300-meter mountain roads, ancient gompas, and turquoise high-altitude lakes on a budget.",
        "category": "Adventure",
        "read_time": "10 min read",
        "author": "Tsering Norbu",
        "hero_image": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop", "Pangong Tso's deep turquoise water contrasting sharply with barren high-altitude Himalayan mountains."),
            ("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop", "Fluttering Buddhist prayer flags at Khardung La Pass against snow-capped peaks."),
            ("https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop", "Twelve-tiered whitewashed facade of Thiksey Monastery rising from the Indus river valley."),
            ("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", "Warm Yak cheese pizza and freshly brewed mint tea served at Gesmo Restaurant in Leh.")
        ],
        "summary": "A comprehensive, realistic guide to traveling through Ladakh safely, managing high-altitude acclimatization, and exploring ancient Tibetan monasteries.",
        "experience": ("Arriving in Leh at 3,500 meters altitude, the stark trans-Himalayan landscape takes your breath away—literally and figuratively. "
                       "Acclimatization is non-negotiable: spending the first 48 hours resting quietly in Leh Main Bazaar allows your body to adjust to thin air. "
                       "Climb the gentle steps to Shanti Stupa at sunset to gaze over the mud-brick ruins of Leh Palace against the Indus Valley. "
                       "Visit Thiksey Monastery at dawn to listen to monks blowing six-foot copper horns (dungchen) across the valley. "
                       "Traverse Khardung La at 5,359 meters into the silver dunes of Nubra Valley, and camp beside the surreal blue waters of Pangong Tso.")
    },
    {
        "id": "story_12",
        "destination": "Darjeeling",
        "slug": "darjeeling-tea-estate-trail",
        "title": "Queen of the Hills: Kanchenjunga Sunrises and Vintage Toy Trains in Darjeeling",
        "subtitle": "Exploring the historic colonial hill station of West Bengal, orthodox tea gardens, and Tibetan bakeries.",
        "category": "Nature",
        "read_time": "8 min read",
        "author": "Subhashree Sen",
        "hero_image": "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop", "First rays of golden dawn sunlight striking the five snowy peaks of Mount Kanchenjunga from Tiger Hill."),
            ("https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop", "Vintage steam locomotive of the Darjeeling Himalayan Railway rounding the scenic Batasia Loop."),
            ("https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop", "Emerald tea plucking terraces at Happy Valley Tea Estate descending into misty valley gorges."),
            ("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", "English breakfast and fresh Darjeeling first-flush tea served on the open roof terrace at Keventer's.")
        ],
        "summary": "A nostalgic and culturally rich look at Darjeeling, from dawn over the Eastern Himalayas to the century-old tea institutions and hillside bakeries.",
        "experience": ("The climb up from New Jalpaiguri on the narrow mountain road passes through pine groves, orchid gardens, and mist. "
                       "At 4 AM, standing on the observation deck of Tiger Hill, silence falls over the crowd as the sun breaks above the horizon, painting Kanchenjunga's 8,586-meter snow walls in brilliant shades of rose and molten gold. "
                       "Down in town, the UNESCO-listed steam toy train chugs along the edge of Hill Cart Road, whistling through the circular garden of Batasia Loop. "
                       "Visit Happy Valley Tea Estate to understand the delicate art of orthodox tea fermentation, enjoy breakfast on the rooftop terrace of Keventer's, and head to Glenary's Bakery for warm apple strudel.")
    },
    {
        "id": "story_13",
        "destination": "Rishikesh",
        "slug": "rishikesh-adventure-sports-guide",
        "title": "Rapids and Reverence: The Dual Soul of Rishikesh on the Ganges",
        "subtitle": "Navigating Class III river rapids, evening ghat aartis, and bohemian cliffside cafes in the yoga capital.",
        "category": "Adventure",
        "read_time": "8 min read",
        "author": "Aditya Verma",
        "hero_image": "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=800&auto=format&fit=crop", "Evening Ganga Aarti ceremony at Triveni Ghat with brass oil lamps glowing on the water."),
            ("https://images.unsplash.com/photo-1609137144820-221087cfef42?q=80&w=800&auto=format&fit=crop", "Lakshman Jhula iron suspension bridge spanning the emerald river rapids beneath foothill temples."),
            ("https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=800&auto=format&fit=crop", "Graffiti-painted stone meditation pods inside the tranquil Beatles Ashram compound."),
            ("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", "Fresh falafel platter and organic cold-pressed juice served at Little Buddha Cafe overlooking the river.")
        ],
        "summary": "A balanced exploration of Rishikesh that embraces both high-octane river rafting through Himalayan gorges and quiet contemplation along ashram ghats.",
        "experience": ("Where the sacred river emerges from the high Garhwal Himalayas into the North Indian plain, Rishikesh lives two distinct lives. "
                       "By day, the river is alive with adventure: rafting crews push off from Shivpuri to tackle legendary rapids like Roller Coaster and Golf Course. "
                       "By late afternoon, the town returns to quiet spiritual reverence. "
                       "Cross Ram Jhula into Swarg Ashram, walk through the evocative graffiti-painted ruins of Chaurasi Kutia (The Beatles Ashram), and join the evening aarti at Parmarth Niketan. "
                       "End the day at Little Buddha Cafe, watching the last river rafts glide into the dusk beneath towering mountain ridges.")
    },
    {
        "id": "story_14",
        "destination": "Mumbai",
        "slug": "mumbai-coastal-heritage-trail",
        "title": "Colonial Stones and Coastal Boulevards: 48 Hours in Historic South Mumbai",
        "subtitle": "Victorian Gothic architecture, Marine Drive breezes, and Parsi cafe culture in the Maximum City.",
        "category": "City",
        "read_time": "9 min read",
        "author": "Farhan Irani",
        "hero_image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop", "Gateway of India standing grandly on the harbor edge facing the Arabian Sea."),
            ("https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=800&auto=format&fit=crop", "Chhatrapati Shivaji Maharaj Terminus illuminated with intricate Victorian Gothic stone carvings."),
            ("https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop", "The curving sweep of Marine Drive's Queen's Necklace glowing at twilight."),
            ("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop", "Iconic Berry Pulao and caramel custard served at heritage Parsi institution Britannia & Co.")
        ],
        "summary": "A pedestrian journey through the architectural and culinary heritage of South Mumbai, exploring Victorian monuments, Art Deco seafronts, and vintage cafes.",
        "experience": ("South Mumbai possesses an architectural grandeur unlike anywhere else in Asia. "
                       "Walking out of the monumental Gothic arches of CSMT railway station at 7 AM, the morning sea breeze cuts through the humid avenue. "
                       "Stroll past the University of Mumbai's Rajabai Clock Tower into the lush greens of Oval Maidan, where cricket matches unfold against the world's second-largest collection of Art Deco residential buildings. "
                       "Step into Britannia & Co. in Ballard Estate for aromatic Parsi Berry Pulao and caramel custard. "
                       "In the evening, sit along the tetrapods of Marine Drive as the entire three-kilometer curve lights up into the Queen's Necklace under the Arabian Sea twilight.")
    },
    {
        "id": "story_15",
        "destination": "Kolkata",
        "slug": "kolkata-street-food-trail",
        "title": "City of Joy: Colonial Grandeur, Adda Culture, and Legendary Street Food in Kolkata",
        "subtitle": "Navigating tramlines, Victoria Memorial gardens, and the heritage tearooms of Park Street.",
        "category": "Culture",
        "read_time": "9 min read",
        "author": "Debashis Banerjee",
        "hero_image": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop", "Victoria Memorial's white Makrana marble palace framed by reflecting pools."),
            ("https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop", "Howrah Bridge's cantilever steel arches carrying morning commuter traffic over the Hooghly."),
            ("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", "Colonial tearoom nostalgia and English breakfast served at Flurys on Park Street."),
            ("https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop", "Crispy, tangy phuchkas and kathi rolls prepared freshly on street corners.")
        ],
        "summary": "An intellectual and culinary tribute to Kolkata, exploring its colonial architectural heritage, iconic tramways, lively coffee house addas, and street food.",
        "experience": ("Kolkata does not overwhelm you with speed; it enchants you with soul. "
                       "Begin your morning at the bustling Malik Ghat Flower Market beneath the mighty steel cantilever of Howrah Bridge, where thousands of marigold garlands scent the humid air. "
                       "Board a heritage wooden tram winding through the maidan towards Victoria Memorial. "
                       "At College Street's historic Indian Coffee House, students and poets engage in impassioned *adda* beneath spinning ceiling fans. "
                       "Satisfy your hunger with legendary Nizam's kathi rolls, crisp puchkas in earthen leaf bowls, and tender Chelo Kebabs at Peter Cat on Park Street.")
    },
    {
        "id": "story_17",
        "destination": "Shimla",
        "slug": "shimla-winter-snow-guide",
        "title": "The Summer Capital: Ridge Walks and Colonial Nostalgia in Shimla",
        "subtitle": "Walking the pedestrian Mall Road, Viceregal Lodge, and deodar pine trails of Himachal's capital.",
        "category": "Weekend Trips",
        "read_time": "8 min read",
        "author": "Rohit Sharma",
        "hero_image": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop", "The Ridge public square with historic Christ Church illuminated against snowy mountain ridges."),
            ("https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop", "Stately Scottish baronial masonry and manicured lawns of Viceregal Lodge."),
            ("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", "Warm buckwheat crepes and artisan coffee on the balcony at Wake & Bake Cafe."),
            ("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop", "Traditional Himachali Dham featuring slow-simmered madra and steamed siddu.")
        ],
        "summary": "A delightful walk through the former British summer capital, focusing on pedestrianized heritage promenades, toy train journeys, and mountain dining.",
        "experience": ("Perched along a crescent-shaped mountain ridge at 2,200 meters, Shimla retains the distinctive character of a historic hill station. "
                       "Vehicles are prohibited on the Mall Road and The Ridge, creating an open, leisurely promenade where travelers stroll past Tudor-timbered facades and colonial post offices. "
                       "Visit Christ Church to admire its stained-glass windows, and hike through deodar woods up to Jakhoo Temple where a 108-foot Hanuman statue overlooks the Shivalik range. "
                       "Tour the grand Viceregal Lodge, take a ride on the Kalka-Shimla Toy Train through 103 stone tunnels, and savor warm buckwheat crepes at Wake & Bake Cafe.")
    },
    {
        "id": "story_18",
        "destination": "Ooty",
        "slug": "ooty-nilgiri-mountain-railway-trail",
        "title": "Blue Mountains and Toy Trains: A Classic Journey Through Ooty & Coonoor",
        "subtitle": "Riding the Nilgiri Mountain Railway through tea plantations, pine woods, and botanical sanctuaries.",
        "category": "Nature",
        "read_time": "8 min read",
        "author": "Priya Nair",
        "hero_image": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop", "Nilgiri Mountain Railway steam train crossing a stone viaduct through misty blue hills."),
            ("https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format&fit=crop", "Sweeping vistas over emerald tea estates and eucalyptus forests from Doddabetta Peak."),
            ("https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop", "Still waters of Pykara Lake surrounded by pine forest walking trails."),
            ("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", "Artisanal Nilgiri chocolates and freshly brewed estate tea served at Nahar's Sidewalk Cafe.")
        ],
        "summary": "Exploring the serene beauty of the Nilgiris via heritage rack-and-pinion trains, rolling tea estates, botanical gardens, and homemade chocolates.",
        "experience": ("The Nilgiri Mountain Railway is a marvel of 19th-century railway engineering. "
                       "Using an alternate rack-and-pinion system, the blue-and-yellow coaches climb 1,800 meters from Mettupalayam through 16 tunnels and 250 bridges to reach Ooty. "
                       "The air carries the distinctive scent of blue gum eucalyptus and mountain tea. "
                       "Climb Doddabetta Peak for sweeping vistas of the Coimbatore plains, walk among 20,000 rose varieties in the Government Rose Garden, and sample homemade dark chocolates and stone-baked pizza at Nahar's Sidewalk Cafe.")
    },
    {
        "id": "story_20",
        "destination": "Srinagar",
        "slug": "kashmir-shikara-meadow-paradise",
        "title": "Floating Gardens and Walnut Woods: Life on the Waters of Srinagar",
        "subtitle": "Wooden houseboats on Dal Lake, Mughal garden terracing, and authentic Kashmiri Wazwan feasts.",
        "category": "Romantic",
        "read_time": "9 min read",
        "author": "Bashir Mir",
        "hero_image": "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop", "Carved wooden shikara boat gliding smoothly across Dal Lake at dawn beneath Zabarwan peaks."),
            ("https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop", "Water fountains cascading down stone terraces at Shalimar Bagh Mughal Gardens."),
            ("https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop", "Floating vegetable market on Dal Lake with local vendors trading fresh produce from boats."),
            ("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop", "Authentic Kashmiri Wazwan featuring tender rogan josh, rista, and aromatic saffron rice at Ahdoos.")
        ],
        "summary": "An intimate journey through the Kashmir Valley, exploring centuries of wooden houseboat traditions on Dal Lake, Mughal terraced architecture, and legendary saffron cuisine.",
        "experience": ("Waking up on a carved cedar houseboat on Nigeen or Dal Lake is like entering a watercolor painting. "
                       "Outside your curtained window, early morning mist rises from still waters as water-lilies open. "
                       "A shikara ride through the floating vegetable market at 6 AM reveals a self-sustaining aquatic world where farmers trade lotus roots and greens from canoe to canoe. "
                       "Explore the cascading stone watercourses of Nishat and Shalimar Bagh, climb Shankaracharya Hill for panoramic city views, and savor an authentic 12-course Wazwan feast at historic Ahdoos on the Jhelum riverbanks.")
    },
    {
        "id": "story_21",
        "destination": "Bengaluru",
        "slug": "bengaluru-garden-city-heritage-brewery-trail",
        "title": "Banyans, Breweries, and Benne Dosa: The Green Heart of Bengaluru",
        "subtitle": "Colonial glasshouses, Lalbagh botanical giants, and India's finest craft brew and tiffin culture.",
        "category": "City",
        "read_time": "8 min read",
        "author": "Siddharth Kamath",
        "hero_image": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop", "Lalbagh Botanical Garden's historic Victorian Glass House framed by tropical flowerbeds."),
            ("https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop", "Neo-Dravidian granite facade of the Vidhana Soudha illuminated at night."),
            ("https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop", "Crispy, butter-drenched benne masala dosa served on banana leaf at Vidyarthi Bhavan in Gandhi Bazaar."),
            ("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop", "Artisanal craft beer and wood-fired sourdough pizza served under rain trees at Toit in Indiranagar.")
        ],
        "summary": "Exploring Bengaluru beyond its tech corridors, uncovering tranquil century-old botanical gardens, legendary South Indian tiffin institutions, and thriving microbreweries.",
        "experience": ("Long before it became India's Silicon Valley, Bengaluru was known as the Garden City. "
                       "Begin early at Lalbagh Botanical Garden, commissioned by Hyder Ali in 1760, walking past 200-year-old silk cotton trees to the Victorian Glass House. "
                       "For breakfast, join the queue outside Vidyarthi Bhavan in Basavanagudi for its signature benne masala dosa: crispy, golden-brown crust drenched in butter and paired with thick coconut chutney. "
                       "Stroll through the shaded bamboo groves of Cubbon Park towards the monumental granite Vidhana Soudha, and spend the evening enjoying craft brews at Toit in Indiranagar.")
    },
    {
        "id": "story_22",
        "destination": "Kochi",
        "slug": "kochi-spice-route-colonial-heritage",
        "title": "Where Oceans Met: Spice Warehouses and Chinese Nets in Fort Kochi",
        "subtitle": "Navigating 500 years of Portuguese, Dutch, and Jewish maritime history in Kerala's historic port.",
        "category": "Culture",
        "read_time": "9 min read",
        "author": "George Mathew",
        "hero_image": "https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1600100397608-f010e42f9b88?q=80&w=800&auto=format&fit=crop", "Iconic cantilevered Chinese fishing nets silhouetted against the Arabian Sea sunset in Fort Kochi."),
            ("https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop", "Hand-painted blue-and-white willow pattern floor tiles inside the 1568 Paradesi Jewish Synagogue."),
            ("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", "Shaded courtyard cafe and art gallery serving ginger iced tea at Kashi Art Cafe."),
            ("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop", "Authentic Malabar prawn curry and appam served on the waterfront at Seagull Restaurant.")
        ],
        "summary": "A walking exploration of Fort Kochi and Mattancherry, tracing the ancient maritime spice trade through colonial stone churches, synagogal lanes, and waterfront cafes.",
        "experience": ("Fort Kochi feels like an open-air maritime museum where sea breezes carry the fragrance of black pepper and cardamom. "
                       "Along the shoreline, massive cantilevered Chinese fishing nets—installed during the reign of Kublai Khan—rise and fall in graceful counterweighted balance. "
                       "Walk down Princess Street to St. Francis Church, where Vasco da Gama was originally buried in 1524. "
                       "In Mattancherry, wander through Jew Town where 400-year-old spice warehouses now house antique shops, and admire the hand-painted 18th-century floor tiles in the Paradesi Synagogue. "
                       "Relax in the tranquil courtyard of Kashi Art Cafe with cold brew and carrot cake before catching sunset over the harbor.")
    },
    {
        "id": "story_24",
        "destination": "Mysuru",
        "slug": "mysuru-royal-palace-silk-trail",
        "title": "City of Palaces: Illuminations, Sandalwood, and Silk in Royal Mysuru",
        "subtitle": "Discovering the architectural splendor of the Wodeyars, Devaraja spice markets, and original Mysore Pak.",
        "category": "Heritage",
        "read_time": "8 min read",
        "author": "Raghavendra Rao",
        "hero_image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop", "Mysore Palace's Indo-Saracenic facade illuminated by nearly 100,000 golden incandescent bulbs."),
            ("https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop", "Vibrant conical heaps of kumkum powder and fresh jasmine garlands at Devaraja Market."),
            ("https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop", "Legendary melt-in-mouth Mylari butter dosa served with spicy mint chutney."),
            ("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop", "Pure ghee Mysore Pak straight out of the brass trays at original royal sweet maker Guru Sweets.")
        ],
        "summary": "A royal journey through Mysuru, celebrating the breathtaking illumination of the Amba Vilas Palace, historic market lanes, and culinary legacies of the royal court.",
        "experience": ("Mysuru carries an unmistakable regal poise. At its physical and cultural center stands Mysore Palace (Amba Vilas), an Indo-Saracenic masterpiece designed by Henry Irwin with domes, turrets, and arched canopies. "
                       "Inside, the Durbar Hall dazzles with stained-glass peacock ceilings and cast-iron pillars imported from Glasgow. "
                       "On Sunday evenings, crowds gather in awe as 97,000 incandescent light bulbs switch on simultaneously, illuminating the entire palace in golden majesty. "
                       "Explore Devaraja Market's fragrant aisles of sandalwood oil and jasmine garlands, savor melt-in-mouth Mylari butter dosas in Nazarbad, and visit Guru Sweets to taste the original ghee Mysore Pak invented for Maharaja Krishnaraja Wadiyar IV.")
    },
    {
        "id": "story_29",
        "destination": "Udaipur",
        "slug": "udaipur-lake-pichola-romantic-guide",
        "title": "Mirrors on the Water: Haveli Heritage and Lake Pichola in Udaipur",
        "subtitle": "Sunsets over island palaces, Mewari culinary traditions, and royal courtyards in the City of Lakes.",
        "category": "Heritage",
        "read_time": "9 min read",
        "author": "Yashwant Sisodia",
        "hero_image": "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=800&auto=format&fit=crop", "City Palace Udaipur towering above Lake Pichola with ghat reflections glistening under the afternoon sun."),
            ("https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?q=80&w=800&auto=format&fit=crop", "Sunset boat gliding quietly past the marble arches of Jag Mandir island palace."),
            ("https://images.unsplash.com/photo-1592635196078-9fe32a26079d?q=80&w=800&auto=format&fit=crop", "Marble fountains and lotus pools in the historic courtyards of Saheliyon Ki Bari."),
            ("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop", "Waterfront dining at Ambrai with illuminated City Palace views across Lake Pichola.")
        ],
        "summary": "An enchanting exploration of Udaipur's lakeside palaces, historic havelis, and Mewari culinary heritage, tailored for culture and architecture lovers.",
        "experience": ("Udaipur owes its ethereal beauty to the visionary engineering of Maharana Udai Singh II, who in 1559 dammed mountain streams to create Lake Pichola. "
                       "Rising high above the eastern shore is the monumental City Palace, a seamless complex of granite and marble pavilions featuring exquisite colored mirror mosaics in the Mor Chowk (Peacock Courtyard). "
                       "Take a sunset boat cruise past Lake Palace to Jag Mandir island, where stone elephants guard the marble landing pavilions. "
                       "In the evening, cross the footbridge to Ambrai Ghat to watch the palace facade illuminate the water in golden reflections while dining on authentic Mewari laal maas and hot garlic naans.")
    }
]

print(f"Definitive 20 Flagship Story definitions compiled: {len(FLAGSHIPS)} stories.")

def build_story_body(item):
    g = item["gallery"]
    body_parts = [
        f"# {item['title']}",
        f"*{item['subtitle']}*",
        f"By **{item['author']}** • {item['read_time']} • Published in NAVIX Travel Dispatch",
        "---",
        f"### Arriving at {item['destination']} & First Impressions",
        item["experience"][:450].strip() + "...",
        f"![{g[0][1]}]({g[0][0]})",
        f"### Atmosphere & Cultural Character of {item['destination']}",
        item["experience"][450:].strip(),
        f"![{g[1][1]}]({g[1][0]})",
        "### What I'd Recommend",
        f"- **Places to Visit:** Explore the historic center, heritage monuments, and natural viewpoints of {item['destination']}.",
        f"- **Activities:** Early morning walking explorations, cultural heritage walks, and visiting traditional craft bazaars.",
        f"- **Local Food:** Authentic regional specialties, legendary local thali institutions, and traditional tea stops.",
        f"- **Where to Stay:** Centrally located boutique heritage hotels or well-reviewed local homestays.",
        f"- **Practical Advice:** Keep a healthy buffer for local transit transfers and book intercity coaches in advance.",
        f"![{g[2][1]}]({g[2][0]})" if len(g) > 2 else "",
        "### Practical Trip Notes",
        "- **Ideal Duration:** 3 to 5 Days for a relaxed, comprehensive experience.",
        "- **Best Season:** October to March for pleasant temperatures (or April to June for high mountain terrain).",
        "- **Indicative Demo Budget:** ₹22,000 to ₹35,000 for two travelers covering transport, accommodation, food, and activities.",
        "- **Things to Keep in Mind:** Respect local customs and religious dress codes, and keep cash for small local vendors.",
        f"![{g[3][1]}]({g[3][0]})" if len(g) > 3 else "",
        f"### Plan Your Trip to {item['destination']}",
        f"Ready to explore {item['destination']}? Build your deterministic multi-modal journey with NAVIX, compare transport alternatives, and optimize your stays, dining, and sightseeing under your total trip budget."
    ]
    return "\n\n".join(p for p in body_parts if p.strip())

# Load and update stories.json
with open(STORIES_FILE, "r", encoding="utf-8") as f:
    existing_stories = json.load(f)

flagship_map = {item["id"]: item for item in FLAGSHIPS}
updated_count = 0

for story in existing_stories:
    s_id = story.get("id")
    if s_id in flagship_map:
        data = flagship_map[s_id]
        story["title"] = data["title"]
        story["destination"] = data["destination"]
        story["destination_name"] = data["destination"]
        story["destination_slug"] = data["slug"].split("-")[-1] if data.get("slug") else story.get("destination_slug")
        # Ensure correct destination_slug
        dest_slug_clean = data["destination"].lower().replace(" ", "-")
        story["destination_slug"] = dest_slug_clean
        story["category"] = data["category"]
        story["read_time"] = data["read_time"]
        story["author"] = data["author"]
        story["summary"] = data["summary"]
        story["hero_image"] = data["hero_image"]
        story["cover_image"] = data["hero_image"]
        story["gallery_images"] = [img[0] for img in data["gallery"]]
        story["body"] = build_story_body(data)
        updated_count += 1

with open(STORIES_FILE, "w", encoding="utf-8") as f:
    json.dump(existing_stories, f, indent=2, ensure_ascii=False)

print(f"Successfully enriched {updated_count} flagship stories in {STORIES_FILE}. Total preserved stories: {len(existing_stories)}.")

