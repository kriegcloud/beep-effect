---
action: context
tool: (Edit|Write)
event: PostToolUse
name: use-clock-service
description: Use Effect DateTime instead of JS Date
glob: "**/*.{ts,tsx}"
pattern: (new Date\(|Date\.\w+\()
tag: use-effect-clock
level: warning
---

# Use Effect DateTime Instead of JS Date

```haskell
-- Transformation
newDate   :: IO Date              -- impure, non-deterministic
dateNow   :: IO Milliseconds      -- side effect, untestable

-- Instead
now       :: Effect DateTime R    -- R includes Clock
currentMs :: Effect Millis Clock  -- explicit dependency
```

```haskell
-- Pattern
bad :: IO Timestamp
bad = Date.now                    -- where R = ∅, untestable

good :: Effect Timestamp Clock
good = Clock.currentTimeMillis    -- where R ⊃ Clock, testable

-- In tests
test :: Effect () TestClock
test = do
  TestClock.adjust (minutes 5)    -- deterministic time
  result ← good
  assert (result == expected)
```

Direct `Date` usage is non-deterministic. Use `DateTime.now` or `Clock.currentTimeMillis` for testable time operations via `TestClock`.
