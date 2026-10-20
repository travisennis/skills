---
name: grill-me
description: Lightweight entry point for a relentless one-question-at-a-time interview about a plan or design. Use when the user wants to stress-test a plan, get grilled on their design, or says "grill me". For docs-grounded domain modeling, use grill-with-docs; for a full unknowns pass, use grill-for-unknowns.
user-invocable: true
disable-model-invocation: true
metadata:
  version: "1.0"
---

# Grill Me

Read and follow the `grill-for-unknowns` skill. Its SKILL.md is at
`../grill-for-unknowns/SKILL.md` when the skills are installed side by side.

Use the short interview loop:

- Interview the user relentlessly until you reach shared understanding.
- Ask one material question at a time and wait for the answer.
- Walk each branch of the design tree, resolving dependencies between decisions.
- For each question, provide your recommended answer.
- If the codebase or docs can answer the question, investigate instead of asking.
- Stop when the material unknowns are resolved or explicitly accepted as assumptions.

Do not run the full unknowns taxonomy, domain-modeling ledger, or launch-packet
workflow unless the user asks for it. Use `grill-with-docs` when the plan needs the
project's documented language and decisions, or `grill-for-unknowns` for the full pass.
