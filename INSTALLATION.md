# Installation Guide

## Quick Start

### Build the Extension

```bash
# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

The built extension will be in `.output/chrome-mv3/`

### Load into Chrome

1. **Open Chrome Extension Manager**
   - Go to `chrome://extensions/` in your browser
   - OR: Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

3. **Load Unpacked**
   - Click "Load unpacked" button
   - Navigate to and select the `.output/chrome-mv3/` folder
   - Click "Select Folder"

4. **Done!**
   - The extension should now appear in your extensions list
   - The icon will show in your Chrome toolbar

## Development Workflow

For active development with hot reload:

```bash
npm run dev
```

This starts the WXT development server with file watching. Changes will automatically rebuild and be visible in Chrome (may need to refresh the extension).

## Load Unpacked Extension in Development

While running `npm run dev`, load `.output/chrome-mv3/` as an unpacked extension. WXT will rebuild as you make changes.

## Verify Installation

1. Click the extension icon in your toolbar
2. You should see the "Reddit Scraper" popup
3. Navigate to any Reddit thread (e.g., reddit.com/r/...)
4. Click the extension and try "Scrape Current Thread"

## Troubleshooting

### Extension doesn't appear after loading
- Make sure you selected the `.output/chrome-mv3/` folder, not the project root
- Try refreshing the extensions page (F5)

### "Content script not ready" error
- Make sure you're on a Reddit thread page, not the homepage
- Refresh the Reddit page
- The extension needs to be loaded while you're on Reddit

### Changes not reflected after saving
- If running `npm run dev`: WXT should rebuild automatically
- If using a pre-built version: Run `npm run build` again and reload the extension

### Need to reload the extension?
- Go to `chrome://extensions/`
- Find "Reddit Thread Scraper"
- Click the refresh icon in the bottom right of the extension card
- Or use Ctrl+Shift+J to open DevTools and type `location.reload()`

## Permissions

The extension requests these permissions:

- **activeTab**: To access the current Reddit page
- **scripting**: To run content scripts on Reddit pages
- **storage**: To save your dark mode preference
- **Host permissions**: `*://reddit.com/*` and `*://*.reddit.com/*`

These are minimal and only allow interaction with Reddit pages.

## Security

All data extraction and processing happens locally in your browser. No information is sent to external servers. You can verify this by checking:

1. **Network Tab** in DevTools - no external requests made during scraping
2. **Source Code** - all utilities are client-side only (see `entrypoints/utils/`)

## Next Steps

1. Try scraping a thread
2. Test the export options (CSV, JSON, clipboard)
3. Toggle dark mode to verify theme persistence
4. Expand/collapse comments in the viewer

For more details, see [README.md](./README.md)
