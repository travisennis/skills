---
name: reviewing-code
description: Review code changes with thorough analysis and write structured review reports. Use when asked to review, check, or analyze code quality, diffs, commits, branches, or unstaged changes.
user-invocable: true
metadata:
  version: "1.0"
---

# Code Review

Perform a thorough, skeptical, and constructive code review. Produce a structured review report written to `review.md`.

## Workflow

1. **Pre-review assessment** — Before reading code, check CI status (`gh pr checks`), PR metadata (title, description, size, linked issues), and scope. If CI is failing, note it and decide whether a full review is worthwhile yet. Assess PR size and determine the review strategy (see Review Strategies below).

2. **Gather context** — Read all relevant files fully: changed files, implementation plans, related documentation, and any referenced GitHub issues. Determine the review scope from the user's input (unstaged changes, a commit, a branch range, specific files, or an issue reference).

3. **Retrieve changes** — Get the relevant diff or file contents for the review scope.

4. **Analyze systematically** — Evaluate the changes across these dimensions:

   - **Correctness & logic** — Does the code work as intended? Are there bugs, logic errors, or unhandled edge cases? Is error handling robust?
   - **Project conventions** — Does the code follow existing patterns, naming conventions, and code structure? Are imports and dependencies appropriate?
   - **Performance** — Are there performance concerns, inefficient algorithms, or scaling issues?
   - **Test coverage** — Are tests included? Do they cover edge cases? Are there missing test scenarios?
   - **Security** — Are there vulnerabilities, injection risks, or improper handling of user input or sensitive data?
   - **Maintainability** — Is the code clear, well-named, modular, and easy to understand?
   - **Documentation** — Are API docs updated if public APIs changed? Are README/guides updated for user-facing changes? Do comments explain "why" not "what"? Is a changelog entry needed?

5. **Read related code for context** — Look at similar implementations, related tests, and documentation in the codebase to inform the review.

6. **Synthesize findings** — Group related issues, prioritize by severity (critical, important, minor), identify patterns, and note positive aspects. Include a risk assessment and any deployment considerations (migrations, feature flags, rollback plans).

7. **Write the review report** — Write findings to `review.md` using the template in [references/TEMPLATE.md](references/TEMPLATE.md). Include specific file:line references for all findings.

8. **Update GitHub issue** — If a GitHub issue was provided, add a comment summarizing the review findings.

## Review Guidelines

- **Be skeptical** — Question assumptions. Look for edge cases and error conditions. Do not assume code works as intended.
- **Be constructive** — Provide specific, actionable feedback. Explain why something is an issue. Suggest concrete improvements.
- **Be thorough** — Read all changed code completely. Consider the broader context. Look for patterns across multiple files.
- **Be practical** — Focus on issues that matter. Prioritize by severity. Consider cost/benefit. Recognize when good enough is sufficient.
- **Be specific** — Reference exact file:line locations. Provide clear recommendations.
- **Be balanced** — Include positive feedback alongside criticism.
- **No open questions** — If something is unclear, investigate further. The final review should be complete and actionable.

## What to check

### Code Smells
- Duplicates, long methods, deep nesting, dead code, unused imports
- Leaky abstractions, tight coupling, improper layering
- Edge cases: null, empty, timezones, encodings
- Concurrency misuse and non-idempotent ops where required

### Security
- Secrets in code/logs; proper secret management
- Input validation and output encoding; SQL/NoSQL/OS injection; XSS/CSRF
- AuthN/AuthZ and multi-tenant boundaries
- SSRF/XXE/path traversal/file upload validation
- Crypto choices; TLS verification; CORS and security headers
- Dependency CVEs and supply-chain risks; IaC/container misconfig

### Performance
- Time/space complexity; hot-path allocations; blocking I/O
- N+1 queries; missing indexes; inefficient joins; full scans
- Caching correctness and stampedes
- Chatty network calls; batching; timeouts; backoff
- Client bundle size and critical path (if UI)

### Tests needed
- Does new behavior have unit/integration/e2e tests
- Edge cases, negative cases, concurrency/time-based cases
- Minimal test plan to guard the change


## Review Patterns

**New features** — Verify correctness, check error handling and edge cases, assess test coverage, consider performance, review API design.

**Bug fixes** — Verify the fix addresses root cause, check for regressions, assess if the fix is minimal and focused, review test coverage for the fix.

**Refactoring** — Verify behavior is preserved, assess maintainability improvement, check for performance implications, review test coverage.

**Security changes** — Thoroughly assess security implications, check for new vulnerabilities, verify input validation, review error handling for information disclosure.

## Review Strategies

**Large PRs** — Review in multiple passes: (1) high-level to understand the overall approach, (2) architecture to review design decisions, (3) implementation to review critical sections, (4) details to scan remaining code. Consider requesting the PR be split into smaller, focused PRs or that the author add more intermediate commits for clarity.

**Complex changes** — Understand first by asking questions before suggesting changes. Focus on correctness. Suggest alternatives only if significantly better. Defer optimizations unless critical, and suggest them as follow-ups.

**Hotfix/Urgent PRs** — Balance speed with quality. Focus on critical issues only. Trust automated tests more. Request a follow-up PR for non-critical improvements.

## Recommendation Criteria

- **Approve** — No critical or major issues. Code follows established patterns. Changes are well-implemented and ready for production.
- **Approve with comments** — Minor issues that can be addressed post-merge. Non-blocking suggestions for future improvements.
- **Request changes** — Critical issues that must be addressed. Major architectural concerns. Significant quality or security violations. Requires another review cycle.

## Handling Disagreements

When a review surfaces a genuine disagreement on approach:

1. **Discuss objectively** — Reference requirements, constraints, and established patterns rather than personal preferences.
2. **Consider tradeoffs** — List pros and cons of each approach.
3. **Seek consensus** — Involve other team members if needed.
4. **Document the decision** — Record why the chosen approach was selected.
5. **Move forward** — Once decided, implement consistently.
