---
name: publishing-research-documents
description: "Publish a Markdown research document (title + body) to Notion: as a research note in the Cake Research data source with Type/Status/Confidence/Tags properties set and verified, or to any other Notion database, data source, or page the user names. Use when the user asks to publish, post, or file a research document, note, or finding to Notion. For cataloging an external source (URL, author, media type) into the personal Sources library, use cataloging-sources."
user-invocable: true
metadata:
  version: "1.0"
---

# Publish Research to Notion

Publish a Markdown document (title + body) to Notion and set its database
properties correctly. The primary target is the **Cake Research** data source.
Any other Notion database, data source, or page is supported as a general
target.

## Related skills

- `cataloging-sources` catalogs an external source the user read or watched
  (YouTube video, article, paper, talk, ...) into the personal Sources library
  (Research Notes) by URL, with author and media type. Use it for
  "I read/watched this" items.
- Use this skill for research documents (title + body) going into the Cake
  Research data source or any target the user names.

All commands below are verified against the `ntn` CLI on 2026-08-16.

## Verified CLI behavior (read before writing)

- `ntn pages create --parent data-source:<id>` creates a page and reads
  Markdown from stdin or `--content`. Parent syntax: `page:<id>`,
  `database:<id>`, or `data-source:<id>`.
- **Title source**: the frontmatter key `title:` sets the page title. If there
  is no `title:` key, the first H1 (`# ...`) becomes the title. The H1 is
  consumed and never appears in the page body.
- **All other frontmatter properties are IGNORED** (verified: `Name:`,
  `Type:`, `Status:`, `Confidence:`, `Tags:`, `Created:`, `Updated:` were all
  dropped). `Name:` does NOT set the title — use `title:`. Compensation:
  set every non-title property via `ntn api v1/pages/<id> -X PATCH`.
- `ntn api v1/pages/<page-id> -X PATCH -d '{...}'` updates page properties.
  Properties PATCH is valid only when the parent is a database or data source
  (for a plain page parent, only the title property can be updated).
- `ntn pages get <page-id>` prints the page as Markdown with its properties
  prepended as frontmatter. Use it to verify title, body, and properties.
- `ntn api v1/data_sources/<id>/query -d '{"page_size":100}'` lists entries in
  a data source. Use it to confirm a publish or scan for duplicates (for an
  exact duplicate check, filter on the title property — see the workflows).

## Cake Research context

Verified on 2026-08-16 via the API.

IDs:

- Research data source (create target): `975ee3c3-5c4f-4abb-bfce-a2ab76d5b229`
- Research database (parent of data source): `e4b33f5f-a8cb-438e-93dd-85727b26e928`
- Cake hub page: `3b630bc6-6cc7-8180-9af4-d98454822ce6`
- Research Home page: `3b630bc6-6cc7-812d-9298-c5172428a7c7`

Schema (property names are case-sensitive):

| Property | Type | Allowed values |
| --- | --- | --- |
| `Name` | title | — |
| `Type` | select | `Archived`, `Inbox`, `Investigations`, `Sources`, `Topics` |
| `Status` | select | `inbox`, `active`, `synthesized`, `superseded`, `archived` |
| `Confidence` | select | `low`, `medium`, `high` |
| `Tags` | rich_text | free text |
| `Created` | date | ISO date |
| `Updated` | date | ISO date |
| `Related plans` | rich_text | free text |
| `Related tasks` | rich_text | free text |

Cake research conventions (from Research Home):

- `Type`: `Topics` / `Sources` / `Investigations` by default. Use `Inbox` only
  for rough, untriaged material.
  - `Sources` — notes from external articles, papers, docs, tools, repos.
  - `Investigations` — project findings from debugging, code reading, checks.
  - `Topics` — synthesized, durable notes about a project area.
- `Status`: `active` for living notes, `synthesized` for finished synthesis,
  `superseded` / `archived` for stale notes. Never silently delete useful
  context.
- `Confidence`: `high` only when grounded in verified primary evidence (e.g.
  reading the actual source). Use `medium` / `low` otherwise. Preserve
  uncertainty and open questions instead of presenting guesses as fact.

Document format (match existing entries, e.g. "Common Tool Definition Design
Across Claude Code, PI, and DS4"):

- `title:` frontmatter (becomes the page title), then a `## Summary` section
  (2-4 sentences), then structured body sections.
- For source-derived notes, include `## Source` / `## References` listing exact
  source paths or URLs.
- Use tables for tabular data. Include an "Open questions" section when there
  is genuine uncertainty.

## Workflow — Cake Research

1. **Gather inputs.** Get or infer the document title, body, and `Type` /
   `Status` / `Confidence` / `Tags`. Apply the conventions above; ask only when
   genuinely ambiguous.
2. **Build the Markdown.** Leading frontmatter with `title:` plus the body.
   Body starts with `## Summary`. Example:

   ```markdown
   ---
   title: My research note
   ---

   ## Summary

   Two to four sentences on what this note is and why it matters.

   ## Body

   Structured content.
   ```

3. **Check for duplicates.** Query the data source with an exact title filter.
   If a page with the same title exists, ask the user before creating a
   duplicate:

   ```bash
   ntn api v1/data_sources/975ee3c3-5c4f-4abb-bfce-a2ab76d5b229/query -d '{
     "filter": {"property": "Name", "title": {"equals": "My research note"}}
   }'
   ```

4. **Create the page.** Feed the Markdown via stdin and capture the page ID and
   URL from the JSON response:

   ```bash
   ntn pages create --parent data-source:975ee3c3-5c4f-4abb-bfce-a2ab76d5b229 --json < note.md
   ```

   Extract `id` and `url` from the response.
5. **Set properties via PATCH.** `ntn pages create` ignored the non-title
   frontmatter, so set at least `Type`, `Status`, `Confidence`, `Tags`,
   `Created`, `Updated` (fill `Related plans` / `Related tasks` when known):

   ```bash
   ntn api v1/pages/<new-page-id> -X PATCH -d '{
     "properties": {
       "Type": {"select": {"name": "Inbox"}},
       "Status": {"select": {"name": "inbox"}},
       "Confidence": {"select": {"name": "medium"}},
       "Tags": {"rich_text": [{"text": {"content": "tag-a, tag-b"}}]},
       "Created": {"date": {"start": "2026-08-16"}},
       "Updated": {"date": {"start": "2026-08-16"}}
     }
   }'
   ```

   Select values must match the schema exactly (`Inbox`, `inbox`, `low`, ...).
   Use today's date for `Created` / `Updated` unless the user specifies
   otherwise.
6. **Verify.** Read the page back and confirm title, body, and properties:

   ```bash
   ntn pages get <new-page-id>
   ```

   The frontmatter in the output shows the properties; the body below it shows
   the content. Also confirm the entry appears in a query:

   ```bash
   ntn api v1/data_sources/975ee3c3-5c4f-4abb-bfce-a2ab76d5b229/query -d '{"page_size":100}'
   ```

7. **Report.** Give the user the page URL from the create response.

## Workflow — general (non-Cake) publish

1. **Gather inputs.** Title, body, and the target: a database, a data source,
   or a plain page. Ask for target properties when the user wants them set.
2. **Determine the parent syntax.** `page:<id>`, `database:<id>`, or
   `data-source:<id>`. Do not assume the Cake schema applies.
3. **Inspect the target schema before creating** when properties are needed:
   - Data source: `ntn api v1/data_sources/<id>` prints the property schema.
   - Database: `ntn api v1/databases/<id>` returns metadata and a `data_sources`
     list, not the property schema. Fetch each candidate data source with
     `ntn api v1/data_sources/<data_source_id>` to read its schema.
   - Plain page: `ntn pages get <page-id>` to see the page.
4. **Check for duplicates.** For a database or data source target, query with an
   exact title filter (use the target's title property name, e.g. `Name`) and
   ask the user before duplicating:

   ```bash
   ntn api v1/data_sources/<id>/query -d '{
     "filter": {"property": "Name", "title": {"equals": "My research note"}}
   }'
   ```

5. **Create the page** with `title:` frontmatter + body:

   ```bash
   ntn pages create --parent <page|database|data-source>:<id> --json < note.md
   ```

6. **Set properties via PATCH** when the parent is a database or data source,
   matching the target's property types (select, rich_text, date, url, ...).
   Skip property PATCH for a plain page parent — only the title is settable
   there, and it was already set at creation.
7. **Verify with `ntn pages get <page-id>`** and report the URL.

## Edge cases and guardrails

- Never overwrite or trash existing pages unless explicitly asked.
- Never duplicate silently. If the title may already exist, query first and ask
  the user.
- Do not present guessed properties as facts. If the target schema is unknown,
  inspect it via the API before creating (step 3 of the general workflow).
- Validate select values against the API-retrieved schema before sending: a
  typo in an option name silently adds a new option to the target schema
  instead of failing.
- If `ntn pages create` returns a validation error, check the parent ID and the
  frontmatter `title:` key spelling before re-running.
