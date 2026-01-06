# Effect Patterns Review - create-slice CLI

## Summary

The create-slice CLI code demonstrates **excellent adherence** to Effect patterns overall. The codebase consistently uses `Effect.gen`, Effect Array utilities (`A.map`, `A.filter`, `A.join`, etc.), Effect String utilities (`Str.includes`, `Str.replace`, `Str.trimEnd`, etc.), and proper error handling with tagged errors. However, there are several notable violations and areas for improvement.

**Overall Assessment: Good with notable exceptions**

## Critical Issues

### 1. Native Array Methods Violations

#### file-generator.ts - Lines 994-1016 (createPlan function)
```typescript
const directories: string[] = [];
const files: GeneratedFile[] = [];

for (const layer of LAYERS) {
  // ...
  directories.push(layerDir);
  // ...
}
```
**Issue**: Uses mutable arrays with `.push()` instead of Effect Array utilities with immutable operations.

**Recommended Fix**: Refactor to use `A.flatMap` or accumulator pattern:
```typescript
const directories = F.pipe(
  LAYERS,
  A.flatMap((layer) => {
    const layerDir = path.join(sliceDir, layer);
    const base = [layerDir, path.join(layerDir, "src"), path.join(layerDir, "test")];
    // Add layer-specific dirs...
    return base;
  })
);
```

### 2. `for...of` Loops Instead of Effect Iteration

#### file-generator.ts - Lines 998-1016 (createPlan function)
```typescript
for (const layer of LAYERS) {
  const layerDir = path.join(sliceDir, layer);
  directories.push(layerDir);
  // ... more imperative mutation
}
```
**Issue**: Imperative `for...of` loop with mutable state should use `A.flatMap` or `Effect.forEach`.

#### handler.ts - Lines 77-81 (updateTsconfigBase)
```typescript
for (const layer of layers) {
  const pkg = `@beep/${sliceName}-${layer}`;
  newPaths[pkg] = [`./packages/${sliceName}/${layer}/src/index`];
  newPaths[`${pkg}/*`] = [`./packages/${sliceName}/${layer}/src/*`];
}
```
**Issue**: Imperative loop mutating `newPaths` object. Should use `A.reduce` or `R.fromEntries`:
```typescript
const newPaths = F.pipe(
  layers,
  A.flatMap((layer) => {
    const pkg = `@beep/${sliceName}-${layer}`;
    return [
      [pkg, [`./packages/${sliceName}/${layer}/src/index`]] as const,
      [`${pkg}/*`, [`./packages/${sliceName}/${layer}/src/*`]] as const,
    ];
  }),
  R.fromEntries
);
```

### 3. Native `Set` Usage Instead of `HashSet`

#### config-updater.ts - Lines 183-188
```typescript
const currentPaths = new Set(
  F.pipe(
    currentRefs,
    A.map((ref) => ref.path)
  )
);
```
**Issue**: Uses native `Set` instead of `effect/HashSet`.

**Recommended Fix**:
```typescript
import * as HashSet from "effect/HashSet";

const currentPaths = F.pipe(
  currentRefs,
  A.map((ref) => ref.path),
  HashSet.fromIterable
);

// Later usage:
A.filter((refPath) => !HashSet.has(currentPaths, refPath))
```

### 4. Switch Statement Violations

#### file-generator.ts - Lines 383-464 (generateSrcIndex function)
```typescript
switch (layer) {
  case "domain":
    return `...`;
  case "tables":
    return `...`;
  case "server":
    return `...`;
  case "client":
    return `...`;
  case "ui":
    return `...`;
  default:
    return `export {};\n`;
}
```
**Issue**: Uses native `switch` statement instead of `effect/Match`.

**Recommended Fix**:
```typescript
import * as Match from "effect/Match";

const generateSrcIndex = (layer: LayerName, context: SliceContext): string =>
  Match.value(layer).pipe(
    Match.when("domain", () => `/**
 * @beep/${context.sliceName}-domain
 * ...
 */`),
    Match.when("tables", () => `...`),
    Match.when("server", () => `...`),
    Match.when("client", () => `...`),
    Match.when("ui", () => `...`),
    Match.exhaustive
  );
```

### 5. Native `.exec()` and RegExp Without Predicate Utilities

#### ts-morph.ts - Lines 143-159 (parseBatches function)
```typescript
let match: RegExpExecArray | null;
while ((match = batchRegex.exec(text)) !== null) {
  // ...
}
```
**Issue**: Uses mutable `while` loop with `.exec()`. While regex operations are inherently imperative, the match extraction could use `Str.match` or similar.

#### ts-morph.ts - Lines 147-148
```typescript
const itemMatches = content.match(/"[^"]+"/g) ?? [];
```
**Issue**: Uses native string `.match()` instead of `Str.match`.

### 6. Spread Operator Array Mutations

#### handler.ts - Line 132
```typescript
const updatedRefs = [...references, newRef];
```
**Issue**: While this creates a new array, it's more idiomatic to use `A.append`:
```typescript
const updatedRefs = F.pipe(references, A.append(newRef));
```

#### config-updater.ts - Line 203
```typescript
const updatedRefs = [...currentRefs, ...refsToAdd];
```
**Issue**: Should use `A.appendAll`:
```typescript
const updatedRefs = F.pipe(currentRefs, A.appendAll(refsToAdd));
```

### 7. `O.fromNullable` + `O.isSome` Pattern

#### ts-morph.ts - Multiple locations (Lines 227, 384, 432, 448, etc.)
```typescript
if (O.isSome(O.fromNullable(batchMatch))) {
  // ...
  const existingContent = F.pipe(batchMatch![1] ?? "", Str.trimEnd);
}
```
**Issue**: This pattern is awkward. The `O.fromNullable` + immediate `O.isSome` check, followed by non-null assertion `!`, defeats the purpose of Option. Should use `O.match` or `O.getOrElse`:
```typescript
F.pipe(
  O.fromNullable(batchMatch),
  O.match({
    onNone: () => { /* skip */ },
    onSome: (match) => {
      const existingContent = F.pipe(match[1] ?? "", Str.trimEnd);
      // ...
    }
  })
);
```

## Recommendations

### 1. Add Missing Effect Imports

Some files could benefit from additional Effect module imports:
- `effect/Match` for switch statements
- `effect/HashSet` for Set operations
- `effect/DateTime` (not currently needed, but good to have awareness)

### 2. Replace Mutable Array Patterns

The `createPlan` function in `file-generator.ts` is the main offender. Refactor the directory and file generation to use:
- `A.flatMap` for generating collections
- Accumulator patterns with `A.reduce` if complex branching is needed

### 3. Consider Using `@beep/utils` No-ops

The codebase doesn't appear to use `nullOp`, `noOp`, or `nullOpE` from `@beep/utils`. No inline arrow functions like `() => null` were found that would require these, so this is compliant.

### 4. Error Handling Is Excellent

The codebase correctly uses:
- `Schema.TaggedError` patterns (`FileWriteError`, `TsMorphError`, `SliceExistsError`)
- `Effect.mapError` for error transformation
- `Effect.withSpan` for tracing

### 5. Effect.gen Usage Is Consistent

All effectful code uses `Effect.gen(function* () { ... })` pattern correctly. No `async/await` or bare Promises were found.

## File-by-File Analysis

### handler.ts

**Good Practices:**
- Proper Effect imports (`Effect`, `A`, `F`, `Console`)
- Uses `Effect.gen` consistently
- Proper error handling with `FileWriteError`
- Uses `Effect.withSpan` for tracing

**Issues:**
- Line 77-81: Imperative `for` loop mutating `newPaths` object
- Line 125-128: Uses `A.some` correctly, but line 132 uses spread instead of `A.append`
- Line 284: Uses `"=".repeat(50)` - this is fine, not a string method violation

**Line-specific issues:**
- Line 74: `const layers = ["domain", "tables", "server", "client", "ui"] as const;` - consider extracting as a shared constant

### index.ts

**Good Practices:**
- Proper Effect imports
- Uses `Effect.gen` for command handler
- Proper layer composition with `Layer.mergeAll`

**Issues:**
- Line 145-156: Uses `Either.isLeft` pattern which is fine, but could use `S.decodeUnknownEither` with `Either.match` for cleaner code

**No major violations found.**

### file-generator.ts

**Good Practices:**
- Excellent use of `A.map`, `A.join` throughout
- Proper `F.pipe` composition
- Uses `Effect.sync` for pure computations
- Service pattern with `Effect.Service` is correct

**Issues:**
- **Line 383-464**: Switch statement should use `Match.value().pipe(...)`
- **Line 994-1016**: Mutable arrays with `.push()` in `for...of` loop
- **Line 1022-1170**: Same pattern repeated for file generation
- **Line 1248**: `const lines: string[] = []` followed by spread operator

**Critical sections needing refactor:**
```typescript
// Lines 994-1016 - should become:
const directories = F.pipe(
  LAYERS,
  A.flatMap((layer) => generateLayerDirectories(sliceDir, layer))
);

const files = F.pipe(
  LAYERS,
  A.flatMap((layer) => generateLayerFiles(layerDir, layer, context))
);
```

### config-updater.ts

**Good Practices:**
- Excellent use of `F.pipe` throughout
- Proper `R.has` for record key checking
- Uses `A.filter`, `A.map`, `A.some` correctly
- Good use of `Effect.withSpan`

**Issues:**
- **Line 183-188**: Uses native `Set` instead of `HashSet`
- **Line 203**: Uses spread `[...currentRefs, ...refsToAdd]` instead of `A.appendAll`
- **Line 323**: Uses spread `[...workspaces, workspaceEntry]` instead of `A.append`

**Minor issues:**
- Line 255-256, 260-261: Uses ternary with `F.identity` which is idiomatic but verbose

### ts-morph.ts

**Good Practices:**
- Excellent use of `A.map`, `A.filter`, `A.flatMap`, `A.findFirst`, `A.contains`, `A.zip`
- Proper `O.Option` usage with `O.some`, `O.none`, `O.isNone`, `O.isSome`
- Good `Str.*` usage: `Str.slice`, `Str.trimEnd`, `Str.endsWith`, `Str.includes`, `Str.replace`, `Str.lastIndexOf`, `Str.isNonEmpty`
- Proper error tagging with `TsMorphError`

**Issues:**
- **Line 143-159**: Imperative `while` loop with `.exec()`
- **Line 147-148**: Native `.match()` instead of `Str.match`
- **Line 227, 384, 432, 448, 505, 521, 650**: Awkward `O.isSome(O.fromNullable(x))` + `x!` pattern
- **Lines 151-156**: Uses mutable array with `.push()` inside while loop

**Recommended refactor for parseBatches:**
```typescript
const parseBatches = (text: string): ReadonlyArray<BatchInfo> =>
  F.pipe(
    Str.matchAll(text, batchRegex),  // Hypothetical - may need custom impl
    A.map((match) => ({
      name: match[1]!,
      items: F.pipe(
        Str.match(match[2] ?? "", /"[^"]+"/g),
        O.getOrElse(() => [] as string[]),
        A.map((s) => F.pipe(s, Str.slice(1, -1)))
      ),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    }))
  );
```

### utils/index.ts

**No issues found.** Simple re-export file.

## Summary Table

| File | Effect Imports | Array Utilities | String Utilities | Error Handling | Match/Predicate | Issues Found |
|------|----------------|-----------------|------------------|----------------|-----------------|--------------|
| handler.ts | Good | Mostly Good | N/A | Excellent | Missing | 2 minor |
| index.ts | Good | Good | N/A | Good | N/A | 0 |
| file-generator.ts | Good | **Violations** | N/A | Excellent | **Missing** | 3 critical |
| config-updater.ts | Good | Mostly Good | N/A | Excellent | N/A | 3 minor |
| ts-morph.ts | **Excellent** | Mostly Good | **Excellent** | Excellent | N/A | 5 moderate |

## Priority Fixes

1. **HIGH**: Replace switch statement in `file-generator.ts` with `Match.value()`
2. **HIGH**: Refactor mutable array patterns in `file-generator.ts` `createPlan()`
3. **MEDIUM**: Replace native `Set` with `HashSet` in `config-updater.ts`
4. **MEDIUM**: Fix awkward `O.fromNullable` + `O.isSome` patterns in `ts-morph.ts`
5. **LOW**: Replace spread operators with `A.append`/`A.appendAll`
6. **LOW**: Replace imperative `for` loops with `A.map`/`A.flatMap` where possible
