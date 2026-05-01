# AGENTS.md

## Overview

This is **acai-skills** — a collection of modular skills that extend the acai AI agent with specialized workflows, domain expertise, and tool integrations. Each skill is a self-contained package under `skills/`.

## Project Structure

```
skills/<skill-name>/
├── SKILL.md          # Required: YAML frontmatter + markdown instructions
├── scripts/          # Optional: executable code (Python, JS, Bash)
├── references/       # Optional: detailed docs loaded on demand
└── assets/           # Optional: output templates, images, fonts
```

Spec artifacts live in `.agents/specs/` (gitignored, never committed).

## Tech Stack

- **Skill definitions**: Markdown with YAML frontmatter
- **Scripts**: Python, JavaScript (Node.js ESM), Bash
- **Key JS deps**: cheerio, zod, puppeteer (per-skill package.json)

## Running / Testing

This is a skill collection, not a compiled app. To install skills:
```bash
bash scripts/install.sh       # macOS/Linux
powershell scripts/install.ps1  # Windows
```
There is no global test suite. Individual skills with scripts may have their own tests. No standard lint config exists.

## Conventional Commits

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>[(scope)]: <description>
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
Scopes are optional but encouraged (e.g., `feat(browser-automation): ...`).

## Branch Strategy

Single `master` branch. Feature branches are used for development and merged via PRs.

## PR Requirements

PRs use `gh pr create` with a structured template:
- **What & Why** — 1-3 bullets on changes and motivation
- **How** — Brief implementation description
- **Areas of Focus for Review** — Specific review concerns
- **Test Plan** — Checklist of test cases
- **Screenshots/Demos** — If applicable

## Code Style Guidelines

### SKILL.md Frontmatter
Every skill must have YAML frontmatter with `name` and `description`. Optional: `user-invocable`, `disable-model-invocation`, `metadata.version`.

### Progressive Disclosure
- Keep SKILL.md under 500 lines; move details to `references/` files
- Reference external files from SKILL.md with clear guidance on when to read them
- Scripts are token-efficient alternatives to inline code — use them for repetitive or fragile operations

### Writing Style
- Be concise — the context window is shared; only include what the model doesn't already know
- Set appropriate degrees of freedom: narrow for fragile operations, broad for flexible tasks
- No extraneous files (README, CHANGELOG, INSTALL guides) inside skill directories

### Naming
- Skill directories: kebab-case (e.g., `breaking-down-prd`)
- Script files: kebab-case (e.g., `web-fetch.js`, `check-docs.py`)
- Spec slugs: kebab-case, max ~50 chars

### Error Handling
- Never run destructive git commands unless explicitly requested
- Never skip hooks (`--no-verify`) unless explicitly requested
- Warn about sensitive files; never commit secrets