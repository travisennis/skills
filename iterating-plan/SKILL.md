---
name: iterating-plan
description: Iterates on existing implementation plans based on feedback — researching the codebase, validating feasibility, and updating plan files. Use when asked to update, modify, revise, or refine an existing plan.
metadata:
  version: "1.0"
---

# Iterating on Implementation Plans

Update an existing implementation plan based on provided feedback. Be skeptical, thorough, and ensure changes are grounded in actual codebase reality.

## Inputs

- **Plan file**: A path to the plan file or a GitHub issue URL/ID. The plan may be located at:
  - `docs/specs/<slug>/tasks/<task-slug>/plan.md` (task-linked plan within a spec)
  - `plan.md` at the project root (standalone plan)
- **Feedback**: The requested changes or modifications

If either input is missing, ask for it before proceeding.

## Workflow

### 1. Understand the Current Plan

Read the existing plan file completely. Note the structure, phases, scope, success criteria, and implementation approach. Parse the requested changes to determine what needs to be added, modified, or removed, and whether codebase research is required.

### 2. Research (If Needed)

Only research when changes require new technical understanding. Search the codebase for relevant files, patterns, and constraints that affect the requested modifications. Read discovered files fully and cross-reference with plan requirements.

### 3. Confirm Understanding

Before editing, summarize:
- What changes are being made and why
- Any relevant findings from codebase research
- The specific modifications planned

Proceed after confirmation.

### 4. Update the Plan

Make focused, precise edits:

- Maintain existing structure unless explicitly changing it
- Keep all file:line references accurate
- Update success criteria if the changes affect them
- If adding a phase, follow the existing pattern
- If modifying scope, update the "What We're NOT Doing" section
- If changing approach, update the "Implementation Approach" section
- Include specific file paths and line numbers for new content
- Write measurable success criteria
- Maintain the distinction between automated and manual verification criteria
- If working within a spec context, reference the PRD (`../../prd.md`) and research (`../../research.md`) to ensure changes remain aligned with product requirements

### 5. Summarize Changes

After updating, briefly describe what changed and how the plan improved. If a GitHub issue was provided, comment on the issue with a summary of changes.

## Guidelines

- **Be skeptical** — question vague feedback, verify technical feasibility with code research, and flag potential conflicts with existing phases
- **Be surgical** — make precise edits rather than wholesale rewrites; preserve content that does not need changing
- **Be thorough** — read the entire plan before editing; research code patterns when changes require new technical understanding
- **No open questions** — if a change raises questions, ask or research immediately; never update a plan with unresolved questions

## Success Criteria Structure

When updating success criteria, maintain two categories:

1. **Automated verification**: commands the agent can run (test, lint, typecheck, build), specific files that should exist, compilation checks
2. **Manual verification**: UI/UX functionality, real-world performance, edge cases that are hard to automate, user acceptance criteria
