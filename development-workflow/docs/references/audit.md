# Audit Mode

Measure how well a repository's **in-repo documentation** serves coding agents, using the nine reading-based dimensions in `rubric.md`. This mode **reads and judges** — it does not score from file presence alone, and it does not generate or rewrite docs. If the user wants the gaps fixed, hand the report to refactor mode (structure), maintain mode (content updates), or govern mode (enforcement).

## Step 1: Calibrate to the Repository

Documentation expectations scale with repo size and type. Establish this first so you judge proportionally — a 500-line single-purpose library should not be penalized for lacking a `docs/` tree or nested agent files, while a large monorepo that crams everything into one README should be.

- **Size**: roughly count source files / lines and top-level modules. Tiny / small / medium / large.
- **Type**: library, CLI tool, service, monorepo, app. A monorepo raises the bar for layering and nested agent docs.
- **Audience**: is this primarily consumed by other developers as a dependency (API-reference docs matter more) or operated as a system (architecture/domain/runbook docs matter more)?

Record the calibration in one line; it feeds the report's interpretation and which dimensions weigh most.

## Step 2: Discovery Scan

Front-load one pass to collect the active doc set. Run searches in parallel where possible:

- **Agent entry points**: `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules` / `.cursorrules`, and any nested copies deeper in the tree (`**/AGENTS.md`, `**/CLAUDE.md`).
- **Core docs**: `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `DOMAIN.md`, and any root-level `*.md`.
- **Docs tree**: list `docs/` and `doc/`; capture the structure and look for an index (`docs/README.md`, `docs/index.md`, `mkdocs.yml`, `docusaurus.config.*`, a documentation site config). Note `docs/DOMAIN.md`, `docs/DESIGN.md`, `docs/design-docs/`, `docs/guardrails/`, `docs/guides/`, `docs/references/`, and `docs/adr/` when present.
- **Decision records**: `docs/adr/`, `docs/decisions/`, `adr/`, `**/decisions/*.md`, or design-decision sections inside core docs.
- **Command sources** (for cross-checking command docs): `package.json` scripts, `Makefile`/`justfile`/`Taskfile.yml` targets, `pyproject.toml` scripts/tool sections, `Cargo.toml`, `go.mod` + documented commands.
- **Enforcement signals**: CI workflows or pre-commit hooks that run link-checking, doc linting, or doc-coverage/freshness checks (`.github/workflows/*`, `.pre-commit-config.yaml`, `lefthook.yml`, lint configs for markdown).

**Read the prose, not just the filenames.** Open the entry point(s), the README, ARCHITECTURE/DOMAIN docs, and a representative sample of `docs/` files. Quality is judged from content. Never read `.env` contents (possible live secrets); `.env.example`/`.env.template` are safe.

## Step 3: Score Each Dimension

Read `rubric.md` for the nine dimensions, their evidence signals, and the 0–3 scoring guidance. For each dimension:

1. Gather the relevant evidence from Step 2 (make a few extra targeted reads only when the scan missed something).
2. Assign a score on the global scale: `0` absent · `1` weak/partial/stale/inconsistent · `2` solid and usable by an agent · `3` strong, explicit, and mechanically reinforced.
3. Write a one-line evidence note citing a concrete source (file path, section name, a counted measurement such as line count or directive density, or a specific contradiction/broken link).
4. Record confidence (high/medium/low) when the signal is weak or ecosystem-specific.

Calibrate, do not skip: if a dimension genuinely does not apply at this repo's size/type (e.g., nested agent docs in a tiny single-module repo), note that in the dimension's finding and exclude it from the denominator rather than scoring it 0. Excluding is reserved for true non-applicability — a missing-but-expected artifact scores low, it is not excluded.

**Do not execute commands.** For command documentation, verify the documented command is parseable and references a real target (a `package.json` script, a `Makefile` target, an installed tool). Whether it actually runs is out of scope for a docs audit.

## Step 4: Compute the Score

- **Overall** = sum of dimension scores ÷ (3 × number of applicable dimensions), as a percentage. Round for display only.
- **Grade band** from the percentage:
  - **0–24% — Opaque**: almost no agent-facing documentation; agents must reverse-engineer from source.
  - **25–49% — Sparse**: fragments exist but key navigation aids are missing; agents waste significant effort orienting.
  - **50–74% — Navigable**: agents can find commands and orient with friction; depth, single-source-of-truth, or enforcement gaps remain.
  - **75–100% — Legible**: agents discover, navigate, and validate work from in-repo docs with minimal friction.
- Treat the score as a heuristic over the documentation surface, not proof of quality.

## Step 5: Generate the Report

Fill in `assets/report-template.md`:
- Header (project, date, score X/max and percentage, grade band, one-line interpretation, calibration note).
- Dimension scorecard table with score and finding for each dimension.
- Strengths (the highest-scoring, load-bearing docs worth preserving).
- Prioritized gaps: order by leverage on agent workflows, lowest scores with highest impact first. Recommendations must be concrete and mechanical — add this file, add this command block to the authoritative guide, split this oversized entry point, add this index, add this ADR.
  - When the repo has outgrown a single README but has no overarching documentation structure (`docs_organization` scored `0`–`1` with no index or separation by concern), suggest the starter scaffold from `taxonomy.md` as a concrete path forward — explicitly as one adaptable option, not a required layout. Skip this suggestion for tiny repos a README already serves, and for repos that already organize docs well by other means.
- **Agent Navigation Experience**: a short meta-note on whether you — the agent running this audit — could find commands, orient via the codemap, and locate domain/architecture knowledge from the docs alone. If you struggled, a coding agent will too.

Present the report to the user. Offer to write it to a file only if the user asks; this mode assesses, it does not modify the repo.

## Reporting Rules

- Prefer read prose over inference from filenames. A present file with empty or stale content is weak, not solid.
- Cite concrete evidence for every score: a path, a section, a measurement, or a specific defect.
- Distinguish presence from quality. Actionable directives, resolving links, non-duplicative structure, and accurate codemaps are what earn a 2 or 3.
- Contradictions, broken internal links, and stale docs lower scores and confidence — call them out explicitly.
- Keep recommendations mechanical and prioritized by leverage on agent workflows.
- Calibrate to repo size and type; never penalize a small repo for lacking large-repo scaffolding.

## Limits

- Documentation only. Tooling, tests, CI, and security are out of scope except where they enforce documentation health.
- Repo-visible evidence only. Do not assume knowledge exists in external systems the agent cannot read.
- This mode scores and recommends; refactor, maintain, and govern modes do the fixing.
