---
name: creating-agents-md
description: Create or improve AGENTS.md files for repositories. Use when the user asks to create AGENTS.md, update AGENTS.md, add agent instructions, or organize agent documentation.
---

# Creating AGENTS.md

Create a useful `AGENTS.md` for the current repository. `AGENTS.md` is a "README for agents": concise, actionable instructions that help stateless coding agents discover the repo, edit safely, and verify their work.

## First Decide: Basic or Advanced

Default to the smallest useful documentation system.

Use **basic mode** when:
- The repo has no `AGENTS.md`.
- Existing docs are sparse or mostly human-oriented.
- The repo has a simple build/test workflow.
- The user asks for a starter or basic agent instructions file.

Use **advanced mode** when:
- The repo already has `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, or substantial `docs/` content.
- The repo has multiple packages, workflows, compatibility surfaces, or risk areas.
- Existing `AGENTS.md` is long and mixes routing, setup, style, testing, architecture, release, and safety rules.
- The user asks for more agent-ready docs, progressive disclosure, routing docs, or an agent documentation refactor.

If both modes fit, recommend the advanced structure but ask before creating a docs hierarchy. If the user only asks to create `AGENTS.md` and none exists, create a basic root `AGENTS.md` unless repository evidence strongly argues otherwise.

## Discovery Checklist

Before editing:
1. Inspect `git status --short`; do not overwrite unrelated user changes.
2. Read root docs if present: `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `CLAUDE.md`, `.cursorrules`.
3. Inventory `docs/` before reading deeply. Read only likely routing, guardrail, guide, reference, design, ADR, runbook, or spec files.
4. Inspect project config for real commands and surfaces: package manifests, Makefiles, task files, CI workflows, Docker files, language tool configs, test directories.
5. Determine the repo shape: app, library, CLI, service, monorepo, plugin, docs-only repo, or mixed.
6. Identify compatibility surfaces worth preserving: public API, CLI behavior, config shape, file formats, protocols, persistence formats, security boundaries, output formats, plugin contracts, dependency policy, design system, accessibility behavior, or deployment contracts.
7. Inspect Git conventions from evidence: recent commit subjects, current and recent branch names, PR templates, issue tracker references, release notes, and `CONTRIBUTING.md`. Useful commands include `git log --oneline -n 30`, `git branch --show-current`, and `git branch --list`. Capture unusual commit message or branch naming rules exactly.

## Basic AGENTS.md Workflow

Use this for repos that need a practical starter file.

1. Create or update root `AGENTS.md`.
2. Populate only sections supported by repo evidence.
3. Prefer exact commands over prose. If a command is inferred but unverified, say so.
4. Include setup, development, testing, style, Git conventions, repository rules, and handoff expectations when relevant.
5. Keep it concise enough to read at the start of every agent session.

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

## Advanced Progressive-Disclosure Workflow

Use this when a repo is agent-ready enough to benefit from a routing layer backed by focused docs.

Phase 1 - Audit:
- Build a mental inventory of root docs, existing `docs/`, current `AGENTS.md` content types, risk surfaces, missing content, and git state.
- Classify existing `AGENTS.md` content as routing logic, command catalog, test matrix, style guide, dependency policy, commit/branch convention, release process, generated-index instruction, tool workflow, safety rule, or project context.
- Decide what belongs in root `AGENTS.md` versus a deeper guide, guardrail, reference, ADR, or architecture doc.
- Treat commit message and branch naming rules as contributor workflow. In advanced mode, put them in `CONTRIBUTING.md` and route agents there when they need to commit or create a branch.

Phase 2 - Recommend:
- Present the recommendation in conversation by default; do not write a plan file unless the user asks.
- Include key findings, proposed `AGENTS.md` line count, precise file manifest, proposed outline, and what moves where.
- Ask for explicit approval before applying a documentation refactor.

Phase 3 - Implement after approval:
- Re-check `git status --short`.
- Update `AGENTS.md` into a concise routing document, targeting 60-90 lines.
- Create or update `CONTRIBUTING.md` for commit message and branch naming conventions when advanced mode needs those rules documented.
- Create only justified docs. Preserve existing docs and relocate meaning instead of deleting it.
- Create `docs/README.md` when creating or restructuring a `docs/` hierarchy.
- Report diff summary, final `AGENTS.md` line count, moved content, checks run, and remaining uncommitted files.

Advanced `AGENTS.md` template:

```md
# Agent Instructions

## Project

<One or two sentences describing the project.>

Compatibility surfaces: <public API, CLI behavior, config shape, file formats, protocols, persistence formats, security boundaries, output formats, plugin contracts, dependency policy, design system, accessibility behavior, deployment contracts, or other relevant surfaces>. Preserve them unless the task explicitly changes them.

## Operating Loop

1. Classify the request before editing.
2. Load only the routed docs needed for that request.
3. Preserve compatibility surfaces unless explicitly changed.
4. Keep edits surgical and verify according to risk.
5. Handoff with changes, checks, and remaining risk.

When this file conflicts with a specialized workflow doc for that workflow, the specialized doc wins.

## Workflow Routing

### <Route Name>

Use this workflow for <change type>.
Consult <exact doc link>.
Remember <one or two route-specific compatibility, security, or testing reminders>.

### Commits and Branches

Use this workflow when asked to create a commit, name a branch, prepare PR metadata, or infer issue IDs.
Consult `CONTRIBUTING.md`.
Preserve the repository's exact commit message and branch naming conventions, even if they are unusual.

## Repository Rules

<Only global safety rules. Keep detailed policy in focused docs.>

## Handoff

<What every final handoff must include.>
```

## Supporting Docs

Create supporting docs only when they earn their place through existing content, repo config, or explicit user approval. Do not create empty stubs.

Recommended layout when justified:

```text
docs/
|-- README.md
|-- DOMAIN.md
|-- DESIGN.md
|-- design-docs/
|-- guardrails/
|   `-- [topic].md
|-- guides/
|   |-- setup.md
|   |-- testing.md
|   `-- [workflow].md
|-- references/
|   `-- [topic].md
`-- adr/
    `-- NNNN-slug.md
```

`docs/README.md` must include:
- What belongs in `docs/`.
- Links to the highest-value docs.
- A mapping from common tasks to the right docs.
- A note that `AGENTS.md` is the routing layer for agents and `docs/README.md` is the docs index.

`CONTRIBUTING.md` should hold contributor workflow rules in advanced mode, including commit message format, branch naming format, PR title conventions, issue tracker references, and required local checks before committing. If `CONTRIBUTING.md` already exists, preserve its authority and add only missing evidenced conventions.

## Quality Rules

- Keep `AGENTS.md` authoritative about routing, not every procedure.
- Keep `docs/README.md` authoritative about documentation navigation, not agent behavior.
- Keep `CONTRIBUTING.md` authoritative about contributor workflow when it exists.
- In advanced mode, route commit and branch tasks from `AGENTS.md` to `CONTRIBUTING.md`; do not duplicate detailed contributor rules in `AGENTS.md`.
- Keep `ARCHITECTURE.md` authoritative about architecture and boundaries when it exists.
- Keep guardrails authoritative about risk-specific agent rules.
- Keep guides authoritative about procedural workflows.
- Keep references authoritative about stable contracts and facts.
- Prefer exact links to docs over vague "read docs/" references.
- Do not route to missing docs. Create a justified doc with real content, route to the closest existing doc, or list the missing doc as a gap.
- Do not invent policy from code shape alone.
- Do not smooth over strange local Git standards. Document the exact observed convention and its evidence, or mark it as unknown.
- Preserve project-specific rules. Do not delete meaning; relocate it.
- For monorepos, add nested `AGENTS.md` files only when subprojects have distinct workflows or rules. The closest `AGENTS.md` applies.

## Final Handoff

When done, report:
- Files created or changed.
- Whether basic or advanced mode was used and why.
- Important commands or docs captured.
- Checks run, or why checks were not run.
- Any gaps, missing docs, or unverified commands.
