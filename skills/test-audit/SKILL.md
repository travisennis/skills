---
name: test-audit
description: "Test value audit. Invoke whenever writing, changing, reviewing, or sweeping tests. Authoring mode gates every new or changed test at write time; audit mode sweeps existing tests that re-assert source, duplicate stronger proof, couple behavior to implementation, or keep test-only production seams alive; campaign mode prunes a whole subsystem's test surface. Optimizes for confidence, not deletion count."
user-invocable: true
metadata:
  version: "1.0"
---

# Test Audit

Three modes, one value bar. Authoring mode gates every new or changed test at
write time. Audit mode runs focused sweeps of tests that re-assert source,
duplicate stronger proof, couple behavior to implementation, or keep test-only
production seams alive. Continue broad audits as separate coherent follow-up
changes; optimize for confidence, not deletion count. Campaign mode prunes one
whole subsystem's test surface (every test file a package, plugin, or core area
owns); before starting one, read [references/campaign.md](references/campaign.md).

This skill is repository- and agent-neutral. Nothing here depends on a
language, test framework, directory layout, version-control system, or agent
host. Read the target repository's own conventions first, and translate each
step below into its terms rather than assuming the ones named as examples.

## Authoring gate

Before adding any test, answer four questions; a missing answer means do not
add it yet:

1. What observable behavior, invariant, or independent contract does it protect?
2. What credible regression makes it fail?
3. Why does existing coverage not already catch that failure? Each contract has
   one primary test owner at the strongest boundary; another layer needs its
   own distinct risk, such as a transport or lifecycle failure the owner cannot
   reach. Prefer extending a table-driven case or shared fixture over a
   near-duplicate test; consolidate duplicated setup in the same change.
4. Does it need a production seam (export, flag, wrapper, injection hook) that no
   production caller needs? If yes, move the test to the real boundary instead.

Then check the test against every [junk pattern](#junk-patterns); a match fails
the gate unless the [retention bar](#retention-bar) names the contract it
independently guards. A test that would break under behavior-preserving
refactoring is asserting implementation, not behavior; rewrite it at the
owning boundary before landing it.

Bug regression tests must fail on the pre-fix code for the intended reason and
pass after the owner-boundary repair. A regression test that never demonstrably
failed proves the mock, not the fix. One regression at the owner boundary
covers the bug; do not replay the same scenario at every layer it crosses.

## Junk patterns

The shared checklist for both modes: the authoring gate rejects a new test that
matches one, and audits hunt for existing tests that do.

- assertion-free coverage probes;
- self-comparisons and identity copiers;
- copied fixtures, inventories, manifests, or export lists;
- exact source, import, or string greps;
- private predicate or call-shape tests duplicated at real boundaries;
- duplicate invocations of the same contract;
- provider-local replays of shared helpers;
- tests whose only purpose is preserving test-only exports, globals, or wrappers;
- dead production code whose only callers are tests;
- expected values produced by the helper or renderer under test;
- mocks that implement the asserted behavior, or one identical mock standing in
  for different APIs;
- fixtures that supply the receipt, admission, or callback ordering the owner
  should produce, or persistence asserted against a store the path never writes;
- capability tests that restate declared flags instead of exercising the
  delivery or acknowledgement the flag promises;
- negative controls that pass for an unrelated reason, such as a denial from a
  different guard or a rejection the production path never reaches;
- names or fixtures that promise more than the input exercises, such as a
  "retires the window" test asserting the window was not cleared.

## Value bar

Tests justify their maintenance cost by protecting behavior, a credible
regression, or an independently meaningful contract. In an audit, an existing
test that must change for behavior-preserving source reorganization is suspect,
not automatically deletable; the authoring gate still rejects new ones.

Before judging a candidate, read the complete test and production owner, its
entry point, callers, callees, sibling implementations, overlapping tests, how
the build or CI selects and runs it, and relevant history. Read the
repository's contributor and agent instructions first — root and scoped
`AGENTS.md` or `CLAUDE.md`, `CONTRIBUTING.md`, or whatever else carries them.
When the test claims dependency-backed behavior, inspect the dependency source
or types directly.

## Discovery

Keep discovery read-only and report evidence before editing. For broad scope,
split the work into parallel discovery lanes when the agent can delegate; when
it cannot, walk the same lanes serially. Lanes follow the repository's own
boundaries, for example:

- core libraries and shared packages;
- plugins, integrations, or extensions;
- UI, apps, CLIs, scripts, and tooling;
- a cross-cutting sweep of one junk pattern.

Outside campaign mode, prefer a few high-confidence candidates over a large
speculative inventory. Hunt for the [junk patterns](#junk-patterns).

## Retention bar

Keep a test when it independently enforces a public API, plugin or extension
SDK, protocol, config, migration, storage, security, platform, default, prompt
or serialized byte, generated cross-language, package, release, or architecture
contract. Also keep:

- call ordering when order is observable behavior;
- regressions with a credible failure mode;
- source inspection when it is the cheapest independent guard: it fails when
  the contract changes (the user-facing key, byte, or path) and survives an
  identifier-only refactor;
- a retained test that fails on the baseline: treat it as a possible product
  bug, reproduce it, and repair the owner rather than deleting it.

Static or slow is not a deletion reason. A test that resembles implementation
may still be the independent contract; prove otherwise before removing it.

## Candidate evidence

Record every field below before editing. A missing field means the candidate is
not ready for deletion:

- exact test name and location;
- what failure it can actually detect;
- non-test callers of the covered production or support seam;
- stronger remaining owner-boundary proof, or why no proof is needed;
- relevant history and the reason the test or seam exists;
- production or test-support deletion unlocked;
- risk and the focused validation command.

## Edit shape

Choose one coherent owner-boundary batch. Delete obsolete test-only exports,
globals, wrappers, and dead production paths instead of preserving aliases.
Move retained regressions to their canonical owners. Consolidate repeated
package or dependency assertions into one generic contract.

Prefer net-negative production LOC. Do not add replacement tests that restate
the same implementation, and do not convert uncertain candidates into cleanup
to increase deletion counts.

## Validation

Never edit source or tests while the test runner, watch mode, or another file
watcher is running against the checkout. Follow the repository's own rules for
tests and for which suites may run locally, wherever it keeps them.

1. Run the smallest owner and sibling tests with the runner the project
   documents — its test script, task-runner target, or documented command —
   scoped to the changed paths or filter.
2. For a removed source grep, plan assertion, or inventory check, run the
   executable script, linter, or dry-run that owns the real contract.
3. Run the project's formatter over the changed files, then check the diff for
   whitespace errors.
4. Run the changed-file gate repository policy requires — lint, typecheck, or
   CI routing classification — over exactly the paths you touched.
5. Report production and tooling line changes separately from tests and test
   support, using the version-control diff stats.
6. After the final audit edits, run the repository's own review pass, or a
   review skill when one is available.

If the session cannot run the project's tests, cannot delegate, or is otherwise
restricted — read-only, chat-only, no checkout — do not skip steps silently.
State which ones you could not run and hand the user the exact commands.

## Landing and continuation

Commit, push, open a change request, or land only when authorized, and only
through the repository's own contribution flow and template. Land one coherent
change at a time; after landing, refresh from the current default branch and
rerun read-only discovery for the next high-confidence batch.

## Handoff

Report:

- root cause and removed low-value categories;
- production owner simplifications;
- retained false positives and why they remain valuable;
- focused and full proof actually run;
- production versus test LOC;
- landing or change-request state;
- named follow-ups.
