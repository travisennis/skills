#!/usr/bin/env node

import { parseArgs } from 'node:util';

async function main() {
    const args = process.argv.slice(2);
    
    // Define command line options
    const options = {
        help: {
            type: 'boolean',
            short: 'h',
            description: 'Show help message'
        },
        created: {
            type: 'string',
            short: 'c',
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
            description: 'Limit number of results (default: 25)'
        }
    };
    
    try {
        const { values, positionals } = parseArgs({ 
            args, 
            options,
            allowPositionals: true 
        });
        
        // Show help if --help flag or no arguments
        if (values.help || positionals.length === 0) {
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
        let perPage = 25; // Default Raindrop API limit
        if (values.limit) {
            const limit = parseInt(values.limit, 10);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                console.error('Error: Limit must be a number between 1 and 100');
                process.exit(1);
            }
            perPage = limit;
        }
        
        const apiKey = process.env.RAINDROP_API_KEY;
        if (!apiKey) {
            console.error("Error: RAINDROP_API_KEY environment variable is not set");
            console.error("Get your API key from: https://app.raindrop.io/settings/integrations");
            process.exit(1);
        }
        
        try {
            const result = await searchRaindrop({
                search,
                created: values.created,
                apiKey,
                perPage
            });
            
            // Output results
            if (values.json) {
                // JSON output
                console.log(JSON.stringify(result, null, 2));
            } else {
                // Pretty print results
                if (result.length === 0) {
                    console.log('No bookmarks found.');
                } else {
                    console.log(`Found ${result.length} bookmark(s):\n`);
                    result.forEach((item, index) => {
                        console.log(`${index + 1}. ${item.title}`);
                        console.log(`   URL: ${item.link}`);
                        if (item.domain) {
                            console.log(`   Domain: ${item.domain}`);
                        }
                        if (item.excerpt) {
                            console.log(`   Excerpt: ${item.excerpt.substring(0, 100)}${item.excerpt.length > 100 ? '...' : ''}`);
                        }
                        console.log();
                    });
                }
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    } catch (error) {
        // Handle parseArgs errors (e.g., unknown options)
        console.error(`Error: ${error.message}`);
        showHelp(options);
        process.exit(1);
    }
}

function isValidDate(dateStr) {
    // Match YYYY-MM-DD with optional < or > prefix
    const dateRegex = /^[<>]?\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
        return false;
    }
    
    // Extract just the date part for validation
    const datePart = dateStr.replace(/^[<>]/, '');
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Basic date validation
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Check for valid days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    return day <= daysInMonth;
}

function showHelp(options) {
    console.log('Raindrop.io Bookmark Search');
    console.log('============================\n');
    console.log('Search your Raindrop.io bookmarks.\n');
    console.log('Usage:');
    console.log('  raindrop.js <search-query>');
    console.log('  raindrop.js <search-query> [options]\n');
    console.log('Options:');
    console.log('  -h, --help           Show this help message');
    console.log('  -c, --created <date> Filter by creation date (YYYY-MM-DD format)');
    console.log('                       Use < or > prefix for before/after dates');
    console.log('  -j, --json           Output results as JSON');
    console.log('  -l, --limit <num>    Limit number of results (1-100, default: 25)\n');
    console.log('Examples:');
    console.log('  raindrop.js "machine learning"');
    console.log('  raindrop.js javascript --created 2024-01-01');
    console.log('  raindrop.js python --created ">2023-12-01" --json');
    console.log('  raindrop.js #programming --limit 10');
    console.log('  raindrop.js test -c ">2024-01-01" -l 5 -j\n');
    console.log('Environment:');
    console.log('  Set RAINDROP_API_KEY with your Raindrop.io API token');
    console.log('  Get token from: https://app.raindrop.io/settings/integrations');
}

function isApiResponse(data) {
    if (!data || typeof data !== "object") {
        return false;
    }

    if (!("items" in data)) {
        return false;
    }

    const { items } = data;
    if (!Array.isArray(items)) {
        return false;
    }

    return items.every(
        (item) =>
            item &&
            typeof item === "object" &&
            "title" in item &&
            "link" in item &&
            typeof item.title === "string" &&
            typeof item.link === "string",
    );
}

async function searchRaindrop({ search, created, apiKey, perPage = 25 }) {
    const collectionId = "0";
    let searchFilter = search;
    if (created) {
        searchFilter += ` created:${created}`;
    }
    const encodedSearch = encodeURIComponent(searchFilter);
    const searchUrl = `https://api.raindrop.io/rest/v1/raindrops/${collectionId}?search=${encodedSearch}&perpage=${perPage}`;

    try {
        const response = await fetch(searchUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
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
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!isApiResponse(data)) {
            let errorMessage = "Invalid API response format.";
            if (data && typeof data === 'object') {
                errorMessage += `\nReceived: ${JSON.stringify(data, null, 2)}`;
            }
            throw new Error(errorMessage);
        }

        const parsedData = data.items.map((item) => ({
            title: item.title,
            link: item.link,
            domain: item.domain,
            excerpt: item.excerpt,
        }));

        return parsedData;
    } catch (error) {
        const errorMessage = `Error fetching data: ${error.message}`;
        throw new Error(errorMessage);
    }
}

// Run the main function
main().catch(error => {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});