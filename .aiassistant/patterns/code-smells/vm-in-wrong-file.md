---
action: context
tool: (Edit|Write)
event: PostToolUse
name: vm-in-wrong-file
description: View Model definitions must be in VM files, not React components
glob: "src/**/*.tsx"
pattern: (interface\s+\w+VM\s*\{|Context\.(Tag|GenericTag)[<(]|extends\s+Context\.Tag\(|Layer\.(effect|scoped)\(\s*\w+(VM|Service))
tag: vm-location
level: critical
---

# VM Code in Component File

```haskell
-- File structure convention
data VMFiles = VMFiles
  { definition :: "FooVM.ts"          -- interface + Tag
  , live       :: "FooVM.live.ts"     -- Layer + VMKey
  , component  :: "Foo.tsx"           -- pure renderer (no VM code)
  }
```

```haskell
-- Anti-pattern: VM code in component
bad :: "Foo.tsx"
bad = do
  interface FooVM { ... }             -- ✗ belongs in FooVM.ts
  FooVMService = Context.Tag(...)     -- ✗ belongs in FooVM.ts
  FooVMLive = Layer.scoped(...)       -- ✗ belongs in FooVM.live.ts

-- Correct: import from VM files
good :: "Foo.tsx"
good = do
  import { FooVMKey } from "./FooVM.live"
  const result = useVM(FooVMKey)
```

Components are pure renderers. VM interfaces and tags belong in `FooVM.ts`, layers and keys in `FooVM.live.ts`.
