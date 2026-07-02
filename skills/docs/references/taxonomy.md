# Documentation Taxonomy & Authority

The single source of truth for documentation structure across all modes: the `docs/` scaffold, the authority model, and the AGENTS.md routing template. Audit mode suggests this scaffold to unstructured repos; refactor mode builds it; maintain mode routes updates by it; govern mode assigns ownership with it.

## The docs/ Scaffold

One known-good layout, to be adapted — never mandated. Create only the subdirectories and files the repo needs; do not create empty bureaucracy. Exception: when creating or restructuring a `docs/` hierarchy, always create `docs/README.md` as the consistent entrypoint.

```
docs/
├── README.md          # Documentation index: start here
├── DOMAIN.md          # Business/problem-domain knowledge, terminology, workflows (if needed)
├── DESIGN.md          # Product/UI design language (if repo has UI)
├── design-docs/       # Design docs for specific features or systems (if needed)
├── guardrails/        # Concise agent-facing rules by risk surface
├── guides/            # How-to guides (setup, testing, deployment, common workflows)
├── references/        # Stable reference material (API, schemas, formats, protocols)
├── runbooks/          # Operational response procedures (if operated as a system)
└── adr/               # Architecture Decision Records, numbered
```

Accept equivalent naming when it is already coherent: `architecture/` may stand in for `design-docs/`, and `decisions/` may stand in for `adr/`. Repos that meet the same goals another way (a docs-site generator, per-package docs in a monorepo, language-native module docs) do not need this shape.

## Authority Model

Each topic has exactly one authoritative home. When two docs cover the same topic, pick the authority and replace the duplicate with a link or short pointer.

- `AGENTS.md`: agent routing, compatibility surfaces, the operating loop — not every procedure.
- `README.md`: project purpose, quick start, user-facing install/use path.
- `CONTRIBUTING.md`: contributor workflow, local setup, validation commands, PR expectations.
- `ARCHITECTURE.md`: codemap, invariants, boundaries, cross-cutting system concerns.
- `docs/README.md` or `docs/index.md`: documentation navigation — not agent behavior.
- `docs/guardrails/`: risk-specific rules and constraints.
- `docs/guides/`: procedural workflows.
- `docs/references/`: stable facts, contracts, APIs, schemas, formats.
- `docs/runbooks/`: operational response procedures.
- `docs/adr/` or `docs/decisions/`: durable architecture decisions.
- `docs/DOMAIN.md`: business vocabulary and domain workflows.

Keep the resulting doc set useful for a stateless coding agent with limited context: prefer exact links to docs over vague "read docs/" references, and never route to a doc that does not exist.

## AGENTS.md Routing Template

The root entry point is a routing layer. Target 60–90 lines when focused docs exist; up to ~150 lines is acceptable (see `rubric.md` §`progressive_disclosure` for how this is judged). Adapt the structure to the project:

```md
# Agent Instructions

## Project

<1-2 sentence description of the project.>

Compatibility surfaces: <list relevant surfaces — public API, CLI behavior, config shape, file formats, protocols, persistence formats, security boundaries, output formats, plugin contracts, dependency policy, design system, accessibility behavior, deployment contracts, etc.>. Preserve them unless the task explicitly changes them.

## Operating Loop

1. Classify the request before editing.
2. Load only the routed docs needed for that request.
3. Preserve compatibility surfaces unless explicitly changed.
4. Keep edits surgical and verify according to risk.
5. Handoff with changes, checks, and remaining risk.

When this file conflicts with a specialized workflow doc for that workflow, the specialized doc wins.

## Workflow Routing

<Project-specific route sections. Each route says:
- "Use this workflow for ..."
- "Consult ..."
- One or two compatibility, security, or testing reminders specific to that route.>

## Repository Rules

<Only global safety rules. Not detailed policies.>

## Handoff

<What every final handoff must include.>
```

## docs/README.md Requirements

The documentation index must include:
- A short description of what belongs in `docs/`.
- Links to the highest-value docs.
- A section mapping common tasks to the right docs.
- A note that `AGENTS.md` is the routing layer for agents and this file is the docs index.
