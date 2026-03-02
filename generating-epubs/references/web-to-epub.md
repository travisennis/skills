# Web-to-EPUB — Technical Reference

Supplementary detail for the `web-to-epub.py` script. See `SKILL.md` for usage and agent workflow.

## Architecture

```
Input URLs → Fetch & Extract (Reader Mode) → Build EPUB
```

### Components

1. **URL Collection** — Accepts URLs from CLI args or a file. Deduplicates while preserving order. Validates URLs start with `http://` or `https://`.
2. **Page Fetching** — Uses `httpx` with configurable timeout, redirect following, custom User-Agent, and optional SSL verification.
3. **Reader Mode Extraction** — Uses `readability-lxml` (Python port of Mozilla Readability, same algorithm as Firefox Reader View) to strip ads/nav/clutter and extract title, author, and clean content.
4. **EPUB Building** — Uses `ebooklib` to produce EPUB 2.0 with automatic TOC, metadata, and basic CSS styling. Articles appear in the EPUB in the same order as the input URLs.

### Key Functions

| Function | Purpose |
|----------|---------|
| `fetch_page()` | HTTP GET → `BeautifulSoup` |
| `extract_article()` | Reader mode extraction → `dict(title, content, author, url)` |
| `fetch_articles()` | Parallel fetching via `ThreadPoolExecutor`, preserves input order |
| `make_chapter_html()` | Builds escaped XHTML for a chapter |
| `create_epub()` | Assembles EPUB with ebooklib |

### Dependencies (inline, managed by uv)

- **httpx** — HTTP client
- **beautifulsoup4** — HTML parsing
- **readability-lxml** — Mozilla Readability algorithm
- **ebooklib** — EPUB generation
- **tqdm** — Progress bar
