---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-expect-in-if
description: Avoid nesting expect() calls inside if blocks in tests
glob: "**/*.{test,spec}.{ts,tsx}"
pattern: if\s*\([^)]*\)\s*\{[^}]*expect\(
tag: use-assert-to-narrow
level: warning
---

# Avoid `expect()` Inside `if` Blocks

```haskell
-- Anti-pattern
testBad :: Effect ()
testBad = do
  result ← runTest
  if isJust (value result)           -- condition false → silently passes!
    then expect (name $ fromJust $ value result) `toBe` "test"
    else pure ()                     -- hidden skip

-- Pattern
narrow :: Maybe a → Effect a
narrow = assert "Expected value to be defined"

testGood :: Effect ()
testGood = do
  result ← runTest
  value  ← narrow (value result)     -- fails fast if Nothing
  expect (name value) `toBe` "test"  -- type narrowed, safe
```

```haskell
-- Transformation
if value then expect(value.x) else skip    -- ✗ silent skip
assert value; expect(value.x)               -- ✓ fail fast

-- Alternative
expect(value) `toBeDefined`
assert value                                -- narrow for TS
expect(value.name) `toBe` "test"
```

`if (x) { expect(x.y) }` silently passes when condition is false. Use `assert` to narrow types and fail fast.
