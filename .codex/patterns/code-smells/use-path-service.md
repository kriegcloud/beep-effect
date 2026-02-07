---
action: context
tool: (Edit|Write)
event: PostToolUse
name: use-path-service
description: Use Path service instead of direct Node.js path imports
glob: "**/*.{ts,tsx}"
pattern: (import\s+.*\s+from\s+['"]node:path['"]|import\s+.*\s+from\s+['"]path['"])
tag: use-effect-path
level: warning
---

# Use Path Service Instead of `path`

```haskell
-- Transformation
import "node:path"  :: Node → Path a    -- platform-coupled
import "path"       :: Node → Path a    -- same problem

-- Instead
Path               :: Effect Path Path  -- platform-agnostic
```

```haskell
-- Pattern
bad :: String → String → String
bad dir file = path.join dir file      -- R = Node

good :: String → String → Effect String Path
good dir file = do
  p ← Path.Path
  p.join dir file                      -- R ⊃ Path, portable

-- Path operations
join      :: [String] → Effect String Path
dirname   :: String → Effect String Path
basename  :: String → Effect String Path
extname   :: String → Effect String Path
resolve   :: String → Effect String Path
```

Direct `path` imports couple code to Node.js. Use `@effect/platform` Path for cross-platform path operations.
