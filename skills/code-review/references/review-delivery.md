# Review Delivery: GitHub PR Review Flow

How a code-review pass is published when the branch has an open PR (SKILL.md §6).
Load this file when composing or submitting a review. It covers the internal findings
schema, inline-position mapping, the review body, the API payload, error handling, and
the local fallback format.

## 1. Internal findings schema (working format)

Findings are held internally in this shape during the review. It is the **input** to
position mapping and comment composition — it is not the final deliverable.

```json
{
  "findings": [
    {
      "id": "F-001",
      "title": "Short imperative description (≤80 chars)",
      "category": "security | correctness | architecture | performance | maintainability | test-gap | polish | dependencies | migration | dx | docs",
      "pass": 1 | 2 | 3 | 4 | "large-review",
      "severity": "critical | high | medium | low",
      "confidence": 0.0-1.0,
      "priority": "P0 | P1 | P2 | P3",
      "leverage": "high | medium | low",
      "impact": "What breaks, gets riskier, slows down, or becomes harder to maintain",
      "effort": "S | M | L",
      "fix_risk": "low | medium | high",
      "depends_on_findings": ["F-001"],
      "introduced_status": "introduced | pre_existing_in_touched_code | pre_existing_exposed_by_change",
      "evidence": [
        {
          "file": "relative/path/to/file.ext",
          "line": 42,
          "context": "<2-3 lines of surrounding code, optional>"
        }
      ],
      "description": "What's wrong and why it matters (1-3 sentences)",
      "recommendation": "How to fix it (specific, actionable)",
      "fix_sketch": "Minimal implementation direction. For critical/high findings include likely files/symbols, test pattern, verification command, and any stop condition.",
      "why_tests_not_catching": "If applicable — why existing tests don't already cover this"
    }
  ],
  "rejected_findings": [
    {
      "title": "Issue considered but rejected",
      "reason": "Why this is by-design, pre-existing-only, speculative, not_worth_flagging, or otherwise not a finding",
      "evidence": "file:line or brief note"
    }
  ],
  "scope": {
    "mode": "branch | unstaged | commit | commits | files",
    "scale": "XS | S | M | L | XL",
    "target": "description of what was reviewed",
    "not_audited": ["Areas or categories intentionally skipped because of scope/scale"]
  },
  "verdict": "approve | approve-with-changes | changes-requested",
  "verdict_explanation": "1-3 sentences justifying the verdict"
}
```

Verdict rules (unchanged):

| Verdict | When |
|---------|------|
| **approve** | No critical or high findings. Code is well-structured and ready. |
| **approve-with-changes** | Medium/low findings only. Non-blocking improvements suggested. |
| **changes-requested** | Critical or high findings that must be addressed before merge. |

## 2. Prior review dispositions

Every rerun is a fresh review, but it must open by accounting for what a previous review
already flagged (SKILL.md §1d). Fetch the prior threads:

```bash
# Review summaries (verdict + body)
gh pr view <n> --json reviews --jq '.reviews[] | {state, body, submittedAt, author: .author.login}'

# Inline review comments (thread roots + replies)
gh api repos/{owner}/{repo}/pulls/<n>/comments \
  --jq '.[] | {id, in_reply_to_id, path, line, original_line, body, created_at, author: .user.login}'
```

Reconstruct threads by grouping on `in_reply_to_id` (`null` = thread root). Author replies
inside a thread often clarify intent — read them before disposing of the finding.

Verify each prior finding against the **current** branch:

| Disposition | Meaning |
|-------------|---------|
| **confirmed fixed** | Resolved at the cited location (or the fix is visible in the current diff). Do not re-flag; note where it was fixed. |
| **still present** | Remains in the current code. Re-flag inline with a reference to the prior finding id. |
| **partially addressed** | Part fixed, part remains. Re-flag only the remaining part. |
| **superseded / moot** | The code path changed or was removed; the finding no longer applies. |
| **not verifiable** | Cannot confirm status from the current code; say why. |

The new review body opens with a disposition table (§5). Never silently drop a prior
finding; never re-flag a confirmed-fixed one.

## 3. Inline comment position rules

- GitHub review comments can only attach to lines shown in the PR diff
  (`gh pr diff <number>`).
- `line` = line number in the **new** file, `side: "RIGHT"` (the default) — for added,
  modified, and context lines inside a hunk.
- `original_line` + `side: "LEFT"` — for lines that only exist in the **old** file
  (deleted lines).
- A line that is not inside any diff hunk of its file → cannot be commented inline;
  carry it in the review body instead. This is common for pre-existing issues on
  untouched lines.
- Files not touched by the PR → body only.
- Attach each finding to its **primary** evidence line — the line where the fix goes.
  For multi-location findings, one inline comment plus a body cross-reference beats
  several scattered comments.
- Deleted files: treat as body-only (do not attempt inline comments on them).

## 4. Mapping helper

`skills/code-review/scripts/map-diff-positions.mjs` resolves evidence against the PR
diff and reports where each finding can be commented inline.

```bash
# .agents/review-findings.json (gitignored scratch):
# [ { "id": "F-001", "file": "src/a.ts", "line": 42 }, ... ]
node skills/code-review/scripts/map-diff-positions.mjs \
  --pr <number> \
  --evidence .agents/review-findings.json
```

Output — one entry per input finding, in order:

```json
[
  { "id": "F-001", "commentable": true,  "position": { "path": "src/a.ts", "line": 42, "side": "RIGHT" } },
  { "id": "F-002", "commentable": false, "reason": "line 10 is not inside a diff hunk of src/b.ts" }
]
```

Build one inline comment per `commentable` entry; fold `commentable: false` entries into
the review body with a one-line note each.

## 5. Review body template

The body is what a maintainer reads first; the inline comments carry the detail.

```markdown
## Code Review — <PR title or short scope>

**Verdict:** <approve | approve-with-changes | changes-requested>
**Scale:** <XS/S/M/L/XL> · **Not audited:** <list or "none">

### Prior review dispositions
| Prior finding | Disposition | Note |
|---------------|-------------|------|
| F-001 (security) | confirmed fixed | Fixed in <commit>; null check now at src/a.ts:42. |
| F-002 (perf) | still present | Re-flagged inline below. |
| F-003 (architecture) | superseded | Code path removed in refactor. |

### Top findings (new or still present)
- **F-001** (security, critical) — <title> — <file:line>
- **F-002** (architecture, medium) — <title> — <file:line>

### Context-only / pre-existing notes
- <pre-existing or out-of-diff issues worth mentioning; not blocking>

### Positive aspects
- <what was done well, with file:line references>

### Notes
- <dependencies between findings, deployment considerations, deferred items>
```

Keep the body under ~4,000 characters — GitHub truncates longer bodies.

## 6. Review payload and submission

Inline comment bodies: start with the finding id, category, and severity, then the
description and the specific fix. Re-flagged prior findings start with
`**Re-flag of prior F-XXX** — ...` so maintainers can connect the threads.

```json
{
  "commit_id": "<head SHA: gh pr view <number> --json headRefOid --jq .headRefOid>",
  "event": "REQUEST_CHANGES",
  "body": "# Code Review — ...\n\n**Verdict:** changes-requested\n...",
  "comments": [
    {
      "path": "src/a.ts",
      "line": 42,
      "side": "RIGHT",
      "body": "**F-001 (security, critical)** — <title>\n\n<description>\n\n**Fix:** <recommendation>"
    }
  ]
}
```

```bash
gh api --method POST repos/{owner}/{repo}/pulls/<number>/reviews --input .agents/review.json
```

- Get `owner/repo` with `gh repo view --json nameWithOwner --jq .nameWithOwner`.
- **Never use `gh pr review` for this** — it cannot attach inline comments.
- Always include `commit_id` (the PR head SHA): required for fork PRs, harmless otherwise.
- After submitting, confirm it landed:
  `gh pr view <number> --json reviews --jq '.reviews[-1] | {state, body}'`.

### Verdict → GitHub event

| Verdict | `event` | When |
|---------|---------|------|
| **approve** | `APPROVE` | No critical/high findings. May still carry informational comments. |
| **approve-with-changes** | `COMMENT` | Medium/low findings only — non-blocking suggestions. |
| **changes-requested** | `REQUEST_CHANGES` | Critical/high or otherwise blocking findings. |

## 7. Error handling

- **422 "line must be part of the diff"** — drop that comment into the body and resubmit.
- **403/404** — run `gh auth status`; for private repos confirm membership or auth scopes.
- **Body truncated** — trim the body; the inline comments carry the detail.
- **Too many comments** — GitHub caps review payloads; merge sibling findings and move
  low-severity items to the body.
- **No `gh` or unauthenticated** — fall back to the local format (§9) and say why.

## 8. Re-review etiquette

- A new submission adds a new review to the PR history — that is expected after the
  author pushes fixes.
- Every prior finding gets an explicit disposition (§2); a confirmed-fixed finding is
  acknowledged, not re-flagged.
- One review per pass; do not spam multiple submissions.
- No @-mentions; no comments on unrelated lines.

## 9. Local fallback (no PR / explicit request)

When there is no open PR or the user asks for a local pass, produce the **JSON findings
list** followed by a concise **markdown summary**. Do not create a PR, branch, or
review without being asked.

```markdown
## Review Summary

**Scope:** [mode] — [target]
**Scale:** [XS/S/M/L/XL]
**Verdict:** [approve / approve-with-changes / changes-requested]
**Not Audited:** [anything intentionally skipped because of scope/scale]

### Critical/High Findings
- **F-001** ([category]) — [title] — [file:line]

### Medium/Low Findings
- **F-002** ([category]) — [title] — [file:line]

### Positive Aspects
- [What was done well, with file:line references]

### Notes
- [Any context, deployment considerations, or deferred items]
- [Dependency ordering between findings, if any]

### Rejected Findings
- [Optional: likely concerns reviewed and rejected, with brief reason]
```
