# path

Use @effect/platform Path abstraction for cross-platform file path operations. Apply this skill when working with file paths, joining segments, resolving absolute paths, or converting between file URLs and paths to ensure portability across Node.js, Bun, and browser environments.

## Import Pattern

```typescript
import { Path } from "@effect/platform"
```

## Service Injection

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
})
```

## Path Separator

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

// Get platform-specific separator
const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const separator = path.sep // "/" on Unix, "\" on Windows
})
```

## Path Operations

### join - Combine path segments

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const fullPath = path.join("src", "components", "Button.tsx")
  // "src/components/Button.tsx" on Unix
  // "src\components\Button.tsx" on Windows
})
```

### resolve - Convert to absolute path

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const absolutePath = path.resolve("src", "index.ts")
  // "/Users/username/project/src/index.ts" on Unix
  // "C:\Users\username\project\src\index.ts" on Windows
})
```

### normalize - Clean up path

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const clean = path.normalize("/foo/bar//baz/asdf/quux/..")
  // "/foo/bar/baz/asdf"
})
```

### dirname - Get directory portion

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const dir = path.dirname("/foo/bar/baz.txt")
  // "/foo/bar"
})
```

### basename - Get file name

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const name = path.basename("/foo/bar/baz.txt")
  // "baz.txt"

  const nameWithoutExt = path.basename("/foo/bar/baz.txt", ".txt")
  // "baz"
})
```

### extname - Get file extension

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const ext = path.extname("/foo/bar/baz.txt")
  // ".txt"
})
```

### parse - Decompose path into components

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const parsed = path.parse("/home/user/dir/file.txt")
  // {
  //   root: "/",
  //   dir: "/home/user/dir",
  //   base: "file.txt",
  //   ext: ".txt",
  //   name: "file"
  // }
})
```

### format - Construct path from components

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const fullPath = path.format({
    root: "/",
    dir: "/home/user/dir",
    base: "file.txt"
  })
  // "/home/user/dir/file.txt"
})
```

### isAbsolute - Check if path is absolute

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const isAbs = path.isAbsolute("/foo/bar")
  // true on Unix
  const isRel = path.isAbsolute("foo/bar")
  // false
})
```

### relative - Get relative path

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const relPath = path.relative("/data/orandea/test/aaa", "/data/orandea/impl/bbb")
  // "../../impl/bbb"
})
```

## URL Conversions (Effectful)

Both operations can fail with `BadArgument` error.

### fromFileUrl - Convert file URL to path

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const filePath = yield* path.fromFileUrl("file:///home/user/file.txt")
  // "/home/user/file.txt" on Unix
  // "C:\home\user\file.txt" on Windows
})
```

### toFileUrl - Convert path to file URL

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const path = yield* Path.Path
  const fileUrl = yield* path.toFileUrl("/home/user/file.txt")
  // URL object with href "file:///home/user/file.txt"
})
```

## Complete Example

```typescript
import { Path } from "@effect/platform"
import { Effect } from "effect"

const buildOutputPath = Effect.gen(function* () {
  const path = yield* Path.Path

  // Join segments
  const srcPath = path.join("src", "index.ts")

  // Resolve to absolute
  const absoluteSrc = path.resolve(srcPath)

  // Get directory and basename
  const dir = path.dirname(absoluteSrc)
  const base = path.basename(absoluteSrc, ".ts")

  // Build output path
  const outputPath = path.join(dir, "..", "dist", `${base}.js`)

  // Normalize
  return path.normalize(outputPath)
})
```

## DO

- Import Path from @effect/platform
- Use `path.sep` for platform-specific separators
- Use `path.join()` to combine path segments
- Use `path.resolve()` to get absolute paths
- Handle errors from `fromFileUrl` and `toFileUrl` with Effect error handling

## DON'T

- Import `node:path` directly (breaks portability)
- Hardcode "/" or "\\" separators
- Manually concatenate paths with string operations
- Assume file URL format without using conversion utilities
