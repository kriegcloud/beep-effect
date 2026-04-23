# Editor Migration

## Why `editor` Goes Second

`editor` already looks like a slice, but it still carries the pre-standard
`protocol` and `runtime` package names and depends on the mixed
`runtime/protocol` package. Migrating it second lets the repo reuse the
`repo-memory` playbook while closing one extra concrete decision: the Lexical
editing surface becomes a real `ui` package.

## Target Slice Shape

The target topology is:

```txt
packages/editor/
  domain/
  use-cases/
  config/
  server/
  client/
  ui/
```

`tables/` remains optional until editor owns a persistence boundary that is
meaningfully table-like rather than simple file-backed storage.

## Boundary Contract Clarification

The destination package is `packages/editor/use-cases`, not
`packages/editor/use-cases/public`.

Its canonical contract surfaces are:

```txt
@beep/editor-use-cases/public
@beep/editor-use-cases/server
@beep/editor-use-cases/test
```

Shared sidecar control-plane contracts, when needed, come from
`@beep/shared-use-cases/public`. Editor-specific contracts do not continue to
flow through `@beep/runtime-protocol`.

## Route Table

| Current package | Committed destination | Notes |
|---|---|---|
| `editor/domain` | `packages/editor/domain` | largely canonical already |
| `editor/protocol` | `packages/editor/use-cases` plus imports from `@beep/shared-use-cases/public` | editor-specific HTTP/RPC contracts stay slice-owned; shared sidecar control-plane contracts are imported, not re-exported from repo-memory-owned packages |
| `editor/runtime` | `packages/editor/config` and `packages/editor/server` | runtime config contracts split from live server adapters |
| `editor/client` | `packages/editor/client` | remains canonical after import rewrites |
| `editor/lexical` | explicit new `packages/editor/ui` | current package is product-aware UI around the editor document model and becomes `@beep/editor-ui` |

## Shared Control-Plane Dependency

The editor migration depends on the `runtime/protocol` split completed by the
repo-memory cutover:

- shared sidecar bootstrap and control-plane payloads move to
  `@beep/shared-use-cases/public`
- repo-memory run contracts stay in `@beep/repo-memory-use-cases/*`
- `packages/editor/protocol` stops re-exporting `@beep/runtime-protocol`

This keeps editor from inheriting repo-memory-specific topology for generic
sidecar control-plane contracts.

## Explicit `editor/ui` Creation

`editor-lexical -> editor/ui` is not just a direction. It is an explicit package
creation step.

The migration packet must therefore:

1. create `packages/editor/ui`
2. publish the canonical package name `@beep/editor-ui`
3. move the current Lexical surface there
4. rewrite all app and package imports from `@beep/editor-lexical`
5. delete any compatibility alias once import usage reaches zero

## Consumer Impacts

The editor cutover has concrete downstream consumers:

- `apps/editor-app` depends directly on `@beep/editor-lexical`
- `apps/editor-app` hard-codes `packages/editor/runtime/src/main.ts` in Tauri,
  build, and dev scripts
- `packages/editor/protocol` currently imports and re-exports
  `@beep/runtime-protocol`

Those consumers must move in the same program:

- `@beep/editor-lexical` -> `@beep/editor-ui`
- `packages/editor/runtime/src/main.ts` -> `packages/editor/server/src/main.ts`
  or the canonical editor server entrypoint chosen during implementation
- `@beep/runtime-protocol` imports -> `@beep/shared-use-cases/public` plus
  `@beep/editor-use-cases/*` as appropriate

The editor app also contains `packages/common/ui` path couplings in `tsconfig`
and `components.json`; those are enablement-gate work and must not be left to
block the editor cutover batch.

## Cutover Mechanics

The cutover order is:

1. inherit the pre-slice enablement gate so app scripts, path aliases,
   `components.json`, and root tooling no longer treat legacy editor runtime
   paths as canonical
2. create `packages/editor/use-cases`, `packages/editor/config`,
   `packages/editor/server`, and `packages/editor/ui`
3. move the current `editor/protocol` and `editor/runtime` responsibilities to
   those packages, consuming `@beep/shared-use-cases/public` only for the narrow
   shared control-plane subset
4. rewrite `apps/editor-app` imports and sidecar entrypoints
5. if temporary `@beep/editor-lexical` or runtime-entrypoint wrappers are
   needed, record them in the compatibility ledger with a named deletion gate
6. delete those wrappers once imports and launch scripts no longer reference
   them

## Expected Outcome

The editor migration closes when the repo has a real `editor/ui` package, when
editor protocol contracts no longer piggyback on `runtime/protocol`, and when
the app launch surfaces no longer point at the old `editor/runtime` root.
