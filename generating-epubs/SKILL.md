---
name: generating-epubs
description: "Convert web articles to EPUB e-books using reader mode extraction. Use when the user wants to: create an EPUB from web URLs, build a reading collection from web articles, save web articles for offline reading, or convert URLs from a file to EPUB format."
---

# Generating EPUBs

Create EPUB e-books from various sources. Currently supports converting web articles to EPUB via reader mode extraction. Designed to grow with additional EPUB generation workflows over time.

## Available Workflows

### Web-to-EPUB (URLs → EPUB)

Convert one or more web articles into a single EPUB with automatic table of contents.

**Script:** `scripts/web-to-epub.py`

#### Agent Workflow

1. **Collect URLs** — Get the list of URLs from the user. They may provide them inline, paste them, or reference a file.
2. **Determine output path** — Ask the user where to save the EPUB if not specified. Default to the current working directory with a descriptive filename (e.g., `reading-list.epub`).
3. **Write a URL file** (if many URLs) — For more than ~3 URLs, write them to a temporary file (one URL per line, `#` comments allowed) and use the `-f` flag.
4. **Run the script** — Execute with `uv run` from the skill directory:
   ```bash
   uv run /path/to/skills/generating-epubs/scripts/web-to-epub.py [urls or -f file] -o output.epub
   ```
5. **Verify output** — Confirm the EPUB was created, report the absolute path and file size to the user.
6. **Clean up** — Remove any temporary URL file created in step 3.

#### Command Reference

```bash
# Single URL
uv run scripts/web-to-epub.py https://example.com/article -o mybook.epub

# Multiple URLs
uv run scripts/web-to-epub.py https://example.com/a1 https://example.com/a2 -o mybook.epub

# From file (one URL per line)
uv run scripts/web-to-epub.py -f urls.txt -o reading.epub
```

| Option | Description | Default |
|--------|-------------|---------|
| `urls` | URLs to convert (positional) | - |
| `-f, --file` | File containing URLs (one per line) | - |
| `-o, --output` | Output EPUB filename | `output.epub` |
| `-c, --concurrency` | Number of concurrent fetches | `3` |
| `-t, --timeout` | Request timeout in seconds | `20` |
| `--title` | EPUB title | `Collected Articles` |
| `--author` | EPUB author | `Web Reader` |
| `--lang` | EPUB language code | `en` |
| `--no-images` | Skip downloading/embedding images | `false` |
| `--insecure` | Skip SSL certificate verification | `false` |

#### Troubleshooting

- **SSL errors** → use `--insecure`
- **No content extracted** → page likely requires JavaScript or has a paywall
- **Timeouts** → increase with `-t 60`

## Adding New Workflows

When adding a new EPUB generation workflow (e.g., from Markdown files, Pocket exports, RSS feeds):

1. Add a new script under `scripts/` following the same `uv run --script` inline-dependency pattern.
2. Document the workflow in this file under "Available Workflows" with its own agent workflow steps.
3. Add any supporting documentation to `references/`.
