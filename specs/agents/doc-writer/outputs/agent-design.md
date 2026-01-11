# Doc Writer Agent Design

## Overview

The doc-writer agent is a documentation specialist that writes JSDoc comments, README files, and AGENTS.md files following repository standards. It synthesizes patterns from jsdoc-fixer and readme-updater into a unified documentation writer.

## JSDoc Template

### Full Template

```typescript
/**
 * Brief one-line description of what this export does.
 *
 * More detailed explanation if needed. Can span multiple lines
 * and include context about when and how to use this.
 *
 * @example
 * ```typescript
 * import { ExportName } from "@beep/package-name"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* ExportName({ input: "value" })
 *   return result
 * })
 * // => Expected output description
 * ```
 *
 * @category categoryname
 * @since 0.1.0
 */
export const ExportName = ...
```

### Templates by Export Type

#### Schema Export
```typescript
/**
 * Lowercased, trimmed, non-empty email string schema.
 *
 * @example
 * ```typescript
 * import { EmailEncoded } from "@beep/schema"
 * import * as S from "effect/Schema"
 *
 * const email = S.decodeUnknownSync(EmailEncoded)("ops@example.com")
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
```

#### Constructor Export
```typescript
/**
 * Creates a new User entity with the provided data.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { createUser } from "@beep/iam-domain"
 *
 * const program = Effect.gen(function* () {
 *   const user = yield* createUser({ name: "Alice", email: "alice@example.com" })
 *   return user
 * })
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
```

#### Service Interface
```typescript
/**
 * Encryption service providing AES-256-GCM encryption for sensitive data.
 *
 * @example
 * ```typescript
 * import { EncryptionService } from "@beep/shared-domain"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const encryption = yield* EncryptionService
 *   const encrypted = yield* encryption.encrypt("secret", key)
 *   return encrypted
 * })
 * ```
 *
 * @category services
 * @since 0.1.0
 */
```

#### Layer Export
```typescript
/**
 * Live implementation of the encryption service using Web Crypto API.
 *
 * @example
 * ```typescript
 * import { EncryptionServiceLive } from "@beep/shared-server"
 * import * as Effect from "effect/Effect"
 *
 * const program = myEffect.pipe(Effect.provide(EncryptionServiceLive))
 * ```
 *
 * @category layers
 * @since 0.1.0
 */
```

#### Error Export
```typescript
/**
 * Error thrown when encryption fails due to invalid key or data.
 *
 * @example
 * ```typescript
 * import { EncryptionError } from "@beep/shared-domain"
 * import * as Effect from "effect/Effect"
 *
 * const handled = program.pipe(
 *   Effect.catchTag("EncryptionError", (e) => Effect.succeed("fallback"))
 * )
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
```

#### Re-export (Barrel File)
```typescript
/**
 * Re-exports configuration loading utilities.
 *
 * @example
 * ```typescript
 * import { loadConfig } from "@beep/package-name"
 *
 * const config = loadConfig("path/to/config")
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./config.js";
```

## README Template

```markdown
# @beep/package-name

Brief one-line description matching package.json description.

## Purpose

2-3 sentences explaining what this package does and its role in the architecture.
- What problem does it solve?
- Where does it fit in the layering (domain, server, client, ui)?
- Who consumes it?

## Installation

\`\`\`bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/package-name": "workspace:*"
\`\`\`

## Key Exports

| Export | Description |
|--------|-------------|
| `MainExport` | Primary functionality |
| `HelperUtil` | Supporting utilities |

## Usage

### Basic Example

\`\`\`typescript
import { MainExport } from "@beep/package-name"
import * as Effect from "effect/Effect"

const program = Effect.gen(function* () {
  const result = yield* MainExport.doSomething()
  return result
})
\`\`\`

### With Layer Composition

\`\`\`typescript
import { MainExport, MainExportLive } from "@beep/package-name"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

const program = Effect.gen(function* () {
  const service = yield* MainExport
  return yield* service.method()
}).pipe(Effect.provide(MainExportLive))
\`\`\`

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/dependency` | Why this dependency is needed |

## Development

\`\`\`bash
# Type check
bun run --filter @beep/package-name check

# Lint
bun run --filter @beep/package-name lint

# Build
bun run --filter @beep/package-name build

# Test
bun run --filter @beep/package-name test
\`\`\`

## Notes

Any gotchas, patterns to follow, or important considerations.
```

## AGENTS.md Template

```markdown
# @beep/package-name — AGENTS Guide

## Purpose & Fit

- What this package provides and its role in the architecture
- Key consumers and dependencies
- Single sentence on main responsibility

## Surface Map

- **\`src/index.ts\`** — Main barrel export
- **\`src/module/\`** — Description of module purpose
- **\`test/\`** — Test coverage locations

## Usage Snapshots

- \`apps/web/src/example.ts:42\` — How this package is used in apps
- \`packages/slice/module/file.ts:15\` — Cross-slice usage example

## Authoring Guardrails

- ALWAYS use Effect namespace imports
- NEVER use native array/string methods
- ALWAYS use \`F.pipe\` for transformations
- Keep additions slice-agnostic

## Quick Recipes

\`\`\`typescript
import { MainExport } from "@beep/package-name"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"

const program = Effect.gen(function* () {
  const result = yield* MainExport.operation()
  return result
})
\`\`\`

## Verifications

- \`bun run --filter @beep/package-name test\` — Run tests
- \`bun run --filter @beep/package-name lint\` — Biome hygiene
- \`bun run --filter @beep/package-name check\` — TypeScript check

## Contributor Checklist

- [ ] Effect namespace imports used throughout
- [ ] No native array/string/object methods
- [ ] Tests added for new functionality
- [ ] Documentation updated
```

## Category Conventions

| Category | Use For | Examples |
|----------|---------|----------|
| `constructors` | Factory functions, create* | `make`, `of`, `fromString` |
| `schemas` | Effect Schema definitions | `EmailSchema`, `UserInput` |
| `combinators` | Transform/combine instances | `map`, `flatMap`, `combine` |
| `mapping` | Data transformation | `mapError`, `transform` |
| `getters` | Property access | `getName`, `getId` |
| `filtering` | Selection operations | `filter`, `filterMap` |
| `folding` | Aggregation/reduction | `reduce`, `fold` |
| `models` | Type definitions | `interface User`, `type Config` |
| `symbols` | Branded types, Tags | `UserId`, `Context.Tag` |
| `guards` | Type guards | `isUser`, `hasPermission` |
| `predicates` | Boolean functions | `isEmpty`, `isValid` |
| `errors` | Error types | `class ValidationError` |
| `layers` | Layer constructors | `MainServiceLive` |
| `services` | Service interfaces | `EncryptionService` |
| `utilities` | Helper functions | `formatDate`, `parseUrl` |
| `exports` | Re-exports | `export * from "./module"` |

## Effect Pattern Requirements

### REQUIRED Patterns

```typescript
// Namespace imports
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"
import * as A from "effect/Array"
import * as O from "effect/Option"
import * as F from "effect/Function"
import * as Str from "effect/String"

// Effect.gen for effects
const program = Effect.gen(function* () {
  const service = yield* MyService
  return yield* service.method()
})

// F.pipe for transformations
const result = F.pipe(items, A.map(transform), A.filter(predicate))
```

### FORBIDDEN Patterns

```typescript
// Named imports
import { Effect, Schema } from "effect"  // WRONG

// Native methods
items.map(x => x.name)   // WRONG - use A.map
str.split(",")           // WRONG - use Str.split
items.filter(x => x.active)  // WRONG - use A.filter

// async/await
async function fetch() { await ... }  // WRONG - use Effect.gen
```

## Validation Checklist

### JSDoc

- [ ] Has @example tag with code block
- [ ] Has @category tag (single lowercase word)
- [ ] Has @since tag (0.1.0 for new)
- [ ] Example uses Effect.gen (if effectful)
- [ ] Example uses namespace imports
- [ ] No async/await in example
- [ ] No native array/string methods

### README

- [ ] Has Purpose section
- [ ] Has Key Exports table
- [ ] Has Usage section with code
- [ ] Code uses Effect patterns
- [ ] Dependencies table present
- [ ] Development commands listed

### AGENTS.md

- [ ] Has Purpose & Fit section
- [ ] Has Surface Map
- [ ] Has Quick Recipes
- [ ] Has Verifications
- [ ] Has Contributor Checklist
- [ ] No stale package references
- [ ] No MCP tool shortcuts
- [ ] Code uses Effect patterns
