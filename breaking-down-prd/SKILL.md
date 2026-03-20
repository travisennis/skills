---
name: breaking-down-prd
description: Break a PRD into independently-implementable tasks with local tracking
metadata:
  version: "3.0"
---

# Breaking Down a PRD

Break a PRD into independently-implementable tasks (vertical slices/tracer bullets) with local tracking.

## Process

### 1. Locate the PRD

Read the PRD from `.agents/specs/<slug>/prd.md`. Identify the **spec slug** from the path.

### 2. Explore the Codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 3. Draft Vertical Slices

Break the PRD into **tracer bullet** tasks. Each task is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the User

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

### 5. Write Tasks File

Create the tasks directory and write all tasks to a single `tasks.md` file:

1. **Create the tasks directory**: `.agents/specs/<slug>/tasks/`

2. **Write `.agents/specs/<slug>/tasks.md`** with all task details:

   ```markdown
   # Tasks — <PRD Title>

   ## Task 1: <Task Title>

   **Type:** AFK | HITL  
   **Blocked by:** — | Task 2

   ### What to Build

   A concise description of this vertical slice. Describe the end-to-end behavior.

   ### Acceptance Criteria

   - [ ] Criterion 1
   - [ ] Criterion 2
   - [ ] Criterion 3

   ---

   ## Task 2: <Task Title>

   **Type:** AFK | HITL  
   **Blocked by:** Task 1

   ### What to Build

   ...

   ---

   ## Summary

   | # | Task | Type | Status | Blocked By |
   |---|------|------|--------|------------|
   | 1 | Task 1 | AFK | 🔲 Not started | — |
   | 2 | Task 2 | HITL | 🔲 Not started | Task 1 |
   ```

3. **Update `.agents/specs/index.md`** to add task count and update status from "Draft" to "Active".
