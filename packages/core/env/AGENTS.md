# packages/core/env — Agent Guide

## Purpose & Fit
- Provides the canonical server and client environment loaders for every runtime. `serverEnv` wraps all sensitive configuration into Redacted values and feeds runtime layers, while `clientEnv` validates the public `NEXT_PUBLIC_*` surface before React boot.
- Anchors shared environment rules for sibling core packages: mailers (`@beep/core-email`), database bootstrap (`@beep/core-db`), runtime assemblies, and IAM/Files slices all derive URLs, keys, and log policies from these exports.
- Serves as the guardrail for env naming conventions (all constant case via `ConfigProvider.constantCase`) and placeholder secret rotation.

## Surface Map
- `packages/core/env/src/server.ts:19` — placeholder sentinel and `withPlaceholderRedacted` helper for redacted secrets.
- `packages/core/env/src/server.ts:29` — `AppConfig` builder combining `APP_*` + `VERCEL_*` groups.
- `packages/core/env/src/server.ts:96` — `ServerConfig` aggregate configuring auth, cloud, payment, email, KV, security, AI, and OTLP branches.
- `packages/core/env/src/server.ts:279` — `serverEnv`, the eagerly-evaluated configuration exported to the rest of the repo.
- `packages/core/env/src/common.ts:4` — `ConfigURL` factory for single URLs.
- `packages/core/env/src/common.ts:10` — `ConfigArrayURL` factory for URL hash sets (note TODO below about native `.map`).
- `packages/core/env/src/client.ts:10` — `AuthProviderNames` destructive transform bridging comma-delimited lists into `NonEmptyArray`.
- `packages/core/env/src/client.ts:36` — `clientEnv`, validated bundle of public runtime flags.

## Usage Snapshots
- `packages/runtime/server/src/server-runtime.ts:26` — names telemetry resources and log layers with `serverEnv.app.*`.
- `apps/web/src/middleware.ts:47` — injects `serverEnv.security.csp` into every response header and redirect.
- `packages/core/email/src/adapters/resend/service.ts:11` — unwraps `serverEnv.email.resend.apiKey` with `Redacted.value` when constructing the Resend client.
- `packages/iam/infra/src/config.ts:5` — derives an IAM-specific config layer from `serverEnv`, preserving nested shapes.
- `packages/runtime/client/src/services/runtime/live-layer.ts:28` — builds OTLP exporters and log policy off `clientEnv`.
- `apps/web/src/GlobalProviders.tsx:29` — passes `clientEnv.captchaSiteKey` into the ReCaptcha provider after un-redacting.
- `packages/iam/sdk/src/adapters/better-auth/client.ts:27` — threads `clientEnv.authUrl`, `.authPath`, and `.googleClientId` into the Better Auth client.

## Tooling & Docs Shortcuts
- `jetbrains__search_in_files_by_text` to audit consumers: `{"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"@beep/core-env","maxUsageCount":50}`.
- `effect_docs__get_effect_doc` for `Config.all`: `{"documentId":5378}` — confirms composite config behavior.
- `effect_docs__get_effect_doc` for `Config.redacted`: `{"documentId":5402}` — reference for redacting secrets.
- `effect_docs__get_effect_doc` for `Schema.NonEmptyTrimmedString`: `{"documentId":8710}` — mirrors the client schema requirement.
- `effect_docs__get_effect_doc` for `Schema.Redacted`: `{"documentId":8881}` — explains how redacted schemas encode values.
- `effect_docs__effect_docs_search` for provider casing utilities: `{"query":"Config Provider constantCase"}` — surfaces `ConfigProvider.fromEnv` helpers.
- `context7__get-library-docs` when you need richer Effect background: `{"context7CompatibleLibraryID":"/effect-ts/effect","topic":"Config"}`.

## Authoring Guardrails
- Do not read from `process.env` outside `clientEnv`; all server-side code must flow through `ServerConfig` (any new env var must be represented there and exposed deliberately).
- Preserve redaction: any new secret must leverage `Config.redacted` and optional `withPlaceholderRedacted` so secrets can live in source-controlled `.env.example` as `PLACE_HOLDER` without leaking real values.
- Maintain constant-case naming — rely on `ConfigProvider.constantCase` rather than introducing manual case conversions.
- Avoid native array/string helpers when touching `common.ts`; refactor the legacy `urls.map` to `F.pipe(urls, A.map(...))` the next time the helper changes.
- Keep `serverEnv` pure and side-effect-free after initial resolution; downstream code assumes immutability (mutations break layers caching derived config).
- When widening schemas (e.g., adding OAuth providers), mirror the client/server surfaces and extend sibling packages (`@beep/constants`, `@beep/schema`) first to keep the types aligned.

## Quick Recipes
- **Add a new nested config branch**
  ```ts
  import * as Config from "effect/Config";
  import * as F from "effect/Function";
  import * as A from "effect/Array";
  import * as Str from "effect/String";

  const ThirdPartyConfig = Config.nested("FOO")(
    Config.all({
      baseUrl: Config.url("BASE_URL"),
      allowedOrigins: Config.array(Config.url("ALLOWED_ORIGINS")),
    })
  ).pipe(
    Config.map((config) => ({
      baseUrl: config.baseUrl.toString(),
      allowedOrigins: F.pipe(
        config.allowedOrigins,
        A.map((origin) => origin.toString())
      ),
    }))
  );
  ```
- **Extend the client schema with a typed boolean flag**
  ```ts
  import * as F from "effect/Function";
  import * as S from "effect/Schema";

  const ExtendedClientEnvSchema = S.extend(ClientEnvSchema, {
    featureXEnabled: S.Literal("true", "false"),
  });

  export const extendedClientEnv = F.pipe(
    clientEnv,
    (env) => ({ ...env, featureXEnabled: env.featureXEnabled === "true" })
  );
  ```
- **Detect placeholder secrets during validation**
  ```ts
  import * as Effect from "effect/Effect";
  import { isPlaceholder } from "@beep/core-env/server";

  export const ensureSecretsLoaded = Effect.gen(function* () {
    const secret = yield* Effect.sync(() => serverEnv.payment.stripe.key);
    if (isPlaceholder(secret)) {
      return yield* Effect.dieMessage("Replace placeholder Stripe secret before enabling payments");
    }
    return secret;
  });
  ```

## Verifications
- `bun run lint` — ensures Effect import and formatting rules remain intact.
- `bun run check` — confirms type safety after modifying config shapes projected into other packages.
- `bun run test --filter core-env` — once the placeholder suite expands beyond `Dummy.test.ts`, keep it green before handing work back.
- For runtime sanity, run `bun run dev apps/web` with environment overrides to confirm new config branches hydrate correctly (coordinate with the user before starting long-lived commands).

## Contributor Checklist
- [ ] Added or renamed env vars in both `ServerConfig` and `clientEnv` where applicable, plus updated `.env.example` / deployment secrets.
- [ ] Ensured new secrets are wrapped in `Config.redacted` and respect `PLACE_HOLDER` semantics for local scaffolding.
- [ ] Verified downstream packages (`@beep/*`) compile by running `bun run check`.
- [ ] Documented new behavior either here or in sibling guides, and linked to this file from any feature docs that assume updated env state.
- [ ] Audited for native array/string helpers inside touched files and replaced them with Effect utilities.
