---
name: schema-first-development
description: >
  Focused schema-first guidance for this repo's effect/Schema and @beep/schema
  patterns. Use when adding or refactoring schemas, replacing exported
  interface/type data models, fixing schema-first lint violations, modeling
  literal domains or tagged unions, applying schema defaults or transformations,
  decoding external input, or reviewing schema code for repo-law compliance.
---

# Schema-First Development

Use this skill for schema-heavy work in this repository.

Treat schema-first rules as enforced repository law, not style preference.
The primary sources are:

- `standards/effect-first-development.md`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `standards/schema-first.inventory.jsonc`

Keep `Schema` as the source of truth for pure data models.

## Workflow

1. Classify the task.
- New schema or domain model
- Refactor from exported `interface` / type literal
- Boundary decode, transform, or defaulting work
- Literal domain or tagged union modeling
- Review or lint-fix

2. Load only the reference file you need.
- Repository laws: `references/repo-laws.md`
- Local shared schema primitives: `references/local-primitives.md`
- Pattern selection and anti-patterns: `references/pattern-catalog.md`
- Real repository examples: `references/examples.md`

3. Apply the laws in this order.
- Model pure data with `Schema` first.
- Prefer `S.Class` for object models unless a boundary exception makes
  `S.Struct` the better fit.
- Reuse `@beep/schema` and existing local schemas before inventing new checks.
- Move normalization, defaults, nullable handling, and JSON parsing into the
  schema.
- Annotate reusable schemas with `$I.annote(...)`.
- Derive guards, equivalence, and codecs from the schema instead of writing
  parallel helpers.

4. Verify before finishing.
- No exported pure-data `interface` or type literal remains.
- No schema value ends with `Schema`.
- Non-class schemas export same-name runtime type aliases.
- Tagged unions use the repo-preferred construction.
- JSON boundaries use schema codecs, not native JSON helpers.

## Fast Rules

- Prefer `import * as S from "effect/Schema"` and canonical Effect aliases.
- Create file-local identity composers with `@beep/identity/packages`.
- Prefer `S.Class` for object models and named intermediate schemas for reused
  concepts.
- Prefer `LiteralKit` when a literal domain needs `.is`, `.Enum`, `.thunk`,
  `$match`, or `.mapMembers(...)`.
- Use `S.toTaggedUnion("<field>")` for discriminators such as `kind`,
  `status`, `type`, or `subtype`.
- Use `S.TaggedUnion(...)` only for canonical `_tag` object unions.
- Use `S.OptionFromNullOr`, `S.OptionFromNullishOr`,
  `S.OptionFromOptionalKey`, and `S.OptionFromOptional` for absence at the
  boundary.
- Use `S.OptionFrom*` when the wire/schema field is optional or nullish. If
  runtime `Option` values are already being shaped into an object, prefer
  `R.getSomes({...})` for omission-style objects or `O.all({...})` for
  all-or-nothing fixed-shape composition.
- Use `S.withConstructorDefault(...)`, `S.withDecodingDefault(...)`, and
  `S.decodeTo(...)` with `SchemaTransformation` for normalization and fallback
  behavior.
- Prefer built-in schema constructors and checks before `S.makeFilter(...)`.
- If you need a custom reusable check, include `identifier`, `title`, and
  `description`.
- Use `S.is(schema)` for guards and `S.toEquivalence(schema)` for comparisons.
- Use `S.UnknownFromJsonString` or `S.fromJsonString(schema)` for JSON string
  boundaries.

## Escalation

- Use `effect-first-development` when the task is broader than schema work.
- Use `effect-services` or `effect-v4-services` for service and layer wiring.
- Use `effect-error-handling` or `effect-v4-errors` for recovery strategy and
  typed error flow outside schema modeling.
