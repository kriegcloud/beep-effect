---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-direct-json
description: Use Effect Schema JSON codecs instead of direct JSON methods
glob: "**/*.{ts-morph,tsx}"
pattern: JSON\.(parse|stringify)\(
tag: prefer-schema-json
level: info
---

# Use Effect Schema JSON Codecs Instead of JSON Methods

```haskell
-- Transformation
jsonParse     :: String → Any           -- returns Any, can throw
jsonStringify :: a → String             -- no validation

-- Instead
decodeJsonEffect :: Schema a → String → Effect a SchemaError
encodeJsonEffect :: Schema a → a → Effect String SchemaError
decodeJsonResult :: Schema a → String → Result a Issue -- only for non-throwing sync helpers
```

```haskell
-- Pattern
bad :: String → IO User
bad json = JSON.parse json        -- returns Any, throws on invalid

good :: String → Effect User UserJsonError
good json =
  Schema.decodeUnknownEffect (Schema.fromJsonString User) json
    |> Effect.mapError toUserJsonError

-- Bidirectional
data User = Schema.Struct
  { id   :: Schema.Number
  , name :: Schema.String
  }

decode :: String → Effect User UserJsonError
decode json =
  Schema.decodeUnknownEffect (Schema.fromJsonString User) json
    |> Effect.mapError toUserJsonError

encode :: User → Effect String UserJsonError
encode user =
  Schema.encodeEffect (Schema.fromJsonString User) user
    |> Effect.mapError toUserJsonError
```

`JSON.parse` returns `any` and throws on invalid input. Schema JSON codecs provide typed, validated parsing. Prefer Effect codecs by default; use Result/Option codecs only for deliberate non-throwing synchronous helpers.
