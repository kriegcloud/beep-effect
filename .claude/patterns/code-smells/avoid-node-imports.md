---
name: avoid-node-imports
description: Use @effect/platform abstractions instead of node: imports
event: PostToolUse
tool: (Edit|Write)
glob: "**/*.{ts,tsx}"
pattern: (from\s+['"]node:|require\s*\(\s*['"]node:)
action: context
level: warning
tag: use-effect-platform
---

# Use @effect/platform Instead of `node:` Imports

```haskell
-- Transformation
import "node:*"     :: Node -> IO a        -- platform-coupled, untestable

-- Instead
@effect/platform   :: Effect a R          -- platform-agnostic, testable
```

```haskell
-- Pattern
bad :: Node -> IO
bad = do
  fs <- "node:fs"                         -- R = Node
  child <- "node:child_process"           -- R = Node
  path <- "node:path"                     -- R = Node

good :: Effect a (FileSystem | CommandExecutor | Path)
good = do
  fs <- FileSystem.FileSystem             -- R = FileSystem
  executor <- CommandExecutor             -- R = CommandExecutor
  path <- Path.Path                       -- R = Path
```

Direct `node:` imports couple code to Node.js runtime. Use `@effect/platform` for cross-platform abstractions that work on Node, Bun, and browser.

**Platform module mappings:**

| `node:` import       | Effect Platform                     |
|----------------------|-------------------------------------|
| `node:fs`            | `FileSystem.FileSystem`             |
| `node:path`          | `Path.Path`                         |
| `node:child_process` | `Command` + `CommandExecutor`       |
| `node:http`          | `HttpClient.HttpClient`             |
| `node:stream`        | `Stream` from effect                |
| `node:readline`      | `Terminal.Terminal`                 |

**Exceptions:**
- Build scripts and tooling config (vite.config.ts, etc.)
- Platform-specific layers that implement services
