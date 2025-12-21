---
name: web-fetch
description: Fetch web content with intelligent HTML cleaning and content type handling
---

# Web Fetch

Fetch content from URLs with intelligent handling of different content types. Automatically cleans HTML content using Jina AI service or local cleaning fallback. Supports text, HTML, markdown, JSON, and other content types.

## Setup

```bash
cd {baseDir}
npm install
```

The skill requires Node.js and uses the following dependencies:
- `cheerio` for HTML parsing and cleaning
- `zod` for input validation

## Environment Variables

### Jina AI Integration (Optional)

For enhanced HTML cleaning, set your Jina AI API key:

```bash
export JINA_READER_API_KEY="your-api-key-here"
```

To get your API key:
1. Sign up at https://jina.ai/reader/
2. Get your API key from the developer dashboard
3. Set it in your environment

**Note:** The skill works without this key but will use local HTML cleaning instead.

## Usage

```bash
# Basic URL fetch
{baseDir}/web-fetch.js <url>

# Fetch with options
{baseDir}/web-fetch.js <url> [options]
```

## Options

- `-h, --help`           Show help message
- `-o, --output <type>`  Output format: text, html, markdown, json (default: text)
- `-j, --jina`           Use Jina AI for HTML cleaning (requires JINA_READER_API_KEY)
- `-t, --timeout <ms>`   Request timeout in milliseconds (default: 30000)
- `-v, --verbose`        Verbose output with debugging information
- `-H, --headers`        Include HTTP headers in output
- `-c, --count-tokens`    Count tokens in the fetched content

## Examples

```bash
# Fetch a webpage with default settings
{baseDir}/web-fetch.js https://example.com

# Fetch and output as markdown
{baseDir}/web-fetch.js https://example.com --output markdown

# Use Jina AI for enhanced HTML cleaning
{baseDir}/web-fetch.js https://example.com --jina

# Fetch with custom timeout and verbose output
{baseDir}/web-fetch.js https://example.com --timeout 60000 --verbose

# Fetch and include headers in output
{baseDir}/web-fetch.js https://example.com --headers

# Fetch with token counting
{baseDir}/web-fetch.js https://example.com --count-tokens

# Show help
{baseDir}/web-fetch.js --help
```

## Content Type Handling

The skill automatically detects and handles different content types:

| Content Type | Handling |
|--------------|----------|
| `text/html` | HTML cleaning (Jina or local) |
| `text/plain` | Raw text output |
| `text/markdown` | Markdown formatting |
| `application/json` | JSON parsing and formatting |
| `application/xml` | XML content |
| `image/*` | Base64 encoded image data |
| Other | Raw text output |

## HTML Cleaning

### Jina AI Cleaning (Recommended)
When `JINA_READER_API_KEY` is set and `--jina` flag is used:
- Uses Jina AI's advanced HTML cleaning service
- Removes ads, navigation, and boilerplate content
- Preserves main article content
- Handles complex page structures intelligently

### Local Cleaning (Fallback)
When Jina is not available:
- Uses cheerio for HTML parsing
- Removes scripts, styles, and comments
- Simplifies HTML structure
- Removes empty elements
- Preserves semantic content

## Output Formats

### Text (default)
```
Cleaned content from the URL
Main article text without HTML tags
Preserves semantic structure
```

### HTML
```html
<article>
  <h1>Main Title</h1>
  <p>Cleaned HTML content</p>
</article>
```

### Markdown
```markdown
# Main Title

Cleaned content in markdown format

## Subsection

More content here
```

### JSON
```json
{
  "content": "Cleaned content text",
  "contentType": "text/html",
  "sourceUrl": "https://example.com",
  "tokenCount": 42,
  "success": true
}
```

## Error Handling

The skill handles various error scenarios:

- **Invalid URLs**: Validates URL format before fetching
- **Network errors**: Handles connection timeouts and failures
- **HTTP errors**: Reports status codes and error messages
- **Content type errors**: Falls back to raw text for unknown types
- **Jina API errors**: Falls back to local cleaning automatically

## Features

- **Jina AI Integration**: Enhanced HTML cleaning with automatic fallback to local cleaning
- **Comprehensive Content Types**: Handles HTML, text, markdown, JSON, XML, images, PDFs, and more
- **Image Processing**: Converts images to base64 data URLs
- **Token Counting**: Built-in token counting for content analysis
- **HTML Cleaning**: Sophisticated HTML cleaning with script/style removal and structure simplification
- **Redirect Handling**: Follows redirects automatically (max 5 redirects)
- **Timeout Support**: Configurable request timeouts
- **Error Handling**: Comprehensive error handling and reporting
- **Content Type Detection**: Automatic detection and proper handling of different content types

## Technical Specifications

- Maximum URL length: 2048 characters
- Default timeout: 30 seconds
- Maximum redirects: 5
- Token counting: ~4 characters per token estimation
- Image handling: Base64 encoding for binary images
- HTML cleaning: Script/style removal, structure simplification, empty element removal

## Integration with acai-ts

This skill is designed to work independently of acai-ts. When used with acai-ts:

1. acai-ts provides the skill location to the agent
2. The agent reads the SKILL.md documentation
3. The agent executes the skill using the documented CLI interface
4. Results are returned as structured data

## Notes

- The skill does not fetch binary files (PDFs, videos, etc.)
- Maximum URL length: 2048 characters
- Default timeout: 30 seconds
- Follows redirects automatically (max 5 redirects)
- Respects robots.txt and standard web conventions
- Includes basic rate limiting to avoid abuse

## Performance Considerations

- Jina AI cleaning adds ~1-2 seconds overhead but provides better results
- Local cleaning is faster but less sophisticated
- Large pages may take longer to process
- Memory usage scales with content size

## Security

- Validates all URLs to prevent SSRF attacks
- Sanitizes HTML content to remove malicious scripts
- Uses HTTPS by default
- Respects Content-Security-Policy headers when possible