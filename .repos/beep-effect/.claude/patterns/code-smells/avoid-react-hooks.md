---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-react-hooks
description: React hooks (useState, useEffect, useReducer, etc.) should be avoided - use View Models with Effect Atom instead
glob: "**/*.{ts,tsx}"
pattern: \b(useState|useEffect|useReducer|useCallback|useMemo|useRef|useLayoutEffect|useImperativeHandle|useDebugValue|useDeferredValue|useTransition|useId|useSyncExternalStore|useInsertionEffect)\s*[<(]
tag: avoid-react-hooks
level: high
---

# Avoid React Hooks - Use View Models

```haskell
-- Transformation
useState     :: a → (a, a → ())          -- scattered state, untestable
useEffect    :: (() → ()) → [a] → ()     -- cleanup error-prone

-- Instead: View Model pattern
data VM = VM
  { state$  :: Atom State               -- reactive state
  , action  :: () → Effect ()           -- effectful actions
  }

-- Component is pure renderer
component :: VM → JSX
component vm = useAtomValue (state$ vm)  -- only reads atoms
```

```haskell
-- Replacements
useState      → vmAtom :: Atom a
useEffect     → vmAction :: Effect ()
useCallback   → derivedAtom :: Atom (a → b)
useMemo       → derivedAtom :: Atom a
useRef (DOM)  → pass from parent ∨ VM trigger
useSearchParams → Atom.searchParam
useEffect (cleanup) → Atom.make with get.addFinalizer

-- Architecture
data Component = Component
  { view :: VM → JSX           -- pure renderer
  , vm   :: Layer VM           -- testable, injectable
  }

-- Invoke skill for implementation
invoke "react-vm"
```

React hooks scatter state across components. Use View Models: state in atoms, effects in actions, components as pure renderers.
