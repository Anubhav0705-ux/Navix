import { test, expect } from '@playwright/test';

test.describe('NAVIX Real Transport Data Platform E2E (Phase 9 WP-9.1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dev/transport-data');
    await expect(page.getByText(/Real Transport Provider Platform & Schedules/i)).toBeVisible({ timeout: 15000 });
  });

  test('Flow T1: Dev transport platform dashboard loads real ingested provider services with truthful metadata', async ({ page }) => {
    // Check source registry cards
    await expect(page.getByText(/Indian Railways Open Timetable & Schedule Dataset/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Maharashtra State Road Transport Express Bus Schedules/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/DGCA Domestic Air Schedule Directory/i)).toBeVisible({ timeout: 10000 });

    // Check transport service cards
    await expect(page.getByText(/Koyna Express/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Goa Express/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/IndiGo Pune - Delhi Non-Stop/i)).toBeVisible({ timeout: 10000 });

    // Check classification badges
    await expect(page.getByText(/REAL SOURCE-DERIVED/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/SYNTHETIC CONTRACT FIXTURE/i).first()).toBeVisible({ timeout: 10000 });

    // Check static / historical state badge
    await expect(page.getByText(/STATIC \/ HISTORICAL/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Flow T2: Filter transport services by transport mode (RAIL, BUS, FLIGHT)', async ({ page }) => {
    // Click RAIL filter
    const railBtn = page.getByRole('button', { name: /^RAIL$/i });
    await expect(railBtn).toBeVisible({ timeout: 10000 });
    await railBtn.click();
    await expect(page.getByText(/Koyna Express/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Mahalaxmi Express/i)).toBeVisible({ timeout: 10000 });

    // Click BUS filter
    const busBtn = page.getByRole('button', { name: /^BUS$/i });
    await expect(busBtn).toBeVisible({ timeout: 10000 });
    await busBtn.click();
    await expect(page.getByText(/Sangli - Pune Shivneri AC Express/i)).toBeVisible({ timeout: 10000 });

    // Click FLIGHT filter
    const flightBtn = page.getByRole('button', { name: /^FLIGHT$/i });
    await expect(flightBtn).toBeVisible({ timeout: 10000 });
    await flightBtn.click();
    await expect(page.getByText(/IndiGo Pune - Delhi Non-Stop/i)).toBeVisible({ timeout: 10000 });
  });

  test('Flow T3: Verify canonical geography linking and truthful fare/availability indicators', async ({ page }) => {
    // Verify canonical facility ID is rendered (fac_sangli_sli, never fac_sli_rail)
    await expect(page.getByText(/fac_sangli_sli/i).first()).toBeVisible({ timeout: 10000 });

    // Verify Pune Junction rail station renders fac_pune_pune
    await expect(page.getByText(/fac_pune_pune/i).first()).toBeVisible({ timeout: 10000 });

    // Verify Pune Airport flight station renders fac_pune_pnq
    await expect(page.getByText(/fac_pune_pnq/i).first()).toBeVisible({ timeout: 10000 });

    // Verify no fabricated fare: Fare unavailable is displayed
    await expect(page.getByText(/Fare unavailable/i).first()).toBeVisible({ timeout: 10000 });

    // Verify seat availability is truthful: Availability not provided
    await expect(page.getByText(/Availability not provided/i).first()).toBeVisible({ timeout: 10000 });

    // Verify provenance and license metadata tags
    await expect(page.getByText(/GODL-India/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Ministry of Railways/i).first()).toBeVisible({ timeout: 10000 });
  });
});
