#!/usr/bin/env python3
"""Add an entry to the Notion Research Notes > Sources database.

Usage:
  add_source.py --url <url> [--title T] [--author A] [--type T] [--notes-file F | --notes S] [--dry-run]

Behavior:
  - Resolves the Notion token from $NOTION_API_TOKEN, falling back to `ntn auth token`.
  - For YouTube URLs, fetches title/author from oEmbed when --title/--author are not given.
  - Converts markdown notes (headings, bullets, numbered lists, paragraphs) into page blocks.
  - Creates the entry page and prints its Notion URL.

The Notion API is called directly with curl-compatible HTTP (urllib); do not use `ntn api`,
which hangs in headless contexts.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request

DATABASE_ID = os.environ.get("SOURCES_DATABASE_ID", "3bc30bc6-6cc7-815f-9bcc-d0dbe7147438")
API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"
ALLOWED_TYPES = [
    "YouTube video", "Article", "Paper", "Book", "Talk",
    "Podcast", "Documentation", "Other",
]


def resolve_token():
    env = os.environ.get("NOTION_API_TOKEN")
    if env:
        return env.strip()
    try:
        out = subprocess.run(
            ["ntn", "auth", "token"], capture_output=True, text=True, timeout=15
        )
        token = out.stdout.strip().splitlines()[-1] if out.stdout.strip() else ""
        if token:
            return token
    except (subprocess.SubprocessError, FileNotFoundError):
        pass
    sys.exit("error: no Notion token. Set NOTION_API_TOKEN or run `ntn login`.")


def api(method, path, token, body=None):
    req = urllib.request.Request(
        f"{API_BASE}{path}",
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
        },
        data=json.dumps(body).encode() if body is not None else None,
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:500]
        sys.exit(f"error: HTTP {e.code} on {method} {path}: {detail}")


def youtube_metadata(url):
    oembed = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url, safe='')}&format=json"
    try:
        with urllib.request.urlopen(oembed, timeout=15) as resp:
            d = json.loads(resp.read().decode())
        return d.get("title"), d.get("author_name")
    except Exception:
        return None, None


def is_youtube(url):
    return "youtube.com/watch" in url or "youtu.be/" in url


def md_to_blocks(md):
    """Convert simple markdown into Notion blocks."""
    blocks = []
    for raw in md.splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue
        m = re.match(r"^(#{1,3})\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            text = m.group(2).strip()
            blocks.append({
                "object": "block",
                "type": f"heading_{level}",
                f"heading_{level}": {"rich_text": [{"type": "text", "text": {"content": text}}]},
            })
            continue
        m = re.match(r"^[-*]\s+(.*)$", line)
        if m:
            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": m.group(1)}}]},
            })
            continue
        m = re.match(r"^\d+[.)]\s+(.*)$", line)
        if m:
            blocks.append({
                "object": "block",
                "type": "numbered_list_item",
                "numbered_list_item": {"rich_text": [{"type": "text", "text": {"content": m.group(1)}}]},
            })
            continue
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {"rich_text": [{"type": "text", "text": {"content": line}}]},
        })
    return blocks


def main():
    p = argparse.ArgumentParser(description="Add a source to the Notion Sources database")
    p.add_argument("--url", required=True, help="URL of the source")
    p.add_argument("--title", help="Title (auto-fetched for YouTube if omitted)")
    p.add_argument("--author", help="Author (auto-fetched for YouTube if omitted)")
    p.add_argument("--type", default="Other", choices=ALLOWED_TYPES, help="Media type")
    p.add_argument("--notes-file", help="Path to a markdown file with the summary notes")
    p.add_argument("--notes", help="Inline summary notes (plain text)")
    p.add_argument("--dry-run", action="store_true", help="Print the payload without creating anything")
    args = p.parse_args()

    title, author = args.title, args.author
    if is_youtube(args.url) and (not title or not author):
        t, a = youtube_metadata(args.url)
        title = title or t
        author = author or a
    if not title:
        sys.exit("error: could not determine title. Pass --title.")

    notes = None
    if args.notes_file:
        with open(args.notes_file) as f:
            notes = f.read()
    elif args.notes:
        notes = args.notes
    children = md_to_blocks(notes) if notes else []

    payload = {
        "parent": {"database_id": DATABASE_ID},
        "properties": {
            "Title": {"title": [{"type": "text", "text": {"content": title}}]},
            "URL": {"url": args.url},
            "Type": {"select": {"name": args.type}},
            "Author": {"rich_text": [{"type": "text", "text": {"content": author or ""}}]},
        },
        "children": children,
    }

    if args.dry_run:
        print(json.dumps(payload, indent=2))
        return

    token = resolve_token()
    result = api("POST", "/pages", token, payload)
    print(f"Created: {result.get('url', result.get('id', '?'))}")


if __name__ == "__main__":
    main()
