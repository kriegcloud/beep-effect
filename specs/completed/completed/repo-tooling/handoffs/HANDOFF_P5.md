# Phase 5 Handoff: CLI Hardening & Issue Remediation

**Date**: 2026-02-20  
**Status**: Ready for Phase 5 implementation

## Why Phase 5 Exists

Phase 4 extracted reusable `create-package` services, but a comprehensive CLI review surfaced blocking hardening gaps that must be resolved before spec closeout:

1. `create-package` fails from built `dist` because template assets are not shipped/copied.
2. `topo-sort` emits numeric index suffixes due callback arity misuse.
3. Critical error-path coverage is missing (`tsconfig-sync --filter` miss, cycle detection, `codegen` no-modules branch).
4. Remaining style-convention drift exists in core paths (`Map`/`Set`/native `.sort` usage where Effect collections/orders are expected).

## Phase 5 Objective

Close all known implementation defects and enforcement gaps so `tooling/cli` is production-stable, dist-runnable, and green across quality gates without manual follow-up edits.

## Required Work Items

1. Fix dist template runtime:
   - Ensure `create-package` templates are available from `dist/commands/create-package/templates`.
   - Ensure packaging metadata includes required template assets for publish/install flow.
   - Add a regression test or smoke assertion that verifies template resolution from built output.
2. Fix `topo-sort` output contract:
   - Remove index leakage and emit package names only (one per line).
   - Add/adjust test coverage for output format.
3. Close missing branch coverage:
   - Add `tsconfig-sync` test for unmatched `--filter` (`TsconfigSyncFilterError`).
   - Add `tsconfig-sync` test for cycle detection (`TsconfigSyncCycleError`).
   - Add `codegen` test for empty-module scenario (`No modules found to export.`).
4. Resolve convention drift in touched files:
   - Replace native `Map`/`Set`/array `.sort` patterns with Effect-first alternatives where required by project rules.
   - Keep behavior unchanged while refactoring.
5. Run and pass full verification gate:
   - `bun run build`
   - `bun run check`
   - `bun run test`
   - `bun run lint`
6. Update reflection log with Phase 5 learnings.

## Suggested File Targets

- `tooling/cli/src/commands/create-package/handler.ts`
- `tooling/cli/src/commands/create-package/template-service.ts`
- `tooling/cli/src/commands/topo-sort.ts`
- `tooling/cli/src/commands/tsconfig-sync.ts`
- `tooling/cli/src/commands/codegen.ts`
- `tooling/cli/package.json`
- `tooling/cli/test/topo-sort.test.ts`
- `tooling/cli/test/tsconfig-sync.test.ts`
- `tooling/cli/test/codegen.test.ts`
- `specs/completed/repo-tooling/REFLECTION_LOG.md`

## Verification Gate

```bash
bun run build
bun run check
bun run test
bun run lint
```

Additional smoke checks:

```bash
bun run --cwd tooling/cli build
bun tooling/cli/dist/bin.js create-package _phase5_dist_smoke --dry-run
bun tooling/cli/src/bin.ts topo-sort
```

## Done Criteria

- `create-package` succeeds from built `dist` without missing template errors.
- `topo-sort` output has no numeric suffix/index noise.
- New error-path and edge-path tests are present and passing.
- Full verification gate is green.
- Reflection log includes concrete Phase 5 fixes and lessons.
