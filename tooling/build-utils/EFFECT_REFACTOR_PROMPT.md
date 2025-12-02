# Effect-Based Refactoring Task for PWA Module

## Overview

The `tooling/build-utils/src/pwa/` directory contains a TypeScript port of the `next-pwa` library. The code currently uses native Node.js APIs and Promise-based patterns. Your task is to refactor all files in this directory to use Effect-based patterns consistent with the rest of the `beep-effect` monorepo.

**Status: All TypeScript type errors have been fixed. The code compiles successfully. You can proceed directly to the Effect refactoring.**

## Important Resources

1. **Use the `effect-docs` MCP tool** for looking up Effect documentation when you're unsure about APIs
2. **Read the `.d.ts` files** of Effect modules to understand available methods:
   - `node_modules/effect/dist/dts/Array.d.ts`
   - `node_modules/effect/dist/dts/String.d.ts`
   - `node_modules/effect/dist/dts/Record.d.ts`
   - `node_modules/effect/dist/dts/Struct.d.ts`
   - `node_modules/effect/dist/dts/Console.d.ts`
   - `node_modules/@effect/platform/dist/dts/FileSystem.d.ts`
   - `node_modules/@effect/platform/dist/dts/Path.d.ts`
3. **Look at existing examples in this repo** for patterns, especially:
   - `tooling/build-utils/src/` (other files in the same package)
   - `packages/*/infra/src/` (infrastructure layer implementations)
   - Search for `BunContext.layer` usage patterns

---

## Files to Refactor

The following files need Effect-based refactoring:

| File | Status | Notes |
|------|--------|-------|
| `src/pwa/types.ts` | ✅ Types only | No Effect changes needed - just type definitions |
| `src/pwa/default-cache.ts` | 🔄 Needs refactor | Replace native Array methods |
| `src/pwa/fallback.ts` | ⏸️ Skip | Runs in Service Worker context - keep vanilla JS |
| `src/pwa/register.ts` | ⏸️ Skip | Runs in browser context - keep vanilla JS |
| `src/pwa/build-custom-worker.ts` | 🔄 Needs refactor | FileSystem, Path, Console, webpack async |
| `src/pwa/build-fallback-worker.ts` | 🔄 Needs refactor | FileSystem, Path, Console, webpack async |
| `src/pwa/with-pwa.ts` | 🔄 Needs refactor | Main plugin - most changes needed |
| `src/pwa/index.ts` | ✅ Exports only | Update exports if signatures change |

---

## Refactoring Checklist

### 1. Replace Native Array Methods with `effect/Array`

```typescript
// Import
import * as A from "effect/Array";

// Before -> After mappings:
array.map(fn)           -> A.map(array, fn) OR pipe(array, A.map(fn))
array.filter(fn)        -> A.filter(array, fn) OR pipe(array, A.filter(fn))
array.find(fn)          -> A.findFirst(array, fn) // Returns Option<T>
array.some(fn)          -> A.some(array, fn)
array.every(fn)         -> A.every(array, fn)
array.forEach(fn)       -> A.forEach(array, fn)
array.reduce(fn, init)  -> A.reduce(array, init, fn) // Note: args reordered
array.includes(x)       -> A.contains(array, x)
array.length            -> A.length(array)
array.push(x)           -> A.append(array, x) // Returns new array (immutable)
array.unshift(x)        -> A.prepend(array, x)
[...arr1, ...arr2]      -> A.appendAll(arr1, arr2)
array.join(sep)         -> A.join(array, sep)
array.flatMap(fn)       -> A.flatMap(array, fn)
```

### 2. Replace Native String Methods with `effect/String`

```typescript
// Import
import * as Str from "effect/String";

// Before -> After mappings:
str.startsWith(x)       -> Str.startsWith(str, x)
str.endsWith(x)         -> Str.endsWith(str, x)
str.includes(x)         -> Str.includes(str, x)
str.replace(a, b)       -> Str.replace(str, a, b)
str.split(sep)          -> Str.split(str, sep)
str.trim()              -> Str.trim(str)
str.toLowerCase()       -> Str.toLowerCase(str)
str.toUpperCase()       -> Str.toUpperCase(str)
str.slice(start, end)   -> Str.slice(str, start, end)
str.length              -> Str.length(str)
`${a}${b}`              -> Str.concat(a, b) // or keep template literals for readability
```

### 3. Replace `Object.values/keys/entries` with Effect Equivalents

```typescript
// Import
import * as R from "effect/Record";
import * as Struct from "effect/Struct";

// Before -> After mappings:
Object.values(obj)      -> R.values(obj)
Object.keys(obj)        -> Struct.keys(obj) // Returns typed keys
Object.entries(obj)     -> R.toEntries(obj)
Object.fromEntries(arr) -> R.fromEntries(arr)
```

### 4. Replace Node.js File System with `@effect/platform/FileSystem`

```typescript
// Imports
import { FileSystem } from "@effect/platform";
import { BunContext } from "@effect/platform-bun";

// Before (Node.js):
import * as fs from "node:fs";
fs.existsSync(path)
fs.readFileSync(path)

// After (Effect):
// The function should return an Effect, and the caller provides the layer

import { Effect } from "effect";
import { FileSystem } from "@effect/platform";

const checkFileExists = (filePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.exists(filePath);
  });

const readFile = (filePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.readFileString(filePath);
  });

// When running:
import { BunContext } from "@effect/platform-bun";

Effect.runPromise(
  myEffect.pipe(Effect.provide(BunContext.layer))
);
```

### 5. Replace Node.js Path with `@effect/platform/Path`

```typescript
// Import
import { Path } from "@effect/platform";

// Before (Node.js):
import * as path from "node:path";
path.join(a, b)
path.dirname(p)
path.resolve(p)
path.posix.join(a, b)

// After (Effect):
const buildPath = Effect.gen(function* () {
  const path = yield* Path.Path;
  return path.join(a, b);
});

// For posix-style paths (URL paths), you may need to keep using path.posix
// or implement a helper
```

### 6. Replace `console.log` with `effect/Console`

```typescript
// Import
import * as Console from "effect/Console";

// Before:
console.log("> [PWA] message")
console.warn("> [PWA] WARNING: message")
console.error("> [PWA] ERROR: message")

// After:
Console.log("> [PWA] message")
Console.warn("> [PWA] WARNING: message")
Console.error("> [PWA] ERROR: message")

// These return Effect<void>, so use within Effect.gen or pipe
Effect.gen(function* () {
  yield* Console.log("> [PWA] message");
});
```

### 7. Replace Promise-Based Functions with Effect

```typescript
// Before:
async function doSomething(): Promise<string> {
  const result = await someAsyncOp();
  return result;
}

// After:
const doSomething = Effect.gen(function* () {
  const result = yield* someEffectOp;
  return result;
});

// For webpack callbacks, wrap in Effect.async or Effect.tryPromise:
const runWebpack = (config: Configuration) =>
  Effect.async<void, Error>((resume) => {
    webpack(config).run((error, stats) => {
      if (error || stats?.hasErrors()) {
        resume(Effect.fail(new Error("Build failed")));
      } else {
        resume(Effect.succeed(void 0));
      }
    });
  });
```

### 8. Replace crypto.createHash with Effect Patterns

```typescript
// The crypto module can stay as-is for now since it's synchronous
// But wrap it in Effect for consistency:
import * as crypto from "node:crypto";

const getRevision = (file: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFile(file);
    return crypto.createHash("md5").update(content).digest("hex");
  });
```

### 9. Replace `globbySync` with Effect-Based File Globbing

```typescript
// Option 1: Use Effect.trySync for synchronous operations
import { globbySync } from "globby";

const globFiles = (patterns: string[], options: object) =>
  Effect.trySync({
    try: () => globbySync(patterns, options),
    catch: (error) => new Error(`Glob failed: ${error}`),
  });

// Option 2: Use the async version with Effect.tryPromise
import { globby } from "globby";

const globFiles = (patterns: string[], options: object) =>
  Effect.tryPromise({
    try: () => globby(patterns, options),
    catch: (error) => new Error(`Glob failed: ${error}`),
  });
```

---

## Effect Service Pattern

When creating functions that need FileSystem/Path:

```typescript
import { Effect, Layer } from "effect";
import { FileSystem, Path } from "@effect/platform";

// Define the requirements type
type PWARequirements = FileSystem.FileSystem | Path.Path;

// Function signature shows requirements
const buildWorker = (options: BuildOptions): Effect.Effect<string, Error, PWARequirements> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    // ... implementation
  });
```

---

## Testing the Refactor

After each file refactor:

1. Run type check:
   ```bash
   bunx turbo run check --filter=@beep/build-utils
   ```

2. Run lint:
   ```bash
   bunx turbo run lint --filter=@beep/build-utils
   ```

3. Run lint fix if needed:
   ```bash
   bunx turbo run lint:fix --filter=@beep/build-utils
   ```

---

## Order of Operations

1. ✅ ~~Fix all type errors first~~ - **DONE**
2. ✅ `types.ts` - No changes needed (just type definitions)
3. 🔄 `default-cache.ts` - Replace Array methods with `effect/Array`
4. ⏸️ `fallback.ts` - **SKIP** (runs in Service Worker context)
5. ⏸️ `register.ts` - **SKIP** (runs in browser context)
6. 🔄 `build-custom-worker.ts` - FileSystem, Path, Console, webpack Effect wrapper
7. 🔄 `build-fallback-worker.ts` - Similar to above
8. 🔄 `with-pwa.ts` - Main plugin, largest file, most changes
9. 🔄 `index.ts` - Update exports if function signatures change

---

## Important Notes

1. **Don't break the public API** - The `withPWA` function signature should remain compatible with Next.js config
2. **Layer provision** - Consider whether to provide `BunContext.layer` internally or let consumers provide it
3. **Keep client-side code vanilla** - `register.ts` and `fallback.ts` run in browser/SW context and MUST stay vanilla JS
4. **Preserve webpack integration** - The webpack plugin callbacks need careful Effect wrapping
5. **Use `pipe` for data transformations** - Effect's pipe is great for chaining operations

---

## Example Patterns from This Repo

Search for these patterns in the codebase for reference:

```bash
# Find FileSystem usage
grep -r "FileSystem.FileSystem" packages/

# Find BunContext.layer usage
grep -r "BunContext.layer" .

# Find Effect.gen patterns
grep -r "Effect.gen" packages/

# Find Console usage
grep -r "Console.log\|Console.warn\|Console.error" packages/
```

---

## Final Verification

After completing all refactoring:

1. All type checks pass: `bunx turbo run check --filter=@beep/build-utils`
2. All lint checks pass: `bunx turbo run lint --filter=@beep/build-utils`
3. No `console.log` statements remain in refactored files (use `Console` from effect)
4. No native `Array` methods remain in refactored files (use `effect/Array`)
5. No native `Object.keys/values/entries` remain in refactored files (use `effect/Record` or `effect/Struct`)
6. No `fs.existsSync` or `fs.readFileSync` remain (use `@effect/platform/FileSystem`)
7. No `path.join` etc. remain in refactored files (use `@effect/platform/Path`)
8. `fallback.ts` and `register.ts` remain unchanged (client-side code)
