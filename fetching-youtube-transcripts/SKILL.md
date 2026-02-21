---
name: fetching-youtube-transcripts
description: Fetch transcripts from YouTube videos for summarization and analysis. Use when the user asks to get, extract, or retrieve a YouTube video transcript.
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
./scripts/transcript.js <video-id-or-url>
```

Accepts:
- Video ID: `EBw7gsDPAYQ`
- YouTube URL: `https://www.youtube.com/watch?v=EBw7gsDPAYQ`
- Short URL: `https://youtu.be/EBw7gsDPAYQ`

## Output

```
[0:00] All right. So, I got this UniFi Theta
[0:15] I took the camera out, painted it
[1:23] And here's the final result
```

## Notes

- Video must have captions enabled
- Works with auto-generated and manual transcripts
