---
name: creating-plans
description: Create detailed implementation plans through iterative codebase research. Use when the user wants to plan a feature, design an implementation, or scope a technical task.
metadata:
  version: "2.0"
---

# Creating Implementation Plans

Create implementation plans through an interactive, iterative process. Be skeptical, thorough, and collaborative.

Plans are **living documents** that guide both the initial implementation and future contributors. A good plan enables a complete novice to implement the feature end-to-end without prior knowledge of the repository.

## Workflow

### 1. Gather Context

If a file path was provided, read those inputs fully and begin research immediately. Otherwise, ask the user for the task description, constraints, and any relevant context.

- Search the codebase for files, patterns, and conventions related to the task
- Check for existing research at `.agents/specs/<slug>/research.md` if working within a spec context
- Explore directory structures and trace data flow through key functions
- Note file:line references for important discoveries
- Cross-reference requirements with actual code to identify discrepancies, assumptions, and true scope
- Track planning progress in `scratchpad.md` (reuse this file across sessions)

Present a summary of findings and ask only questions that codebase research could not answer — specific technical decisions, business logic clarifications, or design preferences.

**Self-containment check**: Ensure all required knowledge is embedded in the plan. Do not point to external blogs or docs; if knowledge is required, include it in your own words.

### 2. Research and Design

After initial clarifications:

- If the user corrects a misunderstanding, verify the correction in the code before proceeding
- Conduct deeper investigation into implementation details and similar existing features
- Present findings including current state, design options with trade-offs, and remaining open questions
- Get alignment on the approach before proceeding

### 3. Develop Plan Structure

Propose an outline of implementation phases, each with a name and what it accomplishes. Get feedback on structure before writing details.

### 4. Write the Plan

Write the plan using the template in [references/plan-template.md](references/plan-template.md). The output path depends on context:

- **Task-linked plan** (spec context): When a `.agents/specs/<slug>/tasks.md` file exists, write the plan to `.agents/specs/<slug>/<task-slug>/plan.md`. The `<task-slug>` should match the task name from `tasks.md` (kebab-case, max ~50 chars). Reference the PRD and research by relative path (e.g., `../prd.md`, `../research.md`).
- **Standalone plan** (no spec context): Write the plan to `plan.md` at the project root (reuse this file each session).

After writing the plan:

1. If working within a spec context, update the task status in `.agents/specs/<slug>/tasks.md` to "📋 Planned".
2. Clear `scratchpad.md` once the plan is complete.

### 5. Review and Iterate

Present the draft plan location and ask for feedback on phase scoping, success criteria specificity, technical details, and edge cases. Iterate until the user is satisfied.

## Guidelines

- **Be skeptical**: Question vague requirements. Identify issues early. Don't assume — verify with code.
- **Be interactive**: Don't write the full plan in one shot. Get buy-in at each major step.
- **Be thorough**: Read all context files completely. Include specific file paths and line numbers. Write measurable success criteria with clear automated vs manual distinction.
- **Be practical**: Focus on incremental, testable changes. Consider migration and rollback. Think about edge cases. Include "what we're NOT doing."
- **No open questions in the final plan**: If you encounter unresolved questions, stop and research or ask for clarification immediately. The final plan must be complete and actionable.
- **Plain language**: Define every term of art immediately. Avoid undefined jargon. Do not say "as defined previously" — include explanations even if repetitive.
- **Observable outcomes**: Phrase acceptance as behavior a human can verify (e.g., "after starting the server, navigating to http://localhost:8080/health returns HTTP 200 with body OK") rather than internal attributes (e.g., "added a HealthCheck struct").
- **Idempotent steps**: Write steps so they can be run multiple times without causing damage or drift. Include safe retry or rollback paths for risky operations.
- **Living document**: Plans must be maintained throughout implementation. Record decisions, surprises, and progress as work proceeds.

## Success Criteria Categories

Always separate success criteria into two categories:

1. **Automated verification** — commands that can be run: test, lint, typecheck, build. Also specific files that should exist or code that should compile.
2. **Manual verification** — UI/UX functionality, performance under real conditions, hard-to-automate edge cases, user acceptance criteria.

After each phase's automated verification passes, pause for manual confirmation before proceeding.

### Validation Requirements

Validation is not optional. Every plan must include:
- Specific test commands and how to interpret their results
- Expected outputs and error messages so success is unambiguous
- End-to-end scenarios that prove effectiveness beyond compilation
- Evidence capture: include actual terminal output, short diffs, or logs as indented examples

## Common Implementation Patterns

**Database changes**: schema/migration → store methods → business logic → API → clients

**New features**: research existing patterns → data model → backend logic → API endpoints → UI

**Refactoring**: document current behavior → plan incremental changes → maintain backwards compatibility → migration strategy

**Prototyping milestones**: When de-risking is needed, include explicit prototyping phases that:
- Validate feasibility before full implementation
- Evaluate external libraries or dependencies independently
- Prove concepts with additive, testable code
- State criteria for promoting or discarding the prototype

## Decision Documentation

Resolve ambiguities autonomously and record decisions in the plan:
- Document why a path was chosen, not just what was chosen
- Update the plan to reflect implications of changes
- Record the date/author for each significant decision

## Plan Maintenance (Living Documents)

Plans must be updated as work proceeds:
- **Progress**: Timestamped checklist of completed and remaining work
- **Surprises & Discoveries**: Unexpected behaviors, bugs, optimizations found
- **Decision Log**: Why changes were made to the plan
- **Outcomes & Retrospective**: Summary of what was achieved vs. original purpose

When revising a plan, write a note at the bottom describing the change and the reason why.
