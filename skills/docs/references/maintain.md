# Maintain Mode

Keep documentation accurate as work happens. Use this mode when asked to update docs after a change, check documentation for a completed piece of work, or decide whether finished work needs documentation follow-up. This is the day-to-day mode; it edits directly but keeps changes narrow and tied to the behavior that changed.

## Start Here

Before changing documentation:

1. Read the user request and identify what behavior, workflow, or decision changed.
2. Inspect the repository to discover its documentation conventions. Treat the repository's existing docs as the source for naming, structure, tone, and level of detail.
3. Prefer existing documentation locations and style over creating new ones, and prefer correcting an existing doc over adding a new one.
4. Route each update to its authoritative home per the authority model in `taxonomy.md`.
5. Never hand-edit generated files (indexes, generated API docs) — update the source records and regenerate with the repo's tool.

## Documentation Discovery

Look for project documentation in common locations: `README*`, `docs/`, `CONTRIBUTING*`, `CHANGELOG*`, `ARCHITECTURE*`, `DESIGN*`, `docs/adr/`, package/module/app-specific docs, and comments or examples that serve as user-facing guidance.

## When Docs Need Updates

This is the canonical trigger list (govern mode's PR checklist rules reference it). Update durable project documentation when a change affects:

- User-visible behavior
- Public APIs, commands, UI flows, configuration, protocols, schemas, or file formats
- Setup, installation, build, test, lint, release, deployment, or rollback instructions
- Security, permissions, data handling, or migration behavior
- Architecture boundaries, dependency direction, ownership, or durable design decisions
- Contributor workflows, testing instructions, or release process
- Domain vocabulary, business workflows, or compliance behavior
- Known limitations, troubleshooting, or compatibility

Do not add documentation just because code changed. Internal refactors often need no docs unless they change how people understand or work with the project. When a change touches architecture or boundaries, run the Architecture Update Checklist in `doc-templates.md`.

## Project Docs vs Agent Artifacts

Keep durable project docs separate from agent working records (task files, plans, research notes, generated indexes) per `principles.md` §7. Durable behavior, architecture, and contributor guidance go in project docs; actionable work, evidence, and open questions stay in their working records. Do not present guesses as facts in project docs — record uncertainty in the working records instead.

## Checking for Problems

While updating, watch for (and report) these defects:

- Missing docs for new or changed durable behavior
- Stale docs that describe behavior that no longer exists
- Contradictions between docs and implementation
- Broken relative links
- Documentation that duplicates another source of truth instead of pointing to it
- Generated files that are stale relative to their sources

If you keep finding systemic problems — pervasive duplication, contradictions, no clear home for content — stop patching and recommend audit mode (and refactor mode after it) instead of fixing symptoms one at a time.

## Update Guidelines

- Keep changes narrow and tied to the behavior that changed.
- Follow the existing style and organization.
- Avoid creating broad architecture docs unless the project already uses them or the user asks for them.
- Do not invent policies that the repository does not already imply.

## Reporting Findings

Use severity levels for individual defects (dimension-level scoring belongs to audit mode):

- `error`: Docs are wrong, misleading, broken, or structurally inconsistent.
- `warning`: Docs are probably stale, incomplete, or missing useful context.
- `info`: Optional improvements or cleanup suggestions.

For each finding, include the affected file, the observed problem, the expected correction, and whether it was fixed or remains open.

## Handoff

At handoff, summarize:

- Which documentation was checked
- Which files were updated
- Which generated files were regenerated, if any
- Any remaining documentation gaps or decisions needed
