---
path: packages/ui/spreadsheet
summary: Excel-style formula interpreter with tokenizer, parser, and AST evaluator using Effect patterns
tags: [ui, spreadsheet, formula, interpreter, parser, effect, ast]
---

# @beep/ui-spreadsheet

Spreadsheet formula interpreter and utility library for building spreadsheet-like UIs. Provides a complete expression evaluation pipeline (tokenizer, parser, interpreter) for Excel-style formulas using Effect patterns throughout.

## Architecture

```
|------------------|     |------------------|     |-----------------|
|  Formula String  | --> |    Tokenizer     | --> |     Tokens      |
|------------------|     |------------------|     |-----------------|
                                                          |
                                                          v
|------------------|     |------------------|     |-----------------|
| ExpressionResult | <-- |   Interpreter    | <-- |    AST (Parser) |
|------------------|     |------------------|     |-----------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/interpreter/tokenizer.ts` | Lexical analysis: formula strings to tokens |
| `src/interpreter/parser.ts` | Recursive descent parser building AST from tokens |
| `src/interpreter/interpreter.ts` | AST evaluator computing numeric results |
| `src/interpreter/models/Expression.ts` | AST node types via `Data.taggedEnum` |
| `src/interpreter/models/SyntaxKind.ts` | Token type definitions |
| `src/utils/globalCursor.ts` | DOM cursor state management |
| `src/utils/canUseHotkeys.ts` | Focus detection for keyboard shortcuts |
| `src/utils/isNumerical.ts` | Branded type for numeric strings |
| `src/utils/shuffle.ts` | Seeded array shuffle using Effect Random |

## Usage Patterns

### Formula Evaluation

```typescript
import * as Effect from "effect/Effect";
import interpret from "@beep/ui-spreadsheet/interpreter";

// Cell value lookup function
const getCellValue = (key: string): number => {
  const cells: Record<string, number> = { A1: 10, B1: 20, C1: 30 };
  return cells[key] ?? 0;
};

// String input - returns as-is
interpret("Hello", getCellValue);
// { type: "string", value: "Hello" }

// Numeric input
interpret("42", getCellValue);
// { type: "number", value: 42 }

// Formula with cell references (formulas start with =)
interpret("=A1+B1*2", getCellValue);
// { type: "number", value: 50 }

// Invalid formula
interpret("=A1++", getCellValue);
// { type: "error" }
```

### AST Node Pattern

```typescript
import * as Data from "effect/Data";
import * as Match from "effect/Match";

// Expression nodes use TaggedEnum
type Expression = Data.TaggedEnum<{
  NumberLiteral: { value: number };
  Addition: { left: Expression; right: Expression };
  CellRef: { key: string };
}>;

// Pattern matching for evaluation
const evaluate = (expr: Expression): number =>
  Match.value(expr).pipe(
    Match.tag("NumberLiteral", ({ value }) => value),
    Match.tag("Addition", ({ left, right }) => evaluate(left) + evaluate(right)),
    Match.tag("CellRef", ({ key }) => getCellValue(key)),
    Match.exhaustive
  );
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `Data.TaggedEnum` for AST | Type-safe exhaustive pattern matching on node kinds |
| `S.TaggedError` for parse errors | Typed error handling in Effect ecosystem |
| Effect utilities only | No native array/string methods per repo rules |
| Formulas start with `=` | Excel compatibility, distinguishes formulas from text |
| Single-letter columns only | A1:Z9 range simplifies parsing (extensible if needed) |

## Dependencies

**Internal**: `@beep/ui-core`, `@beep/ui`, `@beep/schema`, `@beep/identity`

**External**: `effect`, `@mui/material`, `@tanstack/react-form`, `lexical`, `react`

## Related

- **AGENTS.md** - Effect compliance rules, formula syntax details, gotchas
- **@beep/ui** - UI primitives for spreadsheet components
