import { test, expect } from '@playwright/test';

test.describe('Debug Favorites', () => {
  test('debug product structure', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Sign in anonymously
    await page.getByRole('button', { name: /Sign in anonymously/i }).click();
    
    // Wait for authentication to complete
    await page.waitForSelector('text=Welcome', { timeout: 10000 });
    
    // Navigate to Browse page
    await page.locator('nav button:has-text("Browse")').click();
    
    // Wait for products to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Debug: Take screenshot
    await page.screenshot({ path: 'debug-browse-page.png' });
    
    // Debug: Count products
    const productCount = await page.locator('.grid > div').count();
    console.log(`Found ${productCount} product cards`);
    
    // Debug: Get the HTML of first product
    if (productCount > 0) {
      const firstProductHTML = await page.locator('.grid > div').first().innerHTML();
      console.log('First product HTML:', firstProductHTML.substring(0, 500));
      
      // Try to find favorite button
      const favoriteButtons = await page.locator('.grid > div').first().locator('button').count();
      console.log(`Found ${favoriteButtons} buttons in first product`);
      
      // Get all button texts
      for (let i = 0; i < favoriteButtons; i++) {
        const buttonText = await page.locator('.grid > div').first().locator('button').nth(i).textContent();
        console.log(`Button ${i} text: "${buttonText}"`);
      }
    }
    
    // Try clicking the first button that looks like a favorite
    const firstProduct = page.locator('.grid > div').first();
    const favoriteButton = firstProduct.locator('button').filter({ hasText: /♡|❤|favorite/i }).first();
    
    if (await favoriteButton.count() > 0) {
      console.log('Found favorite button, clicking it...');
      await favoriteButton.click();
      await page.waitForTimeout(1000);
      console.log('Clicked favorite button');
    } else {
      console.log('No favorite button found');
    }
  });
});