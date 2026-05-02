---
name: fetching-x-content
description: Retrieve individual X/Twitter post and article content through a browser session instead of the paid X API. Use when asked to fetch, read, scrape, extract, summarize, archive, or cite content from x.com or twitter.com post/status URLs or X article URLs.
---

# X Content Fetching

## Overview

Fetch individual X/Twitter posts and articles through a standalone Chrome profile. Use this for browser-rendered content that is unavailable or unreliable through direct HTTP fetching.

## Setup

Run from this skill directory:

```bash
npm install
```

If Chrome is not in the default macOS location, set:

```bash
export CHROME_PATH="/path/to/chrome"
```

## Login

Use a dedicated browser profile stored at `~/.cache/fetching-x-content`:

```bash
./scripts/x-fetch.js --login --headed
```

Sign in to X in the opened browser, then return to the terminal and press Enter. Future fetches reuse that profile.

## Usage

```bash
./scripts/x-fetch.js <x-or-twitter-url> [options]
```

Options:

- `-o, --output <json|markdown>`: Output format (default: `json`)
- `--headed`: Show Chrome while fetching
- `--login`: Open the persistent profile for manual login
- `--timeout <ms>`: Page/extraction timeout (default: `45000`)
- `--profile-dir <path>`: Override the profile directory

Examples:

```bash
./scripts/x-fetch.js https://x.com/user/status/1234567890
./scripts/x-fetch.js https://twitter.com/user/status/1234567890 --output markdown
./scripts/x-fetch.js https://x.com/i/article/1234567890 --headed
```

## Output

JSON output includes:

- `type`, `url`, `finalUrl`, `fetchedAt`
- `author`, `publishedAt`, `title`
- `text`, `markdown`
- `media`, `links`, `metrics`, `quotedPost`
- `warnings`

Markdown output includes readable metadata and content for summarization, citation, or archiving.

## Limits

- Supports individual post/status URLs and X article URLs.
- Does not scrape profiles, timelines, search results, replies, or full conversations.
- Does not use the X API, extract auth tokens, bypass access controls, or copy the user's normal Chrome profile.
- Private, deleted, rate-limited, age-gated, or otherwise unavailable content may fail even when logged in.

## Troubleshooting

- If output says login is required, run `./scripts/x-fetch.js --login --headed`.
- If extraction is empty, retry with `--headed` to inspect interstitials, consent screens, or rate-limit messages.
- If Chrome cannot be found, set `CHROME_PATH`.
- If the profile becomes stale, rerun login or pass a fresh `--profile-dir`.
