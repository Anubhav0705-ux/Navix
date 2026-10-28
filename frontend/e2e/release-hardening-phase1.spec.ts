import { test, expect } from '@playwright/test';

test.describe('NAVIX Release Hardening Phase 1: End-to-End Test Suite', () => {
  // Test unique traveler credentials
  const testId = Date.now();
  const testTravelerEmail = `traveler_${testId}@test.navix.local`;
  const initialPassword = 'InitialSecurePassword123!';
  const updatedPassword = 'BrandNewSecurePassword456!';
  let temporaryPassword = '';

  test('1. Travel-themed 404 page renders for unmapped routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await page.waitForLoadState('domcontentloaded');

    // Verify 404 waypoint badge & travel editorial copy
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.getByRole('heading', { name: /wandered off the map/i })).toBeVisible();
    await expect(page.locator('text=Even the best journeys')).toBeVisible();

    // Verify fallback navigation links
    const homeLink = page.getByRole('link', { name: /Back to Home|Return Home/i });
    const exploreLink = page.getByRole('link', { name: /Explore Destinations/i });
    const planLink = page.getByRole('link', { name: /Plan a Trip/i });

    await expect(homeLink).toBeVisible();
    await expect(exploreLink).toBeVisible();
    await expect(planLink).toBeVisible();

    // Test navigation back home
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('2. Lightweight onboarding tour steps and dismissal', async ({ page }) => {
    // Navigate home with fresh state
    await page.goto('/?showTour=true');
    await page.waitForLoadState('domcontentloaded');

    // Onboarding modal should be visible
    const tourModal = page.locator('text=Choose Your Destination');
    await expect(tourModal).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Step 1 of 3')).toBeVisible({ timeout: 10000 });

    // Step 2
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    await nextBtn.click();
    await expect(page.locator('text=Step 2 of 3')).toBeVisible();
    await expect(page.locator('text=Set a Hard Budget Ceiling')).toBeVisible();

    // Step 3
    await nextBtn.click();
    await expect(page.locator('text=Step 3 of 3')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Algorithmic Multimodal Routing' })).toBeVisible();

    // Complete onboarding
    const startBtn = page.getByRole('button', { name: /Start Exploring/i });
    await startBtn.click();
    await expect(tourModal).not.toBeVisible();
  });

  test('3. Traveler registration with lightweight bot honeypot protection', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    // Fill registration form using semantic IDs
    await page.fill('#register-name', 'Hardening Test Traveler');
    await page.fill('#register-email', testTravelerEmail);
    await page.fill('#register-password', initialPassword);
    await page.fill('#register-confirm-password', initialPassword);

    // Verify honeypot field is hidden
    const honeypot = page.locator('input[name="hp_field"]');
    if (await honeypot.count() > 0) {
      await expect(honeypot).toBeHidden();
    }

    // Submit registration
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL(url => url.pathname.includes('/dashboard') || url.pathname.includes('/login'), { timeout: 15000 });
  });

  test('4. Submit forgot-password request with generic enumeration prevention', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/auth/forgot-password');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /Recover your account/i })).toBeVisible();
    await expect(page.locator('text=Submit a password reset request')).toBeVisible();

    // Submit reset request
    await page.fill('#recovery-identifier', testTravelerEmail);
    await page.click('button[type="submit"]');

    // Generic confirmation without leaking user existence
    await expect(page.locator('text=Request Logged for Review')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=If the account exists, your reset request has been submitted')).toBeVisible();
  });

  test('5. Admin reviews and approves password reset in control panel', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('#login-email', 'admin@navix.com');
    const adminPassword = process.env.NAVIX_DEMO_ADMIN_PASSWORD || 'NavixTestAdmin2026!SecureKey';
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => url.pathname.includes('/admin') || url.pathname.includes('/dashboard'), { timeout: 15000 });

    // Navigate to admin
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Switch to Password Resets tab
    const resetTab = page.locator('button', { hasText: 'Password Resets' });
    await resetTab.click();

    // Locate the row for our traveler
    const row = page.locator('tr', { hasText: testTravelerEmail });
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row.locator('text=PENDING')).toBeVisible();

    // Click Approve
    const approveBtn = row.getByRole('button', { name: /Approve/i });
    await approveBtn.click();

    // Temporary credential modal appears
    await expect(page.locator('text=Temporary Credential Generated')).toBeVisible({ timeout: 8000 });

    // Capture temporary password
    const passwordSpan = page.locator('span.select-all');
    temporaryPassword = (await passwordSpan.innerText()).trim();
    expect(temporaryPassword).toMatch(/^NX-[A-Za-z0-9_-]+$/);

    // Dismiss modal
    await page.click('button:has-text("Done")');
  });

  test('6. Temporary password login enforces forced password change and invalidation', async ({ page, context }) => {
    expect(temporaryPassword).toBeTruthy();

    // Traveler logs in with temporary password
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('#login-email', testTravelerEmail);
    await page.fill('#login-password', temporaryPassword);
    await page.click('button[type="submit"]');

    // Enforce immediate redirection to forced password change
    await page.waitForURL(url => url.pathname.includes('/auth/set-new-password'), { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Set your permanent password/i })).toBeVisible();

    // Set permanent new password
    await page.fill('#set-new-password', updatedPassword);
    await page.fill('#confirm-new-password', updatedPassword);
    await page.click('button[type="submit"]');

    // Redirected to Dashboard with active session
    await page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();

    // Invalidation check: Temporary password must no longer work
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto('/login');
    await page.fill('#login-email', testTravelerEmail);
    await page.fill('#login-password', temporaryPassword);
    await page.click('button[type="submit"]');

    // Expect invalid credentials error
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });

  test('7. Logged-in password change in Account Security', async ({ page }) => {
    // Log in with updated password
    await page.goto('/login');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto('/login');
    await page.fill('#login-email', testTravelerEmail);
    await page.fill('#login-password', updatedPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();

    // Scroll to Account Security & Preferences
    await page.locator('text=Account Security & Preferences').scrollIntoViewIfNeeded();

    // Fill change password form
    const finalPassword = 'FinalSecurePassword789!';
    await page.fill('input[placeholder="Enter current password"]', updatedPassword);
    await page.fill('input[placeholder="At least 8 characters"]', finalPassword);
    await page.fill('input[placeholder="Repeat new password"]', finalPassword);

    await page.click('button:has-text("Update Password")');

    // Expect success message
    await expect(page.locator('text=Password successfully updated.')).toBeVisible({ timeout: 6000 });
  });

  test('8. Account Deletion: Requires password + "DELETE" confirmation', async ({ page }) => {
    // Log in with the final updated password
    await page.goto('/login');
    await page.fill('#login-email', testTravelerEmail);
    await page.fill('#login-password', 'FinalSecurePassword789!');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 10000 });

    // Open Danger Zone deletion modal
    await page.locator('text=Danger Zone').scrollIntoViewIfNeeded();
    await page.click('button:has-text("Delete Account...")');

    // Modal appears
    await expect(page.locator('text=Confirm Account Deletion')).toBeVisible();

    // Test validation without typing DELETE
    await page.fill('input[placeholder="Your current password"]', 'FinalSecurePassword789!');
    await page.fill('input[placeholder="DELETE"]', 'WRONG');
    await page.click('button:has-text("Permanently Delete Account")');

    await expect(page.locator("text=Please type 'DELETE' in uppercase to confirm.")).toBeVisible();

    // Type DELETE and confirm
    await page.fill('input[placeholder="DELETE"]', 'DELETE');
    await page.click('button:has-text("Permanently Delete Account")');

    // User is redirected to login or home
    await page.waitForURL(url => url.pathname.includes('/login') || url.pathname === '/', { timeout: 15000 });

    // Account is permanently erased and cannot log in
    await page.goto('/login');
    await page.fill('#login-email', testTravelerEmail);
    await page.fill('#login-password', 'FinalSecurePassword789!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });

  test('9. Mobile responsiveness across viewports without horizontal overflow', async ({ page }) => {
    const viewports = [
      { width: 360, height: 740, name: '360px small mobile' },
      { width: 390, height: 844, name: '390px modern mobile' },
      { width: 768, height: 1024, name: '768px tablet' },
      { width: 1366, height: 768, name: '1366px laptop' },
    ];

    const testRoutes = ['/', '/auth/forgot-password', '/this-page-does-not-exist'];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of testRoutes) {
        await page.goto(route);
        await page.waitForLoadState('domcontentloaded');

        // Check for horizontal overflow
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        expect(overflow, `Horizontal overflow detected on ${route} at ${vp.name}`).toBe(false);
      }
    }
  });
});
