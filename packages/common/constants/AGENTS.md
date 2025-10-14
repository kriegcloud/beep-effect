# @beep/constants Agent Guide

## Purpose & Fit
- Provide effect-first constants, literal schemas, and path tooling consumed across server config, IAM surfaces, and web assets.
- Centralize environment & logging enums so `packages/core/env` and client env loaders can share validated options without duplicating literals.
- Offer safe path composition (`PathBuilder`) and generated asset/locale registries so UI layers avoid stringly-typed URLs.
- Serve as glue between `@beep/schema` literal kits, `@beep/types` string brands, and higher-level slices that need canonical values.

## Surface Map
- **EnvValue.ts / NodeEnvValue.ts** — `BS.stringLiteralKit` wrappers for deployment tiers and Node runtimes; expose `.Options`/`.Enum` plus typed namespaces.
- **AuthProviders.ts** — `AuthProviderNameValue` literal enum + `filter` helper that validates supported providers remain non-empty (guarded by `@beep/invariant`).
- **LogLevel.ts / LogFormat.ts** — logging enums mapped into Config pipelines; `LogLevel` adds `.Enum` for ergonomic defaults.
- **Pagination.ts** — `PAGINATION_LIMIT` literal schema (100) used for API defaults; ready for downstream reuse even if adoption is sparse today.
- **paths/** — `assetPaths` coerces `_generated/publicPaths` into a type-safe object; `PathBuilder` namespace constructs rooted builders, validated URL segments, and query helpers; `public-paths-to-record` powers locale accessors.
- **IsoCountries/** — exhaustive ISO country/currency literal kits and locale accessor conversion utilities (`localesToAccessorRecord`).
- **AllLocales.ts** — bridges `_generated/ALL_LOCALES` into camel-cased accessor map for UI ergonomics.
- **_generated/** — machine-written sources (`ALL_LOCALES.generated.ts`, `asset-paths.ts`) refreshed via repo scripts; never hand-edit.
- **index.ts** — curated re-export surface (constants, env schemas, path helpers) consumed by other workspaces.

## Usage Snapshots
- `packages/core/env/src/server.ts:1` — imports `EnvValue`, `AuthProviderNameValue`, `LogFormat` to gate Effect Config wiring and OAuth provider arrays.
- `packages/core/env/src/client.ts:2` — reuses the same schemas on the client for `NEXT_PUBLIC_*` validation and provider parsing.
- `packages/iam/ui/src/sign-in/sign-in-social.tsx:1` — drives sign-in buttons through `AuthProviderNameValue.filter`, emphasizing non-empty provider lists.
- `packages/shared/domain/src/value-objects/paths.ts:1` — seeds comprehensive dashboard/auth routes via `PathBuilder.createRoot`, `PathBuilder.dynamicQueries`.
- `apps/web/src/app/manifest.ts:1` — sources icon URLs from `assetPaths` so manifest entries remain aligned with generated assets.

## Tooling & Docs Shortcuts
- Refresh schema literal patterns: `context7__get-library-docs` →
  ```json
  {"context7CompatibleLibraryID":"/llmstxt/effect_website-llms.txt","topic":"schema string literal"}
  ```
- Schema literal API reference: `effect_docs__get_effect_doc` →
  ```json
  {"documentId":8871}
  ```
- Regenerate public asset paths: `bun run --filter tooling/repo-scripts gen:asset-paths` (wraps `tooling/repo-scripts/src/generate-asset-paths.ts`).
- Refresh locale inventory: `bun run --filter tooling/repo-scripts gen:locales` → writes `_generated/ALL_LOCALES.generated.ts`.
- Inspect downstream usage fast: `jetbrains__search_in_files_by_text` with payload
  ```json
  {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"AuthProviderNameValue","maxUsageCount":50}
  ```

## Authoring Guardrails
- Treat `_generated/*` as read-only; if values change, run the corresponding repo script and document the provenance.
- Stick with `BS.stringLiteralKit` + schema annotations for new enums; this keeps `.Enum`, `.Options`, and schema metadata aligned.
- Use Effect namespaces (`A`, `F`, `Str`, `Struct`, `HashSet`) everywhere—avoid native `Array`/`String` helpers even if legacy code slips through today. Call out any unavoidable exceptions during reviews.
- When expanding `AuthProviderNameValue.filter`, prefer set membership via `HashSet` rather than native `.includes` to stay within guardrails.
- Keep path utilities safe: route strings must pass through `PathBuilder.collection` / `BS.URLPath.make`; reject ad-hoc template literals.
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
- **Compose queryable paths**
  ```ts
  import { PathBuilder } from "@beep/constants/paths/utils";
  import * as F from "effect/Function";

  const reset = PathBuilder.createRoot("/auth/reset-password");

  const withToken = (token: string) =>
    PathBuilder.dynamicQueries(reset.root)({ token });

  const confirm = withToken("abc");
  // "/auth/reset-password?token=abc"
  ```
- **Map locales into camel-cased accessors**
  ```ts
  import { AllLocales } from "@beep/constants";
  import * as A from "effect/Array";
  import * as F from "effect/Function";
  import * as Struct from "effect/Struct";

  const supportsFrench = F.pipe(
    Struct.entries(AllLocales),
    A.some(([, locale]) => locale === "fr")
  );
  ```

## Verifications
- `bun run lint --filter @beep/constants` — Biome lint for this workspace.
- `bun run test --filter @beep/constants` — executes Bun tests (`PathBuilder.test.ts`).
- When touching generated files, rerun corresponding repo script and commit both source + generated output.

## Contributor Checklist
- [ ] Confirm new literals use `BS.stringLiteralKit` with annotations + namespace types.
- [ ] Update or regenerate `_generated` assets when underlying data shifts; avoid manual edits.
- [ ] Add/adjust unit coverage in `packages/common/constants/test` for new helpers (extend `PathBuilder.test.ts` or add siblings).
- [ ] Run lint + targeted tests noted above; capture outputs in PR description when possible.
- [ ] Sync root `AGENTS.md` entry (see next section) whenever guidelines evolve.
- [ ] Reference this guide from slice-specific docs if behaviour changes ripple outward.
