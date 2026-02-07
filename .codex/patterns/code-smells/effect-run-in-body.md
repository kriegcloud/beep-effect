---
action: context
tool: (Edit|Write)
event: PostToolUse
name: effect-run-in-body
description: Effect.runSync/runPromise should only be at entry points
glob: "**/*.{ts,tsx}"
pattern: Effect\.run(Sync|Promise)
tag: effect-run-in-body
level: warning
---

# Effect.runSync/runPromise Only at Entry Points

```haskell
-- Transformation
runSync    :: Effect a E R → a        -- escapes Effect, loses composition
runPromise :: Effect a E R → Promise a -- same problem

-- Instead: compose until boundary
compose :: Effect a E R → Effect b E R → Effect (a, b) E R
yield*  :: Effect a E R → a           -- inside Effect.gen only
```

```haskell
-- Pattern
bad :: Effect () R
bad = do
  result ← pure $ Effect.runSync someEffect   -- breaks composition!
  doSomething result
  -- can't retry, race, timeout the inner effect

good :: Effect () R
good = do
  result ← someEffect                         -- still composable
  doSomething result
  -- can wrap entire program with retry, race, timeout

-- Entry points only
main :: IO ()
main = Effect.runMain program              -- ✓ application boundary

handler :: Request → IO Response
handler req = Effect.runPromise (handle req)  -- ✓ API boundary

test :: Spec
test = Effect.runPromise (testProgram)        -- ✓ test boundary
```

Running effects mid-logic breaks composition. Keep effects as values until entry points (main, handlers, tests).
