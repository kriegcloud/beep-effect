# Follow-up friction receipts

- 2026-10-15, reflection TODO verification: `beep quality package-verify @beep/repo-cli --quick`
  initially failed with `TS6305` because this fresh lane lacked dependency declarations.
  `turbo run build --filter='@beep/repo-cli^...'` restored the 45-package dependency
  closure; the retry exposed the actual local codec error. A dependency-output
  preflight would distinguish missing build products before the large checker cascade.
- 2026-10-15, focused policy tests: a root-level Vitest invocation with the package
  config found no tests because its include is `test/**/*.test.{ts,tsx}`. Running
  from the package directory exercised all 14 tests. Documenting the package cwd
  in focused-test recipes would prevent the wasted invocation.
- 2026-10-23, post-migration engine gate: `@beep/t3-code` shipped with
  `beep:build` on `tsc` and `beep:check`/`beep:check:tests` on `tsgo` (born that
  way in #1571) and `bun run beep lint package-scripts` still passed, because every
  impl-script difference was advisory (`138 with advisory impl drift`). `tsc-rs`
  passes all three t3-code configs once dependency dists exist, so the package
  migrated with no exemption. The policy now emits a failing `checker-engine` row for
  `beep:build`, `beep:check`, and `beep:check:*` segments that run `tsgo` or `tsc`,
  with a schema-modelled `checkerEngineExemptions` list for reviewed exceptions.
  A gate on the engine itself at migration time would have prevented the silent drift.
- 2026-10-23, migrating impl values through the policy: `lint package-scripts --write`
  preserves existing impl values, so re-seeding a default means deleting the key
  first. The rewrite then emits the scripts block in tier order (tasks, impls,
  extras) rather than the alphabetical order every other manifest uses, which
  needs a separate key sort to keep the diff minimal.
