# @beep/constants

Effect-first schema-backed constants, literal kits, and path utilities for the `beep-effect` monorepo.

## Overview

`@beep/constants` centralizes system-wide constants as validated Effect schemas, providing:
- Environment literals (deployment tiers, Node environments)
- Authentication provider enums with OAuth configuration
- Logging configuration (levels, formats)
- HTTP/API constants (allowed methods, headers)
- Content Security Policy directives and headers
- Subscription plan tiers
- Pagination defaults
- Type-safe public asset path accessors

All constants leverage `BS.StringLiteralKit` from `@beep/schema` to expose `.Enum`, `.Options`, and full schema metadata for downstream validation pipelines.

## Installation

```bash
bun add @beep/constants
```

### Peer Dependencies

```json
{
  "effect": "catalog:",
  "@beep/schema": "workspace:^",
  "@beep/utils": "workspace:^",
  "@beep/invariant": "workspace:^",
  "@beep/identity": "workspace:^"
}
```

## Core Exports

All exports are available from the main entry point (`@beep/constants`) and optionally via subpaths for specific modules.

| Category | Exports | Description |
|----------|---------|-------------|
| **Environment** | `EnvValue`, `NodeEnvValue` | Deployment and runtime environment literals |
| **Authentication** | `AuthProviderNameValue`, `TaggedAuthProviderNameValue` | OAuth provider schemas with configuration |
| **Logging** | `LogLevel`, `LogFormat`, `LogFormatTagged` | Log severity and format enums |
| **HTTP/API** | `AllowedHeaders`, `AllowedHttpMethods` | Permitted headers and HTTP methods |
| **Security** | `CSP_DIRECTIVES`, `CSP_HEADER`, `CspDirective` | Content Security Policy configuration |
| **Business** | `SubscriptionPlanValue`, `PAGINATION_LIMIT` | Subscription tiers and pagination defaults |
| **Asset Paths** | `assetPaths`, `pathObjFromPaths`, `toJsAccessor`, `removeExt`, `toNestedTuple`, `buildPathTuples` | Type-safe public asset path accessors and utilities |

### Environment Configuration

#### EnvValue

Deployment environment literal: `"dev"`, `"staging"`, `"prod"`.

```ts
import { EnvValue } from "@beep/constants";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as S from "effect/Schema";

// Decode with graceful fallback
const env = F.pipe(
  process.env.ENV,
  S.decodeUnknownEither(EnvValue),
  Either.getOrElse(() => EnvValue.Enum.dev)
);

// Access all options
const allEnvs = EnvValue.Options; // ["dev", "staging", "prod"]
```

#### NodeEnvValue

Node.js runtime environment: `"test"`, `"development"`, `"production"`.

```ts
import { NodeEnvValue } from "@beep/constants";

const nodeEnv = NodeEnvValue.Enum.production;
const isDev = nodeEnv === NodeEnvValue.Enum.development;
```

### Authentication

#### AuthProviderNameValue

Social authentication providers with OAuth configuration and validation.

**Supported Providers**: `"github"`, `"google"`, `"linkedin"`, `"twitter"`, `"discord"`

```ts
import { AuthProviderNameValue } from "@beep/constants";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Filter providers with validation (ensures non-empty array)
const enabledProviders = AuthProviderNameValue.filter(["google", "github"]);

// Access provider configuration
const googleConfig = AuthProviderNameValue.configMap.google;
// { prompt: "consent", accessType: "offline", scope: [...] }

// All available providers
const allProviders = AuthProviderNameValue.Options;
// ["github", "google", "linkedin", "twitter", "discord"]
```

#### TaggedAuthProviderNameValue

Tagged union variant for pattern matching:

```ts
import { TaggedAuthProviderNameValue } from "@beep/constants";
import * as S from "effect/Schema";

// Tagged with "name" discriminator
type TaggedProvider = S.Schema.Type<typeof TaggedAuthProviderNameValue>;
// { name: "github" } | { name: "google" } | ...
```

### Logging

#### LogLevel

Log severity levels: `"All"`, `"Debug"`, `"Error"`, `"Fatal"`, `"Info"`, `"Trace"`, `"None"`, `"Warning"`.

```ts
import { LogLevel } from "@beep/constants";

const logConfig = {
  level: LogLevel.Enum.Info,
  minimumLevel: LogLevel.Enum.Warning,
};

// All available levels
const levels = LogLevel.Options;
```

#### LogFormat

Output format options: `"pretty"`, `"json"`, `"logFmt"`, `"structured"`.

```ts
import { LogFormat } from "@beep/constants";

const format = LogFormat.Enum.json;

// All available formats
const formats = LogFormat.Options;
```

#### LogFormatTagged

Tagged union for log format with `_tag` discriminator:

```ts
import { LogFormatTagged } from "@beep/constants";
import * as S from "effect/Schema";

type TaggedFormat = S.Schema.Type<typeof LogFormatTagged>;
// { _tag: "pretty" } | { _tag: "json" } | { _tag: "logFmt" } | { _tag: "structured" }
```

### HTTP/API Constants

#### AllowedHeaders

Permitted HTTP headers for API routes.

**Values**: `"Content-Type"`, `"Authorization"`, `"B3"`, `"traceparent"`

```ts
import { AllowedHeaders } from "@beep/constants";

const headers = AllowedHeaders.Options;
// ["Content-Type", "Authorization", "B3", "traceparent"]

const authHeader = AllowedHeaders.Enum.Authorization;
```

#### AllowedHttpMethods

Permitted HTTP methods for API routes.

**Values**: `"GET"`, `"POST"`, `"PUT"`, `"DELETE"`, `"PATCH"`

```ts
import { AllowedHttpMethods } from "@beep/constants";

const methods = AllowedHttpMethods.Options;
// ["GET", "POST", "PUT", "DELETE", "PATCH"]

const getMethod = AllowedHttpMethods.Enum.GET;
```

### Content Security Policy

#### CSP_DIRECTIVES

Configuration object for Content Security Policy directives, mapping each directive to an array of allowed sources.

```ts
import { CSP_DIRECTIVES } from "@beep/constants";

// Access specific directives
const scriptSources = CSP_DIRECTIVES["script-src"];
// ["'self'", "blob:", "https://cdn.jsdelivr.net"]

const connectSources = CSP_DIRECTIVES["connect-src"];
// ["'self'", "https://vercel.live/", "ws:", "wss:", ...]
```

#### CSP_HEADER

Pre-built CSP header string for use in Next.js headers configuration or middleware.

```ts
import { CSP_HEADER } from "@beep/constants";

// Use in Next.js config
const headers = [
  {
    key: "Content-Security-Policy",
    value: CSP_HEADER,
  },
];
```

#### CspDirective

TypeScript type for CSP directive names, derived from the keys of `CSP_DIRECTIVES`.

```ts
import type { CspDirective } from "@beep/constants";

// Type-safe directive names
const directive: CspDirective = "script-src";
// Valid: "default-src" | "base-uri" | "form-action" | "script-src" | ...
```

#### Working with CSP in Effect

```ts
import { CSP_DIRECTIVES } from "@beep/constants";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";

// Add additional sources to a directive using Effect utilities
const extendedDirectives = F.pipe(
  CSP_DIRECTIVES,
  R.modify("script-src", (sources) =>
    F.pipe(
      sources,
      A.appendAll(["https://example.com", "https://cdn.example.com"])
    )
  )
);

// Get all unique domains from CSP directives
const allDomains = F.pipe(
  CSP_DIRECTIVES,
  Struct.values,
  A.fromIterable,
  A.flatten,
  A.filter((source) => F.pipe(source, Str.startsWith("https://"))),
  A.dedupe
);
```

### Business Constants

#### SubscriptionPlanValue

Subscription tier literals: `"basic"`, `"pro"`, `"enterprise"`.

```ts
import { SubscriptionPlanValue } from "@beep/constants";
import * as S from "effect/Schema";

const plan = SubscriptionPlanValue.Enum.pro;

// Validate plan input
const validatePlan = (input: unknown) =>
  S.decodeUnknownSync(SubscriptionPlanValue)(input);
```

#### PAGINATION_LIMIT

Default pagination limit (100) as a typed literal schema.

```ts
import { PAGINATION_LIMIT } from "@beep/constants";

const limit = PAGINATION_LIMIT.Value; // 100

// Use as schema
import * as S from "effect/Schema";
type Limit = S.Schema.Type<typeof PAGINATION_LIMIT>; // 100
```

## Asset Path Utilities

### Generated Asset Paths

The `_generated/asset-paths.ts` file contains a generated list of all public assets. **Do not edit manually.**

```ts
// From _generated/asset-paths.ts
export const publicPaths = [
  "/logo.avif",
  "/android-chrome-192x192.png",
  "/assets/background/overlay.png",
  // ... (auto-generated)
] as const;
```

### Type-Safe Asset Accessor

Access public assets via camelCased object paths:

```ts
import { assetPaths } from "@beep/constants";
// or via subpath: import { assetPaths } from "@beep/constants/paths";

const logo = assetPaths.logo; // "/logo.avif"
const androidIcon = assetPaths.androidChrome192x192; // "/android-chrome-192x192.png"
const overlay = assetPaths.assets.background.overlay; // "/assets/background/overlay.png"
```

### Custom Path Objects

Build your own type-safe path accessors:

```ts
import { pathObjFromPaths } from "@beep/constants";
// or via subpath: import { pathObjFromPaths } from "@beep/constants/paths/utils";

// Define custom paths
const customPaths = [
  "/home.html",
  "/about/team.html",
  "/assets/icons/star.svg",
] as const;

// Generate accessor object
const paths = pathObjFromPaths(customPaths);

paths.home; // "/home.html"
paths.about.team; // "/about/team.html"
paths.assets.icons.star; // "/assets/icons/star.svg"

// Widen leaf types to string (for large path lists)
const widePaths = pathObjFromPaths(customPaths, {
  widenLeavesToString: true,
});
// Leaf values are still exact strings at runtime, but typed as `string`
```

### Path Utility Functions

```ts
import {
  toJsAccessor,
  toNestedTuple,
  buildPathTuples,
  removeExt,
} from "@beep/constants";
// or via subpath: import { ... } from "@beep/constants/paths/utils";

// Convert dash-separated to camelCase
toJsAccessor("ic-app-5"); // "icApp5"

// Remove file extension
removeExt("logo.png"); // "logo"

// Convert path to nested tuple
toNestedTuple("/assets/background/image.png");
// ["assets", ["background", ["image", "image"]]]

// Build tuples from multiple paths
const tuples = buildPathTuples(["/logo.png", "/assets/icon.svg"] as const);
```

## Effect Patterns

All constants follow Effect-first patterns:

### Using with Effect Config

```ts
import { EnvValue, LogLevel, LogFormat } from "@beep/constants";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const envConfig = Config.mapOrFail(
  Config.string("ENV"),
  S.decodeUnknown(EnvValue)
);

const logLevelConfig = Config.withDefault(
  Config.mapOrFail(Config.string("LOG_LEVEL"), S.decodeUnknown(LogLevel)),
  LogLevel.Enum.Info
);

const program = Effect.gen(function* () {
  const env = yield* envConfig;
  const level = yield* logLevelConfig;

  console.log({ env, level });
});
```

### Schema Validation in Pipelines

```ts
import { AuthProviderNameValue } from "@beep/constants";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as F from "effect/Function";

const validateProvider = (input: unknown) =>
  F.pipe(
    input,
    S.decodeUnknown(AuthProviderNameValue),
    Effect.mapError((error) => ({
      _tag: "ValidationError" as const,
      message: `Invalid provider: ${error}`,
    }))
  );

const program = Effect.gen(function* () {
  const provider = yield* validateProvider("google");
  // provider: "google" (validated)
});
```

### Working with Collections

```ts
import { AllowedHttpMethods } from "@beep/constants";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";

// Build a set of allowed methods
const allowedSet = F.pipe(
  AllowedHttpMethods.Options,
  HashSet.fromIterable
);

// Check if method is allowed
const isMethodAllowed = (method: string) =>
  HashSet.has(allowedSet, method);

// Filter incoming methods
const validateMethods = (methods: readonly string[]) =>
  F.pipe(
    methods,
    A.filter((m) => HashSet.has(allowedSet, m))
  );
```

## Regenerating Asset Paths

After adding/removing files in the `/public` directory:

```bash
bun run --filter tooling/repo-scripts gen:asset-paths
```

This updates `_generated/asset-paths.ts` and ensures `assetPaths` reflects the current asset structure.

## Development

### Build

```bash
bun run --filter @beep/constants build
```

### Type Check

```bash
bun run --filter @beep/constants check
```

### Lint

```bash
bun run --filter @beep/constants lint
bun run --filter @beep/constants lint:fix
```

### Test

```bash
bun run --filter @beep/constants test
bun run --filter @beep/constants coverage
```

### Circular Dependency Check

```bash
bun run --filter @beep/constants lint:circular
```

## Guardrails

### Generated Files

- **Never manually edit** `_generated/*` files
- Regenerate via repo scripts when underlying data changes
- Commit both source changes and generated output together

### CSP Configuration

- **Coordinate changes** with app deployments to avoid breaking external integrations
- **Test thoroughly** when modifying `CSP_DIRECTIVES` — incorrect CSP can block legitimate resources
- **Document rationale** for adding new sources in commit messages (security review requirement)

### Creating New Constants

1. Use `BS.StringLiteralKit` for string literal enums
2. Add schema annotations (`schemaId`, `identifier`, `title`, `description`)
3. Export TypeScript namespace for `.Type` and `.Encoded`
4. Add to `src/index.ts` exports

Example:

```ts
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export class MyConstant extends BS.StringLiteralKit("foo", "bar", "baz").annotations({
  schemaId: Symbol.for("@beep/constants/MyConstant"),
  identifier: "MyConstant",
  title: "My Constant",
  description: "Description of my constant",
}) {}

export declare namespace MyConstant {
  export type Type = S.Schema.Type<typeof MyConstant>;
  export type Encoded = S.Schema.Encoded<typeof MyConstant>;
}
```

### Effect Collection Usage

- **Always use Effect utilities**: `A.*`, `F.*`, `Str.*`, `Struct.*`, `HashMap.*`, `HashSet.*`
- **Never use native methods**: Avoid `Array.prototype.*`, `String.prototype.*`, `Object.*`
- Import namespaced: `import * as A from "effect/Array"`

### Path Building

- Use `pathObjFromPaths` for asset accessor objects
- Use `PathBuilder` from `@beep/shared-domain/factories` for route paths (not from this package)
- Ensure `as const` on path arrays to preserve literal types

## Usage in Monorepo

### Consumed By

- **@beep/shared-server** — Environment config, logging setup
- **@beep/iam/server** — Auth provider validation
- **@beep/iam/ui** — Social login buttons
- **apps/web** — Asset manifests, API route validation, CSP headers
- **apps/server** — Environment detection, logging configuration

### Integration Points

```ts
// In @beep/shared-server ServerEnv
import { EnvValue, AuthProviderNameValue, LogFormat } from "@beep/constants";

// In @beep/iam/ui sign-in flow
import { AuthProviderNameValue } from "@beep/constants";
const providers = AuthProviderNameValue.filter(["google", "github"]);

// In apps/web next.config.ts
import { CSP_HEADER } from "@beep/constants";
export default {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP_HEADER },
        ],
      },
    ];
  },
};

// In apps/web manifest
import { assetPaths } from "@beep/constants";
const icons = [{ src: assetPaths.androidChrome192x192, sizes: "192x192" }];
```

## API Reference

For detailed API documentation, see:
- [AGENTS.md](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/constants/AGENTS.md) — Package-specific agent guide
- [Source code](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/constants/src) — Full type definitions and implementations

## Contributing

When adding new constants:

1. Confirm the constant is truly shared across multiple packages
2. Use `BS.StringLiteralKit` for consistency
3. Add comprehensive schema annotations
4. Include usage examples in this README
5. Add unit tests in `test/`
6. Update AGENTS.md if patterns change

## License

MIT
