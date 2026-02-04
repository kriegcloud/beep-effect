# Phase 1 - Schema Foundation

Status: Source Dive Updated (Effect + SDK)

## Objectives
- Build full `Schema` coverage for all SDK types and tool inputs.
- Establish serializable vs runtime-only schemas and corresponding TypeScript types.
- Provide JSON Schema generation for `outputFormat` and tool metadata.
- Set schema export conventions used by all downstream phases.

## Scope
- `sdk.d.ts` types: Options, Query results, SDKMessage variants, Hook types, MCP configs, permission types, model/usage types, sandbox settings.
- `sdk-tools.d.ts` tool inputs: Agent, Bash, File, Glob/Grep, MCP, Notebook, Todo, WebFetch/WebSearch, AskUserQuestion, ConfigInput.
- Error model types (`Schema.TaggedError`) for wrapper-level failures.
- Schema export conventions and decode/encode helper patterns.

## SDK Surface Covered
- `SDKMessage`, `SDKResultMessage`, `SDKSystemMessage`, `SDKStatusMessage`, `SDKAuthStatusMessage`, `SDKToolProgressMessage`, `SDKTaskNotificationMessage`.
- `Options`, `PermissionMode`, `SettingSource`, `McpServerConfig`, `SandboxSettings`.
- Tool input schemas from `sdk-tools.d.ts`.

## Effect Modules to Apply
- `Schema`, `Schema.TaggedClass`, `Schema.Union`, `Schema.Record`, `Schema.UUID`.
- `JSONSchema.make` for output format and tool parameter schema.
- `ParseResult` for decode error modeling and tests.
- `Schema.parseJson` for `outputFormat` wiring and JSON Schema special-casing.
- `Schema.tag` and `Schema.TaggedStruct` for internal discriminated unions where `_tag` is acceptable.
- `Schema.declare` for foreign SDK types that cannot be modeled yet.
- `Schema.annotations` for JSON Schema metadata (`title`, `description`, `jsonSchema`).
- `Schema.instanceOf` for runtime-only types (`AbortController`, `McpServer`, callbacks).

## Effect Source Review Targets (Refine After Source Dive)
- `.reference/effect/packages/effect/src/Schema.ts`
- `.reference/effect/packages/effect/src/SchemaAST.ts`
- `.reference/effect/packages/effect/src/JSONSchema.ts`
- `.reference/effect/packages/effect/src/ParseResult.ts`
- `.reference/effect/packages/effect/schema-vs-zod.md`

## Source Dive Findings (Phase 1 Refinements)
- `Schema.TaggedClass` and `Schema.TaggedError` build classes around a `_tag` field and use `Schema.tag` to make `_tag` optional in `make`. For SDK unions keyed by `type` / `subtype`, prefer `Schema.Struct` with `Schema.Literal` fields instead of forcing `_tag`.
- `Schema.Struct.make` merges defaults and validates via `ParseResult.validateSync` unless validation is disabled. This can be leveraged when defining constructors for schema-backed classes.
- `Schema.Record` uses a type-literal with index signatures and is the correct mapping for SDK maps (e.g. `modelUsage`, `mcpServers`, `env`).
- `Schema.parseJson` uses a transformation tagged with `schemaId: ParseJsonSchemaId`. `JSONSchema.make` special-cases a top-level `parseJson` transformation to expose the target schema in JSON Schema generation. Use this when building `outputFormat` JSON schemas.
- `JSONSchema.make` defaults to draft-07 and `additionalPropertiesStrategy: "strict"`. If the SDK expects permissive objects, use `JSONSchema.fromAST` with `additionalPropertiesStrategy: "allow"` on a per-schema basis.
- `ParseOptions` support `errors: "all"`, `onExcessProperty: "ignore" | "error" | "preserve"`, `propertyOrder`, and `exact`. These can be attached via schema annotations (`parseOptions`) or passed at decode time to enforce stricter validation for tool inputs.
- `Schema.UUID` includes `jsonSchema` annotations (format + pattern), which we should reuse for SDK UUIDs.
- `Schema.annotations` supports `jsonSchema`, `parseOptions`, and `decodingFallback` hooks, which can be centralized for tool inputs and output-format schemas.
- `ParseResult` honors `decodingFallback` during decoding, enabling safe fallback parsing when SDK sends partial/unknown structures.
- `Schema.Defect` is a built-in transformation for serializing `Error`-like values; use it in SDK error types and permission denial surfaces.
- `Schema.NonEmptyArray` and array filters (`minItems`, `maxItems`, `itemsCount`) carry stable JSON Schema annotations, useful for `AskUserQuestion` constraints.
- `JSONSchema.fromAST` will throw for `Declaration` / unsupported types unless `jsonSchema` annotation is supplied. Use `jsonSchema: {}` overrides for runtime-only declarations when JSON Schema is required.
- `JSONSchema` uses identifier annotations for `$defs` and references; annotate exported schemas with `identifier` to stabilize generated schemas.

## API Conventions (Phase 1 Output)
- Each schema module exports `Schema`, `Type`, and `Encoded` aliases:
  - `export const SDKMessage = Schema.Union(...)`
  - `export type SDKMessage = typeof SDKMessage.Type`
  - `export type SDKMessageEncoded = typeof SDKMessage.Encoded`
- Use `Schema.Struct` for SDK record shapes; avoid `Schema.Class` unless a constructor/methods are required.
- Use `Schema.Union` of `Schema.Struct` with `type` / `subtype` literals for SDK discriminated unions.
- Attach `identifier` annotations to all exported schemas to ensure stable `$defs`.
- Group schemas by domain: `Schema/Options.ts`, `Schema/Message.ts`, `Schema/ToolInput.ts`, `Schema/Mcp.ts`, `Schema/Hooks.ts`, `Schema/Permission.ts`, `Schema/Sandbox.ts`, `Schema/Session.ts`, `Schema/Runtime.ts`, `Schema/Error.ts`.

## Decode Strictness Policy
- Tool input schemas: `parseOptions` with `onExcessProperty: "error"` and `exact: true` to reject unknown fields.
- SDK message schemas: `parseOptions` with `onExcessProperty: "preserve"` to avoid dropping future fields.
- Config schemas: default to `onExcessProperty: "error"` for safety.

## JSON Schema Policy
- Use `JSONSchema.make` for `outputFormat`.
- Use a `ToolJsonSchema` helper based on `JSONSchema.fromAST` (aligned with `@effect/ai/Tool.getJsonSchemaFromSchemaAst`) for tool parameter schemas.
- Prefer `JSONSchema.fromAST` with `additionalPropertiesStrategy: "allow"` for SDK message schemas (forward compatibility).
- Add `jsonSchema` overrides for `Schema.declare` / `Schema.instanceOf` when schema export must be JSON-serializable.

## Deliverables
- `src/Schema/*` modules for SDK types and tool inputs.
- `src/Errors.ts` with tagged errors and a union type.
- Schema tests covering roundtrip decode/encode for key types.
- `src/Schema/Annotations.ts` (optional) to centralize JSON Schema and parse option annotations.
- `src/Schema/Runtime.ts` (optional) for runtime-only types (`AbortController`, `McpServer`, callbacks) using `Schema.declare`.

## Exit Criteria
- All SDK types compile with schema-backed exports.
- Tool input schemas map 1:1 with `sdk-tools.d.ts`.
- JSON Schema generation works for sample tool definitions and output formats.
- Decode strictness rules are defined (tool inputs strict, SDK messages permissive).
- Schema export conventions adopted across modules.

## Risks and Open Questions
- Unknown SDK types (e.g., `BetaRawMessageStreamEvent`) may require `Schema.declare` placeholders.
- Need to decide strictness for optional fields vs permissive decode.
- Decide where to enforce `onExcessProperty: "error"` (tool inputs) vs default `ignore` (SDK messages).
- Decide whether to attach `decodingFallback` for partial message events or keep strict failure.
- Decide if any runtime-only types should be excluded from JSON Schema generation entirely.
