---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-object-type
description: Avoid using Object or {} as types
glob: "**/*.{ts,tsx}"
pattern: (?::\s*|=\s*)(Object|{})\s*(?=[,;\)\]\|&=<>\s\[])
tag: do-not-use-object-type
level: warning
---

# Avoid `Object` and `{}` as Types

```haskell
-- Transformation
object :: Object                  -- accepts nearly anything
empty  :: {}                      -- same problem, no structure

-- Instead
data User = User { id :: Int, name :: String }  -- explicit shape
record :: Record String a                       -- dictionary with known value type
unknown :: Unknown                              -- truly unknown, requires validation
```

```haskell
-- Pattern
bad :: Object → Effect ()
bad obj = doSomething obj         -- what fields? what types?

good :: User → Effect ()
good user = doSomething user      -- clear structure, IDE support

-- For unknown shapes
decode :: Unknown → Either ParseError User
decode = Schema.decode userSchema
```

`Object` and `{}` provide no type safety—they accept any non-null value. Use explicit types, `Record<K,V>`, `unknown`, or Schema for validation.
