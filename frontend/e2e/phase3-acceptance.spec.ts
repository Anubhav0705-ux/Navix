import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('NAVIX Phase 3: Ultimate Content Enrichment, Polish & Presentation Release (22 Views)', () => {
  test.setTimeout(300000);

  const localScreenshotDir = path.join(process.cwd(), 'e2e-screenshots', 'phase3');
  const artifactScreenshotDir = 'C:\\Users\\anubh\\.gemini\\antigravity-ide\\brain\\258f948e-3aa6-40d4-aeda-280e53b8bad1\\screenshots';

  test.beforeAll(async () => {
    if (!fs.existsSync(localScreenshotDir)) {
      fs.mkdirSync(localScreenshotDir, { recursive: true });
    }
    if (!fs.existsSync(artifactScreenshotDir)) {
      fs.mkdirSync(artifactScreenshotDir, { recursive: true });
    }
  });

  async function captureDualScreenshot(page: Page, filename: string, options?: Parameters<Page['screenshot']>[0]) {
    const localPath = path.join(localScreenshotDir, filename);
    const artifactPath = path.join(artifactScreenshotDir, filename);
    await page.screenshot({ path: localPath, ...options });
    fs.copyFileSync(localPath, artifactPath);
  }

  test('Execute Complete Phase 3 Acceptance Suite & Capture 22 High-Res Views', async ({ page }) => {
    // -------------------------------------------------------------------------
    // DESKTOP VIEWPORT (1440 x 900)
    // -------------------------------------------------------------------------
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Homepage Desktop
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /India is yours|Your next great journey|Go further. Plan smarter./i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await captureDualScreenshot(page, '01_homepage.png');

    // 2. Explore Full Catalog with 113 Destinations Pagination
    await page.goto('/explore');
    await expect(page.getByRole('heading', { name: /Explore Destinations/i })).toBeVisible({ timeout: 15000 });
    
    // Look for Show All or Load More button and verify 113 destinations counter
    const showAllBtn = page.getByRole('button', { name: /Show All/i });
    await showAllBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await showAllBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/Showing all 113 destinations/i)).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await captureDualScreenshot(page, '02_explore_catalog.png');

    // 3. Destination Guide: Goa
    await page.goto('/explore/goa');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Goa/i, { timeout: 15000 });
    await page.waitForTimeout(600);
    await captureDualScreenshot(page, '03_destination_goa.png');

    // 4. Destination Guide: Udaipur
    await page.goto('/explore/udaipur');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Udaipur/i, { timeout: 15000 });
    await page.waitForTimeout(600);
    await captureDualScreenshot(page, '04_destination_udaipur.png');

    // 5. Stories Magazine Homepage
    await page.goto('/stories');
    await expect(page.getByRole('heading', { name: /Authentic Travel Stories|Travel Dispatch/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await captureDualScreenshot(page, '05_stories_homepage.png');

    // 6. Flagship Story Reader: Manali
    await page.goto('/stories/sangli-to-manali-budget-guide');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await captureDualScreenshot(page, '06_story_manali.png');

    // 7. Flagship Story Reader: Goa
    await page.goto('/stories/monsoon-goa-hidden-waterfalls');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await captureDualScreenshot(page, '07_story_goa.png');

    // 8. Flagship Story Reader: Jaipur
    await page.goto('/stories/royal-rajasthan-budget-circuit');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await captureDualScreenshot(page, '08_story_jaipur.png');

    // 9. Story Image Gallery (scrolled into figure / caption in Jaipur story)
    const storyFigure = page.locator('article figure').first();
    if (await storyFigure.isVisible({ timeout: 5000 }).catch(() => false)) {
      await storyFigure.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
    }
    await captureDualScreenshot(page, '09_story_gallery.png');

    // -------------------------------------------------------------------------
    // AUTHENTICATE FOR SAVED TRIPS DASHBOARD CAPABILITIES
    // -------------------------------------------------------------------------
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign In|Welcome back/i })).toBeVisible({ timeout: 15000 });
    const autofillBtn = page.getByRole('button', { name: /Autofill Presentation Demo Account/i });
    if (await autofillBtn.isVisible()) {
      await autofillBtn.click();
      await page.waitForTimeout(200);
    } else {
      await page.fill('#login-email', 'demo@navix.com');
      await page.fill('#login-password', 'DemoExplorer2026!');
    }
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(600);

    // -------------------------------------------------------------------------
    // PLANNER JOURNEY: PUNE -> GOA (COASTAL CORRIDOR)
    // -------------------------------------------------------------------------
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });
    await captureDualScreenshot(page, '10_planner_setup.png');

    // Fill Stage 1: Pune -> Goa
    const puneGoaPill = page.getByRole('button', { name: /Pune → Goa/i });
    if (await puneGoaPill.isVisible({ timeout: 3000 }).catch(() => false)) {
      await puneGoaPill.click();
    } else {
      await page.locator('#planner-origin-input').fill('Pune');
      await page.locator('#planner-dest-input').fill('Goa');
      await page.locator('input[type="number"]').fill('20000');
    }
    await page.locator('#trip-setup-continue-btn').click();

    // 11. Stage 2: Pune -> Goa Transport Alternatives
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
    await expect(altCards.first()).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(500);
    await captureDualScreenshot(page, '11_pune_goa_transport.png');
    await page.getByRole('button', { name: /Continue to Places/i }).click();

    // 12. Stage 3: Goa Attractions & Must-Visit Badges
    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await captureDualScreenshot(page, '12_goa_attractions.png');
    await page.getByRole('button', { name: /Continue to Food/i }).click();

    // 13. Stage 4: Goa Food & Regional Dining
    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await captureDualScreenshot(page, '13_goa_food.png');
    await page.getByRole('button', { name: /Continue to Stays/i }).click();

    // 14. Stage 5: Goa Hotels & Stays
    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await captureDualScreenshot(page, '14_goa_hotels.png');
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    // 15. Stage 6: Review & Budget Ledger
    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await captureDualScreenshot(page, '15_planner_review.png');

    // 16. Stage 7: Goa Travel Command Center Itinerary
    await page.locator('#generate-itinerary-btn').click();
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(1000);
    await captureDualScreenshot(page, '16_goa_itinerary.png');

    // Save Goa Trip to Dashboard
    const saveTripBtn = page.getByRole('button', { name: /Save Trip/i }).first();
    if (await saveTripBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveTripBtn.click();
      await page.waitForTimeout(1000);
    }

    // 19. Stage 7 Interactive Map View
    const mapSection = page.locator('.leaflet-container');
    if (await mapSection.isVisible()) {
      await mapSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await captureDualScreenshot(page, '19_map_view.png');
    }

    // -------------------------------------------------------------------------
    // SECOND JOURNEY: MUMBAI -> UDAIPUR (OR SANGLI -> UDAIPUR)
    // -------------------------------------------------------------------------
    await page.evaluate(() => {
      try {
        sessionStorage.clear();
      } catch {}
    });
    await page.goto('/plan?origin=Mumbai&destination=Udaipur&budget=25000&travellers=2');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.locator('#trip-setup-continue-btn').click();

    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    await expect(altCards.first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Continue to Places/i }).click();

    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Food/i }).click();

    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Stays/i }).click();

    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.locator('#generate-itinerary-btn').click();
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(1000);
    await captureDualScreenshot(page, '17_udaipur_itinerary.png');

    // Save Udaipur Trip
    if (await saveTripBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveTripBtn.click();
      await page.waitForTimeout(1000);
    }

    // -------------------------------------------------------------------------
    // THIRD JOURNEY: KOCHI -> MUNNAR (HILL STATION ESCAPE)
    // -------------------------------------------------------------------------
    await page.evaluate(() => {
      try {
        sessionStorage.clear();
      } catch {}
    });
    await page.goto('/plan?origin=Kochi&destination=Munnar&budget=18000&travellers=2');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.locator('#trip-setup-continue-btn').click();

    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    await expect(altCards.first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Continue to Places/i }).click();

    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Food/i }).click();

    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Stays/i }).click();

    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.locator('#generate-itinerary-btn').click();
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(1000);
    await captureDualScreenshot(page, '18_munnar_itinerary.png');

    // Save Munnar Trip
    if (await saveTripBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveTripBtn.click();
      await page.waitForTimeout(1000);
    }

    // 20. Saved Trips Dashboard
    await page.goto('/dashboard');
    await expect(page.getByText(/Personal Travel Library|My Saved Trips/i).first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(800);
    await captureDualScreenshot(page, '20_saved_trips_dashboard.png');

    // -------------------------------------------------------------------------
    // MOBILE VIEWPORT CAPTURES (390 x 844 - iPhone 14 standard)
    // -------------------------------------------------------------------------
    await page.setViewportSize({ width: 390, height: 844 });

    // 21. Mobile Stories Magazine
    await page.goto('/stories');
    await expect(page.getByRole('heading', { name: /Authentic Travel Stories|Travel Dispatch/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await captureDualScreenshot(page, '21_mobile_stories.png');

    // 22. Mobile Itinerary View
    await page.goto('/plan?reopen=true');
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await captureDualScreenshot(page, '22_mobile_itinerary.png');
  });
});
