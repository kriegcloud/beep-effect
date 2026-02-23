# `@beep/ui-spreadsheet` Agent Guide

## Purpose

Spreadsheet formula interpreter and utility library for building spreadsheet-like UIs. Provides a complete expression evaluation pipeline (tokenizer, parser, interpreter) for Excel-style formulas and supporting utilities for cursor management, hotkeys, and array operations.

## Key Exports

### Interpreter Pipeline (`src/interpreter/`)

The core formula evaluation system:

- **`tokenizer.ts`** - Lexical analysis converting formula strings into tokens
  - Supports: numbers, cell references (`A1`), operators (`+`, `-`, `*`, `/`, `%`, `^`), parentheses, `REF()` function
  - Uses Effect `HashMap`, `Match`, `Option` for token processing

- **`parser.ts`** - Recursive descent parser building AST from tokens
  - Handles operator precedence: exponent > multiplication/division/modulo > addition/subtraction
  - Supports unary operators (`+`, `-`) and cell ranges (`A1:B2`)
  - Uses `Data.TaggedEnum` for AST node types

- **`interpreter.ts`** - AST evaluator computing numeric results
  - Entry point: `default function(input: string, getCellValue: (key: string) => number): ExpressionResult`
  - Returns `{ type: "number" | "string" | "error", value? }`
  - Formulas start with `=` (e.g., `=A1+B2*3`)

### Models (`src/interpreter/models/`)

Type-safe domain models using Effect patterns:

- **`Expression.ts`** - AST node types via `Data.taggedEnum`
  - Node kinds: `Ref`, `CellRange`, `NumberLiteral`, `Addition`, `Subtraction`, `Multiplication`, `Division`, `Modulo`, `Exponent`, `UnaryPlus`, `UnaryMinus`
  - Error types: `UnexpectedTokenError`, `UnexpectedEndOfInputError`, `UnexpectedTokenInFactorError`

- **`SyntaxKind.ts`** - Token type definitions using `BS.StringLiteralKit` and `BS.MappedLiteralKit`
  - Token types: `NumberToken`, `CellToken`, `RefToken`, `SimpleCharToken`
  - Character-to-token mapping: `SyntaxKindFromSimpleChar`

### Utilities (`src/utils/`)

- **`isNumerical.ts`** - Branded type for numeric strings via `S.declare`
- **`globalCursor.ts`** - DOM cursor state management (`grabbing`, `resizing-column`, `resizing-row`, `scrubbing`)
- **`canUseHotkeys.ts`** - Focus detection for keyboard shortcut handling
- **`useInitialRender.ts`** - React hook for first-render detection
- **`appendUnit.ts`** - CSS unit helper (`appendUnit(100, 'px')` -> `'100px'`)
- **`shuffle.ts`** - Seeded array shuffle using Effect `Random`
- **`getIndexWithProperty.ts`** - Object array search using `A.findFirstIndex`

## Dependencies

Peer dependencies from workspace:
- `@beep/ui-core`, `@beep/ui` - UI primitives and components
- `effect` - Core Effect runtime
- `lexical`, `@lexical/*` - Rich text editor integration
- `@mui/material` - MUI components
- `@tanstack/react-form` - Form state management
- `react`, `react-dom`, `next` - React/Next.js runtime

Internal workspace imports:
- `@beep/identity/packages` - Package identity annotations
- `@beep/schema` - Schema utilities (`BS.StringLiteralKit`, `BS.MappedLiteralKit`)

## Effect Patterns

This package follows repo-wide Effect conventions:

```typescript
// Namespace imports
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Match from "effect/Match";
import * as Data from "effect/Data";
import * as HashMap from "effect/HashMap";

// Tagged errors for parsing failures
class UnexpectedTokenError extends S.TaggedError<UnexpectedTokenError>()("UnexpectedTokenError", {
  expected: S.String,
  actual: S.String,
}) {}

// TaggedEnum for AST nodes
type Expression = Data.TaggedEnum<{
  NumberLiteral: { kind: NodeKind.NumberLiteral; value: number };
  Addition: { kind: NodeKind.Addition; left: Expression; right: Expression };
  // ...
}>;

// Option-based array access
const token = A.get(tokens, i);  // Returns Option<Token>

// Match for exhaustive handling
Match.value(char).pipe(
  Match.when(isDigit, () => { /* handle digit */ }),
  Match.when(isCapLetter, () => { /* handle letter */ }),
  Match.orElseAbsurd
);
```

## Usage Example

```typescript
import interpret from "@beep/ui-spreadsheet/interpreter";

// Cell value lookup function
const getCellValue = (key: string): number => {
  const cells = { A1: 10, B1: 20, C1: 30 };
  return cells[key] ?? 0;
};

// String input
interpret("Hello", getCellValue);
// { type: "string", value: "Hello" }

// Numeric input
interpret("42", getCellValue);
// { type: "number", value: 42 }

// Formula with cell references
interpret("=A1+B1*2", getCellValue);
// { type: "number", value: 50 }

// Invalid formula
interpret("=A1++", getCellValue);
// { type: "error" }
```

## Gotchas

### Formula Syntax
- Formulas MUST start with `=` to be evaluated as expressions
- Cell references are case-sensitive: `A1` works, `a1` does not
- Only single-letter columns supported: `A1` to `Z9`
- `REF("key")` syntax for arbitrary cell key lookups

### Effect Compliance
- NEVER use native array methods - use `A.map`, `A.get`, `A.findFirstIndex`
- NEVER use `switch` statements - use `Match.value` or node kind checks
- All errors extend `S.TaggedError` for typed error handling

### Client-Side Only
- `globalCursor.ts` and `canUseHotkeys.ts` access `document` - require `"use client"` directive
- `useInitialRender.ts` is a React hook - client component only

## Build & Test

```bash
bun run dev      # Watch mode TypeScript compilation
bun run build    # ESM + CJS + annotations build
bun run check    # Type checking
bun run test     # Run tests
bun run lint:fix # Biome formatting
```
