# acai-skills

A collection of specialized skills for the acai agent, providing structured workflows for common software engineering tasks.

## Table of Contents

- [Skills](#skills)
- [Notes](#notes)
- [The Complete Development Workflow](#the-complete-development-workflow)
  - [How They Work Together](#how-they-work-together)
  - [Artifact Directory Structure](#artifact-directory-structure)
  - [The Workflow in Practice](#the-workflow-in-practice)
  - [Flexible Usage](#flexible-usage)
  - [Key Artifacts](#key-artifacts)
- [References](#references)

## Skills

| Name | Version | User Invocable | Model Invocable |
|------|---------|:-:|:-:|
| agentic-legibility | — | ✅ | ✅ |
| auditing-codebase | — | ✅ | ✅ |
| boost | 1.0 | ✅ | ❌ |
| breaking-down-prd | 3.0 | ❌ | ❌ |
| browser-automation | 1.0 | ✅ | ✅ |
| capture-skill | 1.0 | ✅ | ✅ |
| committing-changes | 1.0 | ✅ | ✅ |
| creating-plans | 2.0 | ❌ | ❌ |
| creating-pull-requests | 1.0 | ❌ | ❌ |
| deslop | 1.0 | ✅ | ❌ |
| fetching-web-content | 1.0 | ✅ | ❌ |
| fetching-youtube-transcripts | 1.0 | ✅ | ✅ |
| finalizing-bugs | 1.0 | ✅ | ✅ |
| finding-bugs | 1.0 | ❌ | ❌ |
| fixing-merge-conflicts | 1.0 | ❌ | ❌ |
| generating-epubs | — | ✅ | ✅ |
| github-issue-creator | 1.0 | ❌ | ❌ |
| grill-me | 1.0 | ✅ | ❌ |
| implementing-plan | 1.0 | ❌ | ❌ |
| iterating-plan | 1.0 | ❌ | ❌ |
| managing-bookmarks | — | ✅ | ✅ |
| managing-docs | 1.0 | ❌ | ❌ |
| managing-tickets | 1.0 | ❌ | ❌ |
| pdf | 1.0 | ✅ | ✅ |
| planning | 1.0 | ❌ | ❌ |
| playground | 1.0 | ✅ | ✅ |
| pull-request-workflow | 1.0 | ❌ | ❌ |
| readiness-report | — | ✅ | ✅ |
| red-teaming | 1.0 | ✅ | ✅ |
| researching-codebase | 1.0 | ❌ | ❌ |
| reviewing-code | 1.0 | ❌ | ❌ |
| scripting | 1.0 | ✅ | ✅ |
| simplifying-code | 2.0 | ❌ | ❌ |
| skill-creator | 1.0 | ✅ | ✅ |
| tdd | 1.0 | ✅ | ❌ |
| using-chrome-cdp | — | ✅ | ✅ |
| validating-plan | 1.0 | ❌ | ❌ |
| web-searching | 1.0 | ✅ | ❌ |
| writing-a-prd | 2.0 | ❌ | ❌ |
| writing-clis-for-agents | 1.0 | ✅ | ✅ |
| xlsx | 1.0 | ✅ | ✅ |

## Notes

- These skills use `user-invocable` and `disable-model-invocation`, which while not supported by the spec is supported by a variety of specific agents, like Cursor, Claude Code, and acai.

## The Complete Development Workflow

Nine skills work together to form a comprehensive product-to-code lifecycle—from defining what to build to shipping validated code. Spec artifacts (PRDs, research, plans, reviews) are ephemeral working documents persisted to `.agents/specs/` (gitignored, not committed to the repo).

```
                         ┌─────────────────────┐
                         │   Writing a         │
                         │   PRD               │
                         │   (Define WHAT)     │
                         └──────────┬──────────┘
                                    │
                                    ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Researching        │────▶│  Breaking Down      │
│  Codebase           │     │  PRD                │
│  (Investigate)      │     │  (Create Tasks)     │
└─────────────────────┘     └──────────┬──────────┘
                                       │
                          ┌────────────┼────────────┐
                          ▼            ▼            ▼
                    ┌──────────┐ ┌──────────┐ ┌──────────┐
                    │ Task 1   │ │ Task 2   │ │ Task N   │
                    │ plan.md  │ │ plan.md  │ │ plan.md  │
                    └────┬─────┘ └────┬─────┘ └────┬─────┘
                         │            │            │
                         ▼            ▼            ▼
                    ┌──────────────────────────────────┐
                    │  Per-task lifecycle:              │
                    │  Plan → Implement → Validate →   │
                    │  Review                           │
                    └────────────────┬─────────────────┘
                                     │
                                     ▼
                    ┌──────────────────────────────────┐
                     │  Managing Docs                    │
                     │  (Audit & update all project docs)│
                     └──────────────────────────────────┘
```

### How They Work Together

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| **writing-a-prd** | Define product requirements, user stories, and success criteria | At the start—when you need to align on what to build |
| **researching-codebase** | Deep investigation of existing code to understand how things work | Before planning—when you need to understand the codebase, a feature, or a system |
| **breaking-down-prd** | Break a PRD into vertical-slice tasks with local tracking | After the PRD—when you need to decompose work into independently-implementable tasks |
| **creating-plans** | Create detailed, actionable implementation plans per task | After research—when you're ready to design a solution for a specific task |
| **iterating-plan** | Update existing plans based on new information or feedback | When requirements change or plans need refinement |
| **implementing-plan** | Execute approved plans phase-by-phase | After planning—when it's time to write code |
| **validating-plan** | Verify that implementation matches the plan and PRD requirements | After implementation—before calling work complete |
| **reviewing-code** | Comprehensive code review of changes | After changes are made—whether from a plan or ad-hoc work |
| **managing-docs** | Validate and update all project documentation — specs, architecture, design docs, README | After completing work, before marking done, or periodic audits |

### Artifact Directory Structure

Spec artifacts are ephemeral working documents stored in `.agents/specs/` (gitignored). They are not committed to the repository.

```
.agents/
└── specs/
    ├── index.md                        # Catalog of all specs (auto-maintained)
    └── <slug>/                         # e.g. "user-auth-rbac"
        ├── prd.md                      # Product requirements
        ├── research.md                 # Codebase investigation findings
        ├── tasks.md                    # Task breakdown with details + status
        └── <task-slug>/                # e.g. "add-role-model"
            ├── plan.md                 # Implementation plan (living doc)
            └── review.md               # Code review (kept if substantive)
```

Slugs are derived from content (feature name for specs, task title for tasks): kebab-case, max ~50 chars, human-readable.

### The Workflow in Practice

#### 1. Define Requirements (`writing-a-prd`)
Start by capturing what needs to be built:
- Problem statements from the user's perspective
- Comprehensive user stories covering all aspects
- Success criteria and key metrics
- What's in scope and what's explicitly out of scope

**Output:** `.agents/specs/<slug>/prd.md` — Product requirements document.

Creates the spec directory and adds an entry to `.agents/specs/index.md`.

#### 2. Research (`researching-codebase`)
Investigate the codebase to understand:
- What exists today and how it works
- Patterns, conventions, and architectural decisions
- Integration points and dependencies
- Edge cases and potential pitfalls

**Output:** `.agents/specs/<slug>/research.md` — A comprehensive report with file references and findings. Falls back to `research.md` at the project root for ad-hoc research without a spec context.

#### 3. Break Down (`breaking-down-prd`)
Decompose the PRD into independently-implementable vertical slices:
- Each task cuts through all integration layers end-to-end
- Each task is demoable or verifiable on its own
- Creates local task directories and tracking files

**Output:** `.agents/specs/<slug>/tasks.md` — Single file with all tasks, their details, and a summary table with status.

#### 4. Plan (`creating-plans`)
Use PRD requirements and research findings to create a detailed implementation plan for each task:
- Break work into phases with clear deliverables
- Define specific success criteria (automated and manual)
- Identify files to modify and integration points
- Document what you're NOT doing (scope boundaries)

**Output:** `.agents/specs/<slug>/<task-slug>/plan.md` — A living document that guides implementation. Falls back to `plan.md` at the project root for standalone plans.

#### 5. Refine (`iterating-plan`)
As work progresses or requirements change:
- Update plans based on new discoveries
- Adjust phases or success criteria
- Reference PRD constraints to ensure technical changes don't violate product requirements
- Keep the plan synchronized with reality

**Output:** Updated `plan.md` in-place with revision notes.

#### 6. Implement (`implementing-plan`)
Execute the plan phase-by-phase:
- Work through each phase completely before moving on
- Run verification steps after each phase
- Update checkboxes in the plan as you go
- Pause for manual verification when needed

**Output:** Working code + updated `plan.md` with progress tracked. Updates task status in `tasks.md`.

#### 7. Validate (`validating-plan`)
Verify the implementation against **both** the plan and the PRD:
- Confirm all technical success criteria are met
- Verify product requirements from the PRD are satisfied
- Run automated verification commands
- Identify any deviations from the plan
- Document what needs manual testing

**Output:** Validation report with pass/fail status. Updates task status in `tasks.md`.

#### 8. Review (`reviewing-code`)
Assess code quality systematically:
- Check correctness, security, performance, and maintainability
- Verify test coverage and documentation
- Identify bugs and edge cases
- Provide actionable feedback

**Output:** `.agents/specs/<slug>/<task-slug>/review.md` when working within a spec context. Falls back to `review.md` at the project root for standalone reviews. If a review triggers plan changes, the plan is updated with a note referencing the review.

#### 9. Manage Docs (`managing-docs`)
Audit and update all project documentation — specs and project-level docs:
- Run automated checks (broken links, missing indexes, orphaned directories, stale ARCHITECTURE.md)
- Verify lifecycle completeness (every spec has expected artifacts for its status)
- Check project docs (ARCHITECTURE.md sections, design-docs index, README)
- Update stale docs based on recent changes

**Output:** Documentation health report summarizing errors, warnings, and suggested fixes. Updates indexes, statuses, and project docs as needed.

### Flexible Usage

While these skills form a complete workflow, they can be used independently:

- **PRD only:** Use `writing-a-prd` to define requirements for someone else to implement
- **Research only:** Use `researching-codebase` to understand a codebase without implementing anything
- **Plan only:** Use `creating-plans` to design a solution for an existing PRD or task
- **Review only:** Use `reviewing-code` on any changes, regardless of whether they followed a plan
- **Validate existing work:** Use `validating-plan` to check if past work matches requirements
- **Audit docs:** Use `managing-docs` to check all project documentation is present, consistent, and up to date

All skills support both **spec-linked** mode (artifacts in `.agents/specs/`) and **standalone** mode (artifacts at project root) for flexibility.

### Key Artifacts

| Artifact | Location | Purpose | Created By |
|----------|----------|---------|------------|
| `prd.md` | `.agents/specs/<slug>/` | Product requirements—reference for what to build | `writing-a-prd` |
| `research.md` | `.agents/specs/<slug>/` or root | Technical documentation of current system state | `researching-codebase` |
| `tasks.md` | `.agents/specs/<slug>/tasks.md` | Task breakdown with details + status | `breaking-down-prd` |
| `plan.md` | `.agents/specs/<slug>/<task-slug>/` | Living implementation guide with phases and success criteria | `creating-plans`, `iterating-plan` |
| `review.md` | `.agents/specs/<slug>/<task-slug>/` | Structured code review findings | `reviewing-code` |
| `index.md` | `.agents/specs/` | Catalog of all specs with status | All skills (auto-maintained) |
| `scratchpad.md` | Project root | Working notes during research/implementation (ephemeral) | All skills (reused) |

## References

- [Agent Skills Specification](https://agentskills.io/specification.md)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)
