# NAVIX — Joint Route-Budget-Itinerary Optimization Architecture Specification (V2)

> **Document Type**: Technical Optimization Architecture & Algorithm Design  
> **Status**: Official Technical Design Specification (Phase 6B.3B — Targeted Corrections Pass)  
> **Scope**: Coupled Multimodal Routing, Whole-Trip Budget Optimization & Automated Multi-Day Itinerary Scheduling  
> **Safety Notice**: Design Specification Only — Zero Application Code, PostgreSQL Mutations, or Dependencies Applied.

---

## 1. Executive Summary & Optimization Philosophy

NAVIX creates complete, practical, budget-constrained multimodal trip plans for Indian travelers. The core technical proposition is solving **Joint Multimodal Route Selection, Whole-Trip Expense Allocation, and Time-Dependent Activity Scheduling** subject to a strict hard maximum budget constraint:

$$\text{Total Trip Cost (Post-Scheduling)} \le \text{User Maximum Budget } (B_{\text{max}})$$

Phase 6B.3A established the date-scoped, multi-criteria Pareto multimodal routing engine. Phase 6B.3B defines how candidate Pareto routes feed into whole-trip budget optimization and automated multi-day itinerary construction.

```mermaid
flowchart TD
    Req[User Request\nOrigin, Dest, Dates, B_max, Party, Preferences] --> RoutingEngine[Phase 6B.3A Multimodal Routing Engine]
    RoutingEngine --> ParetoCandidates[Candidate Transport Routes\n(Cheapest, Faster, Balanced)]
    
    ParetoCandidates --> FeedbackLoop{Joint Optimization & Feedback Loop\n(Max 4 Iterations + Oscillation Hash Detection)}
    
    subgraph FeedbackLoop[Joint Optimization & Feedback Loop]
        B_Opt[Whole-Trip Budget Optimizer\n(Multiple-Choice Knapsack DP)]
        I_Sched[Auto-Itinerary Scheduler\n(Time-Window & Local Transfer Calculator)]
        Incumbent[Validated Feasible Incumbent Tracker\n(Tracks Best P* with Total Cost <= B_max)]
        
        B_Opt -->|Allocated Stay, Food, Activity Subsets| I_Sched
        I_Sched -->|Recalculated Actual Local Movement & Fees| Incumbent
        Incumbent -->|Cost Delta > Threshold & Iterations Remaining| B_Opt
    end
    
    FeedbackLoop -->|Outcome: CONVERGED_OPTIMAL / FEASIBLE_SUBOPTIMAL| Output[Whole-Trip Plan Response\n(Route, Stay, Dining, Timeline, Explanations)]
    FeedbackLoop -->|Outcome: NON_CONVERGED_INFEASIBLE| Failure[Routing / Budget Shortfall Failure\n(Proven Minimum Cost > B_max)]
```

---

## 2. Hard Feasibility Constraints vs. Soft Utility Maximization

NAVIX strictly separates **Hard Feasibility Constraints** (which must be satisfied for a trip to be valid) from **Soft Utility Objectives** (which are maximized to align with traveler preferences).

### 2.1 Hard Feasibility Constraints ($\mathcal{C}_{\text{hard}}$)

A candidate whole-trip plan $\mathbf{P} = (\mathbf{R}, S, F, A, \mathbf{T})$ is feasible iff ALL hard constraints are satisfied after complete itinerary scheduling:

1. **Strict Budget Invariant (Post-Scheduling)**:
   $$\text{Cost}_{\text{total}}(\mathbf{P}) = C_{\text{transit}} + C_{\text{local}} + C_{\text{stay}} + C_{\text{food}} + C_{\text{act}} + C_{\text{fees}} + C_{\text{contingency}} \le B_{\text{max}}$$
   *Rule*: Local movement costs $C_{\text{local}}$ and mandatory fees $C_{\text{fees}}$ calculated by the itinerary scheduler must be reconciled into $\text{Cost}_{\text{total}}(\mathbf{P})$. A plan is rejected if $\text{Cost}_{\text{total}}(\mathbf{P}) > B_{\text{max}}$.
2. **Mandatory Transit Schedule Window**:
   No scheduled itinerary event $e$ may overlap with an active intercity transit segment:
   $$[t_{\text{start}}(e), t_{\text{end}}(e)] \cap [t_{\text{dep}}(\text{transit}), t_{\text{arr}}(\text{transit})] = \emptyset$$
3. **Event Non-Overlap Invariant**:
   For any two itinerary events $e_i, e_j$ on day $d$:
   $$[t_{\text{start}}(e_i), t_{\text{end}}(e_i)] \cap [t_{\text{start}}(e_j), t_{\text{end}}(e_j)] = \emptyset \quad \forall i \neq j$$
4. **Timezone-Aware Operating Hours**:
   For every scheduled activity $a$ at location $L$ on date $d$:
   $$t_{\text{start}}(a) \ge t_{\text{open}}(L, d) \quad \text{AND} \quad t_{\text{end}}(a) \le t_{\text{close}}(L, d)$$
   evaluated in the destination agency's local timezone.
5. **Daily Exploration Pace Capacity**:
   Total active exploration minutes on day $d$ cannot exceed pace limits:
   $$\sum_{a \in A_d} \text{duration}(a) \le \text{MaxActiveMins}(\text{Pace})$$

### 2.2 Soft Utility Maximization Objective ($U(\mathbf{P})$)

When multiple feasible whole-trip plans satisfy $\mathcal{C}_{\text{hard}}$, NAVIX selects the plan maximizing **Multi-Attribute Preference Utility**:

$$\max U(\mathbf{P}) = w_r U_{\text{route}}(\mathbf{R}) + w_s U_{\text{stay}}(S, P_{\text{stay}}) + w_f U_{\text{food}}(F, P_{\text{food}}) + w_a U_{\text{act}}(A, P_{\text{act}}) - P_{\text{travel}}(\mathbf{T})$$

Where:
- $U_{\text{route}}(\mathbf{R})$: Route preference score (favoring faster elapsed time and fewer transfers).
- $U_{\text{stay}}(S, P_{\text{stay}})$: Stay tier preference alignment score ($+40$ exact match, $+35$ upgrade, $-15/\text{tier}$ downgrade).
- $U_{\text{food}}(F, P_{\text{food}})$: Food tier preference alignment score ($+30$ exact match, $+25$ upgrade, $-12/\text{tier}$ downgrade).
- $U_{\text{act}}(A, P_{\text{act}})$: Experience utility sum of scheduled activities plus must-visit bonus ($+50$ per must-visit item).
- $P_{\text{travel}}(\mathbf{T})$: Local travel penalty ($-1$ point per 10 minutes of estimated local transfer time).

---

## 3. Candidate Route Preservation & Downstream Pruning Semantics

### Mathematical Limits of Transport-Only Pareto Pruning
Transport-only Pareto dominance (optimizing Fare Cost, Travel Time, and Transfers) is **not automatically sufficient** for whole-trip optimization. A transit route that is slightly more expensive or slower might arrive at 08:00 AM instead of 11:30 PM, eliminating an entire mandatory hotel night ($C_{\text{stay}}$) or placing the traveler closer to high-utility activities.

Therefore:
1. **Bounded Candidate Generation**: The routing engine passes a bounded set of non-dominated candidates across arrival time windows and arrival facilities to the budget optimizer.
2. **Pruning Safety Disclosure**: Pruning transport routes purely on transit fare and duration is an **approximate candidate selection heuristic**, not a mathematically complete global search, unless downstream stay and arrival-time consequences are explicitly represented in the label state.

---

## 4. Bounded Iterative Refinement Policy & Loop Stability

To ensure the feedback loop between budget allocation and itinerary local transport recalculation never permits a budget violation or infinite oscillation:

```mermaid
flowchart TD
    Start[Start Loop: Iteration k = 1] --> RunDP[Run MCKP Budget DP Solver]
    RunDP --> RunSched[Run Auto-Itinerary Scheduler\nCalculate Actual Local Spend C_local & Fees]
    RunSched --> TotalCheck{Is Total Cost <= B_max?}
    
    TotalCheck -- Yes --> UpdateIncumbent[Update Validated Feasible Incumbent P*]
    TotalCheck -- No --> Reject[Reject Current Allocation\n(Do Not Update Incumbent)]
    
    UpdateIncumbent --> HashCheck{State Hash Repeated\nOR Delta C_local <= Threshold?}
    Reject --> IterCheck
    
    HashCheck -- Yes (Converged) --> ExitOptimal[Return CONVERGED_OPTIMAL P*]
    HashCheck -- No --> IterCheck{Iteration k >= K_max (4)?}
    
    IterCheck -- Yes (Cap Reached) --> CheckIncumbent{Has Valid Incumbent P*?}
    IterCheck -- No --> Incr[k = k + 1] --> RunDP
    
    CheckIncumbent -- Yes --> ExitSuboptimal[Return FEASIBLE_SUBOPTIMAL P*]
    CheckIncumbent -- No --> ExitInfeasible[Return NON_CONVERGED_INFEASIBLE]
```

### 4.1 Convergence & Oscillation Controls
1. **Convergence Threshold**:
   Convergence occurs when the change in local movement cost between iterations satisfies:
   $$\left| C_{\text{local}}^{(k+1)} - C_{\text{local}}^{(k)} \right| \le \epsilon \quad (\epsilon = \text{Rs. } 50.00)$$
2. **Cycle & Oscillation Detection**:
   The engine computes an iteration state hash $H^{(k)} = \text{MD5}(S^{(k)}, F^{(k)}, A^{(k)}, C_{\text{local}}^{(k)})$. If $H^{(k+1)} \in \{H^{(1)}, \dots, H^{(k)}\}$, a cycle is detected and iteration terminates immediately.
3. **Validated Feasible Incumbent Policy**:
   The system maintains `validated_feasible_incumbent` $\mathbf{P}^*$. An candidate allocation update is accepted as incumbent **only if** $C_{\text{total}}(\mathbf{P}) \le B_{\text{max}}$ post-scheduling. If iteration $k$ exceeds $B_{\text{max}}$, it is rejected, and the solver rolls back to $\mathbf{P}^*$.
4. **Outcome Classifications**:
   - `CONVERGED_OPTIMAL`: Feedback loop converged within $K_{\max} = 4$ iterations with $C_{\text{total}} \le B_{\text{max}}$.
   - `FEASIBLE_SUBOPTIMAL`: Iteration cap reached or cycle detected, returning the best validated feasible incumbent $\mathbf{P}^*$.
   - `NON_CONVERGED_INFEASIBLE`: No iteration produced a validated plan satisfying $C_{\text{total}} \le B_{\text{max}}$.

---

## 5. Algorithm Evaluation & Performance Target Disclosures

All latency and performance figures are explicitly classified as **PROPOSED TARGET BENCHMARK OBJECTIVES**:

| Algorithm Paradigm | Formulation Fit | Theoretical Complexity | Target Performance Objective | Optimality Scope & Disclosures |
| :--- | :--- | :--- | :--- | :--- |
| **Bounded Dynamic Programming (MCKP)** | Discrete expense tiers (Stay, Food, Activity subsets). | $O(N \log N + N \cdot B / \delta)$ | $<50\text{ ms}$ (Target Objective) | Exact optimal for discretized budget choices; subject to candidate route pruning bounds. |
| **Branch-and-Bound Day Scheduler** | Attraction order & opening hours. | $O(A!)$ worst-case | $<30\text{ ms}$ (Target Objective) | Exact optimal for daily timeline order given activity subset $A$. |
| **Time-Indexed CP/MIP** | Single joint solver for route, stay, food & timeline. | $N P$-hard exponential | Target Objective: $<2,000\text{ ms}$ | Globally exact across all choices; evaluated as future benchmark baseline. |
| **Probabilistic / LLM Generator** | Prompt-based itinerary creation. | Non-deterministic | N/A | **REJECTED**: Zero mathematical correctness guarantee. Violates project AGENTS.md rules. |

---

## 6. Proved Shortfall Diagnostics & Decision Explanations

1. **Proven Minimum Cost Bound**:
   Before emitting a `BUDGET_TOO_LOW` failure, the system proves that minimum mandatory expenses exceed $B_{\text{max}}$:
   $$C_{\text{mandatory, min}} = C_{\text{transit, min}} + C_{\text{stay, min}} + C_{\text{food, min}} + C_{\text{local, min}} + C_{\text{fees, min}} > B_{\text{max}}$$
2. **Shortfall Diagnostic Payload**:
   $$\text{Proven Shortfall} = C_{\text{mandatory, min}} - B_{\text{max}}$$
   Emits structured remediation suggestions (*"Increase budget by ₹X"*, *"Shift travel date by 2 days"*).
