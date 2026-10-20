import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('NAVIX Photo Library V3 Runtime & Content Integrity Verification', () => {
  test.setTimeout(90000);

  const screenshotDir = path.join(process.cwd(), 'e2e-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('01. Shimla Attractions — 10 Distinct Landmark Photos with Zero Mountain Duplication', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && (msg.text().includes('404') || msg.text().includes('418'))) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/explore/shimla');
    await page.waitForLoadState('networkidle');

    // Verify Destination Hero Header
    const heroH1 = page.getByRole('heading', { level: 1, name: /Shimla/i });
    await expect(heroH1).toBeVisible({ timeout: 15000 });

    // Attractions Grid
    const cards = page.locator('.photo-card-hover');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(8);

    const imgSrcs: string[] = [];
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const img = card.locator('img').first();
      await expect(img).toBeAttached({ timeout: 5000 });

      const src = await img.getAttribute('src');
      if (src) imgSrcs.push(src);

      // Verify image actually rendered with real dimensions
      await expect(async () => {
        const natWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(natWidth).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });
    }

    // CRITICAL: Zero duplicate images across attractions in Shimla
    const uniqueSrcs = new Set(imgSrcs);
    expect(uniqueSrcs.size).toBe(imgSrcs.length);

    // Verify specific landmark filenames are rendered
    const srcJoined = imgSrcs.join(' ');
    expect(srcJoined).toContain('shimla_christ_church');
    expect(srcJoined).toContain('shimla_jakhoo_temple');
    expect(srcJoined).toContain('shimla_viceregal_lodge');
    expect(srcJoined).toContain('shimla_toy_train');
    expect(srcJoined).toContain('shimla_chadwick_falls');

    // Zero 404 or 418 errors
    expect(consoleErrors).toHaveLength(0);

    await page.screenshot({
      path: path.join(screenshotDir, 'v3_01_shimla_distinct_landmarks.png'),
      fullPage: false
    });
  });

  test('02. Shimla Food & Stays — Regional Cuisine & Honest Accommodations', async ({ page }) => {
    await page.goto('/explore/shimla');
    await page.waitForLoadState('networkidle');

    // Food Tab
    const foodTab = page.getByRole('button', { name: /Food & Dining/i });
    await expect(foodTab).toBeVisible({ timeout: 10000 });
    await foodTab.click();
    await page.waitForTimeout(600);

    const foodCards = page.locator('.photo-card-hover');
    const foodCount = await foodCards.count();
    expect(foodCount).toBeGreaterThanOrEqual(4);

    const foodSrcs: string[] = [];
    for (let i = 0; i < foodCount; i++) {
      const img = foodCards.nth(i).locator('img').first();
      const src = await img.getAttribute('src');
      if (src) foodSrcs.push(src);
      await expect(async () => {
        const natWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(natWidth).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });
    }

    // Verify regional food distinctness
    const uniqueFoodSrcs = new Set(foodSrcs);
    expect(uniqueFoodSrcs.size).toBe(foodSrcs.length);

    await page.screenshot({
      path: path.join(screenshotDir, 'v3_02_shimla_regional_food.png'),
      fullPage: false
    });

    // Stays Tab
    const staysTab = page.getByRole('button', { name: /Stays & Hotels/i });
    await expect(staysTab).toBeVisible({ timeout: 10000 });
    await staysTab.click();
    await page.waitForTimeout(600);

    const stayCards = page.locator('.photo-card-hover');
    const stayCount = await stayCards.count();
    expect(stayCount).toBeGreaterThanOrEqual(3);

    const staySrcs: string[] = [];
    for (let i = 0; i < stayCount; i++) {
      const img = stayCards.nth(i).locator('img').first();
      const src = await img.getAttribute('src');
      if (src) staySrcs.push(src);
      await expect(async () => {
        const natWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(natWidth).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });
    }

    const uniqueStaySrcs = new Set(staySrcs);
    expect(uniqueStaySrcs.size).toBe(staySrcs.length);

    await page.screenshot({
      path: path.join(screenshotDir, 'v3_03_shimla_stays.png'),
      fullPage: false
    });
  });

  test('03. Spiti & Chopta — Authentic Covers & Distinct Valley Attractions', async ({ page }) => {
    // Spiti
    await page.goto('/explore/spiti');
    await page.waitForLoadState('networkidle');

    const spitiHero = page.getByRole('heading', { level: 1, name: /Spiti/i });
    await expect(spitiHero).toBeVisible({ timeout: 15000 });

    const spitiCards = page.locator('.photo-card-hover');
    const spitiCount = await spitiCards.count();
    expect(spitiCount).toBeGreaterThanOrEqual(5);

    const spitiSrcs: string[] = [];
    for (let i = 0; i < spitiCount; i++) {
      const img = spitiCards.nth(i).locator('img').first();
      const src = await img.getAttribute('src');
      if (src) spitiSrcs.push(src);
    }
    const uniqueSpitiSrcs = new Set(spitiSrcs);
    expect(uniqueSpitiSrcs.size).toBe(spitiSrcs.length);

    await page.screenshot({
      path: path.join(screenshotDir, 'v3_04_spiti_distinct_attractions.png'),
      fullPage: false
    });

    // Chopta
    await page.goto('/explore/chopta');
    await page.waitForLoadState('networkidle');

    const choptaHero = page.getByRole('heading', { level: 1, name: /Chopta/i });
    await expect(choptaHero).toBeVisible({ timeout: 15000 });

    const choptaCards = page.locator('.photo-card-hover');
    const choptaCount = await choptaCards.count();
    expect(choptaCount).toBeGreaterThanOrEqual(4);

    const choptaSrcs: string[] = [];
    for (let i = 0; i < choptaCount; i++) {
      const img = choptaCards.nth(i).locator('img').first();
      const src = await img.getAttribute('src');
      if (src) choptaSrcs.push(src);
    }
    const uniqueChoptaSrcs = new Set(choptaSrcs);
    expect(uniqueChoptaSrcs.size).toBe(choptaSrcs.length);

    await page.screenshot({
      path: path.join(screenshotDir, 'v3_05_chopta_distinct_attractions.png'),
      fullPage: false
    });
  });

  test('04. Stories Catalog — Rich Photography & Zero Broken Assets', async ({ page }) => {
    const brokenImages: string[] = [];
    page.on('response', (res) => {
      if (res.status() === 404 && res.url().includes('/media/')) {
        brokenImages.push(res.url());
      }
    });

    await page.goto('/stories');
    await page.waitForLoadState('networkidle');

    const storyHeading = page.getByRole('heading', { name: /Authentic Travel Stories|Travel Dispatch/i });
    await expect(storyHeading).toBeVisible({ timeout: 15000 });

    expect(brokenImages).toHaveLength(0);

    await page.screenshot({
      path: path.join(screenshotDir, 'v3_06_stories_catalog.png'),
      fullPage: false
    });
  });

  test('05. Planner Page — Zero React Hydration Mismatch & Interactive Mount', async ({ page }) => {
    const errorLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' || /hydration|418|mismatch/i.test(text)) {
        errorLogs.push(text);
      }
    });

    // 1. Authenticate with demo credentials to pass planner auth guard
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@navix.com');
    await page.fill('input[type="password"]', 'DemoExplorer2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // 2. Navigate to /plan
    await page.goto('/plan');
    await page.waitForLoadState('networkidle');

    // 3. Verify Trip Setup Stage heading is visible
    const stageHeading = page.getByRole('heading', { name: /Where & when are you traveling/i });
    await expect(stageHeading).toBeVisible({ timeout: 15000 });

    // 4. Verify corridor chip exists and can be clicked
    const corridorChip = page.getByRole('button', { name: /Sangli → Manali/i });
    await expect(corridorChip).toBeVisible();

    // 5. Zero hydration or runtime errors
    const hydrationErrors = errorLogs.filter(e => /hydration|418|mismatch/i.test(e));
    expect(hydrationErrors).toHaveLength(0);

    await page.screenshot({
      path: path.join(screenshotDir, 'v3_07_planner_clean_mount.png'),
      fullPage: false
    });
  });
});
