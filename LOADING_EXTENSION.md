# Loading the Reddit Scraper Extension into Chrome

## ✅ Verified Manifest File

The manifest.json is built and ready:
- **Location**: `.output/chrome-mv3/manifest.json`
- **Status**: Valid JSON, properly formatted
- **Size**: 547 bytes

## 🔧 Loading Steps

### Step 1: Open Chrome Extensions Manager
```
chrome://extensions/
```

Or use menu: **Chrome Menu → More Tools → Extensions**

### Step 2: Enable Developer Mode
- Look for **"Developer mode"** toggle in the **top-right corner**
- Click to enable it (switch should turn blue)

### Step 3: Click "Load unpacked"
- A new button **"Load unpacked"** will appear
- Click it

### Step 4: Select the Build Folder
- Navigate to your project directory
- Open the folder: `.output/chrome-mv3/`
- Click **"Select Folder"**

### Step 5: Confirm Installation
You should see:
- ✅ "Reddit Thread Scraper" appears in the extensions list
- ✅ Extension icon appears in the toolbar (top-right corner)
- ✅ No error messages

## 🧪 Testing the Extension

1. **Click the extension icon** in your toolbar
2. You should see the popup with **"Scrape Current Thread"** button
3. Navigate to a Reddit thread, e.g.:
   - `reddit.com/r/AskReddit/...`
   - `reddit.com/r/funny/...`
4. Click the extension again
5. Click **"Scrape Current Thread"**
6. Wait for the scraping to complete
7. Try the export options (CSV, JSON, clipboard)

## 🔍 Troubleshooting

### Manifest Error Still Appears?

Try these steps:

1. **Hard refresh the extensions page**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Find "Reddit Thread Scraper"
   - Click the refresh icon (circular arrow)

3. **Clear and reload**:
   - Remove the extension (click the trash icon)
   - Build fresh: `npm run build`
   - Load unpacked again with the new `.output/chrome-mv3/` folder

4. **Check file permissions**:
   - Ensure the `.output/chrome-mv3/manifest.json` file is readable
   - Run: `ls -l .output/chrome-mv3/manifest.json`

### Extension Won't Scrape?

1. Make sure you're on a **Reddit thread page**, not the homepage
2. Refresh the Reddit page (F5)
3. Try clicking the extension again
4. Check for error messages in the popup

### Extension Icon Not Visible?

1. Check if pinned to toolbar:
   - Click the **puzzle icon** in the top-right
   - Find "Reddit Thread Scraper"
   - Click the **pin icon** next to it

## 📋 Manifest.json Contents

The extension manifest includes:

```json
{
  "manifest_version": 3,
  "name": "Reddit Thread Scraper",
  "description": "Scrape Reddit comment threads with ease",
  "version": "1.0.0",
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["*://reddit.com/*", "*://*.reddit.com/*"],
  "background": { "service_worker": "background.js" },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Reddit Thread Scraper"
  },
  "content_scripts": [{
    "matches": ["*://reddit.com/*", "*://*.reddit.com/*"],
    "js": ["content-scripts/reddit.js"]
  }]
}
```

## ✅ Everything is Ready!

The extension is **fully built and ready to load**. If you're still getting manifest errors:

1. Verify Chrome is **up to date** (should be version 88+)
2. Try a **different Chrome profile** (Settings → Add person)
3. Check if running Chrome in **normal mode** (not Guest/Incognito)

Need help? Check the main [README.md](./README.md) for feature details.
