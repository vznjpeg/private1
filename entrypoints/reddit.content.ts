import { defineContentScript } from 'wxt/sandbox';
import { scrapeRedditThread } from './utils/scraper';
import type { MessageRequest, MessageResponse } from './types/messages';

export default defineContentScript({
  matches: ['*://reddit.com/*', '*://*.reddit.com/*'],
  async main() {
    // Listen for messages from popup/service worker
    chrome.runtime.onMessage.addListener((
      request: MessageRequest,
      _sender,
      sendResponse: (response: MessageResponse) => void,
    ) => {
      if (request.type === 'SCRAPE_THREAD') {
        handleScrapeThread(sendResponse);
      } else if (request.type === 'CANCEL_SCRAPE') {
        handleCancelScrape(sendResponse);
      }

      // Return true to indicate we'll send response asynchronously
      return true;
    });

    console.log('[Reddit Scraper] Content script initialized');
  },
});

/**
 * Handle scrape thread request
 */
async function handleScrapeThread(
  sendResponse: (response: MessageResponse) => void,
): Promise<void> {
  try {
    const thread = await scrapeRedditThread();
    sendResponse({ success: true, data: thread });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    sendResponse({ success: false, error: message });
  }
}

/**
 * Handle cancel scrape request
 */
function handleCancelScrape(
  sendResponse: (response: MessageResponse) => void,
): void {
  sendResponse({ success: true, data: {} as any });
}
