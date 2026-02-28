# @beep/ai-sdk Effect-First Development Hardening (Master Orchestration)

## Scope and Intent
This orchestration tracks the strict, type-breaking hardening pass for `@beep/ai-sdk` across:
- `packages/ai/sdk/src/**`
- `packages/ai/sdk/test/**`

Locked decisions:
- Whole-package scope
- Type-breaking API changes allowed
- Zero `any` and zero type assertions
- Zero allowlist entries for `packages/ai/sdk` in `standards/effect-laws.allowlist.jsonc`

## Baseline Inventory (Captured)
Captured from current workspace via `rg` scans:
- `S.Struct(` in `packages/ai/sdk/src/**`: **144**
- `S.Class<...>` in `packages/ai/sdk/src/**`: **8**
- `JSON.parse/stringify` in `src/**`: **9**
- `switch (...)` in `src/**`: **7**
- `throw` / `new Error(...)` in `src/**`: **21**
- `Math.random(...)` in `src/**`: **2**
- `any` tokens in `src/**`: **35**
- `as unknown as` in `src/**`: **20**
- `S.TaggedErrorClass<...>()(` without composer identity in `src/**`: **10**
- `S.annotate({ identifier: ... })` in `src/**`: **3**
- `any` tokens in `test/**`: **13**
- `as unknown as` in `test/**`: **16**

## Live Drift Checklist
| Metric | Baseline | Current | Target | Status |
|---|---:|---:|---:|---|
| `JSON.parse/stringify` in `src/**` | 9 | 9 | 0 | TODO |
| `switch (` in `src/**` | 7 | 7 | 0 | TODO |
| `throw` / `new Error(` in `src/**` | 21 | 21 | 0 | TODO |
| `Math.random(` in `src/**` | 2 | 2 | 0 | TODO |
| `\\bany\\b` in `src/**` | 35 | 35 | 0 | TODO |
| `as unknown as` in `src/**` | 20 | 20 | 0 | TODO |
| `\\bany\\b` in `test/**` | 13 | 13 | 0 | TODO |
| `as unknown as` in `test/**` | 16 | 16 | 0 | TODO |
| `S.annotate({ identifier:` in `src/**` | 3 | 3 | 0 | TODO |
| TaggedErrorClass missing composer identity | 10 | 10 | 0 | TODO |
| `S.Struct(` object-schema debt | 144 | 144 | reduce to boundary-only | TODO |

## Required Refactor Categories

### 1) EF-1 Errors Are Data (No throw/new Error)
Target files:
- `src/core/QuickConfig.ts`
- `src/core/Sync/RemoteSync.ts`
- `src/core/Sync/SyncService.ts`
- `src/core/Sync/EventLogRemoteServer.ts`
- `src/core/Mcp/index.ts`
- `src/core/internal/schemaToZod.ts`
- `src/core/Storage/StorageLayers.ts`
- `src/core/Tools/Toolkit.ts`

Outcomes:
- Zero `throw` / `new Error` in `src/**`
- Throwing helpers converted to `Effect.fn(...)` with typed error unions

### 2) EF-3/EF-12/EF-13 Schema Modeling and Annotation
Primary files:
- `src/core/Schema/Hooks.ts`
- `src/core/Schema/Message.ts`
- `src/core/Schema/Permission.ts`
- `src/core/Schema/Options.ts`
- `src/core/Schema/Mcp.ts`
- `src/core/Schema/Common.ts`
- `src/core/Schema/Service.ts`
- `src/core/Schema/ToolInput.ts`
- `src/core/Schema/Sandbox.ts`
- `src/core/Schema/Session.ts`
- `src/core/Schema/External.ts`
- `src/core/experimental/EventLog.ts`
- `src/core/QuerySupervisor.ts`

Outcomes:
- Exported object schemas use `S.Class` unless explicit boundary exception
- All exported schemas annotated with `$I.annote("Name", { description })`
- Replace `S.annotate({ identifier: ... })` with `$I.annote(...)`
- Remove exported `*Schema` suffix constants for domain types

### 3) EF-17 Option Boundaries in Schemas
Primary files:
- `src/core/Schema/Message.ts`
- `src/core/Schema/Options.ts`
- `src/core/Schema/Hooks.ts`
- `src/core/Schema/Permission.ts`
- `src/core/Schema/Mcp.ts`
- `src/core/Schema/Service.ts`

Outcomes:
- External nullish/optional fields decode to `Option`
- Wire behavior remains compatible unless intentionally changed + tested

### 4) EF-5/EF-6/EF-7 Effect Data/Branching APIs
Target files:
- `src/core/Logging/Config.ts`
- `src/core/Logging/Layer.ts`
- `src/core/QuickConfig.ts`
- `src/core/QuerySupervisor.ts`
- `src/core/Sync/RemoteSync.ts`
- `src/core/Sandbox/SandboxCloudflare.ts`

Outcomes:
- Replace `switch` with `Match` exhaustiveness
- Prefer `Predicate` checks over ad hoc runtime checks
- Remove direct `Object.getPrototypeOf` plain-object checks in `Mcp/index.ts`

### 5) EF-19 JSON Boundaries (No JSON.parse/stringify)
Target files:
- `src/core/Diagnose.ts`
- `src/core/AgentRuntime.ts`
- `src/core/Mcp/index.ts`
- `src/core/service/AgentHttpHandlers.ts`
- `src/core/Hooks/Presets.ts`
- `src/core/Sandbox/SandboxCloudflare.ts`

Outcomes:
- No direct `JSON.parse` / `JSON.stringify` in `src/**`
- Use `S.UnknownFromJsonString`, `S.fromJsonString(...)`, `S.decodeUnknown*`, `S.encodeUnknown*`

### 6) EF-9/EF-16 Random/Time as Effect Services
Target files:
- `src/core/QuerySupervisor.ts`
- `src/core/AgentRuntime.ts`

Outcomes:
- Remove `Math.random` fallback ID generation
- Use effectful randomness (`Random`)

### 7) EF-8 Services + Identity Composer Consistency
Target files:
- `src/core/Tools/Errors.ts`
- `src/core/Storage/StorageError.ts`
- `src/core/Session.ts`
- `src/core/SessionPool.ts`
- `src/core/service/SessionErrors.ts`
- `src/core/service/TenantAccess.ts`

Outcomes:
- `S.TaggedErrorClass` declarations use `$AiSdkId` + `$I\`Name\``
- All exported errors/schemas/services have meaningful descriptions
- Service shapes remain explicit interfaces

### 8) EF-14/EF-15 Effect.fn + Observability
Priority files:
- `src/core/Storage/StorageStatus.ts`
- `src/core/Sync/*`
- `src/core/service/*`
- `src/core/Mcp/index.ts`
- `src/core/AgentRuntime.ts`
- `src/core/QuerySupervisor.ts`

Outcomes:
- Reusable exported effect functions declared via `Effect.fn("...")`
- Key workflows instrumented with logs/spans/metrics

### 9) Repository Law Strict Typing (No any/assertions)
Highest-debt files:
- `src/core/Tools/Toolkit.ts`
- `src/core/Tools/Tool.ts`
- `src/core/MessageFilters.ts`
- `src/core/internal/schemaToZod.ts`
- `src/core/Mcp/index.ts`
- `src/core/Diagnose.ts`
- `src/core/AgentSdk.ts`
- `test/**`

Outcomes:
- Zero `any`
- Zero `as unknown as`
- Typed helper factories, schema decode boundaries, and constrained generics

## Execution Sequence
1. Create this orchestration artifact (complete).
2. Re-run baseline inventory and update drift table after each category batch.
3. Refactor typed errors and remove throws first.
4. Migrate schemas (`S.Class`, tagged unions, `$I.annote`, `OptionFrom*`).
5. Replace runtime native APIs (`JSON`, `switch`, randomness, unsafe checks).
6. Refactor Tool/Toolkit typing and remove assertions/`any` in source.
7. Refactor tests to typed fixtures and remove assertions/`any`.
8. Expand convention guards.
9. Run package + repo quality gates until all pass.

## Regression Guard Additions
Extend `packages/ai/sdk/test/conventions-guard.test.ts` to fail on:
- `S.Literals(`
- `withIdentifier(`
- `@effect/claude-agent-sdk/`
- `JSON.parse(` / `JSON.stringify(`
- `switch (`
- `throw ` and `new Error(`
- `as unknown as`
- `\\bany\\b`
- Missing `S.toTaggedUnion(` in designated discriminator-heavy modules

## Verification Commands
1. `bun run --cwd packages/ai/sdk check`
2. `bun run --cwd packages/ai/sdk lint`
3. `bun run --cwd packages/ai/sdk test`
4. `bun run --cwd packages/ai/sdk docgen`
5. `bunx eslint --config eslint.config.mjs "packages/ai/sdk/src/**/*.{ts,tsx}" --max-warnings=0`
6. `bun run check`
7. `bun run lint`
8. `bun run test`
9. `bun run docgen`

## Acceptance Criteria
- `src/**` has zero matches for:
  - `JSON.parse(`, `JSON.stringify(`
  - `switch (`
  - `throw `, `new Error(`
  - `Math.random(`
  - `as unknown as`
  - `\\bany\\b`
- Exported schema/error/service declarations use canonical `$AiSdkId` + `$I` metadata
- Exported discriminator unions use tagged-union modeling
- No `packages/ai/sdk` allowlist entries
- Package and repo quality gates pass

## Working Notes
- Type-breaking changes are permitted for this pass.
- Preserve wire formats where practical; prioritize type-model correctness.
- No deferred debt bucket for this stream.
