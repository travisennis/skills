---
name: docs
description: >-
  Audit, refactor, maintain, and govern project documentation for coding agents.
  Four modes — audit: read the active doc set and score nine agent-legibility
  dimensions, then report concrete gaps; refactor: restructure AGENTS.md and
  docs/ into a progressive-disclosure system; maintain: update docs after code
  or behavior changes; govern: set up documentation ownership, lifecycle rules,
  and freshness/link/lint enforcement. Use when asked to audit documentation
  quality, check whether docs are agent-legible, restructure or split an
  oversized AGENTS.md, organize a docs/ tree, update documentation after a
  change, decide whether completed work needs doc follow-up, or add
  documentation governance and CI checks.
user-invocable: true
metadata:
  version: "1.0"
---

# Docs

One skill for the full lifecycle of project documentation: assessing it, restructuring it, keeping it current, and keeping it governed. All four modes share one doctrine (`references/principles.md`) and one set of judgment criteria (`references/rubric.md`), so an audit's findings feed a refactor, and a refactor's output is what maintain and govern keep healthy.

This skill operates on the repository you are currently working in unless the user names a target path.

**Scope** is committed project documentation: `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `docs/`, ADRs, guides, references, runbooks, and documentation CI/config. Agent working artifacts (task files, plans, research notes, generated indexes — often under `.agents/`) are out of scope except where the doctrine says to keep them separate from project docs.

## Doctrine

The shared definition of "good", detailed in `references/principles.md`. Hold every mode's work against it:

- **Repository as system of record.** Knowledge an agent cannot read in-repo does not exist.
- **Map, not encyclopedia.** The agent entry point is a concise routing layer that points to deeper sources of truth.
- **Directives over explanations.** Entry-point content is rules, not tutorials.
- **Links over duplication.** Each topic has exactly one source of truth.
- **Name things, document absences.** Architecture docs name files/modules/types and call out what deliberately does not exist.
- **Enforce mechanically.** Docs that are not checked rot.
- **Project docs are not agent artifacts.** Durable human-facing docs and agent working records have separate homes and roles.

## Mode Selection

Classify the request, then read that mode's workflow file. Every mode assumes the doctrine above. When the user invokes this skill with a mode name as the argument (e.g. `/docs audit`, `/docs maintain`), use that mode directly.

| Mode | Use when asked to... | Read |
|------|----------------------|------|
| **audit** | score or assess documentation quality, check agent-legibility, find doc gaps | `references/audit.md` |
| **refactor** | restructure AGENTS.md, split a bloated entry point, organize or create a docs/ hierarchy | `references/refactor.md` |
| **maintain** | update docs after a change, check whether completed work needs documentation follow-up | `references/maintain.md` |
| **govern** | define doc ownership or lifecycle rules, add freshness/link/lint checks, add PR doc rules | `references/govern.md` |

If a request spans modes, run them in lifecycle order — audit before refactor, refactor before govern, with maintain as the ongoing mode that keeps the result current — and say which mode you are in.

## How Modes Connect

- **audit → refactor**: refactor's Phase 1 survey uses the same rubric the audit scores; an existing audit report's "Prioritized Gaps" section is a ready-made refactor input.
- **audit → govern**: a weak `freshness_enforcement` score is the signal to run govern mode and add mechanical checks.
- **refactor → maintain/govern**: the structure refactor creates (per `references/taxonomy.md`) is exactly what maintain updates and govern protects.
- **maintain → audit**: if maintenance keeps finding systemic problems (duplication, contradictions, no clear home for content), stop patching and recommend an audit.

## Shared Rules

These apply in every mode:

- **Calibrate to the repo.** Expectations scale with size and type. Never penalize a tiny repo for lacking large-repo scaffolding, and never let a large repo hide behind a single README.
- **Read prose, not filenames.** Judge and edit from content. A present-but-stale file is weak, not solid.
- **No empty bureaucracy.** Only create docs, templates, or checks that have real content and a concrete use today.
- **Single source of truth.** Prefer correcting or linking to an existing doc over adding a new one. Never duplicate procedure text across files.
- **Respect ownership.** Follow the authority model in `references/taxonomy.md`; never hand-edit generated files (indexes, generated API docs) — regenerate them with the repo's tool.
- **Plan-first for structural change.** Audit mode is read-only. Refactor and broad govern changes present a manifest and wait for approval. Maintain mode edits directly but keeps changes narrow and tied to what changed.
- **Git hygiene.** Inspect `git status --short` before broad edits; assume uncommitted changes belong to the user; do not commit or push unless explicitly asked.
- **Never read `.env`** (possible live secrets); `.env.example` and templates are safe.

## Resources

- `references/principles.md` — the doctrine: why good agent-facing documentation looks the way it does, with sources.
- `references/rubric.md` — nine documentation dimensions with evidence signals and 0–3 scoring guidance; the judgment criteria for all modes.
- `references/taxonomy.md` — the docs/ scaffold, the authority model (which doc owns which topic), and the AGENTS.md routing template.
- `references/doc-templates.md` — fill-in shapes for guides, references, guardrails, runbooks, ADRs, and ARCHITECTURE.md.
- `references/audit.md` / `refactor.md` / `maintain.md` / `govern.md` — per-mode workflows.
- `assets/report-template.md` — the audit report format.
