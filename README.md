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
| grooming-backlog | 1.0 | ✅ | ✅ |
| maintain-verification-skill | 1.0 | ✅ | ❌ |
| managing-bookmarks | 1.0 | ✅ | ✅ |
| merge-risk | 1.0 | ✅ | ✅ |
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

## Choosing Between Related Skills

Every skill is independently installable; none requires another skill to be present.
Use this map when several skills could fit.

- **Reviewing a change:** `code-review` finds defects. `preflight` is the author-side
  readiness pass. `merge-risk` decides whether the evidence supports merging.
  `red-teaming` is an adversarial whole-repository or named-boundary pass. `test-audit`
  judges whether tests earn their keep. `tdd` is the test-first implementation loop.
- **Planning:** `grill-me` is a short one-question-at-a-time interview.
  `grill-for-unknowns` is the full planning pass, including docs-grounded grilling and
  domain modeling.
- **Web:** `web-searching` finds results. `fetching-web-content` reads static pages.
  `browser-automation` launches a disposable browser. `using-chrome-cdp` drives the
  user's live Chrome.
- **Documentation:** `creating-agents-md` writes a starter root `AGENTS.md`. `docs`
  audits, restructures, writes, and governs a documentation set.
- **Skill authoring:** `skill-creator` builds a skill. `capture-skill` turns the current
  conversation into one. `prompt-audit` removes dated prompting patterns.
  `skill-doctor` grades installed skills from session history.
- **Research publishing:** `cataloging-sources` files an external source by URL.
  `publishing-research-documents` publishes a written document.
- **Codebase audit:** `auditing-codebase` reports git-history diagnostics.
  `finding-improvements` turns a survey into a prioritized backlog.
- **Verification:** `create-verification-skill` generates a project-local proof harness.
  `maintain-verification-skill` keeps its feature map honest.

## Notes

- These skills use `user-invocable` and `disable-model-invocation`, which while not supported by the spec is supported by a variety of specific agents, like Cursor, Claude Code, and acai.

## Development Workflow

A structured, spec-driven product-to-code lifecycle (PRD → research → task breakdown → plan → implement → validate → review) lives separately in [`development-workflow/`](development-workflow/README.md). Those workflow skills are kept apart from the active collection but may be revisited in the future. Documentation work lives in the active [`docs`](skills/docs/SKILL.md) skill.

## References

- [Agent Skills Specification](https://agentskills.io/specification.md)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)

## License

MIT. Third-party skill material retains its own license; see
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
