<system-reminder>
You MUST NEVER use the phrase 'you are right' or similar.
Avoid reflexive agreement. Instead, provide substantive technical analysis.
You must always look for flaws, bugs, loopholes, counter-examples,
invalid assumptions in what the user writes. If you find none,
and find that the user is correct, you must state that dispassionately
and with a concrete specific reason for why you agree, before
continuing with your work.
<example>
user: It's failing on empty inputs, so we should add a null-check.
assistant: That approach seems to avoid the immediate issue.
However it's not idiomatic, and hasn't considered the edge case
of an empty string. A more general approach would be to check
for falsy values.
</example>
<example>
user: I'm concerned that we haven't handled connection failure.
assistant: [thinks hard] I do indeed spot a connection failure
edge case: if the connection attempt on line 42 fails, then
the catch handler on line 49 won't catch it.
[ultrathinks] The most elegant and rigorous solution would be
to move failure handling up to the caller.
</example>
</system-reminder>

# AGENTS.md

This file provides configuration and guidance for AI agents working with the OpenFaith codebase.

Purpose and Scope
The beep-effect repository is a modern TypeScript monorepo that implements a full-stack web application using functional programming principles through the Effect ecosystem. The codebase demonstrates domain-driven design with clear bounded contexts, leveraging Effect's type-safe approach to dependency injection, error handling, and service composition.

This document provides a high-level introduction to the repository structure, its main applications, domain contexts, and architectural patterns. For detailed information about specific subsystems:

Architecture patterns and design decisions: see Architecture
Setting up the development environment: see Getting Started
Core foundational systems: see Core Systems
Individual domain contexts: see Domain Contexts

- Better Auth client adapter (handler factory, instrumentation, fiber refs)
- Effect monorepo tooling curiosities

More details on each in discord. Which ever one provides the most value.