---
name: fetching-web-content
description: Fetch and clean web content from URLs. Use when the user asks to fetch, scrape, read, or extract content from a webpage or URL.
user-invocable: true
disable-model-invocation: true
metadata:
  version: "1.0"
---

# Web Fetch

Fetch URL content with HTML cleaning.

## Setup

```bash
npm install
```

Optional: Enhanced HTML cleaning with Jina AI:
```bash
export JINA_READER_API_KEY="your-key"
```
Get key: https://jina.ai/reader/

## Usage

Run this script from this file's directory.

```bash
./scripts/web-fetch.js <url> [options]
```

## Options

- `-o, --output <text|html|markdown|json>`  Format (default: text)
- `-j, --jina`                               Use Jina AI cleaning
- `-t, --timeout <ms>`                       Timeout (default: 30000)
- `-H, --headers`                            Include HTTP headers
- `-c, --count-tokens`                       Count tokens
- `-u, --user-agent <string>`                User-Agent header for the fetch request

## Examples

```bash
# Basic fetch
./scripts/web-fetch.js https://example.com

# As markdown with Jina cleaning
./scripts/web-fetch.js https://example.com -o markdown -j

# JSON output with headers
./scripts/web-fetch.js https://example.com -o json -H

# Custom User-Agent (e.g. when a site blocks the default)
./scripts/web-fetch.js https://example.com -u "Mozilla/5.0 (compatible; MyBot/1.0)"
```

## Notes

- Jina cleaning is better but requires API key; falls back to local cleaning
- `--user-agent` applies to the direct fetch only; Jina cleaning uses its own request
- Follows redirects (max 5)
- Does not evaluate robots.txt; check the target site's policy before automated fetching
- Handles: HTML, text, markdown, JSON, XML, images (base64)
