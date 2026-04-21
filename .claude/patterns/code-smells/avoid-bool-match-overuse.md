---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-bool-match-overuse
description: Nested Bool.match trees usually hide flatter control flow
glob: "**/*.{ts,tsx}"
pattern: Bool\.match\([\s\S]{0,600}?Bool\.match\(
tag: flatter-bool-control
level: warning
---

# Review Nested `Bool.match(...)`

```haskell
-- Transformation
nestedMatch :: Bool → a
nestedMatch flag = Bool.match flag { ... Bool.match ... }   -- branching tree

flatControl :: Option a → a
flatControl = Option.getOrElse fallback <<< Option.liftPredicate predicate
```

```haskell
-- Pattern
bad :: Event → Ratio
bad event = Bool.match event.shiftKey
  { onFalse = base
  , onTrue  = Bool.match event.metaKey
      { onFalse = doubled
      , onTrue  = precise
      }
  }

good :: Event → Ratio
good event
  | event.shiftKey && (event.metaKey || event.ctrlKey) = precise
  | event.shiftKey                                     = doubled
  | otherwise                                          = base
```

Prefer the flattest equivalent control flow first. Keep `Bool.match(...)` when both branches do meaningful work, but review nested matcher trees for value selection, predicate lifting, or simpler branching.
