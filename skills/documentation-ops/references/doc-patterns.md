# Documentation Patterns

Use these patterns when creating or normalizing documentation templates. Adapt to the repo's existing style.

## Guide

Use for repeatable procedures.

```md
# <Task Name>

## Purpose

What this guide helps someone do.

## Prerequisites

- Required tools, permissions, environment, or context.

## Steps

1. Do the first concrete action.
2. Do the next concrete action.
3. Verify the result.

## Validation

- Command or observable result that proves success.

## Troubleshooting

- Symptom: likely cause and fix.
```

## Reference

Use for stable facts, contracts, schemas, flags, APIs, or formats.

```md
# <Reference Topic>

## Summary

Short statement of what this reference covers.

## Canonical Source

Where this fact is owned, generated from, or verified.

## Details

Stable facts organized for lookup.

## Compatibility Notes

Public contracts, migration notes, or version constraints.
```

## Guardrail

Use for risk-specific rules agents and contributors must follow.

```md
# <Risk Area> Guardrails

## Applies When

Use this guardrail for changes touching <paths, features, or behavior>.

## Rules

- Always <required behavior>.
- Never <forbidden behavior>.
- Prefer <default choice> unless <exception>.

## Verification

- Checks, tests, review steps, or manual validation required.

## Escalation

When to ask a maintainer or stop.
```

## Runbook

Use for operational response.

```md
# <Incident or Operation> Runbook

## Trigger

Signals that mean this runbook applies.

## Owner

Team or role responsible.

## Impact

What is affected and how severe it can be.

## Procedure

1. Triage.
2. Mitigate.
3. Verify.
4. Communicate.

## Rollback

How to return to the previous safe state.

## Post-Check

Evidence that the system is healthy again.
```

## ADR

Use for durable architectural decisions.

```md
# ADR <number>: <Decision Title>

## Status

Proposed | Accepted | Superseded by ADR <number>

## Context

What problem, constraints, and forces led to the decision.

## Decision

The choice made.

## Consequences

Benefits, costs, risks, and follow-up work.

## Alternatives Considered

Options rejected and why.
```

## Architecture Update Checklist

Use when code changes affect structure or boundaries:

```md
- [ ] Codemap still names the important modules and files.
- [ ] New or removed major directories are reflected.
- [ ] Boundaries and dependency rules are still accurate.
- [ ] New invariants or deliberate absences are documented.
- [ ] Public vs internal API boundaries are clear.
- [ ] Cross-cutting concerns changed by this work are documented.
```
