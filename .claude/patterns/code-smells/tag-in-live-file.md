---
action: context
tool: (Edit|Write)
event: PostToolUse
name: tag-in-live-file
description: VM service tags must be in definition files, not .live.ts files
glob: "src/vms/**/*.live.ts"
pattern: (extends\s+Context\.Tag\(|Context\.GenericTag<|class\s+\w+Service\s+extends)
tag: vm-file-split
level: high
---

# Tag Definition in .live.ts File

```haskell
-- VM file split convention
data VMFiles = VMFiles
  { definition :: "FooVM.ts"          -- interface + Tag (definitions here)
  , live       :: "FooVM.live.ts"     -- Layer + VMKey (imports tag)
  }
```

```haskell
-- Anti-pattern: tag defined in .live.ts
bad :: "FooVM.live.ts"
bad = do
  export class FooVMService extends Context.Tag(...) -- ✗ belongs in FooVM.ts
  export const FooVMLive = Layer.scoped(FooVMService, ...)
  export const FooVMKey = VMRuntime.key(FooVMService, FooVMLive)

-- Correct: tag in definition, imported by .live.ts
good :: "FooVM.ts"
good = do
  export class FooVMService extends Context.Tag(...)  -- ✓ correct here

good :: "FooVM.live.ts"
good = do
  import { FooVMService } from "./FooVM"              -- ✓ import tag
  export const FooVMLive = Layer.scoped(FooVMService, ...)
  export const FooVMKey = VMRuntime.key(FooVMService, FooVMLive)
```

Tags are the stable identity of a service. They belong in definition files where they have no heavy dependencies. The `.live.ts` file imports them.
