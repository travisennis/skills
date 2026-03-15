# acai-skills

A collection of specialized skills for the acai agent, providing structured workflows for common software engineering tasks.

## Notes

- These skills use `user-invocable` and `disable-model-invocation`, which while not supported by the spec is supported by a variety of specific agents, like Cursor, Claude Code, and acai.

## The Complete Development Workflow

Nine skills work together to form a comprehensive product-to-code lifecycle—from defining what to build to shipping validated code. All durable artifacts are persisted to `docs/specs/` for posterity.

```
                         ┌─────────────────────┐
                         │   Writing a         │
                         │   PRD               │
                         │   (Define WHAT)     │
                         └──────────┬──────────┘
                                    │
                                    ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Researching        │────▶│  Converting PRD     │
│  Codebase           │     │  to Issues          │
│  (Investigate)      │     │  (Break down)       │
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
                    │  Validate Workflow                │
                    │  (Audit docs/specs/ integrity)   │
                    └──────────────────────────────────┘
```

### How They Work Together

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| **writing-a-prd** | Define product requirements, user stories, and success criteria | At the start—when you need to align on what to build |
| **researching-codebase** | Deep investigation of existing code to understand how things work | Before planning—when you need to understand the codebase, a feature, or a system |
| **converting-prd-to-issues** | Break a PRD into vertical-slice tasks with GitHub issues | After the PRD—when you need to decompose work into independently-grabbable tasks |
| **creating-plans** | Create detailed, actionable implementation plans per task | After research—when you're ready to design a solution for a specific task |
| **iterating-plan** | Update existing plans based on new information or feedback | When requirements change or plans need refinement |
| **implementing-plan** | Execute approved plans phase-by-phase | After planning—when it's time to write code |
| **validating-plan** | Verify that implementation matches the plan and PRD requirements | After implementation—before calling work complete |
| **reviewing-code** | Comprehensive code review of changes | After changes are made—whether from a plan or ad-hoc work |
| **validating-workflow** | Validate docs/specs/ integrity, consistency, and completeness | After completing work, before marking done, or periodic audits |

### Artifact Directory Structure

All durable artifacts are persisted within the project's `docs/specs/` directory:

```
docs/
├── specs/
│   ├── index.md                        # Catalog of all specs (auto-maintained)
│   └── <slug>/                         # e.g. "user-auth-rbac"
│       ├── prd.md                      # Product requirements (durable)
│       ├── research.md                 # Codebase investigation findings
│       └── tasks/
│           ├── index.md                # Task breakdown + status tracking
│           └── <task-slug>/            # e.g. "add-role-model"
│               ├── plan.md             # Implementation plan (living doc)
│               └── review.md           # Code review (kept if substantive)
```

Slugs are derived from content (feature name for specs, task title for tasks): kebab-case, max ~50 chars, human-readable.

### The Workflow in Practice

#### 1. Define Requirements (`writing-a-prd`)
Start by capturing what needs to be built:
- Problem statements from the user's perspective
- Comprehensive user stories covering all aspects
- Success criteria and key metrics
- What's in scope and what's explicitly out of scope

**Output:** `docs/specs/<slug>/prd.md` — A durable product requirements document.

Creates the spec directory and adds an entry to `docs/specs/index.md`.

#### 2. Research (`researching-codebase`)
Investigate the codebase to understand:
- What exists today and how it works
- Patterns, conventions, and architectural decisions
- Integration points and dependencies
- Edge cases and potential pitfalls

**Output:** `docs/specs/<slug>/research.md` — A comprehensive report with file references and findings. Falls back to `research.md` at the project root for ad-hoc research without a spec context.

#### 3. Break Down (`converting-prd-to-issues`)
Decompose the PRD into independently-grabbable vertical slices:
- Each task cuts through all integration layers end-to-end
- Each task is demoable or verifiable on its own
- Creates GitHub issues for tracking

**Output:** `docs/specs/<slug>/tasks/index.md` — Task breakdown with dependency graph and status tracking. Creates a subdirectory for each task.

#### 4. Plan (`creating-plans`)
Use PRD requirements and research findings to create a detailed implementation plan for each task:
- Break work into phases with clear deliverables
- Define specific success criteria (automated and manual)
- Identify files to modify and integration points
- Document what you're NOT doing (scope boundaries)

**Output:** `docs/specs/<slug>/tasks/<task-slug>/plan.md` — A living document that guides implementation. Falls back to `plan.md` at the project root for standalone plans.

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

**Output:** Working code + updated `plan.md` with progress tracked. Updates task status in `tasks/index.md`.

#### 7. Validate (`validating-plan`)
Verify the implementation against **both** the plan and the PRD:
- Confirm all technical success criteria are met
- Verify product requirements from the PRD are satisfied
- Run automated verification commands
- Identify any deviations from the plan
- Document what needs manual testing

**Output:** Validation report with pass/fail status. Updates task status in `tasks/index.md`.

#### 8. Review (`reviewing-code`)
Assess code quality systematically:
- Check correctness, security, performance, and maintainability
- Verify test coverage and documentation
- Identify bugs and edge cases
- Provide actionable feedback

**Output:** `docs/specs/<slug>/tasks/<task-slug>/review.md` when working within a spec context (persisted for posterity). Falls back to `review.md` at the project root for standalone reviews. If a review triggers plan changes, the plan is updated with a note referencing the review.

#### 9. Validate Workflow (`validating-workflow`)
Audit the entire `docs/specs/` artifact system for integrity and consistency:
- Run automated checks (broken links, missing indexes, orphaned directories)
- Verify lifecycle completeness (every spec has expected artifacts for its status)
- Check status coherence (artifact presence matches reported status)
- Detect stale specs that need attention

**Output:** Validation report summarizing errors, warnings, and suggested fixes. Updates indexes and statuses as needed.

### Flexible Usage

While these skills form a complete workflow, they can be used independently:

- **PRD only:** Use `writing-a-prd` to define requirements for someone else to implement
- **Research only:** Use `researching-codebase` to understand a codebase without implementing anything
- **Plan only:** Use `creating-plans` to design a solution for an existing PRD or issue
- **Review only:** Use `reviewing-code` on any changes, regardless of whether they followed a plan
- **Validate existing work:** Use `validating-plan` to check if past work matches requirements
- **Audit docs:** Use `validating-workflow` to check all artifacts are present, consistent, and up to date

All skills support both **spec-linked** mode (artifacts in `docs/specs/`) and **standalone** mode (artifacts at project root) for flexibility.

### Key Artifacts

| Artifact | Location | Purpose | Created By |
|----------|----------|---------|------------|
| `prd.md` | `docs/specs/<slug>/` | Product requirements—durable reference for what to build | `writing-a-prd` |
| `research.md` | `docs/specs/<slug>/` or root | Technical documentation of current system state | `researching-codebase` |
| `tasks/index.md` | `docs/specs/<slug>/tasks/` | Task breakdown with status tracking | `converting-prd-to-issues` |
| `plan.md` | `docs/specs/<slug>/tasks/<task>/` or root | Living implementation guide with phases and success criteria | `creating-plans`, `iterating-plan` |
| `review.md` | `docs/specs/<slug>/tasks/<task>/` or root | Structured code review findings | `reviewing-code` |
| `index.md` | `docs/specs/` | Catalog of all specs with status | All skills (auto-maintained) |
| `scratchpad.md` | Project root | Working notes during research/implementation (ephemeral) | All skills (reused) |

## References

- [Agent Skills Specification](https://agentskills.io/specification.md)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)
