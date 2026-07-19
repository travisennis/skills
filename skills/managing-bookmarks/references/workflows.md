# Raindrop.io Research Workflows

This guide covers common workflows for using Raindrop.io bookmarks in research and note-taking.

## Core Research Workflow

The typical research workflow with Raindrop.io:

```
Discover → Save → Read/Distill → Tag/Organize → Note-taking
```

### 1. Discover Phase

Find articles and resources through various channels (RSS, social media, newsletters, search).

### 2. Save Phase

Save to Raindrop with initial tags:
- Use browser extension or mobile app
- Add initial tags like `unread`, `to-read`, `research`, `topic-name`
- Consider adding source context in notes

### 3. Reading Queue Management

**List unread articles:**
```bash
./scripts/search.mjs --tag "to-read"
```

**List by topic and read status:**
```bash
./scripts/search.mjs "machine learning" --tag "to-read"
```

**List recent additions:**
```bash
./scripts/search.mjs --tag "to-read" --created ">2024-01-01"
```

### 4. Reading Phase

Retrieve a specific bookmark to read:

```bash
./scripts/get.mjs 123456789
```

Fetch the full article text for reading or distilling without leaving the terminal:

```bash
./scripts/get.mjs 123456789 --full
```

Or open in browser using the URL from the output.

### 5. Post-Reading Organization

After reading, update the bookmark:

**Mark as read:**
```bash
./scripts/update.mjs 123456789 --remove-tags "to-read" --add-tags "read"
```

**Add topic tags based on content:**
```bash
./scripts/update.mjs 123456789 --add-tags "ai,neural-networks,deep-learning"
```

**Mark important for future reference:**
```bash
./scripts/update.mjs 123456789 --mark-important --add-tags "reference"
```

**Add reading notes:**
```bash
./scripts/update.mjs 123456789 --note "Key insight: ..."
```

## Triage Workflow

Triage processes a batch of queued bookmarks so each one ends outside the queue. Pick the batch (by date, topic, or count), then for each bookmark:

**1. Fetch the text:**
```bash
./scripts/get.mjs <id> --full
```
If the page is a JS-rendered SPA, `--full` returns nothing — fall back to another fetch method, and say so in the note.

**2. Check for an existing note, then write the distillation:**
```bash
./scripts/get.mjs <id> -j    # confirm "note" is empty before overwriting
./scripts/update.mjs <id> --note "2-4 sentence distillation with the key claims and numbers"
```

**3. Update status — one call, always removing the inbox tag:**
```bash
./scripts/update.mjs <id> --remove-tags "to-read" --add-tags "read,distilled,<topic-tags>"
```

**4. Star standouts; surface duds:**
```bash
./scripts/update.mjs <id> --mark-important
```
Report deletion candidates to the user instead of deleting them.

**Invariant: a triaged bookmark never keeps its inbox tag.** Removing the inbox tag is what marks the item processed; a bookmark that keeps it will show up in the next triage pass as if untouched. This holds even when an item is assessed without a full read — skimmed, deemed reference-only, or unfetchable — in which case remove the inbox tag and apply an honest status tag (`reference`, `archive`) instead of `read`.

After the batch, report per-bookmark verdicts to the user, leading with the starred items.

## Tag Taxonomy Strategies

### Status Tags
Track reading progress. The **inbox tag** marks the reading queue — check `./scripts/tags.mjs` for the name actually in use before searching (this account uses `to-read`):
- `to-read` / `unread` - Inbox tag: not yet processed
- `reading` - Currently reading
- `read` - Finished reading
- `to-distill` - Read, needs summarization
- `distilled` - Already summarized
- `reference` - Important reference material
- `archive` - No longer relevant but keep

### Topic Tags
Organize by subject matter:
- Domain-specific: `machine-learning`, `web-development`, `finance`
- Technology: `python`, `rust`, `react`
- Conceptual: `architecture`, `design-patterns`, `best-practices`

### Source Tags
Track where findings came from:
- `newsletter-hacker-news`
- `rss-lobsters`
- `twitter-x`
- `conference-neurips`

### Action Tags
Indicate next steps:
- `to-implement` - Code or technique to try
- `to-share` - Worth sharing with team
- `to-write-about` - Potential blog post topic
- `follow-up` - Requires further investigation

## Bulk Operations

### Retag Multiple Items

If you need to rename a tag across many bookmarks:

```bash
./scripts/tags.mjs --rename "ml" "machine-learning"
```

### Merge Duplicate Tags

```bash
./scripts/tags.mjs --merge "ai" "artificial-intelligence"
```

### Clean Up Unused Tags

List all tags to identify candidates for deletion:

```bash
./scripts/tags.mjs
```

Delete a tag (removes from all bookmarks):

```bash
./scripts/tags.mjs --delete "temp"
```

## Collection Organization

### View Collections

```bash
./scripts/collections.mjs
```

### Search Within Specific Collection

```bash
./scripts/search.mjs "topic" --collection 123456
```

## Export and Integration

### Export for Processing

Get JSON for further processing (`--all` paginates past the API's 50-per-page cap):

```bash
./scripts/search.mjs "topic" --all -j > topic-bookmarks.json
```

### Extract URLs for Download

```bash
./scripts/search.mjs "reference" --all -j | jq -r '.[].link'
```

### Create Reading Lists

Generate a markdown reading list:

```bash
./scripts/search.mjs --tag "to-read" --all -j | jq -r '.[] | "- [\(.title)](\(.link))"'
```

## Weekly Review Workflow

1. **Review new additions:**
   ```bash
   ./scripts/search.mjs --created ">$(date -v-7d +%Y-%m-%d)"
   ```

2. **Check reading progress:**
   ```bash
   ./scripts/search.mjs --tag "reading"
   ```

3. **Identify items to distill:**
   ```bash
   ./scripts/search.mjs --tag "to-distill"
   ```

4. **Archive completed items:**
   ```bash
   # Multiple tags go in the search query (repeating --tag keeps only the last one)
   ./scripts/search.mjs "#read #distilled" --all -j | \
     jq -r '.[].id' | \
     while read id; do
       ./scripts/update.mjs "$id" --add-tags "archive" --remove-tags "to-read,reading"
     done
   ```

## Tips for Effective Tagging

1. **Be consistent** - Use lowercase, hyphenated tag names
2. **Start broad** - Use general tags first, add specific ones as collection grows
3. **Limit tag count** - 3-5 tags per bookmark is usually sufficient
4. **Review periodically** - Merge similar tags, delete unused ones
5. **Use status tags** - Keep track of reading progress explicitly

## Troubleshooting

### Search Not Finding Results

- Check spelling and try variations
- Use partial words (search is prefix-based)
- Try searching specific fields: `#tag`, `domain:example.com`
- Verify the bookmark is in the searched collection

### Too Many Results

- Add more specific terms
- Use domain filters: `-d github.com`
- Filter by date: `--created ">2024-01-01"`
- Filter by collection: `-c 123456`

### Tag Operations Not Working

- Tags are case-sensitive
- Check for trailing spaces in tag names
- Verify API key has write permissions
