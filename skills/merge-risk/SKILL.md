---
name: merge-risk
description: Assess the risk of merging a PR before it lands. Scores alignment, impact, verification, rollback cost, and error detection against evidence from the diff, linked issue, tests, CI, and runtime proof, then returns a low/medium/high verdict plus the gaps that drive it. Use when deciding whether a PR is safe to merge, what needs more evidence, or which of several PRs to land first.
user-invocable: true
metadata:
  version: "1.0"
---

# Merge Risk

Judge a PR as a merge decision, not as a code review. The question is not "is
this code good?" but "what could go wrong if this lands, and how would we know?"

This skill does not look for defects in the change; it decides whether the evidence
supports merging it. It is a merge decision, not an author-side readiness pass.

## Gather evidence first

Read the change and its context before scoring anything:

```bash
gh pr view <number> --json title,body,author,baseRefName,headRefName,files,commits,statusCheckRollup
gh pr diff <number>
gh issue view <linked-issue>
```

If `gh` is unavailable or the PR is described only in conversation, use the
branch diff (`git diff <base>...<head>`), the PR body, and the linked issue or
task. Do not score a category you have not looked at.

Evidence to check:

- PR description, linked issue or task, and any linked design doc
- The full diff, including generated files, lockfiles, config, migrations, and
  dependency bumps that are easy to skim past
- Tests added or changed, and whether they actually exercise the new behavior
- CI status; distinguish passing from absent
- Screenshots or recordings for user-visible changes
- Benchmarks or profiles for performance-sensitive changes
- Deploy, migration, and rollback notes for stateful changes
- Monitoring, alerting, and logging touched by the change

Missing evidence is not neutral. It lowers the category score, and the output
must say what is missing. If the PR body itself is the only source for a claim,
say so.

## Categories

Each category gets one verdict. What "low risk" means:

- **Alignment (⚠️ poor / 👀 decent / ✅ good):** The code matches the
  description, the linked issue or task, and the repo's stated conventions.
  Unstated behavior changes, drive-bys, and scope creep lower this score. When
  the author documents an assumption or tradeoff, it can still score well.
- **Impact (⚠️ large / 👀 medium / ✅ small):** Scope is contained and away
  from sensitive paths.
  - Consider blast radius: layout shift, breakage for consumers, mobile
    responsiveness, data shape changes, and public API or CLI behavior.
  - Sensitive areas carry outsized risk regardless of diff size: auth,
    permissions, payments, PII, secrets, data migrations, dependency bumps, and
    infra or config changes. Flag any that are touched, and call out anything
    that widens access, weakens validation, or logs sensitive data.
- **Verification (⚠️ poor / 👀 decent / ✅ good):** Behavior is verified in
  proportion to the risk.
  - User-visible changes need end-to-end proof as screenshots or recordings.
    Changes that could meaningfully affect performance need profiling. Prefer
    before-and-after evidence to standalone proof. When this coverage is
    lacking, it is a failure.
  - Edge cases must be tested, or explicitly documented as untested. Review the
    tests closely and link the relevant test or code when only documentation is
    present.
- **Rollback cost (⚠️ high / 👀 medium / ✅ low):** The change is reversible
  after merge. Prefer two-way doors. A cheap revert is low risk; destructive
  actions, irreversible migrations, and hard-to-undo decisions are one-way
  doors that raise it.
- **Error detection (⚠️ poor / 👀 decent / ✅ good / N/A ✅):** Critical flows
  are monitored. If this breaks in production, someone finds out before users
  report it. Look for swallowed errors, silent fallbacks, and alerting that the
  change removes or bypasses.

If a category genuinely does not apply, mark it N/A with a one-line reason
rather than inventing evidence.

## Score

Verdicts: ⚠️ = 3, 👀 = 2, ✅ = 1.

Weights:

- Impact = 2x
- Verification = 2x
- Rollback cost = 1.5x
- Error detection = 1x
- Alignment = 1x

Score = Σ(score × weight) / Σ(weights). Omit N/A categories from both sums.

- low: < 1.5
- medium: 1.5 – < 2.25
- high: ≥ 2.25

## Output

```
**Merge risk: low | medium | high**

**Alignment (✅/👀/⚠️):** <verdict>
- <gap that raises risk, with links to files or PR comments>
- <missing evidence, if any>

**Impact (...):** <verdict>
...

**Verification (...):** <verdict>
...

**Rollback cost (...):** <verdict>
...

**Error detection (...):** <verdict>
...
```

Close with one or two sentences naming the single change that would most reduce
risk, and whether anything makes this a one-way door.

Keep the numerical score and its calculation internal; do not include them in
the output.
