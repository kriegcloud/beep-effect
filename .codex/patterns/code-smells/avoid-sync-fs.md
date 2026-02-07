---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-sync-fs
description: Avoid synchronous filesystem operations
glob: "**/*.{ts,tsx}"
pattern: (readFileSync|writeFileSync|mkdirSync|readdirSync|statSync|existsSync|copyFileSync|unlinkSync|rmdirSync|renameSync|appendFileSync)\s*\(
tag: no-sync-fs
level: high
---

# Avoid Synchronous Filesystem Operations

```haskell
-- Transformation
readFileSync  :: FilePath → IO String     -- blocks event loop
writeFileSync :: FilePath → String → IO () -- same problem

-- Instead
readFileString  :: FilePath → Effect String FileSystem
writeFileString :: FilePath → String → Effect () FileSystem
```

```haskell
-- Pattern
bad :: FilePath → IO String
bad path = fs.readFileSync path "utf-8"   -- blocking, defeats async

good :: FilePath → Effect String FileSystem
good path = do
  fs ← FileSystem.FileSystem
  fs.readFileString path                  -- non-blocking, composable

-- Sync → Async mapping
readFileSync   → readFileString
writeFileSync  → writeFileString
mkdirSync      → makeDirectory
existsSync     → exists
unlinkSync     → remove
readdirSync    → readDirectory
```

Sync operations block the event loop. Use Effect's FileSystem service for async, composable file operations.
