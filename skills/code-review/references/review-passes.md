# Review Passes: Performance and Polish

Detailed checklists for Pass 3 and Pass 4 of the code review. Load this reference for
M/L/XL reviews, or when the diff touches performance-sensitive or unusually complex code.

## Pass 3: Performance & Efficiency

**Focus:** Is it fast enough? Are there avoidable costs?

For each changed code path, consider:

- **Complexity**: Time and space complexity of new algorithms. Is there a hidden O(n²)
  or worse in a hot path?
- **N+1 patterns**: Loading items individually in a loop when batch loading is available.
  Database calls in loops.
- **Hot-path allocations**: Object/string allocation in tight loops, boxing, temporary arrays.
- **Blocking I/O**: Synchronous calls in async context, thread-pool starvation.
- **Chatty networking**: Multiple sequential API calls that could be parallelized.
- **Caching**: Missing cache for repeated computation. Cache invalidation correctness.
  Cache stampede risk.
- **Unnecessary work**: Repeated file reads, redundant computations, duplicate network calls.
- **Inefficient data structures**: List lookups where a set/map would do; string
  concatenation in loops.
- **Client-side (if UI)**: Bundle size impact, render tree churn, unnecessary re-renders,
  large dependency additions.

**When in doubt, profile before fixing.** Flag performance concerns with evidence,
not speculation. Not every N+1 matters — flag the ones on hot paths.

## Pass 4: Polish (Deslop Pass)

**Focus:** Is this the smallest clear diff that solves the problem?

This is the final readability pass. Read the diff with fresh eyes, looking for:

### a. Overengineering

- Is there more code than needed?
- Are there helpers, factories, wrappers, or indirection without enough payoff?
- Could the same result be expressed more directly?
- Are new modules or generic helpers justified by real reuse?

### b. Dead & Debug Code

- Debug prints, commented-out code, placeholder implementations?
- Lint suppressions, type ignores, or test workarounds with no explanation?
- Leftover TODO/FIXME that should either be done or tracked elsewhere?

### c. Test Gaps

- Does new behavior have **tests at the right level** (unit vs. integration vs. e2e)?
- Are edge cases, negative cases, and failure modes covered?
- Would the tests catch a regression in this change?
- Are the tests themselves **readable and maintainable**? Or do they repeat
  giant fake harnesses or mirror implementation internals?
- For bug fixes: would the test have caught this bug before it shipped?

### d. Documentation & Conventions

- Are public/exported APIs documented? Are internal ones clear enough without docs?
- Do comments explain **"why" not "what"** ?
- Does the change follow documented patterns in `AGENTS.md`, design docs, or ADRs?
- Is there a changelog entry needed?

### e. Redundancy

- Are there **near-duplicate functions** or code blocks that should be unified?
- Is code duplicating something that already exists in a shared utility?
- Are there imported utilities that are only used in one place?

## Optional Large-Review Passes

Run these only for L/XL reviews or when the diff directly touches the relevant surface.
Do not add these categories to small PRs just to feel complete.

### a. Dependencies & Migrations

- New dependency: is it necessary, maintained, trusted, and used on a reachable path?
- Version bump: are breaking changes, migration notes, and lockfile changes accounted for?
- Duplicate dependencies: did the change add another package that solves an existing problem?
- Deprecated API: did the change introduce or keep usage with a known removal path?
- Pinning: are CI actions, containers, package managers, and runtime versions pinned consistently?

### b. DX & Tooling

- Did the change make build, test, lint, typecheck, local setup, or CI slower or less reliable?
- Are setup instructions, `.env.example`, scripts, or generated artifacts now wrong or incomplete?
- Is there a one-command way to verify the touched behavior? If not, call that out when it
  materially increases risk.
- For agent-heavy repos, does the change require updating `AGENTS.md` or equivalent local guidance?

### c. Public Docs

- Did public API, CLI behavior, config shape, install/setup flow, or deployment behavior change?
- Are docs/examples now stale in a way that would lead users to broken commands or wrong behavior?
- Ignore documentation polish unless the absence has a concrete user, maintainer, or release cost.
