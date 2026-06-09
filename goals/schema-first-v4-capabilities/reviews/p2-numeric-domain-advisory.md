# P2 Numeric Domain Advisory

Date: 2026-06-08

## Completed

- Implemented `SFV4-numeric-domain` as an AST-backed advisory inventory rule in
  `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts`.
- The rule scans schema field object literals under `S.Class`, `S.Struct`,
  `S.TaggedClass`, `S.TaggedStruct`, `S.ErrorClass`, and
  `S.TaggedErrorClass`.
- It flags fields whose tokenized names contain numeric-domain signals such as
  `timeout`, `count`, `size`, `rate`, `limit`, `ms`, or `seconds` when the
  initializer is broad `S.Number` or `S.NumberFromString`.
- Findings are inventoried as:
  - `kind`: `schema-policy-advisory`;
  - `status`: `advisory`;
  - `ruleId`: `SFV4-numeric-domain`;
  - line and symbol metadata.
- Missing advisory inventory entries emit structured `[schema-first:issue]`
  warnings, preserving Yeet parser compatibility from the first P2 slice.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/lint-command.test.ts packages/tooling/tool/cli/test/yeet.test.ts
cd packages/tooling/tool/cli && bun run check
bun run beep lint schema-first
```

The live repo currently reports:

```text
[schema-first] sfv4_numeric_domain_advisories=0
```

## Still Pending

- Implement the remaining `SFV4-*` advisory rule cards.
- Keep each rule fixture-backed and false-positive reviewed before broad
  remediation.
