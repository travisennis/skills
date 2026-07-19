#!/usr/bin/env node

import { parseArgs } from 'node:util';

async function main() {
    const args = process.argv.slice(2);
    
    const options = {
        help: {
            type: 'boolean',
            short: 'h',
            description: 'Show help message'
        },
        collection: {
            type: 'string',
            short: 'c',
            description: 'Filter by collection ID'
        },
        domain: {
            type: 'string',
            short: 'd',
            description: 'Filter by domain (e.g., github.com)'
        },
        tag: {
            type: 'string',
            short: 't',
            description: 'Filter by tag'
        },
        created: {
            type: 'string',
            description: 'Filter by creation date (YYYY-MM-DD format, optional < or > prefix)'
        },
        json: {
            type: 'boolean',
            short: 'j',
            description: 'Output results as JSON'
        },
        limit: {
            type: 'string',
            short: 'l',
            description: 'Limit number of results (default: 25, max: 100)'
        },
        page: {
            type: 'string',
            short: 'p',
            description: 'Page number (0-based, use with --limit as page size)'
        },
        all: {
            type: 'boolean',
            description: 'Fetch all matching results (auto-paginate)'
        }
    };
    
    try {
        const { values, positionals } = parseArgs({ 
            args, 
            options,
            allowPositionals: true 
        });
        
        // Show help if --help flag or no arguments and no filters
        if (values.help || (positionals.length === 0 && !values.tag && !values.domain && !values.all)) {
            showHelp(options);
            process.exit(0);
        }
        
        // Combine all positional arguments as search query
        const search = positionals.join(' ');
        
        // Validate date format if provided
        if (values.created) {
            if (!isValidDate(values.created)) {
                console.error('Error: Date must be in YYYY-MM-DD format (optional < or > prefix)');
                console.error('Examples: 2024-01-01, >2023-12-01, <2024-06-15');
                process.exit(1);
            }
        }
        
        // Parse limit if provided
        let perPage = 25;
        if (values.limit) {
            const limit = parseInt(values.limit, 10);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                console.error('Error: Limit must be a number between 1 and 100');
                process.exit(1);
            }
            perPage = limit;
        }

        // Parse page if provided
        let page = 0;
        if (values.page) {
            page = parseInt(values.page, 10);
            if (isNaN(page) || page < 0) {
                console.error('Error: Page must be a non-negative number');
                process.exit(1);
            }
        }

        if (values.all && (values.limit || values.page)) {
            console.error('Error: --all cannot be combined with --limit or --page');
            process.exit(1);
        }
        
        const apiKey = process.env.RAINDROP_API_KEY;
        if (!apiKey) {
            console.error("Error: RAINDROP_API_KEY environment variable is not set");
            console.error("Get your API key from: https://app.raindrop.io/settings/integrations");
            process.exit(1);
        }
        
        try {
            const params = {
                search,
                tag: values.tag,
                domain: values.domain,
                collection: values.collection,
                created: values.created,
                apiKey
            };

            const result = values.all
                ? await searchAllPages(params)
                : (await searchRaindrop({ ...params, perPage, page })).items;
            
            // Output results
            if (values.json) {
                console.log(JSON.stringify(result, null, 2));
            } else {
                printResults(result);
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        showHelp(options);
        process.exit(1);
    }
}

function showHelp(options) {
    console.log('Raindrop.io Bookmark Search');
    console.log('============================\n');
    console.log('Search your Raindrop.io bookmarks with advanced filters.\n');
    console.log('Usage:');
    console.log('  ./search.mjs <search-query> [options]');
    console.log('  ./search.mjs [options]           (when using -t or -d filters)\n');
    console.log('Options:');
    console.log('  -h, --help                Show this help message');
    console.log('  -c, --collection <id>     Filter by collection ID');
    console.log('  -d, --domain <domain>     Filter by domain (e.g., github.com)');
    console.log('  -t, --tag <tag>           Filter by tag');
    console.log('  --created <date>          Filter by creation date (YYYY-MM-DD)');
    console.log('                            Use < or > prefix for before/after');
    console.log('  -j, --json                Output results as JSON');
    console.log('  -l, --limit <num>         Limit results (default: 25; the API caps a page at 50)');
    console.log('  -p, --page <num>          Page number (0-based, page size = --limit)');
    console.log('  --all                     Fetch all matching results (auto-paginate)\n');
    console.log('Examples:');
    console.log('  ./search.mjs "machine learning"');
    console.log('  ./search.mjs -t "programming"');
    console.log('  ./search.mjs "tutorial" -d "youtube.com"');
    console.log('  ./search.mjs "python" -c 123456 --created ">2024-01-01"');
    console.log('  ./search.mjs -d "github.com" -t "ai" -l 50');
    console.log('  ./search.mjs "ai" -l 100 -p 1        (results 101-200)');
    console.log('  ./search.mjs --tag "unread" --all -j > unread.json');
}

function isValidDate(dateStr) {
    const dateRegex = /^[<>]?\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
        return false;
    }
    
    const datePart = dateStr.replace(/^[<>]/, '');
    const [year, month, day] = datePart.split('-').map(Number);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    const daysInMonth = new Date(year, month, 0).getDate();
    return day <= daysInMonth;
}

async function searchAllPages(params) {
    // The API silently caps perpage at 50 (despite documenting 100), so the
    // response's `count` field — not page fullness — decides when to stop.
    const MAX_PAGES = 400;
    const results = [];

    for (let page = 0; page < MAX_PAGES; page++) {
        let response;
        for (let attempt = 0; ; attempt++) {
            try {
                response = await searchRaindrop({ ...params, perPage: 100, page });
                break;
            } catch (error) {
                if (error.status === 429 && attempt < 3) {
                    console.error('Rate limited; waiting 30s...');
                    await new Promise(resolve => setTimeout(resolve, 30000));
                    continue;
                }
                throw error;
            }
        }

        results.push(...response.items);

        if (response.items.length === 0 || results.length >= response.count) {
            return results;
        }

        if (page > 0 && page % 10 === 0) {
            console.error(`Fetched ${results.length} of ${response.count}...`);
        }
    }

    console.error('Warning: stopped early; more results may exist');
    return results;
}

async function searchRaindrop({ search, tag, domain, collection, created, apiKey, perPage = 25, page = 0 }) {
    const collectionId = collection || '0';
    
    // Build search query
    let searchFilter = search || '';
    
    if (tag) {
        searchFilter += ` #${tag}`;
    }
    
    if (domain) {
        searchFilter += ` domain:${domain}`;
    }
    
    if (created) {
        searchFilter += ` created:${created}`;
    }
    
    const encodedSearch = encodeURIComponent(searchFilter.trim());
    const searchUrl = `https://api.raindrop.io/rest/v1/raindrops/${collectionId}?search=${encodedSearch}&perpage=${perPage}&page=${page}`;
    
    try {
        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorBody = await response.text();
                if (errorBody) {
                    errorMessage += `\nResponse: ${errorBody}`;
                }
            } catch (e) {
                // Ignore if we can't read error body
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        const data = await response.json();

        if (!data || typeof data !== 'object' || !Array.isArray(data.items)) {
            let errorMessage = 'Invalid API response format.';
            if (data && typeof data === 'object') {
                errorMessage += `\nReceived: ${JSON.stringify(data, null, 2)}`;
            }
            throw new Error(errorMessage);
        }

        return {
            count: data.count ?? data.items.length,
            items: data.items.map((item) => ({
                id: item._id,
                title: item.title,
                link: item.link,
                domain: item.domain,
                excerpt: item.excerpt,
                tags: item.tags || [],
                created: item.created,
                lastUpdate: item.lastUpdate,
                important: item.important || false,
                cover: item.cover
            }))
        };
    } catch (error) {
        if (error.message.startsWith('HTTP error') || error.message.startsWith('Invalid API')) {
            throw error;
        }
        throw new Error(`Error fetching data: ${error.message}`);
    }
}

function printResults(results) {
    if (results.length === 0) {
        console.log('No bookmarks found.');
        return;
    }
    
    console.log(`Found ${results.length} bookmark(s):\n`);
    
    results.forEach((item, index) => {
        const important = item.important ? ' ⭐' : '';
        console.log(`${index + 1}. ${item.title}${important}`);
        console.log(`   ID:  ${item.id}`);
        console.log(`   URL: ${item.link}`);
        if (item.domain) {
            console.log(`   Domain: ${item.domain}`);
        }
        if (item.tags.length > 0) {
            console.log(`   Tags: ${item.tags.join(', ')}`);
        }
        if (item.excerpt) {
            const excerpt = item.excerpt.substring(0, 100) + (item.excerpt.length > 100 ? '...' : '');
            console.log(`   Excerpt: ${excerpt}`);
        }
        console.log();
    });
}

main().catch(error => {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});
