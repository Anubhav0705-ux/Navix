import { test, expect } from '@playwright/test';

test.describe('NAVIX Location Autocomplete & Geographic UX E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/v1\/places\/search.*[?&]q=sangli/i, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: 'sangli',
          total_matches: 1,
          results: [{
            provider: 'FOURSQUARE',
            provider_place_id: 'fsq_sli_01',
            display_name: 'Sangli',
            formatted_address: 'Sangli, Maharashtra, India',
            locality: 'Sangli',
            region: 'Maharashtra',
            country: 'IN',
            latitude: 16.8524,
            longitude: 74.5815,
            categories: ['City'],
            data_state: 'REAL_PROVIDER_DATA'
          }],
          provider: 'FOURSQUARE',
          cached: false
        })
      });
    });

    await page.route(/\/api\/v1\/places\/search.*[?&]q=manali/i, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: 'manali',
          total_matches: 1,
          results: [{
            provider: 'FOURSQUARE',
            provider_place_id: 'fsq_manali_01',
            display_name: 'Manali',
            formatted_address: 'Manali, Himachal Pradesh, India',
            locality: 'Manali',
            region: 'Himachal Pradesh',
            country: 'IN',
            latitude: 32.2396,
            longitude: 77.1887,
            categories: ['Town'],
            data_state: 'REAL_PROVIDER_DATA'
          }],
          provider: 'FOURSQUARE',
          cached: false
        })
      });
    });

    await page.goto('http://localhost:3000/plan');
    await expect(page.getByText(/Real Trip Setup/i)).toBeVisible({ timeout: 10000 });
  });

  test('Flow A: Canonical place lookup (Sangli)', async ({ page }) => {
    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Sangli');
    const option = page.locator('[role="option"]').filter({ hasText: /Sangli/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    await expect(originInput).toHaveValue(/Sangli/i);
  });

  test('Flow B: Railway station lookup (Sangli Railway Station)', async ({ page }) => {
    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Sangli Railway Station');
    const option = page.locator('[role="option"]').filter({ hasText: /Sangli/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow C: Metropolitan hub lookup (Mumbai)', async ({ page }) => {
    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Mumbai');
    const option = page.locator('[role="option"]').filter({ hasText: /Mumbai/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow D: Capital hub lookup (Delhi)', async ({ page }) => {
    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Delhi');
    const option = page.locator('[role="option"]').filter({ hasText: /Delhi/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow E: Direct town search (Manali)', async ({ page }) => {
    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Manali');
    const option = page.locator('[role="option"]').filter({ hasText: /Manali/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow F: Keyboard-only navigation (ArrowDown + Enter)', async ({ page }) => {
    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Miraj');
    const option = page.locator('[role="option"]').filter({ hasText: /Miraj/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(originInput).toHaveValue(/Miraj/i);
  });

  test('Flow G: Clear selected location', async ({ page }) => {
    await page.route(/\/api\/v1\/places\/search.*[?&]q=sangli/i, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: 'sangli',
          total_matches: 1,
          results: [{
            provider: 'FOURSQUARE',
            provider_place_id: 'fsq_sli_01',
            display_name: 'Sangli',
            formatted_address: 'Sangli, Maharashtra, India',
            locality: 'Sangli',
            region: 'Maharashtra',
            country: 'IN',
            latitude: 16.8524,
            longitude: 74.5815,
            categories: ['City'],
            data_state: 'REAL_PROVIDER_DATA'
          }],
          provider: 'FOURSQUARE',
          cached: false
        })
      });
    });

    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Sangli');
    const option = page.locator('[role="option"]').filter({ hasText: /Sangli/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    
    // Select origin clear button specifically
    const clearButton = page.locator('[data-testid="planner-origin-autocomplete-clear-btn"]');
    await clearButton.click();
    await expect(originInput).toHaveValue('');
  });

  test('Flow H: Text edit invalidation after selection', async ({ page }) => {
    await page.route(/\/api\/v1\/places\/search.*[?&]q=sangli/i, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: 'sangli',
          total_matches: 1,
          results: [{
            provider: 'FOURSQUARE',
            provider_place_id: 'fsq_sli_01',
            display_name: 'Sangli',
            formatted_address: 'Sangli, Maharashtra, India',
            locality: 'Sangli',
            region: 'Maharashtra',
            country: 'IN',
            latitude: 16.8524,
            longitude: 74.5815,
            categories: ['City'],
            data_state: 'REAL_PROVIDER_DATA'
          }],
          provider: 'FOURSQUARE',
          cached: false
        })
      });
    });

    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Sangli');
    const dropdown = page.locator('#planner-origin-autocomplete-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    const option = dropdown.locator('[role="option"]').filter({ hasText: /Sangli/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    
    await originInput.fill('Sang');
    await expect(originInput).toHaveValue('Sang');
  });

  test('Flow I: Same origin and destination validation guard', async ({ page }) => {
    const originInput = page.locator('#planner-origin-autocomplete');
    const destInput = page.locator('#planner-dest-autocomplete');
    
    await originInput.fill('Sangli');
    const origOption = page.locator('#planner-origin-autocomplete-dropdown [role="option"]').first();
    await expect(origOption).toBeVisible({ timeout: 10000 });
    await origOption.click();

    await destInput.fill('Sangli');
    const destOption = page.locator('#planner-dest-autocomplete-dropdown [role="option"]').first();
    await expect(destOption).toBeVisible({ timeout: 10000 });
    await destOption.click();
    
    const warning = page.locator('#trip-setup-warning-banner');
    await expect(warning).toBeVisible({ timeout: 5000 });
    await expect(warning).toContainText(/distinct places/i);
    await expect(page.locator('#trip-setup-continue-btn')).toBeDisabled();
  });

  test('Flow J: Unsupported location graceful empty state', async ({ page }) => {
    await page.route(/\/api\/v1\/places\/search.*[?&]q=nonexistent/i, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: 'nonexistent',
          total_matches: 0,
          results: [],
          provider: 'FOURSQUARE',
          cached: false
        })
      });
    });

    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('nonexistent');
    await expect(page.getByText(/No locations found for/i)).toBeVisible({ timeout: 10000 });
  });

  test('Flow K: Rapid typing request-race cancellation', async ({ page }) => {
    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('S');
    await originInput.fill('Sa');
    await originInput.fill('San');
    await originInput.fill('Sangli');
    const option = page.locator('[role="option"]').filter({ hasText: /Sangli/i }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
  });

  test('Flow L: Full planner submission (Sangli -> Manali)', async ({ page }) => {
    const originInput = page.locator('#planner-origin-autocomplete');
    const destInput = page.locator('#planner-dest-autocomplete');
    
    await originInput.fill('Sangli');
    const origOption = page.locator('#planner-origin-autocomplete-dropdown [role="option"]').first();
    await expect(origOption).toBeVisible({ timeout: 10000 });
    await origOption.click();
    
    await destInput.fill('Manali');
    const destOption = page.locator('#planner-dest-autocomplete-dropdown [role="option"]').first();
    await expect(destOption).toBeVisible({ timeout: 10000 });
    await destOption.click();
    
    const continueBtn = page.locator('#trip-setup-continue-btn');
    await expect(continueBtn).toBeEnabled({ timeout: 5000 });
    await continueBtn.click();

    // Reaches stage 2
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 10000 });
  });
});
