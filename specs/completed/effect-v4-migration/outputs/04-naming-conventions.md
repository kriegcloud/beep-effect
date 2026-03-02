# Naming Conventions - effect-smol

**Analysis Date:** 2026-02-19
**Repository:** `.repos/effect-v4`

## Executive Summary

Effect v4 follows strict, consistent naming conventions that combine PascalCase for types/modules with kebab-case for directory/file organization. The codebase demonstrates a clear separation between public and internal APIs, with specific patterns for test files, benchmarks, and package naming.

---

## 1. File Naming Patterns

### 1.1 Source Files (`.ts`)

**Primary Convention: PascalCase**

All public API source files use PascalCase:

```
Array.ts
Option.ts
Result.ts
Effect.ts
BigDecimal.ts
DateTime.ts
FiberHandle.ts
ConfigProvider.ts
```

**Pattern Rules:**
- Single-word modules: `Array.ts`, `Cache.ts`, `Clock.ts`
- Multi-word modules: Concatenated PascalCase without separators
  - `BigDecimal.ts` (not `Big-Decimal.ts` or `big-decimal.ts`)
  - `FiberHandle.ts` (not `Fiber-Handle.ts`)
  - `ConfigProvider.ts`
  - `ManagedRuntime.ts`

**Acronyms:** Treated as words with initial capital only
- `HKT.ts` (Higher-Kinded Types - exception, all caps)
- `JsonSchema.ts` (not `JSONSchema.ts`)
- `JsonPatch.ts`
- `SchemaAST.ts` (AST is acronym but follows pattern)

### 1.2 Internal Files

**Convention: camelCase**

Internal implementation files use camelCase:

```
/src/internal/
  array.ts
  option.ts
  effect.ts
  dateTime.ts (note: camelCase, not PascalCase)
  doNotation.ts
  hashMap.ts
  hashSet.ts
```

**Special Cases:**
- `core.ts` - Core internal implementations
- `errors.ts` - Common error utilities
- `version.ts` - Version information

### 1.3 Test Files

**Convention: PascalCase + `.test.ts` suffix**

```
Array.test.ts
Option.test.ts
Effect.test.ts
DateTime.test.ts
ConfigProvider.test.ts
```

**Pattern:** Matches source file name exactly, adds `.test.ts`

---

## 2. Directory Naming Patterns

### 2.1 Top-Level Directories

**Convention: kebab-case**

```
packages/
  effect/
  platform-node/
  platform-browser/
  platform-bun/
  platform-node-shared/
  opentelemetry/
```

### 2.2 Package Subdirectories

**Convention: kebab-case for categories**

```
packages/
  ai/
    openai/
    openai-compat/
    openrouter/
    anthropic/

  sql/
    sqlite-node/
    sqlite-bun/
    sqlite-wasm/
    mysql2/
    pg/

  atom/
    react/
    solid/
    vue/
```

---

## 3. Module & Export Naming

### 3.1 Module Exports

**Convention: Namespace exports with PascalCase**

```typescript
// In index.ts
export * as Array from "./Array.ts"
export * as Option from "./Option.ts"
export * as Result from "./Result.ts"
export * as Effect from "./Effect.ts"
```

### 3.2 Type Exports

**Convention: PascalCase for types, interfaces, and classes**

```typescript
export interface ReadonlyArrayTypeLambda
export type NonEmptyReadonlyArray<A>
export type NonEmptyArray<A>

export interface None<out A>
export interface Some<out A>
export type Option<A> = None<A> | Some<A>

export class CronParseError
export class BrandError
```

### 3.3 Function Exports

**Convention: camelCase**

```typescript
export const make = <Elements>(...elements) => ...
export const fromIterable = <A>(collection: Iterable<A>) => ...
export const isArray: { ... }
export const isArrayEmpty = <A>(self: Array<A>) => ...
export const headNonEmpty: <A>(self: NonEmptyReadonlyArray<A>) => A
```

---

## 4. Package Naming Conventions

### 4.1 Public Packages

**Convention: `@effect/<name>` with kebab-case**

```json
"effect"                          // Main package (no scope)
"@effect/opentelemetry"
"@effect/platform-browser"
"@effect/platform-bun"
"@effect/platform-node"
```

### 4.2 Scoped Sub-Packages

**AI Packages:**
```json
"@effect/ai-anthropic"
"@effect/ai-openai"
"@effect/ai-openai-compat"
"@effect/ai-openrouter"
```

**SQL Packages:**
```json
"@effect/sql-pg"
"@effect/sql-mysql2"
"@effect/sql-mssql"
"@effect/sql-sqlite-node"
"@effect/sql-sqlite-bun"
```

**Pattern Rules:**
- Category prefix: `ai-`, `sql-`, `atom-`, `platform-`
- Kebab-case throughout
- Preserve original technology names (e.g., `mysql2`, `pg`)

---

## 5. Type Naming Conventions

### 5.1 Type Parameters

**Convention: Single uppercase letters**

```typescript
<A>          // Generic value type
<E>          // Error type
<R>          // Resource/Requirement/Context type
<In>         // Input type
<Out>        // Output type
<K>          // Key type
<V>          // Value type
```

### 5.2 Type Suffixes

**Interfaces:**
- No suffix for primary types: `Option`, `Result`, `Effect`
- Suffix patterns:
  - `Error` for error types: `NoSuchElementError`, `TimeoutError`
  - `Lambda` for type constructors: `OptionTypeLambda`

---

## 6. Internal vs Public API Naming

### 6.1 Public API

**Location:** `/src/*.ts` (top-level)
**Naming:** PascalCase files, exported as modules
**Access:** Exported from `index.ts`

### 6.2 Internal API

**Location:** `/src/internal/*.ts`
**Naming:** camelCase files
**Access:** Blocked in package.json exports

```json
{
  "exports": {
    "./internal/*": null  // Blocks internal access
  }
}
```

---

## 7. File Extension Usage

### 7.1 TypeScript Source

**Primary:** `.ts`
- All source files: `Array.ts`, `Option.ts`
- All internal files: `array.ts`, `option.ts`
- Test files: `Array.test.ts`

### 7.2 Import Pattern

**Convention:** Always include `.ts` extension

```typescript
import * as Array from "./Array.ts"
import type * as Effect from "./Effect.ts"
import * as core from "./internal/core.ts"
```

---

## Summary Table

| Element | Convention | Examples |
|---------|------------|----------|
| **Public source files** | PascalCase | `Array.ts`, `Option.ts`, `BigDecimal.ts` |
| **Internal files** | camelCase | `array.ts`, `option.ts`, `dateTime.ts` |
| **Test files** | PascalCase + `.test.ts` | `Array.test.ts`, `Option.test.ts` |
| **Directories** | kebab-case | `platform-node/`, `openai-compat/` |
| **Package names** | `@effect/<name>` | `@effect/sql-pg`, `@effect/ai-openai` |
| **Types/Interfaces** | PascalCase | `Option`, `Result`, `NonEmptyArray` |
| **Functions** | camelCase | `makeBy`, `fromIterable`, `isArray` |
| **Type parameters** | Single uppercase | `<A>`, `<E>`, `<R>` |

---

## Key Principles for @beep/repo-cli

1. **Public = PascalCase files**, Internal = camelCase files
2. **Directories = kebab-case**, especially for multi-word names
3. **Package names = @beep/<kebab-case>**
4. **Types/Interfaces = PascalCase**, Functions = camelCase
5. **No separators in PascalCase file names** (BigDecimal, not Big-Decimal)
6. **Always include .ts extension** in imports
7. **Internal APIs blocked** via package.json exports
