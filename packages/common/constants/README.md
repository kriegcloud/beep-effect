# @beep/constants

Effect-first literal kits and path helpers used by env loaders, auth flows, logging, and asset manifests across the `beep-effect` monorepo.

## What you get
- Env literals: `EnvValue` (`dev|staging|prod`) and `NodeEnvValue` (`test|development|production`) for server/client config.
- Auth providers: `AuthProviderNameValue` with `filter` enforcing non-empty, validated lists.
- Logging: `LogLevel` and `LogFormat` string literal kits wired into runtime telemetry.
- Pagination and plans: `PAGINATION_LIMIT` literal (100) and `SubscriptionPlanValue` (`basic|pro|enterprise`).
- Public assets: generated `publicPaths` plus `assetPaths`/`pathObjFromPaths` for typed access to `/public` assets.

## Quick start
```ts
import { EnvValue, LogLevel, LogFormat } from "@beep/constants";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as S from "effect/Schema";

const env = F.pipe(
  process.env.ENV,
  S.decodeUnknownEither(EnvValue),
  Either.getOrElse(() => EnvValue.Enum.dev)
);

const logDefaults = {
  level: LogLevel.Enum.Info,
  format: LogFormat.Enum.json,
};
```

```ts
import { AuthProviderNameValue } from "@beep/constants";
import * as A from "effect/Array";
import * as F from "effect/Function";

const enabledProviders = AuthProviderNameValue.filter(["google", "github"]);

const providerIds = F.pipe(
  enabledProviders,
  A.map((provider) => provider)
);
```

## Asset accessors
- `_generated/asset-paths.ts` holds `publicPaths` (literal list of `/public` assets). Do not edit by hand.
- `assetPaths` turns `publicPaths` into a camel-cased object tree; set `widenLeavesToString: true` via `pathObjFromPaths` if you need wider typing.
- Regenerate after asset changes: `bun run --filter tooling/repo-scripts gen:asset-paths`.

```ts
import { assetPaths } from "@beep/constants/paths";
import { pathObjFromPaths } from "@beep/constants/paths/utils";

const manifestIcon = assetPaths.androidChrome192x192;
const overlay = assetPaths.assets.background.overlay;

const marketing = pathObjFromPaths(["/landing/hero.avif", "/landing/icons/star.svg"] as const);
// marketing.landing.hero === "/landing/hero.avif"
```

## Development
- Build: `bun run build --filter @beep/constants`
- Type check: `bun run check --filter @beep/constants`
- Lint: `bun run lint --filter @beep/constants`
- Tests: `bun run test --filter @beep/constants`

## Guardrails
- Keep `_generated/*` read-only; rerun the repo script when assets change.
- Use `BS.StringLiteralKit` for new enums to keep `.Enum`/`.Options` aligned with schemas.
- Stick to Effect namespace imports (`A`, `F`, `Str`, `Struct`, `HashMap`, etc.); avoid native `Array`/`String` helpers in new code.
