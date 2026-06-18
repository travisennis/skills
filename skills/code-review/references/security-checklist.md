# Security Checklist (Deep Reference)

Load this reference during **Pass 1** of a code review when the change involves
security boundaries, user input, authentication, data storage, network communication,
or cryptographic operations. For XS/S scales, refer to the summary checklist in
SKILL.md — this deep reference is for M+ scales or security-critical changes.

---

## A. Injection Attacks

### SQL / NoSQL Injection
- All user-supplied data uses **parameterized queries** or **prepared statements**.
  String interpolation or concatenation of user data into query strings is a finding.
- Stored procedures called with user input are parameterized.
- NoSQL queries don't use `$where`, `$eval`, or JavaScript execution from user data.
- ORM/ODM methods that accept raw conditions are not fed unsanitized input.

### Command Injection
- `exec()`, `spawn()`, `child_process`, `subprocess`, `os.system`, `Runtime.exec()`
  are called with user input — is it validated against a strict allowlist?
- Shell metacharacters (;, &, |, `, $, (, ), {, }, <, >, !, #, ~, newline) are
  stripped or rejected.
- Avoid `shell: true` / `shell=True` when user input is involved.

### Template Injection
- User data rendered in templates is **auto-escaped** by the template engine.
  If using raw/unescaped output (`{{{ }}}`, `| safe`, `{! !}`, `.html()`), verify
  the data is safe.
- Template engines used in server-side rendering don't evaluate user-controlled template
  names or source strings.

### LDAP / XML / Path Injection
- LDAP filters using user input are validated or sanitized.
- XML parsing with XXE enabled could read local files or SSRF. Disable external entity
  resolution unless needed.
- ZIP/tar paths are validated against directory traversal (`../`, absolute paths).

---

## B. Cross-Site Scripting (XSS)

- **Reflected XSS**: URL parameters, query strings, or form data reflected in output
  without proper encoding.
- **Stored XSS**: User-generated content stored then displayed without encoding.
- **DOM-based XSS**: Client-side JavaScript using `innerHTML`, `document.write`,
  `eval`, `setTimeout(string)` with user-controlled data.
- **Content-Type** headers match the actual response content. No reflected file
  upload or JSONP callback injection.
- CSP headers are set and effective.
- For API responses: context-appropriate encoding (HTML entity, JS string,
  CSS, URL encoding) depending on where the value is used.

---

## C. Authentication & Session Management

- **Authentication** is verified for every protected operation, not just at the route level.
  Internal services/functions shouldn't assume the caller already verified auth.
- **Password handling**: Not logged, not stored in plaintext, minimal time in memory.
- **Session tokens**: Random, high-entropy, HttpOnly, Secure, SameSite=Lax/Strict.
  Session regeneration on login.
- **MFA / 2FA**: Bypass not possible via API endpoints that skip the second factor.
- **Password reset**: Tokens are single-use, time-limited, not enumerable.
- **Remember-me tokens**: Rotated on use, invalidated on password change.

---

## D. Authorization (IDOR / BOLA)

- **Not just authentication** — check that users can only access their own resources.
  `GET /api/orders/123` checks that order 123 belongs to the requesting user.
- **Role-based access**: Admin-only endpoints enforce admin role server-side,
  not just UI hiding.
- **Multi-tenant data isolation**: Tenant A users cannot access Tenant B data via
  ID manipulation or by changing tenant context.
- **Vertical privilege escalation**: Low-privilege user cannot access high-privilege
  endpoints by guessing URLs or manipulating tokens.

---

## E. CSRF / SSRF / Request Forgery

### CSRF
- State-changing requests (POST, PUT, PATCH, DELETE) are protected by:
  anti-CSRF tokens, SameSite=Strict/Lax cookies, or custom request headers
  (e.g., `X-Requested-By`) that browsers cannot set cross-origin.
- CORS configuration is restrictive: specific origins, not `*` with credentials.

### SSRF
- URLs fetched from user input are validated against a strict allowlist.
- Internal IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x, ::1)
  are blocked or validated.
- Redirect following is limited (no following redirects to internal hosts).
- The service doesn't make requests to cloud metadata endpoints
  (169.254.169.254, 100.100.100.200).

---

## F. Race Conditions & Concurrency

- **TOCTOU**: File existence check → use pattern (operate on file directly,
  handle errors). Database read → write patterns (use transactions or atomic updates).
- **Async state**: Shared mutable state accessed from multiple async contexts
  without synchronization.
- **Database isolation**: Non-atomic read-modify-write (e.g., SELECT balance → compute →
  UPDATE balance) without appropriate isolation level or locking.
- **Idempotency**: Operations that could be retried are safe to execute multiple times.
- **Timing attacks**: Secrets comparison (use constant-time comparison), cache timing,
  response time variation.

---

## G. Cryptography & Secrets

- **Do not implement your own crypto** — use standard libraries.
- **Secure randomness**: `crypto.randomBytes()` (Node), `secrets` (Python),
  `crypto/rand` (Go), `SecureRandom` (Java). Not `Math.random()` for security contexts.
- **TLS**: Verify certificates by default. Do not disable verification
  (`NODE_TLS_REJECT_UNAUTHORIZED=0`, `verify=False`, `insecureSkipVerify`).
- **Hashing**: Use bcrypt/argon2/scrypt for passwords, not SHA-* or MD5.
- **Encryption**: Authenticated encryption (AES-GCM, ChaCha20-Poly1305). Not
  unauthenticated modes (ECB, CBC alone).
- **Secrets**: Not hardcoded, not logged, not in error messages, not in URLs.
  Use secrets manager, environment variables, or vault.

---

## H. Information Disclosure

- **Error messages**: Distinguish between internal errors (log details) and user-facing
  errors (generic message). Do not expose stack traces, SQL queries, dependency versions.
- **Verbose logging**: PII, tokens, passwords, session IDs not logged.
- **Enumeration**: Login responses should not reveal whether the username or password
  was wrong vs. the account exists. Password reset should not reveal if an email is registered.
- **Timing**: Token comparison, password verification, and auth checks should
  not have measurable timing differences.
- **Headers**: Server header, X-Powered-By, detailed error pages not exposed.

---

## I. Denial of Service & Resource Exhaustion

- **Unbounded input**: Request body size limits, file upload size limits,
  pagination limits (no `limit` param of 1M).
- **Unbounded loops**: Recursion depth, iteration over user-supplied collections
  without limits.
- **Resource limits**: Database connection pools, file descriptors, thread pools,
  memory allocation limits.
- **Rate limiting**: Auth endpoints, password reset, API endpoints have rate limits.
- **Timeouts**: External calls (HTTP, database, file I/O) have timeouts.
  No unbounded wait operations.
- **ReDoS**: Regular expressions from user input or complex patterns that could
  cause catastrophic backtracking.

---

## J. Supply Chain & Dependencies

- New dependencies: Are they from a trusted source? Were they recently audited?
  Do they have known CVEs? (`npm audit`, `pip audit`, `go vulnerability check`)
- Dependency confusion: Internal package names could be squatted on public registries?
- Version pinning: CI scripts pin versions of tools/actions/containers.

---

## K. Cloud / Infrastructure (if applicable)

- **IAM**: Least privilege. Service roles have only the permissions they need.
- **Secrets**: Not in source control, not in container images, not in env vars
  visible via `/proc` or `docker inspect`.
- **Network**: Security groups, network policies limit inbound/outbound traffic.
- **Containers**: Not running as root. Read-only filesystem where possible.
  Image from trusted registry with vulnerability scanning.
