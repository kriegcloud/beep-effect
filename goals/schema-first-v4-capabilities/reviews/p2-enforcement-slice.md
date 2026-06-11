# P2 Enforcement Slice

Date: 2026-06-08

## Completed

- `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts` now emits
  machine-readable `[schema-first:issue]` lines for current schema-first failure
  families:
  - inventory drift and enforced inventory candidates use rule id
    `schema-first-inventory`;
  - redundant inline `LiteralKit([... ] as const)` usage uses rule id
    `literal-kit-const-assertion`.
- `packages/tooling/tool/cli/src/commands/Yeet/internal/QualityIssueIndex.ts`
  parses those lines with `S.decodeUnknownOption(S.fromJsonString(...))` and
  maps them to structured Yeet issues:
  - category: `schema-first-policy`;
  - subcategory: schema-first rule id;
  - file, line, symbol, remediation, raw evidence, package attribution, and
    `schema-first-development` routing.
- Focused tests prove both sides:
  - `packages/tooling/tool/cli/test/lint-command.test.ts`;
  - `packages/tooling/tool/cli/test/yeet.test.ts`.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/lint-command.test.ts packages/tooling/tool/cli/test/yeet.test.ts
cd packages/tooling/tool/cli && bun run check
cd packages/tooling/tool/cli && bun run lint
bun run beep lint schema-first
```

All commands passed for this slice.

## Still Pending

- Implement the `SFV4-*` advisory rule cards one at a time.
- Add rule-specific fixtures before hard-failing any new advisory family.
- Run false-positive review after each rule before broad remediation.
