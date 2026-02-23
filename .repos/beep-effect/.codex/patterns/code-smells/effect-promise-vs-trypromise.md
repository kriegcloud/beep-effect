---
action: context
tool: (Edit|Write)
event: PostToolUse
name: effect-promise-vs-trypromise
description: Use Effect.tryPromise instead of Effect.promise for error handling
glob: "**/*.{ts,tsx}"
pattern: yield\*\s+Effect\.promise
tag: use-effect-trypromise
level: warning
---

# Use Effect.tryPromise Instead of Effect.promise

```haskell
-- Transformation
promise    :: IO (Promise a) → Effect a ∅        -- rejection = defect (uncatchable)
tryPromise :: IO (Promise a) → Effect a E        -- rejection = typed error (catchable)
```

```haskell
-- Pattern
bad :: Effect User ∅
bad = Effect.promise \_ → fetchUser id
  -- rejection becomes Defect: can't catch, crashes fiber

good :: Effect User FetchError
good = Effect.tryPromise
  { try:   \_ → fetchUser id
  , catch: \e → FetchError (show e)
  }
  -- rejection becomes typed error: catchable, testable

-- Error handling
handle :: Effect User FetchError → Effect User ∅
handle = catchTag "FetchError" \e → defaultUser

-- Defects bypass all handlers
defect :: Effect a ∅ → Effect a E
defect = id    -- can't recover from defects
```

`Effect.promise` converts rejections to uncatchable defects. Use `Effect.tryPromise` for typed, recoverable errors in the E channel.
