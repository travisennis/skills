---
name: validating-plan
description: Validate implementation against a plan file, verify success criteria, and identify deviations. Use after executing an implementation plan or when asked to check whether a plan was correctly implemented.
metadata:
  version: "1.0"
---

# Validate Plan

Validate that an implementation plan was correctly executed. Verify all success criteria and identify deviations or issues.

## Setup

1. **Locate the plan** — check for a plan at `docs/specs/<slug>/tasks/<task-slug>/plan.md`, fall back to `plan.md` at the project root, use a provided path, or ask the user.
2. **Determine context** — if continuing a session, review what was implemented. If starting fresh, discover what was done through git history and codebase analysis. If working within a spec context, read the PRD (`../../prd.md`) and research (`../../research.md`) for full context.
3. **Gather implementation evidence** — review recent commits and diffs covering the implementation period.
4. **Check for a linked GitHub issue** — if the plan references an issue, retrieve its details.

## Validation Workflow

### Read the Plan

Read the full implementation plan. Identify:
- All files that should have been modified
- All success criteria (automated and manual)
- Key functionality to verify

### Verify Each Phase

For each phase in the plan:

1. **Check completion** — confirm items marked complete are actually done by inspecting the code.
2. **Run automated verification** — execute each command from the plan's verification section. Document pass/fail status and investigate failures.
3. **Assess manual criteria** — list what needs manual testing with clear steps for the user.
4. **Evaluate edge cases** — check error handling, missing validations, and potential regressions.

### Generate Validation Report

```markdown
## Validation Report: [Plan Name]

### Implementation Status
✓ Phase 1: [Name] — Fully implemented
✓ Phase 2: [Name] — Fully implemented
⚠️ Phase 3: [Name] — Partially implemented (see issues)

### Automated Verification Results
✓ Build passes: `[build command]`
✓ Tests pass: `[test command]`
✗ Linting issues: `[lint command]` (3 warnings)

### Code Review Findings

#### Matches Plan:
- Database migration correctly adds [table]
- API endpoints implement specified methods
- Error handling follows plan

#### Deviations from Plan:
- Used different variable names in [file:line]
- Added extra validation in [file:line] (improvement)

#### Potential Issues:
- Missing index on foreign key could impact performance
- No rollback handling in migration

### Manual Testing Required:
1. UI functionality:
   - [ ] Verify [feature] appears correctly
   - [ ] Test error states with invalid input

2. Integration:
   - [ ] Confirm works with existing [component]
   - [ ] Check performance with large datasets

### Recommendations:
- Address linting warnings before merge
- Consider adding integration test for [scenario]
- Document new API endpoints
```

### Update Artifacts

If working within a spec context:
- Update the task status in `docs/specs/<slug>/tasks/index.md` to reflect validation results.
- Update `docs/specs/index.md` to reflect current task completion counts.

If a GitHub issue is linked:
- Add the validation summary as a comment.
- Update issue status — close if approved, keep open if changes are needed.
- Flag any blockers or required changes.

## Validation Checklist

Always verify:
- [ ] All phases marked complete are actually done
- [ ] Automated tests pass
- [ ] Code follows existing patterns
- [ ] No regressions introduced
- [ ] Error handling is robust
- [ ] Documentation updated if needed
- [ ] Manual test steps are clear
