---
name: grill-me
description: Lightweight, relentless one-question-at-a-time interview about a plan or design. Use when the user wants to stress-test a plan, get grilled on their design, or says "grill me". Resolves the material unknowns in a short interview instead of running a full planning pass.
user-invocable: true
disable-model-invocation: true
metadata:
  version: "1.0"
---

# Grill Me

Use the short interview loop:

- Interview the user relentlessly until you reach shared understanding.
- Ask one material question at a time and wait for the answer.
- Walk each branch of the design tree, resolving dependencies between decisions.
- For each question, provide your recommended answer.
- If the codebase or docs can answer the question, investigate instead of asking.
- Stop when the material unknowns are resolved or explicitly accepted as assumptions.

Keep this lightweight: do not run the full unknowns taxonomy, domain-modeling ledger,
or launch-packet workflow unless the user asks for it.
