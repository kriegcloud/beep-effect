# P1 Array Discovery Agent

## Your Mission

Scan the specified scope for native JavaScript Array method violations and produce a checklist document.

## Scope

You will be assigned ONE of these scopes:

- **Batch 1**: `nodes/`, `plugins/A*-F*`
- **Batch 2**: `plugins/G*-M*`
- **Batch 3**: `plugins/N*-Z*`
- **Batch 4**: `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level files

Base path: `apps/todox/src/app/lexical/`

## Target Patterns

Search for these native Array patterns:

### Method Calls on Arrays
```
\.map\(
\.flatMap\(
\.filter\(
\.find\(
\.findIndex\(
\.some\(
\.every\(
\.reduce\(
\.reduceRight\(
\.includes\(
\.indexOf\(
\.lastIndexOf\(
\.slice\(
\.concat\(
\.join\(
\.reverse\(
\.sort\(
\.splice\(
\.push\(
\.pop\(
\.shift\(
\.unshift\(
\.forEach\(
\.fill\(
\.copyWithin\(
\.flat\(
\.at\(
```

### Static Methods
```
Array\.isArray\(
Array\.from\(
Array\.of\(
```

### Property Access
```
\.length\s*===\s*0
\.length\s*!==\s*0
\.length\s*>\s*0
\.length\s*<\s*
```

### Spread Patterns (in array context)
```
\[\s*\.\.\.
```

## Replacement Reference

| Native | Effect Replacement | Import |
|--------|-------------------|--------|
| `.map(fn)` | `A.map(array, fn)` | `import * as A from "effect/Array"` |
| `.flatMap(fn)` | `A.flatMap(array, fn)` | |
| `.filter(pred)` | `A.filter(array, pred)` | |
| `.find(pred)` | `A.findFirst(array, pred)` | Returns `Option` |
| `.findIndex(pred)` | `A.findFirstIndex(array, pred)` | Returns `Option` |
| `.some(pred)` | `A.some(array, pred)` | |
| `.every(pred)` | `A.every(array, pred)` | |
| `.reduce(fn, init)` | `A.reduce(array, init, fn)` | Note: args reordered |
| `.reduceRight(fn, init)` | `A.reduceRight(array, init, fn)` | |
| `.includes(val)` | `A.contains(array, val)` | |
| `.indexOf(val)` | `A.findFirstIndex(array, x => x === val)` | |
| `.slice(start, end)` | `A.take`/`A.drop`/`A.slice` | |
| `.concat(arr2)` | `A.appendAll(array, arr2)` | |
| `.join(sep)` | `A.join(array, sep)` | |
| `.reverse()` | `A.reverse(array)` | |
| `.sort(cmp)` | `A.sort(array, Order)` | `import * as Order from "effect/Order"` |
| `.push(val)` | Reconstruct with `A.append` | Immutable preferred |
| `.length === 0` | `A.isEmptyReadonlyArray(array)` | |
| `Array.isArray(x)` | `A.isArray(x)` | |
| `Array.from(iter)` | `A.fromIterable(iter)` | |
| `[...a, ...b]` | `A.appendAll(a, b)` | |

## Output Format

Create a file at: `specs/lexical-effect-alignment/outputs/P1-discovery-[batch].md`

Use this exact format:

```markdown
# P1 Array Discovery - Batch [N]

## Summary
- Files scanned: [count]
- Violations found: [count]
- Unique files with violations: [count]

## Checklist

### [relative/path/to/file.ts]
- [ ] `apps/todox/src/app/lexical/relative/path/to/file.ts:42` - `.map()` - Replace with `A.map(array, fn)`
- [ ] `apps/todox/src/app/lexical/relative/path/to/file.ts:58` - `.filter()` - Replace with `A.filter(array, pred)`

### [another/file.tsx]
- [ ] `apps/todox/src/app/lexical/another/file.tsx:15` - `Array.isArray()` - Replace with `A.isArray(x)`
```

## Critical Rules

1. **NO CODE CHANGES** - Only produce the checklist
2. **EXACT LINE NUMBERS** - Use actual line numbers from source
3. **EXACT FILE PATHS** - Full path from repo root
4. **ONE ITEM PER VIOLATION** - Even if same line has multiple issues
5. **INCLUDE REPLACEMENT** - Always specify the Effect function to use
6. **SKIP FALSE POSITIVES** - Don't flag array methods on non-array types (e.g., string.split returns array but isn't an array method)

## Exclusions

Do NOT flag:
- TypeScript type annotations (e.g., `Array<T>`)
- Comments containing array methods
- String literals containing array method names
- Methods on non-array types that happen to share names

## Thoroughness

Set your exploration to "very thorough" - this is a comprehensive audit.
