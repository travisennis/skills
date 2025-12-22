#!/usr/bin/env node

import { parseArgs } from "node:util";
import { SafeSearchType, search } from "duck-duck-scrape";
import { z } from "zod";

// Configuration
const DEFAULT_RESULTS = 5;
const MAX_RESULTS = 10;
const MAX_QUERY_LENGTH = 512;

// Input validation schema
const optionsSchema = z.object({
	help: z.boolean().optional(),
	results: z.coerce
		.number()
		.int()
		.min(1)
		.max(MAX_RESULTS)
		.default(DEFAULT_RESULTS),
	provider: z.enum(["exa", "duckduckgo", "auto"]).default("auto"),
	safe: z.enum(["off", "moderate", "strict"]).default("moderate"),
	json: z.boolean().default(false),
	verbose: z.boolean().default(false),
});

// Main function
async function main() {
	try {
		const args = process.argv.slice(2);

		// Define command line options
		const options = {
			help: {
				type: "boolean",
				short: "h",
				description: "Show help message",
			},
			results: {
				type: "string",
				short: "r",
				description: "Number of results (1-10)",
			},
			provider: {
				type: "string",
				short: "p",
				description: "Search provider: exa, duckduckgo, auto",
			},
			safe: {
				type: "string",
				short: "s",
				description: "Safe search level: off, moderate, strict",
			},
			json: {
				type: "boolean",
				short: "j",
				description: "Output results as JSON",
			},
			verbose: {
				type: "boolean",
				short: "v",
				description: "Verbose output with debugging information",
			},
		};

		const { values, positionals } = parseArgs({
			args,
			options,
			allowPositionals: true,
		});

		// Show help if requested or no query provided
		if (values.help || positionals.length === 0) {
			showHelp(options);
			process.exit(0);
		}

		// Validate and parse options
		const parsedOptions = optionsSchema.parse({
			help: values.help,
			results: values.results || DEFAULT_RESULTS,
			provider: values.provider || "auto",
			safe: values.safe || "moderate",
			json: values.json || false,
			verbose: values.verbose || false,
		});

		const query = positionals.join(" ");

		// Validate query
		if (!isValidQuery(query)) {
			console.error("Error: Invalid query");
			console.error("Query must be 1-512 characters and not empty");
			process.exit(1);
		}

		if (parsedOptions.verbose) {
			console.log(`🔍 Searching: "${query}"`);
			console.log(`⚙️  Options: ${JSON.stringify(parsedOptions, null, 2)}`);
		}

		// Perform the search
		const result = await performSearch(query, parsedOptions);

		// Output the result
		if (parsedOptions.json) {
			console.log(JSON.stringify(result, null, 2));
		} else {
			formatOutput(result, parsedOptions);
		}
	} catch (error) {
		handleError(error);
		process.exit(1);
	}
}

// Query validation
function isValidQuery(query) {
	return (
		typeof query === "string" &&
		query.length > 0 &&
		query.length <= MAX_QUERY_LENGTH &&
		query.trim().length > 0
	);
}

// Main search function
async function performSearch(query, options) {
	const provider = selectProvider(options);

	if (options.verbose) {
		console.log(`📡 Using provider: ${provider}`);
	}

	try {
		if (provider === "exa") {
			return await searchWithExa(query, options);
		} else {
			return await searchWithDuckDuckGo(query, options);
		}
	} catch (error) {
		if (options.provider === "auto" && provider === "exa") {
			if (options.verbose) {
				console.log(
					`⚠️  Exa failed, falling back to DuckDuckGo: ${error.message}`,
				);
			}
			return await searchWithDuckDuckGo(query, options);
		}
		throw error;
	}
}

// Provider selection
function selectProvider(options) {
	if (options.provider !== "auto") {
		return options.provider;
	}

	// Auto mode: use Exa if API key available, otherwise DuckDuckGo
	const hasExaKey =
		process.env.EXA_API_KEY && process.env.EXA_API_KEY.trim() !== "";
	return hasExaKey ? "exa" : "duckduckgo";
}

// Exa search implementation
async function searchWithExa(query, options) {
	const apiKey = process.env.EXA_API_KEY;

	if (!apiKey) {
		throw new Error("EXA_API_KEY environment variable is not set");
	}

	try {
		if (options.verbose) {
			console.log("🔎 Using Exa search");
		}

		// Use the Exa implementation directly in this skill
		const exaResponse = await performExaSearch(query, options.results, apiKey);

		if (!exaResponse || !exaResponse.results) {
			throw new Error("Invalid Exa API response");
		}

		// Transform Exa results to our format
		const results = exaResponse.results.map((result, index) => ({
			title: result.title || `Result ${index + 1}`,
			url: result.url,
			content: result.text || result.highlights?.join(" ") || "",
			provider: "exa",
		}));

		// Calculate token count
		const contentText = results.map((r) => r.content).join(" ");
		const tokenCount = estimateTokenCount(contentText);

		return {
			query,
			results,
			tokenCount,
			providerUsed: "exa",
			success: true,
		};
	} catch (error) {
		throw new Error(`Exa search failed: ${error.message}`);
	}
}

// DuckDuckGo search implementation
async function searchWithDuckDuckGo(query, options) {
	if (options.verbose) {
		console.log("🦆 Using DuckDuckGo search");
	}

	try {
		// Map safe search level
		const safeSearchMap = {
			off: SafeSearchType.OFF,
			moderate: SafeSearchType.MODERATE,
			strict: SafeSearchType.STRICT,
		};

		const safeSearch = safeSearchMap[options.safe] || SafeSearchType.MODERATE;

		const searchResults = await search(query, {
			safeSearch,
		});

		// Transform results to our format
		const results = searchResults.results
			.slice(0, options.results)
			.map((result, index) => ({
				title: result.title || `Result ${index + 1}`,
				url: result.url,
				content: result.description || "",
				provider: "duckduckgo",
			}));

		// Calculate token count
		const contentText = results.map((r) => r.content).join(" ");
		const tokenCount = estimateTokenCount(contentText);

		return {
			query,
			results,
			tokenCount,
			providerUsed: "duckduckgo",
			success: true,
		};
	} catch (error) {
		throw new Error(`DuckDuckGo search failed: ${error.message}`);
	}
}

// Token estimation
function estimateTokenCount(text) {
	// Simple token estimation: approximately 4 characters per token
	return Math.ceil(text.length / 4);
}

// Output formatting
function formatOutput(result, options) {
	if (!result.success) {
		console.error(`❌ Error: ${result.error || "Unknown error"}`);
		return;
	}

	if (result.results.length === 0) {
		console.log(`No results found for "${result.query}"`);
		return;
	}

	console.log(`# Search Results for "${result.query}"\n`);

	result.results.forEach((result, index) => {
		console.log(`${index + 1}. ${result.title}`);
		console.log(`   URL: ${result.url}`);
		if (result.content) {
			console.log(`   ${result.content}\n`);
		}
	});

	if (options.verbose) {
		console.log(`📊 Statistics:`);
		console.log(`  Results: ${result.results.length}`);
		console.log(`  Tokens: ${result.tokenCount}`);
		console.log(`  Provider: ${result.providerUsed}`);
	}
}

// Error handling
function handleError(error) {
	console.error(`❌ Error: ${error.message}`);

	if (error.stack && process.env.NODE_ENV === "development") {
		console.error("\nStack trace:");
		console.error(error.stack);
	}

	console.error("\nTry running with --help for usage information");
}

// Help function
function showHelp(options) {
	console.log("Web Search - Search the web using Exa or DuckDuckGo");
	console.log("===================================================\n");
	console.log(
		"Perform web searches and get relevant results with content snippets.\n",
	);
	console.log("Usage:");
	console.log("  web-search.js <query> [options]\n");
	console.log("Options:");
	Object.entries(options).forEach(([key, option]) => {
		const flags = [];
		if (option.short) flags.push(`-${option.short}`);
		if (option.type !== "boolean") flags.push(`--${key} <value>`);
		else flags.push(`--${key}`);

		console.log(`  ${flags.join(", ").padEnd(25)} ${option.description}`);
	});
	console.log("\nExamples:");
	console.log('  web-search.js "machine learning"');
	console.log('  web-search.js "javascript tutorials" --results 3');
	console.log('  web-search.js "python libraries" --provider duckduckgo');
	console.log('  web-search.js "react hooks" --json');
	console.log('  web-search.js "typescript best practices" --verbose');
	console.log("\nEnvironment:");
	console.log("  EXA_API_KEY  Enable Exa search (optional)");
	console.log("\nProviders:");
	console.log("  exa        - Enhanced search with Exa API");
	console.log("  duckduckgo - Privacy-focused search");
	console.log("  auto       - Automatic provider selection (default)");
	console.log("\nSafe Search:");
	console.log("  off      - No filtering");
	console.log("  moderate - Default filtering");
	console.log("  strict   - Strong filtering");
}

// Exa implementation directly in the skill
// This is a copy of the Exa implementation from acai-ts
// Modified to work as a standalone function

// HTTP status codes
const HttpStatusCode = {
	badRequest: 400,
	notFound: 404,
	unauthorized: 401,
	forbidden: 403,
	tooManyRequests: 429,
	requestTimeout: 408,
	internalServerError: 500,
	serviceUnavailable: 503,
};

// Base error class for Exa API errors
class ExaError extends Error {
	constructor(message, statusCode, timestamp, path) {
		super(message);
		this.name = "ExaError";
		this.statusCode = statusCode;
		this.timestamp = timestamp ?? new Date().toISOString();
		this.path = path;
	}
}

// Simplified Exa search function for this skill
async function performExaSearch(query, numResults = 5, apiKey) {
	const baseUrl = "https://api.exa.ai";

	// Build headers
	const headers = {
		"x-api-key": apiKey,
		"Content-Type": "application/json",
		"User-Agent": "web-search-skill",
	};

	// Build request body
	const body = {
		query,
		numResults,
		contents: {
			text: true,
		},
	};

	try {
		const response = await fetch(`${baseUrl}/search`, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			let errorMessage = `HTTP ${response.status}`;
			try {
				const errorData = await response.json();
				const message = errorData && (errorData.error || errorData.message);
				if (typeof message === "string" && message.length > 0) {
					errorMessage = message;
				}
			} catch {
				// ignore body parse errors
			}
			throw new ExaError(errorMessage, response.status);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		throw new Error(`Exa API request failed: ${error.message}`);
	}
}

// Run the main function
main().catch((error) => {
	console.error(`Unexpected error: ${error.message}`);
	process.exit(1);
});
