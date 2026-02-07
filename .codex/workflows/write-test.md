# Write Test Workflow (Codex Adaptation)

Adapted from `.claude/commands/write-test.md`.

## Core standards

- Use `@beep/testkit` for Effect-based tests.
- Keep tests under `test/` mirroring `src/` structure.
- Prefer deterministic tests and structured assertions.

## Procedure

1. Identify behavior under test and test type (unit/integration/resource/time-based).
2. Implement tests with repository patterns.
3. Run targeted test commands first, then broader checks if needed.
4. Record pass/fail evidence and unresolved gaps.
