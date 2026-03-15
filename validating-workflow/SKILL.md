---
name: validating-workflow
description: Validate that the docs/specs/ artifact system is complete, consistent, and up to date. Use after completing work, before marking a spec as done, or when asked to check documentation hygiene across the workflow.
metadata:
  version: "1.0"
---

# Validating Workflow

Validate the integrity and consistency of the `docs/specs/` artifact system. Ensures the full workflow has been followed, all expected artifacts exist, statuses are coherent, and documentation is kept up to date.

## When to Use

- After completing a task or spec — to verify all artifacts were produced
- Before marking a spec as "Complete" — to catch missing or stale docs
- Periodically — to audit the overall health of the spec system
- When resuming work — to understand what's been done and what's missing

## Workflow

### 1. Run the Automated Checker

Execute the integrity checker script against the project root:

```bash
uv run <skill-base-dir>/scripts/check-specs.py /path/to/project/root
```

The script checks:

| Check | What it validates |
|-------|-------------------|
| **Index coverage** | Every `docs/specs/<slug>/` directory has an entry in `docs/specs/index.md` and vice versa |
| **Artifact completeness** | Each spec has the expected files (prd.md required; tasks/index.md if tasks/ exists) |
| **Task tracking** | Task directories match entries in `tasks/index.md` |
| **Status coherence** | Artifact presence matches reported status (e.g., plan.md exists → status shouldn't be "Not started") |
| **Link integrity** | All relative markdown links in spec artifacts resolve to real files |
| **Plan structure** | Plans have numbered phases and success criteria sections |
| **Stale detection** | Specs with PRD but no tasks or research |

Options:
- `--severity error|warning|info` — filter output by minimum severity (default: info)
- `--json` — output results as JSON for programmatic use

### 2. Review and Interpret Results

After running the script, review each finding:

- **Errors** are problems that must be fixed — broken links, missing indexes, orphaned directories.
- **Warnings** are likely issues — status mismatches, untracked task directories.
- **Info** items are suggestions — missing optional artifacts, lifecycle hints.

### 3. Assess Workflow Completeness

Beyond the automated checks, manually verify the workflow lifecycle for each active spec:

#### Lifecycle Checklist

For each spec in `docs/specs/index.md`, verify the following based on its claimed status:

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
- [ ] GitHub issue status matches local status

**Complete status** — all of the above, plus:
- [ ] All tasks marked complete in `tasks/index.md`
- [ ] All plans have checkboxes marked as done
- [ ] `docs/specs/index.md` status updated to "Complete"

### 4. Fix Issues

For each finding, take the appropriate action:

- **Missing index entries** → Add the spec or task to the relevant index file
- **Broken links** → Fix the link target or remove the dead link
- **Status mismatches** → Update the status in the index to match reality
- **Missing artifacts** → Either create the missing artifact or document why it's intentionally absent
- **Orphaned directories** → Either add tracking entries or remove if the work was abandoned
- **Stale specs** → Decide whether to advance the spec (add research/tasks) or archive it

### 5. Report

Summarize the validation results to the user:

```markdown
## Workflow Validation Report

### Automated Checks
- ✅ X checks passed
- ❌ Y errors found (fixed: Z)
- ⚠️ W warnings

### Specs Audited
| Spec | Status | Lifecycle Complete | Issues |
|------|--------|--------------------|--------|
| feature-a | Active | ✅ Yes | — |
| feature-b | Draft | ⚠️ No tasks yet | Missing breakdown |

### Actions Taken
- Fixed broken link in feature-a/tasks/index.md
- Updated status for task "add-auth" from "Not started" to "Planned"

### Remaining Items
- feature-b needs task breakdown (user decision required)
```

## Guidelines

- **Non-destructive** — This skill only reads and reports. It suggests fixes but does not delete files or overwrite content without confirmation.
- **Idempotent** — Can be run multiple times safely. Each run produces a fresh report.
- **Incremental** — Can validate a single spec (`--severity error` for quick checks) or the entire system.
- **Complements other skills** — This skill verifies the output of the other 8 workflow skills. It does not replace their individual validation steps.

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
