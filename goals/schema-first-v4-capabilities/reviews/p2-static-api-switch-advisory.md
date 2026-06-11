# P2 Static API Switch Advisory

Date: 2026-06-08

## Completed

- Implemented the first `SFV4-static-api` advisory slice in
  `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts`.
- The rule is AST-backed and intentionally narrow:
  - it only scans files with a schema static-helper signal such as
    `S.TaggedUnion`, `S.toTaggedUnion`, `LiteralKit`, or `MappedLiteralKit`;
  - it only flags `switch` statements whose expression is a likely schema
    discriminator such as `_tag`, `kind`, `status`, `type`, `mode`, `profile`,
    or `family`.
- Findings are inventoried as:
  - `kind`: `schema-policy-advisory`;
  - `status`: `advisory`;
  - `ruleId`: `SFV4-static-api`;
  - line and symbol metadata.
- Missing advisory inventory entries emit structured `[schema-first:issue]`
  warnings with rule-specific remediation, so Yeet can route them as
  `schema-first-policy` issues that tell agents to prefer schema-derived
  `.match`, `.guards`, `.cases`, or LiteralKit helpers.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/lint-command.test.ts
bun run beep lint schema-first
```

The focused fixture proves a module with `S.TaggedUnion` plus
`switch (event._tag)` emits a structured `SFV4-static-api` advisory, while a
module using `JobEvent.match(...)` produces no advisory.

The live repo currently reports:

```text
[schema-first] sfv4_static_api_advisories=0
```

## Still Pending

- Expand `SFV4-static-api` carefully beyond discriminator `switch` only after
  repo evidence proves low noise.
- Future slices should evaluate hard-coded literal option arrays, duplicate
  guard maps, duplicate constructor maps, and repeated decode/encode /
  arbitrary/equivalence helper constants.
