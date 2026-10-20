---
name: browser-automation
description: Interactive browser automation via a dedicated Chrome instance on port 9222. Use when you need a disposable browser you control, to test frontends, or when interaction with a visible browser is required. For the user's live Chrome session, use using-chrome-cdp instead.
user-invocable: true
metadata:
  version: "1.0"
---

# Browser Tools

Chrome DevTools Protocol for agent-assisted web automation. Launches and connects to a
dedicated Chrome instance on `:9222`. Requires Node.js 22.12 or newer.

Use `using-chrome-cdp` instead when the user already has Chrome open and wants you to
inspect or drive that live session. This skill is for a separate browser you launch with
its own profile.

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

`--profile` copies cookies and logged-in sessions into `~/.cache/browser-tools`. Treat
that directory as sensitive: prefer a dedicated browser profile for automation, and
delete the cache directory when you no longer need it. Set `CHROME_PATH` if Chrome is
not at the default macOS location, and `CHROME_PROFILE_DIR` to override the profile
source.

## Commands

Run this script from this file's directory.

- **Navigate**: `./scripts/browser-nav.js <url>` [+ `--new` for new tab]
- **Evaluate JS**: `./scripts/browser-eval.js '<code>'`
- **Screenshot**: `./scripts/browser-screenshot.js`
- **Pick elements**: `./scripts/browser-pick.js "description"` - interactive picker for user to select DOM elements
- **Cookies**: `./scripts/browser-cookies.js`
- **Extract content**: `./scripts/browser-content.js <url>` - markdown via Readability
- **Hacker News**: `./scripts/browser-hn-scraper.js [--limit N]` - parse front-page submissions

## Use When

- Testing frontend code in a real browser
- Interacting with JS-heavy pages
- User needs to visually see/interact with a page
- Debugging auth/session issues
- Scraping dynamic content
