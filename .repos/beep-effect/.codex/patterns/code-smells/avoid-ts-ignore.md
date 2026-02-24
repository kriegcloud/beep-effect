---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-ts-ignore
description: Avoid using @ts-ignore or @ts-expect-error to silence type errors
glob: "**/*.{ts,tsx}"
pattern: @ts-(ignore|expect-error)
tag: do-not-silence-types
level: warning
---

# Avoid `@ts-ignore` and `@ts-expect-error`

```haskell
-- Anti-pattern
tsIgnore :: TypeError → ()    -- hide error, pray at runtime
tsExpect :: TypeError → ()    -- same with false confidence

-- Instead
fix        :: TypeError → Code → Code        -- address root cause
guard      :: Unknown → Maybe Known          -- runtime validation
schema     :: Schema a → Unknown → Either ParseError a
```

```haskell
-- Pattern
bad :: Effect a
bad = do
  -- @ts-ignore
  x ← brokenCode          -- compiler is wrong, right?

good :: Effect a
good = do
  x ← Schema.decode schema raw   -- prove correctness
```

Suppressing errors masks bugs that surface at runtime. Fix the underlying type issue instead.
