---
name: browser-automation
description: Interactive browser automation via Chrome DevTools Protocol. Use when you need to interact with web pages, test frontends, or when user interaction with a visible browser is required.
---

# Browser Tools

Chrome DevTools Protocol for agent-assisted web automation. Connects to Chrome on `:9222`.

## Setup

```bash
cd {baseDir}
npm install
```

## Start Chrome

```bash
{baseDir}/scripts/browser-start.js              # Fresh profile
{baseDir}/scripts/browser-start.js --profile    # Copy user's profile (cookies, logins)
```

## Commands

- **Navigate**: `{baseDir}/scripts/browser-nav.js <url>` [+ `--new` for new tab]
- **Evaluate JS**: `{baseDir}/scripts/browser-eval.js '<code>'`
- **Screenshot**: `{baseDir}/scripts/browser-screenshot.js`
- **Pick elements**: `{baseDir}/scripts/browser-pick.js "description"` - interactive picker for user to select DOM elements
- **Cookies**: `{baseDir}/scripts/browser-cookies.js`
- **Extract content**: `{baseDir}/scripts/browser-content.js <url>` - markdown via Readability

## Use When

- Testing frontend code in a real browser
- Interacting with JS-heavy pages
- User needs to visually see/interact with a page
- Debugging auth/session issues
- Scraping dynamic content
