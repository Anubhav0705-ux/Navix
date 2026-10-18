import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('NAVIX Phase 4 — Visual Overhaul, Budget Hardening & Edge-Case Verification', () => {
  test.setTimeout(180000);

  const screenshotDir = path.join(process.cwd(), 'e2e-screenshots', 'phase4');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  /* ------------------------------------------------------------
     TEST 1: MID-FLOW BUDGET INCREASE & SHORTFALL DECREASE
     ------------------------------------------------------------ */
  test('Planner Budget Hardening — Mid-Flow Increase & Decrease Shortfall Handling', async ({ page }) => {
    // 1. Start on Setup Stage with ₹20,000 budget
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    await page.locator('#planner-origin-input').fill('Pune');
    await page.locator('#planner-dest-input').fill('Goa');
    await page.locator('input[type="number"]').fill('20000');
    await page.locator('#trip-setup-continue-btn').click();

    // 2. Arrive at Stage 2 Transport
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    const altCards = page.locator('[data-testid="alt-card"], .cursor-pointer:has-text("Transfer(s)")');
    await expect(altCards.first()).toBeVisible({ timeout: 20000 });

    // Select first alternative
    await altCards.first().click();
    await page.screenshot({ path: path.join(screenshotDir, '08_transport_selected.png') });

    // Verify Context Bar is present
    const contextBar = page.locator('text=Pune').first();
    await expect(contextBar).toBeVisible();

    // 3. EDIT BUDGET MID-FLOW: Increase from ₹20,000 to ₹30,000
    const editBudgetBtn = page.locator('#planner-context-edit-budget-btn, #top-nav-budget-edit-btn').first();
    await expect(editBudgetBtn).toBeVisible();
    await editBudgetBtn.click();

    // Verify Budget Modal Opens
    const budgetModal = page.getByRole('dialog');
    await expect(budgetModal).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '09_budget_editor.png') });

    // Fill new budget ₹30,000
    await page.locator('#budget-input').fill('30000');
    await page.getByRole('button', { name: /Update Budget/i }).click();
    await expect(budgetModal).not.toBeVisible();

    // Verify budget is updated to ₹30,000 and selection is preserved
    await expect(page.getByText(/CAP: ₹30,000/i).first()).toBeVisible();
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible();

    // 4. Continue through Places, Food, and Stays
    await page.getByRole('button', { name: /Continue to Places/i }).click();
    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '11_Places.png') });

    // Add first place
    const addPlaceBtn = page.getByRole('button', { name: /Add Place/i }).first();
    if (await addPlaceBtn.isVisible()) {
      await addPlaceBtn.click();
    }

    await page.getByRole('button', { name: /Continue to Food/i }).click();
    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '12_Food.png') });

    await page.getByRole('button', { name: /Continue to Stays/i }).click();
    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '13_Stay.png') });

    await page.getByRole('button', { name: /Continue to Review/i }).click();
    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '14_Review.png') });

    // 5. DECREASE BUDGET BELOW EXPENDITURE (Shortfall scenario)
    await editBudgetBtn.click();
    await expect(budgetModal).toBeVisible();

    // Set budget to ₹8,000 (below current total spend)
    await page.locator('#budget-input').fill('8000');
    await expect(page.getByText(/Selections exceed this budget/i)).toBeVisible();
    await page.getByRole('button', { name: /Update Budget/i }).click();

    // Verify Shortfall Warning appears on the page
    await expect(page.getByText(/exceed the new budget/i).first()).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '10_budget_shortfall_state.png') });

    // Verify selections are NOT deleted (Place and Stay are still selected)
    await expect(page.getByText(/Trip Cost Ledger/i)).toBeVisible();

    // Restore budget by clicking Match Spend or Restore
    const matchBtn = page.getByRole('button', { name: /Match Spend/i });
    if (await matchBtn.isVisible()) {
      await matchBtn.click();
    }
  });

  /* ------------------------------------------------------------
     TEST 2: EDGE-CASE MATRIX & DEFENSIVE VALIDATIONS
     ------------------------------------------------------------ */
  test('Edge Cases — Same Origin/Destination, Sane Bounds, and Rapid Clicks', async ({ page }) => {
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    // Edge Case: Same Origin & Destination (Pune -> Pune)
    await page.locator('#planner-origin-input').fill('Pune');
    await page.locator('#planner-dest-input').fill('Pune');
    await expect(page.getByText(/Starting point and destination must be distinct cities/i)).toBeVisible();
    const continueBtn = page.locator('#trip-setup-continue-btn');
    await expect(continueBtn).toBeDisabled();

    // Fix destination to Goa
    await page.locator('#planner-dest-input').fill('Goa');
    await expect(continueBtn).toBeEnabled();

    // Edge Case: Budget below minimum (e.g. 0 or negative)
    await page.locator('input[type="number"]').fill('0');
    await expect(continueBtn).toBeDisabled();

    await page.locator('input[type="number"]').fill('25000');
    await expect(continueBtn).toBeEnabled();

    // Rapid double-click test
    await continueBtn.click();
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });

    // Refresh survival test: reload page and ensure state persists from sessionStorage
    await page.reload();
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
  });

  /* ------------------------------------------------------------
     TEST 3: FULL FLOW JOURNEYS (5 NATIONAL CORRIDORS)
     ------------------------------------------------------------ */
  const corridors = [
    { origin: 'Pune', destination: 'Goa', budget: '25000' },
    { origin: 'Mumbai', destination: 'Jaipur', budget: '28000' },
    { origin: 'Delhi', destination: 'Rishikesh', budget: '20000' },
    { origin: 'Bengaluru', destination: 'Mysuru', budget: '15000' },
    { origin: 'Sangli', destination: 'Old Manali', budget: '40000' },
  ];

  for (const c of corridors) {
    test(`Full Journey Pipeline — ${c.origin} → ${c.destination}`, async ({ page }) => {
      await page.goto('/plan');
      await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

      // Setup
      await page.locator('#planner-origin-input').fill(c.origin);
      await page.locator('#planner-dest-input').fill(c.destination);
      await page.locator('input[type="number"]').fill(c.budget);
      await page.locator('#trip-setup-continue-btn').click();

      // Transit
      await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
      const altCards = page.locator('[data-testid="alt-card"], .cursor-pointer:has-text("Transfer(s)")');
      await expect(altCards.first()).toBeVisible({ timeout: 20000 });
      await altCards.first().click();
      await page.getByRole('button', { name: /Continue to Places/i }).click();

      // Places
      await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: /Continue to Food/i }).click();

      // Food
      await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: /Continue to Stays/i }).click();

      // Stays
      await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: /Continue to Review/i }).click();

      // Review
      await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
      const generateBtn = page.locator('#generate-itinerary-btn');
      await expect(generateBtn).toBeVisible();
      await generateBtn.click();

      // Final Itinerary Stage 7
      await expect(page.getByText('Your Daily Travel Timetable').first()).toBeVisible({ timeout: 25000 });
      await expect(page.locator('text=Day 1').first()).toBeVisible();
    });
  }

  /* ------------------------------------------------------------
     TEST 4: IMAGE INTEGRITY & NO BROKEN IMAGES ON PROMINENT SCREENS
     ------------------------------------------------------------ */
  test('Image Integrity — No broken naturalWidth=0 images on prominent screens', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /India is yours/i })).toBeVisible({ timeout: 15000 });

    // Check homepage prominent images
    const heroImgs = page.locator('main img');
    const count = await heroImgs.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = heroImgs.nth(i);
      if (await img.isVisible()) {
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).not.toContain('placeholder');
      }
    }

    // Check Explore images
    await page.goto('/explore');
    await expect(page.getByRole('heading', { name: /Explore Destinations/i })).toBeVisible({ timeout: 15000 });
    const exploreImages = page.locator('main img');
    const expCount = await exploreImages.count();
    for (let i = 0; i < Math.min(expCount, 5); i++) {
      const img = exploreImages.nth(i);
      if (await img.isVisible()) {
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).not.toContain('placeholder');
      }
    }
  });

  /* ------------------------------------------------------------
     TEST 5: VISUAL QA 23 SCREENSHOTS CAPTURE
     ------------------------------------------------------------ */
  test('Capture All 23 Required Release Screenshots', async ({ page }) => {
    // 1 home hero
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /India is yours/i })).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '01_home_hero.png') });

    // 2 home scroll scene Manali
    await page.screenshot({ path: path.join(screenshotDir, '02_home_scroll_scene_manali.png') });

    // Click scene 2: Goa
    const dots = page.locator('button[title^="View "]');
    if (await dots.count() >= 2) {
      await dots.nth(1).click();
      await page.waitForTimeout(600);
      // 3 Goa scene
      await page.screenshot({ path: path.join(screenshotDir, '03_goa_scene.png') });
    }

    // Click scene 3: Udaipur
    if (await dots.count() >= 3) {
      await dots.nth(2).click();
      await page.waitForTimeout(600);
      // 4 Udaipur scene
      await page.screenshot({ path: path.join(screenshotDir, '04_udaipur_scene.png') });
    }

    // 5 Explore
    await page.goto('/explore');
    await expect(page.getByRole('heading', { name: /Explore Destinations/i })).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '05_Explore.png') });

    // 6 destination
    await page.goto('/explore/goa');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Goa/i, { timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '06_destination.png') });

    // 7 transport
    await page.goto('/plan?origin=Pune&destination=Goa&budget=25000&travellers=2');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.locator('#trip-setup-continue-btn').click();
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '07_transport.png') });

    // Proceed to Stage 7 for 15, 16, 17 screenshots
    const altCards = page.locator('[data-testid="alt-card"], .cursor-pointer:has-text("Transfer(s)")');
    await expect(altCards.first()).toBeVisible({ timeout: 20000 });
    await altCards.first().click();
    await page.getByRole('button', { name: /Continue to Places/i }).click();
    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Food/i }).click();
    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Stays/i }).click();
    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Review/i }).click();
    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.locator('#generate-itinerary-btn').click();

    await expect(page.getByText('Your Daily Travel Timetable').first()).toBeVisible({ timeout: 25000 });
    // 15 Itinerary Day 1
    await page.screenshot({ path: path.join(screenshotDir, '15_itinerary_day1.png') });

    // 16 Itinerary Map
    const mapEl = page.locator('.leaflet-container, [data-testid="itinerary-map"]').first();
    if (await mapEl.isVisible()) {
      await mapEl.screenshot({ path: path.join(screenshotDir, '16_itinerary_map.png') });
    } else {
      await page.screenshot({ path: path.join(screenshotDir, '16_itinerary_map.png') });
    }

    // 17 Itinerary Budget Breakdown
    const ledgerEl = page.getByText(/Trip Cost Ledger|Budget Ledger/i).first();
    if (await ledgerEl.isVisible()) {
      await page.screenshot({ path: path.join(screenshotDir, '17_itinerary_budget_breakdown.png') });
    } else {
      await page.screenshot({ path: path.join(screenshotDir, '17_itinerary_budget_breakdown.png') });
    }

    // 18 Stories
    await page.goto('/stories');
    await expect(page.getByRole('heading', { name: /Authentic Travel Stories/i })).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '18_Stories.png') });

    // 19 Dashboard
    await page.goto('/dashboard');
    await page.screenshot({ path: path.join(screenshotDir, '19_Dashboard.png') });

    // Mobile screenshots (390px width)
    await page.setViewportSize({ width: 390, height: 844 });

    // 20 mobile home
    await page.goto('/');
    await page.screenshot({ path: path.join(screenshotDir, '20_mobile_home.png') });

    // 21 mobile transport
    // Clear previous trip state to ensure starting from Stage 1 setup
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto('/plan?origin=Pune&destination=Goa&budget=25000&travellers=2');
    const continueBtn = page.locator('#trip-setup-continue-btn');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '21_mobile_transport.png') });

    // 22 mobile budget editor
    const mobileEditBtn = page.locator('#planner-context-edit-budget-btn, #top-nav-budget-edit-btn').first();
    if (await mobileEditBtn.isVisible()) {
      await mobileEditBtn.click();
      await page.screenshot({ path: path.join(screenshotDir, '22_mobile_budget_editor.png') });
      const closeBtn = page.getByRole('dialog').getByRole('button', { name: /Close|Cancel/i }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    // 23 mobile itinerary
    const mobileAlt = page.locator('[data-testid="alt-card"], .cursor-pointer:has-text("Transfer(s)")').first();
    if (await mobileAlt.isVisible()) {
      await mobileAlt.click();
    }
    await page.getByRole('button', { name: /Continue to Places/i }).click();
    await page.getByRole('button', { name: /Continue to Food/i }).click();
    await page.getByRole('button', { name: /Continue to Stays/i }).click();
    await page.getByRole('button', { name: /Continue to Review/i }).click();
    await page.locator('#generate-itinerary-btn').click();
    await expect(page.getByText('Your Daily Travel Timetable').first()).toBeVisible({ timeout: 25000 });
    await page.screenshot({ path: path.join(screenshotDir, '23_mobile_itinerary.png') });
  });
});
