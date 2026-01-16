# Phase 7 Handoff: Documentation & Remaining Migrations

## Status Summary

| Phase | Status | Output |
|-------|--------|--------|
| Phase 0 | Complete | Spec scaffolding |
| Phase 1 | Complete | `outputs/current-patterns.md` |
| Phase 2 | Complete | `outputs/effect-research.md` |
| Phase 3 | Complete | `outputs/pattern-proposals.md` |
| Phase 4 | Complete | `outputs/pattern-review.md` |
| Phase 5 | Complete | `PLAN.md` |
| Phase 6 | **Complete** | `errors.ts`, `schema.helpers.ts`, `handler.factory.ts`, handler migrations |
| **Phase 7** | **Ready** | Documentation updates, remaining handlers |

## Phase 7 Objectives

1. **Migrate remaining handlers** to factory pattern
2. **Update AGENTS.md files** with factory pattern documentation
3. **Create test files** for handler factory and schema helpers
4. **Optional: Implement atom.factory.ts** for mutation atom boilerplate reduction

## Phase 6 Deliverables (Reference for Phase 7)

### Files Created/Modified

| File | Type | Description |
|------|------|-------------|
| `packages/iam/client/src/_common/errors.ts` | Modified | Added Data.TaggedError variants |
| `packages/iam/client/src/_common/schema.helpers.ts` | Created | Error schema helpers, re-exports |
| `packages/iam/client/src/_common/handler.factory.ts` | Created | `createHandler` factory function |
| `packages/iam/client/src/core/sign-out/sign-out.handler.ts` | Modified | Migrated to factory pattern |
| `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts` | Modified | Migrated to factory pattern |

### New Error Types (in `errors.ts`)

```typescript
export class BetterAuthResponseError extends Data.TaggedError("BetterAuthResponseError")<{
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
}> {}

export class SessionExpiredError extends Data.TaggedError("SessionExpiredError")<{
  readonly message: string;
}> {}

export class InvalidCredentialsError extends Data.TaggedError("InvalidCredentialsError")<{
  readonly message: string;
}> {}

export class RateLimitedError extends Data.TaggedError("RateLimitedError")<{
  readonly message: string;
  readonly retryAfter?: number;
}> {}

export class EmailVerificationRequiredError extends Data.TaggedError("EmailVerificationRequiredError")<{
  readonly message: string;
  readonly email: string;
}> {}

export type HandlerError = IamError | UnknownIamError | BetterAuthResponseError | SessionExpiredError | InvalidCredentialsError | RateLimitedError | EmailVerificationRequiredError;
```

### Handler Factory Pattern

```typescript
// With payload (sign-in, sign-up)
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});

// Without payload (sign-out)
export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```

## Phase 7 Tasks

### Task 1: Migrate Remaining Handlers

Handlers to migrate:
1. `packages/iam/client/src/sign-up/email/sign-up-email.handler.ts`
2. `packages/iam/client/src/core/get-session/get-session.handler.ts`

For `get-session`:
- No `payloadSchema` needed
- `mutatesSession: false` (read-only)

For `sign-up/email`:
- Has `payloadSchema`
- `mutatesSession: true`
- Has complex password confirmation validation in contract

### Task 2: Update AGENTS.md Documentation

#### IAM Client AGENTS.md Updates

Add new section for handler factory pattern:

```markdown
### Create a handler with the factory pattern

```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./my-feature.contract.ts";

// With payload
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});

// Without payload
export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```
```

Add gotcha section:

```markdown
### Handler Factory Gotchas

- **`mutatesSession` flag**: MUST be `true` for sign-in, sign-out, sign-up, verify, passkey, social. Controls `$sessionSignal` notification.
- **`execute` function**: Receives encoded payload (not decoded). Do NOT call `S.encode` manually.
- **Error handling**: Factory automatically checks `response.error`. Do NOT add manual error checks.
```

### Task 3: Create Test Files (Optional but Recommended)

Location: `packages/iam/client/src/_common/__tests__/`

Files to create:
1. `handler.factory.test.ts`
2. `schema.helpers.test.ts`

Test scenarios for handler factory:
- Encodes payload before executing
- Fails Effect when `response.error` is present
- Decodes success data on successful response
- Notifies `$sessionSignal` when `mutatesSession: true`
- Does NOT notify `$sessionSignal` when `mutatesSession: false`
- Generates correct span name

### Task 4: Implement atom.factory.ts (Optional Extension)

Create `packages/iam/client/src/_common/atom.factory.ts`:

```typescript
export const createMutationAtom = <Input, Output, Error>(config: {
  readonly runtime: Runtime;
  readonly handler: (input: Input) => Effect.Effect<Output, Error>;
  readonly toast: {
    readonly waiting: string;
    readonly success: string | ((result: Output) => string);
    readonly failure: (error: Error) => string;
  };
}) => {
  const atom = config.runtime.fn(
    F.flow(
      config.handler,
      withToast({
        onWaiting: config.toast.waiting,
        onSuccess: config.toast.success,
        onFailure: config.toast.failure,
      })
    )
  );

  const useMutation = () => {
    const mutate = useAtomSet(atom, { mode: "promise" as const });
    return { mutate };
  };

  return { atom, useMutation };
};
```

## Files to Read Before Implementation

| File | Purpose |
|------|---------|
| `specs/iam-effect-patterns/PLAN.md` | Complete implementation plan |
| `specs/iam-effect-patterns/outputs/pattern-proposals.md` | Full code implementations |
| `specs/iam-effect-patterns/REFLECTION_LOG.md` | Phase 6 learnings |
| `packages/iam/client/src/_common/handler.factory.ts` | Reference implementation |
| `packages/iam/client/AGENTS.md` | Documentation to update |
| `.claude/rules/effect-patterns.md` | Import and naming rules |

## Constraints

1. **Effect namespace imports**: `import * as Effect from "effect/Effect"`
2. **No native methods**: Use `A.map`, `R.keys`, `F.pipe`
3. **PascalCase Schema**: `S.Struct`, `S.String`
4. **Path aliases**: Use `@beep/*` in examples

## Success Verification

After implementation, run:

```bash
# Type checking
bun run check --filter @beep/iam-client

# Linting
bun run lint --filter @beep/iam-client

# Tests (if tests created)
bun run test --filter @beep/iam-client

# Build
bunx turbo run build --filter @beep/iam-client
```

## Phase 7 Checkpoint

Before marking Phase 7 complete, verify:

- [ ] `sign-up/email` handler migrated
- [ ] `get-session` handler migrated
- [ ] IAM Client AGENTS.md updated with factory pattern
- [ ] (Optional) Test files created
- [ ] (Optional) atom.factory.ts implemented
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] REFLECTION_LOG.md updated

## Post-Phase 7 Actions

1. Update README.md to mark Phase 7 complete
2. Create handoff for Phase 8 (if additional patterns needed)
3. Consider migrating patterns to other IAM handlers (passkey, social, etc.)

## Agent Recommendation

Use `effect-code-writer` agent for handler migrations and `doc-writer` for AGENTS.md updates.

## Ready to Execute

All prerequisites satisfied. Phase 7 can proceed immediately.
