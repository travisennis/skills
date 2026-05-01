---
name: using-chrome-cdp
description: Interact with local Chrome browser via Chrome DevTools Protocol (CDP). Use when the user wants to inspect, debug, screenshot, navigate, click, or interact with web pages open in their Chrome browser. Works with live Chrome sessions - no separate browser instance needed. Requires Chrome with remote debugging enabled.
---

# Chrome CDP

Lightweight Chrome DevTools Protocol CLI for interacting with your live Chrome browser session. Connects directly via WebSocket - no Puppeteer, works with 100+ tabs, instant connection.

## Prerequisites

1. **Chrome with remote debugging enabled**: Open `chrome://inspect/` and toggle the switch
2. **Node.js 22+** (uses built-in WebSocket)

## Quick Start

```bash
# List open tabs
node scripts/cdp.mjs list

# Screenshot a page (use target prefix from list output)
node scripts/cdp.mjs shot <target>

# Get accessibility tree snapshot
node scripts/cdp.mjs snap <target>
```

## Commands

All commands use `scripts/cdp.mjs`. The `<target>` is a **unique** targetId prefix from `list`.

### List Open Pages

```bash
node scripts/cdp.mjs list
```

Shows unique target prefixes for all open tabs. Copy the prefix shown (e.g., `6BE827FA`).

### Screenshot

```bash
node scripts/cdp.mjs shot <target> [file]
# default: /tmp/screenshot.png
```

Captures the **viewport only**. Scroll first with `eval` if you need content below the fold.

Output includes DPR (device pixel ratio) and coordinate conversion hint.

### Accessibility Tree Snapshot

```bash
node scripts/cdp.mjs snap <target>
```

Returns a compact, semantic accessibility tree. Preferred over `html` for understanding page structure.

### Evaluate JavaScript

```bash
node scripts/cdp.mjs eval <target> "document.title"
```

**Important**: Avoid index-based DOM selection (`querySelectorAll(...)[i]`) across multiple `eval` calls when the DOM can change between them (e.g., after clicking "Ignore" buttons on a feed - indices shift). Collect all data in one `eval` or use stable selectors.

### Get HTML

```bash
node scripts/cdp.mjs html <target> [selector]
# Full page: html <target>
# Specific element: html <target> ".my-class"
```

### Navigate

```bash
node scripts/cdp.mjs nav <target> https://example.com
```

Navigates to URL and waits for load completion.

### Network Performance

```bash
node scripts/cdp.mjs net <target>
```

Shows resource timing entries.

### Click by CSS Selector

```bash
node scripts/cdp.mjs click <target> "button.submit"
```

### Click at Coordinates

```bash
node scripts/cdp.mjs clickxy <target> 100 200
```

Uses **CSS pixels** (not screenshot image pixels). See Coordinate System below.

### Type Text

```bash
node scripts/cdp.mjs type <target> "Hello World"
```

Uses `Input.insertText` at current focus. Works in cross-origin iframes unlike eval-based approaches. Use `click` or `clickxy` first to focus the target element.

### Load All Content

```bash
node scripts/cdp.mjs loadall <target> "button.load-more" [interval_ms]
# default interval: 1500ms
```

Repeatedly clicks a "load more" button until it disappears. Use for infinite scroll pages.

### Raw CDP Commands

```bash
node scripts/cdp.mjs evalraw <target> "DOM.getDocument" '{}'
```

Send arbitrary CDP methods directly.

### Stop Daemons

```bash
node scripts/cdp.mjs stop           # Stop all daemons
node scripts/cdp.mjs stop <target>  # Stop specific daemon
```

## Coordinate System

Screenshots capture the viewport at the device's native resolution:

```
screenshot_image_pixels = CSS_pixels * DPR
```

For CDP Input events (`clickxy`, etc.) you need **CSS pixels**:

```
CSS pixels = screenshot_image_pixels / DPR
```

The `shot` command prints the DPR and example conversion for the current page.

**Typical Retina (DPR=2)**: Divide screenshot coordinates by 2 to get CSS pixels.

## Tips

- **Prefer `snap` over `html`** for page structure - more semantic and compact
- **Use `type` for cross-origin iframes** - unlike `eval`, it works across origins
- **Click first, then type** - Use `click`/`clickxy` to focus, then `type` to enter text
- **Avoid index-based selection** in eval when DOM can change between calls

## Daemon Architecture

Each tab runs a persistent daemon at Unix socket: `/tmp/cdp-<fullTargetId>.sock`

- Chrome's "Allow debugging" modal appears **once per tab** on first access
- Daemons keep the session open for subsequent commands
- Daemons auto-exit after 20 minutes of inactivity
- Socket disappears when tab closes

**Protocol**: NDJSON (newline-delimited JSON)

Request format:
```json
{"id": 1, "cmd": "snap", "args": []}
```

Response format:
```json
{"id": 1, "ok": true, "result": "..."}
{"id": 1, "ok": false, "error": "..."}
```

Commands mirror the CLI: `snap`, `eval`, `shot`, `html`, `nav`, `net`, `click`, `clickxy`, `type`, `loadall`, `evalraw`, `stop`.

## Troubleshooting

**"Could not find DevToolsActivePort file"**
- Ensure Chrome remote debugging is enabled at `chrome://inspect/`
- Chrome must be running before using this tool

**"Daemon failed to start - did you click Allow in Chrome?"**
- Look for Chrome's "Allow debugging" modal and click Allow
- The daemon will then connect automatically

**Ambiguous prefix error**
- Use more characters from the targetId shown in `list` output
- The tool requires enough characters to uniquely identify a tab
