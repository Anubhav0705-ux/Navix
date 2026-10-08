# NAVIX AUTO-ITINERARY INTELLIGENCE ENGINE (PHASE 4)

## Overview

The **NAVIX Auto-Itinerary Intelligence Engine** automatically answers the fundamental travel question:

> **"WHAT should I do, ON WHICH DAY, AT WHAT TIME, IN WHAT ORDER?"**

Unlike legacy manual itinerary planners that require users to drag-and-drop attractions into empty daily slots, NAVIX takes multi-modal routing schedules, budget constraints, travel dates, traveller counts, lodging choices, dining preferences, travel pace, and personality choices, and automatically calculates an optimal, non-overlapping daily timeline.

---

## 1. Problem Formulation

The scheduling problem is formulated as a **Constrained Combinatorial Optimization Problem**:

$$\max \sum_{d=1}^{D} \sum_{a \in \mathcal{A}_d} U(a, \text{prefs})$$

Subject to:

1. **Hard Budget Constraint**:
   $$\text{Total Trip Cost} \le \text{User Maximum Budget}$$

2. **Hard Time Boundary Constraint**:
   No activity $a_i$ or event $e_j$ may overlap with another event or mandatory transit leg:
   $$[t_{\text{start}}(e_i), t_{\text{end}}(e_i)] \cap [t_{\text{start}}(e_j), t_{\text{end}}(e_j)] = \emptyset \quad \forall i \neq j$$

3. **Pace Capacity Constraint**:
   Active exploration minutes per day $\le \text{MaxActiveMins}(\text{Pace})$.

4. **Local Movement Time**:
   Travel time between consecutive destination activities is derived via Haversine distance at $20\text{ km/h}$ average mountain transfer speed.

---

## 2. Hard vs Soft Constraints

| Constraint | Type | Description |
| :--- | :--- | :--- |
| **Total Trip Budget** | `HARD` | $\text{Total Cost} \le \text{Budget Cap}$ guaranteed by Whole-Trip DP Optimizer. |
| **Transit Route Schedule** | `HARD` | Boarding and arrival timestamps for train/bus legs block out non-explorable transit periods. |
| **Event Non-Overlap** | `HARD` | Two events cannot occupy the same minute on the timeline. |
| **Available Window** | `HARD` | Exploration windows on arrival/departure days are restricted by actual arrival/checkout times. |
| **Trip Personality Match** | `SOFT` | $+25$ utility bonus for activities matching selected trip style (e.g. Adventure, Culture). |
| **Must-Have Tags** | `SOFT` | $+20$ utility bonus for activities matching requested preference tags. |
| **Time Window Alignment** | `SOFT` | $+10$ utility bonus for scheduling activities in their recommended demo time window. |
| **Local Travel Minimization**| `SOFT` | $-1$ point per 10 minutes of local transfer time to favor geographically clustered activities. |

---

## 3. Experience Utility Function

For any candidate activity $a$, its experience utility $U(a)$ is computed deterministically:

$$U(a) = U_{\text{base}} + \mathbb{I}_{\text{must}}(a) \cdot 50 + \sum_{p \in \text{Personalities}} \mathbb{I}_{\text{match}}(a, p) \cdot 25 + \mathbb{I}_{\text{tag}}(a) \cdot 20 + \mathbb{I}_{\text{diversity}}(a) \cdot 5 - \text{Penalties}$$

Where:
- $\mathbb{I}_{\text{must}}(a) = 1$ if explicitly selected as must-visit item by user.
- $\mathbb{I}_{\text{match}}(a, p) = 1$ if activity category matches selected trip personality.
- Penalties apply for violating user `avoid` tags (e.g. $-40$ for long treks if "long walks" is avoided).

---

## 4. Pace Model

User pace defines daily activity density and available time bounds:

| Pace Tier | Max Acts / Day | Max Active Mins | Exploration Window | Meal Duration |
| :--- | :--- | :--- | :--- | :--- |
| `RELAXED` | 2 Activities | 240 Mins ($4.0$ hrs) | 10:00 – 17:00 | 90 Mins |
| `BALANCED` | 3 Activities | 360 Mins ($6.0$ hrs) | 09:00 – 19:00 | 60 Mins |
| `PACKED` | 4 Activities | 480 Mins ($8.0$ hrs) | 08:30 – 21:00 | 45 Mins |

---

## 5. Local Transfer Estimation

Local transfer time between activity $A(lat_1, lon_1)$ and activity $B(lat_2, lon_2)$ is calculated using the Haversine formula:

$$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

$$\text{Travel Minutes} = \max\left(10, \text{round}\left(\frac{d}{20\text{ km/h}} \times 60\right) + 10\right)$$

---

## 6. Deterministic Guarantee & Complexity

- **No Non-Deterministic LLMs**: All scheduling, time calculations, and budget allocations are $100\%$ deterministic.
- **Search Complexity**: $O(D \times A \log A)$ where $D$ is total trip days ($7$) and $A$ is catalog activities ($8$). With branch pruning, execution time is $<15\text{ ms}$.

---

## 7. Limitations & Phase 5 Roadmap

- **Live Traffic**: Uses deterministic estimated transfer speeds ($20\text{ km/h}$) rather than real-time traffic APIs.
- **Weather Adjustments**: Static weather baseline; live weather replanning deferred to future releases.
- **Phase 5 Target**: Final Review (Stage 07 Command Center), PDF export enhancement, and saved trip persistence.
