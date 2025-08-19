import { test, expect } from '@playwright/test';

test.describe('Favorites Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Sign in anonymously
    await page.getByRole('button', { name: /Sign in anonymously/i }).click();
    
    // Wait for authentication to complete
    await page.waitForSelector('text=Welcome', { timeout: 10000 });
  });

  test('should add product to favorites', async ({ page }) => {
    // Navigate to Browse page - click the nav button, not the dashboard card
    await page.locator('nav button:has-text("Browse")').click();
    
    // Wait for products to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Find the first product card
    const firstProduct = page.locator('.grid > div').first();
    
    // Get the product name for verification (from img alt text)
    const productName = await firstProduct.locator('img').getAttribute('alt');
    
    // Click the favorite button (white heart emoji) - use force to bypass overlay
    await firstProduct.locator('button:has-text("🤍")').click({ force: true });
    
    // Verify the heart icon changes to filled (red heart)
    await expect(firstProduct.locator('button:has-text("❤️")').or(firstProduct.locator('button:has-text("❤")'))).toBeVisible();
    
    // Navigate to Dashboard
    await page.locator('nav button:has-text("Dashboard")').click();
    
    // Click on View Favorites
    await page.getByText(/View Favorites/i).click();
    
    // Verify the favorited product appears
    await expect(page.getByText(productName)).toBeVisible();
  });

  test('should remove product from favorites', async ({ page }) => {
    // Navigate to Browse page
    await page.locator('nav button:has-text("Browse")').click();
    
    // Wait for products to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Find the first product card
    const firstProduct = page.locator('.grid > div').first();
    
    // Add to favorites (click white heart) - use force to bypass overlay
    await firstProduct.locator('button:has-text("🤍")').click({ force: true });
    
    // Wait for heart to be filled
    await expect(firstProduct.locator('button:has-text("❤️")').or(firstProduct.locator('button:has-text("❤")'))).toBeVisible();
    
    // Remove from favorites (click red heart) - use force to bypass overlay
    await firstProduct.locator('button:has-text("❤️"), button:has-text("❤")').first().click({ force: true });
    
    // Verify the heart icon changes back to white
    await expect(firstProduct.locator('button:has-text("🤍")')).toBeVisible();
  });

  test('should persist favorites across sessions', async ({ page, context }) => {
    // Navigate to Browse page
    await page.locator('nav button:has-text("Browse")').click();
    
    // Wait for products to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Add first product to favorites
    const firstProduct = page.locator('.grid > div').first();
    const productName = await firstProduct.locator('img').getAttribute('alt');
    await firstProduct.locator('button:has-text("🤍")').click({ force: true });
    
    // Wait for favorite to be saved
    await expect(firstProduct.locator('button:has-text("❤️")').or(firstProduct.locator('button:has-text("❤")'))).toBeVisible();
    
    // Save storage state
    await context.storageState({ path: 'storageState.json' });
    
    // Create a new page with the same storage state
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    // Navigate to Browse page
    await newPage.locator('nav button:has-text("Browse")').click();
    
    // Verify the product is still favorited
    const newFirstProduct = newPage.locator('.grid > div').first();
    await expect(newFirstProduct.locator('button:has-text("❤️")').or(newFirstProduct.locator('button:has-text("❤")'))).toBeVisible();
  });
});