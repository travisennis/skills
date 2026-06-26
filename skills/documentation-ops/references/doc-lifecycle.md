# Documentation Lifecycle

Use this reference when setting up or repairing the operating model for committed project documentation.

## Authority Model

Assign each topic one authoritative home:
- `AGENTS.md`: agent routing, compatibility surfaces, high-level operating loop.
- `README.md`: project purpose, quick start, user-facing install/use path.
- `CONTRIBUTING.md`: contributor workflow, local setup, validation commands, PR expectations.
- `ARCHITECTURE.md`: codemap, invariants, boundaries, cross-cutting system concerns.
- `docs/README.md` or `docs/index.md`: documentation navigation.
- `docs/guides/`: procedural workflows.
- `docs/references/`: stable facts, contracts, APIs, schemas, formats.
- `docs/guardrails/`: risk-specific rules and constraints.
- `docs/runbooks/`: operational response procedures.
- `docs/adr/` or `docs/decisions/`: durable architecture decisions.

When two docs cover the same topic, pick the authority and replace the duplicate with a link or short pointer.

## Lifecycle States

Use lightweight states only when they help:
- **Draft**: useful but not authoritative yet.
- **Current**: authoritative and expected to be followed.
- **Superseded**: replaced by another doc or decision; link to the replacement.
- **Archived**: retained for history; not part of current workflow.

Do not force status metadata onto every doc. Prefer clear placement and links unless the repo already uses frontmatter or status blocks.

## Update Triggers

Require a documentation check when a change touches:
- Public API, CLI flags, config shape, protocol, schema, or file format.
- Setup, build, test, lint, release, deployment, or rollback commands.
- Architecture boundaries, dependency direction, persistence model, auth/security behavior, or operational responsibilities.
- User-visible behavior documented in README or public docs.
- Domain vocabulary, business workflow, support process, or compliance behavior.
- A decision that future maintainers will need to understand.

Use this wording for PR templates or contributor docs:

```md
- [ ] Documentation updated, or not needed because: <reason>
```

## Ownership

Prefer ownership by area, not by individual name:
- Architecture docs: maintainers of the affected subsystem.
- Contributor workflow: repo maintainers.
- Runbooks: operators/on-call owners.
- Public API docs: API owners.
- Agent docs: maintainers responsible for agent workflows.

If the repo uses `CODEOWNERS`, add doc ownership there instead of inventing a parallel owner list. If it does not, document ownership in `docs/README.md` or `CONTRIBUTING.md`.

## Review Rhythm

Use the lightest rhythm that can work:
- Link and lint checks on every PR.
- Review docs when related code changes.
- Periodic manual review only for high-value docs: `ARCHITECTURE.md`, runbooks, public API docs, domain docs.

Avoid mandatory `Last reviewed:` metadata unless the repo already uses it or has long-lived operational docs where stale content is dangerous.

## Retiring Docs

When a doc is no longer current:
- If it has durable historical value, mark it superseded or archived and link to the replacement.
- If it has no durable value and is not referenced, delete it in the same change that removes its links.
- If unsure, leave it in place but add a clear stale warning and create a follow-up.

Never leave multiple current docs with conflicting instructions.
