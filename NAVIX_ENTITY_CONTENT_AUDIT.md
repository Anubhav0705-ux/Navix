# NAVIX Entity Content & Data Duplication Audit

## Executive Summary

- **Total Canonical Destinations Audited**: 113
- **Total Attractions Audited**: 1130
- **Total Food Places Audited**: 791
- **Total Stays Audited**: 791
- **Total Entities Audited**: 2712

### Entity Classification Breakdown

| Entity Type | VERIFIED_REAL | CURATED_DEMO | REPRESENTATIVE | GENERIC_TEMPLATE | DUPLICATE | INVALID |
|---|---|---|---|---|---|---|
| **Attraction** | 9 | 68 | 867 | 186 | 0 | 0 |
| **Food** | 6 | 33 | 105 | 647 | 0 | 0 |
| **Stay** | 40 | 21 | 81 | 649 | 0 | 0 |
| **TOTAL** | **55** | **122** | **1053** | **1482** | **0** | **0** |

## Root Cause Analysis (Phase 5)

### 1. Template Generation in `backend/scripts/generate_demo_dataset.py`
The root cause of repeated names, identical prices, and template descriptions across destinations is `backend/scripts/generate_demo_dataset.py`:
- **Attractions**: For ~100 non-flagship destinations, it generated 10 template items per destination with city name prefixed (e.g. `{City} Lake Promenade & Boating Point`, `{City} Cultural Heritage Center`, etc.).
- **Food**: Generated 7 restaurants per destination using fixed templates (`{City} Heritage Thali House`, `{City} Riverside Cafe & Bakery`, etc.) with identical fixed costs (`₹450`, `₹750`, `₹550`, `₹850`, `₹350`, `₹1100`, `₹250`) and identical hours (`10:30 AM - 10:30 PM`).
- **Hotels**: Generated 7 stays per destination (`{City} Backpacker Hosteller`, `{City} Green Valley Homestay`, etc.) with identical fixed pricing (`₹650`, `₹1200`, `₹1500`, `₹2400`, `₹3400`, `₹6500`, `₹9800`) and identical amenity arrays.

### 2. Runtime Fallback Image Chain in `frontend/src/lib/mediaResolver.ts`
- When an attraction had an image field referencing an external Unsplash URL or generic asset, `resolveFallbackImage()` fell back through category keywords (e.g., `'mountain'` -> `/home/manali.webp`, `'heritage'` -> `/home/jaipur.webp`).
- This caused all Shimla attractions (Viceregal Lodge, Jakhoo Temple, Kalka-Shimla Toy Train, Chadwick Falls) to display the identical mountain photo!

## Detailed Duplication Findings by Entity Type

### A. Places / Attractions Duplication Patterns

| Normalized Template Name | Repetitions Across Destinations | Example Affected Destinations |
|---|---|---|
| `heritage museum & art gallery` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `old city artisan bazaar` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `ancient rock temple` | 93 | Agra, Miraj, Kolhapur, Ratnagiri, Ganpatipule, Panaji, ... (+87 more) |
| `lake promenade & boating point` | 93 | Miraj, Kolhapur, Ratnagiri, Ganpatipule, Panaji, North Goa (Calangute & Anjuna), ... (+87 more) |
| `cultural heritage center` | 93 | Miraj, Kolhapur, Ratnagiri, Ganpatipule, Panaji, North Goa (Calangute & Anjuna), ... (+87 more) |
| `sunset peak viewpoint` | 92 | Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, Lonavala, ... (+86 more) |
| `scenic waterfall trek` | 91 | Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, Lonavala, ... (+85 more) |
| `historic fort & panorama` | 90 | Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, Lonavala, ... (+84 more) |
| `sacred river ghats & walk` | 90 | Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, Lonavala, ... (+84 more) |
| `botanical gardens & flora park` | 90 | Miraj, Ratnagiri, Ganpatipule, North Goa (Calangute & Anjuna), South Goa (Palolem & Benaulim), Margao, ... (+84 more) |

### B. Food / Dining Duplication Patterns

| Normalized Template Name | Repetitions Across Destinations | Example Affected Destinations |
|---|---|---|
| `spice bazaar dhaba` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `coastal spice eatery` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `pure veg rasoi` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `sunset rooftop bistro` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `old town sweet & chaat house` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `heritage thali house` | 91 | Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, Lonavala, ... (+85 more) |
| `riverside cafe & bakery` | 91 | Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, Lonavala, ... (+85 more) |

### C. Stays / Accommodation Duplication Patterns

| Normalized Template Name | Repetitions Across Destinations | Example Affected Destinations |
|---|---|---|
| `green valley homestay` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `travellers haven inn` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `royal heritage residency` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `the grand vista resort` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `elysium luxury retreat & spa` | 93 | Sangli, Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, ... (+87 more) |
| `backpacker hosteller` | 92 | Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, Lonavala, ... (+86 more) |
| `comfort pine guest house` | 92 | Pune, Nashik, Chhatrapati Sambhajinagar, Nagpur, Mahabaleshwar, Lonavala, ... (+86 more) |

## Suspicious Entities Catalog (Sample of 60 High-Frequency Duplicates)

| Destination | Entity Type | Entity Name | Duplicate Destinations Count | Source | Status |
|---|---|---|---|---|---|
| Sangli | Attraction | Sangli Heritage Museum & Art Gallery | 93 | `demo_attractions` | GENERIC_TEMPLATE |
| Sangli | Attraction | Sangli Old City Artisan Bazaar | 93 | `demo_attractions` | GENERIC_TEMPLATE |
| Agra | Attraction | Agra Ancient Rock Temple | 93 | `demo_attractions` | GENERIC_TEMPLATE |
| Miraj | Attraction | Miraj Lake Promenade & Boating Point | 93 | `demo_attractions` | GENERIC_TEMPLATE |
| Miraj | Attraction | Miraj Cultural Heritage Center | 93 | `demo_attractions` | GENERIC_TEMPLATE |
| Pune | Attraction | Pune Sunset Peak Viewpoint | 92 | `demo_attractions` | GENERIC_TEMPLATE |
| Pune | Attraction | Pune Scenic Waterfall Trek | 91 | `demo_attractions` | GENERIC_TEMPLATE |
| Pune | Attraction | Pune Historic Fort & Panorama | 90 | `demo_attractions` | GENERIC_TEMPLATE |
| Pune | Attraction | Pune Sacred River Ghats & Walk | 90 | `demo_attractions` | GENERIC_TEMPLATE |
| Miraj | Attraction | Miraj Botanical Gardens & Flora Park | 90 | `demo_attractions` | GENERIC_TEMPLATE |
| Sangli | Food | Sangli Spice Bazaar Dhaba | 93 | `demo_food_places` | GENERIC_TEMPLATE |
| Sangli | Food | Sangli Coastal Spice Eatery | 93 | `demo_food_places` | GENERIC_TEMPLATE |
| Sangli | Food | Sangli Pure Veg Rasoi | 93 | `demo_food_places` | GENERIC_TEMPLATE |
| Sangli | Food | Sangli Sunset Rooftop Bistro | 93 | `demo_food_places` | GENERIC_TEMPLATE |
| Sangli | Food | Sangli Old Town Sweet & Chaat House | 93 | `demo_food_places` | GENERIC_TEMPLATE |
| Pune | Food | Pune Heritage Thali House | 91 | `demo_food_places` | GENERIC_TEMPLATE |
| Pune | Food | Pune Riverside Cafe & Bakery | 91 | `demo_food_places` | GENERIC_TEMPLATE |
| Sangli | Stay | Sangli Green Valley Homestay | 93 | `demo_hotels` | GENERIC_TEMPLATE |
| Sangli | Stay | Sangli Travellers Haven Inn | 93 | `demo_hotels` | GENERIC_TEMPLATE |
| Sangli | Stay | Sangli Royal Heritage Residency | 93 | `demo_hotels` | GENERIC_TEMPLATE |
| Sangli | Stay | Sangli The Grand Vista Resort | 93 | `demo_hotels` | GENERIC_TEMPLATE |
| Sangli | Stay | Sangli Elysium Luxury Retreat & Spa | 93 | `demo_hotels` | GENERIC_TEMPLATE |
| Pune | Stay | Pune Backpacker Hosteller | 92 | `demo_hotels` | GENERIC_TEMPLATE |
| Pune | Stay | Pune Comfort Pine Guest House | 92 | `demo_hotels` | GENERIC_TEMPLATE |


*Audit automatically generated for NAVIX V3 Runtime & Content Integrity Repair.*
