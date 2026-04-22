# Topic
Vitest

## TLDR
Vitest is well integrated with Turbo through package-local test scripts and a shared config file. The main tradeoff is a serial root test invocation that reduces Turbo's parallelism.

## Score
0.86

## Current repo evidence
- The repo has many `vitest.config.ts` files across apps, packages, tooling, and infra.
- `vitest.shared.ts` centralizes alias generation from the root `tsconfig.json`, shared test coverage settings, and common Vitest options.
- `packages/common/ui/vitest.config.ts` and `apps/editor-app/vitest.config.ts` both merge the shared config.
- `packages/common/ui/vitest.storybook.config.ts` adds Storybook test integration and browser-playwright setup.
- Package scripts use `bunx --bun vitest run` for `test` and `vitest --coverage` for `coverage`.
- Root `test` runs `bunx turbo run test --concurrency=1 && bun run test:types`.
- `turbo.json` defines a cached `test` task that depends on `^build`.

## Official Turborepo guidance
- The Turborepo Vitest guide recommends per-package test scripts so Turbo can cache and parallelize suites across the workspace.
- It also calls out the tradeoff that cache-friendly package tests can make merged coverage handling a separate concern.
- The guide notes that shared config files are the right answer when Vitest's project/workspace behavior makes root extension awkward.

## Gaps or strengths
- Strength: the repo already follows the package-script plus shared-config pattern Turbo recommends.
- Strength: the shared config keeps aliases and coverage settings consistent across packages.
- Strength: package-local test execution fits Turbo's cache model well.
- Gap: the root `test` command forces `--concurrency=1`, which likely protects stability but gives up some parallel speed.
- Gap: coverage is separate from the main Turbo test path, which is fine but means the repo is choosing simplicity over merged coverage automation.

## Improvement or preservation plan
- Preserve the shared-config pattern and package-local test scripts.
- Keep test suites cacheable at the package level.
- If test runtime becomes a bottleneck, revisit whether `--concurrency=1` is still required globally or only for a subset of suites.
- If merged coverage becomes important, add a dedicated coverage workflow instead of overloading the main `test` lane.

## Commands and files inspected
- `sed -n '1,220p' vitest.shared.ts`
- `sed -n '1,220p' packages/common/ui/vitest.config.ts`
- `sed -n '1,220p' packages/common/ui/vitest.storybook.config.ts`
- `sed -n '1,220p' apps/editor-app/vitest.config.ts`
- `node -e '...package.json scripts...'`
- `bunx turbo query ls @beep/ui --output json`
- `bunx turbo query ls @beep/editor-app --output json`

## Sources
- Repo: `vitest.shared.ts`
- Repo: `packages/common/ui/vitest.config.ts`
- Repo: `packages/common/ui/vitest.storybook.config.ts`
- Repo: `apps/editor-app/vitest.config.ts`
- Repo: `package.json`
- Repo: `turbo.json`
- Turbo docs: `https://turborepo.dev/docs/guides/tools/vitest`
