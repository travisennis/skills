---
name: managing-bookmarks
description: Manage bookmarks in Raindrop.io for research workflows. Use when the user asks to find, search, retrieve, organize, or manage saved bookmarks, links, or resources stored in Raindrop.io. Covers searching bookmarks, retrieving specific bookmarks for reading, tag management for organization, and collection browsing. Essential for research workflows involving discovering, reading, distilling, and note-taking from saved web resources.
---

# Raindrop.io Bookmark Management

Manage Raindrop.io bookmarks for research workflows: search, retrieve, organize with tags, and browse collections.

## Setup

Set your API key:
```bash
export RAINDROP_API_KEY="your-token"
```

Get token: https://app.raindrop.io/settings/integrations

## Quick Reference

| Task | Script | Example |
|------|--------|---------|
| Search bookmarks | `./scripts/search.mjs` | `./scripts/search.mjs "machine learning"` |
| Get bookmark by ID | `./scripts/get.mjs` | `./scripts/get.mjs 123456789` |
| List tags | `./scripts/tags.mjs` | `./scripts/tags.mjs` |
| Rename tag | `./scripts/tags.mjs` | `./scripts/tags.mjs --rename "old" "new"` |
| List collections | `./scripts/collections.mjs` | `./scripts/collections.mjs` |
| Update bookmark | `./scripts/update.mjs` | `./scripts/update.mjs 123456789 --tags "ai,ml"` |

## Scripts

### Search Bookmarks

Search across all bookmarks with filters.

```bash
./scripts/search.mjs "<query>" [options]
```

**Options:**
- `-c, --collection <id>`  Filter by collection ID
- `-d, --domain <domain>`  Filter by domain (e.g., "github.com")
- `-t, --tag <tag>`        Filter by tag
- `--created <date>`       Filter by date (YYYY-MM-DD). Use `>2024-01-01` or `<2024-01-01`
- `-j, --json`             Output as JSON
- `-l, --limit <1-100>`    Limit results (default: 25)

**Examples:**

```bash
# Basic search
./scripts/search.mjs "machine learning"

# Tag search
./scripts/search.mjs -t "programming"

# Domain filter
./scripts/search.mjs "tutorial" -d "youtube.com"

# Collection + date filter
./scripts/search.mjs "python" -c 123456 --created ">2024-01-01"

# JSON output for processing
./scripts/search.mjs "ai" -l 50 -j > results.json
```

### Get Bookmark

Retrieve a specific bookmark by ID or find by URL.

```bash
./scripts/get.mjs <id-or-url> [options]
```

**Options:**
- `-j, --json`    Output as JSON
- `--full`        Include full content if available

**Examples:**

```bash
# Get by ID
./scripts/get.mjs 123456789

# Get by URL
./scripts/get.mjs "https://example.com/article"

# JSON output
./scripts/get.mjs 123456789 -j
```

### Manage Tags

List, rename, merge, and delete tags.

```bash
./scripts/tags.mjs [options]
```

**Options:**
- `--rename <old> <new>`   Rename a tag
- `--merge <tag1> <tag2>`  Merge two tags (tag2 into tag1)
- `--delete <tag>`         Delete a tag
- `-j, --json`             Output as JSON

**Examples:**

```bash
# List all tags
./scripts/tags.mjs

# Rename tag
./scripts/tags.mjs --rename "ml" "machine-learning"

# Merge tags
./scripts/tags.mjs --merge "ai" "artificial-intelligence"

# Delete tag
./scripts/tags.mjs --delete "temp"
```

### List Collections

Browse collections and get their IDs.

```bash
./scripts/collections.mjs [options]
```

**Options:**
- `-j, --json`    Output as JSON

**Examples:**

```bash
# List collections
./scripts/collections.mjs

# JSON output
./scripts/collections.mjs -j
```

### Update Bookmark

Update bookmark metadata: tags, title, excerpt.

```bash
./scripts/update.mjs <id> [options]
```

**Options:**
- `--tags <tags>`        Set tags (comma-separated)
- `--add-tags <tags>`    Add tags (comma-separated)
- `--remove-tags <tags>` Remove tags (comma-separated)
- `--title <title>`      Update title
- `--excerpt <text>`     Update excerpt/note
- `-j, --json`           Output as JSON

**Examples:**

```bash
# Add tags
./scripts/update.mjs 123456789 --add-tags "read,important"

# Replace all tags
./scripts/update.mjs 123456789 --tags "ai,ml,research"

# Update title and add tag
./scripts/update.mjs 123456789 --title "Updated Title" --add-tags "distilled"

# Mark as read (using tags)
./scripts/update.mjs 123456789 --add-tags "read"
```

## Research Workflow

For research and note-taking workflows, see [references/workflows.md](references/workflows.md).

Common patterns:

1. **Find unread articles:** `./scripts/search.mjs -t "unread"`
2. **Get article for reading:** `./scripts/get.mjs <id>`
3. **Mark as read after:** `./scripts/update.mjs <id> --add-tags "read" --remove-tags "unread"`
4. **Tag by topic:** `./scripts/update.mjs <id> --add-tags "research,ai"`

## API Reference

For detailed API documentation, see [references/api-reference.md](references/api-reference.md).

## Notes

- Requires `RAINDROP_API_KEY` environment variable
- Collection ID "0" searches all collections
- Tag operations are case-sensitive
- Rate limits: 100 requests per minute for most endpoints