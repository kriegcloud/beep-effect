# Examples

These examples are the best starting points for matching repo style.

## 1. Protocol Payloads and Literal Domains

File:

- `packages/tooling/tool/cli/src/commands/CreatePackage/FileGenerationPlanService.ts`

Use this file when you need:

- `LiteralKit` for a public literal domain
- `S.Class` payloads with strong annotations
- schemas fed directly into CLI and file-generation boundaries

What to copy:

- `RelativePlanPath` for annotated schema filters
- `PlannedFile` for a clean `S.Class` object model
- `GenerationActionKind` for annotated literal-kit usage

Why it matters:

- it keeps the schema value reusable across runtime validation and command
  declarations
- it demonstrates that even small protocol payloads stay schema-first

## 2. Config Normalization with Defaults in the Schema

File:

- `packages/tooling/tool/cli/src/commands/Graphiti/internal/ProxyConfig.ts`

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

- `packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts`

Use this file when you need:

- `OptionFromOptionalKey`
- boundary decoding with typed errors
- report-oriented schema classes

What to copy:

- `DocgenConfigDocument` for optional config fields
- `DocgenWorkspacePackage` for boundary data decoded from package metadata
- `DomainError` mapping around filesystem/process boundaries

Why it matters:

- optional transport fields become `Option` immediately
- typed errors remain explicit at the command boundary
- decode functions are passed directly into the boundary helper instead of
  creating a parallel shape model

## 4. Tagged Unions and Schema-Derived Helpers

File:

- `packages/tooling/tool/cli/src/commands/CreatePackage/FileGenerationPlanService.ts`

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

- `packages/tooling/tool/cli/src/commands/VersionSync/internal/Models.ts`
- `packages/tooling/tool/cli/src/commands/CreatePackage/TsMorphIntegrationService.ts`

Use this file when you need:

- a discriminator such as `category`, `mode`, `section`, or `kind`
- `LiteralKit + mapMembers + Tuple.evolve + S.toTaggedUnion(...)`
- schema-derived `.match` helpers for branch sites

What to copy:

- `VersionCategoryReport`
- `TsMorphMutation`

Why it matters:

- it demonstrates the repo's preferred construction for reusable literal
  domains that become tagged unions
- it keeps the case set anchored to the literal domain instead of a raw union

## Quick Selection Map

- Need a `S.Class` domain payload:
  Start with `packages/tooling/tool/cli/src/commands/CreatePackage/FileGenerationPlanService.ts`
- Need schema-driven defaults and transforms:
  Start with `packages/tooling/tool/cli/src/commands/Graphiti/internal/ProxyConfig.ts`
- Need `Option` boundary fields or schema-backed errors:
  Start with `packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts`
- Need a `kind` or `type` tagged union:
  Start with `packages/tooling/tool/cli/src/commands/CreatePackage/FileGenerationPlanService.ts`
  or `packages/tooling/tool/cli/src/commands/VersionSync/internal/Models.ts`
