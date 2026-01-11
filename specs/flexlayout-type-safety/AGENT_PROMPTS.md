# FlexLayout Type Safety — Agent Prompts

> Specialized prompts for sub-agents. Copy and customize these when deploying agents.

---

## Agent Selection Matrix

| Pattern Category | Primary Agent | Secondary Agent |
|------------------|---------------|-----------------|
| Schema validation, decode/encode | effect-schema-expert | effect-researcher |
| Type guards, narrowing | effect-predicate-master | effect-researcher |
| Array/string operations | effect-predicate-master | — |
| Option/Either handling | effect-predicate-master | effect-schema-expert |
| API lookup, idioms | effect-researcher | — |
| Complex type inference | effect-schema-expert | effect-predicate-master |

---

## 1. Analysis Prompts

### 1.1 Full File Analysis (effect-researcher)

```markdown
# File Analysis Request

Analyze `[FILE_PATH]` for type safety issues in the beep-effect monorepo.

## Context
This file is part of `packages/ui/ui/src/flexlayout-react/`, a layout library
being refactored to use Effect patterns.

## Required Imports Convention
```typescript
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as P from "effect/Predicate";
```

## Identify These Patterns

### Critical (Must Fix)
- [ ] `any` type usage
- [ ] Type assertions (`as SomeType`, `!` non-null assertion)
- [ ] Native array methods: `.map()`, `.filter()`, `.find()`, `.reduce()`, `.forEach()`
- [ ] Native string methods: `.split()`, `.includes()`, `.startsWith()`, `.endsWith()`
- [ ] Mutations to readonly properties
- [ ] `toJson()` methods without Schema validation

### High Priority
- [ ] Unchecked optional property access (`obj.prop` where prop may be undefined)
- [ ] Missing exhaustive checks in switch statements
- [ ] Empty catch blocks
- [ ] Implicit any in callbacks

### Medium Priority
- [ ] Type narrowing without predicates
- [ ] Manual null checks instead of Option
- [ ] String concatenation instead of template literals

## Output Format

```json
{
  "file": "[FILE_PATH]",
  "summary": {
    "critical": 0,
    "high": 0,
    "medium": 0
  },
  "issues": [
    {
      "id": "issue-1",
      "severity": "critical",
      "type": "native_array_method",
      "line": 42,
      "code": "items.map(x => x.id)",
      "fix": "A.map(items, x => x.id)",
      "agent": "effect-predicate-master"
    }
  ],
  "architecturalObservations": [
    {
      "category": "A1 | A2 | A3 | A4",
      "title": "Brief descriptive title",
      "lines": [15, 16, 17],
      "currentPattern": "Description of current approach",
      "issue": "Why this is suboptimal",
      "opportunity": "What could be done instead",
      "complexity": "Low | Medium | High",
      "dependencies": ["file1.ts", "file2.ts"],
      "notes": "Additional context for synthesis"
    }
  ],
  "recommendedAgent": "effect-schema-expert | effect-predicate-master",
  "notes": "Any special considerations for this file"
}
```

### Architectural Observation Categories (see RUBRICS.md for details)
- **A1**: Composition over inheritance opportunities
- **A2**: Discriminated unions for exhaustiveness & type-safety
- **A3**: Effect for error handling, debugging, tracing, telemetry, concurrency
- **A4**: Performance enhancement opportunities

## Do NOT
- Fix any issues (analysis only)
- Modify any files
- Make assumptions about missing context
```

### 1.2 Targeted Pattern Scan (effect-researcher)

```markdown
# Targeted Pattern Scan

Scan `[FILE_PATH]` specifically for: [PATTERN_TYPE]

## Pattern Details
[Describe the specific pattern to look for]

## Output
List all occurrences with line numbers and code snippets.
Recommend which agent should fix each occurrence.
```

---

## 2. Schema Expert Prompts

### 2.1 toJson() Validation Fix

```markdown
# Schema Validation for toJson()

Fix the `toJson()` method in `[FILE_PATH]` to use Effect Schema validation.

## Context
- The file contains a `toJson()` method that serializes model state
- Schema classes are defined in `./IJsonModel.ts`
- Current pattern uses unsafe type assertions

## Required Pattern

```typescript
import * as S from "effect/Schema";
import { [SchemaClass] } from "./IJsonModel";

toJson(): [SchemaClass] {
  const json: Record<string, unknown> = {};

  // Populate json object...
  this._attributes.toJson(json);

  // Validate with Schema
  return S.decodeUnknownSync([SchemaClass])(json);
}
```

## Available Schema Classes
- JsonModel
- JsonBorderNode
- JsonTabNode
- JsonTabSetNode
- JsonRowNode
- JsonRect
- JsonPopout

## Requirements
1. Change return type from interface to Schema class
2. Build intermediate object as `Record<string, unknown>`
3. Use `S.decodeUnknownSync` for validation
4. Preserve all existing serialization logic

## Verification
After fix, run: `bun run check && bun run build`
```

### 2.2 Schema Decode for External Data

```markdown
# Schema Decode for External Data

Add Schema validation for external/untrusted data in `[FILE_PATH]`.

## Location
Line [LINE]: `[CODE_SNIPPET]`

## Current (Unsafe)
```typescript
const data = JSON.parse(input) as SomeType;
```

## Required Pattern
```typescript
import * as S from "effect/Schema";
import { SomeSchema } from "./schemas";

const result = S.decodeUnknownEither(SomeSchema)(JSON.parse(input));
if (Either.isLeft(result)) {
  // Handle error
  return;
}
const data = result.right;
```

## Or with Option (for optional data)
```typescript
const data = S.decodeUnknownOption(SomeSchema)(JSON.parse(input));
if (O.isNone(data)) {
  // Handle missing/invalid
  return;
}
// Use data.value
```

## Requirements
1. Identify or create appropriate Schema
2. Use Either or Option based on error handling needs
3. Handle the failure case explicitly
```

### 2.3 Replace any with Schema

```markdown
# Replace any with Schema Validation

Remove `any` type at `[FILE_PATH]:[LINE]` using Schema validation.

## Current Code
```typescript
[CODE_SNIPPET]
```

## Analysis Questions
1. What is the expected shape of this data?
2. Where does this data come from?
3. What happens if validation fails?

## Fix Pattern

### For known structure:
```typescript
const DataSchema = S.Struct({
  field1: S.String,
  field2: S.Number,
});
type Data = S.Schema.Type<typeof DataSchema>;

const data = S.decodeUnknownSync(DataSchema)(input);
```

### For union types:
```typescript
const DataSchema = S.Union(
  S.Struct({ type: S.Literal("a"), value: S.String }),
  S.Struct({ type: S.Literal("b"), value: S.Number })
);
```

### For recursive types:
```typescript
interface TreeNode {
  value: string;
  children: TreeNode[];
}

const TreeNodeSchema: S.Schema<TreeNode> = S.Struct({
  value: S.String,
  children: S.Array(S.suspend(() => TreeNodeSchema)),
});
```
```

---

## 3. Predicate Master Prompts

### 3.1 Replace Native Array Methods

```markdown
# Replace Native Array Methods

Convert native array methods to Effect Array utilities in `[FILE_PATH]`.

## Required Import
```typescript
import * as A from "effect/Array";
```

## Conversions

| Native | Effect |
|--------|--------|
| `arr.map(fn)` | `A.map(arr, fn)` |
| `arr.filter(fn)` | `A.filter(arr, fn)` |
| `arr.find(fn)` | `A.findFirst(arr, fn)` (returns Option) |
| `arr.findIndex(fn)` | `A.findFirstIndex(arr, fn)` (returns Option) |
| `arr.some(fn)` | `A.some(arr, fn)` |
| `arr.every(fn)` | `A.every(arr, fn)` |
| `arr.reduce(fn, init)` | `A.reduce(arr, init, fn)` |
| `arr.forEach(fn)` | `A.forEach(arr, fn)` |
| `arr.includes(x)` | `A.contains(arr, x)` |
| `arr.indexOf(x)` | `A.findFirstIndex(arr, x => x === target)` |
| `arr.concat(other)` | `A.appendAll(arr, other)` |
| `arr.flat()` | `A.flatten(arr)` |
| `arr.flatMap(fn)` | `A.flatMap(arr, fn)` |

## Special Cases

### find() returns Option
```typescript
// Before (unsafe)
const item = items.find(x => x.id === id);
item.doSomething(); // Might be undefined!

// After (safe)
const item = A.findFirst(items, x => x.id === id);
if (O.isSome(item)) {
  item.value.doSomething();
}
// Or with pipe
pipe(
  A.findFirst(items, x => x.id === id),
  O.map(item => item.doSomething())
);
```

### Chained operations
```typescript
// Before
items.filter(x => x.active).map(x => x.name);

// After
pipe(
  items,
  A.filter(x => x.active),
  A.map(x => x.name)
);
```

## Locations to Fix
[List specific lines from analysis]

## Verification
After fix, run: `bun run check && bun run build`
```

### 3.2 Replace Native String Methods

```markdown
# Replace Native String Methods

Convert native string methods to Effect String utilities in `[FILE_PATH]`.

## Required Import
```typescript
import * as Str from "effect/String";
```

## Conversions

| Native | Effect |
|--------|--------|
| `str.split(sep)` | `Str.split(str, sep)` |
| `str.includes(sub)` | `Str.includes(str, sub)` |
| `str.startsWith(pre)` | `Str.startsWith(str, pre)` |
| `str.endsWith(suf)` | `Str.endsWith(str, suf)` |
| `str.trim()` | `Str.trim(str)` |
| `str.toLowerCase()` | `Str.toLowerCase(str)` |
| `str.toUpperCase()` | `Str.toUpperCase(str)` |
| `str.replace(a, b)` | `Str.replace(str, a, b)` |
| `str.replaceAll(a, b)` | `Str.replaceAll(str, a, b)` |
| `str.slice(s, e)` | `Str.slice(str, s, e)` |

## Locations to Fix
[List specific lines from analysis]
```

### 3.3 Add Option Handling

```markdown
# Add Option Handling for Nullable Access

Add proper Option handling for nullable property access in `[FILE_PATH]`.

## Required Import
```typescript
import * as O from "effect/Option";
```

## Patterns

### Direct property access
```typescript
// Before (unsafe)
const name = user.profile.name;

// After (safe)
const name = pipe(
  O.fromNullable(user.profile),
  O.map(p => p.name),
  O.getOrElse(() => "default")
);
```

### Optional chaining replacement
```typescript
// Before
const value = obj?.nested?.value ?? "default";

// After
const value = pipe(
  O.fromNullable(obj),
  O.flatMap(o => O.fromNullable(o.nested)),
  O.map(n => n.value),
  O.getOrElse(() => "default")
);
```

### Array find with Option
```typescript
// Before
const item = items.find(x => x.id === id);
if (item) {
  // use item
}

// After
pipe(
  A.findFirst(items, x => x.id === id),
  O.match({
    onNone: () => { /* handle missing */ },
    onSome: (item) => { /* use item */ }
  })
);
```

## Locations to Fix
[List specific lines from analysis]
```

### 3.4 Exhaustive Pattern Matching

```markdown
# Add Exhaustive Pattern Matching

Add exhaustive checks to switch statements in `[FILE_PATH]`.

## Required Import
```typescript
import * as Match from "effect/Match";
```

## Pattern

### Before (non-exhaustive switch)
```typescript
switch (action.type) {
  case "ADD":
    return handleAdd(action);
  case "REMOVE":
    return handleRemove(action);
  default:
    return state; // Silently ignores new cases!
}
```

### After (exhaustive match)
```typescript
return pipe(
  Match.value(action),
  Match.when({ type: "ADD" }, (a) => handleAdd(a)),
  Match.when({ type: "REMOVE" }, (a) => handleRemove(a)),
  Match.exhaustive // Compile error if cases missing!
);
```

### Alternative: Type-safe switch with never
```typescript
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

switch (action.type) {
  case "ADD":
    return handleAdd(action);
  case "REMOVE":
    return handleRemove(action);
  default:
    return assertNever(action.type); // Compile error if cases missing
}
```

## Locations to Fix
[List specific lines from analysis]
```

---

## 4. Researcher Prompts

### 4.1 Effect API Lookup

```markdown
# Effect API Lookup

Research the correct Effect API for: [OPERATION_DESCRIPTION]

## Context
- File: `[FILE_PATH]`
- Current code: `[CODE_SNIPPET]`
- Goal: [What we're trying to achieve]

## Questions
1. What is the idiomatic Effect way to do this?
2. Which module contains this functionality?
3. Are there any gotchas or common mistakes?

## Output
Provide:
1. The recommended API with import
2. Example usage
3. Any alternatives considered
```

### 4.2 Pattern Research

```markdown
# Pattern Research

Research Effect patterns for handling: [PATTERN_DESCRIPTION]

## Context
We need to handle [situation] in a type-safe way using Effect.

## Current Approach
```typescript
[CODE_SNIPPET]
```

## Requirements
- Must be type-safe
- Must follow Effect conventions
- Must handle errors explicitly

## Output
1. Recommended pattern with full example
2. Explanation of why this pattern
3. Any caveats or edge cases
```

---

## 5. Recovery Prompts

### 5.1 Fix Agent Failure

```markdown
# Retry with Additional Context

The previous fix attempt failed with:
```
[ERROR_MESSAGE]
```

## Original Issue
[Description of what we were trying to fix]

## Previous Attempt
```typescript
[CODE_THAT_FAILED]
```

## Additional Context
- The error occurs because: [analysis]
- Related types are defined in: [files]
- The constraint we missed: [constraint]

## Requirements
1. Address the specific error
2. Maintain the original fix intent
3. Ensure type safety

## Constraints
[Any specific constraints learned from the failure]
```

### 5.2 Partial Fix Completion

```markdown
# Complete Partial Fix

The previous agent made partial progress on `[FILE_PATH]`.

## Completed
- [x] [What was fixed]
- [x] [What was fixed]

## Remaining
- [ ] [What still needs fixing]
- [ ] [What still needs fixing]

## Context from Previous Session
[Any relevant notes or learnings]

## Continue from line [LINE]
```

---

## 6. Orchestrator Self-Prompts

### 6.1 Batch Planning

```markdown
# Plan Next Batch

## Completed So Far
[List of completed files with outcomes]

## Learnings Applied
[Key insights that should inform next batch]

## Next Batch Selection Criteria
1. Dependencies satisfied (no blocked files)
2. Similar pattern types (efficient agent use)
3. Build stability (verify after each)

## Candidate Files
[List files with their primary patterns]

## Selected Batch
[Files to process in this batch]
```

### 6.2 Handoff Generation

```markdown
# Generate Session Handoff

## Session Summary
- Files processed: X
- Issues fixed: Y
- Build status: Pass/Fail

## Completed Work
| File | Status | Agent Used | Notes |
|------|--------|------------|-------|
| ... | | | |

## In-Progress Work
| File | Current State | Next Steps |
|------|---------------|------------|
| ... | | |

## Learnings
### What Worked
- [Learning 1]

### What Didn't Work
- [Issue 1] → [Adjustment made]

### Prompt Improvements
[Any refinements to agent prompts]

## Next Session Tasks
1. [Specific task]
2. [Specific task]

## Verification State
Last successful build: [timestamp]
Pending lint fixes: Yes/No
```
