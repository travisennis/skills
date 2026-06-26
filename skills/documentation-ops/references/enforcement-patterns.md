# Enforcement Patterns

Use this reference when adding or improving mechanical checks that keep docs current.

## Enforcement Levels

- **Light**: recommendations only, no new tooling. Use for tiny repos or when the user asks for an advisory pass.
- **Medium**: default. Add or improve checks that fit existing CI/hook infrastructure. Prefer link checking, markdown linting, and PR checklist rules.
- **Strong**: add new CI workflows, required checks, generated indexes, or coverage gates. Use only with explicit approval.

## Discovery

Before proposing tools, inspect:
- `.github/workflows/`, `.gitlab-ci.yml`, `justfile`, `Makefile`, `Taskfile.yml`.
- `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`.
- `.pre-commit-config.yaml`, `lefthook.yml`, `husky` config.
- Existing markdown configs: `.markdownlint*`, `.prettierrc`, `dprint.json`, `biome.json`.
- Existing link checkers: `lychee`, `markdown-link-check`, `markdownlint-cli2`, `remark`, `vale`, `mintlify`, `mkdocs`, `docusaurus`, `sphinx`.

Prefer the repo's existing toolchain over introducing a new one.

## Link Checking

Good default behavior:
- Check relative markdown links to files and anchors where the tool supports it.
- Exclude generated output, vendored docs, dependency directories, and archived historical docs if needed.
- Treat external URL checking as optional; it is slower and less deterministic.

Plan-first if adding a new dependency. If the repo already has a package manager and CI, propose a script such as:

```json
{
  "scripts": {
    "docs:links": "markdown-link-check \"**/*.md\""
  }
}
```

Only use the exact command if the dependency exists or the user approves adding it.

## Markdown Linting

Use linting to catch broken structure, not to impose taste:
- Require valid heading order.
- Catch duplicate headings when they break anchors.
- Avoid strict line-length rules unless the repo already enforces them.
- Exclude generated docs.

Prefer existing formatter/linter conventions. Do not add a config that will churn unrelated docs.

## Coverage Checks

Coverage checks are useful for larger repos:
- Major source directories appear in `ARCHITECTURE.md` or a codemap.
- `docs/design-docs/` has an index when it has multiple docs.
- ADRs have required headings.
- Runbooks have owner, trigger, rollback, and verification sections.

Keep custom scripts small and repo-specific. Add them only when a generic tool cannot express the rule.

## Freshness Checks

Prefer event-based freshness over date-only freshness:
- Code touching public API paths should require public docs review.
- Code touching deployment or ops paths should require runbook review.
- Code touching architecture boundaries should require architecture/ADR review.

Date metadata can help with runbooks and compliance docs, but it becomes noisy when applied everywhere.

## CI and Hooks

Medium default:
- If CI exists, add docs checks to an existing lint/test workflow when cheap.
- If pre-commit or lefthook exists, add local doc checks there too.
- If no CI exists, recommend commands and ask before creating a workflow.

Always document:
- Local command to run.
- CI job or hook that runs it.
- Known exclusions and why they exist.
