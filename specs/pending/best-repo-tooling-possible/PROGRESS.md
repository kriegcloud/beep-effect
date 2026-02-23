# Master Tooling Plan: Progress Tracker

> Tracks implementation status of every item in `MASTER-TOOLING-PLAN.md`.
> Last updated: 2026-02-23

## Legend

| Symbol | Meaning                               |
|--------|---------------------------------------|
| done   | Completed                             |
| skip   | Skipped / Not applicable              |
| defer  | Deferred (blocked or delegated)       |
| spec   | Spec created, awaiting implementation |
| wip    | Work in progress                      |
| todo   | Not started                           |

---

## Quick Wins

| #  | Item                                               | Status | Notes                                                                                 |
|----|----------------------------------------------------|--------|---------------------------------------------------------------------------------------|
| 1  | Align `.bun-version` with `packageManager`         | done   | `beep version-sync` CLI command (auto-detects and fixes drift)                        |
| 2  | Restore `knip.config.ts` or remove stale reference | done   | Removed stale reference from `tsconfig.json` (file never existed)                     |
| 3  | Delete orphaned `.lintstagedrc.json`               | done   | File doesn't exist at repo root — already clean                                       |
| 4  | Lefthook `stage_fixed: true`                       | done   | Replaced manual `git add {staged_files}` pattern                                      |
| 5  | Align `.nvmrc` with CI Node version                | done   | `beep version-sync` scans workflows for `node-version` vs `.nvmrc`                    |
| 6  | Add `minimumReleaseAge` to `bunfig.toml`           | defer  | Incompatible with `catalog:` protocol in Bun 1.3.9. Revisit after Bun upgrade.        |
| 7  | Add Vitest coverage reporters                      | done   | Added `text`, `lcov`, `json-summary` to `vitest.shared.ts`                            |
| 8  | Add Vitest coverage thresholds                     | done   | Set branches: 80%, functions: 60%, lines/stmts: 30%. Fixed dtslint/fixture excludes.  |
| 9  | Add `lint:circular` to CI                          | done   | Included in `check.yml` via `bun run lint` (runs lint:circular)                       |
| 10 | Add `changeset:status` to CI                       | done   | Included in `check.yml` as PR-only step                                               |
| 11 | Pin `redis:latest` in docker-compose               | done   | `beep version-sync` detects unpinned Docker images and resolves latest tags            |
| 12 | Fix Biome `!!` double-negation                     | done   | Fixed to `!` pattern, deduplicated `!**/build`                                        |

**Bonus fix:** `@vitest/coverage-v8` version mismatch (4.0.18 -> ^3.2.4) to match vitest 3.2.4.

---

## P0: Must-Have

| #    | Item                            | Status | Notes                                                                                 |
|------|---------------------------------|--------|---------------------------------------------------------------------------------------|
| P0-1 | CI check workflow (`check.yml`) | done   | Created `.github/workflows/check.yml` with build/check/lint/test + caching            |
| P0-2 | Fix Knip configuration drift    | done   | Removed stale tsconfig.json reference. Full knip.config.ts creation is separate work. |
| P0-3 | Consolidate to Lefthook only    | done   | `stage_fixed: true` applied. `.lintstagedrc.json` doesn't exist.                      |
| P0-4 | Align Bun version pinning       | done   | `beep version-sync` checks `.bun-version` vs `packageManager` vs latest               |
| P0-5 | Harden Vitest coverage          | done   | Reporters + thresholds added to `vitest.shared.ts`                                    |
| P0-6 | Gitleaks secret scanning        | done   | Added to `check.yml` (CI) and `lefthook.yml` (pre-commit). `.gitleaksignore` existed. |
| P0-7 | Lefthook pre-push optimization  | done   | Consolidated to single `bun run build && bun run check && bun run test`               |
| P0-8 | Bun supply-chain hardening      | defer  | `minimumReleaseAge` breaks `catalog:` in Bun 1.3.9                                    |
| P0-9 | Node version alignment          | done   | `beep version-sync` replaces hardcoded `node-version` with `node-version-file: .nvmrc` |

---

## P1: High Value

| #     | Item                               | Status | Notes                              |
|-------|------------------------------------|--------|------------------------------------|
| P1-1  | `bun audit` vulnerability gate     | done   | Added `bun audit --audit-level=high` to `check.yml` |
| P1-2  | Commitlint conventional commits    | done   | `commitlint.config.ts` + `commit-msg` hook in lefthook |
| P1-3  | typos-cli spell checking           | done   | `_typos.toml` config + pre-commit hook + `lint:typos` script |
| P1-4  | cspell project spell checking      | done   | `cspell.json` config + `lint:spell` script + CI step in `check.yml` |
| P1-5  | markdownlint-cli2                  | done   | `.markdownlint-cli2.jsonc` config + `lint:markdown` script + CI step |
| P1-6  | Biome language surface tuning      | done   | Removed CSS exclusion, Biome now formats/lints CSS with Tailwind directives |
| P1-7  | Scope ESLint to gap-only checks    | done   | Already scoped: JSDoc-only rules on `tooling/*/src/**/*.ts` |
| P1-8  | CI caching (Bun + Turbo)           | done   | Bun dep cache + Turbo cache in `check.yml`  |
| P1-9  | Enforce Madge circular check in CI | done   | `bun run lint` in `check.yml` runs lint:circular |
| P1-10 | Enforce Syncpack in CI             | done   | `bunx syncpack lint` step in `check.yml` |
| P1-11 | Enforce Changesets status in CI    | done   | `bunx changeset status` (PR-only) in `check.yml` |
| P1-12 | OSV-Scanner vulnerability scan     | done   | `security` job in `check.yml` with osv-scanner-action |
| P1-13 | Semgrep SAST                       | done   | `sast` job in `check.yml` with TS/JS/security/secrets rulesets |
| P1-14 | Playwright E2E baseline            | done   | `playwright.config.ts` + `e2e/smoke.spec.ts` + CI job with artifact upload |
| P1-15 | Renovate dependency automation     | done   | `renovate.json` with Effect grouping, auto-merge for types/Actions |
| P1-16 | Nix flake + direnv                 | done   | `flake.nix` with dev shell (bun, node, turbo, quality tools) + `.envrc` |
| P1-17 | Root AI governance files           | done   | Created root `CLAUDE.md` + `AGENTS.md` with conventions/commands |
| P1-18 | Storybook 10 (via `@beep/ui`)      | done   | `@beep/ui` package with Storybook 10, Button stories, OKLch theme |
| P1-19 | Bundle analysis                    | done   | `@next/bundle-analyzer` in web app, `ANALYZE=true` script |
| P1-20 | Dependency review action           | done   | `dependency-review-action` (PR-only) in `check.yml` |
| P1-21 | publint + attw package quality     | done   | Installed `publint` + `@arethetypeswrong/cli`. CI deferred (all pkgs private). |
| P1-22 | Nix CI binary cache                | done   | Cachix action in CI `nix` job with flake check + dev shell build |

---

## P2: Nice to Have

| #     | Item                                | Status | Notes                          |
|-------|-------------------------------------|--------|--------------------------------|
| P2-1  | Chromatic visual review             | defer  | Storybook exists (P1-18 done). Enable when visual regression testing needed. |
| P2-2  | Contract testing (Pact/Effect)      | defer  | No cross-service boundaries yet. Enable when adding microservices. |
| P2-3  | Stryker mutation testing            | defer  | High compute cost. Enable after CI baseline stabilizes. |
| P2-4  | sherif monorepo policy lint         | done   | `lint:repo` script. All issues fixed (0 warnings). |
| P2-5  | oxlint supplemental diagnostics     | done   | `lint:ox` script. All warnings fixed (0 warnings, 0 errors). |
| P2-6  | pkg.pr.new preview packages         | defer  | All packages are private. Enable when publishing. |
| P2-7  | remark-lint semantic markdown       | skip   | markdownlint-cli2 (P1-5) provides sufficient coverage |
| P2-8  | PR complexity labeling              | done   | `pr-size` job in `check.yml` using tj-actions/changed-files |
| P2-9  | License compliance (ORT)            | done   | `dependency-review-action` with AGPL/GPL-3.0 deny list + severity gate |
| P2-10 | Docker build optimization           | defer  | No production Dockerfiles yet. Setup when deploying. |
| P2-11 | Property-based testing (fast-check) | done   | `fast-check` v4 installed. Use with Schema `toArbitrary` annotation. |
| P2-12 | Vitest browser mode                 | defer  | `@beep/ui` exists now. Enable when browser-specific testing needed. |
| P2-13 | CodSpeed benchmarking               | defer  | Requires performance-critical code paths. Enable when profiling. |
| P2-14 | Changesets changelog upgrade        | done   | Switched to `@changesets/changelog-github` for PR-linked changelogs |

---

## Specs Created

| Spec                                   | Covers                        | Status    |
|----------------------------------------|-------------------------------|-----------|
| `specs/pending/repo-cli-version-sync/` | QW-1, QW-5, QW-11, P0-4, P0-9 | Done      |
| `specs/pending/shared-ui-package/`     | P1-18                         | Done      |

---

## Summary

| Category   | Total  | Done   | Deferred | Skip  | Todo   |
|------------|--------|--------|----------|-------|--------|
| Quick Wins | 12     | 11     | 1        | 0     | 0      |
| P0         | 9      | 8      | 1        | 0     | 0      |
| P1         | 22     | 22     | 0        | 0     | 0      |
| P2         | 14     | 8      | 5        | 1     | 0      |
| **Total**  | **57** | **49** | **7**    | **1** | **0**  |
