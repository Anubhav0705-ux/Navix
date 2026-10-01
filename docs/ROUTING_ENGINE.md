# NAVIX Routing Engine Architecture

> **Viva / Academic Defense Reference**: This document describes the deterministic multi-modal time-dependent route search engine powering NAVIX.

---

## 1. Graph Representation

NAVIX models transit networks as a **Time-Dependent Multi-Modal Directed Graph** $G = (V, E)$.

- **Nodes ($V$)**: Represent physical transit hubs and stations ($v \in V$), storing geographic coordinates $(\text{latitude}, \text{longitude})$ and city location.
- **Edges ($E$)**: Represent specific scheduled transit departures ($e \in E$). Unlike static road network graphs, an edge $e$ is valid only if departure time $t_{\text{dep}}(e)$ satisfies chronological and layover constraints relative to the arrival time of the preceding leg.

Each edge $e = (u, v, t_{\text{dep}}, t_{\text{arr}}, c, m, p)$ contains:
- $u, v$: Source and Destination node IDs
- $t_{\text{dep}}, t_{\text{arr}}$: Scheduled Departure and Arrival timestamps
- $c$: Base monetary fare (INR)
- $m$: Inferred transport mode (`TRAIN`, `BUS`, `METRO`, `LOCAL`)
- $p$: Provider / Operator name

---

## 2. Transfer Validation Engine

Layover validation is enforced deterministically via `validate_transfer(...)`. Connections are categorized into three statuses:

1. **`INVALID`**: $t_{\text{dep}}^{\text{next}} \le t_{\text{arr}}^{\text{prev}}$ (Chronologically impossible).
2. **`TIGHT`**: $t_{\text{dep}}^{\text{next}} > t_{\text{arr}}^{\text{prev}}$, but layover $< \Delta t_{\text{required}}$ (High risk of missed connection).
3. **`SAFE`**: layover $\ge \Delta t_{\text{required}}$ (Fully validated safe transfer).

### Minimum Required Transfer Buffers ($\Delta t_{\text{required}}$)
- **Local-to-Local**: 15 minutes
- **Same Terminal & Mode**: 20 minutes
- **Train-to-Bus / Bus-to-Train (Same Hub)**: 45 minutes
- **Inter-Terminal Transfer (e.g. Railway Station to ISBT Bus Stand)**: 60 minutes

> **Rule**: In recommended itineraries, ONLY `SAFE` connections are accepted. Both `TIGHT` and `INVALID` edges are strictly pruned during graph traversal.

---

## 3. Time-Dependent A* Algorithm & State Space

The primary search algorithm is **Time-Dependent A***.

### Search State
Each state in the priority queue is represented by:
$$S = (g(S), f(S), u, t_{\text{curr}}, C_{\text{total}}, T_{\text{travel}}, T_{\text{layover}}, \text{segments})$$

where:
- $u$: Current node ID
- $t_{\text{curr}}$: Current arrival timestamp at node $u$
- $C_{\text{total}}$: Accumulated transport cost
- $g(S)$: Accumulated profile score
- $f(S) = g(S) + h(S)$: Total estimated path cost

---

## 4. Admissible Heuristic ($h(S)$)

To guarantee optimal pathfinding without overestimating remaining cost, NAVIX uses a **Geographic Haversine Heuristic**:

$$\text{dist}_{\text{km}} = \text{Haversine}((\text{lat}_u, \text{lon}_u), (\text{lat}_{\text{target}}, \text{lon}_{\text{target}}))$$

Underestimates remaining travel time and cost using optimistic bounds:
- **Max Assumed Speed**: $V_{\text{max}} = 150 \text{ km/h}$
- **Min Assumed Fare Rate**: $R_{\text{min}} = \text{Rs. } 0.30 \text{ / km}$

$$\text{time}_{\text{est}} = \frac{\text{dist}_{\text{km}}}{V_{\text{max}}} \times 60 \text{ min}$$
$$\text{cost}_{\text{est}} = \text{dist}_{\text{km}} \times R_{\text{min}}$$

Because $\text{dist}_{\text{km}} \le \text{actual network distance}$, $V_{\text{max}} \ge \text{actual speed}$, and $R_{\text{min}} \le \text{actual fare}$, the heuristic is strictly **admissible** ($h(n) \le h^*(n)$), ensuring A* optimality.

---

## 5. Optimization Profiles & Scoring

Profiles modulate the scoring function $g(S) = w_{\text{cost}} \cdot \hat{C} + w_{\text{dur}} \cdot \hat{T} + w_{\text{tx}} \cdot \hat{X}$:

| Profile | Cost Weight ($w_{\text{cost}}$) | Duration Weight ($w_{\text{dur}}$) | Transfer Weight ($w_{\text{tx}}$) | Primary Objective |
| --- | --- | --- | --- | --- |
| **`CHEAPEST`** | `0.70` | `0.20` | `0.10` | Minimizes total transport fare |
| **`FASTER`** | `0.15` | `0.70` | `0.15` | Minimizes total elapsed journey time |
| **`BALANCED`** | `0.40` | `0.40` | `0.20` | Harmonious trade-off |

---

## 6. Hard Transport Budget Constraint

If a request specifies `max_transport_budget`, any candidate search path where:
$$C_{\text{accumulated}} + c(e) > \text{max\_transport\_budget}$$

is immediately pruned. If no valid path satisfies the budget cap, the engine raises a structured `TRANSPORT_BUDGET_TOO_LOW` exception.

---

## 7. Dijkstra Fallback

A Dijkstra baseline search is supported by setting $h(S) = 0.0$. Dijkstra acts as a reference baseline for algorithm correctness verification.

---

## 8. API Endpoint

`POST /api/v1/routes/search`

### Example Request Body
```json
{
  "origin": "Sangli",
  "destination": "Old Manali",
  "profile": "BALANCED",
  "max_transport_budget": 5000,
  "departure_time": "2026-09-01T00:00:00"
}
```
