# acai-skills

A collection of specialized skills for the acai agent, providing structured workflows for common software engineering tasks.

## Notes

- These skills use `user-invocable` and `disable-model-invocation`, which while not supported by the spec is supported by a variety of specific agents, like Cursor, Claude Code, and acai.

## The Complete Development Workflow

Seven skills work together to form a comprehensive product-to-code lifecycle—from defining what to build to shipping validated code:

```
                         ┌─────────────────────┐
                         │   Writing a         │
                         │   PRD               │
                         │   (Define WHAT)     │
                         └──────────┬──────────┘
                                    │
                                    ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Researching        │────▶│  Creating           │────▶│  Iterating          │
│  Codebase           │     │  Plans              │     │  Plan               │
│  (Investigate)      │     │  (Design HOW)       │     │  (Refine)           │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
                                                          │
                                                          ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Reviewing          │◄────│  Validating         │◄────│  Implementing       │
│  Code               │     │  Plan               │     │  Plan               │
│  (Assess)           │     │  (Verify)           │     │  (Execute)          │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

### How They Work Together

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| **writing-a-prd** | Define product requirements, user stories, and success criteria | At the start—when you need to align on what to build |
| **researching-codebase** | Deep investigation of existing code to understand how things work | Before planning—when you need to understand the codebase, a feature, or a system |
| **creating-plans** | Create detailed, actionable implementation plans | After research—when you're ready to design a solution |
| **iterating-plan** | Update existing plans based on new information or feedback | When requirements change or plans need refinement |
| **implementing-plan** | Execute approved plans phase-by-phase | After planning—when it's time to write code |
| **validating-plan** | Verify that implementation matches the plan and PRD requirements | After implementation—before calling work complete |
| **reviewing-code** | Comprehensive code review of changes | After changes are made—whether from a plan or ad-hoc work |

### The Workflow in Practice

#### 1. Define Requirements (`writing-a-prd`)
Start by capturing what needs to be built:
- Problem statements from the user's perspective
- Comprehensive user stories covering all aspects
- Success criteria and key metrics
- What's in scope and what's explicitly out of scope

**Output:** `prd.md` — A durable product requirements document.

**One PRD → Multiple Issues:** Large features often result in multiple GitHub issues:
- Create a parent issue for the PRD itself
- Create child issues for each major deliverable or phase
- Each issue gets its own technical plan while referencing the same PRD

#### 2. Research (`researching-codebase`)
Investigate the codebase to understand:
- What exists today and how it works
- Patterns, conventions, and architectural decisions
- Integration points and dependencies
- Edge cases and potential pitfalls

**Output:** `research.md` — A comprehensive report with file references and findings.

#### 3. Plan (`creating-plans`)
Use PRD requirements and research findings to create a detailed implementation plan:
- Break work into phases with clear deliverables
- Define specific success criteria (automated and manual)
- Identify files to modify and integration points
- Document what you're NOT doing (scope boundaries)

**Output:** `plan.md` — A living document that guides implementation.

#### 4. Refine (`iterating-plan`)
As work progresses or requirements change:
- Update plans based on new discoveries
- Adjust phases or success criteria
- Reference PRD constraints to ensure technical changes don't violate product requirements
- Keep the plan synchronized with reality

**Output:** Updated `plan.md` with revision notes.

#### 5. Implement (`implementing-plan`)
Execute the plan phase-by-phase:
- Work through each phase completely before moving on
- Run verification steps after each phase
- Update checkboxes in the plan as you go
- Pause for manual verification when needed

**Output:** Working code + updated `plan.md` with progress tracked.

#### 6. Validate (`validating-plan`)
Verify the implementation against **both** the plan and the PRD:
- Confirm all technical success criteria are met
- Verify product requirements from the PRD are satisfied
- Run automated verification commands
- Identify any deviations from the plan
- Document what needs manual testing

**Output:** Validation report with pass/fail status and recommendations.

#### 7. Review (`reviewing-code`)
Assess code quality systematically:
- Check correctness, security, performance, and maintainability
- Verify test coverage and documentation
- Identify bugs and edge cases
- Provide actionable feedback

**Output:** `review.md` with structured findings and recommendations.

### Flexible Usage

While these skills form a complete workflow, they can be used independently:

- **PRD only:** Use `writing-a-prd` to define requirements for someone else to implement
- **Research only:** Use `researching-codebase` to understand a codebase without implementing anything
- **Plan only:** Use `creating-plans` to design a solution for an existing PRD or issue
- **Review only:** Use `reviewing-code` on any changes, regardless of whether they followed a plan
- **Validate existing work:** Use `validating-plan` to check if past work matches requirements

### Key Artifacts

| Artifact | Purpose | Created By |
|----------|---------|------------|
| `prd.md` | Product requirements document—durable reference for what to build | `writing-a-prd` |
| `research.md` | Technical documentation of current system state | `researching-codebase` |
| `plan.md` | Living implementation guide with phases and success criteria | `creating-plans`, `iterating-plan` |
| `scratchpad.md` | Working notes during research/implementation (temporary) | All skills (reused) |
| `review.md` | Structured code review findings | `reviewing-code` |

## References

- [Agent Skills Specification](https://agentskills.io/specification.md)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)
