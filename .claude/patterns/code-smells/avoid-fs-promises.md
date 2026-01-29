---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-fs-promises
description: Wrap fs/promises with Effect instead of using directly
glob: "**/*.{ts,tsx}"
pattern: (import\s+.*\s+from\s+['"]node:fs/promises['"]|import\s+.*\s+from\s+['"]fs/promises['"])
tag: wrap-fs-promises
level: warning
---

# Use FileSystem Service Instead of `fs/promises`

```haskell
-- Transformation
import "fs/promises"     :: Node → Promise a    -- platform-coupled, Promise-based
import "node:fs/promises" :: Node → Promise a   -- same problem

-- Instead
FileSystem              :: Effect a FileSystem  -- Effect-native, platform-agnostic
```

```haskell
-- Pattern
bad :: FilePath → Promise String
bad path = fsPromises.readFile path "utf-8"   -- Promise, not Effect

good :: FilePath → Effect String FileSystem
good path = do
  fs ← FileSystem.FileSystem
  fs.readFileString path                      -- Effect-native

-- If wrapping is necessary
wrap :: Promise a → Effect a Error
wrap promise = Effect.tryPromise \_ → promise
```

`fs/promises` returns Promises, not Effects. Use `@effect/platform` FileSystem for Effect-native file operations with typed errors.
