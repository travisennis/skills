---
name: cloning-repos-for-research
description: Clone a GitHub or other git repository into /tmp for temporary research and investigation. Use when the user asks to inspect, research, audit, compare, or understand an external git repository without adding it to the current workspace.
metadata:
  version: "1.0"
---

# Cloning Repos for Research

Clone external git repositories into `/tmp` when the user wants temporary research access without modifying the current project.

## Rules

- Clone into `/tmp`, not into the current workspace.
- Treat the clone as disposable research material.
- Do not commit, push, open PRs, or make lasting changes in the cloned repository unless the user explicitly asks.
- Do not run install scripts, build scripts, package scripts, or project code unless needed for the research task and clearly safe.
- Do not ask the user to paste secrets or tokens into chat. For private repos, use existing local git or `gh` authentication; if auth is missing, ask the user to authenticate locally.
- Keep any notes or deliverables in the user's requested location. If none is requested, summarize findings in chat rather than writing files into the cloned repo.

## Workflow

1. Identify the repository URL and any requested branch, tag, commit, or subdirectory.
   - If the user provides GitHub shorthand like `owner/repo`, treat it as `https://github.com/owner/repo.git`.
   - If the user provides `github.com/owner/repo`, normalize it to `https://github.com/owner/repo.git`.
   - Preserve explicit URLs such as SSH URLs, GitLab URLs, Bitbucket URLs, or self-hosted git URLs.
2. Choose a target path under `/tmp`:
   - Use a readable directory name based on the repo, such as `/tmp/<repo-name>`.
   - If that path already exists, inspect it before reusing it. Prefer a unique suffix such as `/tmp/<repo-name>-research` or `/tmp/<repo-name>-<short-sha>`.
3. Clone with the least history needed:
   ```bash
   git clone --depth 1 <repo-url> /tmp/<repo-name>
   ```
4. If the user requested a specific branch or tag:
   ```bash
   git clone --depth 1 --branch <branch-or-tag> <repo-url> /tmp/<repo-name>
   ```
5. If the user requested a specific commit, clone first, then fetch and check it out:
   ```bash
   git clone --depth 1 <repo-url> /tmp/<repo-name>
   cd /tmp/<repo-name>
   git fetch --depth 1 origin <commit-sha>
   git checkout --detach <commit-sha>
   ```
6. Record the exact revision before researching:
   ```bash
   git -C /tmp/<repo-name> rev-parse HEAD
   git -C /tmp/<repo-name> status --short
   ```
7. Investigate with read-oriented commands first: `rg`, `rg --files`, `find`, `git log`, `git ls-files`, and targeted file reads.
8. Only fetch submodules, Git LFS objects, full history, or additional branches when the research question requires them.

## When More Depth Is Needed

- Use `git fetch --unshallow` only when history analysis requires full history.
- Use `git submodule update --init --recursive` only when code needed for the research lives in submodules.
- Use `git lfs pull` only when large files are necessary for the investigation.
- If comparing branches, fetch only the named branches instead of all remotes when possible.

## Reporting

When reporting findings, include:

- The repository URL.
- The local `/tmp` path.
- The exact commit SHA investigated.
- Any branch, tag, submodule, or LFS choices that affected the investigation.
- Clear separation between verified facts and inferences.
