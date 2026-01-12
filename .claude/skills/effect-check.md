---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Effect Pattern Check Skill

Validate Effect pattern compliance in TypeScript/React code.

## When to Invoke

Invoke this skill when:
- Reviewing code for Effect pattern compliance
- Validating imports before committing changes
- Checking for native method usage violations
- Auditing Schema constructor casing

## MCP Server Prerequisites

**No MCP required.** This is a pure validation skill using Grep and Read tools.

---

## Critical Rules to Validate

### 1. Namespace Imports (REQUIRED)

```typescript
// CORRECT - Namespace imports
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

// WRONG - Named imports
import { map, filter } from "effect/Array";  // FORBIDDEN
import { Effect, Layer } from "effect";       // FORBIDDEN
```

### 2. Single-Letter Aliases (REQUIRED)

| Module | Alias | WRONG |
|--------|-------|-------|
| effect/Array | `A` | `Array`, `Arr` |
| effect/Option | `O` | `Option`, `Opt` |
| effect/Function | `F` | `Function`, `Fn` |
| effect/Record | `R` | `Record`, `Rec` |
| effect/Schema | `S` | `Schema` |
| effect/String | `Str` | `String` |
| effect/Number | `Num` | `Number` |
| effect/Predicate | `P` | `Predicate`, `Pred` |
| effect/Boolean | `Bool` | `Boolean` |
| effect/Brand | `B` | `Brand` |
| effect/SchemaAST | `AST` | `SchemaAST` |

### 3. Native Method Ban (CRITICAL)

```typescript
// FORBIDDEN - Native methods
array.map(x => x + 1)
array.filter(x => x > 0)
array.reduce((acc, x) => acc + x, 0)
array.find(x => x > 0)
array.some(x => x > 0)
array.every(x => x > 0)
array.includes(x)
array.indexOf(x)
array.slice(0, 5)
array.splice(0, 1)
array.concat(otherArray)
array.flat()
array.flatMap(x => [x])
array.join(", ")
array.reverse()
array.sort()
string.split(",")
string.toLowerCase()
string.toUpperCase()
string.trim()
string.replace("a", "b")
string.startsWith("x")
string.endsWith("x")
string.includes("x")

// REQUIRED - Effect utilities
A.map(array, x => x + 1)
A.filter(array, x => x > 0)
A.reduce(array, 0, (acc, x) => acc + x)
A.findFirst(array, x => x > 0)
A.some(array, x => x > 0)
A.every(array, x => x > 0)
A.contains(array, x)
A.findFirstIndex(array, x => x === target)
A.take(array, 5)
A.append(A.take(array, index), A.drop(array, index + 1))
A.appendAll(array, otherArray)
A.flatten(array)
A.flatMap(array, x => [x])
A.join(", ")(array)  // Note: curried
A.reverse(array)
A.sort(array, Order.string)
Str.split(string, ",")
Str.toLowerCase(string)
Str.toUpperCase(string)
Str.trim(string)
Str.replace(string, "a", "b")
Str.startsWith(string, "x")
Str.endsWith(string, "x")
Str.includes(string, "x")
```

### 4. PascalCase Schema Constructors (REQUIRED)

```typescript
// CORRECT - PascalCase
S.Struct({ name: S.String })
S.Array(S.Number)
S.String
S.Number
S.Boolean
S.Literal("active", "inactive")
S.Union(S.String, S.Number)
S.Optional(S.String)
S.NullOr(S.String)

// WRONG - lowercase
S.struct({ name: S.string })  // FORBIDDEN
S.array(S.number)              // FORBIDDEN
S.string                       // FORBIDDEN
S.number                       // FORBIDDEN
```

---

## Validation Workflow

### Step 1: Check for Native Array Methods

```bash
Grep({
  pattern: "\\.(map|filter|reduce|find|some|every|includes|indexOf|slice|concat|flat|flatMap|join|reverse|sort)\\(",
  path: "packages/",
  type: "ts",
  output_mode: "content"
})
```

### Step 2: Check for Native String Methods

```bash
Grep({
  pattern: "\\.(split|toLowerCase|toUpperCase|trim|replace|startsWith|endsWith)\\(",
  path: "packages/",
  type: "ts",
  output_mode: "content"
})
```

### Step 3: Check for Wrong Import Style

```bash
# Named imports from effect modules
Grep({
  pattern: "import \\{ .* \\} from [\"']effect/",
  path: "packages/",
  type: "ts",
  output_mode: "content"
})

# Wrong barrel imports
Grep({
  pattern: "from [\"']effect[\"']",
  path: "packages/",
  type: "ts",
  output_mode: "content"
})
```

### Step 4: Check for Wrong Aliases

```bash
# Non-standard aliases
Grep({
  pattern: "import \\* as (Array|Option|Function|Record|Schema|String|Number|Predicate) from",
  path: "packages/",
  type: "ts",
  output_mode: "content"
})
```

### Step 5: Check for Lowercase Schema Constructors

```bash
Grep({
  pattern: "S\\.(struct|array|string|number|boolean|literal|union|optional)\\(",
  path: "packages/",
  type: "ts",
  output_mode: "content"
})
```

---

## Fix Suggestions

### Native Method to Effect Utility

| Native | Effect | Notes |
|--------|--------|-------|
| `arr.map(fn)` | `A.map(arr, fn)` | First argument is array |
| `arr.filter(fn)` | `A.filter(arr, fn)` | |
| `arr.find(fn)` | `A.findFirst(arr, fn)` | Returns `Option<T>` |
| `arr.some(fn)` | `A.some(arr, fn)` | |
| `arr.every(fn)` | `A.every(arr, fn)` | |
| `arr.reduce(fn, init)` | `A.reduce(arr, init, fn)` | Arguments reordered |
| `arr.includes(x)` | `A.contains(arr, x)` | |
| `arr.length` | `A.length(arr)` | Function, not property |
| `arr.join(sep)` | `A.join(sep)(arr)` | Curried |
| `str.split(sep)` | `Str.split(str, sep)` | |
| `str.trim()` | `Str.trim(str)` | |
| `str.toLowerCase()` | `Str.toLowerCase(str)` | |
| `str.startsWith(x)` | `Str.startsWith(str, x)` | |

### Import Fixes

```typescript
// WRONG
import { map, filter } from "effect/Array";
// CORRECT
import * as A from "effect/Array";
// Then use: A.map(...), A.filter(...)

// WRONG
import { Effect } from "effect";
// CORRECT
import * as Effect from "effect/Effect";

// WRONG
import * as Array from "effect/Array";
// CORRECT
import * as A from "effect/Array";
```

### Schema Constructor Fixes

```typescript
// WRONG
S.struct({ name: S.string })
// CORRECT
S.Struct({ name: S.String })

// WRONG
S.array(S.number)
// CORRECT
S.Array(S.Number)
```

---

## Exemptions

### Allowed Native Methods

Some contexts allow native methods:

1. **JSON operations**: `JSON.stringify()`, `JSON.parse()`
2. **Console**: `console.log()`, `console.error()`
3. **Object methods**: `Object.keys()`, `Object.entries()` (though prefer `R.*`)
4. **Type guards**: Custom `is*` predicates
5. **Test files**: Test assertions and mocks

### Allowed Full Names

Some modules use full names by convention:

```typescript
import * as Effect from "effect/Effect";  // Full name OK
import * as Layer from "effect/Layer";    // Full name OK
import * as Context from "effect/Context"; // Full name OK
import * as Struct from "effect/Struct";   // Full name OK
import * as Cause from "effect/Cause";     // Full name OK
import * as DateTime from "effect/DateTime"; // Full name OK
import * as Match from "effect/Match";     // Full name OK
```

---

## Example Invocations

### Example 1: Audit Single File

**User request**: "Check if this file follows Effect patterns"

**Actions**:
1. Read the file
2. Search for native method usage
3. Verify import style
4. Report violations with line numbers
5. Suggest fixes

### Example 2: Audit Package

**User request**: "Audit @beep/ui for Effect pattern violations"

**Actions**:
1. Grep for native array methods
2. Grep for native string methods
3. Grep for wrong import styles
4. Grep for lowercase Schema constructors
5. Generate violation report with files and line numbers

---

## Report Format

```markdown
## Effect Pattern Audit Report

### Native Method Violations

| File | Line | Violation | Suggested Fix |
|------|------|-----------|---------------|
| `src/component.tsx` | 42 | `arr.map(...)` | `A.map(arr, ...)` |
| `src/utils.ts` | 15 | `str.split(",")` | `Str.split(str, ",")` |

### Import Violations

| File | Line | Violation | Suggested Fix |
|------|------|-----------|---------------|
| `src/service.ts` | 3 | Named import from effect | Use namespace import |

### Schema Constructor Violations

| File | Line | Violation | Suggested Fix |
|------|------|-----------|---------------|
| `src/schema.ts` | 10 | `S.struct(...)` | `S.Struct(...)` |

### Summary

- Total files checked: 45
- Files with violations: 3
- Total violations: 5
```

---

## Verification Checklist

- [ ] No native `.map()`, `.filter()`, `.reduce()` on arrays
- [ ] No native `.split()`, `.trim()`, `.toLowerCase()` on strings
- [ ] All Effect imports use namespace style (`import * as X from`)
- [ ] Standard single-letter aliases used (A, O, F, R, S, etc.)
- [ ] Schema constructors use PascalCase (S.Struct, S.Array, S.String)
- [ ] No named imports from effect modules
- [ ] No imports from `"effect"` barrel (use specific paths)
