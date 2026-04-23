import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SCRAPE_THREAD') {
      handleScrapingRequest(sender.tab?.id, sendResponse);
    }

    return true; // Keep channel open for async response
  });

  // Icon badge - show scraper is ready
  chrome.action.setTitle({ title: 'Reddit Thread Scraper' });

  console.log('[Reddit Scraper] Service worker initialized');
});

/**
 * Handle scraping request from popup
 * Relay to content script on active tab
 */
async function handleScrapingRequest(
  tabId: number | undefined,
  sendResponse: (response: any) => void,
): Promise<void> {
  if (!tabId) {
    sendResponse({
      success: false,
      error: 'No active tab found',
    });
    return;
  }

  try {
    // Send message to content script in active tab
    const response = await chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_THREAD' });
    sendResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to communicate with content script';

    // Check if content script is not ready
    if (message.includes('Could not establish connection')) {
      sendResponse({
        success: false,
        error: 'Content script not ready. Make sure you are on a Reddit thread page.',
      });
    } else {
      sendResponse({
        success: false,
        error: message,
      });
    }
  }
}
