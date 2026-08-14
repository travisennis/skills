---
name: research-sources
description: Add external sources (YouTube videos, articles, papers, talks, podcasts, books) to the user's Notion research Sources database, with a written summary in the entry's page body. Use when the user asks to track, save, log, file, or catalog something they read or watched into their research, or wants a summary/notes of an article or talk persisted to their Notion research library.
---

# Research Sources

Adds entries to the Notion database **Sources**, inside the **Research Notes** page
(workspace top level, separate from the Cake research database).

## Database

- Database ID: `3bc30bc6-6cc7-815f-9bcc-d0dbe7147438`
- Schema: `Title` (title), `URL` (url), `Type` (select), `Author` (rich text), `Date added` (created time, auto)
- Allowed `Type` values: `YouTube video`, `Article`, `Paper`, `Book`, `Talk`, `Podcast`, `Documentation`, `Other`
- Each entry's page body holds the summary/notes from the conversation.

If the database is ever recreated, update the ID above.

## Workflow

1. **Gather the source details**: title, URL, author, and media type. Determine the type
   from the URL/domain (YouTube → `YouTube video`, arxiv → `Paper`, etc.).
   If details are missing and the source is a YouTube URL, the script auto-fetches
   title and channel from oEmbed.
2. **Write the summary notes** as a markdown file or string: what the source covers,
   key points, and takeaways from the user's conversation about it. Use headings
   (`#`/`##`/`###`), bullets (`-`), and short paragraphs. Do not fabricate content
   the user did not discuss.
3. **Add the entry**:

   ```bash
   python3 scripts/add_source.py \
     --url "<url>" \
     --title "<title>" \
     --author "<author>" \
     --type "YouTube video" \
     --notes-file /tmp/notes.md
   ```

   `--notes` accepts inline text instead of `--notes-file`. `--dry-run` prints the
   payload without creating anything.
4. **Verify**: the script prints the created page URL. Report it to the user.

## Auth

The script resolves a token from `$NOTION_API_TOKEN`, falling back to
`ntn auth token` (macOS keychain). If both fail, ask the user to run `ntn login`.

Do **not** use `ntn api` for this workflow: it hangs in headless contexts.
