---
action: context
tool: (Edit|Write)
event: PostToolUse
name: use-random-service
description: Use Random service instead of Math.random()
glob: "**/*.{ts,tsx}"
pattern: Math\.random\(\)
tag: use-effect-random
level: warning
---

# Use Random Service Instead of `Math.random()`

```haskell
-- Transformation
mathRandom :: IO Float              -- impure, non-deterministic
random     :: Effect Float Random   -- explicit dependency, testable

-- Random operations
next       :: Effect Float Random
nextInt    :: Effect Int Random
nextRange  :: (Int, Int) → Effect Int Random
shuffle    :: [a] → Effect [a] Random
```

```haskell
-- Pattern
bad :: IO Int
bad = floor (Math.random * 100)     -- R = ∅, untestable

good :: Effect Int Random
good = Random.nextIntBetween 0 100  -- R ⊃ Random, deterministic in tests

-- In tests
test :: Effect () TestRandom
test = do
  TestRandom.feedInts [42, 7, 13]   -- deterministic sequence
  result ← good
  assert (result == 42)
```

`Math.random()` is non-deterministic. Use `Random` service for reproducible randomness via `TestRandom.feed*` in tests.
