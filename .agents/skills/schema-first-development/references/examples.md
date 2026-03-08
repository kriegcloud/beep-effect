# Examples

These examples are the best starting points for matching repo style.

## 1. Protocol Payloads and Literal Domains

File:

- `packages/runtime/protocol/src/index.ts`

Use this file when you need:

- `LiteralKit` for a public literal domain
- `S.Class` payloads with strong annotations
- schemas fed directly into HTTP or RPC surfaces

What to copy:

- `SidecarHealthStatus` for annotated literal-kit usage
- `SidecarBootstrap` for a clean `S.Class` object model
- `RunIdPathParams` for a small boundary schema that still gets full annotation

Why it matters:

- it keeps the schema value reusable across runtime validation and transport
  declarations
- it demonstrates that even small protocol payloads stay schema-first

## 2. Config Normalization with Defaults in the Schema

File:

- `tooling/cli/src/commands/Graphiti/internal/ProxyConfig.ts`

Use this file when you need:

- env or config decoding
- normalization from strings into booleans, numbers, or URLs
- default behavior encoded directly in the schema

What to copy:

- `makeDefaultedStringField`
- `makeDefaultedPositiveIntField`
- `makeDefaultedBooleanField`
- `GraphitiProxyConfig`

Why it matters:

- normalization lives in `S.decodeTo(...)` and `SchemaTransformation`, not in
  ad-hoc runtime branches
- constructor defaults and decoding defaults stay close to the field definition
- the final class schema becomes the single source of truth for config behavior

## 3. Optional Data and Typed Errors at a Boundary

File:

- `apps/desktop/src/native.ts`

Use this file when you need:

- `OptionFromOptionalKey`
- boundary decoding with typed errors
- a local nullable helper schema

What to copy:

- `ManagedSidecarState` for `OptionFromOptionalKey(...)`
- `DesktopNativeError` for `TaggedErrorClass`
- `NullableString` and the `invokeNative(...)` boundary for schema-driven decode
  use

Why it matters:

- optional transport fields become `Option` immediately
- typed errors remain schema-backed and serializable
- decode functions are passed directly into the boundary helper instead of
  creating a parallel shape model

## 4. Tagged Unions and Schema-Derived Helpers

File:

- `tooling/cli/src/commands/CreatePackage/FileGenerationPlanService.ts`

Use this file when you need:

- a discriminator field such as `kind`
- `S.toTaggedUnion(...)`
- schema-derived equivalence
- array defaults on class fields

What to copy:

- `GenerationActionKind` for an annotated literal domain
- `GenerationAction` for tagged-union assembly with `S.toTaggedUnion("kind")`
- `FileGenerationPlanInput` for defaulted collection fields
- `stringEquivalence` for `S.toEquivalence(...)`

Why it matters:

- it shows the repo preference for tagged unions over manual branching on
  free-form string fields
- it keeps helper logic derived from the schema instead of restating the rules

## 5. Transport-Style Tagged Unions Without `_tag`

File:

- `packages/ai/sdk/src/core/Schema/Mcp.ts`

Use this file when you need:

- a `type` discriminator rather than `_tag`
- composed struct members merged into a tagged union
- mixed optional and required fields in transport config schemas

What to copy:

- `McpExplicitServerConfig`
- `McpExplicitServerConfigWithInstance`

Why it matters:

- it demonstrates the repo's repeated use of `S.toTaggedUnion("type")`
- it is a good model when the transport shape is better expressed as annotated
  structs instead of class members

## Quick Selection Map

- Need a `S.Class` domain payload:
  Start with `packages/runtime/protocol/src/index.ts`
- Need schema-driven defaults and transforms:
  Start with `tooling/cli/src/commands/Graphiti/internal/ProxyConfig.ts`
- Need `Option` boundary fields or schema-backed errors:
  Start with `apps/desktop/src/native.ts`
- Need a `kind` or `type` tagged union:
  Start with `tooling/cli/src/commands/CreatePackage/FileGenerationPlanService.ts`
  or `packages/ai/sdk/src/core/Schema/Mcp.ts`
