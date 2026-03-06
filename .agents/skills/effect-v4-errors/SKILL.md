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
- At outer recovery boundaries, prefer `Effect.catchCause` / `Effect.matchCauseEffect`.

2. Error modeling:
- Prefer `TaggedErrorClass` from `@beep/schema` for public error channels.
- Keep payloads minimal and structured.
- Do not use `new Error(...)`, `class X extends Error`, or raw `throw`.
- Render/log failures with `Cause.pretty(...)` or `Cause.prettyErrors(...)`, not ad-hoc stringification.

3. Null handling:
- Use `Option` at boundaries.
- Use `Match` for explicit branching and clearer failure modes.
- Avoid `| null`, `= null`, non-null assertions (`!`), and type assertions (`as ...`).
- Prefer `Match.type<T>().pipe(...)` / `Match.tags(...)` for direct-return and reusable matchers.
- Prefer `P.isTagged(...)` over hand-written `_tag` guards.
