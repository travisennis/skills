# skills

A collection of specialized skills for coding agents, providing structured workflows for common software engineering tasks.

## Table of Contents

- [Skills](#skills)
- [Notes](#notes)
- [Development Workflow](#development-workflow)
- [References](#references)

## Skills

| Name | Version | User Invocable | Model Invocable |
|------|---------|:-:|:-:|
| agentic-legibility | — | ✅ | ✅ |
| auditing-codebase | — | ✅ | ✅ |
| boost | 1.0 | ✅ | ❌ |
| browser-automation | 1.0 | ✅ | ✅ |
| capture-skill | 1.0 | ✅ | ✅ |
| committing-changes | 1.0 | ✅ | ✅ |
| creating-pull-requests | 1.0 | ❌ | ❌ |
| fetching-web-content | 1.0 | ✅ | ❌ |
| fetching-youtube-transcripts | 1.0 | ✅ | ✅ |
| fixing-merge-conflicts | 1.0 | ❌ | ❌ |
| generating-epubs | — | ✅ | ✅ |
| github-issue-creator | 1.0 | ❌ | ❌ |
| grill-me | 1.0 | ✅ | ❌ |
| managing-bookmarks | — | ✅ | ✅ |
| pdf | 1.0 | ✅ | ✅ |
| planning | 1.0 | ❌ | ❌ |
| playground | 1.0 | ✅ | ✅ |
| pull-request-workflow | 1.0 | ❌ | ❌ |
| readiness-report | — | ✅ | ✅ |
| red-teaming | 1.0 | ✅ | ✅ |
| scripting | 1.0 | ✅ | ✅ |
| simplifying-code | 2.0 | ❌ | ❌ |
| skill-creator | 1.0 | ✅ | ✅ |
| tdd | 1.0 | ✅ | ❌ |
| using-chrome-cdp | — | ✅ | ✅ |
| web-searching | 1.0 | ✅ | ❌ |
| writing-clis-for-agents | 1.0 | ✅ | ✅ |
| xlsx | 1.0 | ✅ | ✅ |

## Notes

- These skills use `user-invocable` and `disable-model-invocation`, which while not supported by the spec is supported by a variety of specific agents, like Cursor, Claude Code, and acai.

## Development Workflow

A structured, spec-driven product-to-code lifecycle (PRD → research → task breakdown → plan → implement → validate → review → docs) lives separately in [`development-workflow/`](development-workflow/README.md). These skills are kept apart from the active collection but may be revisited in the future.

## References

- [Agent Skills Specification](https://agentskills.io/specification.md)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)
