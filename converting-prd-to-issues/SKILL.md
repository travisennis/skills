---
name: converting-prd-to-issues
description: Break a PRD into independently-grabbable GitHub issues using vertical slices (tracer bullets)
metadata:
  version: "1.0"
---

# PRD to Issues

Break a PRD into independently-grabbable GitHub issues using vertical slices (tracer bullets).

## Process

### 1. Locate the PRD

The PRD may be either a GitHub issue or a local file at `docs/specs/<slug>/prd.md`.

- **GitHub issue**: Ask the user for the PRD issue number (or URL). If the PRD is not already in your context window, fetch it with `gh issue view <number>` (with comments).
- **Local file**: If the user provides a path like `docs/specs/<slug>/prd.md`, read it directly. Identify the **spec slug** from the path (the directory name under `docs/specs/`).

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 3. Draft vertical slices

Break the PRD into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Create the GitHub issues

For each approved slice, create a GitHub issue using `gh issue create`. Use the issue body template below.

Create issues in dependency order (blockers first) so you can reference real issue numbers in the "Blocked by" field.

<issue-template>
## Parent PRD

#<prd-issue-number>

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation. Reference specific sections of the parent PRD rather than duplicating content.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by #<issue-number> (if any)

Or "None - can start immediately" if no blockers.

## User stories addressed

Reference by number from the parent PRD:

- User story 3
- User story 7

</issue-template>

### 6. Create Task Index

After all issues are created, generate the local task tracking structure:

1. **Create the tasks directory**: `docs/specs/<slug>/tasks/`

2. **Create a subdirectory for each task**: `docs/specs/<slug>/tasks/<task-slug>/`
   - Derive `<task-slug>` from the task title: lowercase, kebab-case, max ~50 characters.

3. **Write `docs/specs/<slug>/tasks/index.md`** with a task breakdown table:

   ```markdown
   # Tasks — <PRD Title>

   | # | Task | Status | Issue | Blocked By |
   |---|------|--------|-------|------------|
   | 1 | <task title> | 🔲 Not started | [#<num>](url) | — |
   | 2 | <task title> | 🔲 Not started | [#<num>](url) | #<blocker> |
   ```

4. **Update `docs/specs/index.md`** to reflect the total task count for this spec (add or update the row for this spec's slug).

Do NOT close or modify the parent PRD issue.
