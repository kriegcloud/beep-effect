---
action: context
tool: (Edit|Write)
event: PostToolUse
name: layer-in-definition-file
description: Live layers must be in .live.ts files, not VM definition files
glob: "src/vms/**/!(*.live|*.test).ts"
pattern: (export\s+(const|function)\s+\w+Live\b|export\s+const\s+\w+\s*=\s*Layer\.(scoped|effect|succeed)\()
tag: vm-file-split
level: high
---

# Layer in Definition File

```haskell
-- VM file split convention
data VMFiles = VMFiles
  { definition :: "FooVM.ts"          -- interface + Tag (no layers)
  , live       :: "FooVM.live.ts"     -- Layer + VMKey + re-exports
  }
```

```haskell
-- Anti-pattern: layer in definition file
bad :: "FooVM.ts"
bad = do
  export interface FooVM { ... }      -- ✓ correct here
  export class FooVMService ...       -- ✓ correct here
  export const FooVMLive = Layer...   -- ✗ belongs in FooVM.live.ts

-- Correct: layer in .live.ts
good :: "FooVM.ts"
good = do
  export interface FooVM { ... }
  export class FooVMService ...

good :: "FooVM.live.ts"
good = do
  import { FooVMService } from "./FooVM"
  export const FooVMLive = Layer.scoped(FooVMService, ...)
  export const FooVMKey = VMRuntime.key(FooVMService, FooVMLive)
```

Definition files (`FooVM.ts`) contain only the interface and Tag — no heavy imports. Live layers and VMKeys go in `FooVM.live.ts`.
