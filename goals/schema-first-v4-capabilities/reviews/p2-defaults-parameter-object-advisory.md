# P2 Defaults Parameter Object Advisory

Date: 2026-06-08

## Completed

- Implemented the first `SFV4-defaults` advisory slice in
  `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts`.
- The rule is AST-backed and intentionally narrow:
  - it only scans files with schema-default or schema-modeling signals such as
    `S.Class`, `S.Struct`, `S.TaggedClass`, `S.TaggedStruct`,
    `S.ErrorClass`, `S.TaggedErrorClass`, `withConstructorDefault`,
    `withDecodingDefault`, or `SchemaUtils.withKeyDefaults`;
  - it only flags non-empty object-literal defaults on option-like parameters
    named `options`, `params`, `config`, `request`, `args`, or `input`;
  - it does not flag empty option-bag defaults such as `options = {}`.
- Findings are inventoried as:
  - `kind`: `schema-policy-advisory`;
  - `status`: `advisory`;
  - `ruleId`: `SFV4-defaults`;
  - line and symbol metadata.
- Missing advisory inventory entries emit structured `[schema-first:issue]`
  warnings with rule-specific remediation toward `S.withConstructorDefault`,
  `S.withDecodingDefault*`, or `SchemaUtils.withKeyDefaults`.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/lint-command.test.ts
bun run beep lint schema-first
```

The focused fixture proves `params = { timeoutMs: 5000 }` in a schema-modeled
module emits a structured `SFV4-defaults` advisory, while
`params = WorkerOptions.make({})` with a schema-owned constructor default
produces no advisory.

The live repo currently reports:

```text
[schema-first] sfv4_defaults_advisories=0
```

## Still Pending

- Evaluate fallback object patterns beyond direct parameter defaults, such as
  `params === undefined ? defaultOptions : ...`, only after a low-noise AST
  matcher can distinguish schema-owned options from ordinary helper arguments.
- Keep empty object defaults out of this rule unless a future remediation phase
  proves they hide actual schema default drift.
