# AGENTS Guide — `@beep/iam-client`

## Purpose & Fit

`@beep/iam-client` is the typed contract layer that bridges Better Auth’s React client with Effect-first flows across the
repo. The package now centers on contract schemas plus thin Effect implementations—`AuthHandler.make`, keyed semaphores,
and the old `auth-wrapper` pipeline are gone. UI slices (`packages/iam/ui`, `apps/web`) consume these contracts directly
through runtime helpers, while adapters keep raw Better Auth usage isolated to this workspace.

## Surface Map

- **Root exports (`src/index.ts`)** — expose domain-specific contracts + implementations (sign-in/out, sign-up, recover,
  verify, two-factor, organization, oauth) and `AuthCallback`. No aggregate `iam` facade is published yet;
  `src/clients/iam.client.ts` remains commented until the bundle stabilises.
- **Adapters (`src/adapters/better-auth/*`)** — instantiate the Better Auth React client with all required plugins
  (`client.ts`) and wrap provider errors (`errors.ts`). `$store` and `signIn` are re-exported for guards that need to
  bind to session state.
- **Contract runtime (`@beep/contract` / `packages/common/contract`)** — Effect-based contract authoring utilities:
    - `Contract.ts` defines user + provider-defined contract primitives, context annotations, and helper types.
    - `ContractKit.ts` groups contracts, produces Layer/Context bindings, and provides the `handle` executor used by
      implementers.
    - `failure-continuation.ts` (internal) powers `contract.continuation` used by `Contract.make(...).implement(...)`.
    - `IamError.ts` gives the structured error family shared by contract sets. Keep it in sync with
      `packages/common/schema` HTTP models.
- **Errors (`src/errors.ts`)** — wraps `BetterAuthError` into the shared `IamError` class so UI callers always receive
  consistent metadata (`code`, `status`, `plugin`, `method`).
- **Clients (`src/clients/*`)** — each domain directory exports `<feature>.contracts.ts` (Effect schema definitions) and
  `<feature>.implementations.ts` (Effect wrappers that call the Better Auth client via the contract’s
  `implement`/`continuation` helpers).
  Contracts are also collected into `ContractKit` instances for easy registration.
- **Constants (`src/constants.ts`)** — `AuthCallback` sanitisation helpers to keep callback URLs constrained to known
  private prefixes.
- **Tests (`test/Dummy.test.ts`)** — placeholder Bun test file. Add focused suites beside new logic; nothing exercises
  the contract implementations yet.

## Usage Snapshots

- Dashboard layouts pipe sign-out contracts through atoms + `withToast` to power sign-out flows while refreshing the runtime.
- Auth guards import the Better Auth `client`, trigger `$store.notify("$sessionSignal")` on mount, and redirect when sessions disappear.
- Guest guards combine `AuthCallback.getURL` with `client.useSession()` to keep signed-in users away from guest-only pages.
- Sign-in forms and sibling components consume contract implementations to build runtime-powered atoms that surface toast + navigation.
- Verification forms use contract implementations directly, showing how UI forms should bind to contract sets.

## Related Documentation

- `packages/common/contract/AGENTS.md` — canonical reference for the underlying `Contract`/`ContractKit` runtime (read before altering continuations or lift helpers surfaced here).

## Authoring Guardrails

- ALWAYS keep namespace imports for every Effect module and repo package (`import * as Effect from "effect/Effect"`,
  `import * as F from "effect/Function"`). Native array/string helpers remain forbidden—pipe through `effect/Array` and
  `effect/String`.
- Treat `contractkit` as the single source of truth for new flows: define schemas with `Contract.make`, group them via
  `ContractKit.make`, and expose implementations with `ContractKit.of`.
- When calling Better Auth methods, ALWAYS wire handlers through `ContractName.implement(Effect.fn(function* (payload, { continuation }) { ... }))`, encode payloads via `ContractName.encodePayload`, call Better Auth with `_internal` helpers (`withFetchOptions`, `addFetchOptions`), raise results via `continuation`, and decode with `ContractName.decodeUnknownSuccess`.
- Fire `client.$store.notify("$sessionSignal")` after any successful operation that mutates session state (sign-in, sign-out, passkey, social). Guards rely on that signal.
- NEVER resurrect `AuthHandler`/`auth-wrapper` semantics—timeouts, retries, and toasts now live in consuming layers (atoms + `withToast`). Keep CLIENT implementations narrowly focused on transport and error shaping.
- Keep `AuthCallback` prefixes aligned with app middleware. Update both whenever authenticated route trees move.

## Quick Recipes

### Wire a sign-out atom with toast feedback

```ts
import {SignOutImplementations} from "@beep/iam-client";
import {clientRuntimeLayer} from "@beep/runtime-client";
import {withToast} from "@beep/ui/common/with-toast";
import {Atom} from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";

const runtime = Atom.runtime(clientRuntimeLayer);

export const signOutAtom = runtime.fn(
  F.flow(
    SignOutImplementations.SignOut,
    withToast({
      onWaiting: "Signing out",
      onSuccess: "Signed out successfully",
      onFailure: O.match({onNone: () => "Failed with unknown error.", onSome: (err) => err.message}),
    })
  )
);
```

### Bridge a Better Auth call with `Contract.implement`

```ts
import {client} from "@beep/iam-client/adapters";
import {addFetchOptions, requireData} from "@beep/iam-client/clients/_internal";
import {SignInSocialContract} from "@beep/iam-client/clients/sign-in/sign-in.contracts";
import {IamError} from "@beep/iam-client/errors";
import * as Effect from "effect/Effect";

export const SignInWithProviderHandler = SignInSocialContract.implement(
  Effect.fn(function* (payload, {continuation}) {
    const result = yield* continuation.run((handlers) =>
      client.signIn.social(
        addFetchOptions(handlers, {
          provider: payload.provider,
          callbackURL: payload.callbackURL ?? undefined,
        })
      )
    );

    yield* continuation.raiseResult(result);

    if (result.error == null) {
      client.$store.notify("$sessionSignal");
    }

    const data = yield* requireData(result.data, "SignInWithProviderHandler", continuation.metadata);

    return yield* SignInSocialContract.decodeUnknownSuccess(data);
  }, Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, continuation.metadata)),
  }))
);
```

### Sanitize callback targets before redirecting

```ts
import * as F from "effect/Function";
import * as Str from "effect/String";
import {AuthCallback} from "@beep/iam-client";

export const resolveCallbackTarget = (raw: string | null | undefined) =>
  AuthCallback.sanitizePath(F.pipe(raw ?? AuthCallback.defaultTarget, Str.trim));
```

## Verifications

> **Note**: The `PATH` prefix ensures Bun is found when running from environments where `~/.bun/bin` is not in the default PATH (e.g., some IDE terminal configurations or CI runners). If Bun is already in your PATH, you can omit this prefix.

- `PATH="$HOME/.bun/bin:$PATH" bun run --filter @beep/iam-client lint` — Biome check for contracts, adapters, and docs.
- `PATH="$HOME/.bun/bin:$PATH" bun run --filter @beep/iam-client check` — TypeScript project references build.
- `PATH="$HOME/.bun/bin:$PATH" bun run --filter @beep/iam-client build` — Emits ESM/CJS bundles; catches export drift when contract directories move.
- `bun run --filter @beep/iam-client test` — Currently only the placeholder suite; expand alongside new Effect logic.
- Touching `AuthCallback` or session guards? Also run `bun run --filter apps/web lint` to confirm route and guard
  consumers stay healthy.

## Contributor Checklist

- Add new Better Auth flows by creating matching `*.contracts.ts` and `*.implementations.ts` files, registering them
  with the existing `ContractKit`, and re-exporting through `src/clients/index.ts`.
- Implement handlers via `ContractName.implement(Effect.fn(...))`, encode payloads, call Better Auth through
  `continuation.run`, and decode via `ContractName.decodeUnknownSuccess`; telemetry + toasts rely on those
  `continuation.metadata` values being accurate.
- Ensure credential-bearing fields (email, password, tokens) use `Redacted.value` before passing into Better Auth
  helpers.
- Keep session-mutating implementations notifying `$sessionSignal`; update usage snapshots if the interaction points
  move.
- Update this guide whenever `contractkit` APIs change (for example, new helpers on `ContractKit`) so downstream agents
  stay aligned.
- Replace the dummy Bun test with meaningful coverage when modifying `contractkit` or adapters; co-locate tests beside
  the touched module.

## Security

### Credential Handling in Contracts
- ALWAYS use `Redacted.value` when extracting credential values (email, password, tokens) before passing to Better Auth.
- NEVER log credential payloads—contract implementations MUST NOT include password or token values in telemetry.
- ALWAYS define credential fields with sensitive schema wrappers in contract definitions.
- NEVER expose raw credential values in error messages or continuation metadata.

### Token Security
- NEVER store session tokens in localStorage or sessionStorage—rely on Better Auth's httpOnly cookie handling.
- ALWAYS use `AuthCallback.sanitizePath` to validate redirect URLs before authentication redirects.
- NEVER include tokens in URL query parameters; use POST bodies or secure cookies only.
- ALWAYS fire `$sessionSignal` after credential operations to ensure guards react to state changes.

### Contract Implementation Security
- ALWAYS use `continuation.run` to wrap Better Auth calls—this ensures proper error boundary handling.
- NEVER bypass contract encoding/decoding; raw Better Auth responses may contain sensitive data.
- ALWAYS decode responses via `ContractName.decodeUnknownSuccess` to strip unexpected fields.
- NEVER expose Better Auth internal error details to UI consumers; map to `IamError` types.

### Rate Limiting Awareness
- Client implementations MUST handle rate limit responses gracefully (429 status).
- NEVER implement client-side retry loops that could amplify rate-limited requests.
- ALWAYS surface rate limit feedback to users rather than silently retrying.

### Callback URL Validation
- ALWAYS constrain `callbackURL` values to known `privatePrefix` paths via `AuthCallback`.
- NEVER allow user-controlled callback URLs without sanitization.
- ALWAYS validate callback targets match the application's authenticated route structure.

### Session State Management
- ALWAYS treat `client.$store` as the single source of truth for session state.
- NEVER cache session data outside the Better Auth client store.
- ALWAYS handle session expiry by redirecting to authentication flows—NEVER show stale session state.

## Gotchas

### Contract Schema Mismatches
- **Symptom**: Runtime decode errors with `ParseError` when calling Better Auth methods.
- **Root Cause**: Contract success/failure schemas drift from Better Auth's actual response shapes after plugin updates.
- **Solution**: When upgrading Better Auth, verify response shapes in browser devtools and update contract schemas accordingly. Run `ContractName.decodeUnknownSuccess` in isolation to test.

### Continuation Metadata Must Be Accurate
- **Symptom**: Telemetry spans show wrong `domain` or `method` values; toast messages display incorrect context.
- **Root Cause**: `continuation.metadata` is derived from contract annotations at implementation time—if you copy/paste implementations, metadata may be stale.
- **Solution**: ALWAYS verify that `.annotate(Contract.Domain, ...)` and `.annotate(Contract.Method, ...)` match the actual contract being implemented. Metadata flows through `withToast` and tracing.

### `$sessionSignal` Notification Timing
- **Symptom**: Auth guards do not react after sign-in/sign-out completes; UI shows stale session state.
- **Root Cause**: `client.$store.notify("$sessionSignal")` was not called after a session-mutating operation.
- **Solution**: Every implementation that changes session state (sign-in, sign-out, verify, passkey, social) MUST call `client.$store.notify("$sessionSignal")` after success. Guards subscribe to this signal.

### Better Auth Internal Helpers (`addFetchOptions`, `withFetchOptions`)
- **Symptom**: Requests fail silently or return unexpected errors when calling Better Auth methods.
- **Root Cause**: Better Auth methods require specific fetch option shapes that change between versions.
- **Solution**: Use `_internal` helpers from `@beep/iam-client/clients/_internal` to wrap fetch options. These helpers abstract version-specific option shapes.

### `Redacted.value` Must Unwrap Credentials
- **Symptom**: Better Auth receives `[Redacted]` string instead of actual credential values.
- **Root Cause**: Schema uses `S.Redacted(S.String)` but implementation forgets to call `Redacted.value()` before passing to Better Auth.
- **Solution**: ALWAYS extract credential values via `Redacted.value(payload.password)` before calling Better Auth methods. The schema's `Redacted` wrapper is for type safety and logging suppression, not automatic unwrapping.

### Contract Kit Layer vs Implementation Exports
- **Symptom**: Type errors when wiring contracts into runtime layers; missing implementations at runtime.
- **Root Cause**: Confusion between `ContractKit.toLayer()` (creates Layer from implementations) and direct implementation exports.
- **Solution**: Export both the raw implementation functions (for atoms) AND the ContractKit layer (for runtime composition). See `passkey.service.ts` pattern.

### AuthCallback Prefix Synchronization
- **Symptom**: After sign-in, users redirect to wrong pages or get 404 errors.
- **Root Cause**: `AuthCallback.privatePrefix` values in this package are out of sync with route middleware in `apps/web`.
- **Solution**: When adding authenticated routes, update BOTH `packages/iam/client/src/constants.ts` AND the corresponding middleware in `apps/web`. Run `bun run --filter apps/web lint` to catch mismatches.
