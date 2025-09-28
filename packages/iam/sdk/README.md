# @beep/iam-sdk

Helper surface and clients for interacting with the IAM Better Auth stack.

## Better Auth Helpers

The `src/better-auth` module exports the primitives defined in `SPEC.md`:

- `config`: handler option schemas, default knobs, and merge helpers.
  - `buildHandlerOptions` / `withRetryOptions` / `withTimeoutOptions` helpers provide
    a typed builder that merges overrides with `defaultHandlerOptions` while
    normalizing duration inputs via `effect/Duration` decoders.
- `context`: request-context propagation utilities (FiberRefs, annotations).
- `concurrency`: keyed semaphore registry and submission guards.
- `errors`: Better Auth error metadata + normalizers to the shared `IamError` type.
- `handler`: `callBetterAuth`, handler factory, and toast decorators for building
  client-facing effects.
- `instrumentation`: log annotations, tracing spans, and metric helpers wired into
  the pipeline.

Everything is re-exported from the package root (`src/index.ts`), so consumers can
write:

```ts
import { createBetterAuthHandler } from "@beep/iam-sdk";
```

Implementation status and remaining tasks live in `SPEC.md` (design) and `TODO.md`
(action plan). Consult `TODO.md` before starting new work to keep milestones in
sync.
