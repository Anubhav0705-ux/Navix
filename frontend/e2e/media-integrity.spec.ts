import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('NAVIX Authentic Media Integrity & Zero-Duplicate Verification Gate', () => {
  test.setTimeout(90000);

  const screenshotDir = path.join(process.cwd(), 'e2e-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('01. Homepage Hero Image Verification — Authentic Landscape & naturalWidth > 0', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('404')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Locate the hero scene image
    const heroImg = page.locator('#hero-scene-image');
    await expect(heroImg).toBeAttached({ timeout: 15000 });

    // 2. Validate that the image actually loaded with real dimensions (naturalWidth > 0)
    await expect(async () => {
      const naturalWidth = await heroImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }).toPass({ timeout: 15000 });

    const currentSrc = await heroImg.evaluate((img: HTMLImageElement) => img.currentSrc || img.src);
    expect(currentSrc).toContain('http');

    // 3. Verify hero text is visible and legible
    const heroHeading = page.getByRole('heading', { level: 1 });
    await expect(heroHeading).toBeVisible();

    // 4. Capture verified hero screenshot
    await page.screenshot({
      path: path.join(screenshotDir, '01_homepage_hero_real_image.png'),
      fullPage: false
    });

    // Zero image 404 console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('02. Goa Explore Page — Zero Duplicate Attractions & Authentic Photography', async ({ page }) => {
    await page.goto('/explore/goa');
    await page.waitForLoadState('networkidle');

    // Verify Destination Hero Header
    const heroH1 = page.getByRole('heading', { level: 1, name: /Goa/i });
    await expect(heroH1).toBeVisible({ timeout: 15000 });

    // Tab 1: Attractions
    const attractionCards = page.locator('.photo-card-hover');
    const count = await attractionCards.count();
    expect(count).toBeGreaterThanOrEqual(8);

    const attractionImgUrls: string[] = [];

    for (let i = 0; i < count; i++) {
      const card = attractionCards.nth(i);
      const img = card.locator('img').first();
      await expect(img).toBeAttached({ timeout: 5000 });

      const src = await img.getAttribute('src');
      if (src) attractionImgUrls.push(src);
    }

    // Verify at least 5 cards have loaded naturalWidth > 0
    let loadedCount = 0;
    for (let i = 0; i < Math.min(5, count); i++) {
      const img = attractionCards.nth(i).locator('img').first();
      await expect(async () => {
        const natWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(natWidth).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });
      loadedCount++;
    }
    expect(loadedCount).toBeGreaterThanOrEqual(5);

    // CRITICAL ACCEPTANCE GATE: Zero duplicate image URLs across different named attractions
    const uniqueAttractionUrls = new Set(attractionImgUrls);
    expect(uniqueAttractionUrls.size).toBe(attractionImgUrls.length);

    // Capture Goa attractions screenshot
    await page.screenshot({
      path: path.join(screenshotDir, '02_goa_attractions_distinct_photos.png'),
      fullPage: false
    });
  });

  test('03. Goa Food — Dish-Specific Imagery & Zero Duplicates', async ({ page }) => {
    await page.goto('/explore/goa');
    await page.waitForLoadState('networkidle');

    // Switch to Food & Dining tab
    const foodTab = page.getByRole('button', { name: /Food & Dining/i });
    await expect(foodTab).toBeVisible({ timeout: 10000 });
    await foodTab.click();
    await page.waitForTimeout(1000);

    const foodCards = page.locator('.photo-card-hover');
    const count = await foodCards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const foodImgUrls: string[] = [];
    for (let i = 0; i < count; i++) {
      const card = foodCards.nth(i);
      const img = card.locator('img').first();
      await expect(img).toBeAttached({ timeout: 5000 });

      const src = await img.getAttribute('src');
      if (src) foodImgUrls.push(src);

      await expect(async () => {
        const natWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(natWidth).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });
    }

    // All food dish photos must be unique
    const uniqueFoodUrls = new Set(foodImgUrls);
    expect(uniqueFoodUrls.size).toBe(foodImgUrls.length);

    // Capture Goa food screenshot
    await page.screenshot({
      path: path.join(screenshotDir, '03_goa_food_distinct_photos.png'),
      fullPage: false
    });
  });

  test('04. Goa Stays — Authentic Accommodation Photos & Zero Duplicates', async ({ page }) => {
    await page.goto('/explore/goa');
    await page.waitForLoadState('networkidle');

    // Switch to Stays & Hotels tab
    const staysTab = page.getByRole('button', { name: /Stays & Hotels/i });
    await expect(staysTab).toBeVisible({ timeout: 10000 });
    await staysTab.click();
    await page.waitForTimeout(1000);

    const stayCards = page.locator('.photo-card-hover');
    const count = await stayCards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const stayImgUrls: string[] = [];
    for (let i = 0; i < count; i++) {
      const card = stayCards.nth(i);
      const img = card.locator('img').first();
      await expect(img).toBeAttached({ timeout: 5000 });

      const src = await img.getAttribute('src');
      if (src) stayImgUrls.push(src);

      await expect(async () => {
        const natWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(natWidth).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });
    }

    // All stay photos must be unique
    const uniqueStayUrls = new Set(stayImgUrls);
    expect(uniqueStayUrls.size).toBe(stayImgUrls.length);

    // Capture Goa stays screenshot
    await page.screenshot({
      path: path.join(screenshotDir, '04_goa_stays_distinct_photos.png'),
      fullPage: false
    });
  });

  test('05. Jaipur / Manali Explore — Authentic Distinct Photography', async ({ page }) => {
    await page.goto('/explore/jaipur');
    await page.waitForLoadState('networkidle');

    const heroH1 = page.getByRole('heading', { level: 1, name: /Jaipur/i });
    await expect(heroH1).toBeVisible({ timeout: 15000 });

    const cards = page.locator('.photo-card-hover');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(8);

    const imgUrls: string[] = [];
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const img = card.locator('img').first();
      await expect(img).toBeAttached({ timeout: 5000 });

      const src = await img.getAttribute('src');
      if (src) imgUrls.push(src);

      await expect(async () => {
        const natWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(natWidth).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });
    }

    // All Jaipur attractions must be unique
    const uniqueUrls = new Set(imgUrls);
    expect(uniqueUrls.size).toBe(imgUrls.length);

    // Capture Jaipur screenshot
    await page.screenshot({
      path: path.join(screenshotDir, '05_manali_or_jaipur_distinct_photos.png'),
      fullPage: false
    });
  });
});
