import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('NAVIX Release Hardening Phase 2: QA & Visual Verification', () => {
  const screenshotDir = path.join(__dirname, '..', 'e2e-screenshots', 'phase2');

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  const viewports = [
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'laptop_1366', width: 1366, height: 768 },
    { name: 'desktop_1920', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    test(`Privacy Policy renders cleanly at ${vp.name}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/privacy');
      await page.waitForLoadState('domcontentloaded');

      // Verify header and core sections
      await expect(page.getByRole('heading', { name: /NAVIX Privacy Policy/i })).toBeVisible();
      await expect(page.locator('text=October 22, 2026').first()).toBeVisible();
      await expect(page.locator('text=First-Party, Privacy-Preserving Analytics')).toBeVisible();
      await expect(page.locator('text=Account Deletion & Backup Retention')).toBeVisible();

      // Check console errors
      const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('Failed to load resource: net::ERR_CONNECTION_REFUSED'));
      expect(criticalErrors).toHaveLength(0);

      // Save screenshot
      await page.screenshot({ path: path.join(screenshotDir, `privacy_${vp.name}.png`), fullPage: false });
    });

    test(`Terms of Service renders cleanly at ${vp.name}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/terms');
      await page.waitForLoadState('domcontentloaded');

      // Verify header and non-agency travel disclaimer
      await expect(page.getByRole('heading', { name: /NAVIX Terms of Service/i })).toBeVisible();
      await expect(page.locator('text=October 22, 2026').first()).toBeVisible();
      await expect(page.locator('text=Important Service Nature & Booking Clarification')).toBeVisible();
      await expect(page.locator('text=Timetable, Fare & Availability Disclaimers')).toBeVisible();

      const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('Failed to load resource: net::ERR_CONNECTION_REFUSED'));
      expect(criticalErrors).toHaveLength(0);

      await page.screenshot({ path: path.join(screenshotDir, `terms_${vp.name}.png`), fullPage: false });
    });
  }

  test('Footer contains visible, valid links to Privacy and Terms', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/explore');
    await page.waitForLoadState('domcontentloaded');

    const privacyLink = page.locator('footer').getByRole('link', { name: /Privacy Policy/i });
    const termsLink = page.locator('footer').getByRole('link', { name: /Terms of Service/i });

    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();

    await privacyLink.click({ force: true });
    await expect(page).toHaveURL(/\/privacy$/);
  });

  test('Registration page displays mandatory Terms and Privacy agreement text', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('text=By creating an account, you agree to our')).toBeVisible();
    await expect(page.locator('form').getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.locator('form').getByRole('link', { name: 'Privacy Policy' })).toBeVisible();

    await page.screenshot({ path: path.join(screenshotDir, 'register_consent.png') });
  });

  test('Admin Product Analytics dashboard renders key metric aggregates', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });

    // Login as admin
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.fill('input[type="email"]', 'admin@navix.com');
    await page.fill('input[type="password"]', 'NavixTestAdmin2026!SecureKey');
    await page.click('button[type="submit"]');

    // Wait for redirect to /admin
    await page.waitForURL('**/admin', { timeout: 15000 });

    // Click on Product Analytics tab
    const analyticsTab = page.getByRole('button', { name: /Product Analytics/i });
    await expect(analyticsTab).toBeVisible();
    await analyticsTab.click();

    // Verify analytics UI elements
    await expect(page.getByRole('heading', { name: /First-Party Product Analytics/i })).toBeVisible();
    await expect(page.locator('text=Planner Starts').first()).toBeVisible();
    await expect(page.locator('text=Completed Plans').first()).toBeVisible();
    await expect(page.locator('text=Saved Trips').first()).toBeVisible();
    await expect(page.locator('text=Completion Rate').first()).toBeVisible();
    await expect(page.locator('text=Most Viewed Destinations').first()).toBeVisible();
    await expect(page.locator('text=14-Day Activity Trend').first()).toBeVisible();

    // Verify no live map or surveillance
    await expect(page.locator('text=live user map')).not.toBeVisible();

    await page.screenshot({ path: path.join(screenshotDir, 'admin_analytics_dashboard.png') });
  });

  test('Custom 404 page renders for invalid routes', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/route-does-not-exist-qa');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.getByRole('heading', { name: /wandered off the map/i })).toBeVisible();

    await page.screenshot({ path: path.join(screenshotDir, '404_error_experience.png') });
  });
});
