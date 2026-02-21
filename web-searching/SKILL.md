---
name: web-searching
description: Perform web searches using Exa API with DuckDuckGo fallback. Use when the user asks to search the web, find online information, or look up current events.
metadata:
  version: "1.0"
---

# Web Search

Search the web with Exa (preferred, requires API key) or DuckDuckGo.

## Setup

```bash
npm install
```

Optional: Enhanced search with Exa:
```bash
export EXA_API_KEY="your-key"
```
Get key: https://exa.ai/

## Usage

Run this script from this file's directory.

```bash
./scripts/web-search.js "<query>" [options]
```

## Options

- `-r, --results <1-10>`  Number of results (default: 5)
- `-p, --provider <exa|duckduckgo|auto>`  Provider (default: auto)
- `-j, --json`            Output as JSON

## Examples

```bash
# Basic search
./scripts/web-search.js "machine learning frameworks"

# Exa with 3 results
./scripts/web-search.js "python tutorials" -r 3

# DuckDuckGo with JSON
./scripts/web-search.js "react hooks" -p duckduckgo -j
```

## Notes

- Exa: better results, requires API key
- DuckDuckGo: no key needed, privacy-friendly
- Auto mode uses Exa if available, falls back to DuckDuckGo
- Max results: 10
