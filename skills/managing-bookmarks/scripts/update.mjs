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
        tags: {
            type: 'string',
            description: 'Set tags (comma-separated, replaces existing)'
        },
        'add-tags': {
            type: 'string',
            description: 'Add tags (comma-separated)'
        },
        'remove-tags': {
            type: 'string',
            description: 'Remove tags (comma-separated)'
        },
        title: {
            type: 'string',
            description: 'Update title'
        },
        excerpt: {
            type: 'string',
            description: 'Update excerpt (short description shown in lists)'
        },
        note: {
            type: 'string',
            description: 'Update note (longer annotation, e.g. reading notes)'
        },
        collection: {
            type: 'string',
            description: 'Move to a different collection (by ID)'
        },
        'mark-important': {
            type: 'boolean',
            description: 'Mark as important'
        },
        'unmark-important': {
            type: 'boolean',
            description: 'Unmark as important'
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
            showHelp(options);
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
        
        // Build update payload
        const updates = {};
        
        if (values.title !== undefined) {
            updates.title = values.title;
        }
        
        if (values.excerpt !== undefined) {
            updates.excerpt = values.excerpt;
        }

        if (values.note !== undefined) {
            updates.note = values.note;
        }
        
        if (values.collection !== undefined) {
            const collectionId = parseInt(values.collection, 10);
            if (isNaN(collectionId)) {
                console.error(`Error: Invalid collection ID "${values.collection}"`);
                process.exit(1);
            }
            updates.collection = { $id: collectionId };
        }

        if (values['mark-important']) {
            updates.important = true;
        } else if (values['unmark-important']) {
            updates.important = false;
        }
        
        // Handle tag operations
        if (values.tags !== undefined || values['add-tags'] !== undefined || values['remove-tags'] !== undefined) {
            // First get current bookmark to get existing tags
            const current = await getBookmark(id, apiKey);
            let tags = current.tags || [];
            
            if (values.tags !== undefined) {
                // Replace all tags
                tags = values.tags.split(',').map(t => t.trim()).filter(Boolean);
            } else {
                // Add tags
                if (values['add-tags']) {
                    const newTags = values['add-tags'].split(',').map(t => t.trim()).filter(Boolean);
                    tags = [...new Set([...tags, ...newTags])];
                }
                
                // Remove tags
                if (values['remove-tags']) {
                    const removeTags = values['remove-tags'].split(',').map(t => t.trim()).filter(Boolean);
                    tags = tags.filter(t => !removeTags.includes(t));
                }
            }
            
            updates.tags = tags;
        }
        
        if (Object.keys(updates).length === 0) {
            console.error("Error: No updates specified. Use --tags, --add-tags, --remove-tags, --title, --excerpt, --note, --collection, --mark-important, or --unmark-important");
            process.exit(1);
        }
        
        const result = await updateBookmark(id, updates, apiKey);
        
        if (values.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log(`Updated bookmark ${id}:`);
            if (updates.title) console.log(`  Title: ${updates.title}`);
            if (updates.tags) console.log(`  Tags: ${updates.tags.join(', ')}`);
            if (updates.excerpt) console.log(`  Excerpt: ${updates.excerpt.substring(0, 50)}${updates.excerpt.length > 50 ? '...' : ''}`);
            if (updates.note) console.log(`  Note: ${updates.note.substring(0, 50)}${updates.note.length > 50 ? '...' : ''}`);
            if (updates.collection) console.log(`  Collection: ${updates.collection.$id}`);
            if (updates.important !== undefined) console.log(`  Important: ${updates.important}`);
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
    console.log('Raindrop.io Bookmark Update');
    console.log('===========================\n');
    console.log('Update bookmark metadata: tags, title, excerpt, note, important flag.\n');
    console.log('Usage:');
    console.log('  ./update.mjs <id> [options]\n');
    console.log('Options:');
    console.log('  -h, --help               Show this help message');
    console.log('  --tags <tags>            Set tags (comma-separated, replaces existing)');
    console.log('  --add-tags <tags>        Add tags (comma-separated)');
    console.log('  --remove-tags <tags>     Remove tags (comma-separated)');
    console.log('  --title <title>          Update title');
    console.log('  --excerpt <text>         Update excerpt (short description)');
    console.log('  --note <text>            Update note (longer annotation, e.g. reading notes)');
    console.log('  --collection <id>        Move to a different collection');
    console.log('                           (use --collection=-1 syntax for negative IDs, e.g. Unsorted)');
    console.log('  --mark-important         Mark as important');
    console.log('  --unmark-important       Unmark as important');
    console.log('  -j, --json               Output results as JSON\n');
    console.log('Examples:');
    console.log('  ./update.mjs 123456789 --add-tags "read,important"');
    console.log('  ./update.mjs 123456789 --tags "ai,ml,research"');
    console.log('  ./update.mjs 123456789 --title "Updated Title" --add-tags "distilled"');
    console.log('  ./update.mjs 123456789 --mark-important');
    console.log('  ./update.mjs 123456789 --note "Key insight: ..."');
    console.log('  ./update.mjs 123456789 --remove-tags "unread" --add-tags "read"');
}

async function getBookmark(id, apiKey) {
    const url = `https://api.raindrop.io/rest/v1/raindrop/${id}`;
    
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
    return data.item;
}

async function updateBookmark(id, updates, apiKey) {
    const url = `https://api.raindrop.io/rest/v1/raindrop/${id}`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
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
