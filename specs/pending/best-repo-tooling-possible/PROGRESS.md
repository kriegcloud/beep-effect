# Master Tooling Plan: Progress Tracker

> Tracks implementation status of every item in `MASTER-TOOLING-PLAN.md`.
> Last updated: 2026-02-22

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
| 1  | Align `.bun-version` with `packageManager`         | spec   | Delegated to `beep version-sync` CLI command (`specs/pending/repo-cli-version-sync/`) |
| 2  | Restore `knip.config.ts` or remove stale reference | done   | Removed stale reference from `tsconfig.json` (file never existed)                     |
| 3  | Delete orphaned `.lintstagedrc.json`               | done   | File doesn't exist at repo root — already clean                                       |
| 4  | Lefthook `stage_fixed: true`                       | done   | Replaced manual `git add {staged_files}` pattern                                      |
| 5  | Align `.nvmrc` with CI Node version                | spec   | Delegated to `beep version-sync` CLI command                                          |
| 6  | Add `minimumReleaseAge` to `bunfig.toml`           | defer  | Incompatible with `catalog:` protocol in Bun 1.3.9. Revisit after Bun upgrade.        |
| 7  | Add Vitest coverage reporters                      | done   | Added `text`, `lcov`, `json-summary` to `vitest.shared.ts`                            |
| 8  | Add Vitest coverage thresholds                     | done   | Set branches: 80%, functions: 60%, lines/stmts: 30%. Fixed dtslint/fixture excludes.  |
| 9  | Add `lint:circular` to CI                          | done   | Included in `check.yml` via `bun run lint` (runs lint:circular)                       |
| 10 | Add `changeset:status` to CI                       | skip   | CI work happening on separate branch                                                  |
| 11 | Pin `redis:latest` in docker-compose               | spec   | Delegated to `beep version-sync` CLI command                                          |
| 12 | Fix Biome `!!` double-negation                     | done   | Fixed to `!` pattern, deduplicated `!**/build`                                        |

**Bonus fix:** `@vitest/coverage-v8` version mismatch (4.0.18 -> ^3.2.4) to match vitest 3.2.4.

---

## P0: Must-Have

| #    | Item                            | Status | Notes                                                                                 |
|------|---------------------------------|--------|---------------------------------------------------------------------------------------|
| P0-1 | CI check workflow (`check.yml`) | done   | Created `.github/workflows/check.yml` with build/check/lint/test + caching            |
| P0-2 | Fix Knip configuration drift    | done   | Removed stale tsconfig.json reference. Full knip.config.ts creation is separate work. |
| P0-3 | Consolidate to Lefthook only    | done   | `stage_fixed: true` applied. `.lintstagedrc.json` doesn't exist.                      |
| P0-4 | Align Bun version pinning       | spec   | Delegated to `beep version-sync` command                                              |
| P0-5 | Harden Vitest coverage          | done   | Reporters + thresholds added to `vitest.shared.ts`                                    |
| P0-6 | Gitleaks secret scanning        | done   | Added to `check.yml` (CI) and `lefthook.yml` (pre-commit). `.gitleaksignore` existed. |
| P0-7 | Lefthook pre-push optimization  | done   | Consolidated to single `bun run build && bun run check && bun run test`               |
| P0-8 | Bun supply-chain hardening      | defer  | `minimumReleaseAge` breaks `catalog:` in Bun 1.3.9                                    |
| P0-9 | Node version alignment          | spec   | Delegated to `beep version-sync` command                                              |

---

## P1: High Value

| #     | Item                               | Status | Notes                              |
|-------|------------------------------------|--------|------------------------------------|
| P1-1  | `bun audit` vulnerability gate     | todo   |                                    |
| P1-2  | Commitlint conventional commits    | todo   |                                    |
| P1-3  | typos-cli spell checking           | todo   |                                    |
| P1-4  | cspell project spell checking      | todo   |                                    |
| P1-5  | markdownlint-cli2                  | todo   |                                    |
| P1-6  | Biome language surface tuning      | todo   | CSS/GraphQL/JSONC                  |
| P1-7  | Scope ESLint to gap-only checks    | todo   |                                    |
| P1-8  | CI caching (Bun + Turbo)           | done   | Bun dep cache + Turbo cache in `check.yml`  |
| P1-9  | Enforce Madge circular check in CI | done   | `bun run lint` in `check.yml` runs lint:circular |
| P1-10 | Enforce Syncpack in CI             | todo   |                                    |
| P1-11 | Enforce Changesets status in CI    | todo   |                                    |
| P1-12 | OSV-Scanner vulnerability scan     | todo   |                                    |
| P1-13 | Semgrep SAST                       | todo   |                                    |
| P1-14 | Playwright E2E baseline            | todo   |                                    |
| P1-15 | Renovate dependency automation     | todo   |                                    |
| P1-16 | Nix flake + direnv                 | todo   |                                    |
| P1-17 | Root AI governance files           | todo   |                                    |
| P1-18 | Storybook 10 (via `@beep/ui`)      | spec   | `specs/pending/shared-ui-package/` |
| P1-19 | Bundle analysis                    | todo   |                                    |
| P1-20 | Dependency review action           | todo   |                                    |
| P1-21 | publint + attw package quality     | todo   |                                    |
| P1-22 | Nix CI binary cache                | todo   | Depends on P1-16                   |

---

## P2: Nice to Have

| #     | Item                                | Status | Notes                          |
|-------|-------------------------------------|--------|--------------------------------|
| P2-1  | Chromatic visual review             | todo   | Depends on P1-18 (Storybook)   |
| P2-2  | Contract testing (Pact/Effect)      | todo   |                                |
| P2-3  | Stryker mutation testing            | todo   |                                |
| P2-4  | sherif monorepo policy lint         | todo   |                                |
| P2-5  | oxlint supplemental diagnostics     | todo   |                                |
| P2-6  | pkg.pr.new preview packages         | todo   |                                |
| P2-7  | remark-lint semantic markdown       | todo   | Depends on P1-5 (markdownlint) |
| P2-8  | PR complexity labeling              | todo   |                                |
| P2-9  | License compliance (ORT)            | todo   |                                |
| P2-10 | Docker build optimization           | todo   |                                |
| P2-11 | Property-based testing (fast-check) | todo   |                                |
| P2-12 | Vitest browser mode                 | todo   |                                |
| P2-13 | CodSpeed benchmarking               | todo   |                                |
| P2-14 | Changesets changelog upgrade        | todo   |                                |

---

## Specs Created

| Spec                                   | Covers                        | Status                                |
|----------------------------------------|-------------------------------|---------------------------------------|
| `specs/pending/repo-cli-version-sync/` | QW-1, QW-5, QW-11, P0-4, P0-9 | Spec complete, implementation pending |
| `specs/pending/shared-ui-package/`     | P1-18                         | Spec complete, implementation pending |

---

## Summary

| Category   | Total  | Done  | Spec  | Deferred | Skip  | Todo   |
|------------|--------|-------|-------|----------|-------|--------|
| Quick Wins | 12     | 5     | 3     | 1        | 2     | 1      |
| P0         | 9      | 3     | 2     | 1        | 0     | 3      |
| P1         | 22     | 0     | 1     | 0        | 0     | 21     |
| P2         | 14     | 0     | 0     | 0        | 0     | 14     |
| **Total**  | **57** | **8** | **6** | **2**    | **2** | **39** |
