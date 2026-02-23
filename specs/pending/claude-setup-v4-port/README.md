# Port claude-setup to Effect v4 Workspace Package

> Copy `.repos/claude-setup` into the monorepo as `tooling/claude-setup` (`@beep/claude-setup`), migrate all Effect v3 code to v4, and share dependencies via the root catalog.

## Quick Navigation

- [Migration Reference](./migration-reference.md) — Complete v3→v4 API mapping for this codebase
- [File-by-File Migration Plan](./file-migration-plan.md) — Per-file changes with priority and effort

## Primary Reference: `tooling/cli/` (Working v4 CLI)

**`tooling/cli/` is the canonical v4 reference for this migration.** It is a production workspace package already using every v4 API this migration needs. Agents MUST consult it before guessing at any v4 pattern.

| Pattern Needed | Reference File in `tooling/cli/` |
|---------------|----------------------------------|
| `Command.make` + `Flag` + `Argument` | `src/commands/create-package/handler.ts` |
| `Command.withSubcommands` | `src/commands/root.ts` |
| `Command.run` + Layer composition | `src/bin.ts` |
| `Command.runWith` (testing) | `test/topo-sort.test.ts` |
| `Flag.boolean` / `Flag.string` / `Flag.optional` / `Flag.withDefault` | `src/commands/tsconfig-sync.ts`, `src/commands/version-sync/index.ts` |
| `Schema.TaggedErrorClass` with annotations | `src/commands/tsconfig-sync.ts` (TsconfigSyncDriftError) |
| `Effect.fn(function* { ... })` | Every command handler |
| `FileSystem` + `Path` from core `effect` | `src/commands/codegen.ts` |
| `NodeFileSystem.layer` + `NodePath.layer` + `NodeTerminal.layer` | `src/bin.ts` |
| `Effect.catchTag` chaining | `src/commands/tsconfig-sync.ts` |
| `@effect/vitest` `it.effect` | `test/*.test.ts` |

## Purpose

**Problem:** `.repos/claude-setup` is a git subtree with its own `node_modules`, pinned to Effect v3.19.9. It duplicates 15+ Effect packages already in the monorepo's v4 catalog. Changes to the hook system require working outside the monorepo's tooling, CI, and type-checking.

**Solution:** Copy the source into `tooling/claude-setup/` as a first-class workspace package, migrate all v3 APIs to v4, and use `catalog:` references for shared dependencies. The `.repos/claude-setup` subtree becomes a read-only reference.

## Success Criteria

- [ ] `tooling/claude-setup/` exists as workspace package `@beep/claude-setup`
- [ ] All Effect dependencies use `catalog:` — no local version pins
- [ ] `@effect/schema` imports replaced with `effect/Schema`
- [ ] `@effect/cli` imports replaced with `effect/unstable/cli`
- [ ] `@effect/platform` imports replaced with core `effect` or `effect/unstable/process`
- [ ] All `Context.Tag` → `ServiceMap.Service`
- [ ] All `Data.TaggedError` → `Schema.TaggedErrorClass`
- [ ] All `Command.make(...)` → `ChildProcess.make\`...\``
- [ ] `bun run check` passes from monorepo root (typecheck)
- [ ] `bunx vitest run` passes in `tooling/claude-setup/`
- [ ] All 4 hooks execute without runtime errors

## Scope Inventory

| Module | LoC | v3 APIs Used | Migration Effort |
|--------|-----|-------------|-----------------|
| hooks/agent-init/index.ts | ~998 | Context.Tag, Layer, Data.TaggedError, Schema, Command, BunRuntime | HIGH |
| hooks/pattern-detector/index.ts | ~51 | Schema, Terminal, BunRuntime | LOW |
| hooks/pattern-detector/core.ts | ~137 | Effect.gen, Config, FileSystem, Path, Schema | MEDIUM |
| hooks/skill-suggester/index.ts | ~16,795 | Effect, Schema, Terminal, Command, FileSystem | HIGH (size) |
| hooks/subagent-init/index.ts | ~10,934 | Context.Tag, Layer, Schema, Command, BunRuntime | HIGH (size) |
| hooks/schemas/index.ts | ~6,886 | Schema (extensive) | MEDIUM |
| scripts/context-crawler.ts | ~431 | @effect/cli (Args, Command, Options), FileSystem, Path | HIGH (CLI rewrite) |
| scripts/analyze-architecture.ts | ~2,380 | Effect, Graph, Option, TypeScript AST | MEDIUM |
| scripts/debug-extractor.ts | ~215 | Effect, Console | LOW |
| patterns/schema.ts | ~50 | Schema | LOW |
| test/TestClaude.ts | ~159 | Schema | LOW |
| test/pattern-test-harness.ts | ~166 | Effect, Vitest | LOW |
| 49 pattern .test.ts files | ~630 | Effect, Schema, Vitest | LOW (bulk) |

**Total: ~40K LoC, ~15 source files + 49 test files**

## Architecture Decision Records

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-001 | Place in `tooling/claude-setup/` not `packages/` | Hooks/scripts are dev tooling, not shipped library code. `tooling/*` is in workspace globs. |
| AD-002 | Copy files, don't symlink | Git subtree stays as read-only reference in `.repos/`. Working copy gets full monorepo integration. |
| AD-003 | Keep `@effect/platform-bun` for BunRuntime | BunRuntime.runMain and BunFileSystem remain in platform-bun in v4. Core `effect` has FileSystem interface but not Bun impl. |
| AD-004 | Replace @effect/cli with effect/unstable/cli | CLI module merged into core in v4 as unstable. API changed: `Args`→`Argument`, `Options`→`Flag`. |
| AD-005 | Replace Command/CommandExecutor with ChildProcess | `@effect/platform` Command API → `effect/unstable/process/ChildProcess` template tag API. |
| AD-006 | Use @beep/identity for service keys | Existing codebase uses plain strings. New code should use IdentityComposer per AGENTS.md. |

## Package Changes: v3 → v4

| v3 Package | v4 Replacement | Notes |
|------------|---------------|-------|
| `effect@^3.19.9` | `effect@catalog:` (^4.0.0-beta.11) | Core — already in catalog |
| `@effect/schema@^0.75.5` | REMOVE — merged into `effect/Schema` | No separate package |
| `@effect/cli@^0.72.1` | REMOVE — merged into `effect/unstable/cli` | `Args`→`Argument`, `Options`→`Flag` |
| `@effect/platform@^0.93.7` | REMOVE — split into core + unstable | `FileSystem`/`Terminal` → core `effect`; `Command` → `effect/unstable/process` |
| `@effect/platform-bun@^0.86.0` | `@effect/platform-bun@catalog:` | Keep for BunRuntime, BunFileSystem |
| `@effect/platform-node@^0.103.0` | `@effect/platform-node@catalog:` | Keep if needed for NodeServices |
| `@effect/platform-browser@^0.73.0` | REMOVE | Not used in hook/script code |
| `@effect/typeclass@^0.38.0` | REMOVE — merged into core `effect` | Monoid, Semigroup now in core |
| `@effect/cluster@^0.52.8` | REMOVE | Not used in source code |
| `@effect/vitest@^0.27.0` | `@effect/vitest@catalog:` | Keep for test integration |
| `@effect-atom/atom@^0.4.10` | REMOVE | Not used in hook/script code |
| `@effect-atom/atom-react@^0.4.4` | REMOVE | Not used in hook/script code |
| `msgpackr@^1.11.5` | Keep or remove | Check if used |
| `picomatch@^4.0.3` | Keep | Used for glob matching in patterns |

## Phase Breakdown

| Phase | Focus | Outputs | Effort |
|-------|-------|---------|--------|
| P0 | Scaffold workspace package | package.json, tsconfig.json, file copy | S |
| P1 | Schema migration | All `@effect/schema` → `effect/Schema`, Schema API changes | M |
| P2 | Service & Layer migration | Context.Tag → ServiceMap.Service, Layer patterns, Error types | L |
| P3 | Platform & CLI migration | Command → ChildProcess, @effect/cli → unstable/cli, FileSystem/Terminal imports | L |
| P4 | Test migration & verification | Fix all tests, verify hooks run, verify typecheck | M |

## Phase Exit Criteria

| Phase | Done When |
|-------|-----------|
| P0 | `tooling/claude-setup/` exists, `bun install` resolves all deps, `bun run check` reports only Effect API errors (not missing packages) |
| P1 | Zero `@effect/schema` imports remain; all `Schema.*` calls use v4 signatures; typecheck passes for schema files |
| P2 | Zero `Context.Tag`, `Effect.Service`, `Data.TaggedError` imports; all services use `ServiceMap.Service`; typecheck passes for hook files |
| P3 | Zero `@effect/platform` or `@effect/cli` imports; all command execution uses ChildProcess; CLI scripts use `effect/unstable/cli`; typecheck passes for all files |
| P4 | `bunx vitest run` passes; all 4 hooks execute without error via `bun run tooling/claude-setup/hooks/*/index.ts` |

## Complexity Assessment

```
Phases:       4  ×2 = 8
Agents:       1  ×3 = 3   (single code-writer, orchestrator verifies)
CrossPkg:     1  ×0.5= 0.5 (may need @beep/identity integration)
ExtDeps:      0  ×3 = 0
Uncertainty:  1  ×5 = 5   (Schema v4 edge cases only — CLI API covered by tooling/cli reference)
Research:     0.5×2 = 1   (tooling/cli covers most patterns; .repos/effect-smol for gaps)
LoC:          40K×0.5= 5  (large codebase but mechanical migration)
                     ----
Total:              22.5  → Medium-Low complexity
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `effect/unstable/cli` API significantly different from @effect/cli | LOW — mitigated | Medium | `tooling/cli/` already uses the v4 CLI API extensively. Copy patterns directly: `Command.make(name, config, handler)`, `Flag.boolean/string`, `Argument.string`. See `tooling/cli/src/commands/` for every pattern. |
| ChildProcess template tag doesn't support all Command patterns | Medium | Medium | Fall back to raw Bun.spawn if template tags are too limited for complex commands. |
| Schema v4 has subtle decode/encode signature changes | High | Medium | Run typecheck early and often. Schema changes are usually compiler-caught. |
| skill-suggester (16K LoC) has deeply nested v3 patterns | Low | High | It's likely mostly static text/config with thin Effect wrapping. Verify structure before estimating. |
| Hook integration testing requires Claude Code session | Medium | Low | Test hooks in isolation with mock stdin/env. Real integration test is a manual step. |

## Agent Instructions

### Source of Truth (ordered by priority)

Agents and orchestrators MUST use these verification sources for ALL Effect v4 API questions:

1. **`tooling/cli/`** — A working v4 workspace package in THIS repo. It uses `effect/unstable/cli` (Command, Flag, Argument), `Effect.fn`, `Schema.TaggedErrorClass`, `FileSystem`/`Path` from core `effect`, `@effect/platform-node` layers, and `@effect/vitest`. **Check here FIRST for any pattern question — it has working, tested examples of every v4 API this migration needs.**
2. **`.repos/effect-smol`** — The Effect v4 reference implementation. Grep/read source files to verify function signatures, module paths, and type parameters.
3. **`graphiti-memory` MCP tool** — Search the `effect-v4` knowledge graph for API patterns and migration examples.
4. **`.repos/effect-smol/migration/`** — The official v3→v4 migration guides covering services, cause, error-handling, forking, yieldable, generators, scope, equality, runtime, fiberref, layer-memoization.

NEVER rely on training data for Effect v4 APIs. The v3→v4 changes are extensive and training data is overwhelmingly v3.

### Workflow Per File

For each source file being migrated:

1. Read the file to identify all v3 imports and APIs
2. Look up each v3 API in the migration reference (below) or verify against `.repos/effect-smol`
3. Apply changes mechanically — most are import path changes and API renames
4. Run `bun run check` after each file to catch type errors early
5. For non-obvious changes (Schema decode signatures, CLI API), verify against `.repos/effect-smol` source

### What NOT to Do

- Do NOT refactor or "improve" code beyond what the v3→v4 migration requires
- Do NOT add @beep/identity to existing service keys in this phase (note it for follow-up)
- Do NOT rewrite the CLI scripts from scratch — migrate the existing API calls
- Do NOT change test logic — only change Effect API calls within tests
