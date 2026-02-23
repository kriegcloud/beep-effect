# @beep/ui-spreadsheet

Spreadsheet formula interpreter and utilities for beep-effect applications.

## Purpose

Provides a formula expression interpreter for spreadsheet-style calculations, including tokenization, parsing, and evaluation of mathematical expressions with cell references. Built with Effect patterns for type-safe error handling and data modeling.

## Installation

```bash
bun add @beep/ui-spreadsheet
```

## Key Exports

| Export | Description |
|--------|-------------|
| `interpreter` | Formula expression interpreter with tokenizer, parser, and evaluator |
| `utils/*` | Utility functions for spreadsheet interactions |

### Interpreter

The formula interpreter supports:

- **Arithmetic operations**: `+`, `-`, `*`, `/`, `%` (modulo), `^` (exponent)
- **Unary operators**: `+`, `-`
- **Cell references**: `A1`, `B2`, etc.
- **Reference syntax**: `REF("key")`
- **Cell ranges**: `A1:B5`
- **Parentheses**: `(1 + 2) * 3`

### Utilities

| Utility | Description |
|---------|-------------|
| `Numerical` | Schema for strings parseable as numbers |
| `CursorType` | Global cursor state management (`grabbing`, `resizing-column`, `resizing-row`, `scrubbing`) |
| `canUseHotkeys` | Check if hotkeys can be used based on active element |
| `appendUnit` | Append units to numeric values |
| `getIndexWithProperty` | Find index by property value |
| `shuffle` | Array shuffle utility |
| `useInitialRender` | Hook for initial render detection |

## Usage

### Formula Evaluation

```typescript
import interpreter from "@beep/ui-spreadsheet/interpreter";

// Simple expression
const result = interpreter("=1 + 2", () => 0);
// { type: "number", value: 3 }

// With cell references
const getCellValue = (key: string) => {
  if (key === "A1") return 10;
  if (key === "B1") return 5;
  return 0;
};

const result = interpreter("=REF(A1) + REF(B1)", getCellValue);
// { type: "number", value: 15 }

// Plain text (no formula)
const text = interpreter("Hello", () => 0);
// { type: "string", value: "Hello" }

// Numeric string
const num = interpreter("42", () => 0);
// { type: "number", value: 42 }
```

### Expression Result Types

```typescript
import type { ExpressionResult } from "@beep/ui-spreadsheet/interpreter";

// Three possible result types:
type ExpressionResult =
  | { type: "error" }
  | { type: "number"; value: number }
  | { type: "string"; value: string };
```

### Cursor Management

```typescript
import { CursorType, setGlobalCursor, removeGlobalCursor } from "@beep/ui-spreadsheet/utils/globalCursor";

// Set cursor during drag operation
setGlobalCursor("grabbing");

// Remove cursor when done
removeGlobalCursor("grabbing");
```

## Architecture

```
src/
├── interpreter/           # Formula interpreter
│   ├── tokenizer.ts       # Lexical analysis (string -> tokens)
│   ├── parser.ts          # Syntactic analysis (tokens -> AST)
│   ├── interpreter.ts     # AST evaluation
│   └── models/            # Token and expression types
│       ├── SyntaxKind.ts  # Token type definitions
│       └── Expression.ts  # AST node definitions (Data.TaggedEnum)
└── utils/                 # Spreadsheet utilities
    ├── isNumerical.ts     # Numerical string validation
    ├── globalCursor.ts    # Cursor state management
    ├── canUseHotkeys.ts   # Hotkey availability check
    └── ...
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/ui-core` | Theme primitives and UI foundations |
| `@beep/ui` | Shared UI components |
| `@beep/schema` | Schema utilities (BS helpers) |
| `@beep/identity` | Package identity for annotations |
| `effect` | Core Effect runtime and utilities |
| `lexical` | Rich text editor framework (peer) |
| `@lexical/*` | Lexical plugins (peer) |

## Development

```bash
# Type check
bun run check

# Build
bun run build

# Lint
bun run lint:fix

# Test
bun run test
```
