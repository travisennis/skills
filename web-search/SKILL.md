---
name: web-search
description: Perform web searches using Exa API with DuckDuckGo fallback
---

# Web Search

Perform web searches and return relevant results with titles, URLs, and content snippets. Uses Exa API for enhanced search capabilities with automatic fallback to DuckDuckGo when Exa is unavailable.

### Setup

```bash
cd {baseDir}
npm install
```

**Note:** The first run will install the DuckDuckGo scrape library. The Exa API integration is built directly into the skill.

The skill requires Node.js and uses the following dependencies:
- `duck-duck-scrape` for DuckDuckGo search fallback
- `zod` for input validation

**Note:** The skill includes a direct implementation of the Exa API client, so no additional Exa SDK is required.

## Environment Variables

### Exa API Integration (Optional)

For enhanced search capabilities, set your Exa API key:

```bash
export EXA_API_KEY="your-api-key-here"
```

To get your Exa API key:
1. Sign up at https://exa.ai/
2. Get your API key from the developer dashboard
3. Set it in your environment

**Note:** The skill uses a direct Exa API implementation for enhanced search capabilities when the API key is available.

## Usage

```bash
# Basic search
{baseDir}/scripts/web-search.js <query>

# Search with options
{baseDir}/scripts/web-search.js <query> [options]
```

## Options

- `-h, --help`           Show help message
- `-r, --results <num>`   Number of results (1-10, default: 5)
- `-p, --provider <name>` Search provider: exa, duckduckgo, auto (default: auto)
- `-s, --safe <level>`   Safe search level: off, moderate, strict (default: moderate)
- `-j, --json`           Output results as JSON
- `-v, --verbose`        Verbose output with debugging information

## Examples

```bash
# Basic search with default settings
{baseDir}/scripts/web-search.js "machine learning frameworks"

# Search with specific number of results
{baseDir}/scripts/web-search.js "javascript tutorials" --results 3

# Force DuckDuckGo provider
{baseDir}/scripts/web-search.js "python libraries" --provider duckduckgo

# Search with JSON output
{baseDir}/scripts/web-search.js "react hooks" --json

# Search with verbose output
{baseDir}/scripts/web-search.js "typescript best practices" --verbose

# Search with safe search off
{baseDir}/scripts/web-search.js "AI research" --safe off

# Show help
{baseDir}/scripts/web-search.js --help
```

## Search Providers

### Exa (Recommended)
When `EXA_API_KEY` is set and provider is `exa` or `auto`:
- Uses direct Exa API integration
- Returns high-quality, relevant results with full text content
- Better for technical and professional queries
- Requires API key
- Provides advanced search features through the Exa API

### DuckDuckGo (Fallback)
When Exa is unavailable or provider is `duckduckgo`:
- Uses duck-duck-scrape library
- No API key required
- Good for general web searches
- Respects privacy

### Auto (Default)
Automatically selects the best available provider:
1. Uses Exa if API key is available
2. Falls back to DuckDuckGo if Exa fails or no API key
3. Provides seamless experience

## Output Formats

### Human-readable (default)
```
Search Results for "machine learning":

1. Introduction to Machine Learning
   URL: https://example.com/ml-intro
   Machine learning is a field of artificial intelligence that uses statistical techniques...

2. Machine Learning Algorithms Explained
   URL: https://example.com/ml-algorithms
   A comprehensive guide to different machine learning algorithms and their applications...

Found 2 results (420 tokens)
```

### JSON (with `--json` flag)
```json
{
  "query": "machine learning",
  "results": [
    {
      "title": "Introduction to Machine Learning",
      "url": "https://example.com/ml-intro",
      "content": "Machine learning is a field of artificial intelligence that uses statistical techniques...",
      "provider": "exa"
    },
    {
      "title": "Machine Learning Algorithms Explained",
      "url": "https://example.com/ml-algorithms",
      "content": "A comprehensive guide to different machine learning algorithms and their applications...",
      "provider": "exa"
    }
  ],
  "tokenCount": 420,
  "providerUsed": "exa",
  "success": true
}
```

## Result Structure

Each search result contains:
- **title**: Page title
- **url**: Full URL to the page
- **content**: Relevant content snippet
- **provider**: Which provider returned this result

## Query Formulation

For best results, formulate queries as natural language questions or specific topics:
- ✅ "How to implement quicksort in Python"
- ✅ "Best practices for React hooks"
- ✅ "Latest developments in AI research"
- ❌ "react" (too broad)
- ❌ "ai" (too vague)

## Error Handling

The skill handles various error scenarios:
- **Invalid queries**: Validates query format
- **Network errors**: Handles connection failures
- **API errors**: Manages Exa API failures with fallback
- **Rate limiting**: Respects API rate limits
- **No results**: Returns empty result set gracefully

## Integration with acai-ts

This skill is designed to work independently of acai-ts. When used with acai-ts:

1. acai-ts provides the skill location to the agent
2. The agent reads the SKILL.md documentation
3. The agent executes the skill using the documented CLI interface
4. Results are returned as structured data

## Notes

- Maximum query length: 512 characters
- Maximum results: 10 (to avoid overwhelming output)
- Default safe search: moderate
- Respects robots.txt and search engine guidelines
- Includes basic query validation
- Automatic provider fallback for reliability

## Performance Considerations

- Exa searches typically complete in 1-3 seconds
- DuckDuckGo searches complete in 2-5 seconds
- JSON output is slightly faster than formatted output
- Verbose mode adds minimal overhead

## Security

- Validates all queries to prevent injection attacks
- Sanitizes search results
- Uses HTTPS for all API calls
- Respects Content-Security-Policy headers
- No personal data collection or storage