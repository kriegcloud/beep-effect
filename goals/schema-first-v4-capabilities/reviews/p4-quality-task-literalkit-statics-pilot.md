# P4 Quality Task LiteralKit Statics Pilot

Date: 2026-06-08

## Completed

- Refactored repo-cli quality task literal domains in
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts` so the loaded
  quality adapter derives behavior from schema values instead of parallel
  membership arrays:
  - `QualityTaskName` now builds directly from `LiteralKit(...)`;
  - quality bypass flag names, lint policy subcommands, and root audit modes are
    modeled as local `LiteralKit` schemas;
  - membership checks use `S.is(...)` from those schemas;
  - quality task profile constants use `QualityTaskName.Enum`;
  - lint-specific parser branches use `QualityTaskName.is.lint(...)`.
- Kept the tiny duplicate lists in `bin-main.ts` out of this pilot because that
  file deliberately decides whether to lazy-load the full command tree. Moving
  those checks across the dynamic import boundary would trade a schema win for
  startup-path churn.

## Why This Matters

This is the first Wave 1 remediation that uses `LiteralKit` static surfaces in
live command-routing code rather than only documenting them. The important
pattern is not "replace every array." The pattern is: once a module already
loads the schema domain, use the schema's static helpers for canonical values
and guards so future changes update one source of truth.

It also gives future agents a concrete distinction:

- lazy entrypoint preflight can keep tiny string lists when importing the schema
  would defeat the optimization;
- loaded command modules should prefer `LiteralKit.Enum`, `LiteralKit.is`, and
  `S.is(schema)` over hand-written membership tests for schema-modeled
  domains.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/quality-tasks.test.ts
cd packages/tooling/tool/cli && bun run check
cd packages/tooling/tool/cli && bun run lint
bun run beep lint schema-first
bun run beep yeet verify --plan --json
```
