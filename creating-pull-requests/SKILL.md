---
name: creating-pull-requests
description: Creates pull request descriptions by analyzing branch diffs. Use when opening a PR, drafting a PR description, or preparing changes for review.
user-invocable: true
---

## Inputs

- Base branch (e.g., `main`) — if not provided, infer from the repository's default branch
- Optional: ticket or user-story reference

## Workflow

1. Verify the working tree is clean.
2. Fetch the latest remote branches.
3. Determine the base branch and review the diff between the base and the current feature branch.
4. Analyze the diff, noting:
   - Major modules or directories touched
   - New, modified, and deleted files
   - Significant refactors or breaking API changes
5. Draft the PR description using the [template](references/TEMPLATE.md), filling in each section based on the diff analysis.
6. If a ticket or user-story reference was provided, include it in the description.
