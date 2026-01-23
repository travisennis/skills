---
name: managing-tickets
description: Manage tickets with dependency tracking and workflow automation. Use when the user asks to create, track, or manage tickets/issues/tasks with dependencies.
---

# Managing Tickets

Track work items with a minimal ticket system featuring dependency tracking, status management, and workflow automation.

## Setup

No setup required. Tickets are stored as markdown files with YAML frontmatter in `.tickets/` directory.

```bash
# Optional: use custom directory
export TICKETS_DIR="/path/to/.tickets"
```

## Usage

Run this script from this file's directory.

```bash
./scripts/tickets.sh <command> [args]
```

## Commands

| Command | Description |
|---------|-------------|
| `create [title]` | Create ticket, prints ID |
| `start <id>` | Set status to in_progress |
| `close <id>` | Set status to closed |
| `reopen <id>` | Set status to open |
| `status <id> <status>` | Update status (open\|in_progress\|closed) |
| `dep <id> <dep-id>` | Add dependency (id depends on dep-id) |
| `dep tree <id>` | Show dependency tree |
| `dep cycle` | Find dependency cycles |
| `undep <id> <dep-id>` | Remove dependency |
| `link <id> <id>...` | Link tickets (symmetric) |
| `unlink <id> <target-id>` | Remove link |
| `ls` | List all tickets |
| `ready` | List tickets ready to work |
| `blocked` | List blocked tickets |
| `closed` | List recently closed |
| `show <id>` | Display ticket details |
| `edit <id>` | Open in $EDITOR |
| `add-note <id> [text]` | Add timestamped note |
| `query [jq-filter]` | Output as JSON |

## Create Options

| Option | Description |
|--------|-------------|
| `-d, --description` | Description text |
| `--design` | Design notes |
| `--acceptance` | Acceptance criteria |
| `-p, --priority` | Priority 0-4 (0=highest, default: 2) |
| `-t, --type` | Type (bug\|feature\|task\|epic\|chore, default: task) |
| `-a, --assignee` | Assignee (defaults to git user.name) |
| `--external-ref` | External reference (e.g., gh-123, JIRA-456) |
| `--parent` | Parent ticket ID |
| `--tags` | Comma-separated tags |

## List Filters

```bash
# Filter by status
./tickets.sh ls --status=open

# Filter by assignee
./tickets.sh ls -a "Travis"
./tickets.sh ls --assignee="Travis"

# Filter by tag
./tickets.sh ls -T backend
./tickets.sh ls --tag=backend

# Combined filters
./tickets.sh ready -a Travis -T urgent
```

## Examples

```bash
# Create a ticket
./tickets.sh create "Implement user auth" -d "Add OAuth2 login" --tags backend,security

# Start working
./tickets.sh start abc-1234

# Add dependency
./tickets.sh dep abc-1234 def-5678

# View dependency tree
./tickets.sh dep tree abc-1234

# Check for cycles
./tickets.sh dep cycle

# List what's ready to work on
./tickets.sh ready

# Show ticket with blockers and links
./tickets.sh show abc-1234
```

## Ticket Format

```markdown
---
id: prj-ab12
status: open
deps: [tkt-9876]
links: [tkt-1234]
created: 2024-01-15T10:30:00Z
type: feature
priority: 1
assignee: Travis
external-ref: gh-456
parent: epic-001
tags: [backend,api,security]
---
# Implement User Authentication

## Design
- Use OAuth2 with JWT tokens
- Store refresh tokens securely

## Acceptance Criteria
- [ ] User can login via Google
- [ ] Tokens expire after 24h
- [ ] Refresh token rotation enabled

## Notes
**2024-01-15T11:00:00Z**
Added JWT library to requirements
```

## Key Features

- **Dependency tracking**: Add deps between tickets, visualize trees, detect cycles
- **Status workflow**: open → in_progress → closed, with reopen support
- **Priority system**: 0-4 scale (0=highest) for sorting
- **Parent/child**: Organize tickets hierarchically
- **Tags & filtering**: Filter by status, assignee, tag
- **Ready detection**: Find tickets with all deps closed
- **Blocked detection**: Find tickets waiting on open deps
- **Partial ID matching**: `tk show 5c4` matches `nw-5c46`
- **External refs**: Link to GitHub, JIRA, etc.
- **JSON export**: Query tickets with jq filters

## Alias

Add to your shell profile for shorter commands:

```bash
alias tk='~/path/to/tickets.sh'
```

Then use `tk create "task"` instead of full path.
