---
name: effect-v4-errors
description: >
  Focused Effect v4 error handling. Use for replacing catchAll patterns,
  designing typed errors, and Option/Match boundary handling.
version: 0.1.0
status: active
---

# Effect v4 Errors (Focused)

1. Catch semantics:
- Replace `Effect.catchAll` with `Effect.catch`.
- Use `Effect.catchTag` for tagged typed errors.
- Prefer `Effect.try` / `Effect.tryPromise` for exception boundaries.

2. Error modeling:
- Prefer `S.TaggedErrorClass` (`effect/Schema` as `S`) for public error channels.
- Keep payloads minimal and structured.
- Do not use `new Error(...)`, `class X extends Error`, or raw `throw`.

3. Null handling:
- Use `Option` at boundaries.
- Use `Match` for explicit branching and clearer failure modes.
- Avoid `| null`, `= null`, non-null assertions (`!`), and type assertions (`as ...`).
