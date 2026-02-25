---
name: committing-changes
description: Creates git commits from outstanding changes following Conventional Commits. Use this skill when asked to commit, stage, or save work to git.
metadata:
  version: "1.0"
---

# Committing Changes

## Workflow

1. Review conversation history to understand what was accomplished.
2. Inspect the working tree status (`git status`) and diff (`git diff`) to understand outstanding modifications. Run `git log` to see recent commit messages for style.
3. Verify staged changes with `git diff --cached` and run tests/lint if applicable before committing.
4. Determine whether changes should form one commit or multiple atomic commits. Group related files together.
5. Stage files explicitly — never use `-A` or `.` with `git add`. Prefer adding specific files by name to avoid accidentally including sensitive files (.env, credentials) or large binaries.
6. Write commit messages following the format and rules below.
7. Create the commit(s) and confirm the result by reviewing recent git log.

## Safety Protocol

- **Never run destructive git commands** (push --force, reset --hard, checkout ., restore ., clean -f, branch -D) unless the user explicitly requests these actions.
- **Never skip hooks** (--no-verify, --no-gpg-sign) unless the user explicitly requests it.
- **Never force push** to main/master — warn the user if they request it.
- **Always create new commits** rather than amending, unless the user explicitly requests amending. When a pre-commit hook fails, the commit did NOT happen — so --amend would modify the PREVIOUS commit, potentially destroying work. Instead, fix the issue, re-stage, and create a NEW commit.
- **Warn about sensitive files** — Do not commit files that likely contain secrets (.env, credentials.json, etc). Alert the user if they specifically request these files be committed.

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

## Important Notes

- **Do not push** to the remote repository unless the user explicitly asks.
- **No interactive git commands** — Avoid commands with the `-i` flag (like `git rebase -i` or `git add -i`) since they require interactive input.
- **No --no-edit with rebase** — The `--no-edit` flag is not valid for git rebase.
- **No empty commits** — If there are no changes to commit (no untracked files and no modifications), do not create an empty commit.
- **Use HEREDOC for messages** — Pass the commit message via a HEREDOC to ensure correct formatting:
  ```bash
  git commit -m "$(cat <<'EOF'
  Commit message here.
  EOF
  )"
  ```

## Rules

- Never add co-author information, Claude attribution, or "Generated with" messages.
- Never add "Co-Authored-By" trailers.
- Write commit messages as if the user wrote them.
- Keep commits focused and atomic.
- Do not commit debugging artifacts (console.logs, temporary code, secrets).
