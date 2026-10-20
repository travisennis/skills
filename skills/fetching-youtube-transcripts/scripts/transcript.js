#!/usr/bin/env node

import {
	YoutubeTranscript,
	YoutubeTranscriptNotAvailableLanguageError,
} from "youtube-transcript-plus";

const args = process.argv.slice(2);
let language = "en";
let videoId;

for (let i = 0; i < args.length; i++) {
	if (args[i] === "--lang" || args[i] === "-l") {
		language = args[++i];
	} else if (videoId === undefined) {
		videoId = args[i];
	}
}

if (!videoId || !language) {
	console.error("Usage: transcript.js <video-id-or-url> [--lang <code>]");
	console.error("Example: transcript.js EBw7gsDPAYQ");
	console.error(
		"Example: transcript.js https://www.youtube.com/watch?v=EBw7gsDPAYQ --lang es",
	);
	process.exit(1);
}

// Extract video ID if full URL is provided
let extractedId = videoId;
if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) {
	const match = videoId.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
	if (match) {
		extractedId = match[1];
	}
}

try {
	// Request the preferred language explicitly: without `lang` the library
	// takes the first caption track YouTube returns, which may be an
	// auto-dub or translation rather than the video's spoken language.
	// Fall back to the default track when the preferred language is missing.
	let transcript;
	try {
		transcript = await YoutubeTranscript.fetchTranscript(extractedId, {
			lang: language,
		});
	} catch (error) {
		if (!(error instanceof YoutubeTranscriptNotAvailableLanguageError)) {
			throw error;
		}
		// Tell the user rather than silently returning a different language.
		// The error message lists the available language codes.
		console.error(`Warning: ${error.message}`);
		console.error("Falling back to the first available track.");
		transcript = await YoutubeTranscript.fetchTranscript(extractedId);
	}

	for (const entry of transcript) {
		const timestamp = formatTimestamp(entry.offset / 1000);
		console.log(`[${timestamp}] ${entry.text}`);
	}
} catch (error) {
	console.error("Error fetching transcript:", error.message);
	process.exit(1);
}

function formatTimestamp(seconds) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);

	if (h > 0) {
		return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	}
	return `${m}:${s.toString().padStart(2, "0")}`;
}
