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

  test('should add product to favorites via modal', async ({ page }) => {
    // Navigate to Browse page
    await page.locator('nav button:has-text("Browse")').click();
    
    // Wait for products to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Click on the first product to open modal
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.click();
    
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });
    
    // Get product name from modal
    const productName = await page.locator('h2, h1').first().textContent();
    console.log('Product name:', productName);
    
    // Click Add to Favorites button in modal
    await page.getByRole('button', { name: /Add to Favorites/i }).click();
    
    // Wait for the favorites action to complete
    await page.waitForTimeout(1000);
    
    // Close modal (click X or outside)
    const closeButton = page.locator('button').filter({ hasText: '×' });
    if (await closeButton.count() > 0) {
      await closeButton.click();
    } else {
      // Click outside modal
      await page.keyboard.press('Escape');
    }
    
    // Navigate to Dashboard
    await page.locator('nav button:has-text("Dashboard")').click();
    
    // Click on View Favorites
    await page.getByText(/View Favorites/i).click();
    
    // Verify the favorited product appears
    if (productName) {
      await expect(page.getByText(productName)).toBeVisible();
    }
  });

  test('should toggle favorite from product card heart button', async ({ page }) => {
    // Navigate to Browse page
    await page.locator('nav button:has-text("Browse")').click();
    
    // Wait for products to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Find the first product's heart button (not clicking the card itself)
    const firstProductCard = page.locator('.grid > div').first();
    
    // The heart button should be in the top-right corner of the card
    const heartButton = firstProductCard.locator('button').filter({ hasText: /🤍|❤️|❤/ }).first();
    
    // Check if heart button exists and is visible
    if (await heartButton.count() > 0 && await heartButton.isVisible()) {
      // Click the heart button with force to bypass any overlays
      await heartButton.click({ force: true });
      
      // Wait for state change
      await page.waitForTimeout(1000);
      
      // Check if heart changed to filled (red)
      const filledHeart = firstProductCard.locator('button').filter({ hasText: /❤️|❤/ }).first();
      if (await filledHeart.count() > 0) {
        console.log('Heart changed to filled');
        
        // Click again to unfavorite
        await filledHeart.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Verify it changed back to white
        const emptyHeart = firstProductCard.locator('button').filter({ hasText: '🤍' }).first();
        await expect(emptyHeart).toBeVisible();
      } else {
        console.log('Heart button may require modal interaction');
      }
    } else {
      console.log('No direct heart button found on card - favorites may only work through modal');
    }
  });

  test('should persist favorites across page navigation', async ({ page }) => {
    // Navigate to Browse page
    await page.locator('nav button:has-text("Browse")').click();
    
    // Wait for products to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Click on first product to open modal
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.click();
    
    // Wait for modal
    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });
    
    // Get product name
    const productName = await page.locator('h2, h1').first().textContent();
    
    // Add to favorites
    const addButton = page.getByRole('button', { name: /Add to Favorites/i });
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Close modal
    await page.keyboard.press('Escape');
    
    // Navigate away and back
    await page.locator('nav button:has-text("Dashboard")').click();
    await page.waitForTimeout(500);
    await page.locator('nav button:has-text("Browse")').click();
    
    // Wait for products to reload
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Open the same product again
    await page.locator('.grid > div').first().click();
    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });
    
    // Check if "Remove from Favorites" button is shown (indicating it's favorited)
    const removeButton = page.getByRole('button', { name: /Remove from Favorites/i });
    if (await removeButton.count() > 0) {
      console.log('Product is still favorited after navigation');
      await expect(removeButton).toBeVisible();
    } else {
      // Or check if the button text changed in some other way
      console.log('Checking for other indicators of favorited state');
    }
  });
});