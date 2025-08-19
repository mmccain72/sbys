import { test, expect } from '@playwright/test';

test.describe('Friend-to-Friend Messaging', () => {
  test('should send and receive messages between friends', async ({ browser }) => {
    // Create two browser contexts for two different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const user1Page = await context1.newPage();
    const user2Page = await context2.newPage();
    
    // User 1: Sign in
    await user1Page.goto('/');
    await user1Page.getByRole('button', { name: /Sign in anonymously/i }).click();
    await user1Page.waitForSelector('text=Welcome', { timeout: 10000 });
    
    // User 2: Sign in
    await user2Page.goto('/');
    await user2Page.getByRole('button', { name: /Sign in anonymously/i }).click();
    await user2Page.waitForSelector('text=Welcome', { timeout: 10000 });
    
    // User 1: Navigate to Social Hub
    await user1Page.locator('nav button:has-text("Social")').click();
    
    // User 2: Navigate to Social Hub
    await user2Page.locator('nav button:has-text("Social")').click();
    
    // Get user IDs or names (if displayed)
    // Note: This might need adjustment based on how user IDs are displayed
    await user1Page.waitForTimeout(1000); // Wait for social hub to load
    await user2Page.waitForTimeout(1000);
    
    // User 1: Send a friend request
    // This assumes there's a way to find and add friends - adjust selectors as needed
    const addFriendButton = user1Page.getByRole('button', { name: /Add Friend/i });
    if (await addFriendButton.isVisible()) {
      await addFriendButton.click();
      
      // Enter friend's username or select from list
      // This needs to be adjusted based on actual UI
      await user1Page.fill('input[placeholder*="username"]', 'User2');
      await user1Page.getByRole('button', { name: /Send Request/i }).click();
    }
    
    // User 2: Accept friend request
    await user2Page.reload(); // Refresh to see new request
    const acceptButton = user2Page.getByRole('button', { name: /Accept/i });
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
    }
    
    // User 1: Send a message
    await user1Page.reload(); // Refresh to see accepted friendship
    await user1Page.getByRole('button', { name: /Messages/i }).click();
    
    // Select the friend to message
    await user1Page.getByText('User2').click();
    
    // Type and send message
    const messageInput = user1Page.locator('input[placeholder*="message"]');
    await messageInput.fill('Hello from User 1!');
    await user1Page.getByRole('button', { name: /Send/i }).click();
    
    // User 2: Check received message
    await user2Page.reload();
    await user2Page.getByRole('button', { name: /Messages/i }).click();
    
    // Verify message is received
    await expect(user2Page.getByText('Hello from User 1!')).toBeVisible();
    
    // User 2: Reply to message
    const replyInput = user2Page.locator('input[placeholder*="message"]');
    await replyInput.fill('Hi User 1, message received!');
    await user2Page.getByRole('button', { name: /Send/i }).click();
    
    // User 1: Verify reply is received
    await user1Page.reload();
    await expect(user1Page.getByText('Hi User 1, message received!')).toBeVisible();
    
    // Cleanup
    await context1.close();
    await context2.close();
  });

  test('should share products with friends', async ({ browser }) => {
    // Create two browser contexts for two different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const user1Page = await context1.newPage();
    const user2Page = await context2.newPage();
    
    // Both users sign in
    await user1Page.goto('/');
    await user1Page.getByRole('button', { name: /Sign in anonymously/i }).click();
    await user1Page.waitForSelector('text=Welcome', { timeout: 10000 });
    
    await user2Page.goto('/');
    await user2Page.getByRole('button', { name: /Sign in anonymously/i }).click();
    await user2Page.waitForSelector('text=Welcome', { timeout: 10000 });
    
    // Assuming they are already friends (or make them friends as in previous test)
    
    // User 1: Navigate to Browse page
    await user1Page.locator('nav button:has-text("Browse")').click();
    await user1Page.waitForSelector('.grid', { timeout: 10000 });
    
    // Find and share a product
    const firstProduct = user1Page.locator('.bg-white').first();
    const productName = await firstProduct.locator('h3').textContent();
    
    // Click share button (adjust selector as needed)
    const shareButton = firstProduct.locator('button:has-text("Share")');
    if (await shareButton.isVisible()) {
      await shareButton.click();
      
      // Select friend to share with
      await user1Page.getByText('User2').click();
      
      // Add optional message
      const messageInput = user1Page.locator('input[placeholder*="message"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Check out this product!');
      }
      
      // Confirm share
      await user1Page.getByRole('button', { name: /Share/i }).click();
    }
    
    // User 2: Check shared product
    await user2Page.locator('nav button:has-text("Social")').click();
    
    // Look for shared products section or notification
    await expect(user2Page.getByText(productName)).toBeVisible();
    await expect(user2Page.getByText('Check out this product!')).toBeVisible();
    
    // Cleanup
    await context1.close();
    await context2.close();
  });

  test('should handle message notifications', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const user1Page = await context1.newPage();
    const user2Page = await context2.newPage();
    
    // Both users sign in
    await user1Page.goto('/');
    await user1Page.getByRole('button', { name: /Sign in anonymously/i }).click();
    await user1Page.waitForSelector('text=Welcome', { timeout: 10000 });
    
    await user2Page.goto('/');
    await user2Page.getByRole('button', { name: /Sign in anonymously/i }).click();
    await user2Page.waitForSelector('text=Welcome', { timeout: 10000 });
    
    // Navigate to Social Hub for both users
    await user1Page.locator('nav button:has-text("Social")').click();
    await user2Page.locator('nav button:has-text("Social")').click();
    
    // User 1: Send a message (assuming they're friends)
    await user1Page.getByRole('button', { name: /Messages/i }).click();
    
    // Check for unread message indicator
    const unreadIndicator = user2Page.locator('.badge, .notification-dot, [data-unread="true"]');
    
    // User 1 sends message
    const messageInput = user1Page.locator('input[placeholder*="message"]');
    if (await messageInput.isVisible()) {
      await messageInput.fill('New message notification test');
      await user1Page.getByRole('button', { name: /Send/i }).click();
    }
    
    // User 2: Check for notification
    await user2Page.waitForTimeout(2000); // Wait for real-time update
    
    // Verify notification appears (could be a badge, dot, or count)
    await expect(unreadIndicator.or(user2Page.getByText(/1 new message/i))).toBeVisible();
    
    // User 2: Open messages to mark as read
    await user2Page.getByRole('button', { name: /Messages/i }).click();
    
    // Verify message is there
    await expect(user2Page.getByText('New message notification test')).toBeVisible();
    
    // Verify notification is cleared after reading
    await expect(unreadIndicator).not.toBeVisible();
    
    // Cleanup
    await context1.close();
    await context2.close();
  });
});