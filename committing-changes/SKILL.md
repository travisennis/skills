---
name: committing-changes
description: Creates git commits from outstanding changes following Conventional Commits. Use when asked to commit, stage, or save work to git.
user-invocable: true
---

# Committing Changes

## Workflow

1. Review conversation history to understand what was accomplished.
2. Inspect the working tree status and diff to understand outstanding modifications.
3. Determine whether changes should form one commit or multiple atomic commits. Group related files together.
4. Stage files explicitly — never use `-A` or `.` with `git add`.
5. Write commit messages in imperative mood following Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, etc.). Focus on *why* the change was made, not just what changed.
6. Create the commit(s) and confirm the result by reviewing recent git log.

## Rules

- Never add co-author information, Claude attribution, or "Generated with" messages.
- Never add "Co-Authored-By" trailers.
- Write commit messages as if the user wrote them.
- Keep commits focused and atomic.
