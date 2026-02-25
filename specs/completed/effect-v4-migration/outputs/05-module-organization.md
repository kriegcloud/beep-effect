# Module Organization and Export Patterns - effect-smol

**Analysis Date:** 2026-02-18
**Repository:** `.repos/effect-smol`

## Overview

The effect-smol repository contains **45 index.ts files** across **899 TypeScript files** in the packages directory. The codebase demonstrates a highly consistent, scalable module organization strategy that emphasizes:

1. **Namespace-based exports** (no tree-shaking optimization)
2. **Flat module hierarchies** with explicit subpath exports
3. **Internal module isolation** via package.json exports blocking
4. **Auto-generated barrel files** with codegen tooling

---

## Core Organization Patterns

### 1. Package Structure Pattern

**Consistent across all packages:**

```
packages/
├── effect/                    # Core library (126 top-level modules)
├── platform-node/             # Platform-specific (Node.js)
├── platform-browser/          # Platform-specific (Browser)
├── platform-bun/             # Platform-specific (Bun)
├── sql/
│   ├── pg/                   # Database adapters
│   ├── mysql2/
│   └── sqlite-node/
├── ai/
│   ├── openai/               # AI provider implementations
│   ├── anthropic/
│   └── openrouter/
└── vitest/                   # Testing utilities
```

**Key characteristics:**
- Each package is independent with its own package.json
- Minimal inter-package dependencies (workspace protocol)
- Platform/runtime-specific packages are separate

---

## Module Organization Strategies

### 2. One-File-Per-Module Pattern

**Primary pattern used throughout Effect v4:**

```typescript
// packages/effect/src/Array.ts
export const map = ...
export const filter = ...
export type NonEmptyArray<A> = ...
```

**Consumed as:**
```typescript
import * as A from "effect/Array"

A.map(xs, f)  // Namespace-based access
```

**Benefits:**
- Clear module boundaries
- Easy to locate functionality
- Prevents naming collisions
- No tree-shaking (deliberate design choice)

**126 top-level modules** in effect package follow this pattern:
- `Array.ts`, `Option.ts`, `Result.ts`, `Effect.ts`
- `Cache.ts`, `Chunk.ts`, `Stream.ts`, `Channel.ts`
- `Schema.ts`, `Logger.ts`, `Layer.ts`, etc.

---

### 3. Barrel File Pattern with Auto-Generation

**All index.ts files contain:**

```typescript
/**
 * @since 4.0.0
 */

// @barrel: Auto-generated exports. Do not edit manually.

/**
 * Module documentation...
 * @since 4.0.0
 */
export * as ModuleName from "./ModuleName.ts"

/**
 * Another module...
 * @since 4.0.0
 */
export * as AnotherModule from "./AnotherModule.ts"
```

**Codegen system:**
- Script: `effect-utils codegen`
- Marker: `// @barrel: Auto-generated exports. Do not edit manually.`
- Found in **20+ packages**

**Pattern consistency:**
- Every module re-exported as namespace (`export * as X`)
- Documentation comment before each export
- `@since` version tags on all exports

---

### 4. Subpath Export Strategy

**Package.json exports field pattern:**

```json
{
  "exports": {
    "./package.json": "./package.json",
    ".": "./src/index.ts",
    "./encoding": "./src/encoding/index.ts",
    "./testing": "./src/testing/index.ts",
    "./unstable/ai": "./src/unstable/ai/index.ts",
    "./unstable/http": "./src/unstable/http/index.ts",
    "./*": "./src/*.ts",
    "./internal/*": null,
    "./*/index": null
  }
}
```

**Key features:**

1. **Main export** (`.`): Points to `src/index.ts` barrel file
2. **Named subpaths**: Explicit entries for feature namespaces
   - `./encoding` - encoding utilities (Base64, Hex)
   - `./testing` - test utilities (TestClock, TestConsole)
   - `./unstable/*` - unstable/experimental APIs
3. **Wildcard direct access** (`./*`): Enables direct module imports
4. **Internal blocking** (`./internal/*": null`): Prevents internal imports
5. **Index blocking** (`./*/index": null`): Prevents index.ts imports

**PublishConfig transformation:**
```json
{
  "publishConfig": {
    "exports": {
      ".": "./dist/index.ts",
      "./*": "./dist/*.js",
      "./internal/*": null
    }
  }
}
```

Source paths (`./src/`) become dist paths (`./dist/`) in published version.

---

### 5. Unstable API Organization

**Separate namespace hierarchy:**

```
src/unstable/
├── ai/
│   ├── index.ts (15 modules)
│   ├── LanguageModel.ts
│   ├── Chat.ts
│   ├── Tool.ts
│   └── internal/
├── http/
│   ├── index.ts (26 modules)
│   ├── HttpClient.ts
│   ├── HttpServer.ts
│   └── HttpRouter.ts
├── cli/
│   ├── index.ts (9 modules)
│   ├── Command.ts
│   ├── Argument.ts
│   └── internal/
└── [17 more namespaces]
```

**Access pattern:**
```typescript
import { LanguageModel, Chat } from "effect/unstable/ai"
import { HttpClient } from "effect/unstable/http"
```

**Characteristics:**
- Each unstable namespace has own index.ts barrel
- Clear deprecation/promotion path (unstable → stable)
- Isolated from stable API surface
- Can have own internal directories

---

### 6. Internal Module Pattern

**Three-tier architecture:**

```
src/
├── Option.ts              # Public API
├── internal/
│   ├── option.ts          # Core implementation
│   ├── core.ts            # Shared primitives
│   └── effect.ts          # Effect internals
```

**Internal module characteristics:**
- Lowercase filenames (option.ts vs Option.ts)
- Implements core data structures and primitives
- Not exported in package.json (`"./internal/*": null`)
- Used by public modules via relative imports

**Example from Option.ts:**
```typescript
import * as option from "./internal/option.ts"

export const none = <A = never>(): Option<A> => option.none
export const some: <A>(value: A) => Option<A> = option.some
```

**Example from internal/option.ts:**
```typescript
/** @internal */
export const none: Option.Option<never> = Object.create(NoneProto)

/** @internal */
export const some = <A>(value: A): Option.Option<A> => {
  const a = Object.create(SomeProto)
  a.value = value
  return a
}
```

---

### 7. Platform-Specific Packages

**Minimal surface area pattern:**

```typescript
// @effect/platform-node/src/index.ts
export * as NodeHttpServer from "./NodeHttpServer.ts"
export * as NodeHttpClient from "./NodeHttpClient.ts"
export * as NodeFileSystem from "./NodeFileSystem.ts"
export * as NodeWorker from "./NodeWorker.ts"
// ... 20-30 modules total
```

**Package structure:**
- `@effect/platform-node` (Node.js implementations)
- `@effect/platform-browser` (Browser implementations)
- `@effect/platform-bun` (Bun runtime implementations)

**No shared platform abstraction in v4** - each platform package is standalone.

---

### 8. SQL Adapter Pattern

**Consistent across 11 database adapters:**

```
sql/
├── pg/
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── PgClient.ts
│       └── PgMigrator.ts
├── mysql2/
├── mssql/
└── sqlite-node/
```

**Simple barrel exports:**
```typescript
export * as PgClient from "./PgClient.ts"
export * as PgMigrator from "./PgMigrator.ts"
```

**Published as separate packages:**
- `@effect/sql-pg`
- `@effect/sql-mysql2`
- `@effect/sql-mssql`
- etc.

---

### 9. AI Provider Pattern

**Consistent across AI integrations:**

```
ai/
├── openai/
│   └── src/
│       ├── index.ts
│       ├── OpenAiClient.ts
│       ├── OpenAiLanguageModel.ts
│       ├── OpenAiConfig.ts
│       ├── OpenAiError.ts
│       ├── OpenAiTool.ts
│       ├── Generated.ts (1.4MB - API types)
│       └── internal/
├── anthropic/
└── openrouter/
```

**Barrel file structure:**
```typescript
export * as Generated from "./Generated.ts"
export * as OpenAiClient from "./OpenAiClient.ts"
export * as OpenAiLanguageModel from "./OpenAiLanguageModel.ts"
export * as OpenAiConfig from "./OpenAiConfig.ts"
export * as OpenAiError from "./OpenAiError.ts"
export * as OpenAiTelemetry from "./OpenAiTelemetry.ts"
export * as OpenAiTool from "./OpenAiTool.ts"
```

---

### 10. Testing Package Pattern

**Different from other packages:**

```typescript
// @effect/vitest/src/index.ts
export * from "vitest"  // Re-export base library

export const effect: Vitest.Tester = ...
export const live: Vitest.Tester = ...
export const layer: LayerMethod = ...
export const it: Vitest.Methods = Object.assign(V.it, methods)
```

**Augments external library rather than providing namespace exports.**

---

## Public vs Internal Separation

### 11. Export Blocking Strategy

**Package.json prevents internal access:**

```json
{
  "exports": {
    "./internal/*": null,
    "./unstable/cli/internal/*": null,
    "./unstable/cluster/internal/*": null,
    "./*/index": null
  }
}
```

**Rationale:**
- `internal/*` - Implementation details, not public API
- `*/index` - Force users to use namespace imports
- Per-namespace internal blocking for large features

**Internal directory structure:**
```
internal/
├── option.ts           # Core data structure implementation
├── result.ts           # Core Result implementation
├── effect.ts           # Effect runtime internals
├── core.ts             # Shared primitives
├── doNotation.ts       # Generator helpers
└── schema/             # Schema AST internals
```

---

## Module Splitting Strategies

### 12. Feature-Based Splitting

**Effect package has 126 top-level modules:**
- Each data structure = one module (Array, Option, Result, etc.)
- Each effect system component = one module (Layer, Scope, Runtime)
- Each utility area = one module (Logger, Metric, Tracer)

**No arbitrary size limits** - modules range from:
- Small: `Symbol.ts` (475 bytes)
- Medium: `Option.ts` (~74KB)
- Large: `Effect.ts` (~432KB), `Schema.ts` (~254KB)

### 13. Namespace-Based Splitting

**Unstable APIs organized by domain:**

```
unstable/
├── ai/           # AI/LLM functionality (15 modules)
├── http/         # HTTP client/server (26 modules)
├── httpapi/      # HTTP API framework (internal)
├── cli/          # CLI framework (9 modules)
├── cluster/      # Distributed systems
├── rpc/          # Remote procedure calls
├── sql/          # SQL DSL
├── socket/       # WebSocket/TCP
├── workflow/     # Durable workflows
└── workers/      # Web Workers
```

Each namespace is self-contained with its own barrel file.

---

## Documentation Patterns

### 14. Module-Level Documentation

**Every module file starts with extensive JSDoc:**

```typescript
/**
 * Brief description of the module.
 *
 * ## Mental model
 * - Key concept 1
 * - Key concept 2
 *
 * ## Common tasks
 * - Task → {@link function}
 * - Task → {@link function}
 *
 * ## Gotchas
 * - Important caveat
 *
 * ## Quickstart
 * ```ts
 * // Example code
 * ```
 *
 * @since 4.0.0
 */
```

**Consistent sections:**
1. Mental model - How to think about the abstraction
2. Common tasks - What you can do and which APIs to use
3. Gotchas - Edge cases and pitfalls
4. Quickstart - Working examples
5. @since tags - Version tracking

---

## Key Insights

### Design Philosophy

1. **Namespace over tree-shaking** - Deliberate choice for API stability
2. **Explicit over implicit** - All exports are explicit in barrel files
3. **Isolation over sharing** - Internal modules are truly internal
4. **Consistency over optimization** - Same patterns everywhere
5. **Documentation over discovery** - Every export is documented

### Scalability Strategy

1. **Flat hierarchies** - Rarely more than 2 levels deep
2. **Clear boundaries** - One concern per module
3. **Codegen for maintenance** - Auto-generated barrel files
4. **Version marking** - @since tags on everything
5. **Stability tiers** - Stable vs unstable namespaces

### Migration Path (Effect 3 → 4)

The organization supports smooth migrations:
- Old name → New name mappings clear
- Unstable APIs isolated for experimentation
- Public API surface explicitly controlled
- Internal changes don't affect users

---

## Summary Table

| Pattern | Usage | Example |
|---------|-------|---------|
| One-file-per-module | Core library | `Array.ts`, `Option.ts` |
| Barrel files (auto-generated) | All packages | `index.ts` with `@barrel` marker |
| Namespace exports | Public API | `export * as Array` |
| Subpath exports | Feature areas | `effect/encoding`, `effect/testing` |
| Unstable namespace | Experimental APIs | `effect/unstable/ai` |
| Internal directory | Implementation | `internal/option.ts` |
| Export blocking | API control | `"./internal/*": null` |
| Platform packages | Runtime-specific | `@effect/platform-node` |
| Adapter packages | Database/AI | `@effect/sql-pg`, `@effect/ai-openai` |

---

## Recommended Patterns for @beep/repo-cli

Based on this analysis:

1. **Use namespace exports** - Follow `export * as Module` pattern in barrel files
2. **One module per file** - Keep public modules in flat structure
3. **Separate internal/** - Implementation details go in internal directory
4. **Block internal exports** - Use package.json exports to prevent access
5. **Auto-generate barrels** - Consider codegen tooling for consistency
6. **Document extensively** - Mental model + Common tasks + Gotchas
7. **Version everything** - @since tags on all public exports
8. **Separate unstable** - Use namespace for experimental features

---

This comprehensive analysis reveals a highly disciplined, consistent module organization strategy optimized for long-term API stability, clear documentation, and developer ergonomics over bundle size optimization.
