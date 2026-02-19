# Documentation Patterns - effect-smol

**Analysis Date:** 2026-02-19
**Repository:** `.repos/effect-smol`

## Executive Summary

The effect-smol repository follows comprehensive documentation standards with:
- **Extensive JSDoc** on all public exports (Mental model + Common tasks + Gotchas + Quickstart)
- **README.md** in every package (Requirements + Installation + Overview + Links)
- **@since tags** on all exports for version tracking
- **Generated API docs** via @effect/docgen
- **Special documentation** for complex features (SCHEMA.md, HTTPAPI.md, MCP.md)

---

## README.md Pattern

### Structure (Standard Package)

```markdown
# `<package-name>`

<Brief description of the package>

## Requirements

- **TypeScript X.X or Newer:**
  <Requirements>

- **Strict Type-Checking:**
  <Type checking requirements>

## Installation

<Installation instructions>

## Documentation

- **Website:**
  <Link to website>

- **API Reference:**
  <Link to generated API docs>

## Overview

<Brief overview of modules/features>

[Optional: Module table or feature list]

## License

MIT
```

### Example: Core Package README

```markdown
# `effect` Core Package

The `effect` package is the heart of the Effect framework, providing robust primitives for managing side effects, ensuring type safety, and supporting concurrency in your TypeScript applications.

## Requirements

- **TypeScript 5.4 or Newer:**
  Ensure you are using a compatible TypeScript version.

- **Strict Type-Checking:**
  The `strict` flag must be enabled in your `tsconfig.json`.

## Installation

```bash
npm install effect
```

## Documentation

- **Website:** https://www.effect.website/
- **API Reference:** https://effect-ts.github.io/effect/

## Overview of Effect Modules

| Module   | Description                    |
| -------- | ------------------------------ |
| Effect   | Core abstraction for effects   |
| Context  | Dependency injection           |
| Layer    | Resource management            |
...
```

### Example: Simple Package README

```markdown
# `@effect/sql-pg`

An `@effect/sql` implementation using the `postgres.js` library.

## Documentation

- **API Reference**: https://effect-ts.github.io/effect/docs/sql-pg
```

**Pattern:**
- Core packages: Comprehensive README
- Adapter packages: Minimal README (link to docs)

---

## JSDoc Pattern

### Module-Level Documentation

**Every module file starts with extensive JSDoc:**

```typescript
/**
 * <One-line description of the module>
 *
 * ## Mental model
 *
 * - Key concept 1
 * - Key concept 2
 * - Key concept 3
 *
 * ## Common tasks
 *
 * - **Task category**: {@link function1}, {@link function2}
 * - **Another category**: {@link function3}, {@link function4}
 *
 * ## Gotchas
 *
 * - Important caveat 1
 * - Important caveat 2
 *
 * ## Quickstart
 *
 * **Example** (Description)
 *
 * ```ts
 * import { Module } from "effect"
 *
 * // Working example code
 * const result = Module.function(...)
 * console.log(result)
 * ```
 *
 * @see {@link function1} — brief description
 * @see {@link function2} — brief description
 * @since X.0.0
 */
```

### Example: Array Module Documentation

```typescript
/**
 * Utilities for working with immutable arrays (and non-empty arrays) in a
 * functional style. All functions treat arrays as immutable — they return new
 * arrays rather than mutating the input.
 *
 * ## Mental model
 *
 * - **`Array<A>`** is a standard JS array. All functions in this module return
 *   new arrays; the input is never mutated.
 * - **`NonEmptyReadonlyArray<A>`** is a readonly array guaranteed to have at
 *   least one element.
 * - Most functions are **dual** — they can be called either as
 *   `Array.fn(array, arg)` (data-first) or piped as
 *   `pipe(array, Array.fn(arg))` (data-last).
 *
 * ## Common tasks
 *
 * - **Create** an array: {@link make}, {@link of}, {@link empty}
 * - **Access** elements: {@link head}, {@link last}, {@link get}
 * - **Transform**: {@link map}, {@link flatMap}, {@link flatten}
 * - **Filter**: {@link filter}, {@link partition}, {@link dedupe}
 *
 * ## Gotchas
 *
 * - {@link fromIterable} returns the original array reference when given an
 *   array; if you need a copy, use {@link copy}.
 * - `sort`, `reverse`, etc. always allocate a new array — the input is never
 *   mutated.
 *
 * ## Quickstart
 *
 * **Example** (Basic array operations)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const numbers = Array.make(1, 2, 3, 4, 5)
 * const doubled = Array.map(numbers, (n) => n * 2)
 * console.log(doubled) // [2, 4, 6, 8, 10]
 * ```
 *
 * @see {@link make} — create a non-empty array from elements
 * @see {@link map} — transform each element
 * @since 2.0.0
 */
```

### Example: Option Module Documentation

```typescript
/**
 * The `Option` module provides a type-safe way to represent values that may or
 * may not exist. An `Option<A>` is either `Some<A>` (containing a value) or
 * `None` (representing absence).
 *
 * **Mental model**
 *
 * - `Option<A>` is a discriminated union: `None | Some<A>`
 * - `None` represents the absence of a value (like `null`/`undefined`, but type-safe)
 * - `Some<A>` wraps a present value of type `A`, accessed via `.value`
 * - `Option` is a monad: chain operations with {@link flatMap}
 *
 * **Common tasks**
 *
 * - Create from a value: {@link some}, {@link none}
 * - Create from nullable: {@link fromNullishOr}, {@link fromNullOr}
 * - Transform: {@link map}, {@link flatMap}, {@link andThen}
 * - Unwrap: {@link getOrElse}, {@link getOrNull}, {@link getOrThrow}
 *
 * **Gotchas**
 *
 * - `Option.some(null)` is a valid `Some`; use {@link fromNullishOr} to treat
 *   `null`/`undefined` as `None`
 * - {@link getOrThrow} throws a generic `Error`; prefer {@link getOrThrowWith}
 *
 * **Quickstart**
 *
 * **Example** (Working with optional values)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const name = Option.some("Alice")
 * const age = Option.none<number>()
 *
 * // Transform
 * const upper = Option.map(name, (s) => s.toUpperCase())
 *
 * // Unwrap with fallback
 * console.log(Option.getOrElse(upper, () => "unknown"))
 * // Output: "ALICE"
 * ```
 *
 * @since 2.0.0
 */
```

---

## Function-Level Documentation

### Standard Pattern

```typescript
/**
 * <One-line description of what the function does>
 *
 * [Optional: Additional explanation if complex]
 *
 * **Example** [Optional: only if behavior needs illustration]
 *
 * ```ts
 * import { Module } from "effect"
 *
 * const result = Module.function(input)
 * console.log(result) // Expected output
 * ```
 *
 * @since X.0.0
 * @category <category>
 */
export const functionName = <A>(param: A): ReturnType => {
  // implementation
}
```

### Example: Array.make

```typescript
/**
 * Creates a non-empty array from the provided elements.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = <Elements extends NonEmptyReadonlyArray<any>>(
  ...elements: Elements
): NonEmptyArray<Elements[number]> => elements
```

### Example: Array.map

```typescript
/**
 * Apply a function to each element of an array, returning a new array with the
 * transformed elements.
 *
 * **Example**
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const numbers = [1, 2, 3, 4, 5]
 * const doubled = Array.map(numbers, (n) => n * 2)
 * console.log(doubled) // [2, 4, 6, 8, 10]
 * ```
 *
 * @since 2.0.0
 * @category mapping
 */
export const map: {
  <A, B>(f: (a: A, i: number) => B): (self: ReadonlyArray<A>) => Array<B>
  <A, B>(self: ReadonlyArray<A>, f: (a: A, i: number) => B): Array<B>
} = dual(2, <A, B>(self: ReadonlyArray<A>, f: (a: A, i: number) => B): Array<B> =>
  self.map(f)
)
```

---

## Documentation Tags

### @since Tag (MANDATORY)

**Used on:** All public exports (modules, functions, types, constants)

**Format:** `@since X.Y.Z`

**Purpose:** Track when API was introduced for version migration

**Example:**
```typescript
/**
 * @since 2.0.0
 */
export const someFunction = ...

/**
 * @since 4.0.0
 */
export interface NewInterface {
  // ...
}
```

### @category Tag (COMMON)

**Used on:** Function exports

**Purpose:** Group functions in generated docs

**Common categories:**
- `constructors` - Factory functions (make, of, empty, etc.)
- `mapping` - Transformation functions (map, flatMap)
- `filtering` - Filter functions (filter, partition)
- `folding` - Reduction functions (reduce, fold)
- `elements` - Element access (head, tail, get)
- `getters` - Property access
- `models` - Type definitions
- `combinators` - Function composition
- `utils` - Utility functions

**Example:**
```typescript
/**
 * @since 2.0.0
 * @category constructors
 */
export const make = ...

/**
 * @since 2.0.0
 * @category mapping
 */
export const map = ...
```

### @see Tag (OCCASIONAL)

**Used on:** Module-level docs

**Purpose:** Link to related functions

**Format:** `@see {@link functionName} — brief description`

**Example:**
```typescript
/**
 * @see {@link make} — create a non-empty array
 * @see {@link map} — transform each element
 * @since 2.0.0
 */
```

### @internal Tag (RARE)

**Used on:** Internal implementation functions

**Purpose:** Mark as internal (not exported in docs)

**Example:**
```typescript
/**
 * @internal
 */
export const internalHelper = ...
```

---

## Special Documentation Files

### CHANGELOG.md

**Location:** Package root (e.g., `packages/effect/CHANGELOG.md`)

**Format:** Standard changelog format

**Example:**
```markdown
# effect

## 4.0.0-beta.4

### Minor Changes

- Added new feature X
- Improved performance of Y

### Patch Changes

- Fixed bug in Z
- Updated dependencies
```

**Pattern:**
- Present in 21/30 packages
- Auto-generated by changesets
- Tracks version history

### LICENSE

**Location:** Package root

**Content:** MIT license text

**Pattern:**
- Present in all packages
- Identical across packages

### Special Feature Docs

**Location:** Package root (large packages only)

**Examples:**
- `SCHEMA.md` (212 KB) - Schema system documentation
- `HTTPAPI.md` (94 KB) - HTTP API documentation
- `MCP.md` (12 KB) - MCP integration documentation
- `OPTIC.md` (15 KB) - Optic system documentation
- `CONFIG.md` (12 KB) - Configuration system documentation

**Pattern:**
- Only in effect package (core)
- Comprehensive feature guides
- Separate from API docs

---

## docgen Configuration

### docgen.json

**Location:** Package root (e.g., `packages/effect/docgen.json`)

**Purpose:** Configure @effect/docgen for API doc generation

**Example:**
```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "exclude": [
    "src/internal/**/*.ts",
    "src/unstable/**/internal/**/*.ts",
    "src/schema/StandardSchema.ts"
  ],
  "srcLink": "https://github.com/Effect-TS/effect-smol/tree/main/packages/effect/src/",
  "examplesCompilerOptions": {
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "module": "ES2022",
    "target": "ES2022",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "rewriteRelativeImportExtensions": true,
    "allowImportingTsExtensions": true,
    "paths": {
      "effect": ["../../../effect/src/index.js"],
      "effect/*": ["../../../effect/src/*.js"]
    }
  }
}
```

**Key Fields:**
- `exclude` - Files to skip (internal modules)
- `srcLink` - GitHub source link pattern
- `examplesCompilerOptions` - TypeScript config for example code

---

## Documentation Generation

### Command

```bash
pnpm docgen
# Runs in all packages: docgen && node scripts/docs.mjs
```

### Process

1. **Extract JSDoc** from source files
2. **Generate Markdown** for each module
3. **Process examples** (type-check + format)
4. **Aggregate docs** to central location
5. **Generate index** files

### Output

**Location:** `docs/` directory (ignored by git)

**Structure:**
```
docs/
├── modules/
│   ├── Array.md
│   ├── Option.md
│   ├── Effect.md
│   └── ...
└── index.md
```

---

## Documentation Quality Standards

### Module-Level Documentation

**REQUIRED:**
- Mental model section
- Common tasks section
- Gotchas section
- Quickstart example
- @since tag

**Structure:**
```
1. Brief description
2. Mental model (3-5 bullet points)
3. Common tasks (organized by category with links)
4. Gotchas (edge cases, non-obvious behavior)
5. Quickstart (working example with output)
6. @see references (optional)
7. @since version
```

### Function-Level Documentation

**REQUIRED:**
- One-line description
- @since tag
- @category tag

**OPTIONAL:**
- Example (if behavior needs illustration)
- Additional explanation (if complex)

**NOT INCLUDED:**
- Parameter descriptions (types are self-documenting)
- Return value description (type is self-documenting)
- Verbose explanations (keep concise)

---

## Example Code Standards

### Format

```typescript
/**
 * **Example** (Brief description)
 *
 * ```ts
 * import { Module } from "effect"
 *
 * const input = ...
 * const result = Module.function(input)
 * console.log(result) // Expected output
 * ```
 */
```

### Rules

1. **Import statement** - Always show imports
2. **Real code** - Must be valid, runnable code
3. **Output comments** - Show expected output
4. **Concise** - 5-15 lines max
5. **Self-contained** - No external dependencies
6. **Focused** - Illustrate one concept

---

## Internal Documentation

### internal/ Directory

**Documentation:** `@internal` tag on exports

**Purpose:** Mark as implementation detail

**Visibility:** Not included in generated docs

**Example:**
```typescript
// src/internal/array.ts
/**
 * @internal
 */
export const none: Option.Option<never> = Object.create(NoneProto)
```

---

## Key Takeaways for @beep/repo-cli

1. **README template:** Requirements + Installation + Overview + Links
2. **Module docs:** Mental model + Common tasks + Gotchas + Quickstart
3. **@since tags:** On all public exports
4. **@category tags:** For function grouping
5. **docgen.json:** In each package root
6. **Example code:** Concise, runnable, with output
7. **Special docs:** For complex features (separate .md files)
8. **CHANGELOG.md:** Auto-generated by changesets
9. **LICENSE:** MIT in every package
10. **Documentation generation:** Via @effect/docgen

---

## Documentation Template

### README.md

```markdown
# `@<scope>/<package-name>`

<One-sentence description>

## Requirements

- **TypeScript X.X or Newer**
- **Strict Type-Checking**

## Installation

```bash
npm install @<scope>/<package-name>
```

## Documentation

- **API Reference**: <link>

## License

MIT
```

### Module JSDoc

```typescript
/**
 * <One-line module description>
 *
 * ## Mental model
 *
 * - Key concept 1
 * - Key concept 2
 *
 * ## Common tasks
 *
 * - **Category**: {@link fn1}, {@link fn2}
 *
 * ## Gotchas
 *
 * - Caveat 1
 *
 * ## Quickstart
 *
 * **Example** (Description)
 *
 * ```ts
 * import { Module } from "package"
 *
 * const result = Module.function(...)
 * ```
 *
 * @since X.0.0
 */
```

### Function JSDoc

```typescript
/**
 * <One-line function description>
 *
 * @since X.0.0
 * @category <category>
 */
export const functionName = ...
```

### docgen.json

```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "exclude": ["src/internal/**/*.ts"],
  "srcLink": "https://github.com/<org>/<repo>/tree/main/packages/<name>/src/",
  "examplesCompilerOptions": {
    "noEmit": true,
    "strict": true,
    "moduleResolution": "Bundler"
  }
}
```
