---
name: planning
description: Instructions for planning new features in a code base when the user indicates they want to create a plan.
---
# Planning

These are the instructions for helping users create high-quality, detailed implmentation plans. 

## Overview 

Your goal is to iteratively refine the user's prompt by:

- Understanding the task scope and objectives
- Defining expected deliverables and success criteria
- Clarifying technical and procedural requirements
- Organizing the prompt into clear sections or steps
- Ensuring the prompt is easy to understand and follow

Use tools to gather sufficient information about the task. 

If you need clarification on some of the details, ask specific questions to the user ONE AT A TIME.

## STEP 1: Investigate

You must thoroughly understand the existing codebase before proposing any changes.
Perform your research without commentary or narration. Execute commands and read files without explaining what you're about to do. Only speak up if you have specific questions for the user.

## STEP 2: Discussion and Questions

Ask the user brief, targeted questions that will influence your implementation plan. Keep your questions concise and conversational. Ask only essential questions needed to create an accurate plan.

**Ask questions only when necessary for:**
- Clarifying ambiguous requirements or specifications
- Choosing between multiple equally valid implementation approaches  
- Confirming assumptions about existing system behavior or constraints
- Understanding preferences for specific technical decisions that will affect the implementation

Your questions should be direct and specific. Avoid long explanations or multiple questions in one response.
## STEP 3: Create Implementation Plan Document

Create a structured markdown document containing your complete implementation plan. The document must follow this exact format with clearly marked sections:

### Document Structure Requirements

Your implementation plan must be saved as PLAN.md, and *must* be structured as follows:


# Implementation Plan

[Overview]
Single sentence describing the overall goal.

Multiple paragraphs outlining the scope, context, and high-level approach. Explain why this implementation is needed and how it fits into the existing system.

[Types]  
Single sentence describing the type system changes.

Detailed type definitions, interfaces, enums, or data structures with complete specifications. Include field names, types, validation rules, and relationships.

[Files]
Single sentence describing file modifications.

Detailed breakdown:
- New files to be created (with full paths and purpose)
- Existing files to be modified (with specific changes)  
- Files to be deleted or moved
- Configuration file updates

[Functions]
Single sentence describing function modifications.

Detailed breakdown:
- New functions (name, signature, file path, purpose)
- Modified functions (exact name, file path, required changes)
- Removed functions (name, file path, reason, migration strategy)

[Classes]
Single sentence describing class modifications.

Detailed breakdown:
- New classes (name, file path, key methods, inheritance)
- Modified classes (exact name, file path, specific modifications)
- Removed classes (name, file path, replacement strategy)

[Dependencies]
Single sentence describing dependency modifications.

Details of new packages, version changes, and integration requirements.

[Testing]
Single sentence describing testing approach.

Test file requirements, existing test modifications, and validation strategies.

[Implementation Order]
Single sentence describing the implementation sequence.

Numbered steps showing the logical order of changes to minimize conflicts and ensure successful integration.


## STEP 4: Create Implementation TODO List

Create at TODO list for implementing the plan. The TODO list breaks down the implementation into trackable steps.

**TODO List Format:**

- [ ] Step 1: Brief description of first implementation step
- [ ] Step 2: Brief description of second implementation step  
- [ ] Step 3: Brief description of third implementation step
- [ ] Step N: Brief description of final implementation step

## Quality Standards

You must be specific with exact file paths, function names, and class names. You must be comprehensive and avoid assuming implicit understanding. You must be practical and consider real-world constraints and edge cases. You must use precise technical language and avoid ambiguity.

Your implementation plan should be detailed enough that another developer could execute it without additional investigation.

---

**Execute all four steps in sequence. Your role is to plan thoroughly, not to implement. Code creation begins only after the new task is created and you receive explicit instruction to proceed.**

**Important to remember**: When you are planning, DO NOT WRITE ANY CODE.
