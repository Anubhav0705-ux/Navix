# NAVIX — Whole-Trip Optimization Verification & Benchmark Plan

> **Document Type**: Technical Verification Architecture & Test Specification  
> **Status**: Official Technical Design Specification (Phase 6B.3B — Targeted Corrections Pass)  
> **Scope**: Mathematical Invariants, Reference Oracles, Proposed Benchmark Targets & Expanded Deterministic Regression Scenarios  
> **Safety Notice**: Design Specification Only — Zero Application Code or PostgreSQL Mutations Executed.

---

## 1. Mathematical Invariants & Verification Matrix

Every generated whole-trip plan must satisfy five fundamental mathematical invariants:

```mermaid
flowchart TD
    Plan[Generated Whole-Trip Plan] --> Inv1[1. Non-Negativity Invariant\nAll category costs >= 0.0]
    Plan --> Inv2[2. Exact Conservation Invariant\nTotal Cost = Sum(Ledger Items) + Contingency]
    Plan --> Inv3[3. Hard Budget Invariant\nTotal Cost <= Maximum Budget]
    Plan --> Inv4[4. Timeline Non-Overlap Invariant\n[t1_s, t1_e] ^ [t2_s, t2_e] = Empty]
    Plan --> Inv5[5. Non-Zero Missing Price Invariant\nMissing prices marked missing, never silent zero]
    
    Inv1 --> Assert[100% Automated Test Pass Required]
    Inv2 --> Assert
    Inv3 --> Assert
    Inv4 --> Assert
    Inv5 --> Assert
```

### Invariant Definitions

1. **Non-Negativity Invariant**:
   $$\forall c \in \{C_{\text{transit}}, C_{\text{local}}, C_{\text{stay}}, C_{\text{food}}, C_{\text{act}}, C_{\text{fees}}, C_{\text{contingency}}\}, \quad c \ge 0.0$$
2. **Exact Conservation of Money Invariant**:
   $$C_{\text{total}} = C_{\text{transit}} + C_{\text{local}} + C_{\text{stay}} + C_{\text{food}} + C_{\text{act}} + C_{\text{fees}} + C_{\text{contingency}}$$
   $$\text{Remaining Budget } R = B_{\text{max}} - C_{\text{total}}$$
3. **Hard Budget Invariant (Post-Scheduling)**:
   $$C_{\text{total}} \le B_{\text{max}}$$
4. **Timeline Non-Overlap Invariant**:
   $$\forall e_i, e_j \text{ on Day } d, \quad i \neq j \implies [t_{\text{start}}(e_i), t_{\text{end}}(e_i)] \cap [t_{\text{start}}(e_j), t_{\text{end}}(e_j)] = \emptyset$$
5. **Non-Zero Missing Price Invariant**:
   If an expense category is uncalculated or unpriced, `is_missing = True`, and the category is attributed to `MISSING_DATA` state. Missing items must NOT be silently set to ₹0.00 in guaranteed totals.

---

## 2. Independent Reference Oracles & Verification Harness

To verify that the Multiple-Choice Knapsack DP optimizer and greedy day scheduler yield mathematically valid solutions without bugs:

### 2.1 Brute-Force Integer Programming / Grid Search Reference Oracle (`test_budget_oracle.py`)
- *Objective*: On small decision instances (3 stay tiers $\times$ 3 food tiers $\times$ 8 activities), run an exhaustive brute-force grid search computing $U(\mathbf{P})$ across all $3 \times 3 \times 2^8 = 2,304$ combinations.
- *Assertion*: The DP optimizer output utility $U_{\text{DP}}$ must match the brute-force global maximum utility $U_{\text{oracle}}^*$:
  $$U_{\text{DP}} == U_{\text{oracle}}^*$$

### 2.2 Timeline Feasibility Oracle (`test_itinerary_oracle.py`)
- *Objective*: Verify that every scheduled event respects attraction operating hours, timezone offsets, and mandatory meal/rest blocks.
- *Assertion*: Zero timeline overlap errors, zero out-of-bounds attraction execution slots.

---

## 3. Standardized Optimization Benchmark Workloads (Proposed Target Objectives)

All performance metrics below represent **PROPOSED TARGET BENCHMARK OBJECTIVES** for Phase 6B implementation, not empirical measurement facts:

| Benchmark Tier | Trip Duration & Scope | Candidate Activities | Target Latency Objective (p95)* | Target Memory Footprint* | Target Search Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Single Day** | 1 Day, Single Destination | 10 Activities | $<15\text{ ms}$ | $<2\text{ MB}$ | Reference Grid Search / DP |
| **Tier 2: Short Break** | 3 Days, 2 Cities | 25 Activities | $<45\text{ ms}$ | $<5\text{ MB}$ | MCKP DP + Day Scheduler |
| **Tier 3: Standard Trip** | 7 Days, 3 Cities | 60 Activities | $<120\text{ ms}$ | $<15\text{ MB}$ | MCKP DP + Day Scheduler |
| **Tier 4: Long Multi-City** | 14 Days, 5 Cities | 150 Activities | $<300\text{ ms}$ | $<35\text{ MB}$ | MCKP DP + Feedback Loop |

*\*Note: Latency and memory metrics represent design target objectives for Phase 6B implementation, not empirically measured runtime benchmarks.*

---

## 4. Extended Deterministic Regression Test Scenarios

The test suite defines ten fixed, reproducible regression test scenarios:

1. **Scenario 1: Sangli $\rightarrow$ Old Manali (Tight Budget Edge Case)**
   - $B_{\text{max}} = \text{Rs. } 15,000$, 7 Days, 1 Adult.
   - Asserts: Allocates `BUDGET` stay and `BASIC` food; emits warning if activities are omitted.
2. **Scenario 2: Bounded & Uncertain Price Evidence Handling**
   - Waitlisted train leg (`RAC-04`) + bounded hotel tariff range [₹1,200 - ₹1,800].
   - Asserts: Response state = `BOUNDED_ESTIMATE` / `UNCERTAIN_PRICE`; `is_guaranteed_payable = False`.
3. **Scenario 3: Complex Group Occupancy & Child Half-Fares**
   - Party: 2 Adults, 3 Children (ages 4, 7, 10), 1 Senior (age 65), 1 Infant (age 1).
   - Asserts: Hotel room occupancy applied correctly; child half-fares calculated per provider rules.
4. **Scenario 4: Transport Arrival Time Impacts on Lodging**
   - Route A arrives at 08:00 AM (Day 1); Route B arrives at 11:30 PM (Day 1).
   - Asserts: Route B includes Day 1 hotel night cost; Route A starts daytime exploration without extra night charge.
5. **Scenario 5: Midnight Boundary & Timezone Transition**
   - GTFS stop time `25:30:00` crossing midnight on day 2.
   - Asserts: Day index incremented by +1 day; event scheduled on correct calendar date.
6. **Scenario 6: Local Route Realism & Mountain Speed Baselines**
   - Sangli (plains $25\text{ km/h}$) vs Old Manali (mountain $18\text{ km/h}$) local transfers.
   - Asserts: Transfer travel times scale appropriately with mountain speed profile.
7. **Scenario 7: Infeasible Must-Visit Attraction Handling**
   - Must-visit attraction closed on travel date (e.g. Taj Mahal on Friday).
   - Asserts: Emits structured warning; schedules alternative candidate without breaking feasibility.
8. **Scenario 8: Solver Non-Convergence & Iteration Rollback**
   - Local transfer cost delta causes iteration 3 to exceed $B_{\text{max}}$.
   - Asserts: Iteration rejected; solver rolls back to best validated feasible incumbent $\mathbf{P}^*$.
9. **Scenario 9: Multi-Currency Ledger Reconciliation**
   - Activity quote in `USD` ($15.00) converted to `INR` at 83.50.
   - Asserts: Full exchange rate provenance (`exchange_rate`, `rate_timestamp_utc`) retained in ledger.
10. **Scenario 10: Legacy API & Database Schema Persistence Compatibility**
    - Submits request via `/api/v1/trips/plan` schema; saves trip to DB.
    - Asserts: Extends `trips` and `budget_allocations` JSONB columns without breaking legacy fields.
