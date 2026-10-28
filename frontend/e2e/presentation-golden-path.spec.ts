import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('NAVIX Ultimate Presentation Release — 5 Golden Paths & Visual QA', () => {
  test.setTimeout(120000);

  const screenshotDir = path.join(process.cwd(), 'e2e-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      window.localStorage.removeItem('navix_trip_plan');
      window.localStorage.removeItem('navix_planner_state');
      window.localStorage.setItem('navix_auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfZGVtb19uYXZpeCIsInJvbGUiOiJ0cmF2ZWxlciIsImV4cCI6MTc5MzM3NDY2Mn0.1N9zWvQZ4pTmtJ8GX1MeJQdENCJmbpVCEcVIE5vqNEU');
      const userObj = JSON.stringify({
        user_id: 'usr_demo_navix',
        name: 'Demo Explorer',
        email: 'demo@navix.com',
        role: 'traveler'
      });
      window.localStorage.setItem('navix_auth_user', userObj);
      window.localStorage.setItem('navix_user', userObj);
    });
  });

  test('Visual QA & 16 Screenshot Views Capture', async ({ page }) => {
    // 1. Homepage
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /India is yours|Your next great journey|Go further. Plan smarter./i })).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '01_homepage.png'), fullPage: false });

    // 2. Explore Catalog
    await page.goto('/explore');
    await expect(page.getByRole('heading', { name: /Explore Destinations/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '02_explore_catalog.png'), fullPage: false });

    // 3. Destination Detail (Manali)
    await page.goto('/explore/manali');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Manali/i, { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '03_destination_detail.png'), fullPage: false });

    // 4. Stories Magazine List
    await page.goto('/stories');
    await expect(page.getByRole('heading', { name: /Authentic Travel Stories|Travel Dispatch/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '04_stories_list.png'), fullPage: false });

    // 5. Story Reader Detail
    await page.goto('/stories/sangli-to-manali-budget-guide');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '05_story_reader.png'), fullPage: false });

    // 6. Login View with 1-click Demo Autofill
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign In|Welcome back/i })).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '06_login_view.png'), fullPage: false });

    // Enter credentials directly (authentic clean login)
    await page.fill('input[type="email"]', 'demo@navix.com');
    await page.fill('input[type="password"]', 'DemoExplorer2026!');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotDir, '06b_login_filled.png'), fullPage: false });

    const signInBtn = page.locator('button[type="submit"]');
    await signInBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page.getByText(/Personal Travel Library|My Saved Trips/i).first()).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '07_dashboard.png'), fullPage: false });

    // 8. 7-Stage Planner: Stage 1 Setup
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '08_stage1_setup.png'), fullPage: false });

    // Fill Stage 1 with Flagship Corridor: Sangli -> Old Manali
    await page.locator('#planner-origin-input').fill('Sangli');
    await page.locator('#planner-dest-input').fill('Old Manali');
    await page.locator('input[type="number"]').fill('40000');
    await page.locator('#trip-setup-continue-btn').click();

    // 9. Stage 2 Transport Alternatives
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
    await expect(altCards.first()).toBeVisible({ timeout: 20000 });
    await page.screenshot({ path: path.join(screenshotDir, '09_stage2_transport.png'), fullPage: false });
    await page.getByRole('button', { name: /Continue to Places/i }).click();

    // 10. Stage 3 Places & Experiences
    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '10_stage3_places.png'), fullPage: false });
    await page.getByRole('button', { name: /Continue to Food/i }).click();

    // 11. Stage 4 Food & Regional Dining
    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '11_stage4_food.png'), fullPage: false });
    await page.getByRole('button', { name: /Continue to Stays/i }).click();

    // 12. Stage 5 Hotels & Stays
    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '12_stage5_stays.png'), fullPage: false });
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    // 13. Stage 6 Review & Budget Ledger
    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '13_stage6_review.png'), fullPage: false });

    // Execute Final Itinerary Generation
    const generateBtn = page.locator('#generate-itinerary-btn');
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // 14. Stage 7 Flagship Final Itinerary Command Center
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(1000); // Wait for OpenStreetMap tiles to render
    await page.screenshot({ path: path.join(screenshotDir, '14_stage7_command_hero.png'), fullPage: false });

    // 15. Stage 7 Daily Timeline Scroll
    const timetableHeader = page.getByRole('heading', { name: /Day-by-Day Experience Schedule/i });
    await timetableHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotDir, '15_stage7_daily_timeline.png'), fullPage: false });

    // 16. Stage 7 Interactive Map View
    const mapSection = page.locator('.leaflet-container');
    await mapSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '16_stage7_map_view.png'), fullPage: false });
  });

  test('Golden Path A: Sangli -> Old Manali (Flagship Multi-Tier)', async ({ page }) => {
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    const corridorPill = page.getByRole('button', { name: /Sangli → Manali/i });
    await expect(corridorPill).toBeVisible();
    await corridorPill.click();

    await page.locator('#trip-setup-continue-btn').click();

    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
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
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 25000 });
    await expect(page.getByText(/Sangli/i).first()).toBeVisible();
    await expect(page.getByText(/Manali/i).first()).toBeVisible();
  });

  test('Golden Path B: Pune -> Goa (Coastal Express)', async ({ page }) => {
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    const corridorPill = page.getByRole('button', { name: /Pune → Goa/i });
    await expect(corridorPill).toBeVisible();
    await corridorPill.click();

    await page.locator('#trip-setup-continue-btn').click();

    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
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
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 25000 });
    await expect(page.getByText(/Pune/i).first()).toBeVisible();
    await expect(page.getByText(/Goa/i).first()).toBeVisible();
  });

  test('Golden Path C: Mumbai -> Jaipur (Royal Heritage)', async ({ page }) => {
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    const corridorPill = page.getByRole('button', { name: /Mumbai → Jaipur/i });
    await expect(corridorPill).toBeVisible();
    await corridorPill.click();

    await page.locator('#trip-setup-continue-btn').click();

    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
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
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 25000 });
    await expect(page.getByText(/Mumbai/i).first()).toBeVisible();
    await expect(page.getByText(/Jaipur/i).first()).toBeVisible();
  });

  test('Golden Path D: Delhi -> Manali (Mountain Corridor)', async ({ page }) => {
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    const corridorPill = page.getByRole('button', { name: /Delhi → Manali/i });
    await expect(corridorPill).toBeVisible();
    await corridorPill.click();

    await page.locator('#trip-setup-continue-btn').click();

    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
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
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 25000 });
    await expect(page.getByText(/Delhi/i).first()).toBeVisible();
    await expect(page.getByText(/Manali/i).first()).toBeVisible();
  });

  test('Golden Path E: Bengaluru -> Mysuru (Southern Heritage)', async ({ page }) => {
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    const corridorPill = page.getByRole('button', { name: /Bengaluru → Mysuru/i });
    await expect(corridorPill).toBeVisible();
    await corridorPill.click();

    await page.locator('#trip-setup-continue-btn').click();

    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 15000 });
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
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
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 25000 });
    await expect(page.getByText(/Bengaluru/i).first()).toBeVisible();
    await expect(page.getByText(/Mysuru/i).first()).toBeVisible();
  });
});
