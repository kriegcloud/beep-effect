---
action: context
tool: (Edit|Write)
event: PostToolUse
name: prefer-match-type-over-value
description: Reusable or extracted Match.value trees should usually become Match.type or Match.tags
glob: "**/*.{ts,tsx}"
pattern: Match\.value\(
tag: prefer-match-type-over-value
level: warning
---

# Review `Match.value(...)`

```haskell
-- Transformation
valueMatch :: a → b
valueMatch = Match.value x ...                  -- concrete boundary value

typeMatch :: a → b
typeMatch = Match.type<a>().pipe ...           -- reusable matcher
```

```haskell
-- Pattern
review :: Host → Config
review host = Match.value host
  |> Match.when("localhost", local)
  |> Match.orElse(remote)

better :: Host → Config
better = Match.type<Host>().pipe(
  Match.when("localhost", local),
  Match.orElse(remote)
)
```

Keep `Match.value(...)` when you are matching a concrete local value at a boundary. When the matcher is reusable, extracted, or effectively the function body, prefer `Match.type<T>().pipe(...)` or `Match.tags(...)`.
