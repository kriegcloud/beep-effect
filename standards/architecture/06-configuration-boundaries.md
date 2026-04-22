# Configuration Boundaries

`config` is a canonical optional slice package kind.

The name is deliberate. `config` names the typed runtime contract the slice
understands. `env` names only one possible source for those values. Effect
`Config` can be backed by environment variables, static test providers, files,
secret stores, platform config, or app/runtime composition.

## What Config Owns

Slice config packages own:

- Effect `Config` declarations and key namespaces
- typed config models, schemas, and services
- public/browser-safe config contracts
- server-only config contracts
- redacted secret config
- defaults and literal domains tied directly to config declarations
- live Layers that read from the ambient `ConfigProvider`
- static/test Layers and fixtures tied to config declarations

The public package convention is:

```txt
@beep/<slice>-config
@beep/shared-config
```

`packages/<slice>/config` is canonical but not mandatory. Create it when the
slice has meaningful runtime or application configuration contracts. Do not
create empty config packages for symmetry.

## Env Is A Source, Not A Package Kind

Environment variables remain a useful source. They should be modeled through
Effect `Config` and `ConfigProvider`, not by direct `process.env` access inside
slice code.

Existing `env` package naming is legacy vocabulary. Migrate package names such
as `@beep/shared-env` and paths such as `packages/shared/env` to
`@beep/shared-config` and `packages/shared/config`.

## Public, Server, And Secret Boundaries

Config packages must make browser safety visible in exports and topology:

```txt
config/src/
  Config.ts
  PublicConfig.ts
  ServerConfig.ts
  Secrets.ts
  Layer.ts
  TestLayer.ts
```

Client packages may import public/browser-safe config contracts and client-safe
config Layers. They must not import server config, secret config, or live
server-only Layers.

Secrets must use redacted values. Secret config belongs in explicit secret or
server-only modules, never in package roots that browser code can casually
import.

## Constants Are Not A Loophole

Config packages are not broad settings packages.

Allowed constants are config vocabulary: key names, namespaces, defaults,
literal domains, and fixtures tied directly to config declarations.

Keep other constants near the concept that gives them meaning:

- business invariants belong in `domain`
- application behavior belongs in `use-cases`
- provider defaults belong in `providers/*`
- presentation constants belong in `client` or `ui`

## Dependency Direction

Config may depend inward on `domain` and `shared` for provider-neutral schemas,
brands, value objects, and validation. That dependency is one-way. Domain may
import shared/common domain primitives, but it must never import slice config,
`@beep/shared-config`, `Config`, `ConfigProvider`, secret helpers, or test config
utilities.

Use-cases may import config contracts or services for application tunables.
Server, client, and app/runtime packages compose the live config Layers that
resolve those contracts from a `ConfigProvider`.

Providers keep technical provider config in provider `.config.ts` files. Slice
config can expose application-facing settings that influence provider wiring,
but it should not own Drizzle, Postgres, EventLog, queue, or workflow-engine
internals.

## Shared Config

`@beep/shared-config` is part of the shared kernel. It may hold cross-slice
config primitives, shared config contracts, redacted-secret helpers, and test
`ConfigProvider` utilities that multiple slices deliberately agree on.

It must not become a global config registry or a Layer that aggregates every
slice's private config into one app-wide object.
