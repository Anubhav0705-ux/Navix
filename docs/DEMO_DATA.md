# NAVIX Demo Transit & Supporting Dataset

> **Academic Disclaimer**: All transit schedules, route connection times, and fare prices contained in this dataset are realistic, deterministic **academic demo data** designed for multi-modal constraint routing algorithms. They are not live real-time API feeds.

---

## 1. Hubs (Transit Nodes)

| Node ID | Node Name | City | Latitude | Longitude | Type |
| --- | --- | --- | --- | --- | --- |
| `node_SLI` | Sangli Station | Sangli | `16.8524` | `74.5815` | Origin Hub |
| `node_MRJ` | Miraj Junction | Miraj | `16.8202` | `74.6468` | Rail Transfer |
| `node_PUNE` | Pune Central | Pune | `18.5204` | `73.8567` | Major Transit Hub |
| `node_MUM` | Mumbai CSMT | Mumbai | `18.9400` | `72.8354` | Metro Hub |
| `node_DEL` | New Delhi Railway Station | Delhi | `28.6430` | `77.2194` | Major Rail Hub |
| `node_DEL_BUS` | Kashmiri Gate ISBT | Delhi | `28.6675` | `77.2285` | Interstate Bus Terminal |
| `node_IXC` | Chandigarh Junction | Chandigarh | `30.7046` | `76.8013` | Intermediate Rail/Bus Hub |
| `node_MNL_BUS` | Manali ISBT Bus Stand | Manali | `32.2396` | `77.1887` | Destination Bus Hub |
| `node_OLD_MNL` | Old Manali Hub | Old Manali | `32.2548` | `77.1751` | Final Destination |

---

## 2. Route Options & Alternatives

### Option A: Sangli → Miraj → Delhi → Manali → Old Manali (Balanced)
- `sch_101`: Local Auto (Sangli → Miraj, 30m, ₹50.00)
- `sch_102`: Goa Express Train (Miraj → Delhi, 23h, ₹750.00)
- `sch_103`: Delhi Metro (Delhi Station → ISBT, 30m, ₹40.00)
- `sch_104`: HRTC Volvo Bus (ISBT → Manali, 12h, ₹1,200.00) — *2-hour safe layover*
- `sch_105`: Local Shuttle (Manali Bus Stand → Old Manali, 15m, ₹150.00)
- **Total Duration**: ~36 hours | **Total Transit Cost**: ₹2,190.00

### Option B: Sangli → Pune → Delhi → Manali → Old Manali (Cheaper / Slower)
- `sch_100`: Train (Sangli → Pune, 4.5h, ₹350.00)
- `sch_106`: Jhelum Express Train (Pune → Delhi, 27h, ₹600.00)
- `sch_107`: Delhi Metro (Delhi Station → ISBT, 30m, ₹40.00)
- `sch_108`: Night AC Sleeper Bus (ISBT → Manali, 12h, ₹1,100.00)
- `sch_109`: Shared Shuttle (Manali Bus Stand → Old Manali, 15m, ₹100.00)
- **Total Duration**: ~44 hours | **Total Transit Cost**: ₹2,190.00

### Option C: Sangli → Mumbai → Delhi → Chandigarh → Manali → Old Manali (Express / Premium)
- `sch_110`: Mahalaxmi Express Train (Sangli → Mumbai, 10h, ₹450.00)
- `sch_111`: Rajdhani Express (Mumbai → Delhi, 16.5h, ₹1,800.00)
- `sch_112`: Vande Bharat Express (Delhi → Chandigarh, 3.25h, ₹850.00)
- `sch_113`: HRTC Himmani Deluxe Bus (Chandigarh → Manali, 8h, ₹800.00)
- `sch_114`: Night Cab (Manali Bus Stand → Old Manali, 15m, ₹150.00)
- **Total Duration**: ~38 hours | **Total Transit Cost**: ₹4,050.00

---

## 3. Layover Validation Scenarios

- **Safe Layover**: `sch_103` arrives at `node_DEL_BUS` at `08:00`; `sch_104` departs `node_DEL_BUS` at `10:00` (Layover = 120 min $\ge$ 30 min minimum requirement: **VALID**).
- **Tight Layover**: `sch_115` arrives at `node_DEL_BUS` at `09:45`; `sch_104` departs `node_DEL_BUS` at `10:00` (Layover = 15 min $<$ 30 min minimum requirement: **TIGHT / REJECTED**).
- **Invalid Connection**: `sch_116` departs `node_DEL_BUS` at `07:15`; `sch_103` arrives at `08:00` (Departure before arrival: **INVALID**).

---

## 4. Seeding & Idempotency

### Execution Command
```bash
python -m app.seed.seed_demo_data
```

### Idempotency Guarantee
The seeder inspects primary keys (`node_id`, `schedule_id`) against existing database records prior to inserting. Running the seed command multiple times yields 0 duplicate insertions and zero modifications to existing rows.
