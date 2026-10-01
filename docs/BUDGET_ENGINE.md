# NAVIX Whole-Trip Budget Engine Architecture

> **Viva / Academic Defense Reference**: This document describes the deterministic constrained optimization and Dynamic Programming engine that enforces NAVIX's core proposition:
> $$\text{Total Trip Cost} \le \text{User Maximum Budget}$$

---

## 1. Hard Budget Invariant

NAVIX treats the maximum budget constraint as a **hard mathematical invariant**:

$$\text{Cost}_{\text{total}} = C_{\text{transport}} + C_{\text{stay}} + C_{\text{food}} + C_{\text{activities}} + C_{\text{local}} + C_{\text{contingency}} \le B_{\text{max}}$$

An itinerary is rejected or downgraded if $\text{Cost}_{\text{total}} > B_{\text{max}}$. Under no circumstances does a recommended plan exceed $B_{\text{max}}$.

---

## 2. Mandatory vs. Optional Costs

Before optimizing optional upgrades, the engine computes **Minimum Mandatory Costs**:

1. **Transport ($C_{\text{transport}}$)**: Evaluated by the time-dependent A* routing engine ($\text{fare} \times N_{\text{travellers}}$).
2. **Local Transport ($C_{\text{local}}$)**: Unavoidable city transfers (₹100/day/person).
3. **Minimum Stay ($C_{\text{stay, min}}$)**: Budget tier lodging ($\text{Rs. } 500/\text{night} \times N_{\text{nights}}$).
4. **Minimum Food ($C_{\text{food, min}}$)**: Basic tier dining ($\text{Rs. } 300/\text{day} \times N_{\text{days}} \times N_{\text{travellers}}$).

$$\text{Cost}_{\text{mandatory}} = C_{\text{transport}} + C_{\text{local}} + C_{\text{stay, min}} + C_{\text{food, min}}$$

If $\text{Cost}_{\text{mandatory}} > B_{\text{max}}$, the engine immediately aborts and returns `BUDGET_TOO_LOW` with exact shortfall details:
$$\text{Shortfall} = \text{Cost}_{\text{mandatory}} - B_{\text{max}}$$

---

## 3. Constrained DP / Knapsack Optimization

When $\text{Cost}_{\text{mandatory}} \le B_{\text{max}}$, the optimizer performs constrained state-space optimization over candidate choice vectors $(S, F, A)$:
- $S \in \{\text{Budget}, \text{Standard}, \text{Comfort}\}$ (Lodging tier)
- $F \in \{\text{Basic}, \text{Balanced}, \text{Flexible}\}$ (Dining tier)
- $A \subseteq \text{ACTIVITY\_OPTIONS}$ (Activity subsets)

### Objective Function
Maximize **Preference Utility**:

$$U(S, F, A) = U_{\text{stay}}(S, P_{\text{stay}}) + U_{\text{food}}(F, P_{\text{food}}) + U_{\text{act}}(A, P_{\text{act}})$$

subject to:
$$\text{Cost}_{\text{total}}(S, F, A) \le B_{\text{max}}$$

---

## 4. Preference Utility Scoring

- **Stay Utility ($U_{\text{stay}}$)**: Exact match = 40 pts, Upgrade = 35 pts, Downgrade penalty = $-15 \text{ pts/level}$.
- **Food Utility ($U_{\text{food}}$)**: Exact match = 30 pts, Upgrade = 25 pts, Downgrade penalty = $-12 \text{ pts/level}$.
- **Activity Utility ($U_{\text{act}}$)**: Sum of activity values plus preference count alignment score.

---

## 5. Cost Scaling & Trip Calculation

- **Traveller Count ($N_{\text{travellers}}$)**:
  - Transport, Food, Activities, Local Transport scale **per person**.
  - Accommodation is calculated per room/night.
- **Trip Duration**:
  - $N_{\text{days}} = (\text{return\_date} - \text{departure\_date}).\text{days} + 1$
  - $N_{\text{nights}} = (\text{return\_date} - \text{departure\_date}).\text{days}$

---

## 6. Budget Health Status

Remaining funds $R = B_{\text{max}} - \text{Cost}_{\text{total}}$ determine budget health:
- **`COMFORTABLE`**: $R / B_{\text{max}} \ge 0.15$ (Remaining funds $\ge 15\%$)
- **`TIGHT`**: $0 \le R / B_{\text{max}} < 0.15$ (Remaining funds $< 15\%$)
- **`EXCEEDED`**: Never returned in a successful plan.

---

## 7. API Endpoint

`POST /api/v1/trips/plan`

### Request Payload Example
```json
{
  "origin": "Sangli",
  "destination": "Old Manali",
  "departure_date": "2026-12-12",
  "return_date": "2026-12-18",
  "travellers": 1,
  "maximum_budget": 20000,
  "profile": "BALANCED",
  "stay_preference": "STANDARD",
  "food_preference": "BALANCED",
  "activity_preference": "MEDIUM"
}
```
