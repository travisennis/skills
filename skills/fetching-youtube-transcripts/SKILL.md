---
name: fetching-youtube-transcripts
description: Fetch transcripts from YouTube videos for summarization and analysis. Use when the user asks to get, extract, or retrieve a YouTube video transcript.
user-invocable: true
metadata:
  version: "1.0"
---

# YouTube Transcript

Fetch video transcripts from YouTube.

## Setup

Run this from this file's directory.

```bash
npm install
```

## Usage

Run this script from this file's directory.

```bash
./scripts/transcript.js <video-id-or-url> [--lang <code>]
```

Accepts:
- Video ID: `EBw7gsDPAYQ`
- YouTube URL: `https://www.youtube.com/watch?v=EBw7gsDPAYQ`
- Short URL: `https://youtu.be/EBw7gsDPAYQ`
- `--lang` / `-l`: caption language code (default `en`). Use the exact code:
  regional variants like `es-419` and `de-DE` are distinct from `es` and `de`.
  Falls back to the first available track when that language is missing, with
  a warning on stderr listing the available codes.

## Why `--lang` matters

YouTube now serves multiple caption tracks per video, including auto-dubs and
translations, and the library returns the **first track** if no language is
requested. That is how an English video can come back in Arabic. The script
requests `en` by default; pass `--lang <code>` for videos spoken in another
language.

For non-English videos, the default may return an English auto-dub or
translation rather than the original-language captions. To get those instead,
pass the exact original-language code (for example `es-419`); an unavailable
code such as `zz` makes the warning list what is available.

## Output

```
[0:00] All right. So, I got this UniFi Theta
[0:15] I took the camera out, painted it
[1:23] And here's the final result
```

## Notes

- Video must have captions enabled
- Works with auto-generated and manual transcripts
