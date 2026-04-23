# GovEase AI - Chrome Extension

Your intelligent liaison for seamless government services.

## Features
- 📷 Upload IC photo → GLM extracts all fields automatically
- 🔒 Document watermarking for security
- 🚀 One-click auto-fill on any government form

## Setup Instructions for Judges

1. Clone this repository
2. Get Z.AI API key from https://open.bigmodel.cn (requires $3/month subscription)
3. Add your API key to `popup/popup.js` (line 2)
4. Load extension in Chrome:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this folder
5. Open `mock-portal/mock-tax-form.html` to test

## Demo Video
[Link to your Loom video]

## Tech Stack
- Chrome Extension Manifest V3
- Z.AI GLM API
- JavaScript (Vanilla)

## Security
- All data stored locally (never uploaded to any server)
- Documents watermarked before sharing
- No passwords stored
