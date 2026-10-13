import { test, expect } from '@playwright/test';

test.describe('NAVIX 48-Hour Presentation Release — Golden Path E2E Suite', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    // Navigate with standard desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('Golden Path 1: Explore Catalog -> Manali -> 7-Stage Planner -> Command Center', async ({ page }) => {
    // Step 1: Open Explore Catalog
    await page.goto('/explore');
    await expect(page.getByRole('heading', { name: /Explore Destinations/i })).toBeVisible({ timeout: 15000 });

    // Step 2: Search for Manali and navigate to Manali detail page
    const searchInput = page.getByPlaceholder(/Search by city, state, or destination name/i);
    await searchInput.fill('Manali');
    await page.waitForTimeout(600);

    const manaliLink = page.locator('a[href*="/explore/manali"]').first();
    await expect(manaliLink).toBeVisible({ timeout: 10000 });
    await manaliLink.click();

    // Step 3: Destination detail page checks
    await expect(page).toHaveURL(/.*\/explore\/manali/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Manali/i);

    // Verify tabs on destination page
    await expect(page.getByRole('button', { name: /Attractions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Food & Dining/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Stays & Hotels/i })).toBeVisible();

    // Step 4: Click 'Plan My Trip Here' CTA
    const planCta = page.getByRole('link', { name: /Plan My Trip/i });
    await expect(planCta).toBeVisible();
    await planCta.click();

    // Step 5: Arrive at Stage 01 Trip Setup
    await expect(page).toHaveURL(/.*\/plan/);
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    // Ensure origin is Sangli
    const originInput = page.locator('#planner-origin-input');
    await originInput.fill('Sangli');

    // Ensure budget is at least 40,000
    const budgetInput = page.locator('input[type="number"]');
    await budgetInput.fill('40000');

    // Click continue to Transport (Stage 2)
    const continueToTransportBtn = page.locator('#trip-setup-continue-btn');
    await expect(continueToTransportBtn).toBeEnabled({ timeout: 5000 });
    await continueToTransportBtn.click();

    // Step 6: Stage 02 — Transport Alternatives
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Select Transportation Option/i })).toBeVisible();

    // Alternatives should render (RECOMMENDED, CHEAPEST, FASTEST, etc.)
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
    await expect(altCards.first()).toBeVisible({ timeout: 20000 });
    await altCards.first().click();

    // Click Continue to Places
    const continueToPlacesBtn = page.getByRole('button', { name: /Continue to Places/i });
    await expect(continueToPlacesBtn).toBeVisible();
    await continueToPlacesBtn.click();

    // Step 7: Stage 03 — Places & Attractions
    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Experiences & Must-Visit Places/i })).toBeVisible();

    // Click Continue to Food
    const continueToFoodBtn = page.getByRole('button', { name: /Continue to Food/i });
    await expect(continueToFoodBtn).toBeVisible();
    await continueToFoodBtn.click();

    // Step 8: Stage 04 — Dining & Food
    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Regional Dining & Food/i })).toBeVisible();

    // Click Continue to Stays
    const continueToStaysBtn = page.getByRole('button', { name: /Continue to Stays/i });
    await expect(continueToStaysBtn).toBeVisible();
    await continueToStaysBtn.click();

    // Step 9: Stage 05 — Accommodation & Stays
    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Select Primary Stay/i })).toBeVisible();

    // Click Continue to Review
    const continueToReviewBtn = page.getByRole('button', { name: /Continue to Review/i });
    await expect(continueToReviewBtn).toBeVisible();
    await continueToReviewBtn.click();

    // Step 10: Stage 06 — Review & Deterministic Budget Health Auditor
    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Deterministic Budget Auditor/i)).toBeVisible();
    await expect(page.getByText(/Trip Cost Ledger/i)).toBeVisible();

    // Verify budget status badge is visible
    const statusBadge = page.locator('text=/COMFORTABLE|TIGHT|OVER BUDGET/');
    await expect(statusBadge.first()).toBeVisible();

    // Click Generate Complete Itinerary
    const generateBtn = page.locator('#generate-itinerary-btn');
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Step 11: Stage 07 — Command Center / Itinerary Result
    await expect(page.getByText(/JOURNEY COMPUTED/i)).toBeVisible({ timeout: 25000 });
    await expect(page.getByText(/Sangli/i).first()).toBeVisible();
    await expect(page.getByText(/Manali/i).first()).toBeVisible();

    // Verify Action Buttons exist
    await expect(page.getByRole('button', { name: /Save Trip/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Download PDF/i })).toBeVisible();

    // Verify Budget Chart Breakdown
    await expect(page.getByText(/Trip Expense Allocation/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Export High-Res Itinerary PDF/i })).toBeVisible();

    // Verify Leaflet Map Container rendered
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeAttached({ timeout: 15000 });
  });

  test('Golden Path 2: Direct Corridor Sangli -> Manali via Corridor Pill', async ({ page }) => {
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    // Click Sangli -> Manali corridor pill
    const corridorPill = page.getByRole('button', { name: /Sangli → Manali/i });
    await expect(corridorPill).toBeVisible();
    await corridorPill.click();

    // Verify inputs populated
    await expect(page.locator('#planner-origin-input')).toHaveValue(/Sangli/i);
    await expect(page.locator('#planner-dest-input')).toHaveValue(/Old Manali/i);

    // Continue to Transport
    await page.locator('#trip-setup-continue-btn').click();

    // Verify Stage 2 alternatives load
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Select Transportation Option/i })).toBeVisible();
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
    await expect(altCards.first()).toBeVisible({ timeout: 20000 });
  });

  test('Golden Path 3: Direct Corridor Pune -> Goa with 4 Days', async ({ page }) => {
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    // Click Pune -> Goa corridor pill
    const corridorPill = page.getByRole('button', { name: /Pune → Goa/i });
    await expect(corridorPill).toBeVisible();
    await corridorPill.click();

    // Verify inputs populated
    await expect(page.locator('#planner-origin-input')).toHaveValue(/Pune/i);
    await expect(page.locator('#planner-dest-input')).toHaveValue(/Goa/i);

    // Continue to Transport
    await page.locator('#trip-setup-continue-btn').click();

    // Verify Stage 2 alternatives load
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Select Transportation Option/i })).toBeVisible();
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
    await expect(altCards.first()).toBeVisible({ timeout: 20000 });
  });
});
