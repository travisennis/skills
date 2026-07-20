---
name: show-me-your-work
description: "Keep a reviewable decision trail for long-running, delegated, or unattended work using a TSV log with one row per decision: what, why, evidence, and result. Use when the user asks to see the agent's work, when multiple agents or phases contribute to a task, or when a human will review the result after stepping away. Keep the trail local by default; commit it when a reviewer needs it to trust the result."
disable-model-invocation: true
---

# Show me your work

For work a human reviews after the fact, a decision trail lets them reconstruct what was decided, why, and on what evidence, without rerunning the work or reading the whole transcript. Keep one canonical log so the trail is consistent and a future agent can find it.

## The format

A single TSV file, one row per decision. TSV works across agent environments: code hosts and spreadsheets can render it, terminal tools can format it, and any filesystem-capable agent can append a row. Cells stay single-line. Evidence is a pointer, not prose.

Start a clean log with the header row shown in the example below. Use these columns:

- **ts.** ISO8601 timestamp. The timeline axis.
- **phase.** The phase or workstream.
- **decision.** What was chosen or done, one line.
- **why.** The reason in plain words. If a principle drove it, say it plainly (`explored options first, this was a one-way door`), not as a jargon tag.
- **evidence.** A link or path that proves it: commit SHA, change-request number, `file:line`, or an artifact, trace, or screenshot path. Never a paragraph.
- **result.** The outcome or predicate state: `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open`.

An example, plain-spoken so a reviewer reads it at a glance. This is illustration only; don't copy these rows into a real log.

```
ts	phase	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## Logging a row

Write each entry the way you'd tell a teammate what you did. Use plain words, concrete actions, no AI speak, and no abstract jargon. A reviewer should understand each row without decoding it.

Use the active environment's file-editing tools to append rows. Stamp `ts` in ISO 8601, strip tabs and newlines from cells, and prefix any cell starting with `=`, `+`, `-`, or `@` with a single quote so opening the log in a spreadsheet cannot trigger formula execution. Preserve the header exactly.

Log decision points and checkpoints, not every action: a fork chosen, a unit completed with its verification result, a pivot or revert with its trigger, a blocker surfaced, a gate fixed. For loop runs, one row per iteration. Skip the trivial and self-evident.

## Where it lives

By default the log is a working artifact, not committed. Keep it at `decisions.tsv` in the work dir, or `.audit/<task-slug>.tsv` when several efforts run at once, and leave it out of git. Most work doesn't need a committed trail; the local log still keeps the run honest and can be discarded after.

Commit it only when the work is ambitious enough that a reviewer needs the trail to trust the result: a large cross-language port, a multi-week migration, anything where confidence has to be shown rather than assumed. When the repository host renders TSV files, a committed log becomes part of the review surface.

## Rules

- One row is one decision or checkpoint. If it doesn't fit on one line, the decision isn't crisp yet.
- Append-only. A wrong call gets a new row that supersedes it. Never edit or delete history.
- Prefer evidence produced by committed scripts over hand-made one-offs so a reviewer can re-run it.

## Working with other agents

Tell every delegated or collaborating agent where the canonical log lives and require it to return the rows its work produced. Use the `phase` cell to identify its workstream. If agents share a filesystem and serialized appends are safe, they may write to the log directly. Otherwise, have each agent return a TSV fragment and let the coordinating agent append those rows to the canonical log in timestamp order. The coordinating agent owns deduplication and the final audit; an agent's summary is not evidence by itself.

Use the delegation mechanism the environment provides: subagents, tasks, separate sessions, external agents, or a human handoff. Do not assume a particular agent product, command, transcript path, or model selector exists.

## Audit the log against the run

At the end of the run, before handing back, check that the log tells the truth. Use the current environment's record of the run: the active conversation, transcript, task history, tool trace, or equivalent. Discover that record from the environment's documented capabilities or current context; never search broad home-directory paths or inspect unrelated sessions.

If the environment exposes no durable run record, reconstruct the audit from the current conversation, tool results, version-control history, diffs, and referenced artifacts. State that limitation in the handoff instead of pretending the transcript was checked. Walk the log against what actually happened:

- Every row maps to a real action. Supersede invented or aspirational entries with a correction row.
- Each row's evidence resolves and shows what the row claims.
- A fork, pivot, or abandoned approach that shaped the work but isn't logged is a gap. Add it.
- Do not add padding. If nobody would audit a row, it doesn't earn its place.

Correct the log, not the story. Because the log is append-only, record a correction or superseding decision instead of rewriting an earlier row.

## Independent review of the trail

Before handing back, request an independent review through the strongest mechanism the environment provides: a delegated agent, a separate session, a different model, an external agent, or a human reviewer. Prefer a different model family when the environment identifies and lets you choose one, but do not claim model diversity you cannot verify. Give the reviewer the trail, the relevant run record, and access to the cited evidence. Ask for a scan of what is suboptimal or risky, not a redo of the work.

If no independent reviewer is available, perform the same review yourself and disclose that it was a self-review. Do not block completion solely because the host lacks delegation or model-selection features.

- Decisions logged with weak or absent evidence.
- Verification steps skipped or claimed without proof in the run record.
- Choices that look risky in hindsight (premature, scope-creeping, papering over a symptom).
- Gaps the user would otherwise miss on a casual skim.

Every final reply for a run that produced a trail ends with an "Attention" section. Identify the review source on its own line (`reviewed by <agent, model, human, or self-review>`), then list each flag with pointers to specific rows or moments. Use `No flags` when appropriate. The run audit asks whether the log tells the truth; this review asks what the user should still scrutinize even when it does.

## Reviewing the trail

Read top to bottom, follow the evidence pointers, and spot-check. Use the repository host's table view, a spreadsheet, or a terminal formatter such as `column -s$'\t' -t decisions.tsv` when available. A row whose evidence doesn't resolve, or whose result is unverified, is the audit catching a gap.

## Composing this skill

Other skills route their audit trail here instead of inventing one. Reference it by name and let it own the format; don't restate the columns.
