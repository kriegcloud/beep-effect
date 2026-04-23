# Repo-Memory Migration

## Why `repo-memory` Goes First

`repo-memory` is the first full slice migration target because it concentrates
the largest number of architecture-standard transitions in one bounded area:

- `model`
- `runtime`
- `store`
- `sqlite`
- `client`
- `runtime/protocol`
- `runtime/server`

It also powers the desktop app, so finishing this migration proves the target
architecture at a real app boundary instead of only in isolated packages.

## Target Slice Shape

The target topology is:

```txt
packages/repo-memory/
  domain/
  use-cases/
  config/
  server/
  tables/
  client/
```

`ui/` remains optional. It is not required unless the slice later owns reusable
UI surfaces instead of delegating entirely to apps.

## Boundary Contract Clarification

The destination package is `packages/repo-memory/use-cases`. The canonical
boundary exports are:

```txt
@beep/repo-memory-use-cases/public
@beep/repo-memory-use-cases/server
@beep/repo-memory-use-cases/test
```

Likewise, the destination config package is `packages/repo-memory/config` with
canonical subpaths:

```txt
@beep/repo-memory-config/public
@beep/repo-memory-config/server
@beep/repo-memory-config/secrets
@beep/repo-memory-config/layer
@beep/repo-memory-config/test
```

`/public` and `/server` are therefore export surfaces on canonical packages,
not package destinations in their own right.

## Route Table

| Current package | Committed destination | Notes |
|---|---|---|
| `repo-memory/model` | `packages/repo-memory/domain` plus `packages/repo-memory/use-cases` | pure models stay in domain; commands, queries, packets, and application-facing protocol models move to `use-cases` |
| `repo-memory/store` | `packages/repo-memory/use-cases` publishing `@beep/repo-memory-use-cases/server` | current store contracts are product ports, not a standalone package family |
| `repo-memory/sqlite` | split across `packages/repo-memory/config`, `packages/repo-memory/tables`, `packages/repo-memory/server`, and `packages/drivers/drizzle` | the split audit is required before implementation |
| `repo-memory/runtime` | `packages/repo-memory/config`, `packages/repo-memory/server`, and any server-only application contracts in `packages/repo-memory/use-cases` | live runtime assembly is adapter/config code |
| `repo-memory/client` | `packages/repo-memory/client` | client stays canonical once it imports the new `public` contracts |
| `runtime/protocol` | split into `packages/shared/use-cases` plus `packages/repo-memory/use-cases` | shared sidecar control-plane contracts publish from `@beep/shared-use-cases/public`; repo-memory run contracts publish from `@beep/repo-memory-use-cases/public` and `/server` |
| `runtime/server` | `packages/repo-memory/server` plus `packages/repo-memory/config` | desktop launch surfaces and sidecar docs must rewrite in the same cutover |

## Required `repo-memory/sqlite` Split Audit

`repo-memory/sqlite` cannot move as a unit. The package already mixes config,
table definitions, server adapters, and technical driver concerns.

The required audit closes as follows:

| Current surface | Responsibility | Committed destination |
|---|---|---|
| `src/RepoMemorySqlConfig.ts` | server-only repo-memory persistence config contract | `packages/repo-memory/config` exporting `@beep/repo-memory-config/server` |
| `src/RepoMemorySqlLive.ts` | layer assembly wiring product store ports to persistence implementations | `packages/repo-memory/server` |
| row schemas, DDL, and persisted table/read-model declarations inside `src/internal/RepoMemorySql.ts` | slice-owned persistence structure | `packages/repo-memory/tables` |
| store-port implementations, transaction orchestration, and repo-memory-specific query workflows inside `src/internal/RepoMemorySql.ts` | product adapter implementation | `packages/repo-memory/server` |
| extracted generic Effect/Drizzle helper code, if any survives once repo-memory-specific behavior is removed | technical driver substrate | `packages/drivers/drizzle` |
| `src/internal/Telemetry.ts` | repo-memory-specific operation telemetry | `packages/repo-memory/server` |

The important rule is not "move the file somewhere." It is "split the
responsibilities so the file stops violating the target package grammar."

## Consumer Impacts

The repo-memory cutover has explicit downstream consumers:

- `apps/desktop` depends on `@beep/runtime-protocol` today and hard-codes
  `packages/runtime/server/src/main.ts` in Tauri, build, dev, and docs
  surfaces
- `packages/repo-memory/client` currently imports `ControlPlaneApi`,
  `RepoRunRpcGroup`, `SidecarBootstrap`, and run contracts from
  `@beep/runtime-protocol`
- `packages/editor/protocol` currently imports and re-exports
  `@beep/runtime-protocol`, so the protocol split affects editor at the same
  time

Those consumers must move to the split targets:

- shared control-plane contracts -> `@beep/shared-use-cases/public`
- repo-memory run contracts -> `@beep/repo-memory-use-cases/public`
- repo-memory server-only contracts -> `@beep/repo-memory-use-cases/server`
- repo-memory runtime/config surfaces -> `@beep/repo-memory-server` and
  `@beep/repo-memory-config/*`

## Cutover Mechanics

The cutover order is:

1. finish the pre-slice enablement gate so workspaces, path aliases,
   `create-package`, identity registry, and app launch surfaces no longer treat
   `packages/runtime/*` as canonical
2. create `packages/shared/use-cases` only for the narrow sidecar control-plane
   subset and create `packages/repo-memory/use-cases` for repo-memory-specific
   contracts
3. create `packages/repo-memory/config`, `packages/repo-memory/server`, and
   `packages/repo-memory/tables`, then execute the `repo-memory/sqlite` split
4. rewrite `packages/repo-memory/client`, `apps/desktop`, and
   `packages/editor/protocol` to the new import surfaces
5. if a batch cannot cut over atomically, record temporary `@beep/runtime-*`
   aliases or wrapper entrypoints in the compatibility ledger with a deletion
   gate
6. delete `@beep/runtime-protocol`, `@beep/runtime-server`, and any old sidecar
   entrypoint wrappers once import and launch-surface usage reaches zero

## Expected Outcome

This migration closes only when a fresh implementer can move `repo-memory`
without inventing any new routing locally, and when the temporary `runtime/*`
shims created for the cutover are already scheduled for deletion rather than
quietly becoming a second architecture.
