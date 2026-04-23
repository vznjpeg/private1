# Reddit Thread Scraper Chrome Extension

A modern, privacy-first Chrome extension for scraping and exporting Reddit comment threads. Built with **WXT framework**, **TypeScript**, and **React**.

## Features

✨ **Core Functionality**
- **Content Script**: Runs on Reddit threads to extract comments intelligently
- **Smart Threading**: Preserves nested reply structures with parent-child relationships
- **Data Extraction**: Username, comment text, timestamps, upvotes, edited status, OP badges
- **Manifest V3 Compliant**: Modern Chrome extension standards

🎨 **User Interface**
- **Dark Mode Toggle**: Clean, modern popup UI with dark/light theme support
- **Progress Indicator**: Real-time visual feedback during scraping
- **Collapsible Comments**: Expand/collapse nested replies in the popup viewer
- **Responsive Design**: Works on different popup sizes

📤 **Export Options**
- **CSV Export**: Excel-compatible format with depth indicators
- **JSON Export**: Full nested structure with metadata
- **Copy to Clipboard**: Quick JSON or formatted text copying
- **Automatic Filenames**: Timestamp and subreddit-based naming

🔒 **Privacy & Security**
- All processing happens locally - no data sent to servers
- Only reads publicly visible Reddit content
- No storage of sensitive information
- Open source and auditable

## Project Structure

```
reddit-scraper-extension/
├── entrypoints/                    # WXT entrypoints
│   ├── popup.html                  # Popup UI entry point
│   ├── popup/
│   │   ├── app.tsx                 # Main React component
│   │   ├── popup.css               # Styles with dark mode
│   │   └── components/
│   │       ├── ThreadViewer.tsx    # Comment tree viewer
│   │       ├── ExportOptions.tsx   # Export buttons
│   │       └── DarkModeToggle.tsx  # Theme toggle
│   ├── reddit.content.ts           # Content script for scraping
│   └── background.ts               # Service worker for message routing
├── src/
│   ├── types/
│   │   ├── reddit.ts               # Data models (Comment, Thread)
│   │   └── messages.ts             # Message protocol types
│   └── utils/
│       ├── scraper.ts              # Core scraping logic
│       ├── dom-selectors.ts        # Robust Reddit DOM queries
│       └── export.ts               # CSV/JSON/clipboard export
├── wxt.config.ts                   # WXT configuration
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript config
```

## Installation & Development

### Prerequisites
- Node.js 18+ and npm
- Chrome browser

### Setup

```bash
# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Create distributable zip
npm run zip
```

### Loading in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `/home/user/private1/.output/chrome-mv3` directory (after building)

## Usage

1. Navigate to any Reddit thread (e.g., `reddit.com/r/...`)
2. Click the extension icon in the toolbar
3. Click **Scrape Current Thread**
4. Wait for completion (progress indicator shows status)
5. View the comment tree in the popup
6. Choose export option:
   - **JSON**: Copy to clipboard or download
   - **CSV**: Download for Excel/Sheets
   - **Text**: Copy formatted thread for pasting

## Architecture

### Content Script (`reddit.content.ts`)

- Injects into Reddit pages via manifest patterns
- Receives `SCRAPE_THREAD` messages from the popup
- Calls the scraper utility to extract data
- Returns structured thread data to popup

### Service Worker (`background.ts`)

- Relays messages between popup and content script
- Handles tab ID extraction for message routing
- Provides error feedback to popup

### Scraper (`utils/scraper.ts`)

**Key Concepts:**
- **Robust DOM Selection**: Multiple fallback selectors for Reddit's HTML variations
- **Timeout Protection**: 60-second limit prevents hanging on large threads
- **Depth Tracking**: Calculates nesting level based on DOM hierarchy
- **Parent-Child Linking**: Establishes relationships between comments for tree structure

**Data Extraction:**
- Author names (removing `u/` prefix)
- Comment content (handling deleted/removed states)
- Scores via aria-label parsing
- Timestamps from datetime attributes
- OP badges and edited indicators

### UI Components

**ThreadViewer**: Recursive comment rendering with expand/collapse
**ExportOptions**: Multi-format export with success feedback
**DarkModeToggle**: Theme persistence via localStorage

## DOM Selectors Strategy

Reddit frequently changes HTML structure. The extension uses:

1. **Primary Selectors**: Current Reddit layout (`data-testid` attributes)
2. **Fallback Selectors**: Old Reddit and alternative patterns
3. **Attribute-Based Queries**: More resilient to CSS changes
4. **Text Matching**: Pattern recognition for deleted/removed comments

Example selector chain:
```typescript
querySelector(element, [
  'a[data-testid="comment-author-link"]',  // New Reddit
  '.author',                               // Old Reddit
  'a[href*="/user/"]',                     // Fallback
])
```

## Known Limitations

- **Large Threads**: Very large threads (10k+ comments) may take 30-60 seconds
- **Lazy Loading**: Only visible comments are scraped (Reddit's infinite scroll)
- **Dynamic Content**: Some awards/details may not load without scrolling first
- **Old/Redesign**: Works with both old.reddit.com and new Reddit, but structure changes require selector updates

## Troubleshooting

### "Content script not ready" error
- Make sure you're on a Reddit thread page (not homepage)
- Refresh the page and try again
- Check that the extension is enabled

### Missing comments
- Scroll through the thread to load all comments before scraping
- Reddit uses infinite scroll; initially visible comments are prioritized
- Very deeply nested replies may be collapsed

### Styling issues in popup
- Clear cache: Click extension icon → right-click → Manage
- Reload extension in `chrome://extensions/`

## Contributing

To improve the scraper:

1. Update selectors in `src/utils/dom-selectors.ts` for Reddit changes
2. Add new extraction methods to `src/utils/scraper.ts`
3. Test against various thread types and formats
4. Submit feedback on failing threads

## Technical Details

### Manifest V3 Compliance
- ✅ No eval() or inline scripts
- ✅ Content Security Policy compliant
- ✅ Uses chrome.* APIs instead of deprecated APIs
- ✅ Service worker instead of background page
- ✅ Proper host permissions for reddit.com

### Message Protocol

```typescript
// Popup → Service Worker → Content Script
{ type: 'SCRAPE_THREAD' }

// Content Script → Service Worker → Popup
{ 
  success: true, 
  data: RedditThread 
}
// or
{ 
  success: false, 
  error: "Error message" 
}
```

### Data Models

**RedditThread**
- id, title, author, subreddit
- content, score, timestamp, url
- comments: RedditComment[]
- commentCount, scrapeTimestamp

**RedditComment**
- id, author, content, score
- timestamp, depth, parentId
- isOP, edited, awards
- childrenIds: string[] (for tree navigation)

## Performance Optimizations

- **Progressive Enhancement**: Show comments as they load
- **Depth Limiting**: Option to limit nesting depth for massive threads
- **Timeout Handling**: Gracefully stops and reports progress
- **Memoization**: React components prevent unnecessary re-renders

## Browser Compatibility

- ✅ Chrome 88+ (Manifest V3 support)
- ✅ Edge (Chromium-based)
- ⚠️ Firefox: Would need manifest adaptation
- ❌ Safari: Requires different extension format

## License

MIT License - Feel free to use, modify, and distribute.

---

**Built with precision for Reddit.** Extract, analyze, and preserve Reddit discussions.
