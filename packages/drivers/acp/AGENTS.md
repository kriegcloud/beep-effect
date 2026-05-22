# @beep/acp Agent Guide

## Purpose & Fit
- Effect-native Agent Client Protocol driver.
- Keep ACP wire contracts, transport helpers, typed protocol errors, and
  driver-local layers product-neutral.
- Product-specific agent behavior belongs in the owning slice or shared
  use-case contracts.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| `@beep/acp` | `Agent`, `Client`, `Errors`, `Protocol`, `Rpc`, `Schema`, `Terminal`, `VERSION` | package entry point and only public import surface |

`src/internal/*` and `src/_generated/*` are package-private. Do not add package
exports for them; route generated schema/meta access through the root `Schema` namespace.

## Generator Notes
- ACP schema release is pinned to `v0.11.3`.
- `bun run generate` downloads upstream `schema.unstable.json` and
  `meta.unstable.json`, normalizes nullable JSON Schema unions, and rewrites
  `src/_generated/schema.gen.ts` plus `src/_generated/meta.gen.ts`.
- `bun run generate -- --skip-download` uses existing upstream JSON assets.
- Root `codegen` wiring may invoke this package generator, but build/check must
  remain offline.

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Keep `beep.family` set to `drivers` in `package.json`.
- Do not import product slices or `shared/*`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/acp` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { Client, Schema, VERSION } from "@beep/acp"

const clientTag = Client.AcpClient
const request = Schema.InitializeRequest.make({
  clientCapabilities: {
    fs: { readTextFile: false, writeTextFile: false },
    terminal: false
  },
  clientInfo: { name: "@beep/acp", version: VERSION },
  protocolVersion: 1
})
```

## Verifications
- `bun run --cwd packages/drivers/acp generate`
- `bunx turbo run test --filter=@beep/acp`
- `bunx turbo run test:integration --filter=@beep/acp`
- `bunx turbo run lint --filter=@beep/acp`
- `bunx turbo run check --filter=@beep/acp`
- `bunx turbo run type-test docgen --filter=@beep/acp`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
