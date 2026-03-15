---
name: writing-a-prd
description: Create a Product Requirements Document (PRD) that defines what to build, why it matters, and how success is measured. Use when starting a new feature, product initiative, or when you need to align on requirements before technical planning.
metadata:
  version: "2.0"
---

# Writing a PRD

Create a comprehensive Product Requirements Document that captures the problem, solution, and success criteria from the user's perspective. The PRD is the foundation for all subsequent technical work.

## Workflow

### 1. Gather Requirements

Ask the user for a detailed description of:
- The problem they want to solve
- Who the users are and what they need
- Any ideas for solutions or constraints
- Success criteria and key metrics

### 2. Explore the Codebase

Explore the repo to verify assertions and understand:
- Current state of relevant systems
- Existing patterns and conventions
- Technical constraints or opportunities
- Integration points

### 3. Interview and Refine

Walk through the design with the user to resolve ambiguities:
- Clarify user flows and edge cases
- Resolve dependencies between decisions
- Confirm scope and priorities
- Identify what is explicitly out of scope

### 4. Sketch Modules

Outline the major components needed:
- Deep modules (encapsulate complex functionality in simple interfaces)
- Interfaces between components
- Testing approach for each module

Get user confirmation on the module design.

### 5. Write the PRD

**Generate a slug** from the feature name: convert to kebab-case, drop filler words, max ~50 chars, keep it human-readable (e.g., "User Authentication with RBAC" → `user-auth-rbac`).

Create the directory `docs/specs/<slug>/` and write the PRD to `docs/specs/<slug>/prd.md` using the template below. The PRD should be a durable document that survives refactoring and technical changes.

**Update the spec index:** Add or update an entry in `docs/specs/index.md` (create the file if it doesn't exist). The index is a markdown table:

```markdown
# Spec Index

| Spec | Status | Created | Tasks |
|------|--------|---------|-------|
| [Feature Name](slug/prd.md) | Draft | YYYY-MM-DD | #issue, #issue |
```

Set Status to `Draft` initially. Fill in Created with today's date and link Tasks after issues are created in step 6.

### 6. Create GitHub Issues

After writing the PRD:

1. **Create a parent issue** for the PRD itself (for tracking and discussion)
2. **Create child issues** for each major deliverable or implementation phase

**When to create multiple issues:**
- Large features that can be parallelized (different teams or contributors)
- Phased rollouts (MVP, then enhancements)
- Platform splits (iOS/Android, frontend/backend)
- Risk decomposition (spike/prototype, then production)
- Clear boundaries between components

Each child issue should reference the PRD and describe a specific, implementable piece of work.

## PRD Template

Use the following template for `docs/specs/<slug>/prd.md`:

```markdown
# [Feature Name] - Product Requirements Document

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

This list should be extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

## Linked Issues

- PRD tracking issue: #[number]
- Implementation issues:
  - #[number] - [description]
  - #[number] - [description]
```

## Guidelines

- **User-centric**: Describe everything from the user's perspective, not the implementation
- **Durable**: Avoid file paths, line numbers, or code specifics that change frequently
- **Complete**: No open questions should remain; if something is unclear, ask before finalizing
- **Measurable**: Include success criteria that can be validated later

## Relationship to Technical Planning

The PRD is the **input** to the technical workflow:

```
docs/specs/<slug>/prd.md (what to build) → research.md (understand existing code) → plan.md (how to build it)
```

- `validating-plan` should verify against **both** the plan (technical correctness) AND the PRD (product requirements)
- `iterating-plan` should reference PRD constraints when refining technical approaches
- Multiple `plan.md` files can reference the same `docs/specs/<slug>/prd.md` when a feature is split across issues
- `docs/specs/index.md` serves as the central registry of all specs
