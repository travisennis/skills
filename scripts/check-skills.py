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
INLINE_CODE_RE = re.compile(r"(?<!`)`([^`\n]+)`(?!`)")
REPO_SKILL_PATH_RE = re.compile(r"(?<![\w.-])skills/([a-z0-9]+(?:-[a-z0-9]+)*)/")
PATH_STRIP_CHARS = "'\"`,;:()[]<>"
# Names that are also ordinary directory names; a bare `docs/adr/` is a project
# path, not a reference to the `docs` skill.
GENERIC_PATH_PREFIXES = {"docs"}

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


def is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
    except ValueError:
        return False
    return True


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
        if not is_within(resolved, skill_dir.resolve()):
            report.error(path, f"relative link escapes the skill directory: {target}")
            continue
        if not resolved.exists():
            report.error(path, f"broken relative link: {target}")


def check_sibling_names(
    path: Path,
    text: str,
    skill_name: str,
    skill_names: set[str],
    seen: set[str],
    report: Report,
) -> None:
    """Warn when a skill names a sibling skill instead of standing alone."""
    for match in INLINE_CODE_RE.finditer(text):
        span = match.group(1).strip()
        invocation = span.split()[0].lstrip("/") if span.split() else ""
        for candidate in (span, invocation):
            candidate = candidate.strip(PATH_STRIP_CHARS)
            if candidate in skill_names and candidate != skill_name and candidate not in seen:
                seen.add(candidate)
                report.warning(
                    path,
                    f"references sibling skill '{candidate}'; each skill must work installed alone",
                )

    # Bare names are only checked when the hyphen makes them unambiguous.
    prose = INLINE_CODE_RE.sub(" ", text)
    for other in sorted(skill_names - {skill_name}):
        if "-" not in other or other in seen:
            continue
        if re.search(rf"(?<![\w/-]){re.escape(other)}(?![\w/-])", prose):
            seen.add(other)
            report.warning(
                path,
                f"references sibling skill '{other}'; each skill must work installed alone",
            )


def check_cross_skill_paths(
    skill_dir: Path,
    path: Path,
    text: str,
    skill_names: set[str],
    report: Report,
) -> None:
    """Reject paths that leave the skill directory or assume the repo layout."""
    dir_resolved = skill_dir.resolve()
    for match in INLINE_CODE_RE.finditer(strip_fenced_code(text)):
        for token in match.group(1).split():
            token = token.strip(PATH_STRIP_CHARS)
            if token.startswith(("../", "..\\")):
                resolved = (path.parent / token).resolve()
                if not is_within(resolved, dir_resolved):
                    report.error(path, f"path escapes the skill directory: {token}")
            first_segment = token.split("/", 1)[0]
            if (
                "/" in token
                and first_segment in skill_names - GENERIC_PATH_PREFIXES
                and first_segment != skill_dir.name
            ):
                report.error(
                    path,
                    f"path into sibling skill '{first_segment}': {token}; bundle the file or resolve it from this skill",
                )

    # Repo-relative paths also appear in fenced shell examples.
    for match in REPO_SKILL_PATH_RE.finditer(text):
        if match.group(1) in skill_names:
            report.error(
                path,
                f"repo-relative skill path: {match.group(0)}; resolve paths from the skill directory",
            )


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


def validate_skill(
    skill_dir: Path,
    max_lines: int,
    skill_names: set[str],
    report: Report,
) -> str | None:
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
    seen_siblings: set[str] = set()
    if not isinstance(description, str) or not description.strip():
        report.error(path, "missing or non-string 'description'")
    else:
        if len(description.strip()) > 1024:
            report.error(path, f"description is {len(description.strip())} characters (max 1024)")
        check_sibling_names(path, description, skill_dir.name, skill_names, seen_siblings, report)

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
        markdown_text = markdown.read_text(encoding="utf-8")
        check_links(skill_dir, markdown, markdown_text, report)
        check_cross_skill_paths(skill_dir, markdown, markdown_text, skill_names, report)
        if markdown == path:
            check_sibling_names(
                markdown, markdown_text, skill_dir.name, skill_names, seen_siblings, report
            )

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
    skill_names = {skill_dir.name for skill_dir in skill_dirs}
    for skill_dir in skill_dirs:
        name = validate_skill(skill_dir, args.max_lines, skill_names, report)
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
