# Effect V4 Schema Capability Audit

This report condenses the parallel research pass over `.repos/effect-v4` and
the current repo usage scan.

## Repo Baseline

The repo is not asleep on schema-first basics. It already uses `S.Class`,
`LiteralKit`, annotations, defaults, transformations, tagged unions, and
`S.toEquivalence` in several packages.

Thin or missing usage patterns:

- `S.toArbitrary` in unit tests;
- schema arbitrary annotations, especially with realistic generators;
- `S.fromFormData`, `S.fromURLSearchParams`, `S.toCodecStringTree`;
- `SchemaRepresentation` as a generated-model/codegen bridge;
- direct `SchemaAST` analysis in schema-first enforcement;
- `SchemaGetter` optional/default/omit/forbidden transforms;
- standardized schema diagnostics outside form tooling;
- consistent use of schema-derived static APIs at branch and guard sites.

## SCHEMA.md

Important sections to mine during implementation:

- generation/tooling: `SCHEMA.md` around `5106+`;
- arbitraries and Faker examples: around `5556`, `5622`, `5650`, `5702`;
- representation/codegen: around `6005`, `6133`, `6167`;
- Standard Schema issues: around `6185`, `6218`, `6389`, `6431`;
- fallback middleware: around `6472+`.

Best opportunities:

- teach `S.toArbitrary` as the testing counterpart to schema-first modeling;
- seed Faker from FastCheck entropy when using Faker inside arbitrary
  annotations;
- use representation/codegen as a spike before generated driver rewrites;
- use Standard Schema issue formatting at boundaries;
- prefer schema middlewares/fallbacks over local plumbing.

## Schema.ts

High-leverage exports:

- `S.withConstructorDefault`, `S.withDecodingDefault*`;
- `S.toArbitrary`, `S.toArbitraryLazy`;
- `S.toEquivalence`, `S.toFormatter`;
- `S.fromFormData`, `S.fromURLSearchParams`, `S.toCodecStringTree`;
- `S.toIso`, `S.toDifferJsonPatch`, `S.flip`, `S.toType`, `S.toEncoded`;
- `S.Redacted`, `S.Result`, `S.tagDefaultOmit`;
- tagged union helpers and derived `.match` / `.guards`.

Implementation note: `S.Number` and `S.NumberFromString` decode `NaN` and
infinities. Use `S.Finite` / `S.FiniteFromString` and range checks when the
business domain requires operational numbers.

Tagged-union note: `S.toTaggedUnion(...)` and `S.TaggedUnion(...)` attach
`cases`, `guards`, `isAnyOf`, and `match` to the schema value. Prefer those
helpers over ad-hoc discriminator switches when branching on decoded values.

## LiteralKit And MappedLiteralKit

Repo-local `LiteralKit` is more than a literal union wrapper. It reuses
`effect/Schema` and adds `Options`, `Enum`, per-literal `is` guards,
`pickOptions`, `omitOptions`, `$match`, `thunk`, and `toTaggedUnion`.

`MappedLiteralKit` adds a transformed literal schema with `From`, `To`, `Pairs`,
and directional helpers. This is useful for protocol/code mappings where both
the encoded and decoded literal domains need guards and enum-like constants.

Implementation note: annotation and transformation rebuilds can drop local
helper properties unless they deliberately preserve or reattach statics. The
repo already has `SchemaUtils/withLiteralKitStatics` for this case.

## SchemaAST.ts

Useful for enforcement:

- class-aware detection via `SchemaAST.ClassTypeId`;
- encoded vs type-side views with `toType`, `toEncoded`, and `flip`;
- annotation resolution for identifier/description checks;
- template literal, record key, union, filter, and check metadata;
- schema-value inventory beyond syntactic imports.

This is the path to reduce false positives in schema-first lint.

## SchemaGetter.ts

Underused capabilities:

- `withDefault`, `required`, `transformOptional`;
- `onSome`, `onNone`, `omit`, `forbidden`;
- JSON/FormData/URLSearchParams string-tree getters;
- composed getter transforms and built-in coercion helpers.

Use these where optional/nullable object reshaping is currently hand-written.

## SchemaIssue.ts

Current repo strength: form tooling already uses
`makeFormatterStandardSchemaV1`.

Opportunity:

- promote a shared boundary diagnostics helper returning typed
  `{ path; message }` entries;
- format `SchemaError.issue` when using `SchemaIssue.makeFormatterStandardSchemaV1`;
- stop collapsing schema failures to unstructured `error.message` at service or
  CLI boundaries;
- keep redacted fields redacted before diagnostic rendering.

## SchemaParser.ts

Guidance:

- use `S.decodeUnknownEffect` / `S.encodeUnknownEffect` by default;
- reserve direct `SchemaParser` for internals or special parser-option work;
- document parse options such as `errors`, `onExcessProperty`,
  `propertyOrder`, `disableChecks`, and parser `concurrency`;
- keep sync throwing wrappers legacy/test-only.

## SchemaRepresentation.ts

No direct repo usage was found.

Potential:

- serialize schema documents and multi-documents;
- convert ASTs to JSON Schema documents;
- generate code documents;
- reconstruct schemas at runtime.

Recommended first move: spike on a small generated Box model subset. Do not
replace the generator wholesale until parity is proven.

Important limits: `SchemaRepresentation` is an intermediate representation, not
a lossless source-code round trip. Transformations are not reconstructed as the
original code, only supported checks are represented, annotations are filtered,
and declarations may need revivers. The current Box generator starts from SDK
TypeScript declarations, so a replacement would also need a validated source
conversion step before emitter parity matters.

## SchemaTransformation.ts

Opportunities:

- `S.decodeTo` with `SchemaTransformation.transform` / `transformOrFail`;
- key encoding with `S.encodeKeys`;
- `OptionFrom*` plus `transformOptional`;
- built-in `*From*` wrappers over ad-hoc string/number/date conversion;
- form/query/string-tree transformations at boundaries.

## SchemaUtils.ts

Upstream `SchemaUtils.ts` is intentionally small. Local helpers should remain
thin and justified.

Better local candidates than wrapping upstream internals:

- schema law-test helpers around arbitrary/equivalence;
- diagnostics helpers;
- cataloged default helpers such as `withKeyDefaults`;
- codegen/representation spike utilities if the Box experiment succeeds.

## Yeet Integration

The path already exists:

- `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts` includes the root
  `lint:schema-first` task via `bun run beep lint schema-first`.
- `packages/tooling/tool/cli/src/commands/Yeet/internal/Handler.ts` writes
  issue artifacts on failed verify/publish paths.
- `QualityIssueIndex.ts` already has a `schema-first-policy` category.

Therefore new checks should enter through schema-first lint first. Add richer
Yeet parsing only if the default issue packets are too raw.
