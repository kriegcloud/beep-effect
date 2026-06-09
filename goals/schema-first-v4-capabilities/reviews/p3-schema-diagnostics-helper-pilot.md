# P3 Schema Diagnostics Helper Pilot

Date: 2026-06-08

## Completed

- Added an internal laws-tooling helper at
  `packages/tooling/tool/cli/src/commands/Laws/SchemaDiagnostics.ts`.
- Replaced the local `AllowlistCheck.ts` hand-rolled formatter with the helper.
- Added focused test coverage in `allowlist-check.test.ts` proving:
  - Standard Schema V1 diagnostics keep path labels such as `entries.0.rule`;
  - redacted diagnostics preserve the path while removing the actual invalid
    value.

## Effect V4 Source Check

The local Effect v4 source documents
`SchemaIssue.makeFormatterStandardSchemaV1(...)` as the Standard Schema V1
formatter and shows that `SchemaError` wraps the real schema issue at
`error.issue`. The source tree also contains a `SchemaIssue.redact(...)`
implementation, but the installed package typings used by this repo do not
export that function. The pilot therefore uses public formatter hooks for
redacted CLI diagnostics instead of depending on an internal upstream export.

## Why Not A Public `@beep/schema` Helper Yet

The packet asks us to stop before casual public API changes. This pilot proves
the useful shape in one current call site without adding a new package export.
If more packages start hand-rolling the same formatting, promote this pattern to
`@beep/schema` or a focused repo utility with the same tests.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/allowlist-check.test.ts
cd packages/tooling/tool/cli && bun run check
cd packages/tooling/tool/cli && bun run lint
```

