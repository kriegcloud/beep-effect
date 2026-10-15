# Cache baseline review: schema-opaque-default closing PR

Date: 2026-10-15. Subjects: `//` and `@beep/repo-cli`.

## What changed

- New root task `//#lint:opaque-roundtrips` (`bun run beep lint opaque-roundtrips`), cached like its
  Lint Policy siblings. Its inputs are the test and source TypeScript files under `apps/`,
  `packages/` and `infra/`, every `tsconfig*.json`, `tsconfig.base.json` and the command source, so
  a change to any file the scan reads re-runs it.
- Adding the root script changes the root scripts digest, which every cached `//#` task hashes, so
  every root task shows `configuration-drift`. No task's command, inputs or outputs changed besides
  the new one.
- `@beep/repo-cli` gains the `opaque-roundtrips` lint subcommand and drops `schemaClassMissingBrand`
  from the declared-off tsgo rules.

## Review

- Task behaviour is unchanged for every existing root task; only the shared digest moved.
- The new task's input set covers the scan's reads (`root-tasks-turbo-inputs.test.ts` probes a
  nested source file, a test tsconfig, an infra test file and `tsconfig.base.json`).
- Qualification scope, profile and epoch are kept as recorded.
