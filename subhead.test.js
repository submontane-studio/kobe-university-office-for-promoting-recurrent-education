import { test, expect } from '@playwright/test';

test('subhead pixel-perfect match', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:8080/test-subhead.html');
  
  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(500); // Additional stability wait
  
  const subheadElement = page.locator('[data-testid="subhead"]');
  await expect(subheadElement).toBeVisible();
  
  // Take screenshot and compare with baseline
  await expect(subheadElement).toHaveScreenshot('subhead.png', {
    maxDiffPixelRatio: 0.005 // 0.5% tolerance
  });
});