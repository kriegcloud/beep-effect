---
action: context
tool: (Edit|Write)
event: PostToolUse
name: effect-catchall-default
description: Avoid Effect.catchAll returning defaults - often hides bugs
glob: "**/*.{ts-morph,tsx}"
pattern: Effect\.catchAll\(.*?=>\s*(Effect\.)?(succeed|sync)\(
tag: avoid-catchall-default
level: warning
---

# Avoid Effect.catchAll with Default Values

```haskell
-- Transformation
catchAll :: (E → Effect a) → Effect a E → Effect a ∅
catchAll _ default = \_ → succeed default    -- swallows all errors silently

-- Instead
catchTag  :: Tag → (E → Effect a) → Effect a E → Effect a (E - Tag)
catchTags :: {Tag₁: h₁, ...} → Effect a E → Effect a (E - Tags)
```

```haskell
-- Pattern
bad :: Effect User ∅
bad = pipe
  fetchUser
  $ catchAll \_ → succeed defaultUser    -- which error? why? 🤷

good :: Effect User (NetworkError | Timeout)
good = pipe
  fetchUser
  $ catchTag "NotFound" \_ → do
      log "User not found, creating..."
      createDefaultUser               -- explicit, logged, traceable

-- For expected absence
better :: Effect (Option User) NetworkError
better = pipe
  fetchUser
  $ Option.some                       -- Option, not error swallowing
  $ catchTag "NotFound" \_ → Option.none
```

`catchAll` with defaults hides bugs and loses context. Use `catchTag` for specific errors with logging, or `Option` for expected absence.
