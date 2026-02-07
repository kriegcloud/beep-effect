---
action: context
tool: (Edit|Write)
event: PostToolUse
name: vm-in-wrong-file
description: View Model definitions must be in .vm.ts files - detected VM pattern outside of proper location
glob: "**/!(*.vm).{ts,tsx}"
pattern: (interface\s+\w+VM\s*\{|Context\.GenericTag<\w*VM>|Layer\.(effect|scoped)\(\s*\w+VM)
tag: vm-location
level: critical
---

# VM Code in Wrong File

```haskell
-- File structure convention
data ComponentFiles = ComponentFiles
  { component :: "Component.tsx"      -- pure renderer
  , viewModel :: "Component.vm.ts"    -- VM definition
  , index     :: "index.ts"           -- re-exports
  }

-- VM file structure
data VMFile a = VMFile
  { interface :: Interface a          -- type contract
  , tag       :: GenericTag a         -- DI tag
  , layer     :: Layer a              -- implementation
  }
```

```haskell
-- Anti-pattern: VM in component file
bad :: "Component.tsx"
bad = do
  interface ComponentVM { ... }       -- ✗ wrong file
  ComponentVM = GenericTag<...>       -- ✗ wrong file
  layer = Layer.effect(...)           -- ✗ wrong file

-- Correct: VM in dedicated file
good :: "Component.vm.ts"
good = do
  interface ComponentVM { ... }       -- ✓ correct file
  ComponentVM = GenericTag<...>       -- ✓ correct file
  layer = Layer.effect(...)           -- ✓ correct file
  export default { tag, layer }       -- ✓ clean export

-- Import in component
import ComponentVM from "./Component.vm"
```

VMs must be in `.vm.ts` files. Mixing rendering and state management breaks organization. Invoke `react-vm` skill for guidance.
