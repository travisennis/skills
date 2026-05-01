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
        const { values } = parseArgs({ 
            args, 
            options,
            allowPositionals: false 
        });
        
        if (values.help) {
            showHelp(options);
            process.exit(0);
        }
        
        const apiKey = process.env.RAINDROP_API_KEY;
        
        if (!apiKey) {
            console.error("Error: RAINDROP_API_KEY environment variable is not set");
            console.error("Get your API key from: https://app.raindrop.io/settings/integrations");
            process.exit(1);
        }
        
        const collections = await listCollections(apiKey);
        
        if (values.json) {
            console.log(JSON.stringify(collections, null, 2));
        } else {
            printCollections(collections);
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
    console.log('Raindrop.io Collections');
    console.log('=======================\n');
    console.log('List all collections and their IDs.\n');
    console.log('Usage:');
    console.log('  ./collections.mjs [options]\n');
    console.log('Options:');
    console.log('  -h, --help     Show this help message');
    console.log('  -j, --json     Output results as JSON\n');
    console.log('Examples:');
    console.log('  ./collections.mjs');
    console.log('  ./collections.mjs -j');
}

async function listCollections(apiKey) {
    const url = 'https://api.raindrop.io/rest/v1/collections';
    
    const response = await fetch(url, {
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
    return (data.items || []).map(normalizeCollection);
}

function normalizeCollection(item) {
    return {
        id: item._id,
        title: item.title,
        description: item.description || '',
        count: item.count || 0,
        cover: item.cover,
        color: item.color,
        public: item.public || false,
        view: item.view || 'list',
        parent: item.parent?.$id || item.parent || null,
        created: item.created,
        lastUpdate: item.lastUpdate,
        expanded: item.expanded || false,
        sort: item.sort
    };
}

function printCollections(collections) {
    if (collections.length === 0) {
        console.log('No collections found.');
        return;
    }
    
    console.log(`Found ${collections.length} collection(s):\n`);
    
    // Separate root and child collections
    const rootCollections = collections.filter(c => !c.parent);
    const childCollections = collections.filter(c => c.parent);
    
    // Sort by title
    rootCollections.sort((a, b) => a.title.localeCompare(b.title));
    childCollections.sort((a, b) => a.title.localeCompare(b.title));
    
    // Build a map for quick lookup
    const collectionMap = new Map(collections.map(c => [c.id, c]));
    
    // Print root collections and their children
    for (const collection of rootCollections) {
        printCollection(collection, 0, childCollections);
    }
    
    // Print any orphaned child collections
    const printedIds = new Set(rootCollections.map(c => c.id));
    const orphaned = childCollections.filter(c => !printedIds.has(c.id) && !collectionMap.has(c.parent));
    if (orphaned.length > 0) {
        console.log('\nOther collections:');
        for (const collection of orphaned) {
            printCollection(collection, 0, []);
        }
    }
}

function printCollection(collection, depth, allChildren) {
    const indent = '  '.repeat(depth);
    const icon = collection.public ? '🌐' : '📁';
    console.log(`${indent}${icon} ${collection.title}`);
    console.log(`${indent}   ID: ${collection.id} | Items: ${collection.count}${collection.description ? ' | ' + collection.description : ''}`);
    
    // Print children
    const children = allChildren.filter(c => c.parent === collection.id);
    for (const child of children) {
        printCollection(child, depth + 1, allChildren);
    }
}

main().catch(error => {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});
