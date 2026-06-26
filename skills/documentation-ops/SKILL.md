---
name: documentation-ops
description: Set up and maintain the operating system around committed project documentation. Use when asked to update docs, make docs stay current, add documentation governance, define documentation ownership or lifecycle rules, add doc freshness/link/lint checks, create documentation templates or standards, add PR checklist rules for docs, or improve how project documentation is managed over time. Scope is committed project documentation, not ephemeral .agents/specs working artifacts.
---

# Documentation Ops

Use this skill to make project documentation maintainable after it has been written. It covers ownership, lifecycle, templates, review habits, and medium-strength mechanical enforcement.

This skill is standalone. Do not require `documentation-audit`, `refactoring-agents-docs`, or `managing-docs` unless the user explicitly asks to combine skills.

## Scope

In scope:
- Committed project docs: `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `docs/`, ADRs, guides, references, runbooks, public API docs, and documentation CI/config.
- Documentation governance: authority, ownership, review cadence, stale-doc handling, templates, and PR expectations.
- Mechanical freshness checks: link checking, markdown linting, doc coverage checks, and CI/hook integration.

Out of scope:
- `.agents/specs/` and other ephemeral planning artifacts. Leave those to the repo's existing workflow skills.
- Broad code readiness, test quality, security review, or CI hardening except where they directly enforce documentation.
- Rewriting an entire docs hierarchy unless the user asks for that; use a refactor-focused skill for large structural rewrites.

## Operating Rules

- Work plan-first for governance or enforcement changes. Present the proposed files, checks, and tradeoffs, then wait for approval before editing.
- Make direct edits only for narrow requested documentation fixes, such as adding one missing PR checklist item or updating one stale doc section.
- Prefer medium enforcement: add or improve doc checks when the repo already has CI or hook infrastructure; propose stronger changes when absent.
- Do not add new dependencies, CI workflows, or large template sets without explicit approval.
- Keep docs single-sourced. Add links or authority notes instead of duplicating procedure text across files.
- Do not create empty bureaucracy. Every new doc, template, or check must have a concrete owner, use, or verification path.
- Preserve existing doc conventions unless they are the source of the problem.

## Workflow

### 1. Calibrate

Inspect the repo enough to scale the solution:
- Size and shape: tiny library, app, service, CLI, monorepo, docs-heavy product, etc.
- Existing docs: root markdown files, `docs/`, ADRs, runbooks, public docs, generated docs, doc indexes.
- Existing enforcement: CI workflows, pre-commit hooks, markdown lint config, link checker config, CODEOWNERS, PR templates.
- Existing authority: where setup, architecture, contribution, and agent instructions already live.

Do not read secrets. Never open `.env`; `.env.example` and templates are safe.

### 2. Classify the Request

Use one or more modes:
- **Lifecycle setup**: define where docs live, who owns them, when to update them, how to retire them, and how conflicts are resolved. Read `references/doc-lifecycle.md`.
- **Enforcement setup**: add link checks, markdown linting, doc coverage, PR checklist rules, or CI/hook integration. Read `references/enforcement-patterns.md`.
- **Template setup**: add or update reusable doc shapes for guides, references, guardrails, runbooks, ADRs, or architecture updates. Read `references/doc-patterns.md`.
- **Targeted doc update**: update committed docs as requested, then check whether a lifecycle or enforcement rule should also change.

### 3. Recommend Before Editing

For broad changes, present:
- Current docs operating model in 3-5 bullets.
- Proposed file manifest with `create`, `modify`, or `leave as-is`.
- Enforcement level: light, medium, or strong.
- New dependencies or CI changes, if any.
- Risks and what will intentionally remain manual.

Ask for approval before edits. Do not proceed on implied approval.

### 4. Implement

When approved:
- Edit only the files in the approved manifest.
- Add the smallest useful lifecycle rules and templates.
- Prefer extending existing CI/hook/config files over creating parallel systems.
- If adding checks, document the local command and CI path in the authoritative contributor or docs guide.
- If adding templates, place them where the repo already keeps templates; otherwise prefer `docs/templates/` only when multiple templates are needed.

### 5. Verify

Run relevant checks when available:
- Markdown formatter/linter.
- Markdown link checker.
- Existing docs validation scripts.
- The specific command added or changed, unless it requires network or external services.

If a useful check cannot run because dependencies are missing or network is blocked, report that clearly and include the command that should be run.

### 6. Handoff

Report:
- Files changed.
- Governance or lifecycle rule added.
- Enforcement added or recommended.
- Checks run and results.
- Manual follow-ups or remaining risks.

## Reference Files

- `references/doc-lifecycle.md`: ownership, authority, update triggers, retirement, review rhythm, and PR expectations.
- `references/enforcement-patterns.md`: medium-strength enforcement patterns for link checks, markdown linting, freshness, coverage, and CI/hook integration.
- `references/doc-patterns.md`: concise templates for guides, references, guardrails, runbooks, ADRs, and architecture update checklists.
