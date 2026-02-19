---
name: committing-changes
description: Creates git commits from outstanding changes following Conventional Commits. Use this skill when asked to commit, stage, or save work to git.
user-invocable: true
---

# Committing Changes

## Workflow

1. Review conversation history to understand what was accomplished.
2. Inspect the working tree status and diff to understand outstanding modifications.
3. Verify staged changes with `git diff --cached` and run tests/lint if applicable before committing.
4. Determine whether changes should form one commit or multiple atomic commits. Group related files together.
5. Stage files explicitly — never use `-A` or `.` with `git add`.
6. Write commit messages following the format and rules below.
7. Create the commit(s) and confirm the result by reviewing recent git log.

## Conventional Commits Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Purpose |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, missing semicolons) |
| `refactor` | Code refactoring (no behavior change) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system or external dependencies |
| `ci` | CI configuration changes |
| `chore` | Maintenance tasks |
| `revert` | Revert a previous commit |

### Scope (Optional)
- Should be a noun describing the module/component
- Use kebab-case: `api`, `ui-components`, `database`
- Keep it concise and consistent

### Description
- Use imperative mood: "add" not "added" or "adds"
- First letter lowercase, no period at end
- Max 72 characters
- Be specific: "fix memory leak in image processing" not "fix bug"

### Body (Optional)
- Separate from description with blank line
- Explain *what* and *why*, not *how* (code shows how)
- Wrap at 72 characters
- Use bullet points for multiple changes

### Footer (Optional)
- Reference issues: `Fixes #123`, `Closes #456`
- Breaking changes: `BREAKING CHANGE: API response format changed`

## Rules

- Never add co-author information, Claude attribution, or "Generated with" messages.
- Never add "Co-Authored-By" trailers.
- Write commit messages as if the user wrote them.
- Keep commits focused and atomic.
- Do not commit debugging artifacts (console.logs, temporary code, secrets).
