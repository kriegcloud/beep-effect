# Pattern Catalog

Use this file to choose the repo-preferred schema pattern for the task.

## 1. Replace an Exported Pure-Data `interface`

Trigger:

- schema-first lint finding
- review note about duplicated type and runtime validation
- new domain payload proposal written as plain TS

Preferred replacement:

```ts
export class TaskInput extends S.Class<TaskInput>($I`TaskInput`)(
  {
    id: S.String,
    title: S.String,
    priority: S.Int,
  },
  $I.annote("TaskInput", {
    description: "Input payload for task creation.",
  })
) {}
```

Keep the schema value as the source of truth and derive types from it.

## 2. Build an Object Model

Default:

- `S.Class` for domain objects and reusable payloads

Boundary exception:

- `S.Struct` for plain shape composition when class construction adds nothing
- If you use `S.Struct`, export `type X = typeof X.Type`

## 3. Model Boundary Normalization and Defaults

Use this when:

- reading env/config values
- normalizing strings
- translating text or unknown input into typed values
- encoding fallback behavior directly in the schema

Preferred tools:

- `S.UndefinedOr(...)`
- `S.decodeTo(...)`
- `SchemaTransformation.transform(...)`
- `S.withConstructorDefault(...)`
- `S.withDecodingDefault(...)`
- `S.withDecodingDefaultKey(...)`

This pattern is preferred over manual parsing branches and fallback object
construction.

## 4. Model Absence as `Option`

Use the schema helpers that match the boundary shape.

- `OptionFromNullOr`: input may be `null`
- `OptionFromNullishOr`: input may be `null` or `undefined`
- `OptionFromOptionalKey`: object key may be absent
- `OptionFromOptional`: optional standalone field

Do not decode to `string | undefined` and convert later unless the boundary
truly requires it.

## 5. Model Reusable Literal Domains

Use `LiteralKit(...)` when the literal set needs any of:

- guards
- enums
- thunks
- member mapping
- direct annotation

Use a one-off literal union only when the value is genuinely local and no helper
surface is needed.

## 6. Model Tagged Unions

Use this split:

- `S.toTaggedUnion("field")` for discriminator fields such as `kind`, `type`,
  `status`, `subtype`, or `decision`
- `S.TaggedUnion(...)` only for `_tag`

Repo-preferred construction for reusable literal domains:

1. Define the literal kit.
2. Define member schemas, usually with `S.Class`.
3. Assemble members with `.mapMembers(...)`.
4. Finalize with `S.toTaggedUnion("field")`.

This is the high-signal repo style for discriminator-heavy modules.

## 7. Reuse Schema-Derived Runtime Helpers

When the schema already exists, derive helpers instead of duplicating the rule.

Use:

- `S.is(schema)` for guards
- `S.toEquivalence(schema)` for comparisons
- `S.decodeUnknown*` for decoders
- `S.encode*` for encoders

Avoid:

- hand-written `isX`
- duplicate comparison logic
- manual conversion helpers that restate schema behavior

## 8. Use JSON String Codecs

For JSON string boundaries:

- `S.UnknownFromJsonString` for unknown JSON payloads
- `S.fromJsonString(MySchema)` when the string should decode directly into a
  known domain schema

Avoid wrapping `JSON.parse` with Effect code unless a very unusual boundary
forces it.

## 9. Add Reusable Custom Checks

Before custom checks:

1. Look for an existing schema in `@beep/schema`.
2. Look for built-in constructors such as `S.NonEmptyString`,
   `S.NonEmptyArray`, `S.isPattern`, and `S.isIncludes`.
3. Only then use `S.makeFilter(...)` or `S.makeFilterGroup(...)`.

If the check is reusable, include:

- `identifier`
- `title`
- `description`
- user-facing `message`

## 10. Common Anti-Patterns and Replacements

- Exported data `interface`
  Replace with `S.Class` or annotated `S.Struct`
- `type X = { ... }` plus separate decoder
  Replace with one schema value and derived type alias
- `JSON.parse` / `JSON.stringify`
  Replace with schema JSON codecs
- Manual default object merging
  Replace with schema defaults and transforms
- Ad-hoc string predicates
  Replace with local shared schemas, built-in checks, or a reusable metadata-rich
  filter
- `S.Literals(...)` for a reusable internal domain
  Replace with `LiteralKit(...)`

## 11. Review Checklist

Before approving or shipping schema work, check:

- Is the schema the source of truth?
- Are defaults and normalization encoded in the schema?
- Are nullish and optional fields converted at the boundary?
- Does the code reuse local shared schema primitives?
- Are annotations present and meaningful?
- Are tagged unions built with the right discriminator helper?
- Are guards or comparisons derived instead of duplicated?
