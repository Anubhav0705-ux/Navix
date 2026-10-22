import { test, expect } from '@playwright/test';

test.describe('React Error #185 Regression Suite (Maximum Update Depth Exceeded)', () => {
  test.beforeEach(async ({ page }) => {
    // Collect all browser console errors and unhandled exceptions
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Fail if React error #185 or "Maximum update depth exceeded" is logged
        expect(text).not.toContain('Minified React error #185');
        expect(text).not.toContain('Maximum update depth exceeded');
      }
    });

    page.on('pageerror', (exception) => {
      const msg = exception.message;
      expect(msg).not.toContain('Minified React error #185');
      expect(msg).not.toContain('Maximum update depth exceeded');
      expect(msg).not.toContain('Too many re-renders');
    });
  });

  test('01. Direct load of /dashboard with authenticated session in localStorage has zero #185 errors', async ({ page }) => {
    await page.goto('/login');
    // Seed authenticated session directly in localStorage
    await page.evaluate(() => {
      const demoUser = {
        id: 'usr-demo-001',
        name: 'Demo Explorer',
        email: 'demo@navix.com',
        role: 'TRAVELER',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('navix_auth_token', 'mock_jwt_token_for_regression_test');
      localStorage.setItem('navix_auth_user', JSON.stringify(demoUser));
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
    // Ensure crash screen does NOT appear
    await expect(page.locator('text=This page couldn’t load')).not.toBeVisible();
    await expect(page.locator('text=Maximum update depth exceeded')).not.toBeVisible();

    // Verify authenticated user greeting and Navbar are rendered
    await expect(page.locator('nav[aria-label="Main Navigation"]')).toBeVisible();
    await expect(page.locator('button[aria-haspopup="true"]')).toBeVisible();
  });

  test('02. Direct load of / with authenticated session in localStorage has zero #185 errors', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const demoUser = {
        id: 'usr-demo-001',
        name: 'Demo Explorer',
        email: 'demo@navix.com',
        role: 'TRAVELER',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('navix_auth_token', 'mock_jwt_token_for_regression_test');
      localStorage.setItem('navix_auth_user', JSON.stringify(demoUser));
    });

    await page.reload();
    await expect(page.locator('text=This page couldn’t load')).not.toBeVisible();
    await expect(page.locator('nav[aria-label="Main Navigation"]')).toBeVisible();
    await expect(page.locator('button[aria-haspopup="true"]')).toBeVisible();
  });

  test('03. Full interactive login, navigation across routes, and clean logout', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    await page.fill('#login-email', 'demo@navix.com');
    await page.fill('#login-password', 'DemoExplorer2026!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page.locator('text=This page couldn’t load')).not.toBeVisible();

    // Navigate to /explore
    await page.goto('/explore');
    await expect(page.locator('text=This page couldn’t load')).not.toBeVisible();
    await expect(page.locator('nav[aria-label="Main Navigation"]')).toBeVisible();

    // Navigate to /stories
    await page.goto('/stories');
    await expect(page.locator('text=This page couldn’t load')).not.toBeVisible();

    // Navigate to /plan
    await page.goto('/plan');
    await expect(page.locator('text=This page couldn’t load')).not.toBeVisible();

    // Navigate back to /dashboard to test authenticated Navbar dropdown
    await page.goto('/dashboard');
    await expect(page.locator('text=This page couldn’t load')).not.toBeVisible();

    // Logout
    const avatarBtn = page.locator('button[aria-haspopup="true"]');
    await expect(avatarBtn).toBeVisible();
    await avatarBtn.click();

    const dropdownMenu = page.locator('div[role="menu"]');
    await expect(dropdownMenu).toBeVisible();
    await dropdownMenu.getByRole('menuitem', { name: /Log out/i }).click();

    await page.waitForURL('**/', { timeout: 15000 });
    await expect(page.getByRole('link', { name: /^Log in$/i })).toBeVisible();
  });
});
