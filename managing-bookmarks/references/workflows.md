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
./scripts/search.mjs --tag "unread"
```

**List by topic and read status:**
```bash
./scripts/search.mjs "machine learning" --tag "unread"
```

**List recent additions:**
```bash
./scripts/search.mjs --tag "unread" --created ">2024-01-01"
```

### 4. Reading Phase

Retrieve a specific bookmark to read:

```bash
./scripts/get.mjs 123456789
```

Or open in browser using the URL from the output.

### 5. Post-Reading Organization

After reading, update the bookmark:

**Mark as read:**
```bash
./scripts/update.mjs 123456789 --remove-tags "unread" --add-tags "read"
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
./scripts/update.mjs 123456789 --excerpt "Key insight: ..."
```

## Tag Taxonomy Strategies

### Status Tags
Track reading progress:
- `unread` - Not yet read
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

Get JSON for further processing:

```bash
./scripts/search.mjs "topic" -j > topic-bookmarks.json
```

### Extract URLs for Download

```bash
./scripts/search.mjs "reference" -j | jq -r '.[].link'
```

### Create Reading Lists

Generate a markdown reading list:

```bash
./scripts/search.mjs --tag "unread" -j | jq -r '.[] | "- [\(.title)](\(.link))"'
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
   ./scripts/search.mjs --tag "read" --tag "distilled" -j | \
     jq -r '.[].id' | \
     while read id; do
       ./scripts/update.mjs "$id" --add-tags "archive" --remove-tags "unread,reading"
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
