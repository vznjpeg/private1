import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Reddit Thread Scraper',
    description: 'Scrape Reddit comment threads with ease',
    version: '1.0.0',
    permissions: ['activeTab', 'scripting', 'storage'],
    host_permissions: ['*://reddit.com/*', '*://*.reddit.com/*'],
    icons: {
      16: '/icon/16.png',
      48: '/icon/48.png',
      128: '/icon/128.png',
    },
  },
});
