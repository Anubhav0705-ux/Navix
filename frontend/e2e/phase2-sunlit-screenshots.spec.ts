import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('NAVIX Phase 2: Sunlit India — 20 High-Res Screenshots Capture', () => {
  test.setTimeout(180000);

  const localScreenshotDir = path.join(process.cwd(), 'e2e-screenshots', 'phase2');
  const artifactScreenshotDir = 'C:\\Users\\anubh\\.gemini\\antigravity-ide\\brain\\258f948e-3aa6-40d4-aeda-280e53b8bad1\\screenshots';

  test.beforeAll(async () => {
    if (!fs.existsSync(localScreenshotDir)) {
      fs.mkdirSync(localScreenshotDir, { recursive: true });
    }
    if (!fs.existsSync(artifactScreenshotDir)) {
      fs.mkdirSync(artifactScreenshotDir, { recursive: true });
    }
  });

  async function takeDualScreenshot(page: Page, filename: string, options?: Parameters<Page['screenshot']>[0]) {
    const localPath = path.join(localScreenshotDir, filename);
    const artifactPath = path.join(artifactScreenshotDir, filename);
    await page.screenshot({ path: localPath, ...options });
    fs.copyFileSync(localPath, artifactPath);
  }

  test('Capture Desktop (1440x900) and Mobile (390x844) Sunlit India Views', async ({ page }) => {
    // Set Desktop Viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Homepage Hero
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /India is yours|Your next great journey|Go further. Plan smarter./i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await takeDualScreenshot(page, '01_homepage.png');

    // 2. Homepage Destinations & Popular Journeys
    const whereToNext = page.getByText(/Where to next\?|Popular Journeys/i).first();
    if (await whereToNext.isVisible()) {
      await whereToNext.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
    }
    await takeDualScreenshot(page, '02_homepage_destinations.png');

    // 3. Explore Catalog
    await page.goto('/explore');
    await expect(page.getByRole('heading', { name: /Explore Destinations/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await takeDualScreenshot(page, '03_explore_catalog.png');

    // 4. Destination Detail (Manali)
    await page.goto('/explore/manali');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Manali/i, { timeout: 15000 });
    await page.waitForTimeout(800);
    await takeDualScreenshot(page, '04_destination_detail.png');

    // 5. Stories Magazine List
    await page.goto('/stories');
    await expect(page.getByRole('heading', { name: /Authentic Travel Stories|Travel Dispatch/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await takeDualScreenshot(page, '05_stories_list.png');

    // 6. Individual Story Reader (Sangli to Manali)
    await page.goto('/stories/sangli-to-manali-budget-guide');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await takeDualScreenshot(page, '06_story_reader.png');

    // 7. Planner Stage 1: Trip Setup
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(400);
    await takeDualScreenshot(page, '07_stage1_setup.png');

    // Fill Stage 1 with Flagship Corridor: Sangli -> Old Manali
    await page.locator('#planner-origin-input').fill('Sangli');
    await page.locator('#planner-dest-input').fill('Old Manali');
    await page.locator('input[type="number"]').fill('40000');
    await page.locator('#trip-setup-continue-btn').click();

    // 8. Planner Stage 2: Transport Alternatives
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
    await expect(altCards.first()).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(500);
    await takeDualScreenshot(page, '08_stage2_transport.png');
    await page.getByRole('button', { name: /Continue to Places/i }).click();

    // 9. Planner Stage 3: Places & Experiences
    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await takeDualScreenshot(page, '09_stage3_places.png');
    await page.getByRole('button', { name: /Continue to Food/i }).click();

    // 10. Planner Stage 4: Food & Regional Dining
    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await takeDualScreenshot(page, '10_stage4_food.png');
    await page.getByRole('button', { name: /Continue to Stays/i }).click();

    // 11. Planner Stage 5: Hotels & Stays
    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await takeDualScreenshot(page, '11_stage5_stays.png');
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    // 12. Planner Stage 6: Review & Budget Ledger
    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await takeDualScreenshot(page, '12_stage6_review.png');

    // Execute Final Itinerary Generation
    const generateBtn = page.locator('#generate-itinerary-btn');
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // 13. Stage 7 Flagship Itinerary Command Hero & Budget
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 35000 });
    await page.waitForTimeout(1000); // Allow OpenStreetMap tiles and images to load
    await takeDualScreenshot(page, '13_stage7_hero.png');

    // 14. Stage 7 Daily Timeline Scroll
    const timetableHeader = page.getByRole('heading', { name: /Day-by-Day Experience Schedule/i });
    if (await timetableHeader.isVisible()) {
      await timetableHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
    }
    await takeDualScreenshot(page, '14_stage7_timeline.png');

    // 15. Stage 7 Interactive Map View
    const mapSection = page.locator('.leaflet-container');
    if (await mapSection.isVisible()) {
      await mapSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
    }
    await takeDualScreenshot(page, '15_stage7_map.png');

    // 16. Login View with Demo Autofill
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign In|Welcome back/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(400);
    await takeDualScreenshot(page, '17_login.png');

    // Click demo autofill and sign in
    const autofillBtn = page.getByRole('button', { name: /Autofill Presentation Demo Account/i });
    if (await autofillBtn.isVisible()) {
      await autofillBtn.click();
      await page.waitForTimeout(200);
    }
    const signInBtn = page.locator('button[type="submit"]');
    await signInBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(800);
    await takeDualScreenshot(page, '16_dashboard.png');

    // -------------------------------------------------------------
    // MOBILE VIEWPORT CAPTURES (390 x 844 - iPhone 14 / Mobile standard)
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 390, height: 844 });

    // 18. Mobile Homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /India is yours|Your next great journey|Go further. Plan smarter./i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await takeDualScreenshot(page, '18_mobile_homepage.png');

    // 19. Mobile Final Itinerary (Reopen computed itinerary on mobile)
    await page.goto('/plan?reopen=true');
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await takeDualScreenshot(page, '20_mobile_itinerary.png');

    // 20. Mobile Planner Stage 1 (Clear storage for fresh trip setup view)
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    });
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);
    await takeDualScreenshot(page, '19_mobile_planner.png');
  });
});
