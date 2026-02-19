## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Annotations.namespace.ts` to replace generic runtime inspection/probe examples with executable annotation-focused examples.
- Kept the existing file shell/structure (`Export Coordinates`, `Example Blocks`, `Program`) and `BunRuntime.runMain(program)` entrypoint.
- Added concrete examples for:
  - Schema-level annotations with `Schema.annotate(...)` + `Schema.resolveInto(...)`.
  - Key-level annotations with `Schema.annotateKey(...)` and inspection of field context annotations in a `Struct`.
  - Annotation removal by setting a key to `undefined` and confirming the cleared result.
- Removed stale helper usage/imports (`inspectNamedExport`, `probeNamedExportFunction`) and `moduleRecord` after moving to semantic runtime examples.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Annotations.namespace.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- `Annotations` is a TypeScript namespace (type-level) and does not exist as a direct runtime value; the examples intentionally demonstrate its runtime companion APIs (`annotate`, `annotateKey`, `resolveInto`) instead.
- The key-annotation example inspects `ast` context for demonstrability; this is runtime-valid but tied to current AST shape.
