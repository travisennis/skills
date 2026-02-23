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

## Examples

```bash
# Basic fetch
./scripts/web-fetch.js https://example.com

# As markdown with Jina cleaning
./scripts/web-fetch.js https://example.com -o markdown -j

# JSON output with headers
./scripts/web-fetch.js https://example.com -o json -H
```

## Notes

- Jina cleaning is better but requires API key; falls back to local cleaning
- Follows redirects (max 5)
- Respects robots.txt
- Handles: HTML, text, markdown, JSON, XML, images (base64)
