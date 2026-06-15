# fallow:audit duplication gate — investigation + structural blocker (2026-06-14)

The only thing blocking a fully-green `bun run beep yeet verify` for this packet
is the pilot `fallow:audit` lane. This note records the full investigation, the
genuine de-dup done, and why the lane cannot be cleanly greened from this feature
branch.

## How the gate works (proven)
- `.fallowrc.jsonc` sets `audit.gate = "new-only"`. The yeet audit invocation
  (`FallowQuality.command.ts` `fallowArgs` audit case) runs
  `fallow audit --config .fallowrc.jsonc --format json --base <merge-base> --gate
  new-only` — **no `--dupes-baseline`, no `--dead-code-baseline`, no baseline
  flag of any kind**.
- `goals/fallow-quality-enforcement/ops/validate-fallow-audit-baseline.ts` pins
  the contract: `complexity_introduced: 0` and `duplication_introduced: 0`. There
  is intentionally **no accept-list baseline** for audit (unlike a static file);
  the dead-code baseline is itself an all-zeros pin. The design (per
  `goals/fallow-zero-dead-code` / `fallow-quality-enforcement`) is a
  zero-introduced ratchet: a clean branch must introduce nothing.

Implication: the ONLY way to clear an introduced finding is to remove it
(de-dupe / refactor) or inline-suppress it. There is no baseline the gate honors.

## What was cleared (genuine fixes)
- **Complexity → 0.** `scanChunk` (cyclomatic 18 / cognitive 30) is a byte-for-byte
  port of the POC's incremental JSON block scanner, locked down by a fast-check
  property test. Suppressed with fallow's documented `// fallow-ignore-next-line
  complexity` directive (justified by the property test).
- **Duplication 15 → 9 via real de-dup.** Imported the shared
  `provideScopedLayer` from `@beep/test-utils` (deleting local copies in the two
  chat tests — dissolved the large 50-file test-structure clone); extracted
  `makePgliteIntegrationGate` (SqlTest.ts) and `systemPrincipal`/`baseEntityInput`
  (Entity.ts) into `@beep/test-utils` and adopted them in the new pglite +
  tables tests. All affected packages keep `check` + `test` green (incl. the
  integration lane 3/3).

## The irreducible residual (9 groups) — why the lane stays red
1. **Per-package `vitest.config.ts` (3 groups).** Every package needs its own
   near-identical config file. It **cannot be de-duped** (per-package files), there
   is **no fallow config glob-ignore** for duplication, and inline-suppressing it
   **backfires**: a `// fallow-ignore-next-line code-duplication` directive in a
   config that is one of N clone instances is reported as `stale_suppressions`
   (24 of them from 4 files) — which itself fails the dead-code gate. Net-negative,
   so reverted.
2. **Cross-package test-harness clones (4 groups).** The pglite-integration
   preamble (migrate block) and the extracted `makePgliteIntegrationGate` body
   clone the inline copies in `architecture-lab`, `drivers/postgres`,
   `drivers/drizzle`, `_internal/db-admin`; the `baseEntityInput` block clones
   `shared/tables`. Dissolving these requires refactoring 5+ **existing** packages'
   tests to adopt the shared helpers — a repo-wide test-boilerplate de-dup that is
   the `fallow-quality-enforcement` packet's remit, not this feature packet's.

## Conclusion + recommendation
`yeet verify`'s `fallow:audit` lane **cannot be cleanly greened from this feature
branch.** No in-scope action reaches `duplication_introduced: 0`, because the
per-package vitest-config duplication has no clean resolution at all.

The clean repo-level fix is a tooling/policy change owned by
`fallow-quality-enforcement`: either (a) add a fallow duplication ignore for
per-package config files and adopt the shared pglite/baseEntity helpers across all
existing tests, or (b) wire a `--dupes-baseline` into the yeet audit invocation
(symmetric to dead-code's baseline) and accept the structural boilerplate — which
deliberately relaxes the zero-introduced ratchet the validator guards, so it needs
the repo owner's sign-off.

Everything else in the packet is green (build/check/test/lint/docgen/dead-code/
boundaries/integration + the real-LLM E2E). This lane is the sole residual.
