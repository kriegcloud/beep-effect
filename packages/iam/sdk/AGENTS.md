# AGENTS Guide — `@beep/iam-sdk`

## Purpose & Fit
`@beep/iam-sdk` is the typed contract layer that bridges Better Auth’s React client with Effect-first flows across the repo. The package now centers on contract schemas plus thin Effect implementations—`AuthHandler.make`, keyed semaphores, and the old `auth-wrapper` pipeline are gone. UI slices (`packages/iam/ui`, `apps/web`) consume these contracts directly through runtime helpers, while adapters keep raw Better Auth usage isolated to this workspace.

## Surface Map
- **Root exports (`src/index.ts`)** — expose domain-specific contracts + implementations (sign-in/out, sign-up, recover, verify, two-factor, organization, oauth) and `AuthCallback`. No aggregate `iam` facade is published yet; `src/clients/iam.client.ts` remains commented until the bundle stabilises.
- **Adapters (`src/adapters/better-auth/*`)** — instantiate the Better Auth React client with all required plugins (`client.ts`) and wrap provider errors (`errors.ts`). `$store` and `signIn` are re-exported for guards that need to bind to session state. `src/adapters/better-call/*` hosts shared HTTP error helpers (currently only used internally).
- **ContractKit (`src/contractkit`)** — Effect-based contract authoring utilities:
  - `Contract.ts` defines user + provider-defined contract primitives, context annotations, and helper types.
  - `ContractSet.ts` groups contracts, produces Layer/Context bindings, and provides the `handle` executor used by implementers.
  - `failure-continuation.ts` exposes `makeFailureContinuation` to convert Better Auth promise APIs into Effect failures tagged with `IamError`.
  - `IamError.ts` gives the structured error family shared by contract sets. Keep it in sync with `packages/common/schema` HTTP models.
- **Errors (`src/errors.ts`)** — wraps `BetterAuthError` into the shared `IamError` class so UI callers always receive consistent metadata (`code`, `status`, `plugin`, `method`).
- **Clients (`src/clients/*`)** — each domain directory exports `<feature>.contracts.ts` (Effect schema definitions) and `<feature>.implementations.ts` (Effect wrappers that call the Better Auth client via `makeFailureContinuation`). Contracts are also collected into `ContractSet` instances for easy registration.
- **Constants (`src/constants.ts`)** — `AuthCallback` sanitisation helpers to keep callback URLs constrained to known private prefixes.
- **Tests (`test/Dummy.test.ts`)** — placeholder Bun test file. Add focused suites beside new logic; nothing exercises the contract implementations yet.

## Usage Snapshots
- `apps/web/src/app/dashboard/layout.tsx:3` pipes `SignOutImplementations.SignOutContract` through atoms + `withToast` to power dashboard sign-out while refreshing the runtime.
- `apps/web/src/providers/AuthGuard.tsx:3` imports the Better Auth `client`, triggers `$store.notify("$sessionSignal")` on mount, and redirects when sessions disappear.
- `apps/web/src/providers/GuestGuard.tsx:3` combines `AuthCallback.getURL` with `client.useSession()` to keep signed-in users away from guest-only pages.
- `packages/iam/ui/src/sign-in/sign-in.view.tsx:2` and sibling forms consume `SignInImplementations` contracts to build runtime-powered atoms that surface toast + navigation.
- `packages/iam/ui/src/verify/verify-phone.form.tsx:1` uses `VerifyImplementations` directly, showing how UI forms should bind to contract sets without an `iam` facade.

## Tooling & Docs Shortcuts
- `context7__resolve-library-id` — `{"libraryName":"effect"}`
- `context7__get-library-docs` — `{"context7CompatibleLibraryID":"/effect-ts/effect","topic":"Effect.async","tokens":1500}`
- `effect_docs__effect_docs_search` — `{"query":"AbortController signal Effect"}`
- `effect_docs__get_effect_doc` — `{"documentId":10386}` (covers `Effect.annotateLogs`)
- `effect_docs__effect_docs_search` — `{"query":"Redacted value"}` for sanitising credentials before transport

## Authoring Guardrails
- Keep namespace imports for every Effect module and repo package (`import * as Effect from "effect/Effect"`, `import * as F from "effect/Function"`). Native array/string helpers remain forbidden—pipe through `effect/Array` and `effect/String`.
- Treat `contractkit` as the single source of truth for new flows: define schemas with `Contract.make`, group them via `ContractSet.make`, and expose implementations with `ContractSet.of`.
- When calling Better Auth methods, always wrap them with `makeFailureContinuation({ contract, metadata })`. This guarantees uniform `IamError` instances, log annotations, and optional abort controllers.
- Fire `client.$store.notify("$sessionSignal")` after any successful operation that mutates session state (sign-in, sign-out, passkey, social). Guards rely on that signal (see `apps/web/src/providers/AuthGuard.tsx:16`).
- Avoid resurrecting `AuthHandler`/`auth-wrapper` semantics—timeouts, retries, and toasts now live in consuming layers (atoms + `withToast`). Keep SDK implementations narrowly focused on transport and error shaping.
- Keep `AuthCallback` prefixes aligned with `apps/web/src/middleware.ts`. Update both whenever authenticated route trees move.

## Quick Recipes
### Wire a sign-out atom with toast feedback
```ts
import { SignOutImplementations } from "@beep/iam-sdk";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { withToast } from "@beep/ui/common/with-toast";
import { Atom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";

const runtime = Atom.runtime(clientRuntimeLayer);

export const signOutAtom = runtime.fn(
  F.flow(
    SignOutImplementations.SignOutContract,
    withToast({
      onWaiting: "Signing out",
      onSuccess: "Signed out successfully",
      onFailure: O.match({ onNone: () => "Failed with unknown error.", onSome: (err) => err.message }),
    })
  )
);
```

### Bridge a Better Auth call with `makeFailureContinuation`
```ts
import { client } from "@beep/iam-sdk/adapters/better-auth/client";
import { makeFailureContinuation } from "@beep/iam-sdk/contractkit";
import type { SignInSocialPayload } from "@beep/iam-sdk/clients/sign-in/sign-in.contracts";
import * as Effect from "effect/Effect";

export const signInWithProvider = (payload: SignInSocialPayload.Type) =>
  Effect.gen(function* () {
    const continuation = makeFailureContinuation({
      contract: "SignInSocialContract",
      metadata: () => ({ plugin: "sign-in", method: "social" }),
    }, { supportsAbort: true });

    yield* Effect.flatMap(
      continuation.run((handlers) =>
        client.signIn.social(
          { provider: payload.provider, callbackURL: payload.callbackURL },
          handlers.signal ? { signal: handlers.signal, onError: handlers.onError } : { onError: handlers.onError }
        )
      ),
      continuation.raiseResult
    );

    client.$store.notify("$sessionSignal");
  });
```

### Sanitize callback targets before redirecting
```ts
import * as F from "effect/Function";
import * as Str from "effect/String";
import { AuthCallback } from "@beep/iam-sdk";

export const resolveCallbackTarget = (raw: string | null | undefined) =>
  AuthCallback.sanitizePath(F.pipe(raw ?? AuthCallback.defaultTarget, Str.trim));
```

## Verifications
- `bun run --filter @beep/iam-sdk lint` — Biome check for contracts, adapters, and docs.
- `bun run --filter @beep/iam-sdk check` — TypeScript project references build.
- `bun run --filter @beep/iam-sdk build` — Emits ESM/CJS bundles; catches export drift when contract directories move.
- `bun run --filter @beep/iam-sdk test` — Currently only the placeholder suite; expand alongside new Effect logic.
- Touching `AuthCallback` or session guards? Also run `bun run --filter apps/web lint` to confirm route and guard consumers stay healthy.

## Contributor Checklist
- Add new Better Auth flows by creating matching `*.contracts.ts` and `*.implementations.ts` files, registering them with the existing `ContractSet`, and re-exporting through `src/clients/index.ts`.
- Populate metadata in `makeFailureContinuation({ contract, metadata })` with the actual plugin/method; telemetry and error toasts rely on those strings.
- Ensure credential-bearing fields (email, password, tokens) use `Redacted.value` before passing into Better Auth helpers.
- Keep session-mutating implementations notifying `$sessionSignal`; update usage snapshots if the interaction points move.
- Update this guide whenever `contractkit` APIs change (for example, new helpers on `ContractSet`) so downstream agents stay aligned.
- Replace the dummy Bun test with meaningful coverage when modifying `contractkit` or adapters; co-locate tests beside the touched module.
