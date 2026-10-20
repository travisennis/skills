#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pyyaml>=6"]
# ///
"""Validate the skill collection's structure and documentation links."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import unquote

import yaml

NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
MD_LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
FENCE_RE = re.compile(r"^\s*(```|~~~)")

ALLOWED_KEYS = {
    "name",
    "description",
    "license",
    "allowed-tools",
    "metadata",
    "user-invocable",
    "disable-model-invocation",
    "compatibility",
}

SKIP_FILES = {
    ".DS_Store",
    ".gitignore",
    "package.json",
    "package-lock.json",
    "LICENSE",
    "LICENSE.txt",
}


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, path: Path | str, message: str) -> None:
        self.errors.append(f"{path}: {message}")

    def warning(self, path: Path | str, message: str) -> None:
        self.warnings.append(f"{path}: {message}")


def strip_fenced_code(text: str) -> str:
    kept: list[str] = []
    in_fence = False
    for line in text.splitlines():
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if not in_fence:
            kept.append(line)
    return "\n".join(kept)


def referenced_in(body: str, relpath: str, name: str) -> bool:
    if relpath in body or name in body:
        return True
    parent = Path(relpath).parent.as_posix()
    while parent not in {"", ".", "references", "templates", "assets"}:
        if parent + "/" in body or parent in body:
            return True
        parent = Path(parent).parent.as_posix()
    return False


def check_links(skill_dir: Path, path: Path, text: str, report: Report) -> None:
    for match in MD_LINK_RE.finditer(strip_fenced_code(text)):
        target = unquote(match.group(1).strip())
        if not target or target.startswith(("#", "http://", "https://", "mailto:")):
            continue
        if any(char in target for char in "{<>*}") or "..." in target:
            continue
        target = target.split("#", 1)[0]
        if not target:
            continue
        resolved = (path.parent / target).resolve()
        if not resolved.exists():
            report.error(path, f"broken relative link: {target}")


def collect_skill_files(skill_dir: Path) -> list[Path]:
    files: list[Path] = []
    for candidate in skill_dir.rglob("*"):
        if not candidate.is_file():
            continue
        rel = candidate.relative_to(skill_dir)
        if any(part in {"node_modules", "__pycache__"} for part in rel.parts):
            continue
        if rel.as_posix() == "SKILL.md" or candidate.name in SKIP_FILES:
            continue
        if rel.parts[0] in {"references", "templates"} or (
            len(rel.parts) == 1 and candidate.suffix == ".md"
        ):
            files.append(candidate)
    return files


def validate_skill(skill_dir: Path, max_lines: int, report: Report) -> str | None:
    path = skill_dir / "SKILL.md"
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(text)
    if not match:
        report.error(path, "missing or malformed YAML frontmatter")
        return None

    try:
        frontmatter = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        report.error(path, f"invalid YAML frontmatter: {exc}")
        return None

    if not isinstance(frontmatter, dict):
        report.error(path, "frontmatter must be a mapping")
        return None

    unexpected = sorted(set(frontmatter) - ALLOWED_KEYS)
    if unexpected:
        report.error(path, f"unexpected frontmatter keys: {', '.join(unexpected)}")

    name = frontmatter.get("name")
    if not isinstance(name, str) or not name.strip():
        report.error(path, "missing or non-string 'name'")
        name = None
    else:
        name = name.strip()
        if not NAME_RE.fullmatch(name):
            report.error(path, f"name '{name}' must be lowercase kebab-case")
        if len(name) > 64:
            report.error(path, f"name is {len(name)} characters (max 64)")
        if name != skill_dir.name:
            report.error(path, f"name '{name}' does not match directory '{skill_dir.name}'")

    description = frontmatter.get("description")
    if not isinstance(description, str) or not description.strip():
        report.error(path, "missing or non-string 'description'")
    else:
        if len(description.strip()) > 1024:
            report.error(path, f"description is {len(description.strip())} characters (max 1024)")

    for flag in ("user-invocable", "disable-model-invocation"):
        if flag in frontmatter and not isinstance(frontmatter[flag], bool):
            report.error(path, f"'{flag}' must be a boolean")

    metadata = frontmatter.get("metadata")
    if metadata is not None:
        if not isinstance(metadata, dict):
            report.error(path, "'metadata' must be a mapping")
        elif "version" in metadata and not isinstance(metadata["version"], str):
            report.error(path, "'metadata.version' must be a string")

    line_count = text.count("\n") + (0 if text.endswith("\n") else 1)
    if line_count > max_lines:
        report.error(path, f"{line_count} lines exceeds the {max_lines}-line limit")

    body = text[match.end() :]
    if not body.strip():
        report.error(path, "SKILL.md body is empty")

    all_markdown = "\n".join(
        markdown.read_text(encoding="utf-8")
        for markdown in skill_dir.rglob("*.md")
        if not any(part in {"node_modules", "__pycache__"} for part in markdown.parts)
    )
    for candidate in collect_skill_files(skill_dir):
        rel = candidate.relative_to(skill_dir).as_posix()
        if not referenced_in(all_markdown, rel, candidate.name):
            report.warning(candidate, "support file is not referenced from any skill markdown")

    for markdown in skill_dir.rglob("*.md"):
        rel = markdown.relative_to(skill_dir)
        if any(part in {"node_modules", "__pycache__"} for part in rel.parts):
            continue
        check_links(skill_dir, markdown, markdown.read_text(encoding="utf-8"), report)

    return name


def validate_readme(root: Path, names: set[str], report: Report) -> None:
    readme = root / "README.md"
    if not readme.exists():
        report.error(readme, "README.md not found")
        return

    listed = {
        match.group(1)
        for match in re.finditer(
            r"^\| ([a-z0-9]+(?:-[a-z0-9]+)*) \|", readme.read_text(encoding="utf-8"), re.MULTILINE
        )
    }
    missing = sorted(names - listed)
    extra = sorted(listed - names)
    if missing:
        report.error(readme, f"skills missing from the table: {', '.join(missing)}")
    if extra:
        report.error(readme, f"table lists unknown skills: {', '.join(extra)}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parent.parent,
        help="repository root (default: parent of this script)",
    )
    parser.add_argument("--max-lines", type=int, default=500)
    parser.add_argument(
        "--strict",
        action="store_true",
        help="treat warnings as errors",
    )
    args = parser.parse_args()

    root = args.root.resolve()
    skills_dir = root / "skills"
    skill_dirs = sorted(path.parent for path in skills_dir.glob("*/SKILL.md"))
    if not skill_dirs:
        print(f"No skills found under {skills_dir}", file=sys.stderr)
        return 1

    report = Report()
    names: set[str] = set()
    for skill_dir in skill_dirs:
        name = validate_skill(skill_dir, args.max_lines, report)
        if name:
            if name in names:
                report.error(skill_dir / "SKILL.md", f"duplicate skill name: {name}")
            names.add(name)

    validate_readme(root, names, report)

    for message in report.errors:
        print(f"ERROR {message}")
    for message in report.warnings:
        print(f"WARN  {message}")

    print(
        f"Checked {len(skill_dirs)} skills: "
        f"{len(report.errors)} error(s), {len(report.warnings)} warning(s)"
    )

    if report.errors:
        return 1
    if args.strict and report.warnings:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
