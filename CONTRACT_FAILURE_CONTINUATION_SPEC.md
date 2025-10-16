# Contract Failure Continuation Specification

## 1. Purpose
The failure continuation helper bridges Better Auth callback-style error hooks into ContractKit’s Effect-based error channel without relying on mutable state or ad-hoc normalization. This specification captures the contract for the helper, the surrounding ergonomics, and adoption guidance for sign-in v2 handlers and future clients.

## 2. Design Goals
- **Referential transparency**: eliminate shared mutable error buckets inside handlers.
- **Typed normalization**: produce `IamError.IamError` for both callback errors and `{ data, error }` payloads using existing `IamError.match` semantics.
- **Single resolution**: guard against multiple invocations of Better Auth callbacks or promise resolution races.
- **Configurable abort semantics**: only forward an `AbortSignal` when the downstream client explicitly supports it.
- **Composable adoption**: expose a small API that handlers can compose within `Effect.gen`, preserving current side effects (e.g., `$sessionSignal` notifications).

## 3. Constraints & Assumptions
- Better Auth documentation surfaced via `mcp:context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"fetchOptions signal AbortSignal","tokens":4000}` does not mention `fetchOptions.signal`. The helper therefore defaults to *not* passing a signal and only enables cancellation when a caller explicitly opts in.
- Better Auth may invoke `fetchOptions.onError` even when the returned promise resolves with `{ error: ... }`. The helper must treat the first signal (callback or promise) as definitive and ignore subsequent events.
- Contract metadata (e.g., `plugin`, `method`, `contract`) varies per handler. The helper should accept a metadata provider rather than hard-coded constants to prevent drift.

## 4. API Surface
```ts
import type { FailureContinuation } from "@beep/iam-sdk/contractkit/failure-continuation";

export interface FailureContinuationContext {
  readonly contract: string;
  readonly metadata: () => Readonly<{
    readonly plugin: string;
    readonly method: string;
  }>;
}

export interface FailureContinuationOptions {
  readonly supportsAbort?: boolean; // default false
}

export interface FailureContinuationHandlers {
  readonly signal?: AbortSignal;
  readonly onError: (ctx: { readonly error: unknown }) => void;
}

export interface FailureContinuation {
  readonly run: <A>(
    register: (handlers: FailureContinuationHandlers) => Promise<A>
  ) => Effect.Effect<A, IamError.IamError>;
  readonly raiseResult: (result: { readonly error: unknown | null | undefined }) => Effect.Effect<void, IamError.IamError>;
}

export const makeFailureContinuation: (
  ctx: FailureContinuationContext,
  options?: FailureContinuationOptions
) => FailureContinuation;
```

### 4.1 Behaviour
- `run` composes an `Effect.asyncInterrupt`, creating an `AbortController` only when `supportsAbort === true`.
- A `settled` flag guarantees exactly one outcome:
  - `handlers.onError` resumes the fiber with `Effect.fail(normalize(ctx.error))`.
  - Promise fulfillment resolves via `Effect.succeed`.
  - Promise rejection resolves via `Effect.fail`.
  - Additional invocations after settlement are ignored (`Effect.unit`).
- `raiseResult` inspects `{ error }` payloads (returned by Better Auth) and fails with the same normalization used in `run`. Handlers should call it immediately after `run` completes.
- Normalization delegates to `IamError.match`, enriched with `plugin`/`method` metadata supplied by the caller’s `metadata` thunk.
- Cleanup aborts the `AbortController` if one was created. When `supportsAbort` is false, the cleanup is a no-op.

## 5. Handler Integration Pattern
```ts
const continuation = makeFailureContinuation({
  contract: "SignInEmailContract",
  metadata: () => ({ plugin: "sign-in", method: "email" }),
});

const result = yield* continuation.run((handlers) =>
  client.signIn.email(
    { /* payload */ },
    {
      fetchOptions: {
        ...("signal" in handlers ? { signal: handlers.signal } : {}),
        onError: handlers.onError,
        headers: { "x-captcha-response": captchaToken },
      },
    }
  )
);

yield* continuation.raiseResult(result);

if (result.error == null) {
  client.$store.notify("$sessionSignal");
}
```

### Notes
- Spread `handlers.signal` conditionally (`supportsAbort` may be false).
- Preserve existing `client.$store.notify` calls and other success-path logic.
- Remove legacy `let error` buckets and post-call `if (error)` guards.

## 6. Adoption Tasks
1. Introduce `failure-continuation.ts` under `packages/iam/sdk/src/contractkit/`.
2. Refactor sign-in v2 handlers to the pattern above.
3. Update docs/AGENTS guidance to point at the helper and describe optional abort behavior.
4. Queue follow-up refactors for other `fetchOptions.onError` usages (sign-up, verify, sign-out).
5. Add unit coverage (`packages/iam/sdk/src/contractkit/__tests__/failure-continuation.test.ts`) verifying:
   - callback-triggered failure,
   - promise rejection,
   - promise success,
   - `raiseResult` propagation,
   - optional cancellation path (when `supportsAbort` is true).

## 7. Resolved Considerations
- **Signal support**: Documentation reviewed via the Context7 command above does not expose `fetchOptions.signal`. Until upstream guidance changes, treat signal support as absent and leave `supportsAbort` disabled by default.
- **Repeated callbacks**: The helper’s single-resolution guard ensures subsequent `onError` invocations are ignored. Teams that require logging for additional callbacks can extend the helper locally without breaking referential transparency.
- **Metadata derivation**: Contract annotations (`Contract.annotate`, `Contract.annotateContext`) already expose a path to store plugin/method metadata. This specification keeps a per-handler metadata thunk for clarity; future work (tracked in the rollout plan) can explore harvesting metadata directly from annotations once consumers are aligned.

## 8. Future Extensions
- Add helper utilities for success-path decorations (e.g., centralizing `$sessionSignal` notifications).
- Explore integrating the helper into ContractKit layer assembly so implementations automatically receive a continuation when constructing layers.
