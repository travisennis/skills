---
name: browser-automation
description: Interactive browser automation via Chrome DevTools Protocol. Use when you need to interact with web pages, test frontends, or when user interaction with a visible browser is required.
metadata:
  version: "1.0"
---

# Browser Tools

Chrome DevTools Protocol for agent-assisted web automation. Connects to Chrome on `:9222`.

## Setup

Run this from this file's directory.
```bash
npm install
```

## Start Chrome

Run this script from this file's directory.

```bash
./scripts/browser-start.js              # Fresh profile
./scripts/browser-start.js --profile    # Copy user's profile (cookies, logins)
```

## Commands

Run this script from this file's directory.

- **Navigate**: `./scripts/browser-nav.js <url>` [+ `--new` for new tab]
- **Evaluate JS**: `./scripts/browser-eval.js '<code>'`
- **Screenshot**: `./scripts/browser-screenshot.js`
- **Pick elements**: `./scripts/browser-pick.js "description"` - interactive picker for user to select DOM elements
- **Cookies**: `./scripts/browser-cookies.js`
- **Extract content**: `./scripts/browser-content.js <url>` - markdown via Readability

## Use When

- Testing frontend code in a real browser
- Interacting with JS-heavy pages
- User needs to visually see/interact with a page
- Debugging auth/session issues
- Scraping dynamic content
