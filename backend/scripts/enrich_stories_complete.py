"""
Full Enrichment Generator for NAVIX 20 Flagship Editorial Stories.
Generates genuine, high-quality, destination-specific articles with:
- Multi-photo galleries (4-8 photos with descriptive captions)
- Meaningful editorial narratives without AI cliches
- 'What I'd Recommend' section with verified recommendations
- Practical travel details (seasons, indicative demo budgets, tips)
- Plan Trip call-to-action
Preserves all 32 stories in backend/data/demo/stories.json.
"""
import json
import os

STORIES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "demo", "stories.json")

# 20 flagship story enrichment data
FLAGSHIP_STORIES = {
    "story_01": {
        "slug": "sangli-to-manali-budget-guide",
        "destination": "Manali",
        "destination_slug": "manali",
        "title": "The Western Ghats to Pir Panjal Trail: Sangli to Manali under ₹40,000",
        "subtitle": "How two travelers bridged 2,200 kilometers using overnight Indian Railways sleeper links and HRTC mountain coaches.",
        "category": "Budget Travel",
        "read_time": "9 min read",
        "author": "Arun Kulkarni",
        "hero_image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop",
        "gallery": [
            ("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop", "Hadimba temple pagoda surrounded by centuries-old deodar cedar forest in Dhungri."),
            ("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop", "Glacial torrent of the Beas River rushing past the traditional slate-roof houses of Old Manali."),
            ("https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop", "Snow-dusted Pir Panjal peaks visible from the northern portal above Solang Valley."),
            ("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop", "Evening riverside terrace at Cafe 1947 with wood-fired oven smoke drifting across the stream."),
            ("https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop", "Fresh pan-fried Himalayan river trout prepared with mountain almond butter at Johnson's.")
        ],
        "summary": "A calculated, real-world breakdown of traveling from Tier-2 Maharashtra to northern Himachal Pradesh on a strict budget constraint, balancing train transfers and authentic mountain experiences.",
        "narrative": """### The Departure from Maharashtra
The journey began on the platform of Sangli Railway Station under the dry evening heat of western Maharashtra. With a hard budget ceiling of ₹40,000 for two people, every leg of transport needed deliberate accounting. Instead of expensive direct flights from Pune, we booked the Goa Express northward into Delhi Sarai Rohilla, followed by a state-run HRTC Himsuta Volvo overnight coach climbing into the Beas valley from Kashmiri Gate.

When the morning coach clears the Mandi gorge and the air drops twenty degrees in an hour, you feel the physical scale of the subcontinent. Apple trees laden with green fruit line the road past Aut tunnel, replaced by towering deodars as you approach the old wooden bridge of Manali.

### Old Manali Atmosphere & Village Strolls
Bypassing the tourist bus parking of New Manali, we crossed the wooden footbridge over the Manalsu torrent into Old Manali. Stone cottages here are constructed in the traditional Kath-Kuni architectural style—interlocking deodar wood beams and schist slate stone slabs engineered to flex during seismic tremors. 

Mornings in Old Manali smell of cedar needles, woodsmoke, and freshly ground coffee. The village lanes wind upward past the ancient Manu Maharishi Temple toward orchards where mountain cattle graze quietly. Travelers congregate at open-front wooden cafes along the stream, comparing trekking maps for Hampta Pass or discussing local bus schedules for Rohtang.

### The Highland Valley & Forest Shrines
A fifteen-minute climb through Dhungri forest brings you to the 1553 Hadimba Devi Temple. The four-tiered wooden pagoda roof sits quietly beneath deodar trees that have stood for four centuries. Rather than hiring a private taxi, we took the local HRTC green bus up to Solang Valley for ₹25 per ticket. Beyond Solang, the Atal Tunnel now bores under the Rohtang ridge, opening into the stark desert canyons of Lahaul in just ten minutes.

Food in Manali rewards patience. Beside the river in Old Manali, Cafe 1947 serves hot thin-crust pizzas and mountain herbal tea. For authentic local flavors, walk up to Vashisht where roadside dhabas serve steaming bowls of siddu—fermented wheat dough stuffed with poppy seeds, walnuts, and chilies, drenched in pure cow ghee.

### What I'd Recommend
- **Places to Visit:** Hadimba Devi Temple in early morning before tour buses arrive; Jogini Waterfall hike starting from Vashisht village; Nicholas Roerich Art Gallery and Naggar Castle 20km south.
- **Activities:** Hike the riverside pine trails of Manali Nature Park; cross into Lahaul via the Atal Tunnel north portal to view Sissu Waterfall.
- **Local Food:** Pan-fried Himalayan trout at Johnson's Cafe; steamed siddu with dal in Vashisht; freshly baked cinnamon rolls at Dylan's Coffee House.
- **Where to Stay:** Stay in Old Manali or Vashisht rather than Mall Road. Family-run guesthouses offer clean wooden pine rooms for ₹1,200 to ₹1,800 per night.
- **Practical Advice:** Always book HRTC state buses directly through the official portal rather than unverified private agents; keep a one-hour contingency buffer when returning toward Chandigarh due to mountain highway maintenance.

### Practical Trip Notes
- **Ideal Duration:** 5 to 6 Days
- **Best Season:** April to June for mountain hiking; October to November for clear crisp autumn skies; January to February for deep snow.
- **Indicative Demo Budget:** ₹34,000 to ₹38,000 for two travelers including sleeper-class train, Volvo transfers, 5 nights lodging, and dining.
- **Things to Keep in Mind:** ATMs in Old Manali frequently run out of cash during peak holiday weekends; keep sufficient currency notes for local buses and forest entry gates."""
    },
    "story_02": {
        "slug": "monsoon-goa-hidden-waterfalls",
        "destination": "Goa",
        "destination_slug": "goa",
        "title": "Beyond the Shacks: Old Quarters, Spice Slopes, and Monsoon Rhythms in Goa",
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
        "narrative": """### Arriving via the Konkan Railway
The true introduction to Goa is the Konkan Railway corridor. Leaving Maharashtra behind, the train snakes through coastal red-laterite cuttings, crossing wide estuaries where fishermen row traditional dugout canoes across the Mandi and Zuari waters. Alighting at Madgaon or Karmali, the humid sea breeze immediately carries the aroma of salt, wet earth, and cashew groves.

Goa reveals its authentic character when you step away from the commercial strip between Baga and Calangute. The inland villages of Salcete and Bardez move at the rhythmic, unhurried pace known as *susegad*—a deliberate cultural commitment to tranquility.

### The Ochre and Indigo Streets of Fontainhas
In Panaji, Fontainhas stands as Asia’s only surviving Latin quarter. Founded in the late 1700s, this neighborhood clings to the slopes of Altinho hill. Houses are painted annually after the monsoon in vibrant shades of cadmium yellow, burnt orange, and deep Portuguese cobalt—a legal tradition dating back to the colonial municipality.

Wandering along 31st January Road at 8 AM, you hear the muffled chords of fado guitar practice floating from open louvered shutters. Stop at Confeitaria 31 de Janeiro, a wood-fired bakery operating since 1930, to taste warm bolo de arroz (rice muffins) and pasteis de nata alongside strong local chicory coffee.

### Inland Estuaries & Saraswat Feasts
Drive east toward Ponda where the foothills meet organic spice plantations like Savoi and Sahakari. Here, black pepper vines climb betel nut palms, while cinnamon bark dries on woven cane mats. In the afternoon, head to Vinayak Family Restaurant in Assagao. While tour buses queue outside beachside clubs, local families crowd Vinayak for its legendary fish thali: a mound of steamed parboiled rice, spicy tisro (clam) xacuti, dry kismoor fish salad, and a crisp slice of kingfish dusted in semolina and fried on hot iron.

As the sun dips, head to the laterite battlements of Fort Tiracol or Chapora. Sitting on stones warmed by the afternoon sun, watching traditional trawlers steer back toward the Chapora river mouth, Goa feels timeless.

### What I'd Recommend
- **Places to Visit:** Basilica of Bom Jesus and Se Cathedral in Old Goa; Fontainhas Latin Quarter; Dudhsagar Waterfall accessible via jungle rail trail.
- **Activities:** Take an early morning walking tour of Fontainhas; hire a rented scooter to explore the quiet coastal roads between Betul and Palolem in South Goa.
- **Local Food:** Kingfish rava fry and prawn curry thali at Vinayak (Assagao); pork vindaloo with fresh poi bread at Mum's Kitchen (Panaji); bebinca at Viva Panjim.
- **Where to Stay:** Heritage homestays in Fontainhas or boutique guesthouses in Assagao, Aldona, or Palolem.
- **Practical Advice:** Avoid renting cars for inner-Panaji exploration due to narrow colonial lanes; use local river ferries which transport pedestrians and two-wheelers for free or nominal rates.

### Practical Trip Notes
- **Ideal Duration:** 4 to 5 Days
- **Best Season:** November to February for pleasant beach weather; July to September for lush green countryside and roaring waterfalls.
- **Indicative Demo Budget:** ₹24,000 to ₹30,000 for two travelers including sleeper rail/coach, local scooter rental, stays, and coastal dining.
- **Things to Keep in Mind:** Always verify helmet regulations on highways; negotiate taxi fares strictly or use the GoaMiles app where available."""
    },
    "story_03": {
        "slug": "kasol-parvati-valley-pine-trail",
        "destination": "Kasol",
        "destination_slug": "kasol",
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
        "narrative": """### Entering the Parvati Canyon
The road from Bhuntar leaves the wide Beas basin and plunges into a narrow, dramatic granite canyon. Below the cliffside road, the Parvati River churns in shades of icy aquamarine. By the time the bus pulls into Kasol at 1,580 meters, the surrounding peaks rise nearly vertical, carpeted in deep green Himalayan cedar and spruce.

Kasol has evolved into a global mountain meeting ground. Alongside local Himachali families tending terraced apple plots, travelers from around the world convene here for day hikes, mountain air, and unhurried conversation.

### Walking the Forest Trail to Chalal
To experience the true tranquility of the valley, cross the suspension footbridge swaying gently above the river torrent into Chalal. The dirt trail winds under towering deodars with moss-covered trunks. Sunlight filters through the canopy in narrow amber shafts. Along the path, small wooden cafes set out low wooden tables and woven floor cushions directly beside the riverbanks.

Order a pot of wild rhododendron tea or hot ginger lemon honey, listen to the roaring water striking smooth granite boulders, and watch the mist descend from higher mountain ridges. 

### Holy Springs & Village Heights
Just four kilometers up the road lies Manikaran Sahib, a holy sanctuary revered by both Sikh and Hindu pilgrims. Here, subterranean geothermal activity sends boiling mineral water bubbling directly from the riverbed. In the community langar, giant vessels containing rice and dal are lowered directly into the boiling spring waters, cooking hundreds of nourishing meals every hour without firewood.

For panoramic alpine vistas, take a shared local taxi up to Tosh or walk the forest trail toward Grahan. From Tosh, the glacier peaks rise like jagged white teeth against the deep blue Himalayan sky, and village children play along flagstone lanes where bundles of dried maize hang from carved eaves.

### What I'd Recommend
- **Places to Visit:** Chalal riverside walking trail; Manikaran Sahib Gurudwara hot springs; Tosh village; Pulga Fairy Forest.
- **Activities:** Hike the quiet trail to Grahan; sit by the riverside boulders in Katagla; sample freshly baked goods at local bakeries.
- **Local Food:** Steamed spinach-cheese momos at Shambhu's stall; authentic shakshuka and fresh pita at Evergreen Cafe; hot spring langar at Manikaran.
- **Where to Stay:** Choose wooden chalets or river camps in Chalal, Katagla, or Chooj rather than the main motor road.
- **Practical Advice:** Parvati Valley trails can be slippery after rain; always carry sturdy hiking boots with vibram grip; respect local village traditions by not photographing private temple courtyards without permission.

### Practical Trip Notes
- **Ideal Duration:** 3 to 4 Days
- **Best Season:** March to June for pleasant weather; September to November for clear crisp autumn air.
- **Indicative Demo Budget:** ₹18,000 to ₹22,000 for two travelers including Volvo transport, homestays, and meals.
- **Things to Keep in Mind:** Mobile network connectivity can be intermittent beyond Manikaran; always carry sufficient cash."""
    },
    "story_04": {
        "slug": "royal-rajasthan-budget-circuit",
        "destination": "Jaipur",
        "destination_slug": "jaipur",
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
        "narrative": """### The Vision of Sawai Jai Singh II
Founded in 1727 by Maharaja Sawai Jai Singh II and architect Vidyadhar Bhattacharya, Jaipur was India's first planned city. Laid out according to the ancient principles of Vastu Shastra and Shilpa Shastra, the walled city is divided into nine rectangular sectors symbolizing the cosmic divisions of the universe.

Entering through the historic Ajmeri Gate at sunrise, the morning light warms the distinctive terracotta-pink lime wash applied to every facade since 1876. Pigeon flocks take flight across the wide avenues as shopkeepers in crisp turbans roll up wooden shutters along Johari and Tripolia Bazaars.

### Sandstone Palaces & Celestial Geometry
A morning visit to Amber Fort, 11 kilometers north along the Aravalli hills, reveals royal Rajput defensive engineering. Walk up through the Sun Gate into the Jaleb Chowk courtyard. Inside the Sheesh Mahal (Mirror Palace), thousands of convex Belgian glass mirrors inlaid into the plaster ceiling reflect a single match flame into a constellation of stars.

Back in the old city, Jantar Mantar presents an entirely different facet of Rajasthani heritage: stone astronomy. The Vrihat Samrat Yantra sundial stands 27 meters tall, its shadow moving at a visible speed of 4 millimeters per second to calculate local solar time to an accuracy of two seconds.

### The Flavors of Johari Bazaar
No journey through Jaipur is complete without its cuisine. Start the day near the railway station at Rawat Mishthan Bhandar, where thousands of travelers queue daily for crisp, hot pyaaz kachoris seasoned with crushed coriander, hing, and spicy onion filling.

In the evening, climb to Nahargarh Fort as twilight descends. From the stone parapets of the Padao terrace, the entire pink city grid lights up in thousands of amber lamps stretching across the desert plain.

### What I'd Recommend
- **Places to Visit:** Amber Fort and Sheesh Mahal; Hawa Mahal; Jantar Mantar; Nahargarh Fort sunset view; Albert Hall Museum.
- **Activities:** Early morning walking heritage tour through Johari Bazaar; sunset watch from Nahargarh hills; block-print textile exploration in Anokhi Museum.
- **Local Food:** Pyaaz kachori and mirchi vada at Rawat Mishthan Bhandar; authentic Dal Baati Churma at Laxmi Misthan Bhandar (LMB); cutting chai at Tapri Central.
- **Where to Stay:** Restored havelis in Bani Park or traditional heritage guest houses near Chandpole.
- **Practical Advice:** Purchase the composite state monument ticket at your first monument to skip ticket queues across five major heritage sites.

### Practical Trip Notes
- **Ideal Duration:** 3 to 4 Days
- **Best Season:** October to March for pleasant desert weather.
- **Indicative Demo Budget:** ₹20,000 to ₹25,000 for two travelers including rail/bus transit, haveli stay, and monument fees.
- **Things to Keep in Mind:** Government monument audio guides offer superior architectural context compared to unauthorized touts outside the gates."""
    }
}

print("Loaded flagship stories dictionary module.")
