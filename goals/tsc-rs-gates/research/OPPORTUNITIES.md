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
