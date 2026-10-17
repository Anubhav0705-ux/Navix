import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('NAVIX Homepage Hero Background Carousel Visual Inspection', () => {
  const screenshotDir = path.join(process.cwd(), 'e2e-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const viewports = [
    { name: '390px_mobile', width: 390, height: 844 },
    { name: '768px_tablet', width: 768, height: 1024 },
    { name: '1366px_laptop', width: 1366, height: 768 },
    { name: '1920px_desktop', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    test(`Hero screenshot at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Wait for hero headline to be visible
      const heading = page.getByRole('heading', { name: /India is yours/i });
      await expect(heading).toBeVisible({ timeout: 15000 });

      // Verify that the photo image is loaded
      const heroImg = page.locator('#hero-scene-image');
      await expect(heroImg).toBeVisible({ timeout: 10000 });

      // Check bounding box: hero image must start at top: 0 and cover the hero area behind the heading
      const heroBox = await page.locator('section[aria-label="Hero showcase"]').boundingBox();
      const headingBox = await heading.boundingBox();

      expect(heroBox).not.toBeNull();
      expect(headingBox).not.toBeNull();

      // Heading must be within the hero container vertical bounds, NOT pushed below it
      if (heroBox && headingBox) {
        expect(headingBox.y).toBeGreaterThanOrEqual(heroBox.y);
        expect(headingBox.y + headingBox.height).toBeLessThanOrEqual(heroBox.y + heroBox.height);
      }

      await page.waitForTimeout(500);

      // Capture hero viewport screenshot
      await page.screenshot({
        path: path.join(screenshotDir, `hero_${vp.name}.png`),
        fullPage: false
      });
    });
  }

  test('Hero carousel next navigation updates slide smoothly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const nextBtn = page.getByRole('button', { name: /Next destination/i });
    await expect(nextBtn).toBeVisible();

    // Click next slide (Goa -> Manali)
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Verify Manali scene badge
    await expect(page.getByText(/Manali/i).first()).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, 'hero_slide_manali.png'),
      fullPage: false
    });
  });
});
