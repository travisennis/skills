---
name: creating-plans
description: Create detailed implementation plans through iterative codebase research. Use when the user wants to plan a feature, design an implementation, or scope a technical task from a GitHub issue or task description.
user-invocable: true
metadata:
  version: "1.0"
---

# Creating Implementation Plans

Create implementation plans through an interactive, iterative process. Be skeptical, thorough, and collaborative.

## Workflow

### 1. Gather Context

If a GitHub issue URL/ID or file path was provided, read those inputs fully and begin research immediately. Otherwise, ask the user for the task description, constraints, and any relevant context.

- Search the codebase for files, patterns, and conventions related to the task
- Explore directory structures and trace data flow through key functions
- Note file:line references for important discoveries
- Cross-reference requirements with actual code to identify discrepancies, assumptions, and true scope
- Track planning progress in `scratchpad.md` (reuse this file across sessions)

Present a summary of findings and ask only questions that codebase research could not answer — specific technical decisions, business logic clarifications, or design preferences.

### 2. Research and Design

After initial clarifications:

- If the user corrects a misunderstanding, verify the correction in the code before proceeding
- Conduct deeper investigation into implementation details and similar existing features
- Present findings including current state, design options with trade-offs, and remaining open questions
- Get alignment on the approach before proceeding

### 3. Develop Plan Structure

Propose an outline of implementation phases, each with a name and what it accomplishes. Get feedback on structure before writing details.

### 4. Write the Plan

Write the plan to `plan.md` (reuse this file each session) using the template in [references/plan-template.md](references/plan-template.md).

If a GitHub issue was provided, comment on the issue with a summary using the `gh` CLI.

Clear `scratchpad.md` once the plan is complete.

### 5. Review and Iterate

Present the draft plan location and ask for feedback on phase scoping, success criteria specificity, technical details, and edge cases. Iterate until the user is satisfied.

## Guidelines

- **Be skeptical**: Question vague requirements. Identify issues early. Don't assume — verify with code.
- **Be interactive**: Don't write the full plan in one shot. Get buy-in at each major step.
- **Be thorough**: Read all context files completely. Include specific file paths and line numbers. Write measurable success criteria with clear automated vs manual distinction.
- **Be practical**: Focus on incremental, testable changes. Consider migration and rollback. Think about edge cases. Include "what we're NOT doing."
- **No open questions in the final plan**: If you encounter unresolved questions, stop and research or ask for clarification immediately. The final plan must be complete and actionable.

## Success Criteria Categories

Always separate success criteria into two categories:

1. **Automated verification** — commands that can be run: test, lint, typecheck, build. Also specific files that should exist or code that should compile.
2. **Manual verification** — UI/UX functionality, performance under real conditions, hard-to-automate edge cases, user acceptance criteria.

After each phase's automated verification passes, pause for manual confirmation before proceeding.

## Common Implementation Patterns

**Database changes**: schema/migration → store methods → business logic → API → clients

**New features**: research existing patterns → data model → backend logic → API endpoints → UI

**Refactoring**: document current behavior → plan incremental changes → maintain backwards compatibility → migration strategy
