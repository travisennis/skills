---
name: reviewing-code
description: Review code changes with thorough analysis and write structured review reports. Use when asked to review, check, or analyze code quality, diffs, commits, branches, or unstaged changes.
user-invocable: true
---

# Code Review

Perform a thorough, skeptical, and constructive code review. Produce a structured review report written to `review.md`.

## Workflow

1. **Gather context** — Read all relevant files fully: changed files, implementation plans, related documentation, and any referenced GitHub issues. Determine the review scope from the user's input (unstaged changes, a commit, a branch range, specific files, or an issue reference).

2. **Retrieve changes** — Get the relevant diff or file contents for the review scope.

3. **Analyze systematically** — Evaluate the changes across these dimensions:

   - **Correctness & logic** — Does the code work as intended? Are there bugs, logic errors, or unhandled edge cases? Is error handling robust?
   - **Project conventions** — Does the code follow existing patterns, naming conventions, and code structure? Are imports and dependencies appropriate?
   - **Performance** — Are there performance concerns, inefficient algorithms, or scaling issues?
   - **Test coverage** — Are tests included? Do they cover edge cases? Are there missing test scenarios?
   - **Security** — Are there vulnerabilities, injection risks, or improper handling of user input or sensitive data?
   - **Maintainability** — Is the code clear, well-named, modular, and easy to understand?

4. **Read related code for context** — Look at similar implementations, related tests, and documentation in the codebase to inform the review.

5. **Synthesize findings** — Group related issues, prioritize by severity (critical, important, minor), identify patterns, and note positive aspects.

6. **Write the review report** — Write findings to `review.md` using the template in [references/TEMPLATE.md](references/TEMPLATE.md). Include specific file:line references for all findings.

7. **Update GitHub issue** — If a GitHub issue was provided, add a comment summarizing the review findings.

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
