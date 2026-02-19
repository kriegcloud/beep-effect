---
action: context
tool: (Edit|Write)
event: PostToolUse
name: context-tag-extends
description: Avoid class *Tag extends Context.Tag and mismatched GenericTag naming
glob: "**/*.{ts,tsx}"
pattern: (class\s+\w+Tag\s+extends\s+Context\.Tag|Context\.GenericTag<\w+Service>)
tag: do-not-extend-context-tag
level: warning
---

# Avoid `class *Tag extends Context.Tag`

```haskell
-- Anti-pattern
class MyServiceTag extends Context.Tag    -- *Tag suffix = coupling smell
data MyServiceInterface = ...             -- separate interface = complexity

-- Instead
interface MyService = ...                 -- clean contract
MyService = Context.GenericTag<MyService> -- same name, declaration merging
```

```haskell
-- Pattern
bad :: Context.Tag
bad = class ParallelClientTag extends Context.Tag
  -- Tag suffix indicates unnecessary coupling
  -- interface probably named ParallelClientService
  -- two names for one concept

good :: Context.GenericTag
good = do
  interface ParallelClient { ... }        -- interface name
  ParallelClient = GenericTag<ParallelClient>("@parallel/ParallelClient")
  -- same name via declaration merging

-- Testing
mock :: Layer ParallelClient ∅
mock = Layer.succeed ParallelClient mockImpl   -- easy to mock

test :: Effect () ∅
test = program
  & provide mock                          -- swap implementation
```

Use `Context.GenericTag` with matching interface/tag names. Avoid `*Tag`/`*Service` suffixes—one name for one concept.
