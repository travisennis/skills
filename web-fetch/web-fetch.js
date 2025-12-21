#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio';
import { z } from 'zod';

const require = createRequire(import.meta.url);

// Configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_REDIRECTS = 5;
const MAX_URL_LENGTH = 2048;

// Input validation schema
const optionsSchema = z.object({
  help: z.boolean().optional(),
  output: z.enum(['text', 'html', 'markdown', 'json']).default('text'),
  jina: z.boolean().default(false),
  timeout: z.coerce.number().int().positive().default(DEFAULT_TIMEOUT),
  verbose: z.boolean().default(false),
  headers: z.boolean().default(false),
  countTokens: z.boolean().default(false)
});

// Content type definitions
const ContentType = z.enum([
  'text/plain',
  'text/html', 
  'text/markdown',
  'application/json',
  'application/xml',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/webm',
  'application/zip',
  'application/octet-stream',
  'other'
]);

// Simple token counter for the skill
function countTokens(text) {
  // Simple token estimation: approximately 4 characters per token
  // This matches the original tool's approach
  return Math.ceil(text.length / 4);
}

// Enhanced HTML Cleaner class to match original functionality
class HtmlCleaner {
  constructor(html) {
    this.html = html;
  }

  static new(html) {
    return new HtmlCleaner(html);
  }

  clean(options = {}) {
    const { simplify = true, empty = true } = options;
    
    const $ = load(this.html);

    // Remove scripts, styles, and comments
    this.removeUnnecessaryElements($);

    // Simplify HTML structure
    if (simplify) {
      this.simplifyStructure($);
    }

    // Remove empty elements
    if (empty) {
      this.removeEmptyElements($);
    }

    // Get cleaned HTML
    return $.html()
      .trim()
      .replace(/^\s*[\r\n]/gm, "");
  }

  removeUnnecessaryElements($) {
    // Remove all script tags
    $("script").remove();

    // Remove all noscript tags
    $("noscript").remove();

    // Remove all style tags
    $("style").remove();

    // Remove all link tags (external stylesheets)
    $('link[rel="stylesheet"]').remove();

    // Remove all preload link tags
    $('link[rel="preload"]').remove();

    // Remove all link tags
    $("link").remove();

    // Remove all forms
    $("form").remove();

    // Remove comments
    $("*")
      .contents()
      .each((_, element) => {
        if (element.type === "comment") {
          $(element).remove();
        }
      });

    // Remove all inline styles
    $("[style]").removeAttr("style");

    // Remove all class attributes
    $("[class]").removeAttr("class");

    // Remove all id attributes
    $("[id]").removeAttr("id");
  }

  simplifyStructure($) {
    // Merge nested divs
    $("div div").each((_, element) => {
      const $element = $(element);
      const parent = $element.parent();

      if (parent.children().length === 1 && parent.get(0)?.tagName === "div") {
        $element.unwrap();
      }
    });

    // Remove redundant spans
    $("span").each((_, element) => {
      const $element = $(element);
      if (!$element.attr() || Object.keys($element.attr() ?? {}).length === 0) {
        const h = $element.html();
        if (h) {
          $element.replaceWith(h);
        }
      }
    });
  }

  removeEmptyElements($) {
    $(":empty").remove();
  }
}

// Main function
async function main() {
  try {
    const args = process.argv.slice(2);
    
    // Define command line options
    const options = {
      help: {
        type: 'boolean',
        short: 'h',
        description: 'Show help message'
      },
      output: {
        type: 'string',
        short: 'o',
        description: 'Output format: text, html, markdown, json'
      },
      jina: {
        type: 'boolean',
        short: 'j',
        description: 'Use Jina AI for HTML cleaning'
      },
      timeout: {
        type: 'string',
        short: 't',
        description: 'Request timeout in milliseconds'
      },
      verbose: {
        type: 'boolean',
        short: 'v',
        description: 'Verbose output with debugging information'
      },
      headers: {
        type: 'boolean',
        short: 'H',
        description: 'Include HTTP headers in output'
      },
      countTokens: {
        type: 'boolean',
        short: 'c',
        description: 'Count tokens in the fetched content'
      }
    };

    const { values, positionals } = parseArgs({ 
      args, 
      options,
      allowPositionals: true 
    });

    // Show help if requested or no URL provided
    if (values.help || positionals.length === 0) {
      showHelp(options);
      process.exit(0);
    }

    // Validate and parse options
    const parsedOptions = optionsSchema.parse({
      help: values.help,
      output: values.output || 'text',
      jina: values.jina || false,
      timeout: values.timeout || DEFAULT_TIMEOUT,
      verbose: values.verbose || false,
      headers: values.headers || false,
      countTokens: values.countTokens || false
    });

    const url = positionals[0];

    // Validate URL
    if (!isValidUrl(url)) {
      console.error('Error: Invalid URL format');
      console.error('URL must start with http:// or https:// and be less than 2048 characters');
      process.exit(1);
    }

    if (parsedOptions.verbose) {
      console.log(`🌐 Fetching: ${url}`);
      console.log(`📦 Options: ${JSON.stringify(parsedOptions, null, 2)}`);
    }

    // Fetch the URL
    const result = await fetchUrl(url, {
      useJina: parsedOptions.jina,
      timeout: parsedOptions.timeout,
      verbose: parsedOptions.verbose
    });

    // Output the result
    if (parsedOptions.output === 'json') {
      const output = {
        content: result.content,
        contentType: result.contentType,
        sourceUrl: result.sourceUrl,
        tokenCount: result.tokenCount,
        success: result.success,
        provider: result.provider
      };
      if (parsedOptions.countTokens) {
        output.tokenCount = result.tokenCount;
      }
      console.log(JSON.stringify(output, null, 2));
    } else {
      formatOutput(result, parsedOptions);
    }

  } catch (error) {
    handleError(error);
    process.exit(1);
  }
}

// URL validation
function isValidUrl(url) {
  try {
    if (typeof url !== 'string' || url.length === 0) return false;
    if (url.length > MAX_URL_LENGTH) return false;
    
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Main fetch function
async function fetchUrl(url, { useJina = false, timeout = DEFAULT_TIMEOUT, verbose = false } = {}) {
  let redirectCount = 0;
  let currentUrl = url;
  
  while (redirectCount <= MAX_REDIRECTS) {
    try {
      if (verbose) {
        console.log(`🔗 Attempting: ${currentUrl} (redirect ${redirectCount})`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(currentUrl, {
        signal: controller.signal,
        redirect: 'manual'
      });

      clearTimeout(timeoutId);

      // Handle redirects
      if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
        const redirectUrl = new URL(response.headers.get('location'), currentUrl).toString();
        if (verbose) {
          console.log(`🔀 Redirecting to: ${redirectUrl}`);
        }
        currentUrl = redirectUrl;
        redirectCount++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }

      const contentType = getContentType(response);
      
      if (verbose) {
        console.log(`📄 Content-Type: ${contentType}`);
        console.log(`✅ Status: ${response.status}`);
      }

      // Handle different content types
      if (contentType.includes('text/html')) {
        return await handleHtmlResponse(response, { useJina, verbose });
      } else if (contentType.startsWith('image/')) {
        return await handleImageResponse(response, contentType);
      } else {
        return await handleTextResponse(response, contentType);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      if (error.message.includes('getaddrinfo ENOTFOUND')) {
        throw new Error(`DNS lookup failed: ${error.message}`);
      }
      throw error;
    }
  }

  throw new Error(`Too many redirects (max: ${MAX_REDIRECTS})`);
}

// Content type detection
function getContentType(response) {
  const header = response.headers.get('content-type') || 'text/plain';
  return header.split(';')[0].trim();
}

// HTML response handling
async function handleHtmlResponse(response, { useJina = false, verbose = false }) {
  const html = await response.text();
  
  if (verbose) {
    console.log(`📏 HTML size: ${html.length} characters`);
  }

  // Try Jina AI first if requested
  if (useJina) {
    try {
      const jinaResult = await useJinaReader(response.url, html);
      if (jinaResult.success) {
        if (verbose) {
          console.log('✨ Jina AI cleaning successful');
        }
        const content = jinaResult.data;
        const tokenCount = countTokens(content);
        
        return {
          content,
          contentType: 'text/html',
          sourceUrl: response.url,
          tokenCount,
          success: true,
          provider: 'jina'
        };
      }
    } catch (error) {
      if (verbose) {
        console.log(`⚠️  Jina AI failed: ${error.message}, falling back to local cleaning`);
      }
    }
  }

  // Fallback to local cleaning
  if (verbose) {
    console.log('🧹 Using local HTML cleaning');
  }
  
  const cleaner = HtmlCleaner.new(html);
  const cleaned = cleaner.clean();
  const tokenCount = countTokens(cleaned);
  
  return {
    content: cleaned,
    contentType: 'text/html',
    sourceUrl: response.url,
    tokenCount,
    success: true,
    provider: 'local'
  };
}

// Jina AI integration
async function useJinaReader(url, htmlContent) {
  const apiKey = process.env.JINA_READER_API_KEY;
  
  if (!apiKey) {
    throw new Error('JINA_READER_API_KEY not set');
  }

  try {
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    
    const response = await fetch(jinaUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-With-Generated-Alt': 'true',
        'X-With-Links-Summary': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Jina API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.text();
    return { success: true, data };
    
  } catch (error) {
    throw new Error(`Jina AI error: ${error.message}`);
  }
}

// Image response handling
async function handleImageResponse(response, contentType) {
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const base64Url = `data:${contentType};base64,${base64}`;
  const tokenCount = 0; // Images don't count as tokens
  
  return {
    content: base64Url,
    contentType,
    sourceUrl: response.url,
    tokenCount,
    success: true,
    provider: 'direct'
  };
}

// Text response handling
async function handleTextResponse(response, contentType) {
  const text = await response.text();
  const tokenCount = countTokens(text);
  
  return {
    content: text,
    contentType,
    sourceUrl: response.url,
    tokenCount,
    success: true,
    provider: 'direct'
  };
}

// Output formatting
function formatOutput(result, options) {
  if (!result.success) {
    console.error(`❌ Error: ${result.error || 'Unknown error'}`);
    return;
  }

  switch (options.output) {
    case 'html':
      console.log(result.content);
      break;
    case 'markdown':
      // Simple HTML to markdown conversion
      const markdown = result.content
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/\n\n\n+/g, '\n\n');
      console.log(markdown);
      break;
    case 'text':
    default:
      console.log(result.content);
      break;
  }

  if (options.verbose || options.countTokens) {
    console.log(`\n📊 Statistics:`);
    console.log(`  Content Type: ${result.contentType}`);
    console.log(`  Token Count: ${result.tokenCount}`);
    console.log(`  Provider: ${result.provider}`);
    console.log(`  Source: ${result.sourceUrl}`);
  }
}

// Error handling
function handleError(error) {
  console.error(`❌ Error: ${error.message}`);
  
  if (error.stack && process.env.NODE_ENV === 'development') {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  
  console.error('\nTry running with --help for usage information');
}

// Help function
function showHelp(options) {
  console.log('Web Fetch - URL Content Fetcher');
  console.log('===============================\n');
  console.log('Fetch content from URLs with intelligent HTML cleaning.\n');
  console.log('Usage:');
  console.log('  web-fetch.js <url> [options]\n');
  console.log('Options:');
  Object.entries(options).forEach(([key, option]) => {
    const flags = [];
    if (option.short) flags.push(`-${option.short}`);
    if (option.type !== 'boolean') flags.push(`--${key} <value>`);
    else flags.push(`--${key}`);
    
    console.log(`  ${flags.join(', ').padEnd(25)} ${option.description}`);
  });
  console.log('\nExamples:');
  console.log('  web-fetch.js https://example.com');
  console.log('  web-fetch.js https://example.com --output markdown');
  console.log('  web-fetch.js https://example.com --jina');
  console.log('  web-fetch.js https://example.com --timeout 60000 --verbose');
  console.log('  web-fetch.js https://example.com --count-tokens');
  console.log('\nEnvironment:');
  console.log('  JINA_READER_API_KEY  Enable Jina AI HTML cleaning');
  console.log('\nContent Types:');
  console.log('  HTML, Text, Markdown, JSON, XML, Images, PDFs, etc.');
  console.log('\nOutput Formats:');
  console.log('  text (default), html, markdown, json');
  console.log('\nFeatures:');
  console.log('  - Jina AI HTML cleaning with fallback');
  console.log('  - Comprehensive content type handling');
  console.log('  - Image to base64 conversion');
  console.log('  - Token counting');
  console.log('  - Redirect handling (max 5)');
  console.log('  - Timeout support');
}

// Run the main function
main().catch(error => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});