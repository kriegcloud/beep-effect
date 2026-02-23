---
action: context
tool: (Edit|Write)
event: PostToolUse
name: yield-in-for-loop
description: Use Effect.forEach or STM.forEach instead of yield* in for loops
glob: "**/*.{ts,tsx}"
pattern: for\s*\([^)]*\)\s*\{[^}]*yield\s*\*
tag: use-foreach
level: warning
---

# Use `Effect.forEach` Instead of For Loops

```haskell
-- Transformation
for item in items { yield* process item }   -- imperative, not composable
forEach items process                        -- declarative, parallelizable

-- Operations
forEach  :: [a] → (a → Effect b) → Effect [b]
filter   :: [a] → (a → Effect Bool) → Effect [a]
traverse :: (a → Effect b) → [a] → Effect [b]
```

```haskell
-- Pattern
bad :: [Item] → Effect ()
bad items = for item ← items do
  yield* processItem item          -- imperative loop

good :: [Item] → Effect ()
good items = forEach items processItem

parallel :: [Item] → Effect ()
parallel items = forEach items processItem { concurrency: "unbounded" }

-- With filtering
filtered :: [Id] → Effect ()
filtered ids = do
  active ← filter ids (not <<< alreadyProcessed)
  forEach active process

-- Effectful predicate
effectfulFilter :: [User] → Effect ()
effectfulFilter users = do
  active ← Effect.filter users (checkUserStatus <<< _.id)
  forEach active sendNotification
```

For loops with `yield*` are imperative. `Effect.forEach` enables parallel execution, uniform error handling, and composition.
