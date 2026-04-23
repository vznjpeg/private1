import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    manifest_version: 3,
    name: 'Reddit Thread Scraper',
    description: 'Scrape Reddit comment threads with ease',
    version: '1.0.0',
    permissions: ['activeTab', 'scripting', 'storage'],
    host_permissions: ['*://reddit.com/*', '*://*.reddit.com/*'],
  },
});
