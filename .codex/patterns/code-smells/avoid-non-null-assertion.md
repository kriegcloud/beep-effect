---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-non-null-assertion
description: Avoid using ! non-null assertion operator
glob: "**/*.{ts,tsx}"
pattern: [\w\)\]]\!\s*[;\.\[\(]
tag: do-not-assert-non-null
level: warning
---

# Avoid Non-Null Assertion Operator `!`

```haskell
-- Transformation
bang :: a | Null → a        -- "trust me" → runtime crash on null
safe :: a | Null → Maybe a  -- explicit handling required

-- Instead
optional  :: a?.b           -- optional chaining
coalesce  :: a ?? default   -- nullish coalescing
option    :: Option a       -- Effect's optional type
guard     :: a → Maybe a    -- type guard proves existence
```

```haskell
-- Pattern
bad :: Map → Value
bad map = map.get("key")!         -- crash if key missing

good :: Map → Maybe Value
good map = Option.fromNullable (map.get "key")

-- Or with chaining
safe :: User → Maybe Email
safe user = user?.contact?.email ?? Nothing

-- With Schema for external data
validated :: Unknown → Either ParseError User
validated = Schema.decode userSchema
```

The `!` operator is "trust me, this isn't null"—if wrong, runtime crash. Use `?.`, `??`, `Option`, or type guards for safe null handling.
