/**
 * NAVIX Financial Engine & Budget Calculation Utility
 *
 * Implements deterministic financial contracts for trip budget allocation:
 * 1. Contingency reserve = exactly 8% of the total user budget cap (R = round(B * 0.08)).
 * 2. Total cost = Non-contingency components (C) + Contingency reserve (R).
 * 3. Feasible budget invariant: C + 0.08 * B <= B  =>  0.92 * B >= C.
 * 4. Minimum required budget = ceil(C / 0.92), with exact integer currency verification
 *    so that (C + round(B_required * 0.08) <= B_required) holds in ONE click with NO circular increases.
 */

export interface BudgetLedgerParams {
  transportCost: number;       // total for all travellers
  stayCost: number;            // hotel price * nights
  foodCost: number;            // food rate * days * travellers
  activitiesCost: number;      // sum of selected entry fees * travellers
  localTransferCost: number;   // local transfer buffer (e.g. 150/day * travellers)
  maximumBudget: number;       // user-defined budget cap (B)
}

export type BudgetStatus = 'COMFORTABLE' | 'TIGHT' | 'OVER BUDGET';

export interface BudgetLedger {
  transportCost: number;
  stayCost: number;
  foodCost: number;
  activitiesCost: number;
  localTransferCost: number;
  nonContingencyTotal: number; // C
  contingencyRate: number;     // 0.08 (8%)
  contingencyReserve: number;  // R = round(B * 0.08)
  totalCost: number;           // T = C + R
  maximumBudget: number;       // B
  remainingBudget: number;     // B - T
  isShortfall: boolean;        // remainingBudget < 0
  shortfallAmount: number;     // max(0, -remainingBudget)
  budgetStatus: BudgetStatus;
  minimumRequiredBudget: number; // minimum B such that C + round(B * 0.08) <= B
}

/**
 * Calculates contingency reserve from budget cap: 8% of B rounded to nearest integer.
 */
export function calculateContingencyReserve(maximumBudget: number): number {
  if (maximumBudget <= 0) return 0;
  return Math.round(maximumBudget * 0.08);
}

/**
 * Calculates minimum required budget to satisfy non-contingency cost C
 * with an 8% contingency buffer:
 *
 * Invariant: C + round(B * 0.08) <= B
 * Base: B >= C / 0.92  =>  B = ceil(C / 0.92)
 *
 * Then verifies integer rounding so that C + round(B * 0.08) <= B strictly holds.
 * This guarantees a ONE-CLICK, completely IDEMPOTENT fix.
 */
export function calculateMinimumFeasibleBudget(nonContingencyCost: number): number {
  if (nonContingencyCost <= 0) return 0;
  let candidate = Math.floor(nonContingencyCost / 0.92);
  let reserve = Math.round(candidate * 0.08);
  while (nonContingencyCost + reserve > candidate) {
    candidate += 1;
    reserve = Math.round(candidate * 0.08);
  }
  return candidate;
}

/**
 * Computes full financial ledger with all breakdown items and health diagnostics.
 */
export function computeBudgetLedger(params: BudgetLedgerParams): BudgetLedger {
  const {
    transportCost,
    stayCost,
    foodCost,
    activitiesCost,
    localTransferCost,
    maximumBudget
  } = params;

  const nonContingencyTotal = transportCost + stayCost + foodCost + activitiesCost + localTransferCost;
  const contingencyReserve = calculateContingencyReserve(maximumBudget);
  const totalCost = nonContingencyTotal + contingencyReserve;
  const remainingBudget = maximumBudget - totalCost;
  const isShortfall = remainingBudget < 0;
  const shortfallAmount = isShortfall ? Math.abs(remainingBudget) : 0;

  let budgetStatus: BudgetStatus = 'COMFORTABLE';
  if (isShortfall) {
    budgetStatus = 'OVER BUDGET';
  } else if (remainingBudget < maximumBudget * 0.1) {
    budgetStatus = 'TIGHT';
  }

  const minimumRequiredBudget = isShortfall
    ? calculateMinimumFeasibleBudget(nonContingencyTotal)
    : maximumBudget;

  return {
    transportCost,
    stayCost,
    foodCost,
    activitiesCost,
    localTransferCost,
    nonContingencyTotal,
    contingencyRate: 0.08,
    contingencyReserve,
    totalCost,
    maximumBudget,
    remainingBudget,
    isShortfall,
    shortfallAmount,
    budgetStatus,
    minimumRequiredBudget,
  };
}
