#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///

"""
Project documentation integrity checker.

Validates the .agents/specs/ artifact system (ephemeral working directory) AND project-level
documentation (ARCHITECTURE.md, README.md, design docs index).

Checks:
  Spec checks:
    1. Index coverage — every spec dir is listed in .agents/specs/index.md and vice versa
    2. Artifact completeness — each spec has the expected files for its lifecycle stage
    3. Task tracking consistency — tasks.md entries match actual task directories
    4. Status coherence — artifact presence matches reported status
    5. Link integrity — relative markdown links in spec artifacts resolve
    6. Plan structure — plans have required sections
    7. Stale artifact detection — specs with incomplete lifecycle artifacts

  Project doc checks:
    8. ARCHITECTURE.md — exists and has required sections
    9. README.md — exists
   10. Design docs index — index.md matches directory contents

Note: Spec artifacts in .agents/specs/ are ephemeral working documents,
not committed to the repository. This script validates internal consistency
of the working directory only.
"""

import argparse
import re
import sys
from pathlib import Path

# ── Severity levels ──────────────────────────────────────────────────

ERROR = "error"
WARNING = "warning"
INFO = "info"

findings: list[tuple[str, str, str]] = []  # (severity, category, message)


def add(severity: str, category: str, message: str) -> None:
    findings.append((severity, category, message))


# ── Helpers ──────────────────────────────────────────────────────────

def relative(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def extract_markdown_links(content: str) -> list[str]:
    """Extract relative markdown links, skipping external/anchor links."""
    content = re.sub(r"<!--.*?-->", "", content, flags=re.DOTALL)
    links = []
    for match in re.finditer(r"\[[^\]]*\]\(([^)]+)\)", content):
        link = match.group(1)
        if link.startswith(("http://", "https://", "mailto:", "#")):
            continue
        link = link.split("#")[0].split("?")[0]
        if link:
            links.append(link)
    return links


def extract_table_rows(content: str) -> list[dict[str, str]]:
    """Extract rows from the first markdown table found in content.

    Returns a list of dicts keyed by header column names.
    """
    lines = content.strip().splitlines()
    table_start = None
    for i, line in enumerate(lines):
        if re.match(r"^\s*\|.*\|.*\|", line):
            table_start = i
            break
    if table_start is None:
        return []

    header_line = lines[table_start]
    headers = [h.strip() for h in header_line.strip("|").split("|")]

    rows = []
    for line in lines[table_start + 2 :]:  # skip header + separator
        if not re.match(r"^\s*\|", line):
            break
        cells = [c.strip() for c in line.strip("|").split("|")]
        row = {}
        for j, header in enumerate(headers):
            row[header] = cells[j] if j < len(cells) else ""
        rows.append(row)
    return rows


def extract_link_target(cell: str) -> str | None:
    """Extract the link target from a markdown link in a table cell."""
    match = re.search(r"\[.*?\]\(([^)]+)\)", cell)
    return match.group(1) if match else None


# ── Spec Checks ──────────────────────────────────────────────────────

# Check 1: Spec index coverage

def check_spec_index(specs_dir: Path, root: Path) -> None:
    index_path = specs_dir / "index.md"
    if not index_path.exists():
        add(INFO, "index", f"No spec index found at {relative(index_path, root)} — this is expected if no specs exist yet")
        return

    content = index_path.read_text(encoding="utf-8")
    rows = extract_table_rows(content)

    # Collect slugs referenced in the index
    indexed_slugs: set[str] = set()
    for row in rows:
        spec_cell = row.get("Spec", "")
        link = extract_link_target(spec_cell)
        if link:
            # Link is like "slug/prd.md" — extract the slug
            slug = link.split("/")[0]
            indexed_slugs.add(slug)

    # Collect actual spec directories
    actual_slugs: set[str] = set()
    if specs_dir.exists():
        for d in specs_dir.iterdir():
            if d.is_dir() and d.name != ".git":
                actual_slugs.add(d.name)

    # Dirs not in index
    for slug in sorted(actual_slugs - indexed_slugs):
        add(ERROR, "index", f"Spec directory '{slug}/' exists but is not listed in {relative(index_path, root)}")

    # Index entries without dirs
    for slug in sorted(indexed_slugs - actual_slugs):
        add(ERROR, "index", f"Index references '{slug}' but no directory exists at {relative(specs_dir / slug, root)}")


# Check 2: Artifact completeness

def check_artifact_completeness(specs_dir: Path, root: Path) -> None:
    if not specs_dir.exists():
        return

    for spec_dir in sorted(specs_dir.iterdir()):
        if not spec_dir.is_dir() or spec_dir.name == ".git":
            continue

        slug = spec_dir.name
        prd = spec_dir / "prd.md"

        # Every spec must have a PRD
        if not prd.exists():
            add(WARNING, "completeness", f"Spec '{slug}' is missing prd.md")

        # Check for tasks.md file (single file with all tasks)
        tasks_file = spec_dir / "tasks.md"

        # If tasks.md exists, check task directories
        if tasks_file.exists():
            check_task_tracking(spec_dir, tasks_file, root)


# Check 3: Task tracking consistency

def check_task_tracking(spec_dir: Path, tasks_file: Path, root: Path) -> None:
    content = tasks_file.read_text(encoding="utf-8")
    rows = extract_table_rows(content)

    slug = spec_dir.name

    # Collect task slugs from tasks.md summary table
    indexed_tasks: set[str] = set()
    task_statuses: dict[str, str] = {}
    for row in rows:
        task_cell = row.get("Task", "")
        status_cell = row.get("Status", "")

        # Extract task name/slug from the Task column
        # Could be plain text or a link
        task_link = extract_link_target(task_cell)
        if task_link:
            task_slug = task_link.split("/")[0]
        else:
            # Plain text task name - derive slug
            task_slug = task_cell.lower().replace(" ", "-")[:50]

        indexed_tasks.add(task_slug)
        task_statuses[task_slug] = status_cell

    # Collect actual task directories (directly under spec dir)
    actual_tasks: set[str] = set()
    for d in spec_dir.iterdir():
        if d.is_dir() and d.name not in (".git",):
            actual_tasks.add(d.name)

    # Directories not tracked in tasks.md
    for task_slug in sorted(actual_tasks - indexed_tasks):
        add(WARNING, "task-tracking", f"Spec '{slug}': task directory '{task_slug}/' exists but may not be tracked in tasks.md")

    # Check status coherence for actual task directories
    for task_slug in sorted(actual_tasks):
        task_dir = spec_dir / task_slug
        has_plan = (task_dir / "plan.md").exists()
        has_review = (task_dir / "review.md").exists()

        # Find matching status
        status = ""
        for ts, st in task_statuses.items():
            if ts == task_slug or task_slug.startswith(ts) or ts.startswith(task_slug):
                status = st
                break

        if has_plan and "Not started" in status:
            add(WARNING, "status-coherence", f"Spec '{slug}', task '{task_slug}': has plan.md but status is still 'Not started'")

        if has_review and "Not started" in status:
            add(WARNING, "status-coherence", f"Spec '{slug}', task '{task_slug}': has review.md but status is still 'Not started'")

        if not has_plan:
            add(INFO, "completeness", f"Spec '{slug}', task '{task_slug}': no plan.md yet")


# Check 4: Link integrity (specs)

def check_spec_links(specs_dir: Path, root: Path) -> None:
    if not specs_dir.exists():
        return

    for md_file in specs_dir.glob("**/*.md"):
        content = md_file.read_text(encoding="utf-8")
        links = extract_markdown_links(content)
        file_dir = md_file.parent

        for link in links:
            resolved = (file_dir / link).resolve()
            if not resolved.exists():
                add(ERROR, "links", f"Broken link in {relative(md_file, root)}: \"{link}\" → target not found")


# Check 5: Plan structure

def check_plan_structure(specs_dir: Path, root: Path) -> None:
    if not specs_dir.exists():
        return

    for plan_file in specs_dir.glob("**/plan.md"):
        content = plan_file.read_text(encoding="utf-8")
        rel = relative(plan_file, root)

        # Check for at least one phase
        if not re.search(r"##\s+Phase\s+\d", content, re.IGNORECASE):
            add(WARNING, "plan-structure", f"{rel}: no numbered phases found (expected '## Phase N: ...')")

        # Check for success criteria
        if "success criteria" not in content.lower():
            add(WARNING, "plan-structure", f"{rel}: no success criteria section found")

        # Check for scope boundaries
        if "not doing" not in content.lower() and "out of scope" not in content.lower():
            add(INFO, "plan-structure", f"{rel}: consider adding a 'What We're NOT Doing' or 'Out of Scope' section")


# Check 6: Stale specs

def check_stale_specs(specs_dir: Path, root: Path) -> None:
    if not specs_dir.exists():
        return

    for spec_dir in sorted(specs_dir.iterdir()):
        if not spec_dir.is_dir() or spec_dir.name == ".git":
            continue

        slug = spec_dir.name
        has_prd = (spec_dir / "prd.md").exists()
        has_research = (spec_dir / "research.md").exists()
        has_tasks = (spec_dir / "tasks.md").exists()

        if has_prd and not has_tasks:
            add(INFO, "stale", f"Spec '{slug}': has PRD but no tasks.md — may need breakdown")

        if has_prd and not has_research:
            add(INFO, "stale", f"Spec '{slug}': has PRD but no research.md — consider researching before planning")


# ── Project Doc Checks ───────────────────────────────────────────────

ARCHITECTURE_REQUIRED_SECTIONS = [
    "overview",
    "codemap",
    "invariant",
    "boundar",
    "cross-cutting",
]


def check_architecture(root: Path) -> None:
    arch_path = root / "ARCHITECTURE.md"
    if not arch_path.exists():
        add(WARNING, "project-docs", "ARCHITECTURE.md not found — consider creating one")
        return

    content = arch_path.read_text(encoding="utf-8").lower()
    for section in ARCHITECTURE_REQUIRED_SECTIONS:
        if section not in content:
            add(WARNING, "project-docs", f"ARCHITECTURE.md may be missing a '{section}' section")


def check_readme(root: Path) -> None:
    readme_path = root / "README.md"
    if not readme_path.exists():
        add(WARNING, "project-docs", "README.md not found")


def check_design_docs_index(root: Path) -> None:
    design_docs_dir = root / "docs" / "design-docs"
    if not design_docs_dir.exists():
        return  # No design docs directory — nothing to check

    # Collect actual markdown files (excluding index.md itself)
    actual_files: set[str] = set()
    for f in design_docs_dir.iterdir():
        if f.is_file() and f.suffix == ".md" and f.name != "index.md":
            actual_files.add(f.name)

    if not actual_files:
        return  # Empty directory — nothing to check

    index_path = design_docs_dir / "index.md"
    if not index_path.exists():
        add(ERROR, "project-docs", f"docs/design-docs/ has {len(actual_files)} file(s) but no index.md")
        return

    content = index_path.read_text(encoding="utf-8")

    # Check each file is mentioned in the index (by filename)
    for filename in sorted(actual_files):
        if filename not in content:
            add(WARNING, "project-docs", f"docs/design-docs/{filename} exists but is not referenced in docs/design-docs/index.md")

    # Check index links resolve
    links = extract_markdown_links(content)
    for link in links:
        resolved = (design_docs_dir / link).resolve()
        if not resolved.exists():
            add(ERROR, "links", f"Broken link in docs/design-docs/index.md: \"{link}\" → target not found")


# ── Main ─────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Validate project documentation integrity and consistency."
    )
    parser.add_argument(
        "root",
        nargs="?",
        default=".",
        help="Project root directory (default: current directory)",
    )
    parser.add_argument(
        "--severity",
        choices=["error", "warning", "info"],
        default="info",
        help="Minimum severity to report (default: info)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON",
    )
    parser.add_argument(
        "--specs-only",
        action="store_true",
        help="Only check .agents/specs/ artifacts (ephemeral working directory)",
    )
    parser.add_argument(
        "--project-only",
        action="store_true",
        help="Only check project-level docs (ARCHITECTURE.md, README, etc.)",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    specs_dir = root / ".agents" / "specs"

    run_specs = not args.project_only
    run_project = not args.specs_only

    print("🔍 Validating project documentation...\n")

    if run_specs:
        if specs_dir.exists():
            check_spec_index(specs_dir, root)
            check_artifact_completeness(specs_dir, root)
            check_spec_links(specs_dir, root)
            check_plan_structure(specs_dir, root)
            check_stale_specs(specs_dir, root)
        elif not args.specs_only:
            print("ℹ️  No .agents/specs/ directory found. This is expected if no specs exist yet.")
            print("   Spec artifacts are ephemeral working documents, not committed to the repository.\n")
        else:
            print("ℹ️  No .agents/specs/ directory found. Nothing to validate.")
            sys.exit(0)

    if run_project:
        check_architecture(root)
        check_readme(root)
        check_design_docs_index(root)

    # Filter by severity
    severity_order = {"error": 0, "warning": 1, "info": 2}
    min_level = severity_order[args.severity]
    filtered = [(s, c, m) for s, c, m in findings if severity_order[s] <= min_level]

    if args.json:
        import json
        output = [{"severity": s, "category": c, "message": m} for s, c, m in filtered]
        print(json.dumps(output, indent=2))
        sys.exit(1 if any(s == ERROR for s, _, _ in filtered) else 0)

    # Group by severity
    errors = [(c, m) for s, c, m in filtered if s == ERROR]
    warnings = [(c, m) for s, c, m in filtered if s == WARNING]
    infos = [(c, m) for s, c, m in filtered if s == INFO]

    if errors:
        print(f"❌ Errors ({len(errors)}):\n")
        for cat, msg in errors:
            print(f"  [{cat}] {msg}")
        print()

    if warnings:
        print(f"⚠️  Warnings ({len(warnings)}):\n")
        for cat, msg in warnings:
            print(f"  [{cat}] {msg}")
        print()

    if infos:
        print(f"ℹ️  Info ({len(infos)}):\n")
        for cat, msg in infos:
            print(f"  [{cat}] {msg}")
        print()

    total = len(filtered)
    if total == 0:
        print("✅ All documentation checks passed.")
    else:
        print(f"📊 Summary: {len(errors)} error(s), {len(warnings)} warning(s), {len(infos)} info(s)")

    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
