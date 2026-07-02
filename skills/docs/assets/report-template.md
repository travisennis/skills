# Documentation Audit: [PROJECT_NAME]

**Generated**: [YYYY-MM-DD]
**Score**: [SUM]/[MAX] ([PCT]%)
**Grade**: [Opaque | Sparse | Navigable | Legible]
**Interpretation**: [1–2 sentences: what this means for an agent working here — can it discover commands, orient, and validate from the docs, or must it reverse-engineer the code?]
**Calibration**: [Repo size + type + audience, and how that shaped expectations — e.g., "Small CLI tool; a strong README can stand in for a docs/ tree, so docs_organization was judged at that scale."]

---

## Scorecard

| # | Dimension | Score | Finding |
|---|-----------|:-----:|---------|
| 1 | `agent_entry_point` | [0–3] | [Concrete evidence: file path / what it contains or lacks] |
| 2 | `progressive_disclosure` | [0–3] | [e.g., "AGENTS.md is 410 lines, ~35% code blocks, links to no docs — monolithic"] |
| 3 | `command_documentation` | [0–3] | [Which commands are documented and where; parseable?] |
| 4 | `architecture_codemap` | [0–3] | [ARCHITECTURE.md present? codemap / invariants / boundaries quality] |
| 5 | `domain_knowledge` | [0–3] | [docs/DOMAIN.md, root DOMAIN.md, or equivalent; what business knowledge is captured or missing] |
| 6 | `docs_organization` | [0–3] | [docs/ tree + index + navigability] |
| 7 | `single_source_of_truth` | [0–3] | [Duplication / contradictions / externalized knowledge] |
| 8 | `decision_records` | [0–3] | [ADRs present, structured, maintained?] |
| 9 | `freshness_enforcement` | [0–3] | [Broken links / staleness / mechanical checks] |

[For any dimension excluded as not-applicable at this repo's scale, mark the Score cell `n/a` and state why in the Finding. Excluded dimensions are left out of the SUM and MAX.]

---

## Strengths

[The highest-scoring, load-bearing documentation worth preserving. Be specific — name the files and what they do well, so a maintainer knows what not to break.]

---

## Prioritized Gaps

Ordered by leverage on agent workflows: lowest scores with the highest impact on an agent's ability to discover, orient, and validate first. Each recommendation is concrete and mechanical.

1. **`[dimension]`** (score [N]) — [What to add or change, specifically. e.g., "Split the 410-line AGENTS.md: keep ~120 lines of identity + commands + directives, move the testing and deployment sections to docs/guides/, link to them."]
2. **`[dimension]`** (score [N]) — [Recommendation]
3. [Continue for the impactful gaps]

---

## Agent Navigation Experience

[A short meta-note from the agent that ran this audit: could you find the build/test/lint commands from the docs alone? Could you locate where a given feature lives using the codemap? Was domain or architectural intent discoverable, or did you have to read source to understand it? This is a direct signal — if this audit struggled to navigate via the docs, a coding agent doing real work will struggle more.]
