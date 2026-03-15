---
name: managing-architecture-document
description: Manage the ./ARCHITECTURE.md document for this project
user-invocable: true
---

Manage the ./ARCHITECTURE.md document for this project. If the file doesn't exist, create it. If it does exist, ensure it reflects the current high-level architecture.

## Philosophy

The ARCHITECTURE.md bridges the gap between occasional contributors and core developers. While it takes 2x more time to write a patch when unfamiliar with a project, it takes 10x more time to figure out *where* to change the code. This document provides the mental map needed to navigate the codebase efficiently.

### Key Principles

1. **Keep it short** - Every recurring contributor will read it. Shorter docs are less likely to be invalidated by future changes.

2. **Only specify stable things** - Don't try to keep it synchronized with code. Revisit it a couple of times a year. Focus on architectural invariants that are unlikely to change frequently.

3. **Start with the problem** - Begin with a bird's eye overview of the problem being solved.

4. **Provide a codemap** - Describe coarse-grained modules and how they relate to each other. The codemap should answer:
   - "Where's the thing that does X?"
   - "What does the thing I'm looking at do?"
   
   Avoid details of *how* each module works—pull that into separate documents or inline documentation. A codemap is a map of a country, not an atlas of its states.

5. **Reflect on structure** - Use this as a chance to reflect: Are the things you want to put near each other in the codemap adjacent when you run `tree .`?

6. **Name, don't link** - Do name important files, modules, and types. Do NOT directly link them (links go stale). Instead, encourage readers to use symbol search to find mentioned entities by name.

7. **Call out invariants** - Explicitly call out architectural invariants. Often, important invariants are expressed as an *absence* of something, which is hard to divine from reading code.

8. **Identify boundaries** - Point out boundaries between layers and systems. Boundaries implicitly contain information about implementation and constrain all possible implementations, but they're hard to find by randomly looking at code.

9. **Cross-cutting concerns** - After the codemap, add a section on cross-cutting concerns.

## Document Structure

The ARCHITECTURE.md should include:

1. **Overview** - Bird's eye view of what this project does and the problem it solves

2. **Codemap** - High-level modules and their relationships:
   - Coarse-grained components (not every file)
   - How modules relate to each other
   - Where to find major functionality
   - Important types and their roles

3. **Architectural Invariants** - Key constraints and principles that guide the design (often things that are *not* present)

4. **System Boundaries** - Clear boundaries between layers and major subsystems

5. **Cross-Cutting Concerns** - Aspects that affect multiple parts of the system (error handling, logging, configuration, etc.)

## Maintenance Notes

- Ignore dot directories (directories starting with '.') when exploring structure
- The main header should be "Acai Architecture"
- Do NOT include exhaustive file listings—these become stale quickly
- Do NOT include flow diagrams that duplicate code structure
- Focus on concepts and relationships that remain stable over time
- Revisit and update only when major architectural changes occur

## Reference

See matklad's original post: https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html

Example ARCHITECTURE.md from rust-analyzer: https://github.com/rust-analyzer/rust-analyzer/blob/master/docs/dev/architecture.md
