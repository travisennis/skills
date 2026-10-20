---
name: creating-agents-md
description: Create or update a basic root AGENTS.md for a repository that has no agent instructions yet. Use when the user asks to create AGENTS.md, add starter agent instructions, or capture setup, test, style, and Git conventions for an agent. For restructuring an existing AGENTS.md or docs/ tree into a progressive-disclosure system, use the docs skill instead.
user-invocable: true
metadata:
  version: "1.0"
---

# Creating AGENTS.md

Create a useful root `AGENTS.md` for the current repository. `AGENTS.md` is a "README
for agents": concise, actionable instructions that help stateless coding agents discover
the repo, edit safely, and verify their work.

This skill covers the basic starter file. If the repo already has `AGENTS.md`,
`CLAUDE.md`, `.cursorrules`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, or a substantial
`docs/` tree, and the user wants routing docs, progressive disclosure, or a docs
restructure, use the `docs` skill (`/docs refactor`) instead.

## Discovery Checklist

Before editing:

1. Inspect `git status --short`; do not overwrite unrelated user changes.
2. Read root docs if present: `AGENTS.md`, `README.md`, `CONTRIBUTING.md`,
   `ARCHITECTURE.md`, `CLAUDE.md`, `.cursorrules`.
3. Inventory `docs/` before reading deeply. Read only likely routing, guardrail, guide,
   reference, design, ADR, runbook, or spec files.
4. Inspect project config for real commands and surfaces: package manifests, Makefiles,
   task files, CI workflows, Docker files, language tool configs, test directories.
5. Determine the repo shape: app, library, CLI, service, monorepo, plugin, docs-only
   repo, or mixed.
6. Identify compatibility surfaces worth preserving: public API, CLI behavior, config
   shape, file formats, protocols, persistence formats, security boundaries, output
   formats, plugin contracts, dependency policy, design system, accessibility behavior,
   or deployment contracts.
7. Inspect Git conventions from evidence: recent commit subjects, current and recent
   branch names, PR templates, issue tracker references, release notes, and
   `CONTRIBUTING.md`. Useful commands include `git log --oneline -n 30`,
   `git branch --show-current`, and `git branch --list`. Capture unusual commit
   message or branch naming rules exactly.

## Workflow

1. Create or update root `AGENTS.md`.
2. Populate only sections supported by repo evidence.
3. Prefer exact commands over prose. If a command is inferred but unverified, say so.
4. Include setup, development, testing, style, Git conventions, repository rules, and
   handoff expectations when relevant.
5. Keep it concise enough to read at the start of every agent session. Target 60-90
   lines; split deeper material into focused docs only when the user approves the
   structure.

Basic template:

```md
# Agent Instructions

## Project

<One or two sentences describing the repo, based on README and code structure.>

## Setup

- Install dependencies: `<exact command>`
- Required runtime/tooling: `<versions or files that define versions>`
- Environment setup: `<env file or command, if documented>`

## Development

- Run locally: `<exact command>`
- Build: `<exact command>`
- Key directories: `<short list with purpose>`

## Testing

- Run all tests: `<exact command>`
- Run focused tests: `<exact command or pattern>`
- Run lint/type checks: `<exact command>`

## Code Style

- Follow existing patterns in nearby files.
- Use `<formatter/linter>` via `<exact command>`.
- <Project-specific naming, import, file organization, or framework conventions.>

## Git Conventions

- Commit message format: `<document exact observed or documented pattern>`
- Branch naming format: `<document exact observed or documented pattern>`
- Source of truth: `<CONTRIBUTING.md, PR template, issue tracker pattern, or recent git history>`

## Repository Rules

- Do not commit or push unless explicitly asked.
- Do not revert or overwrite user changes.
- Preserve documented public interfaces and data formats unless the task explicitly changes them.

## Handoff

Summarize changes, checks run, and remaining risks or unverified assumptions.
```

## Quality Rules

- Route; do not duplicate procedure text that already has an owner.
- Keep `CONTRIBUTING.md` authoritative about contributor workflow when it exists.
- Keep `ARCHITECTURE.md` authoritative about architecture and boundaries when it exists.
- Prefer exact links to docs over vague "read docs/" references.
- Do not route to missing docs. Create a justified doc with real content, route to the
  closest existing doc, or list the missing doc as a gap.
- Do not invent policy from code shape alone.
- Do not smooth over strange local Git standards. Document the exact observed convention
  and its evidence, or mark it as unknown.
- Preserve project-specific rules. Do not delete meaning; relocate it.
- For monorepos, add nested `AGENTS.md` files only when subprojects have distinct
  workflows or rules. The closest `AGENTS.md` applies.

## Final Handoff

When done, report:

- Files created or changed.
- Important commands or docs captured.
- Checks run, or why checks were not run.
- Any gaps, missing docs, or unverified commands.
