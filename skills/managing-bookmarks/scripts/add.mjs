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
        title: {
            type: 'string',
            description: 'Title (omit to let Raindrop parse it from the page)'
        },
        tags: {
            type: 'string',
            short: 't',
            description: 'Tags (comma-separated)'
        },
        collection: {
            type: 'string',
            short: 'c',
            description: 'Collection ID (default: Unsorted)'
        },
        excerpt: {
            type: 'string',
            description: 'Excerpt (short description)'
        },
        note: {
            type: 'string',
            description: 'Note (longer annotation)'
        },
        json: {
            type: 'boolean',
            short: 'j',
            description: 'Output results as JSON'
        }
    };

    try {
        const { values, positionals } = parseArgs({
            args,
            options,
            allowPositionals: true
        });

        if (values.help || positionals.length === 0) {
            showHelp();
            process.exit(0);
        }

        const link = positionals[0];
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            console.error(`Error: Invalid URL "${link}". Must start with http:// or https://`);
            process.exit(1);
        }

        const apiKey = process.env.RAINDROP_API_KEY;

        if (!apiKey) {
            console.error("Error: RAINDROP_API_KEY environment variable is not set");
            console.error("Get your API key from: https://app.raindrop.io/settings/integrations");
            process.exit(1);
        }

        const bookmark = { link, pleaseParse: {} };

        if (values.title !== undefined) {
            bookmark.title = values.title;
        }

        if (values.tags !== undefined) {
            bookmark.tags = values.tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        if (values.collection !== undefined) {
            const collectionId = parseInt(values.collection, 10);
            if (isNaN(collectionId)) {
                console.error(`Error: Invalid collection ID "${values.collection}"`);
                process.exit(1);
            }
            bookmark.collection = { $id: collectionId };
        }

        if (values.excerpt !== undefined) {
            bookmark.excerpt = values.excerpt;
        }

        if (values.note !== undefined) {
            bookmark.note = values.note;
        }

        const result = await createBookmark(bookmark, apiKey);

        if (values.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log(`Created bookmark ${result._id}:`);
            console.log(`  Title: ${result.title}`);
            console.log(`  URL:   ${result.link}`);
            if (result.tags?.length > 0) console.log(`  Tags:  ${result.tags.join(', ')}`);
            console.log(`  Collection: ${result.collection?.$id ?? result.collectionId}`);
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

function showHelp() {
    console.log('Raindrop.io Bookmark Creation');
    console.log('=============================\n');
    console.log('Save a new bookmark.\n');
    console.log('Usage:');
    console.log('  ./add.mjs <url> [options]\n');
    console.log('Options:');
    console.log('  -h, --help            Show this help message');
    console.log('  --title <title>       Title (omit to let Raindrop parse it from the page)');
    console.log('  -t, --tags <tags>     Tags (comma-separated)');
    console.log('  -c, --collection <id> Collection ID (default: Unsorted)');
    console.log('  --excerpt <text>      Excerpt (short description)');
    console.log('  --note <text>         Note (longer annotation)');
    console.log('  -j, --json            Output results as JSON\n');
    console.log('Examples:');
    console.log('  ./add.mjs "https://example.com/article"');
    console.log('  ./add.mjs "https://example.com/article" -t "unread,ai"');
    console.log('  ./add.mjs "https://example.com/article" --title "My Title" -c 123456');
}

async function createBookmark(bookmark, apiKey) {
    const response = await fetch('https://api.raindrop.io/rest/v1/raindrop', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookmark)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.item;
}

main().catch(error => {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});
