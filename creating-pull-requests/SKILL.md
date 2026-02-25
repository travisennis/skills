---
name: creating-pull-requests
description: Creates pull request descriptions by analyzing branch diffs. Use when opening a PR, drafting a PR description, or preparing changes for review.
metadata:
  version: "1.0"
---

## Inputs

- Base branch (e.g., `main`) — if not provided, infer from the repository's default branch
- Optional: ticket or user-story reference

## Workflow

1. **Gather context** — Run in parallel:
   - `git status` to see untracked files (never use `-uall` flag)
   - `git diff` to see staged and unstaged changes
   - Check if current branch tracks a remote and is up to date
   - `git log` and `git diff [base-branch]...HEAD` to understand the full commit history from when the branch diverged
2. Verify the working tree is clean.
3. Fetch the latest remote branches.
4. Determine the base branch and review the diff between the base and the current feature branch.
5. **Analyze ALL commits** — Not just the latest commit, but every commit that will be included in the PR.
6. Analyze the diff, noting:
   - Major modules or directories touched
   - New, modified, and deleted files
   - Significant refactors or breaking API changes
7. Draft the PR description using the [template](references/TEMPLATE.md), filling in each section based on the diff analysis.
8. If a ticket or user-story reference was provided, include it in the description.
9. **Create the PR** using `gh pr create` with a HEREDOC for the body using the [template](references/TEMPLATE.md):
   ```bash
   gh pr create --title "PR title" --body "$(cat <<'EOF'
   ### What & Why
   - <1-3 bullet points describing the changes>

   ### How
   - <Brief description of implementation>

   ### Areas of Focus for Review
   - <Specific areas to focus on>

   ### Test Plan
   - [ ] <Test case 1>
   - [ ] <Test case 2>
   
   ### Screenshots / Demos
   - 
   EOF
   )"
10. **Return the PR URL** to the user so they can view it.

## PR Title Guidelines

- Keep the title short (under 70 characters)
- Use the description/body for details, not the title
