---
name: managing-bookmarks
description: Manage bookmarks in Raindrop.io for research workflows. Use when the user asks to find, search, retrieve, save, organize, or manage saved bookmarks, links, or resources stored in Raindrop.io. Covers searching bookmarks, fetching full article text for reading and distilling, saving new bookmarks, deleting bookmarks, tag management for organization, and collection browsing. Essential for research workflows involving discovering, reading, distilling, and note-taking from saved web resources.
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
| Read article text | `./scripts/get.mjs` | `./scripts/get.mjs 123456789 --full` |
| Save new bookmark | `./scripts/add.mjs` | `./scripts/add.mjs "https://example.com" -t "to-read"` |
| Delete bookmark | `./scripts/delete.mjs` | `./scripts/delete.mjs 123456789` |
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
- `-t, --tag <tag>`        Filter by tag (single; put multiple tags in the query: `"#read #distilled"`)
- `--created <date>`       Filter by date (YYYY-MM-DD). Use `>2024-01-01` or `<2024-01-01`
- `-j, --json`             Output as JSON
- `-l, --limit <num>`      Limit results (default: 25; the API caps a page at 50)
- `-p, --page <num>`       Page number (0-based, page size = `--limit`)
- `--all`                  Fetch all matching results (auto-paginates, retries on rate limit)

**Examples:**

```bash
# Basic search
./scripts/search.mjs "machine learning"

# Tag search
./scripts/search.mjs -t "programming"

# Multiple tags (search syntax, not repeated -t)
./scripts/search.mjs "#read #distilled"

# Domain filter
./scripts/search.mjs "tutorial" -d "youtube.com"

# Collection + date filter
./scripts/search.mjs "python" -c 123456 --created ">2024-01-01"

# Export every match as JSON, no page cap
./scripts/search.mjs -t "to-read" --all -j > to-read.json
```

### Get Bookmark

Retrieve a specific bookmark by ID or find by URL.

```bash
./scripts/get.mjs <id-or-url> [options]
```

**Options:**
- `-j, --json`    Output as JSON
- `--full`        Fetch the article text (tries Raindrop's permanent copy, falls back to the live page, strips HTML to readable text)

**Examples:**

```bash
# Get by ID
./scripts/get.mjs 123456789

# Get by URL
./scripts/get.mjs "https://example.com/article"

# Read the article text (for distilling/summarizing)
./scripts/get.mjs 123456789 --full

# JSON output (with --full, includes a "content" field)
./scripts/get.mjs 123456789 -j
```

### Add Bookmark

Save a new bookmark.

```bash
./scripts/add.mjs <url> [options]
```

**Options:**
- `--title <title>`        Title (omit to let Raindrop parse it from the page)
- `-t, --tags <tags>`      Tags (comma-separated)
- `-c, --collection <id>`  Collection ID (default: Unsorted)
- `--excerpt <text>`       Excerpt (short description)
- `--note <text>`          Note (longer annotation)
- `-j, --json`             Output as JSON

**Examples:**

```bash
# Save with tags for the reading queue
./scripts/add.mjs "https://example.com/article" -t "to-read,ai"

# Save into a specific collection with a custom title
./scripts/add.mjs "https://example.com/article" --title "My Title" -c 123456
```

### Delete Bookmark

Delete a bookmark by ID. Moves it to Trash; deleting again while in Trash removes it permanently.

```bash
./scripts/delete.mjs <id>
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

Update bookmark metadata: tags, title, excerpt, note, important flag, collection.

```bash
./scripts/update.mjs <id> [options]
```

**Options:**
- `--tags <tags>`        Set tags (comma-separated, replaces existing)
- `--add-tags <tags>`    Add tags (comma-separated)
- `--remove-tags <tags>` Remove tags (comma-separated)
- `--title <title>`      Update title
- `--excerpt <text>`     Update excerpt (short description)
- `--note <text>`        Update note (longer annotation, e.g. reading notes)
- `--collection <id>`    Move to a different collection
- `--mark-important`     Mark as important (starred)
- `--unmark-important`   Unmark as important
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

# Save reading notes
./scripts/update.mjs 123456789 --note "Key insight: ..."

# Star it and move to another collection
./scripts/update.mjs 123456789 --mark-important --collection 123456
```

## Research Workflow

For research and note-taking workflows, see [references/workflows.md](references/workflows.md).

The reading queue is marked by an **inbox tag**. Don't assume its name — check `./scripts/tags.mjs` for the taxonomy actually in use (this account uses `to-read`; other setups use `unread`).

Common patterns:

1. **Save a find:** `./scripts/add.mjs "<url>" -t "to-read"`
2. **List the queue:** `./scripts/search.mjs -t "to-read"`
3. **Read the article text:** `./scripts/get.mjs <id> --full`
4. **Save reading notes:** `./scripts/update.mjs <id> --note "Key insight: ..."`
5. **Mark as read after:** `./scripts/update.mjs <id> --add-tags "read" --remove-tags "to-read"`
6. **Tag by topic:** `./scripts/update.mjs <id> --add-tags "research,ai"`

### Triage Workflow

Triage means processing a batch of queued bookmarks so each one **ends outside the queue**. For each bookmark:

1. Fetch the text: `./scripts/get.mjs <id> --full`
2. Write a distillation into its note: `./scripts/update.mjs <id> --note "..."` (check first that the note is empty — don't clobber existing notes)
3. Update its status in a single call — always remove the inbox tag, add status + topic tags:
   ```bash
   ./scripts/update.mjs <id> --remove-tags "to-read" --add-tags "read,distilled,<topic-tags>"
   ```
4. Star standouts with `--mark-important`; flag duds for the user rather than deleting them

**Invariant: a triaged bookmark never keeps its inbox tag.** Removing it is what marks the item processed — skipping this silently leaves the bookmark in the queue and it will be triaged again. This applies even when the bookmark is assessed without being fully read (e.g. skimmed and tagged for later): remove the inbox tag and use a status tag like `reference` or `archive` instead.

## API Reference

For detailed API documentation, see [references/api-reference.md](references/api-reference.md).

## Notes

- Requires `RAINDROP_API_KEY` environment variable
- Collection ID "0" searches all collections; "-1" is Unsorted, "-99" is Trash
- Tag operations are case-sensitive
- Rate limits: 100 requests per minute for most endpoints
- The API caps a search page at 50 results regardless of `perpage`; use `--all` to paginate past it
- Deleting a bookmark moves it to Trash; deleting it again removes it permanently
- parseArgs quirk: option values starting with `-` need `=` syntax, e.g. `--collection=-1`