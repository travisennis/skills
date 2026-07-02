# Refactor Mode

Restructure a repo's documentation into a **progressive-disclosure system**: `AGENTS.md` becomes a concise routing document that tells agents how to classify work, which compatibility surfaces matter, and which focused docs to read for each change type. Detailed rules move into a structured `docs/` hierarchy per `taxonomy.md`.

This mode follows a **plan-first workflow**: Phase 1 surveys the existing docs, Phase 2 produces a recommendation and waits for approval, Phase 3 (after approval) applies changes directly to the working tree. No empty bureaucracy — only create docs that are justified by what the repo needs.

This mode also covers **bootstrapping** a repo with little or no documentation: Phase 1 then surveys the code, config, and toolchain instead of existing docs, and Phase 3 creates rather than relocates. The bar is the same — every created doc must have real content evidenced by the repo, and a new project warrants only the smallest structure it needs today (often just AGENTS.md, a README, and one or two topic docs).

## Phase 1 — Survey

Inspect the current documentation landscape through the lens of `rubric.md`. Be thorough but fast — this is a read-only survey, not a full scored audit. If a recent audit report exists (or the user provides one), use its "Prioritized Gaps" section as the starting inventory instead of re-deriving it.

### Check these files

- `AGENTS.md` (or equivalent — `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`)
- `README.md`
- `CONTRIBUTING.md` (if present)
- `ARCHITECTURE.md` (if present)
- Existing `docs/` content — inventory doc paths first, then read likely routing, guardrail, guide, reference, design doc, ADR, runbook, or spec files as needed. Do not exhaustively load a large docs tree unless the task requires it.
- Git status: `git status --short`

### Catalog what you find

Build a mental inventory of:
- **What exists** — every doc file and its rough purpose.
- **AGENTS.md content types** — what's in there: routing logic, command catalogs, test matrices, style guides, dependency policies, release procedures, generated-index instructions, tool-specific workflows, safety rules. Note which content belongs in a routing doc vs. a deeper reference (the authority model in `taxonomy.md` decides).
- **Risk surfaces** — from README, package config, directory structure. What does this repo do? CLI tool? Library? App with a database? Public API? Security-sensitive? This determines which workflow routes belong in the new AGENTS.md.
- **Missing content** — what's not documented that should be, judged by the rubric dimensions (e.g., no domain glossary but the repo has complex business terms; no testing guide but tests exist).
- **Git state** — any uncommitted user changes that shouldn't be touched.

## Phase 2 — Recommendation

Prepare a recommendation plan and present it to the user for approval.

### Build the plan

Prepare the plan in the conversation by default. Do not write a plan file unless the user asks for one or approves it after being asked. If the user approves a plan file but gives no path, suggest a location consistent with the repo's working-artifact conventions; do not assume one.

The plan must include:

1. **Current state summary** — what exists, what's in AGENTS.md, what's in docs/
2. **Proposed changes manifest** — a precise file-by-file table with actions:

   | Path | Action | Notes |
   |------|--------|-------|
   | `AGENTS.md` | modify | Restructure into routing doc |
   | `docs/guardrails/testing-and-verification.md` | create | From CONTRIBUTING testing section |
   | `docs/guides/setup.md` | create | From CONTRIBUTING setup section |
   | ... | ... | ... |

3. **Proposed AGENTS.md outline** — the headings and route sections you'll create, showing which routes map to which deeper docs
4. **What moves where** — for each piece of content being removed from AGENTS.md, say exactly which doc it's going to
5. **Optional** — any docs being left as-is, or gaps you're flagging

### Present for approval

In the conversation, show:
- **Key findings** — 3-5 bullet summary of what's working and what needs work
- **Proposed AGENTS.md line count** — target 60–90 lines (see `taxonomy.md`)
- **File manifest** — the table of changes (paths + actions)
- **Notable choices** — e.g., "Skipped DESIGN.md because this repo has no UI." "No security guardrail because nothing security-sensitive was found."

Then ask: **"Approve with 'proceed' to apply changes, or give feedback to refine."**

Do not proceed to Phase 3 without explicit approval.

### Handling pushback

If the user pushes back on specific recommendations:
- Adjust the recommendation and re-present changes
- If the user previously approved a plan file, ask before updating that file
- Do not implement partial changes without a clear updated manifest

## Phase 3 — Implementation (after approval)

Apply the changes directly to the working tree.

### Before editing

1. Check `git status --short` again. Warn if new uncommitted changes appeared since the survey.
2. Do not commit or push unless explicitly asked.
3. Do not revert, overwrite, or clean files you did not intentionally change.

### Apply changes

1. **Create or update `AGENTS.md`** — concise routing doc using the template in `taxonomy.md`, adapted to the project.
2. **Create `docs/` directory and structure** — only docs that were in the manifest, following the scaffold in `taxonomy.md`.
3. **Move content** — relocate detailed rules from AGENTS.md into appropriate deeper docs (use the shapes in `doc-templates.md` where a doc is created fresh). Preserve existing docs/ content; slot it into the new structure.
4. **Create `docs/README.md`** — documentation index per the requirements in `taxonomy.md`.

### Guardrail creation rule

Only create a guardrail file if you can populate it with real content — moved from existing docs, directly evidenced by repo config/scripts, or explicitly approved by the user. Do not invent policy from code shape alone. If a route section in AGENTS.md would point to a guardrail that doesn't exist yet, note the gap in the recommendation. Do not create empty stubs.

### Post-implementation

1. Show a concise diff summary
2. Report final `AGENTS.md` line count
3. List what moved out of `AGENTS.md` and where it went
4. Run markdown formatting/checks if available. If no checks exist, say so.
5. Report remaining uncommitted/untracked files
6. If a plan file was approved and written, report its path

## Authority Rules

- Preserve existing project-specific rules. Do not delete meaning; relocate it.
- Follow the authority model in `taxonomy.md` for which doc owns which topic.
- Prefer exact links to docs over vague "read docs/" references.
- Do not route to missing docs. If a proposed route has no target doc, either create a justified doc with real content, route to the closest existing doc, or list the missing doc as a gap in the recommendation.
- Keep the resulting instructions useful for a stateless coding agent with limited context.
