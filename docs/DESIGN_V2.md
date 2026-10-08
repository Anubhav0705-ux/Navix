# NAVIX — Design System Specification V2

> **Brand Tagline**: *"Go farther. Spend smarter."*  
> **Secondary Message**: *"Tell us your budget. We’ll build the journey."*

---

## 1. Brand Personality & Tone

NAVIX is a cinematic, algorithmic, budget-first travel planning platform for India.

- **Attributes**: ADVENTUROUS • SMART • YOUTHFUL • PREMIUM • EDITORIAL • PLAYFUL • TRAVEL-OBSESSED • TECH-POWERED BUT HUMAN
- **Emotional Core**: Invites the user to dream: *"I want to travel."* rather than feeling *"This is a technical algorithm project."*
- **Copy Guidelines**: Use active, inspiring travel copy (*"Routes worth taking."*, *"Small-city starts. Big journeys."*, *"One budget. A whole adventure."*). Avoid generic AI-style SaaS jargon.

---

## 2. Color System

| Token Name | Hex Code | Contextual Usage |
| :--- | :--- | :--- |
| **Primary Dark** | `#101419` | Near-black charcoal background for cinematic hero, nav overlays & dark CTAs |
| **Primary Light** | `#F5F0E8` | Warm travel-paper ivory background |
| **Emerald** | `#0FA77A` | Budget success, primary actions, positive surplus, verified route legs |
| **Electric Blue** | `#4D7CFE` | Rail & multi-modal transport routes, primary interactive nodes |
| **Coral** | `#FF6B5D` | Discovery, travel stamps, experiences & highlights |
| **Warm Yellow** | `#F7B955` | Food allocation, hostel highlights, star ratings |
| **Muted Sand** | `#D8CBB8` | Subtle card borders, dividers, route track lines |
| **Text Dark** | `#101828` | Deep readable body & heading text |

---

## 3. Typography System

- **Primary UI Font**: `Manrope` or `Space Grotesk` (clean, readable sans-serif for UI controls, inputs, data cards).
- **Editorial Accent Font**: `Instrument Serif` or `Playfair Display` (used strictly for emotional/editorial emphasis e.g., *"GO FARTHER. Spend smarter."*).
- **Rule**: Never make every heading serif. Use serif selectively to create contrast and editorial luxury.

---

## 4. Visual Elements & Travel Patterns

1. **Cinematic Image Panels**: Full-screen or large photographic surfaces with dark gradients, coordinates, and stamp badges.
2. **Travel Stamp Badges**: Pill badges with uppercase font (`HIMACHAL`, `UNDER ₹20K`, `7 DAYS`, `TRAIN + BUS`, `BACKPACKER PICK`).
3. **Animated Route Lines**: SVG transit route connectors with origin, layover, and destination nodes that animate path drawing on load.
4. **Subtle Travel Doodles**: SVG decorations (compass points, mountain line sketches, destination pin accents).
5. **Photo Cards**: Card components prioritizing full-cover imagery over heavy box borders.

---

## 5. Motion & Animation System

- **Hero Zoom/Parallax**: Subtle CSS scale animation on hero photography (`scale-105` over 10s).
- **Route Line Draw**: Animated SVG `strokeDashdash` offset transition on initial load.
- **Card Hover**: Subtle translateY (`-translate-y-1`) and shadow lift (`shadow-lg`).
- **Loading Overlay**: Translucent dark route animation showing route progress: `Sangli → Miraj → Delhi → Manali`.
- **Accessibility**: Respect `prefers-reduced-motion`.

---

## 6. Layout & Responsive Breakpoints

- **Desktop (1440px / 1280px)**: 85–95vh cinematic hero, 12-column grid system, interactive map side rail.
- **Tablet (1024px / 768px)**: 2-column stacked photo grids, responsive navigation drawer.
- **Mobile (390px)**: Full-screen mobile hero, single column cards, simplified SVG route lines.
