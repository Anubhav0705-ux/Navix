import { test, expect } from '@playwright/test';

test.describe('NAVIX Real Transport Discovery & Multi-Provider Search E2E (Phase 9 WP-9.3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/transport');
    await expect(page.getByText(/Multi-Provider Transport Discovery/i)).toBeVisible({ timeout: 15000 });
  });

  test('Flow D1: Transport discovery search page initializes with canonical inputs and presets', async ({ page }) => {
    await expect(page.locator('#transport-origin-input')).toBeVisible();
    await expect(page.locator('#transport-dest-input')).toBeVisible();
    await expect(page.locator('#transport-date-input')).toBeVisible();
    await expect(page.locator('#transport-search-button')).toBeVisible();

    // Verify mode buttons
    await expect(page.locator('#transport-mode-all')).toBeVisible();
    await expect(page.locator('#transport-mode-rail')).toBeVisible();
    await expect(page.locator('#transport-mode-bus')).toBeVisible();
    await expect(page.locator('#transport-mode-flight')).toBeVisible();

    // Verify corridor presets
    await expect(page.locator('#preset-sli-pune')).toBeVisible();
    await expect(page.locator('#preset-pune-sli')).toBeVisible();
    await expect(page.locator('#preset-sli-mrj')).toBeVisible();
  });

  test('Flow D2: Search Sangli -> Pune finds Train 17412 with stops timeline and provenance audit', async ({ page }) => {
    // Click quick verified corridor preset: Sangli -> Pune
    await page.locator('#preset-sli-pune').click();

    // Results container appears
    await expect(page.locator('#transport-results-container')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#results-count-badge')).toBeVisible();

    // Service card for Train 17412 (Mahalaxmi Express)
    const card = page.locator('#service-card-17412');
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(card.getByText(/Central Railway/i)).toBeVisible();
    await expect(card.getByText(/Mahalaxmi Express/i)).toBeVisible();

    // Truth badges
    await expect(card.getByText(/VERIFIED REAL SOURCE/i)).toBeVisible();
    await expect(card.getByText(/STATIC \/ HISTORICAL/i)).toBeVisible();
    await expect(card.getByText(/FARE UNAVAILABLE/i)).toBeVisible();
    await expect(card.getByText(/AVAILABILITY NOT PROVIDED/i)).toBeVisible();

    // Timing verification
    await expect(card.getByText(/21:40/i)).toBeVisible();

    // Expand stops timeline
    const toggleStopsBtn = page.locator('#toggle-stops-17412');
    await toggleStopsBtn.click();
    const expandedTimeline = page.locator('#expanded-stops-17412');
    await expect(expandedTimeline).toBeVisible({ timeout: 5000 });
    await expect(expandedTimeline.getByText(/Calling Points Timeline/i)).toBeVisible();
    await expect(expandedTimeline.getByText(/fac_sangli_sli/i)).toBeVisible();
    await expect(expandedTimeline.getByText(/fac_pune_pune/i)).toBeVisible();

    // Open provenance audit modal
    const provBtn = page.locator('#provenance-btn-17412');
    await provBtn.click();
    const modal = page.locator('#provenance-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.getByText(/Authoritative Provenance Audit/i)).toBeVisible();
    await expect(modal.getByText(/GODL-India/i)).toBeVisible();
    await expect(modal.getByText(/FARE_UNAVAILABLE and seat booking is NOT_PROVIDED/i)).toBeVisible();

    // Close modal
    await modal.getByRole('button', { name: /Close Audit/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test('Flow D3: Reverse corridor search Pune -> Sangli rejects Train 17412 and finds Train 11029', async ({ page }) => {
    // Click Pune -> Sangli preset
    await page.locator('#preset-pune-sli').click();

    await expect(page.locator('#transport-results-container')).toBeVisible({ timeout: 10000 });

    // Train 11029 (Koyna Express) MUST be found (runs Mumbai -> Kolhapur via Pune -> Sangli)
    await expect(page.locator('#service-card-11029')).toBeVisible({ timeout: 10000 });

    // Train 17412 MUST NOT be found in this direction
    await expect(page.locator('#service-card-17412')).not.toBeVisible();
  });

  test('Flow D4: Consumer search displays verified railway corridor and strictly excludes synthetic fixtures', async ({ page }) => {
    // Click Sangli -> Miraj verified corridor preset
    await page.locator('#preset-sli-mrj').click();
    await expect(page.locator('#transport-results-container')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#service-card-11029')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/VERIFIED REAL SOURCE/i).first()).toBeVisible();

    // Fill in Delhi ISBT -> Old Manali to verify synthetic bus fixture is strictly excluded from consumer search
    await page.locator('#transport-origin-input').fill('Delhi');
    await page.waitForTimeout(400);
    const delOpt = page.locator('#transport-origin-input-listbox [role="option"]').first();
    await expect(delOpt).toBeVisible({ timeout: 10000 });
    await delOpt.click();

    await page.locator('#transport-dest-input').fill('Manali');
    await page.waitForTimeout(400);
    const mnlOpt = page.locator('#transport-dest-input-listbox [role="option"]').first();
    await expect(mnlOpt).toBeVisible({ timeout: 10000 });
    await mnlOpt.click();

    await page.locator('#transport-search-button').click();

    // Must show empty state (synthetic contract fixtures strictly excluded from consumer search)
    await expect(page.locator('#transport-empty-state')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/No Direct Scheduled Services Found/i)).toBeVisible();
  });

  test('Flow D5: Nonexistent direct flight corridor shows clean empty state', async ({ page }) => {
    // Select Sangli -> Pune and switch to FLIGHT mode
    await page.locator('#preset-sli-pune').click();
    await expect(page.locator('#transport-results-container')).toBeVisible({ timeout: 10000 });

    // Click FLIGHT mode tab
    await page.locator('#transport-mode-flight').click();

    // Must show empty state (no commercial scheduled flights between Sangli Rail and Pune Rail)
    await expect(page.locator('#transport-empty-state')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/No Direct Scheduled Services Found/i)).toBeVisible();
  });

  test('Flow D6: Mobile viewport responsive rendering', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/transport');

    await expect(page.getByText(/Multi-Provider Transport Discovery/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#transport-origin-input')).toBeVisible();
    await expect(page.locator('#transport-dest-input')).toBeVisible();
    await expect(page.locator('#transport-search-button')).toBeVisible();
  });
});
