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
| audit-choices | 1.0 | ✅ | ✅ |
| auditing-codebase | 1.0 | ✅ | ✅ |
| boost | 1.0 | ✅ | ❌ |
| browser-automation | 1.0 | ✅ | ✅ |
| capture-skill | 1.0 | ✅ | ✅ |
| cataloging-sources | 1.0 | ✅ | ✅ |
| cloning-repos-for-research | 1.0 | ✅ | ✅ |
| code-review | 1.0 | ✅ | ✅ |
| create-verification-skill | 1.0 | ✅ | ❌ |
| creating-agents-md | 1.0 | ✅ | ✅ |
| delegating-to-cake | 1.0 | ✅ | ✅ |
| docs | 1.0 | ✅ | ✅ |
| eval-engineering | 1.0 | ✅ | ✅ |
| fetching-web-content | 1.0 | ✅ | ❌ |
| fetching-x-content | 1.0 | ✅ | ✅ |
| fetching-youtube-transcripts | 1.0 | ✅ | ✅ |
| finding-improvements | 1.0 | ✅ | ✅ |
| generating-epubs | 1.0 | ✅ | ✅ |
| grill-for-unknowns | 1.0 | ✅ | ✅ |
| grill-me | 1.0 | ✅ | ❌ |
| grill-with-docs | 1.0 | ✅ | ✅ |
| grooming-backlog | 1.0 | ✅ | ✅ |
| maintain-verification-skill | 1.0 | ✅ | ❌ |
| managing-bookmarks | 1.0 | ✅ | ✅ |
| optimise-github-actions | 1.0 | ✅ | ✅ |
| playground | 1.0 | ✅ | ✅ |
| preflight | 1.0 | ✅ | ✅ |
| prompt-audit | 1.0 | ✅ | ✅ |
| publishing-research-documents | 1.0 | ✅ | ✅ |
| red-teaming | 1.0 | ✅ | ✅ |
| scripting | 1.0 | ✅ | ✅ |
| show-me | 1.0 | ✅ | ✅ |
| show-me-your-work | 1.0 | ✅ | ❌ |
| skill-creator | 1.0 | ✅ | ✅ |
| skill-doctor | 1.0 | ✅ | ✅ |
| tdd | 1.0 | ✅ | ❌ |
| test-audit | 1.0 | ✅ | ✅ |
| using-chrome-cdp | 1.0 | ✅ | ✅ |
| web-searching | 1.0 | ✅ | ❌ |
| writing-clis-for-agents | 1.0 | ✅ | ✅ |

## Notes

- These skills use `user-invocable` and `disable-model-invocation`, which while not supported by the spec is supported by a variety of specific agents, like Cursor, Claude Code, and acai.

## Development Workflow

A structured, spec-driven product-to-code lifecycle (PRD → research → task breakdown → plan → implement → validate → review) lives separately in [`development-workflow/`](development-workflow/README.md). Those workflow skills are kept apart from the active collection but may be revisited in the future. Documentation work lives in the active [`docs`](skills/docs/SKILL.md) skill.

## References

- [Agent Skills Specification](https://agentskills.io/specification.md)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)
