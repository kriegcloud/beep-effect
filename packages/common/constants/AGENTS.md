# @beep/constants Agent Guide

## Purpose & Fit
- Provide effect-first constants, literal schemas, and path tooling consumed across server config, IAM surfaces, and web assets.
- Centralize environment & logging enums so `@beep/shared-server` env loaders can share validated options without duplicating literals.
- Offer generated asset path registries and utilities so UI layers avoid stringly-typed URLs.
- Serve as glue between `@beep/schema` literal kits, `@beep/types` string brands, and higher-level slices that need canonical values.

## Surface Map
- **EnvValue.ts / NodeEnvValue.ts** — `BS.StringLiteralKit` wrappers for deployment tiers and Node runtimes; expose `.Options`/`.Enum` plus typed namespaces.
- **AuthProviders.ts** — `AuthProviderNameValue` literal enum with `.configMap` for OAuth provider settings and `.filter` helper that validates supported providers remain non-empty (guarded by `@beep/invariant`). Also exports `TaggedAuthProviderNameValue` for tagged unions.
- **LogLevel.ts / LogFormat.ts** — logging enums mapped into Config pipelines; `LogLevel` adds `.Enum` for ergonomic defaults.
- **Pagination.ts** — `PAGINATION_LIMIT` literal schema (100) used for API defaults; ready for downstream reuse even if adoption is sparse today.
- **SubscriptionPlanValue.ts** — `StringLiteralKit` for subscription plans: "basic", "pro", "enterprise".
- **AllowedHeaders.ts** — `BS.StringLiteralKit` for allowed API headers: "Content-Type", "Authorization", "B3", "traceparent".
- **AllowedHttpMethods.ts** — `BS.HttpMethod.derive` for allowed HTTP methods: "GET", "POST", "PUT", "DELETE", "PATCH"; exposes `.Enum` and `.Options`.
- **Csp.ts** — `CSP_DIRECTIVES` configuration object and `CSP_HEADER` string for Content Security Policy; provides type-safe CSP directive management with Effect-first helper `buildCspHeader`.
- **paths/** — `assetPaths` coerces `_generated/publicPaths` into a type-safe object; `public-paths-to-record` exports utilities (`toJsAccessor`, `pathObjFromPaths`, `toNestedTuple`, `buildPathTuples`) for converting path arrays to typed accessor objects.
- **_generated/** — machine-written sources (`asset-paths.ts`) refreshed via repo scripts; NEVER hand-edit.
- **index.ts** — curated re-export surface (constants, env schemas, path helpers) consumed by other workspaces.

## Usage Snapshots
- `packages/iam/ui/src/sign-in/sign-in-social.tsx` — drives sign-in buttons through `AuthProviderNameValue.filter`, emphasizing non-empty provider lists. Imports from `@beep/shared-env/ClientEnv` for auth provider configuration.
- `packages/shared/domain/src/value-objects/paths.ts` — uses `PathBuilder` from `@beep/shared-domain/factories` (not from this package) for comprehensive dashboard/auth routes.
- `apps/web/src/app/manifest.ts` — sources icon URLs from `assetPaths` so manifest entries remain aligned with generated assets.
- `packages/shared/server/src/services/Upload.service.ts` — imports pagination constants for upload chunk size limits.
- `packages/shared/server/src/rpc/v1/files/initiate-upload.ts` — uses constants for file upload validation and configuration.

## Authoring Guardrails
- **IMPORTANT:** Treat `_generated/*` as read-only; if values change, run the corresponding repo script and document the provenance. NEVER hand-edit generated files.
- Stick with `BS.StringLiteralKit` + schema annotations for new enums; this keeps `.Enum`, `.Options`, and schema metadata aligned.
- ALWAYS use Effect namespaces (`A`, `F`, `Str`, `Struct`, `HashSet`)—NEVER use native `Array`/`String` helpers. Call out any unavoidable exceptions during reviews.
- When expanding `AuthProviderNameValue.filter`, the current implementation uses native `.includes` for array membership checking; consider refactoring to `HashSet` for consistency with Effect patterns.
- For path building, use `PathBuilder` from `@beep/shared-domain/factories`, not from this package.
- Document regeneration steps inside PR descriptions whenever literal kits or generated assets change; downstream teams rely on determinism for Env/CI runs.

## Quick Recipes
- **Decode an env literal with graceful fallback**
  ```ts
  import { EnvValue } from "@beep/constants";
  import * as Either from "effect/Either";
  import * as F from "effect/Function";
  import * as S from "effect/Schema";

  const env = F.pipe(
    process.env.ENV,
    S.decodeUnknownEither(EnvValue),
    Either.getOrElse(() => EnvValue.Enum.dev)
  );
  ```
- **Filter social providers using Effect collections**
  ```ts
  import { AuthProviderNameValue } from "@beep/constants";
  import * as A from "effect/Array";
  import * as F from "effect/Function";
  import * as HashSet from "effect/HashSet";

  const trusted = HashSet.fromIterable(["google", "github"] as const);

  const enabled = F.pipe(
    AuthProviderNameValue.Options,
    A.filter((provider) => HashSet.has(trusted, provider))
  );
  ```
- **Build type-safe asset path accessors**
  ```ts
  import { assetPaths } from "@beep/constants/paths/asset-paths";

  // Access generated paths with full type safety
  const logo = assetPaths.logo; // "/logo.avif"
  const bgBlur = assetPaths.assets.background.background3Blur;
  // "/assets/background/background-3-blur.avif"
  ```
- **Create custom path accessor objects**
  ```ts
  import { pathObjFromPaths } from "@beep/constants/paths/utils";

  const customPaths = ["/home.html", "/about/team.html"] as const;
  const paths = pathObjFromPaths(customPaths);

  paths.home; // "/home.html"
  paths.about.team; // "/about/team.html"
  ```

## Verifications
- `bun run lint --filter @beep/constants` — Biome lint for this workspace.
- `bun run test --filter @beep/constants` — executes Bun tests in the `test/` directory.
- When touching generated files, rerun corresponding repo script (`bun run --filter tooling/repo-scripts gen:asset-paths`) and commit both source + generated output.

## Contributor Checklist
- [ ] Confirm new literals use `BS.StringLiteralKit` with annotations + namespace types.
- [ ] Update or regenerate `_generated` assets when underlying data shifts; NEVER make manual edits.
- [ ] Add/adjust unit coverage in `packages/common/constants/test` for new helpers.
- [ ] Run lint + targeted tests noted above; capture outputs in PR description when possible.
- [ ] Sync root `AGENTS.md` entry whenever guidelines evolve.
- [ ] Reference this guide from slice-specific docs if behaviour changes ripple outward.
