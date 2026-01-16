# AGENTS Guide — `@beep/iam-client`

## Purpose & Fit

`@beep/iam-client` is the typed contract layer that bridges Better Auth’s React client with Effect-first flows across the
repo. The package now centers on contract schemas plus thin Effect implementations—`AuthHandler.make`, keyed semaphores,
and the old `auth-wrapper` pipeline are gone. UI slices (`packages/iam/ui`, `apps/web`) consume these contracts directly
through runtime helpers, while adapters keep raw Better Auth usage isolated to this workspace.

## Surface Map

- **Root exports (`src/index.ts`)** — expose `AuthClient` type and `AuthCallback` utilities for callback URL sanitization.
- **Adapters (`src/adapters/better-auth/*`)** — instantiate the Better Auth React client with all required plugins
  (`client.ts`) and wrap provider errors (`errors.ts`). `$store` and client methods are re-exported for guards that need to
  bind to session state.
- **Errors (`src/errors.ts`)** — wraps `BetterAuthError` into the shared `IamError` class so UI callers always receive
  consistent metadata (`code`, `status`, `plugin`, `method`).
- **V1 Modules (`src/v1/*`)** — each domain directory (sign-in, sign-up, passkey, two-factor, etc.) exports schemas,
  forms, and atoms for reactive state management. These modules integrate with Better Auth via adapters and expose
  React hooks for form handling (`useSignInEmailForm`, `useSignUpEmailForm`, etc.) and atoms for runtime-powered flows
  (passkey atoms, password recovery atoms, etc.). Common schemas and helpers live in `src/v1/_common/`.
- **Atom Layer (`src/atom/*`)** — contains higher-level atoms that compose v1 module primitives with runtime layers,
  providing ready-to-use reactive state for sign-in, sign-up, and session management.
- **Constants (`src/constants/AuthCallback/`)** — `AuthCallback` sanitisation helpers to keep callback URLs constrained to known
  private prefixes.
- **Tests (`test/`)** — test suites for IAM client functionality. Add focused tests beside new logic to ensure proper
  integration with Better Auth and Effect runtime.

## Usage Snapshots

- Dashboard layouts pipe sign-out contracts through atoms + `withToast` to power sign-out flows while refreshing the runtime.
- Auth guards import the Better Auth `client`, trigger `$store.notify("$sessionSignal")` on mount, and redirect when sessions disappear.
- Guest guards combine `AuthCallback.getURL` with `client.useSession()` to keep signed-in users away from guest-only pages.
- Sign-in forms and sibling components consume contract implementations to build runtime-powered atoms that surface toast + navigation.
- Verification forms use contract implementations directly, showing how UI forms should bind to contract sets.

## Related Documentation

- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/AGENTS.md` — canonical reference for Effect Schema patterns and primitives used throughout IAM schemas.

## Authoring Guardrails

- ALWAYS keep namespace imports for every Effect module and repo package (`import * as Effect from "effect/Effect"`,
  `import * as F from "effect/Function"`). Native array/string helpers remain forbidden—pipe through `effect/Array` and
  `effect/String`.
- Use Effect Schema (`import * as S from "effect/Schema"`) with PascalCase constructors (`S.Struct`, `S.String`, `S.Number`)
  for all validation schemas in forms and API payloads.
- When integrating with Better Auth, wrap calls in `Effect.gen` or `Effect.tryPromise` to maintain Effect-first semantics.
  Use `IamError.match` to normalize Better Auth errors into structured `IamError` instances.
- Fire `client.$store.notify("$sessionSignal")` after any successful operation that mutates session state (sign-in, sign-out, passkey, social). Guards rely on that signal.
- Atoms MUST use `withToast` wrapper from `@beep/ui/common/with-toast` for optimistic updates and user feedback.
  Keep atoms narrowly focused on single operations (sign-in, sign-out, password change).
- Keep `AuthCallback` prefixes aligned with app middleware in `apps/web`. Update both whenever authenticated route trees move.

## Quick Recipes

### Create a handler with the factory pattern

The handler factory (`createHandler`) reduces boilerplate and ensures consistent patterns:

```ts
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./my-feature.contract.ts";

// With payload (sign-in, sign-up)
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});

// Without payload (sign-out, get-session)
export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```

**Benefits:**
- Auto-generates Effect.fn span name: `"{domain}/{feature}/handler"`
- Properly checks `response.error` before decoding
- Notifies `$sessionSignal` when `mutatesSession: true`
- Reduces handler code from ~20 lines to ~8 lines

### Wire a sign-out atom with toast feedback

```ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { Atom } from "@effect-atom/atom-react";
import { client } from "@beep/iam-client/adapters";
import { IamError } from "@beep/iam-client/errors";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { withToast } from "@beep/ui/common/with-toast";

const runtime = Atom.runtime(clientRuntimeLayer);

export const signOutAtom = runtime.fn(
  F.flow(
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: () => client.signOut(),
        catch: (error) => IamError.match(error, { method: "signOut", domain: "auth" }),
      });

      client.$store.notify("$sessionSignal");
      return result;
    }),
    withToast({
      onWaiting: "Signing out",
      onSuccess: "Signed out successfully",
      onFailure: O.match({ onNone: () => "Failed with unknown error.", onSome: (err) => err.message }),
    })
  )
);
```

### Integrate Better Auth with Effect runtime

```ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { client } from "@beep/iam-client/adapters";
import { IamError } from "@beep/iam-client/errors";

export const signInWithProvider = (provider: string, callbackURL?: string) =>
  Effect.gen(function* () {
    const result = yield* Effect.tryPromise({
      try: () =>
        client.signIn.social({
          provider,
          callbackURL,
        }),
      catch: (error) =>
        IamError.match(error, {
          method: "signInWithProvider",
          domain: "auth",
          plugin: "social",
        }),
    });

    if (result.error) {
      return yield* Effect.fail(
        IamError.new(result.error, "Social sign-in failed", {
          method: "signInWithProvider",
          domain: "auth",
        })
      );
    }

    client.$store.notify("$sessionSignal");
    return result.data;
  });
```

### Sanitize callback targets before redirecting

```ts
import * as F from "effect/Function";
import * as Str from "effect/String";
import { AuthCallback } from "@beep/iam-client";

export const resolveCallbackTarget = (raw: string | null | undefined) =>
  F.pipe(raw ?? AuthCallback.defaultTarget, Str.trim, AuthCallback.sanitizePath);
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

- Add new Better Auth flows by creating matching schema/form/atom files in `src/v1/[feature]/` directories.
  Follow the existing pattern: `*.schema.ts` for Effect Schema definitions, `*.forms.ts` for React hook form helpers,
  and `*.atoms.ts` for reactive state with runtime integration.
- Wrap Better Auth calls in `Effect.tryPromise` or `Effect.gen` with proper error handling via `IamError.match`.
  Ensure error metadata includes `method`, `domain`, and `plugin` fields for structured telemetry.
- Ensure credential-bearing fields (email, password, tokens) use `S.Redacted(S.String)` in schemas and extract values
  via `Redacted.value()` before passing to Better Auth.
- Keep session-mutating implementations notifying `$sessionSignal` via `client.$store.notify("$sessionSignal")`;
  update usage snapshots if the interaction points move.
- Update this guide whenever v1 module structure changes or new Better Auth plugins are added so downstream agents
  stay aligned.
- Add focused tests in `test/` when modifying adapters or adding new v1 modules; co-locate tests beside
  the touched module when possible.

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

### Handler Factory Configuration
- **`mutatesSession` flag**: MUST be `true` for sign-in, sign-out, sign-up, verify, passkey, social. Controls `$sessionSignal` notification.
- **`execute` function**: Receives encoded payload (not decoded). Do NOT call `S.encode` manually.
- **Error handling**: Factory automatically checks `response.error`. Do NOT add manual error checks.
- **Span naming**: Factory generates `"{domain}/{feature}/handler"`. Match your directory structure.

### Handler Factory Limitations
- **Symptom**: Type errors when using `createHandler` with complex payload schemas.
- **Root Cause**: Some contracts (like `sign-up/email`) use `transformOrFailFrom` which produces encoded output that lacks computed fields (e.g., `name` computed from `firstName`+`lastName`).
- **Solution**: For these edge cases, create a manual handler that encodes the payload, manually adds computed fields, checks `response.error`, and notifies `$sessionSignal`. See `sign-up/email/sign-up-email.handler.ts` for an example.
