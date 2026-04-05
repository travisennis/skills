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
        json: {
            type: 'boolean',
            short: 'j',
            description: 'Output results as JSON'
        },
        full: {
            type: 'boolean',
            description: 'Include full content if available'
        }
    };
    
    try {
        const { values, positionals } = parseArgs({ 
            args, 
            options,
            allowPositionals: true 
        });
        
        if (values.help || positionals.length === 0) {
            showHelp(options);
            process.exit(0);
        }
        
        const identifier = positionals[0];
        const apiKey = process.env.RAINDROP_API_KEY;
        
        if (!apiKey) {
            console.error("Error: RAINDROP_API_KEY environment variable is not set");
            console.error("Get your API key from: https://app.raindrop.io/settings/integrations");
            process.exit(1);
        }
        
        let bookmark;
        
        // Determine if identifier is a URL or ID
        if (identifier.startsWith('http://') || identifier.startsWith('https://')) {
            bookmark = await findByUrl(identifier, apiKey);
        } else {
            const id = parseInt(identifier, 10);
            if (isNaN(id)) {
                console.error(`Error: Invalid identifier "${identifier}". Must be a bookmark ID or URL.`);
                process.exit(1);
            }
            bookmark = await getById(id, apiKey);
        }
        
        if (!bookmark) {
            console.error('Bookmark not found.');
            process.exit(1);
        }
        
        if (values.json) {
            console.log(JSON.stringify(bookmark, null, 2));
        } else {
            printBookmark(bookmark, values.full);
        }
        
    } catch (error) {
        if (error.message) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error(`Error: ${error}`);
        }
        process.exit(1);
    }
}

function showHelp(options) {
    console.log('Raindrop.io Bookmark Retrieval');
    console.log('==============================\n');
    console.log('Retrieve a specific bookmark by ID or URL.\n');
    console.log('Usage:');
    console.log('  ./get.mjs <id>');
    console.log('  ./get.mjs <url>\n');
    console.log('Options:');
    console.log('  -h, --help     Show this help message');
    console.log('  -j, --json     Output results as JSON');
    console.log('  --full         Include full content if available\n');
    console.log('Examples:');
    console.log('  ./get.mjs 123456789');
    console.log('  ./get.mjs "https://example.com/article"');
    console.log('  ./get.mjs 123456789 -j');
}

async function getById(id, apiKey) {
    const url = `https://api.raindrop.io/rest/v1/raindrop/${id}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.status === 404) {
        return null;
    }
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return normalizeBookmark(data.item);
}

async function findByUrl(url, apiKey) {
    // Search for the URL in all collections
    const searchUrl = `https://api.raindrop.io/rest/v1/raindrops/0?search=${encodeURIComponent(url)}&perpage=10`;
    
    const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Find exact or close match
    const match = data.items.find(item => 
        item.link === url || 
        item.link.replace(/^https:/, 'http:') === url.replace(/^https:/, 'http:')
    );
    
    return match ? normalizeBookmark(match) : null;
}

function normalizeBookmark(item) {
    return {
        id: item._id,
        title: item.title,
        link: item.link,
        domain: item.domain,
        excerpt: item.excerpt,
        note: item.note || '',
        tags: item.tags || [],
        collectionId: item.collection?.$id || item.collection,
        created: item.created,
        lastUpdate: item.lastUpdate,
        important: item.important || false,
        cover: item.cover,
        media: item.media || [],
        type: item.type
    };
}

function printBookmark(bookmark, showFull) {
    console.log(`${bookmark.title}`);
    console.log('='.repeat(bookmark.title.length));
    console.log();
    console.log(`ID:        ${bookmark.id}`);
    console.log(`URL:       ${bookmark.link}`);
    console.log(`Domain:    ${bookmark.domain}`);
    console.log(`Created:   ${new Date(bookmark.created).toLocaleString()}`);
    console.log(`Updated:   ${new Date(bookmark.lastUpdate).toLocaleString()}`);
    console.log(`Important: ${bookmark.important ? 'Yes' : 'No'}`);
    console.log();
    
    if (bookmark.tags.length > 0) {
        console.log(`Tags: ${bookmark.tags.join(', ')}`);
        console.log();
    }
    
    if (bookmark.excerpt) {
        console.log('Excerpt:');
        console.log(bookmark.excerpt);
        console.log();
    }
    
    if (bookmark.note) {
        console.log('Note:');
        console.log(bookmark.note);
        console.log();
    }
}

main().catch(error => {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});
