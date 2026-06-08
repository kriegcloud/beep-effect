# P2 Equivalence Exported Helper Advisory

Date: 2026-06-08

## Completed

- Implemented the first `SFV4-equivalence` advisory slice in
  `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts`.
- The rule is AST-backed and intentionally narrow:
  - it only scans files with schema-modeling or schema-equivalence signals such
    as `S.Class`, `S.Struct`, `S.TaggedClass`, `S.TaggedStruct`,
    `S.ErrorClass`, `S.TaggedErrorClass`, `S.toEquivalence`,
    `S.overrideToEquivalence`, or `SchemaUtils.toEquivalence`;
  - it only flags exported variable declarations named exactly `equals`;
  - it only flags helpers whose initializer contains direct `===` or `!==`;
  - it ignores helpers already derived through `S.toEquivalence`,
    `SchemaUtils.toEquivalence`, or `S.overrideToEquivalence`.
- Findings are inventoried as:
  - `kind`: `schema-policy-advisory`;
  - `status`: `advisory`;
  - `ruleId`: `SFV4-equivalence`;
  - line and symbol metadata.
- Missing advisory inventory entries emit structured `[schema-first:issue]`
  warnings with rule-specific remediation toward `S.toEquivalence(schema)`,
  `SchemaUtils.toEquivalence(schema)`, or `S.overrideToEquivalence(...)` when
  schema semantics intentionally differ.
- Effect v4 source grounding:
  - `.repos/effect-v4/packages/effect/SCHEMA.md` documents
    `Schema.toEquivalence(schema)` as automatic structural equivalence and
    `overrideToEquivalence` as the custom-equivalence escape hatch;
  - `.repos/effect-v4/packages/effect/src/Schema.ts` exports
    `toEquivalence` and `overrideToEquivalence` in the Schema instances
    section.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/lint-command.test.ts
bun run beep lint schema-first --write
bun run beep lint schema-first
```

The focused fixture proves an exported manual `equals` helper in a schema-modeled
module emits a structured `SFV4-equivalence` advisory, while
`export const equals = S.toEquivalence(Model)` produces no advisory.

The live repo currently reports:

```text
[schema-first] sfv4_equivalence_advisories=0
```

The two original live advisories were remediated in P4 Wave 5:

- `packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts`:
  `equals`;
- `packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts`:
  `equals`.

## Still Pending

- Evaluate broader equality-helper names only after the exact `equals` slice
  proves low noise.
- Keep ordering predicates such as `isBefore` / `isAfter` out of this rule.
