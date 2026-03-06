# Claude Guide

## Mission
Ship reliable code with effect first and schema first patterns.

## Rules
- Keep changes focused and testable.
- Prefer service composition over global state.
- Prefer match helpers over conditional chains.
- Prefer dedicated helper-module namespaces such as `effect/String` and `effect/Equal`; keep root `effect` imports for core combinators.
- Apply schema defaults when safe.
- Keep quality gates passing.
