# Documentation Principles for Coding Agents

The conceptual foundation behind the rubric and every mode of this skill. Use these to write recommendations and edits that fix the cause, not just the symptom.

Sources:
- **Harness engineering** (OpenAI, *Harness engineering: leveraging Codex in an agent-first world*) — building a product where agents generated the overwhelming majority of the code, and what documentation practices made that possible.
- **matklad**, *ARCHITECTURE.md* — guidance on the architecture document for projects in the ~10k–200k line range.

---

## 1. The repository is the system of record

If knowledge lives in Slack threads, Confluence, Google Docs, a wiki, or people's heads, it does not exist for an agent. An agent can only act on what it can read in-context while running.

Therefore all load-bearing knowledge must be:
- **In-repo** — versioned and co-located with the code it describes.
- **Discoverable** — structured, indexed, cross-linked.
- **Mechanically verifiable** — protected by checks so it cannot silently rot.

A doc that only points outward ("see our internal wiki for setup") is a dead end for an agent. Treat externalized core knowledge as a gap.

---

## 2. The entry point is a table of contents, not an encyclopedia

The "one giant AGENTS.md" approach predictably fails:

1. **Context is scarce.** A huge instruction file crowds out the task, the code, and the docs that actually matter. The agent misses key constraints or optimizes for the wrong ones.
2. **Too much guidance becomes non-guidance.** When everything is marked important, nothing is. Agents pattern-match locally instead of navigating intentionally.
3. **It rots.** A monolithic manual becomes a graveyard of stale rules, and agents cannot tell what is still true.
4. **It resists verification.** A single blob does not lend itself to mechanical checks for coverage, freshness, or ownership.

Instead, treat the root entry point as a concise routing layer: no more than ~150 lines, and often closer to 60–90 lines when the repo has focused docs. It should carry project identity, compatibility surfaces, a short operating loop, workflow routing, minimal repository safety rules, and handoff expectations. Put detailed command catalogs, test matrices, setup procedures, release steps, and style guides in their authoritative docs.

### Three disclosure layers
- **Layer 1 — entry point (always loaded):** identity, compatibility surfaces, operating loop, workflow routing, minimal safety rules, and handoff expectations. Keep it small.
- **Layer 2 — ARCHITECTURE.md + docs index (navigation):** codemap, invariants, boundaries, and the index of all docs. Loaded when structural understanding is needed.
- **Layer 3 — topic docs + nested entry points (on-demand):** guardrails, guides, references, domain/design docs, ADRs, and domain-specific nested `AGENTS.md` files. Loaded only when working in that area.

---

## 3. Directives over explanations

Entry-point content should be rules an agent follows, not tutorials it reads.

- Good: "Always run `bin/lint` before committing." / "Never use raw SQL outside `db/queries/`." / "Prefer service objects over fat models."
- Bad: a 20-line "How our linting works" section explaining the ESLint config.

State the rule; push the rationale to a linked doc. Signs that content is in the wrong place: code examples longer than ~10 lines, multi-step how-tos, command catalogs, API/module inventories, or any single topic running past ~30 lines.

---

## 4. Links over duplication

Every piece of knowledge has exactly one source of truth. The entry point links out; it does not absorb. Duplicated content (the same setup steps in three files) drifts apart and produces contradictory instructions, and when two docs disagree the agent makes unpredictable choices.

Frame authority as ownership, not conflict handling — see the authority model in `taxonomy.md` for which doc owns which topic. Markdown links are correct; eager `@file`-style imports defeat the purpose by loading everything into context.

---

## 5. Name things, document absences (architecture docs)

From matklad: the biggest gap between an occasional contributor and a core developer is knowing the *physical* architecture. Figuring out **where** to change code costs far more than writing the change. An ARCHITECTURE.md closes that gap for humans and agents alike.

- **Keep it short and stable.** Only include things unlikely to change often; revisit a couple of times a year rather than syncing it to every commit.
- **Bird's-eye first.** Open with the problem the system solves, not the tech stack.
- **Codemap, not atlas.** Coarse modules with one-line descriptions that answer "where is the thing that does X?" — not per-function detail.
- **Name, don't link.** Name important files, modules, and types so they can be found by symbol search. Links rot; names are stable and discoverable.
- **Document invariants, especially absences.** The hardest things to learn from reading code are the things that deliberately do *not* exist ("there is no ORM"; "services never verify tokens — the gateway does"). Spell them out.
- **Point out boundaries.** Where one subsystem ends and another begins, what is public vs internal, which modules may depend on which.

---

## 6. Enforce mechanically

Documentation that is not checked will rot. Strong doc systems build CI/hook checks for:
- Link and reference resolution (do markdown links point to real files?).
- Freshness (when was each doc last touched relative to the code it describes?).
- Coverage (do major directories have an entry point / are they in the codemap?).

A recurring "doc-gardening" process that scans for and flags stale docs is the difference between documentation that stays true and documentation that decays into noise. This is what separates a strong (`3`) score from a merely current (`2`) one.

---

## 7. Project docs are not agent artifacts

Project docs are durable repository documentation intended for humans working on or using the project. Many repos also carry **agent working records** — task files, research notes, implementation plans, and generated indexes, often under `.agents/` or a similar working directory. Keep the roles separate:

- Durable behavior, architecture, and contributor guidance belong in project docs.
- Actionable work, investigation evidence, and implementation plans belong in their working records — do not promote them into project docs verbatim, and do not let project docs decay into a task log.
- Preserve uncertainty by recording open questions in working records instead of presenting guesses as facts in project docs.
- Generated files (indexes, generated API docs) are owned by their generator. Never hand-edit them; update the source records and regenerate with the repo's tool.

---

## Key takeaway

Give the agent a map, not a thousand-page manual. Start from a small, stable entry point, keep each fact in one in-repo place, name the landmarks, write down what is deliberately missing, and let CI keep it honest. Structure knowledge so an agent can progressively discover what it needs, when it needs it.
