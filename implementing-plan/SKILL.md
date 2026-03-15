---
name: implementing-plan
description: Implement approved technical plans phase-by-phase with automated and manual verification. Use when the user says "implement the plan", "execute plan.md", or wants to carry out a previously created plan.
metadata:
  version: "1.0"
---

# Implementing a Plan

Implement an approved technical plan from `plan.md`. These plans contain phases with specific changes and success criteria.

## Getting Started

When given a plan path:
- Read the plan completely and check for any existing checkmarks (- [x])
- Read the GitHub issue if provided and all files mentioned in the plan
- If working within a spec context (`docs/specs/<slug>/tasks/<task-slug>/plan.md`), also read the PRD (`../../prd.md`) and research (`../../research.md`) for full context
- Check for related research documents
- **Read files fully** — complete context is essential
- Think deeply about how the pieces fit together
- Create `scratchpad.md` to track progress (reuse this file — no need to preserve prior data)
- Start implementing once the plan is understood

If no plan path provided, look for a plan at `docs/specs/*/tasks/*/plan.md` or `plan.md` at the project root. Ask for confirmation or a GitHub issue reference.

## Implementation Philosophy

Plans are carefully designed, but reality can be messy.

- Follow the plan's intent while adapting to what you find
- Implement each phase fully before moving to the next
- Verify work makes sense in the broader codebase context
- Update checkboxes in the plan as sections are completed

When things don't match the plan exactly, think about why and communicate clearly. The plan is a guide, but judgment matters too.

If a mismatch is encountered:
- STOP and think deeply about why the plan can't be followed
- Report the phase number, what the plan expected vs. what was actually found, and why it matters
- Ask how to proceed

## Verification Approach

After implementing a phase:
- Run the success criteria checks listed in the plan
- Fix any issues before proceeding
- Update progress in both the plan and the scratchpad
- Check off completed items in the plan file itself
- **Pause for human verification**: After completing all automated verification for a phase, inform the human that the phase is ready for manual testing. Include which automated checks passed and which manual verification steps from the plan should be performed.

If instructed to execute multiple phases consecutively, skip the pause until the last phase. Otherwise, assume one phase at a time.

Do not check off manual testing steps until confirmed by the user.

## GitHub Issue Updates

After completing each phase, post a progress comment on the GitHub issue (if provided) noting what was completed and the verification status. After all phases are complete, add a final completion comment and close the issue if appropriate.

## If You Get Stuck

When something isn't working as expected:
- Make sure all relevant code has been read and understood
- Search and explore the codebase thoroughly
- Consider if the codebase has evolved since the plan was written
- Present the mismatch clearly and ask for guidance

## Resuming Work

If the plan has existing checkmarks:
- Trust that completed work is done
- Pick up from the first unchecked item
- Verify previous work only if something seems off

## Completion

When all phases are complete:
- Clear `scratchpad.md` (reuse the file for next session)
- Ensure all checkboxes in the plan are marked complete
- If working within a spec context, update the task status to "✅ Complete" in `docs/specs/<slug>/tasks/index.md`
- Update `docs/specs/index.md` to reflect current task completion counts
- Summarize what was implemented
- Update the GitHub issue with completion status
