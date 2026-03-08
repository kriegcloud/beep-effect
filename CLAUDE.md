# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management

- **Runtime & Package Manager**: Bun
- `bun install` - Install dependencies
- `bun add <package>` - Add new dependency
- `bun remove <package>` - Remove dependency

### Build and Run

- `bun run start` - Run the application
- `bun run dev` - Start with watch mode (hot reload)

**IMPORTANT**: Never run `bun run dev` during development work. The development server should only be started by the user manually. Use tests instead.

### Code Quality

- `bun run typecheck` - Run TypeScript type checking (tsc -b)
- `bun run lint` - Run ESLint on all TypeScript files
- `bun run lint:fix` - Run ESLint with automatic fixes

### Testing

- `bun run test` - Run all tests once
- `bun run test:unit` - Run unit tests only
- `bun run test:watch` - Run tests in watch mode
- Uses Vitest with @effect/vitest for Effect-aware testing
- Test files: `test/**/*.test.ts`

**CRITICAL DEVELOPMENT RULE**: After EVERY file change, you MUST:

1. Run `bun run lint:fix` immediately
2. Run `bun run typecheck` immediately
3. Fix ALL lint errors and type errors before proceeding
4. Do NOT continue development until both commands pass without errors

This is non-negotiable and applies to every single file modification.

## Project Architecture

### Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript with ES2022 target
- **Module System**: NodeNext module resolution
- **Effect Ecosystem**: Effect TypeScript library with language service plugin

### Project Structure

```
src/
  Program.ts          - Main entry point
  NLP/                - NLP engine and processing
    Core/             - Core types (Token, Document, Sentence, Pattern)
    Wink/             - Wink NLP engine integration
    Layers/           - Effect Layer composition
test/
  unit/               - Unit tests
patterns/             - Implementation pattern documentation
```

### Code Style and Linting

- Strict ESLint configuration with Effect-specific rules
- Import sorting and destructuring key sorting enforced
- `@typescript-eslint` for TypeScript-specific rules

### TypeScript Configuration

- Strict mode with `exactOptionalPropertyTypes`
- `verbatimModuleSyntax` and `rewriteRelativeImportExtensions` enabled
- Effect Language Service plugin for enhanced diagnostics
- Project references: `tsconfig.src.json` + `tsconfig.test.json`

<!-- effect-solutions:start -->
## Effect Best Practices

**IMPORTANT:** Always consult effect-solutions before writing Effect code.

1. Run `effect-solutions list` to see available guides
2. Run `effect-solutions show <topic>...` for relevant patterns (supports multiple topics)
3. Search `.reference/effect/` for real implementations

Topics: quick-start, project-setup, tsconfig, basics, services-and-layers, data-modeling, error-handling, config, testing, cli.

Never guess at Effect patterns - check the guide first.
<!-- effect-solutions:end -->

## Effect TypeScript Development Patterns

### Core Principles

- **Type Safety First**: Never use `any` or type assertions
- **Effect Patterns**: Use Effect's composable abstractions
- **Early Returns**: Prefer early returns over deep nesting
- **Input Validation**: Validate inputs at system boundaries
- **Resource Safety**: Use Effect's resource management for automatic cleanup

### Forbidden Practices

- **NEVER** use `try-catch` inside `Effect.gen` generators - use `Effect.tryPromise`, `Effect.try`, or Effect error handling
- **NEVER** use `as any`, `as never`, or `as unknown` type assertions
- **ALWAYS** use `return yield*` when yielding errors or interrupts in `Effect.gen`

### Effect-Specific Patterns

#### Sequential Operations

```typescript
const program = Effect.gen(function* () {
  const user = yield* getUser(id)
  const profile = yield* getProfile(user.profileId)
  return { user, profile }
})
```

#### Error Handling

```typescript
class UserNotFound extends Data.TaggedError("UserNotFound")<{
  readonly id: string
}> {}

const fetchUser = (id: string) =>
  Effect.tryPromise({
    try: () => fetch(`/users/${id}`).then((r) => r.json()),
    catch: () => new UserNotFound({ id })
  })
```

### Testing

**Use @effect/vitest for Effect code:**

- Import: `import { assert, describe, it } from "@effect/vitest"`
- Pattern: `it.effect("description", () => Effect.gen(function*() { ... }))`
- **FORBIDDEN**: Never use `expect` from vitest in Effect tests - use `assert` methods

**Use regular vitest for pure TypeScript:**

- Import: `import { describe, expect, it } from "vitest"`
- Pattern: `it("description", () => { ... })`

```typescript
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

describe("MyService", () => {
  it.effect("should work", () =>
    Effect.gen(function* () {
      const result = yield* myEffect
      assert.strictEqual(result, expected)
    })
  )
})
```

## Implementation Patterns

Reference `patterns/` directory for established patterns:

- `patterns/layer-composition.md` - Layer-based dependency injection
- `patterns/generic-testing.md` - Testing patterns with @effect/vitest
- `patterns/http-api.md` - HTTP API patterns
- `patterns/http-specific-testing.md` - HTTP testing patterns

## Notes

- Schema lives in `effect/Schema` (not `@effect/schema` which is deprecated)
- Vitest with @effect/vitest configured for Effect-aware testing
- Effect Language Service provides compile-time diagnostics (patched via `prepare` script)
- `.reference/effect/` contains Effect source for AI reference (not committed)
