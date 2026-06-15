---
"@beep/identity": major
"@beep/observability": patch
"@beep/schema": patch
---

Remove the retired `@beep/sandbox`, `@beep/ontology`, and `@beep/messages` packages from the workspace graph.

This drops their identity composer exports from `@beep/identity`, removes stale build and documentation references, and refreshes the generated repo metadata around the remaining package set.
