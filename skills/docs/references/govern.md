# Govern Mode

Make project documentation maintainable after it has been written: ownership, lifecycle, review habits, and mechanical enforcement. Use this mode when asked to set up documentation governance, define ownership or lifecycle rules, add freshness/link/lint checks, add PR checklist rules for docs, or improve how documentation is managed over time.

## Operating Rules

- Work plan-first for governance or enforcement changes. Present the proposed files, checks, and tradeoffs, then wait for approval before editing. Narrow requested fixes (one checklist item, one stale section) may be edited directly — that is maintain mode's territory.
- Prefer medium enforcement: add or improve checks that fit existing CI/hook infrastructure; propose stronger changes only with explicit approval.
- Do not add new dependencies, CI workflows, or large template sets without explicit approval.
- Preserve existing doc conventions unless they are the source of the problem.
- Every new doc, template, or check must have a concrete owner, use, or verification path.

## Workflow

1. **Calibrate.** Inspect the repo enough to scale the solution: size and shape; existing docs (root markdown, `docs/`, ADRs, runbooks, indexes); existing enforcement (CI workflows, pre-commit hooks, markdown lint config, link checker config, CODEOWNERS, PR templates); existing authority (where setup, architecture, contribution, and agent instructions already live — compare against the authority model in `taxonomy.md`).
2. **Classify.** Lifecycle setup, enforcement setup, template setup (use `doc-templates.md`), or a combination.
3. **Recommend.** Present the current operating model in 3–5 bullets, a proposed file manifest (`create` / `modify` / `leave as-is`), the enforcement level (light / medium / strong), any new dependencies or CI changes, and what will intentionally remain manual. Wait for approval.
4. **Implement.** Edit only the approved manifest. Prefer extending existing CI/hook/config files over creating parallel systems. Document the local command and CI path in the authoritative contributor or docs guide.
5. **Verify.** Run available checks (markdown lint, link checker, the specific command added). If a useful check cannot run, report that clearly with the command that should be run.
6. **Handoff.** Report files changed, rules added, enforcement added or recommended, checks run, and manual follow-ups.

## Lifecycle

### Authority

Assign each topic one authoritative home per the authority model in `taxonomy.md`. When two docs cover the same topic, pick the authority and replace the duplicate with a link or short pointer.

### Lifecycle states

Use lightweight states only when they help:
- **Draft**: useful but not authoritative yet.
- **Current**: authoritative and expected to be followed.
- **Superseded**: replaced by another doc or decision; link to the replacement.
- **Archived**: retained for history; not part of current workflow.

Do not force status metadata onto every doc. Prefer clear placement and links unless the repo already uses frontmatter or status blocks.

### Update triggers

The canonical trigger list lives in `maintain.md` ("When Docs Need Updates"). Use it when writing PR templates or contributor-doc rules. Suggested PR checklist wording:

```md
- [ ] Documentation updated, or not needed because: <reason>
```

### Ownership

Prefer ownership by area, not by individual name: architecture docs to maintainers of the affected subsystem, contributor workflow to repo maintainers, runbooks to operators/on-call owners, public API docs to API owners, agent docs to maintainers responsible for agent workflows. If the repo uses `CODEOWNERS`, add doc ownership there instead of inventing a parallel owner list; otherwise document ownership in `docs/README.md` or `CONTRIBUTING.md`.

### Review rhythm

Use the lightest rhythm that can work: link and lint checks on every PR; review docs when related code changes; periodic manual review only for high-value docs (`ARCHITECTURE.md`, runbooks, public API docs, domain docs). Avoid mandatory `Last reviewed:` metadata unless the repo already uses it or has long-lived operational docs where stale content is dangerous.

### Retiring docs

When a doc is no longer current:
- If it has durable historical value, mark it superseded or archived and link to the replacement.
- If it has no durable value and is not referenced, delete it in the same change that removes its links.
- If unsure, leave it in place but add a clear stale warning and create a follow-up.

Never leave multiple current docs with conflicting instructions.

## Enforcement

### Levels

- **Light**: recommendations only, no new tooling. Use for tiny repos or an advisory pass.
- **Medium**: default. Add or improve checks that fit existing CI/hook infrastructure. Prefer link checking, markdown linting, and PR checklist rules.
- **Strong**: new CI workflows, required checks, generated indexes, or coverage gates. Only with explicit approval.

### Discovery

Before proposing tools, inspect: `.github/workflows/`, `.gitlab-ci.yml`, `justfile`, `Makefile`, `Taskfile.yml`; `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`; `.pre-commit-config.yaml`, `lefthook.yml`, husky config; existing markdown configs (`.markdownlint*`, `.prettierrc`, `dprint.json`, `biome.json`); existing link checkers or docs tooling (`lychee`, `markdown-link-check`, `markdownlint-cli2`, `remark`, `vale`, `mkdocs`, `docusaurus`, `sphinx`). Prefer the repo's existing toolchain over introducing a new one.

### Link checking

- Check relative markdown links to files and anchors where the tool supports it.
- Exclude generated output, vendored docs, dependency directories, and archived historical docs if needed.
- Treat external URL checking as optional; it is slower and less deterministic.
- Plan-first if adding a new dependency; only use an exact command if the dependency exists or the user approves adding it.

### Markdown linting

Use linting to catch broken structure, not to impose taste: valid heading order; duplicate headings when they break anchors. Avoid strict line-length rules unless the repo already enforces them. Exclude generated docs. Do not add a config that will churn unrelated docs.

### Coverage checks

Useful for larger repos: major source directories appear in `ARCHITECTURE.md` or a codemap; multi-doc directories have an index; ADRs have required headings; runbooks have owner, trigger, rollback, and verification sections. Keep custom scripts small and repo-specific; add them only when a generic tool cannot express the rule.

### Freshness checks

Prefer event-based freshness over date-only freshness: code touching public API paths requires public docs review; code touching deployment or ops paths requires runbook review; code touching architecture boundaries requires architecture/ADR review. Date metadata can help with runbooks and compliance docs, but becomes noisy when applied everywhere.

### CI and hooks

Medium default: if CI exists, add docs checks to an existing lint/test workflow when cheap; if pre-commit or lefthook exists, add local doc checks there too; if no CI exists, recommend commands and ask before creating a workflow. Always document the local command to run, the CI job or hook that runs it, and known exclusions and why they exist.
