# Raindrop.io API Reference

Official API documentation: https://developer.raindrop.io/

## Authentication

All API requests require an authorization token in the header:

```
Authorization: Bearer <token>
Content-Type: application/json
```

Get your token from: https://app.raindrop.io/settings/integrations

## Rate Limits

- 100 requests per minute for most endpoints
- Higher limits available for some paid plans

## Endpoints

### Raindrops (Bookmarks)

#### Get Single Raindrop

```
GET /rest/v1/raindrop/{id}
```

Returns a single bookmark by ID.

**Response:**
```json
{
  "item": {
    "_id": 123456789,
    "title": "Bookmark Title",
    "link": "https://example.com/article",
    "domain": "example.com",
    "excerpt": "Article excerpt...",
    "note": "User notes...",
    "tags": ["tag1", "tag2"],
    "collection": { "$id": 123456, "$ref": "collections" },
    "created": "2024-01-15T10:30:00.000Z",
    "lastUpdate": "2024-01-15T10:30:00.000Z",
    "important": false,
    "cover": "https://example.com/cover.jpg",
    "media": []
  }
}
```

#### Get Multiple Raindrops

```
GET /rest/v1/raindrops/{collectionId}
```

Query parameters:
- `search` - Search string (supports special syntax)
- `perpage` - Number of results (documented as 1-100, but observed to cap at 50; default: 25)
- `page` - Page number for pagination (0-based). The response's `count` field gives the
  total number of matches — use it to decide when to stop paging, not page fullness
- `sort` - Sort field
- `all` - Include all nested collections

**Search syntax:**
- `#tag` - Search by tag
- `word` - Search in title, excerpt, and notes
- `"phrase"` - Exact phrase search
- `domain:example.com` - Filter by domain
- `created:>2024-01-01` - Filter by creation date
- `updated:<2024-06-01` - Filter by update date

**Response:**
```json
{
  "result": true,
  "items": [
    {
      "_id": 123456789,
      "title": "...",
      "link": "...",
      ...
    }
  ],
  "count": 50,
  "collectionId": 0
}
```

#### Create Raindrop

```
POST /rest/v1/raindrop
```

**Request body:**
```json
{
  "link": "https://example.com/article",
  "title": "Optional title",
  "tags": ["tag1", "tag2"],
  "collection": { "$id": 123456 },
  "excerpt": "Optional excerpt",
  "pleaseParse": {}
}
```

#### Update Raindrop

```
PUT /rest/v1/raindrop/{id}
```

**Request body:**
```json
{
  "title": "New title",
  "tags": ["new", "tags"],
  "excerpt": "Updated excerpt",
  "note": "Updated note",
  "important": true
}
```

#### Delete Raindrop

```
DELETE /rest/v1/raindrop/{id}
```

Moves the bookmark to Trash. Deleting a bookmark that is already in Trash removes it permanently.

### Collections

#### Get All Collections

```
GET /rest/v1/collections
```

**Response:**
```json
{
  "result": true,
  "items": [
    {
      "_id": 123456,
      "title": "Collection Name",
      "description": "Description",
      "count": 42,
      "cover": "...",
      "color": "#FF5733",
      "public": false,
      "view": "list",
      "sort": 0,
      "parent": { "$id": 789, "$ref": "collections" },
      "created": "2024-01-15T10:30:00.000Z",
      "lastUpdate": "2024-01-15T10:30:00.000Z",
      "expanded": true
    }
  ]
}
```

#### Get Collection

```
GET /rest/v1/collection/{id}
```

Special collection IDs:
- `0` - All bookmarks
- `-1` - Unsorted
- `-99` - Trash

#### Create Collection

```
POST /rest/v1/collection
```

**Request body:**
```json
{
  "title": "New Collection",
  "parent": { "$id": 123 },
  "view": "list"
}
```

#### Update Collection

```
PUT /rest/v1/collection/{id}
```

#### Delete Collection

```
DELETE /rest/v1/collection/{id}
```

### Tags

#### Get All Tags

```
GET /rest/v1/tags/{collectionId}
```

Use `0` for all collections.

**Response:**
```json
{
  "result": true,
  "items": [
    {
      "_id": "tag-name",
      "count": 5
    }
  ]
}
```

#### Rename Tag

```
PUT /rest/v1/tags/{collectionId}
```

**Request body:**
```json
{
  "old": "old-tag-name",
  "new": "new-tag-name"
}
```

This also merges tags if the new name already exists.

#### Remove Tag(s)

```
DELETE /rest/v1/tags/{collectionId}
```

**Request body:**
```json
{
  "tags": ["tag-to-remove", "another-tag"]
}
```

Removes the tags from every bookmark in the collection (`0` for all) in a single call.

## Data Types

### Raindrop (Bookmark)

| Field | Type | Description |
|-------|------|-------------|
| `_id` | number | Unique identifier |
| `title` | string | Bookmark title |
| `link` | string | URL |
| `domain` | string | Extracted domain |
| `excerpt` | string | Article excerpt or user description |
| `note` | string | User notes |
| `tags` | string[] | Array of tag names |
| `collection` | object | Reference to collection |
| `created` | string | ISO 8601 timestamp |
| `lastUpdate` | string | ISO 8601 timestamp |
| `important` | boolean | Starred/favorite status |
| `cover` | string | Cover image URL |
| `media` | array | Media files |
| `type` | string | "link", "article", "image", "video", "document" |

### Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | number | Unique identifier |
| `title` | string | Collection name |
| `description` | string | Collection description |
| `count` | number | Number of bookmarks |
| `cover` | string | Cover image URL |
| `color` | string | Hex color code |
| `public` | boolean | Public visibility |
| `view` | string | "list", "grid", "simple", "headlines" |
| `sort` | number | Sort order |
| `parent` | object | Parent collection reference |
| `expanded` | boolean | Expanded in sidebar |

## Error Responses

```json
{
  "result": false,
  "error": "Error message",
  "errorMessage": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request
- `401` - Unauthorized (check API key)
- `404` - Not found
- `429` - Rate limit exceeded
- `500` - Server error
