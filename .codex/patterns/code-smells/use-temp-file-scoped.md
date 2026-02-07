---
action: context
tool: (Edit|Write)
event: PostToolUse
name: use-temp-file-scoped
description: Use makeTempFileScoped/makeTempDirectoryScoped instead of os.tmpdir() or non-scoped variants
glob: "**/*.{ts,tsx}"
pattern: (import\s+.*\s+from\s+['"]os['"]|require\(['"]os['"]\)|os\.tmpdir\(\)|\.(makeTempFile|makeTempDirectory)\s*\()
tag: use-scoped-temp
level: warning
---

# Use Scoped Temp Files for Automatic Cleanup

```haskell
-- Transformation
os.tmpdir        :: IO FilePath              -- Node-coupled, manual cleanup
makeTempFile     :: Effect FilePath FS       -- manual cleanup required
makeTempFileScoped :: Effect FilePath (FS | Scope)  -- auto cleanup

-- Scoped resources
withTempFile :: (FilePath → Effect a) → Effect a
withTempFile use = scoped $ do
  path ← makeTempFileScoped { prefix: "myapp-" }
  use path
  -- auto cleanup on scope exit, even on error
```

```haskell
-- Pattern
bad :: Effect () FS
bad = do
  tmpFile ← makeTempFile
  writeFileString tmpFile "data"
  remove tmpFile                    -- might not run on error!

good :: Effect () (FS | Scope)
good = scoped $ do
  tmpFile ← makeTempFileScoped { prefix: "myapp-" }
  writeFileString tmpFile "data"
  -- auto removed when scope ends

-- Directories too
withTempDir :: Effect () (FS | Scope)
withTempDir = scoped $ do
  dir ← makeTempDirectoryScoped { prefix: "myapp-" }
  path ← join dir "file.txt"
  writeFileString path "data"
  -- entire dir removed when scope ends
```

`makeTempFileScoped` provides automatic cleanup via Effect's scope. Never use `os.tmpdir()` (Node-coupled) or unscoped variants (leak resources).
