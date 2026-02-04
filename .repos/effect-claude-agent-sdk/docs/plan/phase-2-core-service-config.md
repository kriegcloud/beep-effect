# Phase 2 - Core Service and Config Layer

Status: Source Dive Updated (Effect + Platform)

## Objectives
- Introduce `AgentSdk` as a `Context.Tag` service with Effect-based methods.
- Implement `AgentSdkConfig` using `Schema.Config` and a `Layer`.
- Establish a Bun-first runtime baseline and config defaults.
- Define service/layer conventions and config-provider wiring used by later phases.

## Scope
- Service interface with `query`, `createSdkMcpServer`, and tool helper entry points.
- Config layer for `Options`-aligned settings and runtime defaults.
- Error mapping from SDK to Effect errors.
- ConfigProvider strategy for env/test overrides.

## SDK Surface Covered
- `query()` entry point
- `createSdkMcpServer()` helper
- `tool()` helper (internally wrapped, public API uses `Tool.fromSchema`)

## Effect Modules to Apply
- `Context.Tag` for services
- `Layer.effect` for config and service construction
- `Layer.scoped` for services with lifecycle-managed resources
- `Schema.Config` for validation and defaults
- `Effect.fn` for method definitions
- `Effect.acquireUseRelease` for scoped acquisition of SDK resources
- `Layer.setConfigProvider` for test and environment overrides

## Effect Source Review Targets (Refine After Source Dive)
- `.reference/effect/packages/effect/src/Context.ts`
- `.reference/effect/packages/effect/src/Layer.ts`
- `.reference/effect/packages/effect/src/Config.ts`
- `.reference/effect/packages/effect/src/ConfigProvider.ts`
- `.reference/effect/packages/effect/src/Effect.ts`

## Platform Source Review Targets
- `.reference/effect/packages/platform/src/CommandExecutor.ts`
- `.reference/effect/packages/platform/src/FileSystem.ts`
- `.reference/effect/packages/platform-bun/src/BunCommandExecutor.ts`
- `.reference/effect/packages/platform-bun/src/BunFileSystem.ts`
- `.reference/effect/packages/platform-bun/src/BunContext.ts`
- `.reference/effect/packages/platform-node-shared/src/internal/commandExecutor.ts`

## Source Dive Findings (Phase 2 Refinements)
- `Context.Tag` is the stable service-tag API; use `Context.Tag("...")<Self, Shape>()` for `AgentSdk` and config services.
- `Effect.Service` exists (bundles Tag + Layer + accessors) but is marked `@experimental`; avoid for core APIs unless we explicitly opt in.
- `Layer.effect` constructs a layer from an Effect; `Layer.scoped` is the preferred constructor when the Effect uses `Scope` or acquires resources.
- `Layer.setConfigProvider` installs a provider globally for a scope; use for tests or custom config sources.
- `Schema.Config` reads a string via `Config.string` and decodes using `ParseResult.decodeUnknownEither`; encoded type must be `string`.
- `ConfigProvider.fromEnv` defaults to `pathDelim: "_"` and `seqDelim: ","`, and can be wrapped with `ConfigProvider.nested`.
- `CommandExecutor.start` returns a scoped `Process` with `stdin` sink and `stdout`/`stderr` streams; `BunCommandExecutor.layer` delegates to NodeCommandExecutor and requires `FileSystem`.
- NodeCommandExecutor validates `cwd` and ensures process cleanup on scope exit (kills process group and waits for exit).

## API Conventions (Phase 2 Output)
- `AgentSdk` is a `Context.Tag` service with an exported `layer` (and optional `testLayer`).
- `AgentSdkConfig` is a `Context.Tag` service with a `layer` built from `Schema.Config` values.
- Prefer `Layer.scoped` when the service holds resources or spawns processes.
- Expose `AgentSdk.layerDefault` and `AgentSdk.layerDefaultFromEnv(prefix)` as the primary wiring helpers.

## Config Strategy
- Use `Schema.Config(name, schema)` only when the schema's encoded type is `string` (e.g., `Schema.NumberFromString`, `Schema.BooleanFromString`, `Schema.split(",")`).
- Use `Config.*` primitives (`Config.boolean`, `Config.integer`, `Config.duration`, `Config.array`) for non-string encodings.
- Provide `AgentSdkConfig.layerFromEnv(prefix)` that composes `Layer.setConfigProvider` into `AgentSdkConfig.layer`.
- Default `settingSources` to `[]` (no settings); provide an opt-in helper for `["project", "local"]`.

## Deliverables
- `src/AgentSdk.ts` (service + layer)
- `src/AgentSdkConfig.ts` (schema + layer)
- `src/internal/options.ts` (Options conversion and defaults)
- `src/internal/config.ts` (ConfigProvider helpers and defaults)

## Exit Criteria
- `query` runs for a basic prompt with config provided via layer.
- Bun-first defaults in place with explicit override points.
- Errors are surfaced as typed Effect errors.
- Config provider overrides work for tests and non-env sources.

## Risks and Open Questions
- Determine how far to normalize SDK Options vs pass-through.
- Decide whether to offer `Effect.Service`-based service classes as optional sugar.
- `spawnClaudeCodeProcess` requires Node `Readable`/`Writable`; keep SDK default spawn and defer any `CommandExecutor` bridge.
