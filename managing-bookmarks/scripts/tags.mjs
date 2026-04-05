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
        rename: {
            type: 'string',
            description: 'Rename a tag (requires old and new tag names as positionals)'
        },
        merge: {
            type: 'string',
            description: 'Merge two tags (requires two tag names as positionals)'
        },
        delete: {
            type: 'string',
            description: 'Delete a tag'
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
        
        // Handle rename operation
        if (values.rename !== undefined) {
            if (positionals.length < 1) {
                console.error("Error: --rename requires two tag names: old and new");
                console.error("Usage: --rename <old-tag> <new-tag>");
                process.exit(1);
            }
            const oldTag = values.rename;
            const newTag = positionals[0];
            await renameTag(oldTag, newTag, apiKey);
            console.log(`Renamed tag "${oldTag}" to "${newTag}"`);
            return;
        }
        
        // Handle merge operation
        if (values.merge !== undefined) {
            if (positionals.length < 1) {
                console.error("Error: --merge requires two tag names");
                console.error("Usage: --merge <target-tag> <source-tag>");
                process.exit(1);
            }
            const targetTag = values.merge;
            const sourceTag = positionals[0];
            await mergeTags(targetTag, sourceTag, apiKey);
            console.log(`Merged tag "${sourceTag}" into "${targetTag}"`);
            return;
        }
        
        // Handle delete operation
        if (values.delete) {
            await deleteTag(values.delete, apiKey);
            console.log(`Deleted tag "${values.delete}"`);
            return;
        }
        
        // Default: list all tags
        const tags = await listTags(apiKey);
        
        if (values.json) {
            console.log(JSON.stringify(tags, null, 2));
        } else {
            printTags(tags);
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
    console.log('Raindrop.io Tag Management');
    console.log('==========================\n');
    console.log('List, rename, merge, and delete tags.\n');
    console.log('Usage:');
    console.log('  ./tags.mjs                    List all tags');
    console.log('  ./tags.mjs --rename <old> <new>  Rename a tag');
    console.log('  ./tags.mjs --merge <t1> <t2>     Merge two tags');
    console.log('  ./tags.mjs --delete <tag>        Delete a tag\n');
    console.log('Options:');
    console.log('  -h, --help           Show this help message');
    console.log('  --rename <old> <new> Rename a tag');
    console.log('  --merge <t1> <t2>    Merge two tags (t2 into t1)');
    console.log('  --delete <tag>       Delete a tag');
    console.log('  -j, --json           Output results as JSON\n');
    console.log('Examples:');
    console.log('  ./tags.mjs');
    console.log('  ./tags.mjs --rename "ml" "machine-learning"');
    console.log('  ./tags.mjs --merge "ai" "artificial-intelligence"');
    console.log('  ./tags.mjs --delete "temp"');
}

async function listTags(apiKey) {
    const url = 'https://api.raindrop.io/rest/v1/tags/0';
    
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
    return data.items || [];
}

async function renameTag(oldTag, newTag, apiKey) {
    const url = `https://api.raindrop.io/rest/v1/tags/0`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            old: oldTag,
            new: newTag
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
}

async function mergeTags(targetTag, sourceTag, apiKey) {
    const url = `https://api.raindrop.io/rest/v1/tags/0`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            old: sourceTag,
            new: targetTag
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
}

async function deleteTag(tag, apiKey) {
    // Get all bookmarks with this tag
    const searchUrl = `https://api.raindrop.io/rest/v1/raindrops/0?search=${encodeURIComponent(`#${tag}`)}&perpage=100`;
    
    const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        throw new Error(`Search error! status: ${searchResponse.status} - ${errorText}`);
    }
    
    const data = await searchResponse.json();
    const bookmarks = data.items || [];
    
    // Remove the tag from each bookmark
    for (const bookmark of bookmarks) {
        const newTags = bookmark.tags.filter(t => t !== tag);
        
        const updateUrl = `https://api.raindrop.io/rest/v1/raindrop/${bookmark._id}`;
        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tags: newTags })
        });
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Update error for bookmark ${bookmark._id}! status: ${updateResponse.status} - ${errorText}`);
        }
    }
}

function printTags(tags) {
    if (tags.length === 0) {
        console.log('No tags found.');
        return;
    }
    
    console.log(`Found ${tags.length} tag(s):\n`);
    
    // Sort by count descending
    const sortedTags = [...tags].sort((a, b) => b.count - a.count);
    
    // Find max tag length for alignment
    const maxLength = Math.max(...sortedTags.map(t => t._id.length));
    
    for (const tag of sortedTags) {
        const paddedTag = tag._id.padEnd(maxLength);
        console.log(`${paddedTag}  (${tag.count} bookmarks)`);
    }
}

main().catch(error => {
    console.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});
