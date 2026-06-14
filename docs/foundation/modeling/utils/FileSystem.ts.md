---
title: FileSystem.ts
nav_order: 7
parent: "@beep/utils"
---

## FileSystem.ts overview

A module containing utilities for interacting with the file system.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [makeWaitForFile](#makewaitforfile)
---

# utilities

## makeWaitForFile

Creates a dual API helper that waits for the first file-system watch event
in `directory` whose basename matches `name`.

The returned function subscribes to `FileSystem.watch(directory)`, filters
events by exact file name, and resolves with the first matching
`WatchEvent`. If the watch stream ends before a match is observed, the
effect succeeds with `Option.none()`.

Supports both call styles:
- Data-first: `waitForFile("/tmp", "done.txt")`
- Data-last: `pipe("/tmp", waitForFile("done.txt"))`

**Example**

```ts
```typescript
import { Effect } from "effect"
import { makeWaitForFile } from "@beep/utils/FileSystem"

const program = Effect.gen(function* () {
  const waitForFile = yield* makeWaitForFile
  return yield* waitForFile("/tmp", "ready.txt")
})

console.log(program)
```
```

**Signature**

```ts
declare const makeWaitForFile: Effect.Effect<{ (directory: string, name: string): ReturnType<(directory: string, name: string) => Effect.Effect<Option<FileSystem.WatchEvent>, PlatformError, never>>; (name: string): (directory: string) => ReturnType<(directory: string, name: string) => Effect.Effect<Option<FileSystem.WatchEvent>, PlatformError, never>>; }, never, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/FileSystem.ts#L42)

Since v0.0.0