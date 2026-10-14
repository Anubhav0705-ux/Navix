import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('NAVIX Phase 1 — Nationwide Trip Planner Verification & Recovery', () => {
  test.setTimeout(180000);

  const screenshotDir = path.join(process.cwd(), 'e2e-screenshots', 'phase1');
  const artifactScreenshotDir = 'C:\\Users\\anubh\\.gemini\\antigravity-ide\\brain\\258f948e-3aa6-40d4-aeda-280e53b8bad1\\screenshots';

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    if (!fs.existsSync(artifactScreenshotDir)) {
      fs.mkdirSync(artifactScreenshotDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  async function copyToArtifacts(filename: string) {
    const src = path.join(screenshotDir, filename);
    const dst = path.join(artifactScreenshotDir, filename);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
    }
  }

  // Helper to complete stages 2 -> 6 and click generate
  async function completePlannerStages(page: Page) {
    // Stage 2: Transport Alternatives
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 20000 });
    const altCards = page.locator('.cursor-pointer:has-text("Transfer(s)"), [data-testid="alt-card"]');
    await expect(altCards.first()).toBeVisible({ timeout: 25000 });
    await page.getByRole('button', { name: /Continue to Places/i }).click();

    // Stage 3: Places
    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Food/i }).click();

    // Stage 4: Food
    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Stays/i }).click();

    // Stage 5: Stays
    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    // Stage 6: Review & Budget Ledger
    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.locator('#generate-itinerary-btn').click();

    // Stage 7: Flagship Command Center
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 35000 });
  }

  test('Scenario 1: Homepage → Planner → Sangli → Manali → Complete Trip', async ({ page }) => {
    // Start at Homepage
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /India is yours|Your next great journey|Go further. Plan smarter./i })).toBeVisible({ timeout: 15000 });

    // Navigate to Planner via hero CTA
    const planLink = page.getByRole('link', { name: /Plan a Journey|Plan my trip|Start Planning|Plan Trip/i }).first();
    await planLink.click();
    await page.waitForURL('**/plan', { timeout: 10000 });

    // Fill Stage 1 Form: Sangli -> Manali
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.locator('#planner-origin-input').fill('Sangli');
    await page.locator('#planner-dest-input').fill('Manali');
    await page.locator('input[type="number"]').fill('35000');
    await page.locator('#trip-setup-continue-btn').click();

    // Complete Stages 2 through 7
    await completePlannerStages(page);

    // Verify Sangli and Manali are present in the final itinerary
    await expect(page.getByText(/Sangli/i).first()).toBeVisible();
    await expect(page.getByText(/Manali/i).first()).toBeVisible();
    await expect(page.getByText(/₹/i).first()).toBeVisible();
  });

  test('Scenario 2: Explore → Goa → Plan Trip → Select Pune → Complete Trip & Capture Itinerary', async ({ page }) => {
    // Start at Explore
    await page.goto('/explore');
    await expect(page.getByRole('heading', { name: /Explore Destinations/i })).toBeVisible({ timeout: 15000 });

    // Navigate to Goa destination detail
    await page.goto('/explore/goa');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Goa/i, { timeout: 15000 });

    // Click "Build Trip Itinerary"
    const buildBtn = page.getByRole('link', { name: /Build Trip Itinerary/i });
    await expect(buildBtn).toBeVisible();
    await buildBtn.click();
    await page.waitForURL('**/plan?destination=**', { timeout: 10000 });

    // Verify destination is prefilled with Goa
    await expect(page.locator('#planner-dest-input')).toHaveValue(/Goa/i);

    // Set Origin to Pune and proceed
    await page.locator('#planner-origin-input').fill('Pune');
    await page.locator('input[type="number"]').fill('25000');
    await page.locator('#trip-setup-continue-btn').click();

    // Complete stages
    await completePlannerStages(page);

    // Assert Pune and Goa are in the final journey
    await expect(page.getByText(/Pune/i).first()).toBeVisible();
    await expect(page.getByText(/Goa/i).first()).toBeVisible();

    // Capture Goa Itinerary Screenshot
    await page.waitForTimeout(1000);
    const screenshotName = 'phase1_goa_itinerary.png';
    await page.screenshot({ path: path.join(screenshotDir, screenshotName), fullPage: false });
    await copyToArtifacts(screenshotName);
  });

  test('Scenario 3: Explore → Udaipur → Plan Trip → Select Mumbai → Complete Trip & Capture Itinerary', async ({ page }) => {
    // Start at Explore
    await page.goto('/explore/udaipur');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Udaipur/i, { timeout: 15000 });

    // Click "Build Trip Itinerary"
    const buildBtn = page.getByRole('link', { name: /Build Trip Itinerary/i });
    await expect(buildBtn).toBeVisible();
    await buildBtn.click();
    await page.waitForURL('**/plan?destination=**', { timeout: 10000 });

    // Verify destination is Udaipur
    await expect(page.locator('#planner-dest-input')).toHaveValue(/Udaipur/i);

    // Set Origin to Mumbai
    await page.locator('#planner-origin-input').fill('Mumbai');
    await page.locator('input[type="number"]').fill('30000');
    await page.locator('#trip-setup-continue-btn').click();

    // Complete stages
    await completePlannerStages(page);

    // Assert Mumbai and Udaipur are in the final journey
    await expect(page.getByText(/Mumbai/i).first()).toBeVisible();
    await expect(page.getByText(/Udaipur/i).first()).toBeVisible();

    // Capture Udaipur Itinerary Screenshot
    await page.waitForTimeout(1000);
    const screenshotName = 'phase1_udaipur_itinerary.png';
    await page.screenshot({ path: path.join(screenshotDir, screenshotName), fullPage: false });
    await copyToArtifacts(screenshotName);
  });

  test('Scenario 4: Direct Planner → Delhi → Rishikesh → Complete Trip & Capture Itinerary', async ({ page }) => {
    // Direct Planner navigation
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    // Fill Stage 1 Form: Delhi -> Rishikesh
    await page.locator('#planner-origin-input').fill('Delhi');
    await page.locator('#planner-dest-input').fill('Rishikesh');
    await page.locator('input[type="number"]').fill('20000');
    await page.locator('#trip-setup-continue-btn').click();

    // Complete stages
    await completePlannerStages(page);

    // Assert Delhi and Rishikesh
    await expect(page.getByText(/Delhi/i).first()).toBeVisible();
    await expect(page.getByText(/Rishikesh/i).first()).toBeVisible();

    // Capture Rishikesh Itinerary Screenshot
    await page.waitForTimeout(1000);
    const screenshotName = 'phase1_rishikesh_itinerary.png';
    await page.screenshot({ path: path.join(screenshotDir, screenshotName), fullPage: false });
    await copyToArtifacts(screenshotName);
  });

  test('Scenario 5: Explore → Munnar → Plan Trip → Select Kochi → Complete Trip', async ({ page }) => {
    // Start at Munnar explore
    await page.goto('/explore/munnar');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Munnar/i, { timeout: 15000 });

    // Click "Build Trip Itinerary"
    const buildBtn = page.getByRole('link', { name: /Build Trip Itinerary/i });
    await expect(buildBtn).toBeVisible();
    await buildBtn.click();
    await page.waitForURL('**/plan?destination=**', { timeout: 10000 });

    // Set Origin to Kochi
    await page.locator('#planner-origin-input').fill('Kochi');
    await page.locator('input[type="number"]').fill('22000');
    await page.locator('#trip-setup-continue-btn').click();

    // Complete stages
    await completePlannerStages(page);

    // Assert Kochi and Munnar
    await expect(page.getByText(/Kochi/i).first()).toBeVisible();
    await expect(page.getByText(/Munnar/i).first()).toBeVisible();
  });

  test('Scenario 6: Trip Save, Dashboard Reopen, and PDF Export Verification', async ({ page }) => {
    // 1. Sign in with Demo Account
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign In|Welcome back/i })).toBeVisible({ timeout: 15000 });
    const signInBtn = page.locator('button[type="submit"]');
    await signInBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // 2. Plan a journey
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.locator('#planner-origin-input').fill('Sangli');
    await page.locator('#planner-dest-input').fill('Manali');
    await page.locator('input[type="number"]').fill('40000');
    await page.locator('#trip-setup-continue-btn').click();
    await completePlannerStages(page);

    // 3. Test Save Trip
    const saveBtn = page.getByRole('button', { name: /Save Trip|Saved/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    await expect(page.getByText(/Saved ✓|Saved/i)).toBeVisible({ timeout: 10000 });

    // 4. Test PDF Export
    const pdfBtn = page.getByRole('button', { name: /Download PDF|Export PDF/i });
    await expect(pdfBtn).toBeVisible();
    // Clicking PDF export triggers jsPDF client-side download without unhandled exceptions
    await pdfBtn.click();
    await page.waitForTimeout(1000);

    // 5. Test Dashboard Reopen
    await page.goto('/dashboard');
    await expect(page.getByText(/Saved Journeys/i)).toBeVisible({ timeout: 15000 });

    // Find "Open Full Itinerary" button on the saved trip card
    const openBtn = page.getByRole('button', { name: /Open Full Itinerary/i }).first();
    await expect(openBtn).toBeVisible({ timeout: 10000 });
    await openBtn.click();

    // Verify it navigates to /plan?reopen=true and renders Stage 7 Command Center
    await page.waitForURL('**/plan?reopen=true', { timeout: 15000 });
    await expect(page.getByText(/TRIP READY|JOURNEY COMPUTED/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Sangli/i).first()).toBeVisible();
    await expect(page.getByText(/Manali/i).first()).toBeVisible();
  });
});
