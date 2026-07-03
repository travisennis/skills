# Documentation Rubric

Nine dimensions, each scored on the global scale. Score from **read content**, not filename presence. Audit mode scores all nine; refactor mode uses them as its survey lens; maintain and govern modes use them to judge whether a doc set is healthy.

## Global Scale

- `0` — **absent**: the artifact or property is missing.
- `1` — **weak**: present but partial, thin, stale, inconsistent, or hard to use.
- `2` — **solid**: present and usable by an agent in normal workflows.
- `3` — **strong**: explicit, complete for the repo's size, and mechanically reinforced (CI/hook checks, generated-and-verified, or otherwise hard to let rot).

Calibrate to repo size and type (see `audit.md` Step 1). A dimension that genuinely cannot apply at this repo's scale is excluded from the denominator and noted; a missing-but-expected artifact scores low.

---

## 1. `agent_entry_point`

Is there a dedicated, predictable file that tells an agent how to work in this repo?

Strong evidence:
- `AGENTS.md` at the repo root (strongest, tool-agnostic signal).
- `CLAUDE.md` / `.github/copilot-instructions.md` / `.cursor/rules` — equivalent entry points; a symlink from `CLAUDE.md` to `AGENTS.md` is ideal.
- The file leads with project identity, compatibility surfaces, workflow routing, minimal repository safety rules, and links to authoritative workflow docs, distinct from human-facing README marketing.

Score guidance:
- `0`: no agent-facing instruction file; an agent has only the README to go on.
- `1`: an entry point exists but is near-empty, is only a stub, or is purely human-oriented with nothing agent-specific.
- `2`: a real entry point with project identity, compatibility surfaces, routing, and conventions an agent can act on.
- `3`: the above, plus it is the clear, single front door (e.g., `CLAUDE.md` symlinked to `AGENTS.md`) and is kept current.

---

## 2. `progressive_disclosure`

Is the entry point a concise map that points to deeper sources of truth — not a monolith that crowds context?

Signals to measure on the entry point(s):
- **Length**: no more than ~150 lines is healthy for a root entry point; 60–90 lines is often better when focused docs exist. Growing past ~300 lines is a strong negative.
- **Directive density**: proportion of lines that state rules (must/never/always/avoid/prefer) versus prose explanation. Higher is better.
- **Code-block ratio**: long embedded code/config (examples > ~10 lines, full setup tutorials, API inventories) signals content that belongs in a linked doc.
- **Links out**: does it link to `ARCHITECTURE.md`, `docs/`, guides, ADRs rather than absorbing their content? (Markdown links are correct; eager `@file` imports defeat progressive disclosure.)
- **Layering for large repos**: nested `AGENTS.md`/`CLAUDE.md` in major domain directories so agents load only relevant context.

Score guidance:
- `0`: no entry point to assess, or it is one undifferentiated wall of text.
- `1`: an entry point exists but is bloated, mostly explanation/long code blocks, or duplicates content that lives elsewhere.
- `2`: a concise, directive-led routing layer that links out to deeper docs.
- `3`: concise root map **and** appropriate layering (nested domain files where the repo's size warrants it), with content kept in single sources of truth.

Anti-pattern: the "one giant AGENTS.md." Penalize a single oversized instruction file even if it is thorough — it crowds context, becomes non-guidance, and rots.

---

## 3. `command_documentation`

Can an agent discover how to set up, build, run, test, and lint from the authoritative docs?

Strong evidence:
- Build / run / test / lint commands documented as copy-pasteable one-liners in `CONTRIBUTING.md`, `docs/guides/*`, README, or another clearly authoritative workflow doc.
- Commands resolve to real targets: a `package.json` script, a `Makefile`/`justfile`/`Taskfile` target, a `pyproject.toml` script, an installed CLI.
- A single-command setup / validation path where the ecosystem supports it.
- `AGENTS.md` may route to these docs instead of carrying the commands directly; absence of command catalogs from a concise AGENTS.md is not a defect when the route is clear.

Score guidance:
- `0`: no commands documented; an agent must guess the toolchain.
- `1`: some commands mentioned but incomplete (e.g., build but no test/lint), unparseable, or pointing at targets that do not exist.
- `2`: the core loop (setup, build, test, lint, run as applicable) is documented and parseable.
- `3`: the above, plus a clear validation/"definition of done" path an agent can run to confirm a change.

Verify commands are parseable and reference real targets. **Do not execute them.**

---

## 4. `architecture_codemap`

Does the doc set answer "where is the thing that does X?" and "what am I looking at?" without reading every file?

Strong evidence (`ARCHITECTURE.md` or an equivalent section):
- A **codemap**: significant top-level modules/directories with one-line descriptions, naming key files and types (named, not link-heavy — names survive refactors and are searchable).
- **Invariants**, especially **absences** — rules that hold across the codebase, including things that deliberately do not exist ("no ORM; queries are hand-written in `db/queries/`"; "the model layer never imports the view layer").
- **Boundaries**: public vs internal API, which layers/modules may depend on which.
- Cross-cutting concerns (error handling, logging, auth, config) described at the system level.

Score guidance:
- `0`: no architecture overview; structure must be inferred from the file tree.
- `1`: scattered or shallow structural notes; outdated codemap, or it merely lists directories without orientation.
- `2`: a usable codemap that locates major modules and states key boundaries/invariants.
- `3`: codemap + invariants (including absences) + boundaries, accurate to the current tree and pitched at the right altitude (a country map, not per-function detail).

Anti-patterns: too detailed (reads like API docs), too volatile (rewritten every sprint), link-heavy instead of naming, missing absences.

---

## 5. `domain_knowledge`

Is the business/problem-domain knowledge that is **not** derivable from code captured in-repo?

Strong evidence (`docs/DOMAIN.md`, root `DOMAIN.md`, or equivalent):
- A glossary of business terms mapped to the models/types that implement them.
- Core workflows described from the business perspective (trigger → what happens → outcome), not just code flow.
- Domain relationships in plain English; any regulatory/compliance constraints that explain why code works the way it does.

Score guidance:
- `0`: no domain knowledge captured; intent lives only in maintainers' heads.
- `1`: scattered domain hints (a few README lines, code comments) but no consolidated reference; thin or stub.
- `2`: a real domain reference covering the main concepts and workflows an agent needs to make correct changes.
- `3`: comprehensive, current domain documentation that an engineer (or agent) could read to understand what the product does and why, kept in sync as concepts are added.

For a generic library/tool with little business domain, calibrate expectations down — a clear "what this does and why" in the README can satisfy this; do not demand a DOMAIN.md where there is no domain.

---

## 6. `docs_organization`

Is documentation structured, indexed, and navigable rather than a single sprawling file or an unsorted pile?

Strong evidence:
- A `docs/` (or `doc/`) tree with an **index** (`docs/README.md`, `docs/index.md`, or a docs-site config) that routes the reader.
- Topic docs separated by concern (guardrails, guides, references, design docs, ADRs) and cross-linked.
- A documentation site config (MkDocs, Docusaurus, Sphinx) is a plus but the index/navigability matters more than the tooling.

Score guidance:
- `0`: documentation is one file or a few unorganized files with no index.
- `1`: a docs directory exists but is shallow, sparse, or has no index/routing.
- `2`: an indexed docs tree where an agent can find the right topic.
- `3`: organized into clear categories, indexed, well cross-linked, and easy to navigate for the repo's size.

Calibrate: a tiny repo with a single excellent README is not penalized for lacking a `docs/` tree — note that the README is sufficient at this scale.

**Suggested path forward when structure is largely absent.** Scoring stays agnostic — never dock a repo for not matching a particular shape. But when a project that has outgrown a single README scores `0`–`1` here (no index, no separation by concern), a concrete starting scaffold is more useful than "add structure." Offer the scaffold in `taxonomy.md` as one known-good option to adapt to the repo's ecosystem and size, not as a mandate. Frame it as a way to grow into single-sourced, navigable docs incrementally — start with the index and the one or two categories the repo actually needs. Repos that already meet the goals a different way (a docs-site generator, per-package docs in a monorepo, language-native module docs) need no such suggestion.

---

## 7. `single_source_of_truth`

Does each topic live in exactly one place, with links instead of duplication, and is all of it actually in-repo?

Signals:
- Knowledge is **in-repo**, not offloaded. "See our Confluence/Notion/wiki" as the *only* source for build, architecture, or domain knowledge is a gap — an agent cannot read it.
- No significant duplicated content across the active doc set (the same setup steps in README, CONTRIBUTING, and AGENTS.md that can drift apart).
- No contradictions between docs (entry point says one test command, README says another).
- Canonical/"source of truth" declarations where ambiguity would otherwise exist.
- Authority is framed by ownership per the authority model in `taxonomy.md`: `AGENTS.md` routes, `docs/README.md` indexes, `CONTRIBUTING.md` owns contributor workflow, `ARCHITECTURE.md` owns boundaries, guardrails own risk-specific rules, guides own procedures, and references own stable contracts/facts.

Score guidance:
- `0`: core knowledge lives outside the repo, or docs heavily contradict each other.
- `1`: noticeable duplication or some external-only knowledge that an agent cannot reach.
- `2`: mostly single-sourced and in-repo; minor, low-risk overlap.
- `3`: each topic has one clear home, docs link rather than copy, and nothing load-bearing lives only in an external system.

---

## 8. `decision_records`

Are significant architectural decisions captured as durable, structured artifacts?

Strong evidence:
- `docs/adr/`, `docs/decisions/`, `adr/`, or `decisions/` with numbered ADRs.
- Structured headings: Context, Decision, Consequences, Status, Alternatives Considered.
- Supersession links (an ADR marked superseded-by another) showing the record is maintained over time.
- Equivalent: a maintained design-decisions log or design-docs directory.

Score guidance:
- `0`: no decision records; rationale for architectural choices is undocumented.
- `1`: a decisions directory exists but holds one stub, or rationale appears only as ad-hoc commit messages.
- `2`: real ADRs capturing the major decisions with context and consequences.
- `3`: a maintained ADR practice — multiple records, structured format, supersession tracked, and the entry point points agents to it for new decisions.

Calibrate: a young or tiny repo may legitimately have few decisions to record; judge whether *significant* decisions that were made are captured, not raw count.

---

## 9. `freshness_enforcement`

Are the docs current and coherent, and is that protected mechanically?

Signals:
- **Internal links resolve**: markdown links to other docs and to files point at things that exist.
- **Links are portable**: no absolute or machine-specific link targets (`file:///Users/...`, home-directory paths) — these break on every other checkout and signal unreviewed agent output.
- **Accurate to the tree**: directories/modules named in ARCHITECTURE.md still exist; significant directories are not silently absent from the codemap.
- **No staleness markers** dominating: pervasive `TODO`/`TBD`/"coming soon", or references to removed tooling.
- **Mechanical enforcement** (the differentiator for a `3`): CI or hooks that check link resolution, doc coverage (major dirs have agent docs), or freshness; a documented doc-gardening process. **Verify the check can fail**: a step neutered with `|| true`, `continue-on-error`, or advisory-only output is not enforcement — read the actual invocation, not just the job name. A deferred check ("not yet blocking") counts only if the follow-up to make it blocking is tracked somewhere actionable, not merely noted in prose.

Score guidance:
- `0`: docs are visibly stale or broken — dead links, descriptions that no longer match the code.
- `1`: mostly current but with some broken links or drift, and no enforcement.
- `2`: current and coherent on inspection, but freshness rests entirely on manual diligence.
- `3`: current and coherent **and** protected by mechanical checks (link-check/doc-lint/coverage in CI or hooks).

---

## Output Per Dimension

For each dimension report: `score` (0–3), `confidence` (high/medium/low), a one-line `evidence` note citing a concrete source, and a `next_step` when below 3. Sum scores over applicable dimensions; divide by `3 × applicable_count` for the percentage and map to a grade band (Opaque / Sparse / Navigable / Legible).
