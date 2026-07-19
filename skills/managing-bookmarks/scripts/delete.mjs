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

        const id = parseInt(positionals[0], 10);
        if (isNaN(id)) {
            console.error(`Error: Invalid bookmark ID "${positionals[0]}"`);
            process.exit(1);
        }

        const apiKey = process.env.RAINDROP_API_KEY;

        if (!apiKey) {
            console.error("Error: RAINDROP_API_KEY environment variable is not set");
            console.error("Get your API key from: https://app.raindrop.io/settings/integrations");
            process.exit(1);
        }

        const result = await deleteBookmark(id, apiKey);

        if (values.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log(`Deleted bookmark ${id} (moved to Trash; permanently removed if it was already there).`);
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
    console.log('Raindrop.io Bookmark Deletion');
    console.log('=============================\n');
    console.log('Delete a bookmark by ID. Moves it to Trash; deleting a bookmark');
    console.log('already in Trash removes it permanently.\n');
    console.log('Usage:');
    console.log('  ./delete.mjs <id> [options]\n');
    console.log('Options:');
    console.log('  -h, --help     Show this help message');
    console.log('  -j, --json     Output results as JSON\n');
    console.log('Examples:');
    console.log('  ./delete.mjs 123456789');
}

async function deleteBookmark(id, apiKey) {
    const response = await fetch(`https://api.raindrop.io/rest/v1/raindrop/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 404) {
        throw new Error(`Bookmark ${id} not found`);
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
}

main().catch(error => {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});
