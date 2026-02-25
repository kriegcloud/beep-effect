# File-by-File Migration Plan

> Each file listed with its v3 APIs, required changes, and migration phase. Files ordered by dependency (migrate dependencies first).

## Verification Protocol

For EVERY file, after applying changes:
1. Run `bun run check` (typecheck) — fix all errors before moving on
2. Verify imports against `.repos/effect-smol` if unsure about v4 API
3. Search `graphiti-memory` MCP with `effect-v4` group for migration patterns

---

## Phase P0: Scaffold Workspace Package

### Action: Create `tooling/claude-setup/`

1. Copy all source files from `.repos/claude-setup/` to `tooling/claude-setup/`
   - Exclude: `node_modules/`, `dist-types/`, `.hook-state.json`
   - Include: `hooks/`, `scripts/`, `patterns/`, `test/`, `skills/`, `agents/`, `commands/`, `bin/`
2. Create `tooling/claude-setup/package.json` (modeled after `tooling/cli/package.json`):

```json
{
  "name": "@beep/claude-setup",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "effect": "catalog:",
    "@effect/platform-bun": "catalog:",
    "@effect/platform-node": "catalog:",
    "picomatch": "^4.0.3"
  },
  "devDependencies": {
    "@types/picomatch": "^4.0.2",
    "@effect/vitest": "catalog:",
    "typescript": "catalog:"
  }
}
```

**Note:** `@effect/platform-node` needed for `NodeFileSystem.layer`, `NodePath.layer`, `NodeTerminal.layer`, `NodeChildProcessSpawner.layer` — same as `tooling/cli`. The hooks may use `@effect/platform-bun` for `BunRuntime.runMain`. Include both platform packages.

3. Create `tooling/claude-setup/tsconfig.json` extending monorepo base:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./",
    "outDir": "./dist-types",
    "noEmit": true
  },
  "include": [
    "hooks/**/*.ts",
    "scripts/**/*.ts",
    "patterns/**/*.ts",
    "test/**/*.ts"
  ]
}
```

4. Run `bun install` from monorepo root
5. Verify: `bun run check` reports Effect API errors (expected), NOT missing package errors

---

## Phase P1: Schema Migration

Priority: schemas are imported by everything else. Migrate first.

### File: `hooks/schemas/index.ts` (~6,886 LoC)

**Phase:** P1 | **Effort:** MEDIUM

**v3 APIs found:**
- `import * as Schema from "@effect/schema"` or `import * as S from "effect/Schema"`
- `S.Struct`, `S.Literal`, `S.optional`, `S.NullOr`, `S.Record`
- `S.Schema.Type<typeof X>` (type extraction)
- Possibly `S.Data` pipe

**Changes required:**
1. Update import path: `import * as S from "effect/Schema"` (if using `@effect/schema`)
2. Check `S.optionalWith` vs `S.optional` signature — v4 may change optional field handling
3. Check if `S.Data` still exists (likely removed — `Data` integration changed)
4. `S.NullOr` → verify name in v4 (may be `S.NullOr` or `S.nullable`)
5. Type extraction: `S.Schema.Type<typeof X>` → verify still works or use `typeof X.Type`

**Verification:** `bun run check` passes for this file specifically.

---

### File: `patterns/schema.ts` (~50 LoC)

**Phase:** P1 | **Effort:** LOW

**v3 APIs found:**
- `S.Struct`, `S.String`, `S.optional`, `S.optionalWith`, `S.Literal`
- `S.Data` pipe

**Changes required:**
1. Update import path if needed
2. Remove `.pipe(S.Data)` if `S.Data` is removed in v4
3. Verify `S.optionalWith` signature

---

### File: `test/TestClaude.ts` (~159 LoC)

**Phase:** P1 | **Effort:** LOW

**v3 APIs found:**
- Schema types for constructing hook input shapes

**Changes required:**
1. Update import paths
2. Align with any schema changes from `hooks/schemas/index.ts`

---

## Phase P2: Service, Layer & Error Migration

### File: `hooks/agent-init/index.ts` (~998 LoC)

**Phase:** P2 | **Effort:** HIGH

**v3 APIs found:**
- `Context.Tag("AgentConfig")<AgentConfig, Shape>()`
- `Layer.effect(AgentConfig, Effect.gen(function*() { ... }))`
- `Data.TaggedError("MyError")<{ reason: string }>`
- `Effect.gen(function*() { ... })` (extensively)
- `S.decode(X)(input)`
- `Command.make("git", "status")` + `Command.string` + `Command.workingDirectory`
- `BunRuntime.runMain(...)`
- `Effect.all([...], { concurrency: "unbounded" })`
- `pipe(...)` composition

**Changes required:**
1. `Context.Tag` → `ServiceMap.Service` (class syntax, argument order change)
2. `Data.TaggedError` → `S.TaggedErrorClass` — **Reference:** `tooling/cli/src/commands/tsconfig-sync.ts` for exact pattern
3. `Command.make(...)` → `ChildProcess.make\`...\`` (P3 dependency — stub/skip in P2, or migrate together)
4. `BunRuntime.runMain` → keep (still exists in `@effect/platform-bun` v4)
5. `Effect.gen(function*() {})` → keep as-is (still valid in v4), but prefer `Effect.fn` for exported functions — **Reference:** every command handler in `tooling/cli/src/commands/`
6. `S.decode` → verify signature against `.repos/effect-smol` (`S.decodeEffect` or `S.decodeUnknown`)
7. Layer naming: if `.Default` or `.Live` used, rename to `.layer`
8. Remove `dependencies` arrays, use `Layer.provide` instead — **Reference:** `tooling/cli/src/bin.ts` for Layer composition pattern

---

### File: `hooks/subagent-init/index.ts` (~10,934 LoC)

**Phase:** P2 | **Effort:** HIGH (size)

**Same pattern as agent-init.** Likely shares most of the same v3 APIs. Apply identical transformations. The file is large but structurally similar to agent-init — most of the LoC is likely string templates and configuration, not deep Effect usage.

**Strategy:** After migrating agent-init, apply the same diff patterns here mechanically.

---

### File: `hooks/skill-suggester/index.ts` (~16,795 LoC)

**Phase:** P2 | **Effort:** HIGH (size)

**Strategy:** This is the largest file. Before migrating:
1. Read the file to determine how much is actual Effect code vs string templates
2. Likely most LoC is static skill definitions embedded as strings
3. The Effect wrapping is probably thin — similar patterns to agent-init

Apply same transformations as agent-init.

---

## Phase P3: Platform & CLI Migration

### File: `hooks/pattern-detector/core.ts` (~137 LoC)

**Phase:** P3 | **Effort:** MEDIUM

**v3 APIs found:**
- `FileSystem.FileSystem`, `Path.Path` from `@effect/platform`
- `Config.string("CLAUDE_PROJECT_DIR").pipe(Config.withDefault("."))`
- `Effect.gen(function*() { ... })`
- `Option.findFirst()`, `Option.flatten()`, `Option.match()`

**Changes required:**
1. `FileSystem` → `import { FileSystem } from "effect"` (moved to core)
2. `Path` → `import { Path } from "effect"` (moved to core)
3. `Config` → verify still exists in effect v4 or use `ServiceMap.Reference`
4. Option APIs — verify signatures (mostly unchanged)

---

### File: `hooks/pattern-detector/index.ts` (~51 LoC)

**Phase:** P3 | **Effort:** LOW

**v3 APIs found:**
- `Terminal.Terminal` from `@effect/platform`
- `S.decodeUnknown`
- `Array.sort(Order.mapInput(...))`
- `BunRuntime.runMain`

**Changes required:**
1. `Terminal` → `import { Terminal } from "effect"` (moved to core)
2. `S.decodeUnknown` → verify name in v4
3. `BunRuntime.runMain` → keep (still in `@effect/platform-bun`)

---

### File: `scripts/context-crawler.ts` (~431 LoC)

**Phase:** P3 | **Effort:** MEDIUM (CLI API change, but fully covered by tooling/cli reference)

**v3 APIs found:**
- `import { Args, Command, Options } from "@effect/cli"`
- `FileSystem.FileSystem`, `Path.Path` from `@effect/platform`
- `BunContext`, `BunRuntime` from `@effect/platform-bun`
- `Array`, `Console`, `Effect`, `Option`, `pipe`, `String` from `effect`

**Changes required:**
1. **CLI migration** — follow `tooling/cli/` patterns exactly:
   - `Args` → `Argument` (from `effect/unstable/cli`)
   - `Options` → `Flag` (from `effect/unstable/cli`)
   - `Command.make(name, opts)` + `Command.withHandler` → `Command.make(name, config, Effect.fn(function* (config) { ... }))`
   - **Reference:** `tooling/cli/src/commands/create-package/handler.ts` for Argument + Flag + Command.make pattern
   - **Reference:** `tooling/cli/src/commands/root.ts` for Command.withSubcommands
   - **Reference:** `tooling/cli/src/bin.ts` for Command.run + Layer composition
2. `FileSystem`, `Path` → `import { FileSystem, Path } from "effect"` (core)
3. `BunContext`, `BunRuntime` → keep from `@effect/platform-bun`
4. Entry point: follow `tooling/cli/src/bin.ts` pattern for `Command.run(rootCommand, { version }).pipe(Effect.provide(layers))`

---

### File: `scripts/analyze-architecture.ts` (~2,380 LoC)

**Phase:** P3 | **Effort:** MEDIUM

**v3 APIs found:**
- `Effect`, `Graph`, `Option`, `Order`, `Array` from `effect`
- TypeScript AST parsing (not Effect-specific)

**Changes required:**
1. `Graph` → verify still exists in `effect/Graph` in v4
2. Other `effect/*` imports — mostly unchanged
3. TypeScript AST code — no changes needed

---

### File: `scripts/debug-extractor.ts` (~215 LoC)

**Phase:** P3 | **Effort:** LOW

**v3 APIs found:**
- `Effect`, `Console`, `pipe` from `effect`

**Changes required:**
1. Minimal — core APIs are stable

---

### All Command.make calls across hooks

**Phase:** P3

Every `Command.make("cmd", "arg1", "arg2")` + `Command.string` + `Command.workingDirectory` pattern needs to become:

```ts
import { ChildProcess } from "effect/unstable/process"

const handle = yield* ChildProcess.make({ cwd: dir })`cmd arg1 arg2`
const output = yield* Stream.runCollect(handle.stdout)
// or use a helper to collect stdout as string
```

**IMPORTANT:** Before converting, check if there's a convenience helper in `ChildProcess` for getting string output. Read:
- `.repos/effect-smol/packages/effect/src/unstable/process/ChildProcess.ts`

---

## Phase P4: Test Migration & Verification

### File: `test/pattern-test-harness.ts` (~166 LoC)

**Phase:** P4 | **Effort:** LOW

**v3 APIs found:**
- `Effect.runPromise()` in `beforeAll`
- Pattern loading via `loadPatterns()` (depends on core.ts)

**Changes required:**
1. `Effect.runPromise` → verify still exists (likely unchanged)
2. `@effect/vitest` integration — verify v4 test helpers

---

### Files: 49 pattern `*.test.ts` files (~630 LoC total)

**Phase:** P4 | **Effort:** LOW (bulk)

**v3 APIs found:**
- Import from test harness
- Standard vitest assertions

**Changes required:**
1. Minimal — most changes flow from harness updates
2. If Schema types changed in schemas/index.ts, update test data shapes

---

### Final Verification Checklist

After all phases complete:

- [ ] `bun run check` passes from monorepo root
- [ ] `bunx vitest run` passes in `tooling/claude-setup/`
- [ ] `grep -r "@effect/schema" tooling/claude-setup/` returns nothing
- [ ] `grep -r "@effect/cli" tooling/claude-setup/` returns nothing
- [ ] `grep -r "@effect/platform\"" tooling/claude-setup/` returns nothing (note: `@effect/platform-bun` is OK)
- [ ] `grep -r "Context.Tag\|Context.GenericTag\|Effect.Tag\|Effect.Service" tooling/claude-setup/` returns nothing
- [ ] `grep -r "Data.TaggedError" tooling/claude-setup/` returns nothing
- [ ] `grep -r "\.Default\b" tooling/claude-setup/` returns nothing (layer convention)
- [ ] Smoke test: `echo '{}' | bun run tooling/claude-setup/hooks/pattern-detector/index.ts` doesn't crash
- [ ] `.repos/claude-setup/` left untouched (read-only reference)
