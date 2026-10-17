import { test, expect } from '@playwright/test';
import {
  calculateContingencyReserve,
  calculateMinimumFeasibleBudget,
  computeBudgetLedger
} from '../src/lib/budgetCalculator';

test.describe('NAVIX Budget Calculation & Contingency Contract', () => {
  test('Contingency Reserve is exactly 8% of budget cap', () => {
    expect(calculateContingencyReserve(25000)).toBe(2000);
    expect(calculateContingencyReserve(24000)).toBe(1920);
    expect(calculateContingencyReserve(10000)).toBe(800);
    expect(calculateContingencyReserve(0)).toBe(0);
  });

  test('Calculates minimum feasible budget in ONE click for C=23,000', () => {
    // Phase 5 concrete example:
    // C = 23,000, current budget = 24,000, old reserve = 1,920, required = 24,920 (exceeds budget)
    const nonContingency = 23000;
    const minBudget = calculateMinimumFeasibleBudget(nonContingency);
    expect(minBudget).toBe(25000);

    const reserve = calculateContingencyReserve(minBudget);
    expect(reserve).toBe(2000);
    expect(nonContingency + reserve).toBe(25000);
    expect(nonContingency + reserve).toBeLessThanOrEqual(minBudget);
  });

  test('Guarantees nonContingency + reserve <= minBudget invariant holds for edge cases', () => {
    const testCases = [1, 50, 499, 500, 1000, 12345, 18400, 23000, 47891, 100000];
    for (const c of testCases) {
      const minB = calculateMinimumFeasibleBudget(c);
      const r = calculateContingencyReserve(minB);
      expect(c + r).toBeLessThanOrEqual(minB);

      // Verify that minB - 1 would NOT be sufficient
      const lowerB = minB - 1;
      const lowerR = calculateContingencyReserve(lowerB);
      expect(c + lowerR).toBeGreaterThan(lowerB);
    }
  });

  test('Budget ledger correctly identifies over budget and provides 1-click resolution', () => {
    const ledger = computeBudgetLedger({
      transportCost: 6000,
      stayCost: 8000,
      foodCost: 6000,
      activitiesCost: 2000,
      localTransferCost: 1000,
      maximumBudget: 24000
    });

    // Total non-contingency C = 23,000
    expect(ledger.nonContingencyTotal).toBe(23000);
    // At B=24,000, reserve = 1,920 => Total = 24,920 > 24,000
    expect(ledger.contingencyReserve).toBe(1920);
    expect(ledger.totalCost).toBe(24920);
    expect(ledger.isShortfall).toBe(true);
    expect(ledger.shortfallAmount).toBe(920);
    expect(ledger.budgetStatus).toBe('OVER BUDGET');

    // 1-Click resolution gives minimum required budget: 25,000
    expect(ledger.minimumRequiredBudget).toBe(25000);

    // Apply the 1-click correction:
    const resolvedLedger = computeBudgetLedger({
      transportCost: 6000,
      stayCost: 8000,
      foodCost: 6000,
      activitiesCost: 2000,
      localTransferCost: 1000,
      maximumBudget: ledger.minimumRequiredBudget
    });

    expect(resolvedLedger.isShortfall).toBe(false);
    expect(resolvedLedger.shortfallAmount).toBe(0);
    expect(resolvedLedger.totalCost).toBe(25000);
    expect(resolvedLedger.maximumBudget).toBe(25000);
    expect(resolvedLedger.remainingBudget).toBe(0);
    expect(resolvedLedger.budgetStatus).not.toBe('OVER BUDGET');

    // Verify IDEMPOTENCY: Re-evaluating with 25,000 does NOT increase budget further!
    expect(resolvedLedger.minimumRequiredBudget).toBe(25000);
  });
});
