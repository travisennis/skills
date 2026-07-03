# Plan Template

Use this template structure when writing the final plan to `plan.md`.

```markdown
# [Short, action-oriented description]

This plan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

## Purpose / Big Picture

Explain in a few sentences what someone gains after this change and how they can see it working. State the user-visible behavior you will enable.

What someone can do after this change that they could not do before:
- [User capability 1]
- [User capability 2]

How to verify it works:
- [Observable outcome 1]
- [Observable outcome 2]

## Progress

Use a list with checkboxes to summarize granular steps. Every stopping point must be documented here, even if it requires splitting a partially completed task into two ("done" vs. "remaining"). This section must always reflect the actual current state of the work.

- [x] (2025-03-15 10:00Z) Example completed step.
- [ ] Example incomplete step.
- [ ] Example partially completed step (completed: X; remaining: Y).

## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during implementation. Provide concise evidence.

- **Observation**: [What was unexpected]
  - **Evidence**: [Test output, error message, or log snippet]

## Decision Log

Record every decision made while working on the plan:

- **Decision**: [What was decided]
  - **Rationale**: [Why this path was chosen]
  - **Date/Author**: [When and by whom]

## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion. Compare the result against the original purpose.

- **What was achieved**: [Summary of completed work]
- **What remains**: [Outstanding items]
- **Lessons learned**: [What would be done differently]

## Context and Orientation

Describe the current state relevant to this task as if the reader knows nothing. Name the key files and modules by full path. Define any non-obvious term you will use.

### Key Terms:
- **[Term]**: [Plain language definition]

### Key Files:
- `path/to/file.ext`: [What this file does and why it matters]

## What We're NOT Doing

Explicitly list out-of-scope items to prevent scope creep:

- [Out-of-scope item 1]
- [Out-of-scope item 2]

## Implementation Approach

High-level strategy and reasoning. If multiple approaches were considered, explain why this one was chosen.

## Milestones

Each milestone must be independently verifiable and incrementally implement the overall goal. Milestones are narrative, not bureaucracy—describe goal, work, result, proof as a story.

### Milestone 1: [Descriptive Name]

**Overview**: What this milestone accomplishes and what will exist at the end that did not exist before.

**Repository Context**: Name files with full repository-relative paths. Describe where new files should be created. If touching multiple areas, explain how those parts fit together.

**Plan of Work**: Describe in prose the sequence of edits and additions. For each edit, name the file and location (function, module) and what to insert or change. Keep it concrete and minimal.

**Interfaces and Dependencies**: Name the libraries, modules, and services to use and why. Specify the types, traits/interfaces, and function signatures that must exist.

Example:
```
In src/planner.rs, define:
    pub trait Planner {
        fn plan(&self, observed: &Observed) -> Vec<Action>;
    }
```

**Concrete Steps**: State the exact commands to run and where to run them (working directory). When a command generates output, show a short expected transcript.

Example:
```
Working directory: /project-root
Command: cargo test planner
Expected output:
    running 1 test
    test planner::tests::test_plan ... ok
```

**Validation and Acceptance**: Describe how to start or exercise the system and what to observe. Phrase acceptance as behavior with specific inputs and outputs.

Example:
```
Acceptance: After starting the server with `cargo run`, navigating to 
http://localhost:8080/health returns HTTP 200 with body "OK".
```

**Idempotence and Recovery**: If steps can be repeated safely, say so. If a step is risky, provide a safe retry or rollback path.

**Artifacts and Evidence**: Include the most important transcripts, diffs, or snippets as indented examples. Keep them concise and focused on what proves success.

**Success Criteria**:

#### Automated Verification:
- [ ] Tests pass: `[test command]`
- [ ] Type checking passes: `[typecheck command]`
- [ ] Linting passes: `[lint command]`
- [ ] Build succeeds: `[build command]`
- [ ] Specific verification: [e.g., "File exists at path/to/file.ext"]

#### Manual Verification:
- [ ] [Specific behavior a human can verify]
- [ ] [Edge case handling verified manually]

**Implementation Note**: After completing this milestone and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next milestone.

---

### Milestone 2: [Descriptive Name]

[Same structure as Milestone 1]

## Prototyping Milestones (Optional)

When de-risking is needed, include explicit prototyping milestones:

### Prototype: [Feasibility Test Name]

**Purpose**: What question this prototype answers

**Scope**: What will be built (keep it minimal)

**Validation**: How to run and observe results

**Criteria**: What determines if we promote or discard this prototype

## Testing Strategy

### Unit Tests:
- [What to test]
- [Key edge cases]

### Integration Tests:
- [End-to-end scenarios]

### Manual Testing Steps:
1. [Specific step to verify feature with expected outcome]
2. [Another verification step]
3. [Edge case to test manually]

## Performance Considerations

[Any performance implications or optimizations needed]

## Migration Notes

[If applicable, how to handle existing data/systems. Include safe fallbacks.]

## Rollback Plan

[If changes are risky, how to revert to previous state safely]

## References

- GitHub issue: [issue URL] (if applicable)
- Related research: `research.md`
- Similar implementation: `[file:line]`

---

## Revision History

[When revising the plan, add entries here describing the change and reason]

- [Timestamp]: [Description of change] - [Reason for change]
```
