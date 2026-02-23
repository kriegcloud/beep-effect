---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-direct-json
description: Consider using Schema.parseJson instead of direct JSON methods
glob: "**/*.{ts,tsx}"
pattern: JSON\.(parse|stringify)\(
tag: prefer-schema-json
level: info
---

# Consider Schema.parseJson Instead of JSON Methods

```haskell
-- Transformation
jsonParse     :: String → Any           -- returns Any, can throw
jsonStringify :: a → String             -- no validation

-- Instead
parseJson     :: Schema a → String → Either ParseError a
encodeJson    :: Schema a → a → String
```

```haskell
-- Pattern
bad :: String → IO User
bad json = JSON.parse json        -- returns Any, throws on invalid

good :: String → Either ParseError User
good json = Schema.decodeSync (Schema.parseJson userSchema) json

-- Bidirectional
data UserSchema = Schema.Struct
  { id   :: Schema.Number
  , name :: Schema.String
  }

decode :: String → Either ParseError User
decode = Schema.decodeSync (Schema.parseJson UserSchema)

encode :: User → String
encode = Schema.encodeSync (Schema.parseJson UserSchema)
```

`JSON.parse` returns `any` and throws on invalid input. `Schema.parseJson` provides typed, validated parsing. Acceptable for simple logging/debugging.
