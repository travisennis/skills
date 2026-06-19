---
name: refactoring-agents-docs
description: |
  Refactor a repo's agent documentation into a progressive-disclosure system.
  Audits existing docs (AGENTS.md, README, CONTRIBUTING, ARCHITECTURE, docs/),
  produces a recommendation with a precise file manifest, and waits for user
  approval before applying changes. Does not write a plan artifact unless the
  user asks for one or approves it. Creates a concise AGENTS.md routing layer
  backed by a structured docs/ hierarchy — only creating docs that earn their
  place.
user-invocable: true
---

# Refactoring Agents Docs

This skill operates on the **current working directory** — the repo you're in. It refactors that repo's documentation into a **progressive-disclosure system**: `AGENTS.md` becomes a concise routing document (~60–90 lines) that tells agents how to classify work, which compatibility surfaces matter, and which focused docs to read for each change type. Detailed rules move into a structured `docs/` hierarchy.

The skill follows a **plan-first workflow**: Phase 1 audits the existing docs, Phase 2 produces a recommendation and waits for approval, Phase 3 (after approval) applies changes directly to the working tree. No empty bureaucracy — only create docs that are justified by what the repo needs.

## Phase 1 — Audit

Start by inspecting the current documentation landscape. Be thorough but fast — this is a read-only survey.

### Check these files

- Read each file if present; note it as missing if absent.
- `AGENTS.md` (or equivalent — `CLAUDE.md`, `.cursorrules`, `.github/CODE_OF_CONDUCT.md`-adjacent agent instructions)
- `README.md`
- `CONTRIBUTING.md` (if present)
- `ARCHITECTURE.md` (if present)
- Existing `docs/` content — inventory doc paths first, then read likely routing, guardrail, guide, reference, design doc, ADR, runbook, or spec files as needed. Do not exhaustively load a large docs tree unless the task requires it.
- Git status: `git status --short`

### Catalog what you find

Build a mental inventory of:
- **What exists** — every doc file and its rough purpose
- **AGENTS.md content types** — what's in there: routing logic, command catalogs, test matrices, style guides, dependency policies, release procedures, generated-index instructions, tool-specific workflows, safety rules. Note which content belongs in a routing doc vs. a deeper reference.
- **Risk surfaces** — from README, package config, directory structure. What does this repo do? CLI tool? Library? App with a database? Has public API? Security-sensitive? Helps determine which workflow routes belong in the new AGENTS.md.
- **Missing content** — what's not documented that should be. E.g., no domain glossary but the repo has complex business terms. No testing guide but tests exist.
- **Git state** — any uncommitted user changes that shouldn't be touched.

## Phase 2 — Recommendation

Prepare a recommendation plan and present it to the user for approval.

### Build the plan

Prepare the plan in the conversation by default. Do not write a plan file unless the user asks for one or approves it after being asked.

Before writing any plan artifact, ask:

> Do you want this plan saved to a file? If yes, where should it go?

If the user approves but gives no path, suggest `.agents/plans/docs-refactor-plan.md`; do not assume it.

The plan must include:

1. **Current state summary** — what exists, what's in AGENTS.md, what's in docs/
2. **Proposed changes manifest** — a precise file-by-file table with actions:

   | Path | Action | Notes |
   |------|--------|-------|
   | `AGENTS.md` | modify | Restructure into routing doc |
   | `docs/guardrails/testing-and-verification.md` | create | From CONTRIBUTING testing section |
   | `docs/guides/setup.md` | create | From CONTRIBUTING setup section |
   | ... | ... | ... |

3. **Proposed AGENTS.md outline** — the headings and route sections you'll create, showing which routes map to which deeper docs
4. **What moves where** — for each piece of content being removed from AGENTS.md, say exactly which doc it's going to
5. **Optional** — any docs being left as-is, or gaps you're flagging

### Present for approval

In the conversation, show:
- **Key findings** — 3-5 bullet summary of what's working and what needs work
- **Proposed AGENTS.md line count** — target (60-90 lines)
- **File manifest** — the table of changes (paths + actions)
- **Notable choices** — e.g., "Skipped DESIGN.md because this repo has no UI." "No security guardrail because nothing security-sensitive was found."

Then ask: **"Approve with 'proceed' to apply changes, or give feedback to refine."**

Do not proceed to Phase 3 without explicit approval.

### Hard rules during recommendation

- Do not commit or push unless explicitly asked.
- Assume uncommitted changes may belong to the user.
- Do not revert, overwrite, or clean files you did not intentionally change.
- Inspect `git status --short` before broad reading.

### Handling pushback

If the user pushes back on specific recommendations:
- Adjust the recommendation and re-present changes
- If the user previously approved a plan file, ask before updating that file
- Do not implement partial changes without a clear updated manifest

## Phase 3 — Implementation (after approval)

Apply the changes directly to the working tree.

### Before editing

1. Check `git status --short` again. Warn if new uncommitted changes appeared since the audit.
2. Do not commit or push unless explicitly asked.
3. Do not revert, overwrite, or clean files you did not intentionally change.

### Apply changes

1. **Create or update `AGENTS.md`** — concise routing doc using the template below
2. **Create `docs/` directory and structure** — only docs that were in the manifest
3. **Move content** — relocate detailed rules from AGENTS.md into appropriate deeper docs. Preserve existing docs/ content; slot it into the new structure.
4. **Create `docs/README.md`** — documentation index

### AGENTS.md template

Use this structure, adapted to the project. 60-90 lines target.

```md
# Agent Instructions

## Project

<1-2 sentence description of the project.>

Compatibility surfaces: <list relevant surfaces — public API, CLI behavior, config shape, file formats, protocols, persistence formats, security boundaries, output formats, plugin contracts, dependency/MSRV policy, design system, accessibility behavior, deployment contracts, etc.>. Preserve them unless the task explicitly changes them.

## Operating Loop

1. Classify the request before editing.
2. Load only the routed docs needed for that request.
3. Preserve compatibility surfaces unless explicitly changed.
4. Keep edits surgical and verify according to risk.
5. Handoff with changes, checks, and remaining risk.

When this file conflicts with a specialized workflow doc for that workflow, the specialized doc wins.

## Workflow Routing

<Project-specific route sections. Each route says:
- "Use this workflow for ..."
- "Consult ..."
- One or two compatibility, security, or testing reminders specific to that route.>

## Repository Rules

<Only global safety rules. Not detailed policies.>

## Handoff

<What every final handoff must include.>
```

### docs/ layout template

Create only the subdirectories and files the repo needs. Do not create empty bureaucracy. Exception: when creating or restructuring a `docs/` hierarchy, create `docs/README.md` as the consistent entrypoint.

```
docs/
├── README.md              # Documentation index for the docs/ hierarchy
├── DOMAIN.md              # Domain vocabulary, business terms (if needed)
├── DESIGN.md              # UI/UX design language (if repo has UI)
├── design-docs/           # Feature/system design docs (if needed)
├── guardrails/            # Risk-surface rules by topic
│   └── [topic].md
├── guides/                # How-to workflows
│   ├── setup.md
│   ├── testing.md
│   └── [workflow].md
├── references/            # Stable reference material
│   └── [topic].md
└── adr/                   # Architecture Decision Records
    └── NNNN-slug.md
```

### Guardrail creation rule

Only create a guardrail file if you can populate it with real content — moved from existing docs, directly evidenced by repo config/scripts, or explicitly approved by the user. Do not invent policy from code shape alone. If a route section in AGENTS.md would point to a guardrail that doesn't exist yet, note the gap in the recommendation. Do not create empty stubs.

### docs/README.md

Must include:
- Short description of what belongs in `docs/`
- Links to the highest-value docs
- A section mapping common tasks to the right docs
- A note that `AGENTS.md` is the routing layer for agents and this file is the docs index

### Post-implementation

1. Show a concise diff summary
2. Report final `AGENTS.md` line count
3. List what moved out of `AGENTS.md` and where it went
4. Run markdown formatting/checks if available. If no checks exist, say so.
5. Report remaining uncommitted/untracked files
6. If a plan file was approved and written, report its path

## Authority Rules

- Preserve existing project-specific rules. Do not delete meaning; relocate it.
- Prefer exact links to docs over vague "read docs/" references.
- Do not route to missing docs. If a proposed route has no target doc, either create a justified doc with real content, route to the closest existing doc, or list the missing doc as a gap in the recommendation.
- Keep `AGENTS.md` authoritative about routing, not about every procedure.
- Keep `docs/README.md` authoritative about documentation navigation, not agent behavior.
- Keep `CONTRIBUTING.md` authoritative about contributor workflow (if it exists).
- Keep `ARCHITECTURE.md` authoritative about architecture and boundaries (if it exists).
- Keep guardrails authoritative about risk-specific agent rules.
- Keep guides authoritative about procedural workflows.
- Keep references authoritative about stable contracts and facts.
- Keep the resulting instructions useful for a stateless coding agent with limited context.
