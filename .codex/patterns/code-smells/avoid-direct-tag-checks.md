---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-direct-tag-checks
description: Avoid direct _tag property checks; use exported refinements/predicates
glob: "**/*.{ts,tsx}"
pattern: \._tag\s*===\s*["']
tag: use-type-predicates
level: warning
---

# Avoid Direct `_tag` Property Checks

```haskell
-- Transformation
directCheck :: Event → Bool
directCheck e = e._tag == "FactRecorded"   -- fragile, poor narrowing

-- Instead
$is   :: Tag → Event → Bool                -- from TaggedEnum
$match :: { Tag₁: h₁, Tag₂: h₂ } → Event → a  -- exhaustive matching
```

```haskell
-- Pattern
bad :: Event → Effect ()
bad e
  | e._tag == "FactRecorded" = handleFact e    -- manual check, fragile
  | otherwise                = pure ()

good :: Event → Effect ()
good = $match
  { FactRecorded:  handleFact
  , QuestionAsked: handleQuestion
  }                                            -- exhaustive, type-safe

-- Or with predicates
data Event = FactRecorded | QuestionAsked
  deriving TaggedEnum

isFactRecorded :: Event → Bool
isFactRecorded = $is "FactRecorded"

-- Refactoring-safe: rename tag in one place
```

Direct `_tag` checks don't narrow types correctly. Use `$is` for predicates or `$match` for exhaustive pattern matching via `Data.taggedEnum`.
