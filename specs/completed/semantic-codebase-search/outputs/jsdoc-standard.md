# JSDoc Standard for Semantic Codebase Search

> P2 Design Document — Defines REQUIRED documentation tags per symbol kind for annotation-driven semantic search.

## Tag Requirement Matrix

### Legend

- **R** = Required (lint error if missing)
- **S** = Should have (lint warning if missing)
- **O** = Optional (no enforcement)
- **N/A** = Not applicable to this symbol kind

| Tag | schema | service | layer | error | function | type | constant | command | module |
|-----|--------|---------|-------|-------|----------|------|----------|---------|--------|
| Description | R | R | R | R | R | R | R | R | R |
| `@since` | R | R | R | R | R | R | R | R | R |
| `@category` | R | R | R | R | R | R | R | R | N/A |
| `@example` | S | S | O | O | S | O | O | S | O |
| `@remarks` | S | R | S | O | S | O | O | S | S |
| `@see` | S | S | S | S | S | S | O | S | O |
| `@param` | N/A | N/A | N/A | N/A | R | N/A | N/A | N/A | N/A |
| `@returns` | N/A | N/A | N/A | N/A | R | N/A | N/A | N/A | N/A |
| `@throws` | N/A | N/A | N/A | N/A | S | N/A | N/A | S | N/A |
| `@deprecated` | O | O | O | O | O | O | O | O | O |
| `@internal` | O | O | O | O | O | O | O | O | O |
| `@packageDocumentation` | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | R |

### Custom Effect Tags

| Tag | schema | service | layer | error | function | type | constant | command | module |
|-----|--------|---------|-------|-------|----------|------|----------|---------|--------|
| `@provides` | N/A | S | R | N/A | O | N/A | N/A | N/A | O |
| `@depends` | N/A | S | R | N/A | O | N/A | N/A | O | O |
| `@errors` | N/A | O | O | N/A | S | N/A | N/A | S | N/A |
| `@domain` | S | S | S | S | O | O | O | S | R |

---

## Per-Symbol-Kind Standards

### 1. Schema (`@category schemas`)

**Required annotations (in code, not JSDoc):**
- `.annotate({ identifier, title, description })` on the schema value
- `.annotateKey({ description })` on every struct field

**Required JSDoc tags:**
- Description: What the schema validates, what constraints it enforces
- `@since`: Semver version
- `@category`: Always `schemas`

**Should have:**
- `@example`: Decoding/encoding usage
- `@remarks`: Validation rules, branding semantics, edge cases
- `@see`: Related schemas (e.g., encoded form, parent struct)
- `@domain`: Business domain (e.g., `package-management`, `dependency-graph`)

```typescript
// GOOD: Rich, specific, domain-aware
/**
 * Validates and brands npm package names per the npm naming specification.
 *
 * Rejects scoped packages with empty names, names containing uppercase,
 * and names exceeding 214 characters.
 *
 * @example
 * ```ts
 * import { PackageName } from "@beep/repo-utils/schemas"
 * import * as S from "effect/Schema"
 *
 * const name = S.decodeUnknownSync(PackageName)("@beep/repo-utils")
 * ```
 *
 * @see {@link PackageJson} Parent schema consuming this type
 * @since 0.0.0
 * @category schemas
 * @domain package-management
 */
export const PackageName = S.String.pipe(
  S.pattern(/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/),
  S.brand("PackageName")
).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/PackageName",
  title: "Package Name",
  description: "An npm package name conforming to the npm naming specification.",
  examples: ["@beep/repo-utils", "effect", "my-package"]
})
```

```typescript
// BAD: Restates the name, no constraints, no domain context
/**
 * A package name.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PackageName = S.String.pipe(S.brand("PackageName"))
```

### 2. Service (`@category services`)

**Required JSDoc tags:**
- Description: What capability this service provides, when to use it
- `@since`: Semver version
- `@category`: Always `services`
- `@remarks`: Design rationale, threading/concurrency notes, lifecycle

**Should have:**
- `@provides`: What capabilities this service exposes
- `@depends`: What services this requires
- `@example`: Basic acquisition and usage via `yield*`
- `@see`: Related layer, related services

```typescript
// GOOD: Explains capability, dependencies, lifecycle
/**
 * Discovers and resolves workspace packages in a monorepo.
 *
 * Walks the filesystem from the project root, reads package.json files,
 * and builds a dependency graph with topological ordering.
 *
 * @remarks
 * Uses FileSystem and Path services for I/O. Results are cached per
 * session — calling `resolve` multiple times returns the same graph.
 * Thread-safe for concurrent access within a single Effect runtime.
 *
 * @example
 * ```ts
 * const workspace = yield* WorkspaceResolver
 * const packages = yield* workspace.resolve("./")
 * ```
 *
 * @provides WorkspaceResolver — monorepo package discovery
 * @depends FileSystem, Path
 * @see {@link WorkspaceResolverLive} Layer providing this service
 * @since 0.0.0
 * @category services
 * @domain dependency-graph
 */
```

```typescript
// BAD: Restates interface name, no capability description
/**
 * The workspace resolver service.
 *
 * @since 0.0.0
 * @category services
 */
```

### 3. Layer (`@category layers`)

**Required JSDoc tags:**
- Description: What this layer provides and what it requires
- `@since`: Semver version
- `@category`: Always `layers`
- `@provides`: Service(s) this layer constructs
- `@depends`: Service(s) this layer requires

**Should have:**
- `@remarks`: Construction details, resource management, scoping
- `@see`: The service interface this implements
- `@example`: How to provide this layer

```typescript
// GOOD: Clear dependency chain and construction semantics
/**
 * Constructs a live WorkspaceResolver backed by the real filesystem.
 *
 * Reads workspace globs from the root package.json and walks matching
 * directories to discover packages. Caches the resolved graph in a Ref
 * for the lifetime of the layer scope.
 *
 * @provides WorkspaceResolver
 * @depends FileSystem, Path
 * @see {@link WorkspaceResolver} Service interface
 * @since 0.0.0
 * @category layers
 * @domain dependency-graph
 */
```

```typescript
// BAD: No dependency information
/**
 * Live layer for WorkspaceResolver.
 *
 * @since 0.0.0
 * @category layers
 */
```

### 4. Error (`@category errors`)

**Required annotations (in code):**
- `S.TaggedErrorClass` with identifier, tag name, field schemas, title, description

**Required JSDoc tags:**
- Description: When this error occurs, what went wrong
- `@since`: Semver version
- `@category`: Always `errors`

**Should have:**
- `@see`: The operation(s) that can produce this error

```typescript
// GOOD: States trigger condition and recovery hint
/**
 * Raised when a dependency cycle is detected in the workspace package graph.
 *
 * Contains the full cycle path for diagnostic output. Consumers should
 * display the cycle to the user and suggest removing the circular dependency.
 *
 * @see {@link WorkspaceResolver.resolve} Operation that produces this error
 * @since 0.0.0
 * @category errors
 * @domain dependency-graph
 */
export class CyclicDependencyError extends S.TaggedErrorClass<CyclicDependencyError>(
  "@beep/repo-utils/errors/CyclicDependencyError/CyclicDependencyError"
)(
  "CyclicDependencyError",
  { message: S.String, cycle: S.Array(S.String) },
  { title: "Cyclic Dependency Error", description: "Raised when a dependency cycle is detected in the workspace package graph." }
) {}
```

```typescript
// BAD: Restates class name
/**
 * A cyclic dependency error.
 *
 * @since 0.0.0
 * @category errors
 */
```

### 5. Function / Effect.fn (`@category constructors | utils | algorithms`)

**Required JSDoc tags:**
- Description: What this function does (verb-first), under what conditions
- `@param`: Every parameter with semantic description (not type restating)
- `@returns`: What the successful result represents
- `@since`: Semver version
- `@category`: Appropriate grouping

**Should have:**
- `@throws` / `@errors`: Tagged errors this can fail with
- `@example`: Usage with Effect.gen
- `@remarks`: Algorithm complexity, edge cases, idempotency

```typescript
// GOOD: Verb-first, describes behavior and failure modes
/**
 * Reads and validates a package.json file at the given path.
 *
 * Decodes the raw JSON through the PackageJson schema, producing
 * a branded, validated result. Fails with DomainError if the file
 * cannot be read or SchemaError if validation fails.
 *
 * @param path - Absolute or relative path to the package.json file
 * @returns Validated PackageJson with branded name and version fields
 * @throws DomainError — file cannot be read
 * @throws SchemaError — JSON does not conform to PackageJson schema
 *
 * @example
 * ```ts
 * const pkg = yield* readPackageJson("./package.json")
 * console.log(pkg.name) // "@beep/repo-utils"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 * @domain package-management
 */
```

```typescript
// BAD: Restates signature, no failure modes
/**
 * Reads a package json.
 *
 * @param path - the path
 * @returns the package json
 * @since 0.0.0
 * @category constructors
 */
```

### 6. Type (`@category types | models`)

**Required JSDoc tags:**
- Description: What this type represents, when to use it vs alternatives
- `@since`: Semver version
- `@category`: Appropriate grouping

**Should have:**
- `@see`: Related types, schemas, or constructors

```typescript
// GOOD: Explains semantic meaning
/**
 * The decoded representation of a package.json manifest.
 *
 * All fields are validated and branded. The `name` field is guaranteed
 * to conform to the npm naming specification. Use `PackageJsonEncoded`
 * for the raw JSON representation before validation.
 *
 * @see {@link PackageJsonEncoded} Raw encoded form
 * @see {@link PackageJsonSchema} Schema for decoding
 * @since 0.0.0
 * @category types
 * @domain package-management
 */
export type PackageJson = typeof PackageJsonSchema.Type
```

```typescript
// BAD: States the obvious
/**
 * Package json type.
 *
 * @since 0.0.0
 * @category types
 */
```

### 7. Constant (`@category constants`)

**Required JSDoc tags:**
- Description: What this constant represents, where its value comes from
- `@since`: Semver version
- `@category`: Always `constants`

```typescript
// GOOD: Explains provenance
/**
 * Supported package types for the create-package command.
 *
 * Maps to subdirectory structure under `tooling/` (library) or
 * `apps/` (application) in the monorepo layout.
 *
 * @since 0.0.0
 * @category constants
 * @domain package-management
 */
export const PACKAGE_TYPES = ["library", "application"] as const
```

### 8. Command (`@category commands`)

**Required JSDoc tags:**
- Description: What this CLI command does, user-facing behavior
- `@since`: Semver version
- `@category`: Always `commands`

**Should have:**
- `@remarks`: Flags, arguments, exit codes
- `@throws` / `@errors`: Failure modes
- `@example`: CLI invocation example
- `@depends`: Services required beyond Command.Environment

```typescript
// GOOD: User-facing behavior description
/**
 * Scaffolds a new package in the monorepo with standard boilerplate.
 *
 * Creates the package directory, generates package.json from the
 * workspace catalog, sets up tsconfig, and creates initial source
 * files with docgen-ready JSDoc headers.
 *
 * @remarks
 * Requires `--name` (package name) and optional `--type` (library|application).
 * Defaults to library type. Exits with code 1 if the package directory
 * already exists.
 *
 * @example
 * ```sh
 * beep create-package --name my-pkg --type library
 * ```
 *
 * @errors DomainError — package directory already exists
 * @depends FileSystem, Path
 * @since 0.0.0
 * @category commands
 * @domain package-management
 */
```

### 9. Module (file-level, `@packageDocumentation`)

**Required JSDoc tags:**
- Description: What this module contains and its role in the package
- `@since`: Semver version
- `@packageDocumentation`: Marks as file-level doc (TSDoc standard)

**Should have:**
- `@remarks`: Key exports, design decisions, usage patterns
- `@domain`: Business domain
- `@see`: Related modules
- `@depends`: Services required by exports in this module

```typescript
// GOOD: Module-level doc with role and key exports
/**
 * Schema definitions for npm package.json manifest validation.
 *
 * Provides branded types for package names, versions, and dependency
 * maps. All schemas include `.annotate()` metadata for semantic search
 * indexing and produce human-readable validation errors.
 *
 * @remarks
 * Key exports: {@link PackageJsonSchema}, {@link PackageName}, {@link PackageVersion}.
 * All schemas enforce the npm specification constraints. Field-level
 * descriptions are available via `.annotateKey()` for granular search.
 *
 * @see {@link readPackageJson} Consumer of these schemas
 * @since 0.0.0
 * @domain package-management
 * @packageDocumentation
 */
```

```typescript
// BAD: Empty placeholder
/**
 * @since 0.0.0
 * @module
 */
```

---

## Description Quality Bar

All descriptions MUST meet these criteria:

### Minimum Requirements (Lint Error if Violated)

1. **Start with a verb or noun phrase** — never with "This is" or "A/An/The"
2. **Minimum 20 characters** — prevents name restating
3. **End with a period** — complete sentence
4. **Not restating the symbol name** — `informative-docs` rule catches this
5. **Contain at least one domain term** — not purely generic language

### Quality Indicators (Checked in Review)

| Quality Signal | Description |
|---------------|-------------|
| **Verb-first** | "Validates...", "Reads...", "Constructs..." — describes action |
| **Domain terms** | Uses project vocabulary: "workspace", "dependency graph", "branded" |
| **Constraint mention** | States invariants, validation rules, edge cases |
| **Relationship mention** | Names related symbols, modules, or concepts |
| **Self-contained** | Understandable without reading the code |

### Anti-Patterns (Reject in Review)

| Anti-Pattern | Example | Fix |
|-------------|---------|-----|
| Name restating | "The package name schema" | "Validates npm package names per the naming specification" |
| Vague | "Utility for working with packages" | "Reads and validates package.json files from the filesystem" |
| Implementation leak | "Uses regex to check..." | "Rejects names with uppercase, spaces, or special characters" |
| No constraints | "A string type" | "A branded string guaranteed to match the npm naming spec" |
| Too short | "Package name" | Full sentence with context |

---

## Tag Ordering Convention

Tags within a JSDoc block MUST follow this order:

```
1. @summary (if separate from description)
2. @remarks
3. @example (multiple allowed)
4. @param / @typeParam
5. @returns
6. @throws / @errors
7. @see
8. @provides / @depends
9. @domain / @category
10. @since / @deprecated
11. @internal / @alpha / @beta
12. @packageDocumentation (file-level only)
```

Enforced via `jsdoc/sort-tags` ESLint rule.

---

## Custom Tag Definitions (tsdoc.json)

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json",
  "tagDefinitions": [
    { "tagName": "@domain", "syntaxKind": "block", "allowMultiple": false },
    { "tagName": "@provides", "syntaxKind": "block", "allowMultiple": true },
    { "tagName": "@depends", "syntaxKind": "block", "allowMultiple": true },
    { "tagName": "@errors", "syntaxKind": "block", "allowMultiple": true }
  ],
  "supportForTags": {
    "@since": { "supported": true },
    "@category": { "supported": true },
    "@example": { "supported": true },
    "@remarks": { "supported": true },
    "@see": { "supported": true },
    "@deprecated": { "supported": true },
    "@internal": { "supported": true },
    "@packageDocumentation": { "supported": true },
    "@throws": { "supported": true },
    "@param": { "supported": true },
    "@returns": { "supported": true },
    "@typeParam": { "supported": true },
    "@domain": { "supported": true },
    "@provides": { "supported": true },
    "@depends": { "supported": true },
    "@errors": { "supported": true }
  }
}
```

---

## Embedding Value by Tag

Tags ranked by contribution to semantic search quality:

| Rank | Tag | Embedding Value | Rationale |
|------|-----|----------------|-----------|
| 1 | Description | Critical | Primary natural language for embedding |
| 2 | `@remarks` | Critical | Extended context, design rationale |
| 3 | `@example` (comments) | High | Usage patterns in natural language |
| 4 | `@domain` | High | Business domain classification |
| 5 | `@category` | High | Symbol kind taxonomy |
| 6 | `.annotate({ title })` | High | Human-readable name |
| 7 | `.annotate({ description })` | High | Schema-level description |
| 8 | `@see` / `{@link}` | High | Relationship edges for graph traversal |
| 9 | `@provides` / `@depends` | Medium | Dependency graph edges |
| 10 | `@param` descriptions | Medium | Input semantics |
| 11 | `@returns` | Medium | Output semantics |
| 12 | `@throws` / `@errors` | Medium | Failure mode semantics |
| 13 | `.annotateKey({ description })` | Medium | Field-level search |
| 14 | `@since` | Low | Version filtering only |
| 15 | `@deprecated` | Low | Exclusion filtering only |
