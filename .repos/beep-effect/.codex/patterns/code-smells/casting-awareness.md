---
action: context
tool: (Edit|Write)
event: PostToolUse
name: casting-awareness
description: Type assertions may indicate incorrect types
glob: "**/*.{ts,tsx}"
pattern: as\s+(?!const\b)\w+
tag: type-awareness
level: info
---

# Type Assertion Awareness

```haskell
-- Type assertion
cast :: a → b                     -- "trust me, I know better"

-- Before casting, check
redundant  :: a → a               -- already correct type (use LSP!)
narrowable :: ∀ a. Generic a ⇒ F a  -- use generics instead
guardable  :: a → Maybe b         -- runtime check for safety
decodable  :: Schema b → a → Either ParseError b  -- validate external data
```

```haskell
-- Pattern
suspicious :: Unknown → User
suspicious x = x `as` User        -- why is x Unknown?

investigate :: Effect ()
investigate = do
  actualType ← lsp.typeAt file line col    -- what is it really?
  case actualType of
    User → pure ()                -- cast was redundant
    _    → fix (sourceType actualType)     -- improve upstream types

-- Consider
withGenerics :: ∀ a. Decodable a ⇒ String → Effect a ParseError
withGenerics = Schema.decode schema       -- types flow correctly
```

Casts tell the compiler "trust me." Sometimes correct, often a signal that upstream types could be improved. Check with LSP first.
