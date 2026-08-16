---
name: cataloging-sources
description: Catalog an external source the user read or watched (YouTube video, article, paper, talk, podcast, or book) into the personal Notion research Sources library (Research Notes), recording its URL, author, media type, and a written summary in the page body. Use when the user asks to track, log, or catalog a source by its URL, or wants summary notes of an article or talk saved to their personal research library. For publishing a research document (title + body) to the Cake Research data source or another Notion target, use publishing-research-documents.
---

# Research Sources

Adds entries to the Notion database **Sources**, inside the **Research Notes** page
(workspace top level, separate from the Cake research database).

## Related skills

- `publishing-research-documents` publishes research documents (title + body) into
  the Cake Research data source or any other Notion target, with full property
  handling and verification. Use it when the input is a document to publish,
  not a URL to catalog.
- Use this skill when the user names a source they read or watched and wants it
  filed in their personal research library.

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
