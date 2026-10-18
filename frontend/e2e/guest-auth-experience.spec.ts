import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('NAVIX Premium Authentication Experience & Guest-to-Traveler Journey', () => {
  test.setTimeout(90000);

  const screenshotDir = path.join(process.cwd(), 'e2e-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  test.beforeEach(async ({ page }) => {
    // Clear cookies & localStorage for clean unauthenticated guest state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });

  // =========================================================================
  // 1. PUBLIC GUEST NAVIGATION & DISCOVERY
  // =========================================================================
  test('01. Guest Navigation — Only Explore & Stories visible, Log in button present', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const nav = page.locator('nav[aria-label="Main Navigation"]');
    await expect(nav).toBeVisible();

    // Verify exactly TWO public discovery links in guest nav
    await expect(nav.getByRole('link', { name: /Explore/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Stories/i })).toBeVisible();

    // Verify protected items are NOT visible in guest navbar
    await expect(nav.getByRole('link', { name: /Plan a Trip|Plan Trip/i })).not.toBeVisible();
    await expect(nav.getByRole('link', { name: /My Trips/i })).not.toBeVisible();
    await expect(nav.getByRole('link', { name: /Dashboard/i })).not.toBeVisible();

    // Verify clean Log in button on right
    const loginBtn = page.getByRole('link', { name: /^Log in$/i });
    await expect(loginBtn).toBeVisible();

    // Capture Screenshot: Guest homepage navbar
    await page.screenshot({ path: path.join(screenshotDir, '01_guest_homepage_navbar.png'), fullPage: false });
  });

  test('02. Public Discovery — Explore, Destination Detail, and Stories accessible without login', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Explore catalog
    await page.goto('/explore');
    await expect(page.getByRole('heading', { name: /Explore Destinations/i })).toBeVisible({ timeout: 15000 });

    // Destination detail (Goa)
    await page.goto('/explore/goa');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Goa/i, { timeout: 15000 });

    // Stories list
    await page.goto('/stories');
    await expect(page.getByRole('heading', { name: /Authentic Travel Stories|Travel Dispatch/i })).toBeVisible({ timeout: 15000 });

    // Story detail
    await page.goto('/stories/sangli-to-manali-budget-guide');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 2. ROUTE PROTECTION & REDIRECTION
  // =========================================================================
  test('03. Direct Route Protection — Unauthenticated access to /plan and /dashboard redirects to login', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Direct /plan navigation
    await page.goto('/plan');
    await page.waitForURL(/\/login\?returnTo=(%2F|\/)plan/i, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Sign in to continue planning|Welcome back/i })).toBeVisible();

    // Direct /dashboard navigation
    await page.goto('/dashboard');
    await page.waitForURL(/\/login\?returnTo=(%2F|\/)dashboard/i, { timeout: 15000 });
  });

  test('04. Guest Plan This Destination CTA — Redirects with destination preserved', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('/explore/goa');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Goa/i, { timeout: 15000 });

    // Click "Build Trip Itinerary"
    const planBtn = page.getByRole('button', { name: /Build Trip Itinerary/i });
    await expect(planBtn).toBeVisible();
    await planBtn.click();

    // Arrives at login with returnTo for Goa
    await page.waitForURL(/\/login\?returnTo=.*Goa.*&intent=plan/i, { timeout: 15000 });

    // Verify context notice pill appears
    await expect(page.locator('text=Trip Draft Saved: Goa')).toBeVisible();

    // Capture Screenshot: Guest Plan Trip Redirect
    await page.screenshot({ path: path.join(screenshotDir, '09_guest_plan_trip_redirect.png'), fullPage: false });
  });

  // =========================================================================
  // 3. TRIP DRAFT RESTORATION JOURNEY
  // =========================================================================
  test('05. Homepage Composer Draft Preservation & Restoration Flow (Pune -> Goa, Budget ₹25,000)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Fill the composer form on homepage
    const originInput = page.locator('input[placeholder="Starting city"]');
    const destInput = page.locator('input[placeholder="Destination"]');
    const budgetInput = page.locator('input[type="number"]');

    await originInput.fill('Pune');
    await destInput.fill('Goa');
    await budgetInput.fill('25000');

    // Submit composer as a guest
    const submitBtn = page.getByRole('button', { name: /Plan my trip/i });
    await submitBtn.click();

    // Arrives on login page with draft preserved
    await page.waitForURL(/\/login\?returnTo=.*&intent=plan/i, { timeout: 15000 });
    await expect(page.locator('text=Trip Draft Saved: Pune → Goa')).toBeVisible();

    // Sign in with authentic demo traveler credentials
    await page.fill('#login-email', 'demo@navix.com');
    await page.fill('#login-password', 'DemoExplorer2026!');
    await page.click('button[type="submit"]');

    // Automatically redirected to planner with restored parameters!
    await page.waitForURL(/\/plan\?/i, { timeout: 15000 });

    // Confirm fields are restored into planner
    await expect(page.locator('text=Goa').first()).toBeVisible({ timeout: 15000 });

    // Capture Screenshot: Restored planner after login
    await page.screenshot({ path: path.join(screenshotDir, '10_restored_planner_after_login.png'), fullPage: false });
  });

  // =========================================================================
  // 4. AUTHENTICATED USER EXPERIENCE & DROPDOWN
  // =========================================================================
  test('06. Authenticated Navbar, Account Dropdown, and Clean Logout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Log in
    await page.goto('/login');
    await page.fill('#login-email', 'demo@navix.com');
    await page.fill('#login-password', 'DemoExplorer2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Verify Authenticated Navbar layout
    const nav = page.locator('nav[aria-label="Main Navigation"]');
    await expect(nav.getByRole('link', { name: /Explore/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Stories/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Plan a Trip/i })).toBeVisible();

    // Capture Screenshot: Logged-in navbar
    await page.screenshot({ path: path.join(screenshotDir, '02_logged_in_navbar.png'), fullPage: false });

    // Open Account Dropdown
    const avatarBtn = page.locator('button[aria-haspopup="true"]');
    await expect(avatarBtn).toBeVisible();
    await avatarBtn.click();

    // Verify dropdown content
    const dropdownMenu = page.locator('div[role="menu"]');
    await expect(dropdownMenu).toBeVisible();
    await expect(dropdownMenu.getByRole('menuitem', { name: /My Trips/i })).toBeVisible();
    await expect(dropdownMenu.getByRole('menuitem', { name: /Log out/i })).toBeVisible();

    // Capture Screenshot: Account dropdown
    await page.screenshot({ path: path.join(screenshotDir, '11_account_dropdown.png'), fullPage: false });

    // Click Log out
    await dropdownMenu.getByRole('menuitem', { name: /Log out/i }).click();
    await page.waitForURL('**/', { timeout: 15000 });

    // Verify returned to guest navbar state
    await expect(page.getByRole('link', { name: /^Log in$/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Plan a Trip/i })).not.toBeVisible();
  });

  // =========================================================================
  // 5. LOGIN & SIGNUP PREMIUM UI, VISUAL COLLAGE & RESPONSIVE QA
  // =========================================================================
  test('07. Login & Signup Visual Polish, Real Photos in Collage, No Clutter', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Login View
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });

    // Verify password visibility toggle
    const pwdInput = page.locator('#login-password');
    await expect(pwdInput).toHaveAttribute('type', 'password');
    const toggleBtn = page.locator('button[aria-label*="password"]');
    await toggleBtn.click();
    await expect(pwdInput).toHaveAttribute('type', 'text');
    await toggleBtn.click();
    await expect(pwdInput).toHaveAttribute('type', 'password');

    // Verify collage postcard images loaded with natural dimensions
    const manaliImg = page.locator('img[alt="Manali Himalayan Peaks"]');
    await expect(manaliImg).toBeVisible();
    const naturalW = await manaliImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalW).toBeGreaterThan(0);

    // Verify NO demo credentials block or fake OAuth buttons
    await expect(page.locator('text=Demo Account Password')).not.toBeVisible();
    await expect(page.locator('text=Continue with Google')).not.toBeVisible();
    await expect(page.locator('text=Continue with Apple')).not.toBeVisible();

    // Capture Screenshot: Login Desktop
    await page.screenshot({ path: path.join(screenshotDir, '03_login_desktop.png'), fullPage: false });

    // Trigger error state with wrong password
    await page.fill('#login-email', 'demo@navix.com');
    await page.fill('#login-password', 'IncorrectPassword123!');
    await page.click('button[type="submit"]');
    const errorAlert = page.locator('div[role="alert"]:not(#__next-route-announcer__)');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });
    await expect(errorAlert).toContainText(/Invalid email or password/i);
    await page.waitForTimeout(300);

    // Capture Screenshot: Login Form Error State
    await page.screenshot({ path: path.join(screenshotDir, '07_login_form_error_state.png'), fullPage: false });

    // Capture Collage Close-up Screenshot (isolated to the collage container)
    const collageContainer = page.locator('.lg\\:col-span-5').first();
    await expect(collageContainer).toBeVisible();
    await collageContainer.screenshot({ path: path.join(screenshotDir, '12_collage_close_up.png') });

    // 2. Signup View
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Begin your journey/i })).toBeVisible({ timeout: 15000 });

    // Capture Screenshot: Signup Desktop
    await page.screenshot({ path: path.join(screenshotDir, '04_signup_desktop.png'), fullPage: false });

    // Trigger validation error: mismatched passwords
    await page.fill('#register-name', 'Ananya Roy');
    await page.fill('#register-email', 'ananya.roy@example.com');
    await page.fill('#register-password', 'SecretPassword1');
    await page.fill('#register-confirm-password', 'SecretPassword2');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Passwords do not match')).toBeVisible();

    // Capture Screenshot: Registration Validation State
    await page.screenshot({ path: path.join(screenshotDir, '08_registration_validation_state.png'), fullPage: false });
  });

  test('08. Responsive Layouts — Mobile 390px, Tablet 768px, Laptop 1366px, Desktop 1920px', async ({ page }) => {
    // 1. Mobile 390px Viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '05_login_mobile.png'), fullPage: false });

    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Begin your journey/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#register-name')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '06_signup_mobile.png'), fullPage: false });

    // 2. Tablet 768px Viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, 'login_768px_tablet.png'), fullPage: false });

    // 3. Laptop 1366px Viewport
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, 'login_1366px_laptop.png'), fullPage: false });

    // 4. Desktop 1920px Viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, 'login_1920px_desktop.png'), fullPage: false });
  });

  // =========================================================================
  // 6. SECURITY HARDENING
  // =========================================================================
  test('09. Security Guards — Open-redirect attacks rejected, backend private APIs protected', async ({ page, request }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Test open-redirect rejection
    await page.goto('/login?returnTo=https://malicious-external-site.com');
    await page.fill('#login-email', 'demo@navix.com');
    await page.fill('#login-password', 'DemoExplorer2026!');
    await page.click('button[type="submit"]');

    // Must safely fallback to /dashboard, NOT external site!
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    expect(page.url()).not.toContain('malicious');

    // Test Backend API Security: /api/v1/trips/plan without JWT must return 401
    const unauthPlanResp = await request.post('http://localhost:8000/api/v1/trips/plan', {
      data: {
        origin: 'Pune',
        destination: 'Goa',
        maximum_budget: 25000,
        departure_date: '2026-11-01',
        travellers: 2
      }
    });
    expect(unauthPlanResp.status()).toBe(401);

    // Test Backend API Security: /api/v1/trips/saved without JWT must return 401
    const unauthSavedResp = await request.get('http://localhost:8000/api/v1/trips/saved');
    expect(unauthSavedResp.status()).toBe(401);

    // Public API /api/v1/destinations must remain accessible with 200
    const publicDestResp = await request.get('http://localhost:8000/api/v1/destinations');
    expect(publicDestResp.status()).toBe(200);
  });
});
