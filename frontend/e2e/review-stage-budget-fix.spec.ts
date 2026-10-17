import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('NAVIX Review Stage 1-Click Budget Shortfall Resolution Verification', () => {
  const screenshotDir = path.join(process.cwd(), 'e2e-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  test('1-Click Budget Fix resolves shortfall completely in ONE click with NO circular recursion', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Step 1: Navigate to planner
    await page.goto('/plan');
    await expect(page.getByText(/Stage 01 of 07/i)).toBeVisible({ timeout: 15000 });

    // Fill Stage 1 with tight budget (8000) to trigger shortfall on Review (total cost will be ~9,950)
    await page.locator('#planner-origin-input').fill('Sangli');
    await page.locator('#planner-dest-input').fill('Old Manali');
    await page.locator('input[type="number"]').fill('8000'); // Triggers shortfall since non-contingency is ~8,350
    await page.locator('#trip-setup-continue-btn').click();

    // Stage 2: Transport
    await expect(page.getByText(/Stage 02 of 07/i)).toBeVisible({ timeout: 20000 });
    const continueBtn2 = page.getByRole('button', { name: /Continue to Places/i });
    await expect(continueBtn2).toBeVisible({ timeout: 20000 });
    await continueBtn2.click();

    // Stage 3: Places
    await expect(page.getByText(/Stage 03 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Food/i }).click();

    // Stage 4: Food
    await expect(page.getByText(/Stage 04 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Stays/i }).click();

    // Stage 5: Stays
    await expect(page.getByText(/Stage 05 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Review/i }).click();

    // Stage 6: Review Stage
    await expect(page.getByText(/Stage 06 of 07/i)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);

    // Verify shortfall alert is present
    const autoFixBtn = page.locator('#auto-fix-budget-btn');
    await expect(autoFixBtn).toBeVisible({ timeout: 10000 });

    // Capture BEFORE screenshot
    await page.screenshot({
      path: path.join(screenshotDir, 'review_before_1click_fix.png'),
      fullPage: false
    });

    // Extract the target budget from the button text
    const btnText = await autoFixBtn.innerText();
    expect(btnText).toMatch(/increase budget to ₹/i);

    // Click the 1-click button ONCE
    await autoFixBtn.click();
    await page.waitForTimeout(600);

    // Verify the shortfall alert is GONE in ONE single click!
    await expect(autoFixBtn).not.toBeVisible({ timeout: 5000 });

    // Capture AFTER screenshot
    await page.screenshot({
      path: path.join(screenshotDir, 'review_after_1click_fix.png'),
      fullPage: false
    });

    // Verify Generate Itinerary button is ready and enabled
    const generateBtn = page.locator('#generate-itinerary-btn');
    await expect(generateBtn).toBeEnabled();
  });
});
