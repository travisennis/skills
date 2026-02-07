---
name: fixing-merge-conflicts
description: Resolves merge conflicts on the current Git branch non-interactively. Use when a merge, rebase, or cherry-pick leaves conflict markers in the working tree.
user-invocable: true
---

Resolve all merge conflicts on the current Git branch and produce a clean, buildable, tested working tree. Do not prompt for input — choose sensible defaults and explain decisions in a brief summary. Do not push or tag; only commit locally.

## Workflow

1. **Detect conflicts**
   - Identify files with conflict markers (`<<<<<<<` / `=======` / `>>>>>>>`).
   - If the working tree is not inside a Git repository, stop and report.

2. **Resolve conflicts per file**
   - Open each conflicting file and remove conflict markers.
   - Merge both sides logically when feasible. If mutually exclusive, prefer the variant that compiles, passes type checks, and preserves existing public APIs.
   - Language-aware strategy:
     - **Package manifests** (package.json, etc.): merge keys conservatively; regenerate lockfiles via the package manager rather than editing them by hand.
     - **Lockfiles** (package-lock.json, yarn.lock, pnpm-lock.yaml): always regenerate.
     - **Generated files / build artifacts**: prefer keeping them out of version control; otherwise prefer the current branch (ours).
     - **Config files**: preserve the union of safe settings; do not delete required fields.
     - **Text / Markdown**: include both sides' unique content; deduplicate headings.
     - **Binary files**: prefer the current branch (ours) unless project docs indicate otherwise.

3. **Validate**
   - If manifests changed, install dependencies.
   - Run any available lint, typecheck, build, and test commands for the detected ecosystem (Node/TypeScript, Python, Go, etc.).

4. **Finalize**
   - Stage all resolved files and any regenerated lockfiles.
   - Create a single commit with an appropriate message describing the conflict resolution.
   - Output a concise summary of files touched and notable resolution choices.

## Guidelines

- Prefer minimal, correct changes that preserve both sides' intent.
- If a resolution is ambiguous and blocks the build, prefer the variant that compiles and passes tests.
- If conflict markers remain after a first pass, revisit and resolve before proceeding.
- For large refactors causing conflicts, keep imports, types, and module boundaries consistent.
- Keep edits minimal and readable; do not reformat unrelated code.
