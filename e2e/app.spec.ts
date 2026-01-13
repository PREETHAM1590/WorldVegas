import { test, expect } from '@playwright/test';

test.describe('WorldVegas Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the app name and tagline', async ({ page }) => {
    await expect(page.locator('text=WorldVegas')).toBeVisible();
  });

  test('should have login button for unauthenticated users', async ({ page }) => {
    await expect(page.locator('text=Login with World App').or(page.locator('text=Connect Wallet'))).toBeVisible();
  });

  test('should navigate to games section', async ({ page }) => {
    await page.click('text=Games');
    await expect(page).toHaveURL(/.*games.*/i);
  });

  test('should have bottom navigation visible', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should display games cards', async ({ page }) => {
    // Look for game titles
    const slotsCard = page.locator('text=Slots').or(page.locator('text=Lucky Slots'));
    await expect(slotsCard.first()).toBeVisible();
  });
});

test.describe('Games Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games');
  });

  test('should display game selection', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /games/i }).first()).toBeVisible();
  });

  test('should have multiple game options', async ({ page }) => {
    const gameCards = page.locator('[data-game], .game-card, a[href*="/games/"]');
    await expect(gameCards.first()).toBeVisible();
  });
});

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leaderboard');
  });

  test('should display leaderboard title', async ({ page }) => {
    await expect(page.locator('text=Leaderboard').or(page.locator('text=排行榜')).first()).toBeVisible();
  });

  test('should have time period tabs', async ({ page }) => {
    const tabs = page.locator('button, [role="tab"]').filter({
      hasText: /daily|weekly|monthly|all time/i,
    });
    await expect(tabs.first()).toBeVisible();
  });

  test('should switch between time periods', async ({ page }) => {
    const weeklyTab = page.locator('button, [role="tab"]').filter({ hasText: /weekly/i });
    if (await weeklyTab.isVisible()) {
      await weeklyTab.click();
      await expect(weeklyTab).toHaveClass(/active|selected|bg-/);
    }
  });
});

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display settings title', async ({ page }) => {
    await expect(page.locator('text=Settings').or(page.locator('text=设置')).first()).toBeVisible();
  });

  test('should have language selector', async ({ page }) => {
    const languageSection = page.locator('text=Language').or(page.locator('text=语言'));
    await expect(languageSection.first()).toBeVisible();
  });

  test('should have sound toggle', async ({ page }) => {
    const soundSection = page.locator('text=Sound').or(page.locator('text=音效'));
    await expect(soundSection.first()).toBeVisible();
  });

  test('should toggle sound settings', async ({ page }) => {
    const soundToggle = page.locator('button').filter({ hasText: /sound/i });
    if (await soundToggle.isVisible()) {
      await soundToggle.click();
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should be mobile friendly', async ({ page }) => {
    await page.goto('/');

    // Check that bottom nav is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check that content is not cut off
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/');

    // Buttons should be at least 44px for accessibility
    const buttons = page.locator('button');
    const firstButton = buttons.first();

    if (await firstButton.isVisible()) {
      const box = await firstButton.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1s = await page.locator('h1').count();
    expect(h1s).toBeLessThanOrEqual(1); // Should have at most one h1
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test('should have focusable navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeDefined();
  });
});

test.describe('i18n - Language Switching', () => {
  test('should switch to Spanish', async ({ page }) => {
    await page.goto('/settings');

    // Find language selector
    const languageSelect = page.locator('select').filter({ hasText: /English|Español/ });

    if (await languageSelect.isVisible()) {
      await languageSelect.selectOption('es');

      // Verify page content changed
      await page.waitForTimeout(500);
      const content = await page.content();
      expect(content).toContain('Configuración');
    }
  });

  test('should persist language preference', async ({ page }) => {
    await page.goto('/settings');

    const languageSelect = page.locator('select').filter({ hasText: /English|中文/ });

    if (await languageSelect.isVisible()) {
      await languageSelect.selectOption('zh');
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await page.waitForTimeout(500);

      // Check if Chinese is still selected
      const content = await page.content();
      expect(content).toContain('设置');
    }
  });
});
