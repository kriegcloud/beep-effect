---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-any
description: Avoid using 'as any' or 'as unknown as' type assertions
glob: "**/*.{ts,tsx}"
pattern: as\s+(any|unknown\s+as)
tag: do-not-use-any
level: warning
---

# Avoid `as any` Type Assertions

```haskell
-- Transformation
asAny      :: a → Any       -- erases type, defeats compiler
asUnknown  :: a → Unknown   -- same problem with extra steps

-- Instead
decode     :: Schema a → Unknown → Either ParseError a
guard      :: (a → Bool) → a → Maybe a
generics   :: ∀ a. Constraint a ⇒ a → F a
```

```haskell
-- Pattern
bad  :: Unknown → T
bad x = x `as` T                    -- trust me bro

good :: Unknown → Either ParseError T
good x = Schema.decode schemaT x    -- prove it
```

Using `as any` bypasses type checking entirely. The `as unknown as T` pattern is equivalent—casting through `unknown` still erases type information.
