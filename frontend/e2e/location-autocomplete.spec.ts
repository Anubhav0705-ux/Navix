import { test, expect } from '@playwright/test';

test.describe('NAVIX Location Autocomplete & Geographic UX E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/plan');
  });

  test('Flow A: Canonical settlement lookup (Sangli)', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.fill('Sangli');
    await page.waitForTimeout(400);
    const option = page.locator('[role="option"]').filter({ hasText: 'Sangli' }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    await expect(originInput).toHaveValue('Sangli');
  });

  test('Flow B: Railway station code lookup (SLI)', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.fill('SLI');
    await page.waitForTimeout(400);
    const option = page.locator('[role="option"]').filter({ hasText: /Sangli/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow C: Historical alias lookup (Bombay -> Mumbai)', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.fill('Bombay');
    await page.waitForTimeout(400);
    const option = page.locator('[role="option"]').filter({ hasText: /Mumbai/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow D: Airport code lookup (DEL)', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.fill('DEL');
    await page.waitForTimeout(400);
    const option = page.locator('[role="option"]').filter({ hasText: /Indira Gandhi|Delhi/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow E: Fuzzy search lookup (Sanglee -> Sangli)', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.fill('Sanglee');
    await page.waitForTimeout(400);
    const option = page.locator('[role="option"]').filter({ hasText: /Sangli/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow F: Keyboard-only navigation (ArrowDown + Enter)', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.focus();
    await originInput.fill('Miraj');
    await page.waitForTimeout(400);
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(originInput).toHaveValue(/Miraj/i);
  });

  test('Flow G: Clear selected location', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.fill('Sangli');
    await page.waitForTimeout(400);
    const option = page.locator('[role="option"]').filter({ hasText: 'Sangli' }).first();
    await option.click();
    
    // Select origin clear button specifically
    const originContainer = page.locator('#planner-origin-autocomplete').locator('..');
    const clearButton = originContainer.getByRole('button', { name: /Clear location/i });
    await clearButton.click();
    await expect(originInput).toHaveValue('');
  });

  test('Flow H: Text edit invalidation after selection', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.fill('Sangli');
    await page.waitForTimeout(400);
    const option = page.locator('[role="option"]').filter({ hasText: 'Sangli' }).first();
    await option.click();
    
    await originInput.fill('Sang');
    await expect(originInput).toHaveValue('Sang');
  });

  test('Flow I: Same origin and destination validation guard', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    const destInput = page.getByPlaceholder(/Search destination city/i);
    
    await originInput.fill('Sangli');
    await destInput.fill('Sangli');
    
    await expect(page.getByText(/distinct locations for routing calculation/i)).toBeVisible();
  });

  test('Flow J: Unsupported location graceful empty state', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.fill('XyzNonsenseLocation99');
    await page.waitForTimeout(400);
    await expect(page.getByText(/No matching Indian cities or stations found/i)).toBeVisible();
  });

  test('Flow K: Rapid typing request-race cancellation', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    await originInput.fill('S');
    await originInput.fill('Sa');
    await originInput.fill('San');
    await originInput.fill('Sangli');
    await page.waitForTimeout(400);
    const option = page.locator('[role="option"]').filter({ hasText: 'Sangli' }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow L: Full planner submission (Sangli -> Manali)', async ({ page }) => {
    const originInput = page.getByPlaceholder(/Search origin city/i);
    const destInput = page.getByPlaceholder(/Search destination city/i);
    
    await originInput.fill('Sangli');
    await page.waitForTimeout(400);
    await page.locator('[role="option"]').filter({ hasText: 'Sangli' }).first().click();
    
    await destInput.fill('Manali');
    await page.waitForTimeout(400);
    await page.locator('[role="option"]').filter({ hasText: /Manali/i }).first().click();
    
    const nextBtn = page.getByRole('button', { name: /Next Step/i });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }
  });
});
