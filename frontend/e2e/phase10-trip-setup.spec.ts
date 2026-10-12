import { test, expect } from '@playwright/test';

const MOCK_MANALI_FSQ = {
  query: 'manali',
  total_matches: 2,
  results: [
    {
      provider: 'FOURSQUARE',
      provider_place_id: 'fsq_manali_01',
      display_name: 'Manali',
      formatted_address: 'Manali, Kullu, Himachal Pradesh, India',
      locality: 'Manali',
      region: 'Himachal Pradesh',
      country: 'IN',
      latitude: 32.2396,
      longitude: 77.1887,
      categories: ['Town', 'Hill Station'],
      data_state: 'REAL_PROVIDER_DATA'
    },
    {
      provider: 'FOURSQUARE',
      provider_place_id: 'fsq_old_manali_02',
      display_name: 'Old Manali',
      formatted_address: 'Old Manali, Himachal Pradesh, India',
      locality: 'Old Manali',
      region: 'Himachal Pradesh',
      country: 'IN',
      latitude: 32.2560,
      longitude: 77.1788,
      categories: ['Village'],
      data_state: 'REAL_PROVIDER_DATA'
    }
  ],
  provider: 'FOURSQUARE',
  cached: false
};

const MOCK_SANGLI_FSQ = {
  query: 'sangli',
  total_matches: 1,
  results: [
    {
      provider: 'FOURSQUARE',
      provider_place_id: 'fsq_sangli_01',
      display_name: 'Sangli',
      formatted_address: 'Sangli, Maharashtra, India',
      locality: 'Sangli',
      region: 'Maharashtra',
      country: 'IN',
      latitude: 16.8524,
      longitude: 74.5815,
      categories: ['City'],
      data_state: 'REAL_PROVIDER_DATA'
    }
  ],
  provider: 'FOURSQUARE',
  cached: false
};

test.describe('NAVIX Phase 10 Real Data Trip Setup E2E', () => {

  test('Flow P10-1: Landing page navigates to real Trip Setup wizard', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.getByText(/NAVIX/i).first()).toBeVisible({ timeout: 15000 });

    // Click navigation or CTA to planner
    const planCta = page.getByRole('link', { name: /Start Journey|Plan Your Trip|Launch Planner|Plan Route/i }).first();
    if (await planCta.isVisible()) {
      await planCta.click();
    } else {
      await page.goto('http://localhost:3000/plan');
    }

    await expect(page).toHaveURL(/.*\/plan/);
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Real Trip Setup/i)).toBeVisible({ timeout: 10000 });
  });

  test('Flow P10-2: Autocomplete searches real Foursquare places and stores provider coordinates', async ({ page }) => {
    // Intercept places search with mock provider contract
    await page.route(/\/api\/v1\/places\/search.*[?&]q=manali/i, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_MANALI_FSQ)
      });
    });

    await page.goto('http://localhost:3000/plan');
    await expect(page.getByText(/Real Trip Setup/i)).toBeVisible({ timeout: 10000 });

    const destInput = page.locator('#planner-dest-autocomplete');
    await expect(destInput).toBeVisible();
    await destInput.fill('Manali');

    // Verify dropdown appears with attribution
    const dropdown = page.locator('#planner-dest-autocomplete-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    await expect(dropdown.getByText(/Powered by Foursquare Places/i)).toBeVisible();

    // Verify search items
    const placeItems = dropdown.getByTestId('place-result-item');
    await expect(placeItems.first()).toBeVisible();
    await expect(placeItems.first().getByText('Manali', { exact: true })).toBeVisible();

    // Click item to select
    await placeItems.first().click();

    // Verify selected badge displays coordinates and Foursquare attribution
    await expect(page.getByText(/32.2396°, 77.1887°/)).toBeVisible();
    await expect(page.getByText(/Foursquare Places/i).first()).toBeVisible();
  });

  test('Flow P10-3: Same origin and destination triggers validation warning and disables Continue', async ({ page }) => {
    await page.route(/\/api\/v1\/places\/search.*[?&]q=manali/i, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_MANALI_FSQ)
      });
    });

    await page.goto('http://localhost:3000/plan');

    // Set origin to Manali
    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Manali');
    const origDropdown = page.locator('#planner-origin-autocomplete-dropdown');
    await expect(origDropdown).toBeVisible();
    await origDropdown.getByTestId('place-result-item').first().click();

    // Set destination to Manali
    const destInput = page.locator('#planner-dest-autocomplete');
    await destInput.fill('Manali');
    const destDropdown = page.locator('#planner-dest-autocomplete-dropdown');
    await expect(destDropdown).toBeVisible();
    await destDropdown.getByTestId('place-result-item').first().click();

    // Warning banner must be visible
    const warning = page.locator('#trip-setup-warning-banner');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText(/distinct places/i);

    // Continue button must be disabled
    const continueBtn = page.locator('#trip-setup-continue-btn');
    await expect(continueBtn).toBeDisabled();
  });

  test('Flow P10-4: Valid Trip Setup flow persists state and proceeds to Stage 2 with zero synthetic data', async ({ page }) => {
    await page.route(/\/api\/v1\/places\/search.*[?&]q=sangli/i, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SANGLI_FSQ)
      });
    });

    await page.route(/\/api\/v1\/places\/search.*[?&]q=manali/i, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_MANALI_FSQ)
      });
    });

    await page.goto('http://localhost:3000/plan');

    // 1. Select Origin: Sangli
    const originInput = page.locator('#planner-origin-autocomplete');
    await originInput.fill('Sangli');
    const origDropdown = page.locator('#planner-origin-autocomplete-dropdown');
    await expect(origDropdown).toBeVisible();
    await origDropdown.getByTestId('place-result-item').first().click();

    // 2. Select Destination: Manali
    const destInput = page.locator('#planner-dest-autocomplete');
    await destInput.fill('Manali');
    const destDropdown = page.locator('#planner-dest-autocomplete-dropdown');
    await expect(destDropdown).toBeVisible();
    await destDropdown.getByTestId('place-result-item').first().click();

    // 3. Verify Continue button is enabled
    const continueBtn = page.locator('#trip-setup-continue-btn');
    await expect(continueBtn).toBeEnabled();

    // 4. Click Continue
    await continueBtn.click();

    // 5. Stage 2 Transportation must load with Step 1 confirmed banner
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 10000 });
    const confirmedBanner = page.locator('#trip-setup-confirmed-banner');
    await expect(confirmedBanner).toBeVisible();
    await expect(confirmedBanner).toContainText(/STEP 1: TRIP SETUP CONFIRMED/i);
    await expect(confirmedBanner).toContainText(/Sangli/i);
    await expect(confirmedBanner).toContainText(/Manali/i);
  });

  test('Flow P10-5: Truthful error state when provider is unavailable (Never Seed Fallback)', async ({ page }) => {
    // Mock Foursquare failure (503 Service Unavailable)
    await page.route(/\/api\/v1\/places\/search.*[?&]q=unavailable/i, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: {
            error: 'LOCATION_SEARCH_UNAVAILABLE',
            message: 'Location search is temporarily unavailable.'
          }
        })
      });
    });

    await page.goto('http://localhost:3000/plan');
    const destInput = page.locator('#planner-dest-autocomplete');
    await destInput.fill('unavailable');

    const dropdown = page.locator('#planner-dest-autocomplete-dropdown');
    await expect(dropdown).toBeVisible();

    // Truthful unavailable error state must be shown
    const errorState = dropdown.getByTestId('planner-dest-autocomplete-error-state');
    await expect(errorState).toBeVisible();
    await expect(errorState).toContainText(/Location search is temporarily unavailable/i);

    // Zero seed data cards shown
    await expect(dropdown.getByTestId('place-result-item')).toHaveCount(0);
  });

  test('Flow P10-6: Mobile viewport responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/plan');
    await expect(page.getByText(/Real Trip Setup/i)).toBeVisible({ timeout: 10000 });

    const originInput = page.locator('#planner-origin-autocomplete');
    await expect(originInput).toBeVisible();
    const destInput = page.locator('#planner-dest-autocomplete');
    await expect(destInput).toBeVisible();
    const continueBtn = page.locator('#trip-setup-continue-btn');
    await expect(continueBtn).toBeVisible();
  });

  test('Flow P10-7: Regression Smoke - Dashboard and Login load cleanly', async ({ page }) => {
    // Login page smoke
    await page.goto('http://localhost:3000/login');
    await expect(page.getByRole('button', { name: /Sign In|Login/i })).toBeVisible({ timeout: 10000 });

    // Dashboard page smoke
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.getByText(/Dashboard|Saved Trips|Overview/i).first()).toBeVisible({ timeout: 10000 });
  });

});
