---
action: context
tool: (Edit|Write)
event: PostToolUse
name: review-option-match-flat-control
description: Review O.match trees for flatter Option control flow
glob: "**/*.{ts,tsx}"
pattern: (?:O|Option)\.match\(
tag: review-option-match-flat-control
level: info
---

# Review `O.match(...)` For Flatter Control Flow

```haskell
-- Transformation
matchOption :: Option a → b
matchOption = Option.match { onNone = fallback, onSome = project }

flatOption :: Option a → b
flatOption = Option.getOrElse fallback <<< Option.map project
```

```haskell
-- Pattern
bad :: Option User → Name
bad maybeUser = O.match maybeUser
  { onNone = anonymous
  , onSome = _.name
  }

good :: Option User → Name
good maybeUser = pipe(
  maybeUser,
  O.map(_.name),
  O.getOrElse(anonymous)
)
```

Keep `O.match(...)` when the branches do distinct work or different effects. Before keeping it, check whether `O.map(...)`, `O.flatMap(...)`, `O.liftPredicate(...)`, and `O.getOrElse(...)` would be flatter.
