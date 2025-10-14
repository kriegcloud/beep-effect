# AGENTS Guide — `@beep/iam-sdk`

## Purpose & Fit
`@beep/iam-sdk` is the thin-but-opinionated client layer that lets UI and runtime callers exercise Better Auth flows without touching raw adapters. The package centralizes handler factories, instrumentation, concurrency guards, and typed contracts so slices such as `apps/web` and `packages/iam/ui` can run IAM actions through Effect-first pipelines. README notes refer to `SPEC.md` / `TODO.md`, but those files are absent—treat this guide as the authoritative reference until the design docs land.

## Surface Map
- **Root exports (`src/index.ts`)** — re-export the auth wrapper, IAM clients, and callback constants so consumers can import from `@beep/iam-sdk`.
- **Auth Wrapper (`src/auth-wrapper/*`)** — `handler` composes `callAuth` with retry/timeout policies, toast decoration, and `AuthHandler.make`. `context` manages FiberRefs for annotations + metric tags. `concurrency` holds the keyed semaphore registry. `errors` normalizes Better Auth payloads into `IamError`. `instrumentation` wires logging, tracing, and metrics hooks.
- **Clients (`src/clients/*`)** — verticalized handler bundles (`sign-in`, `sign-up`, `verify`, `two-factor`, `organization`, `oauth`, etc.) that call the generated Better Auth React client. `iam.client.ts` assembles the public `iam` facade.
- **Adapters (`src/adapters/better-auth`)** — wraps `createAuthClient` with the configured plugin suite and exposes the Better Auth React store plus error glue types.
- **Constants (`src/constants.ts`)** — `AuthCallback` helpers sanitize callback URLs against `@beep/shared-domain` route prefixes and enforce on-path redirects.
- **Errors (`src/errors.ts`)** — `IamError` bridges Better Auth failures with the shared `BeepError` hierarchy and stores metadata used across telemetry.
- **Tests (`test/auth-wrapper/*`)** — Vitest suites exercise handler timeouts, retries, semaphore guards, instrumentation metrics, request context propagation, and error normalization. There is no coverage for `AuthCallback` or the high-level clients yet.

## Usage Snapshots
- `apps/web/src/providers/GuestGuard.tsx:29` uses `AuthCallback.getURL` and `client.useSession()` to redirect signed-in visitors away from guest-only routes.
- `apps/web/src/providers/AuthGuard.tsx:21` drives `client.useSession()` and `client.$store.notify("$sessionSignal")` to hydrate authenticated layouts.
- `apps/web/src/middleware.ts:73` sanitizes incoming callback targets through `AuthCallback.getURL` / `AuthCallback.sanitizePath` before issuing redirects.
- `packages/iam/ui/src/sign-in/sign-in.view.tsx:20` pulls `AuthCallback.getURL` and `iam.signIn.*` handlers into the runtime client bridge used by form submissions.
- `apps/web/src/app/dashboard/layout.tsx:308` runs `iam.signOut` via `makeRunClientPromise` and supplies UI callbacks that push to `paths.auth.signIn`.

## Tooling & Docs Shortcuts
- `context7__resolve-library-id` — `{"libraryName":"effect"}`
- `context7__get-library-docs` — `{"context7CompatibleLibraryID":"/effect-ts/effect","topic":"TSemaphore","tokens":1500}`
- `effect_docs__effect_docs_search` — `{"query":"TSemaphore"}`
- `effect_docs__get_effect_doc` — `{"documentId":10635}`
- `effect_docs__effect_docs_search` — `{"query":"SynchronizedRef"}`
- `effect_docs__get_effect_doc` — `{"documentId":10224}`

## Authoring Guardrails
- Preserve namespace imports for every Effect module and shared package (`import * as Effect from "effect/Effect"`, `import { iam } from "@beep/iam-sdk"`). Never drop to native array or string helpers in new code—follow the repo-wide rule.
- Extend the `auth-wrapper` layer (handlers, context, instrumentation) instead of bypassing it with raw Better Auth client calls; that is how retries, spans, and toast semantics stay consistent.
- When adding handlers, prefer `AuthHandler.make` with `schema` or `prepare` pipelines so validation failures become `IamError` instances. Feed toast overrides through the helper instead of inlining UI notifications.
- Guard concurrent submissions with `withSubmissionGuard` and use stable keys (`plugin.method` pairs). Reuse `buildHandlerOptions` families for shared settings rather than mutating handler configs manually.
- Update `AuthCallback` route prefixes in step with middleware (`apps/web/src/middleware.ts`) so client-side and edge sanitization stay aligned.
- Maintain telemetry wiring: always annotate new handlers with meaningful `annotations` / `metrics` fields and keep `withRequestContext` in the call chain.
- Surface Better Auth error codes via `normalizeAuthError` so downstream UI can rely on `IamError.code` / `status`. If the Better Auth SDK changes payload shape, update the normalizer and the tests together.

## Quick Recipes
### Run email sign-in through the runtime bridge
```ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type { SignInEmailContract } from "@beep/iam-sdk/clients";
import { iam } from "@beep/iam-sdk";
import { makeRunClientPromise } from "@beep/runtime-client";

export const submitEmailSignIn = (runtime: Runtime, input: SignInEmailContract.Type) =>
  makeRunClientPromise(runtime, "iam.signIn.email")(
    F.pipe(Effect.succeed(input), Effect.flatMap(iam.signIn.email))
  );
```

### Create a guarded handler with retry + timeout semantics
```ts
import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import { SendVerifyPhoneContract } from "@beep/iam-sdk/clients/verify/verify.contracts";
import { client } from "@beep/iam-sdk/adapters";

export const sendPhoneChallenge = AuthHandler.make<SendVerifyPhoneContract.Type, SendVerifyPhoneContract.Encoded>({
  name: "sendPhoneChallenge",
  plugin: "verification",
  method: "phone",
  schema: SendVerifyPhoneContract,
  retry: { maxAttempts: 2, baseDelay: "150 millis" },
  timeout: { duration: "3 seconds", message: "Timed out waiting for phone verification" },
  semaphoreKey: "verification.phone",
  run: AuthHandler.map(client.phoneNumber.verify),
  annotations: { action: "verification", method: "phone" },
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
- `bun run --filter @beep/iam-sdk lint` — Biome check for the SDK only.
- `bun run --filter @beep/iam-sdk test` — Vitest suite covering auth wrapper behavior.
- `bun run --filter @beep/iam-sdk check` — TypeScript project references build.
- `bun run --filter @beep/iam-sdk build` — Ensures both ESM and CJS bundles compile after handler changes.
- When touching middleware-aligned behavior, also run `bun run --filter apps/web lint` to catch callback routing regressions.

## Contributor Checklist
- Sync new Better Auth endpoints by adding contracts (`src/clients/**.contracts.ts`), handlers, and the aggregated `iam` facade export; update usage snapshots here if the surface grows.
- Expand Vitest coverage for any new handler branch (timeouts, retries, semaphore usage, context propagation) and add missing tests for `AuthCallback` when tweaking its normalization logic.
- Keep `client.$store.notify("$sessionSignal")` semantics intact when changing session-related handlers—`apps/web/src/providers/*` assume the signal fires on successful auth.
- Update route prefix lists in both `AuthCallback` and `apps/web/src/middleware.ts` whenever dashboard pathing changes.
- Record any new Effect patterns or external references by appending to the Tooling section, so future agents have the same docs payloads.
- If README references regain `SPEC.md` / `TODO.md`, cross-link them from this guide; until then, treat this file as the onboarding entry point.
