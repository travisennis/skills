---
name: grill-with-docs
description: Grilling session that challenges a plan against the existing domain model, sharpens terminology, and records resolved terms and decisions in CONTEXT.md and ADRs. Use when the user wants to stress-test a plan against their project's language and documented decisions. For a generic interview use grill-me; for the full unknowns pass use grill-for-unknowns.
metadata:
  version: "1.0"
---

# Grill With Docs

Read and follow the `grill-for-unknowns` skill. Its SKILL.md is at
`../grill-for-unknowns/SKILL.md` when the skills are installed side by side.

Run its interview loop with the domain-modeling emphasis:

- Challenge fuzzy, overloaded, or conflicting terms immediately.
- Compare the user's language against `CONTEXT.md`, code identifiers, docs, and product
  copy; update `CONTEXT.md` as terms crystallize.
- Check claims about how the system works against the code and surface contradictions.
- Invent concrete scenarios that probe boundaries between concepts.
- Offer an ADR only when the decision is hard to reverse, surprising without context,
  and the result of a real trade-off.

Use the formats and rules in
`../grill-for-unknowns/references/domain-modeling-add-on.md` (repository file layout,
`CONTEXT.md` purpose and format, ADR rules and template). Do not duplicate those formats
in this skill.
