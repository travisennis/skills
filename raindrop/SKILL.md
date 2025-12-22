---
name: raindrop
description: Search for bookmarks in Raindrop.io
---

# Raindrop

Search for bookmarks in Raindrop.io using the Raindrop API.

## Setup

```bash
cd {baseDir}
```

No dependencies required - uses Node's built-in fetch and util modules.

## Environment Variables

Set your Raindrop.io API key:

```bash
export RAINDROP_API_KEY="your-api-key-here"
```

To get your API key:
1. Go to https://app.raindrop.io/settings/integrations
2. Scroll to "API" section
3. Click "Create new token"
4. Copy the token

## Usage

```bash
{baseDir}/scripts/raindrop.js <search-query>
{baseDir}/scripts/raindrop.js <search-query> [options]
```

## Options

- `-h, --help`           Show help message
- `-c, --created <date>` Filter by creation date (YYYY-MM-DD format). Use `<` or `>` prefix for before/after dates
- `-j, --json`           Output results as JSON
- `-l, --limit <num>`    Limit number of results (1-100, default: 25)

## Examples

```bash
# Simple search
{baseDir}/scripts/raindrop.js "machine learning"

# Search with date filter
{baseDir}/scripts/raindrop.js javascript --created 2024-01-01

# Search with date range and JSON output
{baseDir}/scripts/raindrop.js python --created ">2023-12-01" --json

# Search with tag and limit results
{baseDir}/scripts/raindrop.js #programming --limit 10

# Combined options
{baseDir}/scripts/raindrop.js test -c ">2024-01-01" -l 5 -j

# Show help
{baseDir}/scripts/raindrop.js --help
```

## Output Formats

### Human-readable (default)
```
Found 3 bookmark(s):

1. Example Bookmark Title
   URL: https://example.com
   Domain: example.com
   Excerpt: This is a short excerpt from the bookmark...
```

### JSON (with `--json` flag)
```json
[
  {
    "title": "Example Bookmark Title",
    "link": "https://example.com",
    "domain": "example.com",
    "excerpt": "This is a short excerpt from the bookmark..."
  }
]
```

## Notes

- Searches all bookmarks (collection ID "0")
- Requires RAINDROP_API_KEY environment variable
- Uses Raindrop.io REST API v1
- Default limit is 25 results (Raindrop API default)
- Maximum limit is 100 results (Raindrop API limit)