---
name: managing-docs
description: Validate and update all project documentation — specs, architecture, design docs, README, and tech debt. Use after completing work, when asked to check documentation hygiene, or when asked to update project docs. Replaces managing-architecture-document and validating-workflow.
metadata:
  version: "1.0"
user-invocable: true
---

# Managing Project Documentation

Single skill for all project documentation lifecycle — auditing completeness and updating content. Covers both the `docs/specs/` artifact system and project-level docs (ARCHITECTURE.md, README.md, design docs, tech debt).

## When to Use

- After completing a task — to verify all docs were updated and artifacts produced
- Before marking a spec as "Complete" — to catch missing or stale docs
- Periodically — to audit overall documentation health
- When resuming work — to understand what's been done and what's missing
- After architectural changes — to update ARCHITECTURE.md
- After adding CLI flags or features — to update README.md

## Two Modes

### Validate Mode

**Trigger:** "check docs", "validate docs", "audit documentation"

Read-only audit. Reports what's missing, stale, or inconsistent without making changes.

### Update Mode

**Trigger:** "update docs", "sync docs", after completing a task

Determines what's stale based on recent changes and updates the relevant documents.

---

## Workflow

### 1. Run the Automated Checker

Execute the integrity checker script against the project root:

```bash
uv run <skill-base-dir>/scripts/check-docs.py /path/to/project/root
```

The script checks:

#### Spec Artifact Checks (`docs/specs/`)

| Check | What it validates |
|-------|-------------------|
| **Index coverage** | Every `docs/specs/<slug>/` directory has an entry in `docs/specs/index.md` and vice versa |
| **Artifact completeness** | Each spec has the expected files (prd.md required; tasks/index.md if tasks/ exists) |
| **Task tracking** | Task directories match entries in `tasks/index.md` |
| **Status coherence** | Artifact presence matches reported status (e.g., plan.md exists → status shouldn't be "Not started") |
| **Link integrity** | All relative markdown links in spec artifacts resolve to real files |
| **Plan structure** | Plans have numbered phases and success criteria sections |
| **Stale detection** | Specs with PRD but no tasks or research |

#### Project Doc Checks

| Check | What it validates |
|-------|-------------------|
| **ARCHITECTURE.md** | Exists, has required sections (Overview, Codemap, Invariants, Boundaries, Cross-Cutting) |
| **README.md** | Exists |
| **Design docs index** | `docs/design-docs/index.md` exists if `docs/design-docs/` has entries; index entries match actual files |
| **Tech debt** | `docs/tech-debt.md` exists if referenced by AGENTS.md |

Options:
- `--severity error|warning|info` — filter output by minimum severity (default: info)
- `--json` — output results as JSON for programmatic use
- `--specs-only` — only check `docs/specs/` artifacts
- `--project-only` — only check project-level docs

### 2. Review and Interpret Results

After running the script, review each finding:

- **Errors** are problems that must be fixed — broken links, missing indexes, orphaned directories.
- **Warnings** are likely issues — status mismatches, untracked task directories, missing doc sections.
- **Info** items are suggestions — missing optional artifacts, lifecycle hints.

### 3. Assess Completeness

#### Specs Lifecycle Checklist

For each spec in `docs/specs/index.md`, verify based on its claimed status:

**Draft status** — minimum artifacts:
- [ ] `docs/specs/<slug>/prd.md` exists and has all template sections filled in
- [ ] Entry in `docs/specs/index.md` with correct status and date

**Active status** — all of the above, plus:
- [ ] `docs/specs/<slug>/research.md` exists (or research was deemed unnecessary with documented reason)
- [ ] `docs/specs/<slug>/tasks/index.md` exists with task breakdown
- [ ] Task directories exist under `tasks/` for each tracked task
- [ ] GitHub issues created and linked in tasks/index.md

**Per-task checks** (for each task in an Active spec):
- [ ] Task directory exists: `docs/specs/<slug>/tasks/<task-slug>/`
- [ ] `plan.md` exists if status is "Planned" or beyond
- [ ] Plan has numbered phases and success criteria
- [ ] `review.md` exists if a review was conducted
- [ ] Status in `tasks/index.md` reflects actual progress

**Complete status** — all of the above, plus:
- [ ] All tasks marked complete in `tasks/index.md`
- [ ] All plans have checkboxes marked as done
- [ ] `docs/specs/index.md` status updated to "Complete"

#### Project Docs Checklist

- [ ] `ARCHITECTURE.md` reflects current module structure (compare top-level `src/` dirs against codemap)
- [ ] `README.md` reflects current CLI usage and setup instructions
- [ ] `docs/design-docs/index.md` lists all files in `docs/design-docs/`
- [ ] `docs/tech-debt.md` exists and is referenced

### 4. Fix Issues (Update Mode)

For each finding, take the appropriate action:

**Spec fixes:**
- **Missing index entries** → Add the spec or task to the relevant index file
- **Broken links** → Fix the link target or remove the dead link
- **Status mismatches** → Update the status in the index to match reality
- **Missing artifacts** → Either create the missing artifact or document why it's intentionally absent
- **Orphaned directories** → Either add tracking entries or remove if the work was abandoned
- **Stale specs** → Decide whether to advance the spec (add research/tasks) or archive it

**Project doc fixes:**
- **Stale ARCHITECTURE.md** → Update the codemap to reflect current module structure
- **Missing design doc index entries** → Add entries for untracked files
- **Missing tech-debt.md** → Create it with a standard template

### 5. Report

Summarize the validation results:

```markdown
## Documentation Health Report

### Automated Checks
- ✅ X checks passed
- ❌ Y errors found (fixed: Z)
- ⚠️ W warnings

### Project Docs
| Document | Status | Issues |
|----------|--------|--------|
| ARCHITECTURE.md | ✅ Current | — |
| README.md | ⚠️ May need update | New CLI flags not documented |
| design-docs/index.md | ✅ In sync | — |
| tech-debt.md | ❌ Missing | Needs creation |

### Specs Audited
| Spec | Status | Lifecycle Complete | Issues |
|------|--------|--------------------|--------|
| feature-a | Active | ✅ Yes | — |
| feature-b | Draft | ⚠️ No tasks yet | Missing breakdown |

### Actions Taken
- Fixed broken link in feature-a/tasks/index.md
- Updated ARCHITECTURE.md codemap with new module
- Added missing entry to design-docs/index.md

### Remaining Items
- feature-b needs task breakdown (user decision required)
```

---

## ARCHITECTURE.md Guidelines

When updating ARCHITECTURE.md, follow these principles:

### Philosophy

ARCHITECTURE.md bridges the gap between occasional contributors and core developers. While it takes 2x more time to write a patch when unfamiliar with a project, it takes 10x more time to figure out *where* to change the code.

### Key Principles

1. **Keep it short** — Every recurring contributor will read it. Shorter docs are less likely to be invalidated by future changes.
2. **Only specify stable things** — Don't try to keep it synchronized with code. Focus on architectural invariants that are unlikely to change frequently.
3. **Start with the problem** — Begin with a bird's eye overview of the problem being solved.
4. **Provide a codemap** — Describe coarse-grained modules and how they relate to each other. Answer: "Where's the thing that does X?" and "What does the thing I'm looking at do?" A codemap is a map of a country, not an atlas of its states.
5. **Reflect on structure** — Are the things you want to put near each other in the codemap adjacent when you run `tree .`?
6. **Name, don't link** — Name important files, modules, and types. Do NOT directly link them (links go stale). Encourage readers to use symbol search.
7. **Call out invariants** — Explicitly call out architectural invariants. Important invariants are often expressed as an *absence* of something.
8. **Identify boundaries** — Point out boundaries between layers and systems.
9. **Cross-cutting concerns** — After the codemap, add a section on cross-cutting concerns.

### Required Sections

1. **Overview** — Bird's eye view of what this project does and the problem it solves
2. **Codemap** — High-level modules and their relationships
3. **Architectural Invariants** — Key constraints and principles that guide the design
4. **System Boundaries** — Clear boundaries between layers and major subsystems
5. **Cross-Cutting Concerns** — Aspects that affect multiple parts of the system

### Reference

See matklad's original post: https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html

---

## Guidelines

- **Non-destructive in validate mode** — Only reads and reports. Suggests fixes but does not delete files or overwrite content without confirmation.
- **Idempotent** — Can be run multiple times safely. Each run produces a fresh report.
- **Incremental** — Can validate specs only, project docs only, or everything.
- **Portable** — Works in any project. Detects what docs exist and adapts. Does not require all doc types to be present.

## Integration with Other Skills

This skill validates artifacts produced by the full workflow:

| Skill | Artifacts Validated |
|-------|-------------------|
| `writing-a-prd` | `prd.md` exists, `index.md` entry present |
| `researching-codebase` | `research.md` exists when expected |
| `converting-prd-to-issues` | `tasks/index.md` matches task directories, issues linked |
| `creating-plans` | `plan.md` has required structure |
| `iterating-plan` | Plan still has required sections after updates |
| `implementing-plan` | Task status updated, checkboxes marked |
| `validating-plan` | Task status reflects validation results |
| `reviewing-code` | `review.md` exists when review was conducted |
