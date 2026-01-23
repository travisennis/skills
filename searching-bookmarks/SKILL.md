---
name: searching-bookmarks
description: Search bookmarks in Raindrop.io. Use when the user asks to find, look up, or search for saved bookmarks, links, or resources stored in Raindrop.io.
---

# Raindrop Bookmark Search

Search Raindrop.io bookmarks using the API.

## Setup

Set your API key:
```bash
export RAINDROP_API_KEY="your-token"
```

Get token: https://app.raindrop.io/settings/integrations

## Usage

Run this script from this file's directory.

```bash
./scripts/raindrop.js "<query>" [options]
```

## Options

- `-c, --created <date>`  Filter by date (YYYY-MM-DD). Use `>2024-01-01` or `<2024-01-01`
- `-j, --json`            Output as JSON
- `-l, --limit <1-100>`   Limit results (default: 25)

## Examples

```bash
# Basic search
./scripts/raindrop.js "machine learning"

# Date filter
./scripts/raindrop.js javascript --created ">2024-01-01"

# JSON output with limit
./scripts/raindrop.js python -l 10 -j

# Tag search
./scripts/raindrop.js "#programming"
```

## Output

**Default** (human-readable):
```
1. Bookmark Title
   URL: https://example.com
   Domain: example.com
   Excerpt: ...
```

**JSON** (`-j` flag):
```json
[
  {"title": "...", "link": "...", "domain": "...", "excerpt": "..."}
]
```

## Notes

- Searches all collections (collection ID "0")
- Requires RAINDROP_API_KEY
