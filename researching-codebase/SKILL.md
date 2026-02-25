---
name: researching-codebase
description: Perform thorough codebase research to produce comprehensive research reports. Use when the user asks to investigate, explore, or understand how a codebase feature, system, or component works before planning or implementation.
metadata:
  version: "1.0"
---

# Codebase Research

Investigate a codebase systematically to produce a detailed research report that informs planning and implementation.

## Rules

- **DO NOT** suggest improvements or changes unless explicitly asked.
- **DO NOT** critique or evaluate code quality.
- **DO NOT** propose refactors, optimizations, or alternatives.
- **DO NOT** guess developer intent or future direction.

Describe **only what exists today**, where it exists, and how it behaves. Your output is technical documentation of the current system, not a review.

## Workflow

### 1. Gather context

- Read any provided files, GitHub issues, or documentation fully before starting.
- Identify the research question and key areas to investigate.
- If the scope is ambiguous, ask one clarifying question before proceeding.

### 2. Investigate

Search the codebase systematically using multiple approaches:

- **File discovery**: Use glob patterns to find relevant files by name or extension.
- **Pattern search**: Use Grep to locate function names, references, and usage patterns.
- **Structure exploration**: List directories to understand project organization.
- **Full reads**: Read discovered files completely to understand implementations.

Answer these questions through investigation:

- What files and components are involved?
- How does the current implementation work?
- What patterns and conventions does the codebase follow?
- What are the integration points and dependencies?
- What are the edge cases and error conditions?
- What test coverage exists, and where are the gaps?

Document cross-cutting concerns where applicable:

- Error handling and failure behavior
- Logging, metrics, or tracing
- Feature flags or conditional execution paths
- Permission, authentication, or authorization checks
- Sync vs async boundaries and side effects

Track progress in `scratchpad.md` as you go. Update it with findings, open questions, and areas still to explore.

### 3. Synthesize

- Cross-reference findings across files to build a complete picture.
- Identify architectural decisions, data flows, and design patterns.
- Note discrepancies, undocumented behavior, or areas requiring inference.
- Clearly distinguish verified facts (with file:line references) from inferences.

### 4. Write the report

Write findings to `research.md` using the template in [references/report-template.md](references/report-template.md).

Every claim must be grounded in code with file path and line references. If something is unclear after investigation, document it as a known gap rather than leaving it ambiguous.

If a GitHub issue was provided, comment on it with a summary of key findings using `gh issue comment`.

Clear `scratchpad.md` once the report is complete.

## Completion criteria

Research is complete when:

- The user's question can be answered directly and unambiguously.
- The primary execution and data flows are fully traced.
- All components that materially affect behavior are documented.
- Further investigation would not change the answer in a meaningful way.

If any of these are not met, keep investigating.

## Quality criteria

- **Answers the research question directly** without tangents.
- **Provides enough context for planning**: someone should be able to create an implementation plan from the report alone.
- **Accurate and verifiable**: all claims grounded in code with references.
- **Identifies patterns and conventions** so planners know what to follow.
- **Highlights edge cases and pitfalls** to prevent issues during implementation.
- **Documents gaps honestly**: what is not covered, what is unclear, what needs further investigation.

## Research patterns

**Architecture research**: Identify core components and responsibilities, map data flows, document integration points, identify conventions.

**Feature research**: Find where similar features exist, understand the data model, trace execution flow, identify configuration and dependencies.

**Bug investigation**: Trace the code path, identify where behavior diverges from expectations, look for edge cases and error conditions.

## Guidelines

- Be skeptical: verify behavior with code rather than assuming.
- Read files completely, never partially.
- Search systematically using multiple tools and approaches.
- Label inferences explicitly as inferences.
- Investigate unclear behavior further rather than leaving open questions in the final report.
