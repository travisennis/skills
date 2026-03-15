# acai-skills

A collection of specialized skills for the acai agent, providing structured workflows for common software engineering tasks.

## Notes

- These skills use `user-invocable` and `disable-model-invocation`, which while not supported by the spec is supported by a variety of specific agents, like Cursor, Claude Code, and acai.

## The Complete Development Workflow

Six skills work together to form a comprehensive software development lifecycle—from understanding a codebase to shipping validated code:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Researching        │────▶│  Creating           │────▶│  Iterating          │
│  Codebase           │     │  Plans              │     │  Plan               │
│  (Investigate)      │     │  (Design)           │     │  (Refine)           │
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
| **researching-codebase** | Deep investigation of existing code to understand how things work | Before planning—when you need to understand the codebase, a feature, or a system |
| **creating-plans** | Create detailed, actionable implementation plans | After research—when you're ready to design a solution |
| **iterating-plan** | Update existing plans based on new information or feedback | When requirements change or plans need refinement |
| **implementing-plan** | Execute approved plans phase-by-phase | After planning—when it's time to write code |
| **validating-plan** | Verify that implementation matches the plan | After implementation—before calling work complete |
| **reviewing-code** | Comprehensive code review of changes | After changes are made—whether from a plan or ad-hoc work |

### The Workflow in Practice

#### 1. Research (`researching-codebase`)
Start by investigating the codebase to understand:
- What exists today and how it works
- Patterns, conventions, and architectural decisions
- Integration points and dependencies
- Edge cases and potential pitfalls

**Output:** `research.md` — A comprehensive report with file references and findings.

#### 2. Plan (`creating-plans`)
Use research findings to create a detailed implementation plan:
- Break work into phases with clear deliverables
- Define specific success criteria (automated and manual)
- Identify files to modify and integration points
- Document what you're NOT doing (scope boundaries)

**Output:** `plan.md` — A living document that guides implementation.

#### 3. Refine (`iterating-plan`)
As work progresses or requirements change:
- Update plans based on new discoveries
- Adjust phases or success criteria
- Add new constraints or remove outdated ones
- Keep the plan synchronized with reality

**Output:** Updated `plan.md` with revision notes.

#### 4. Implement (`implementing-plan`)
Execute the plan phase-by-phase:
- Work through each phase completely before moving on
- Run verification steps after each phase
- Update checkboxes in the plan as you go
- Pause for manual verification when needed

**Output:** Working code + updated `plan.md` with progress tracked.

#### 5. Validate (`validating-plan`)
Verify the implementation against the plan:
- Confirm all success criteria are met
- Run automated verification commands
- Identify any deviations from the plan
- Document what needs manual testing

**Output:** Validation report with pass/fail status and recommendations.

#### 6. Review (`reviewing-code`)
Assess code quality systematically:
- Check correctness, security, performance, and maintainability
- Verify test coverage and documentation
- Identify bugs and edge cases
- Provide actionable feedback

**Output:** `review.md` with structured findings and recommendations.

### Flexible Usage

While these skills form a complete workflow, they can be used independently:

- **Research only:** Use `researching-codebase` to understand a codebase without implementing anything
- **Plan only:** Use `creating-plans` to design a solution for someone else to implement
- **Review only:** Use `reviewing-code` on any changes, regardless of whether they followed a plan
- **Validate existing work:** Use `validating-plan` to check if past work matches requirements

### Key Artifacts

| Artifact | Purpose | Created By |
|----------|---------|------------|
| `research.md` | Technical documentation of current system state | `researching-codebase` |
| `plan.md` | Living implementation guide with phases and success criteria | `creating-plans`, `iterating-plan` |
| `scratchpad.md` | Working notes during research/implementation (temporary) | All skills (reused) |
| `review.md` | Structured code review findings | `reviewing-code` |

## References

- [Agent Skills Specification](https://agentskills.io/specification.md)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)
