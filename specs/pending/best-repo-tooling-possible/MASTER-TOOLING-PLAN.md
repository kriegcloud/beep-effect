# Master Tooling Plan (Synthesized)

> Synthesis of independent research by **Claude Code** and **Codex CLI** against the beep-effect2 monorepo.
> Date: 2026-02-22

---

## 1. Executive Summary

| Metric                 | Value                                  |
|------------------------|----------------------------------------|
| Current state score    | **7.0 / 10** (Claude: 6.5, Codex: 7.5) |
| Target score           | **9.5 / 10**                           |
| P0 items               | 9                                      |
| P1 items               | 22                                     |
| P2 items               | 14                                     |
| Quick wins (< 1 hr)    | 12                                     |
| Estimated total effort | **52-90 hours**                        |
| Pragmatic P0 + top P1  | **20-35 hours**                        |

The monorepo has a strong foundation: Bun, Turborepo, Biome 2.4, strict TypeScript 5.9, Syncpack, Madge, Lefthook, Changesets, and a well-structured Effect v4 workspace architecture. However, **the enforcement layer is almost entirely absent**:

- **No PR CI quality gate workflow** (only `release.yml` exists).
- **Tooling drift** (missing `knip.config.ts`, Bun version pin mismatch, orphaned `.lintstagedrc.json`, `.nvmrc` vs CI node version).
- **Zero security checks** in CI (no audit, no secret scanning, no SAST, no license compliance).
- **Documentation quality pipeline absent** (no spell checking, no markdown linting, no JSDoc policy enforcement).
- **Nix dev environment absent** despite being part of the intended operating model.
- **No E2E testing, no Storybook, no visual regression pipeline**.

The scoring difference (6.5 vs 7.5) reflects methodology: Claude weighted missing capabilities heavier; Codex weighted the strong existing foundation heavier. The synthesized 7.0 acknowledges both realities: the tools chosen are excellent, but the enforcement gap means they provide no CI-level guarantees.

---

## 2. Current State Audit (Merged)

### 2.1 Package Management & Runtime

| Aspect        | Status        | Detail                                                                   |
|---------------|---------------|--------------------------------------------------------------------------|
| Runtime       | Bun 1.3.x     | `.bun-version` = `1.3.2`, `packageManager` = `bun@1.3.9` (**MISMATCH**)  |
| Lockfile      | `bun.lock`    | Text-based, present and tracked                                          |
| Workspaces    | Bun native    | `packages/*`, `apps/*`, `tooling/*`                                      |
| Catalog       | Yes           | Root `package.json` catalogs deps; Syncpack enforces `catalog:` protocol |
| Node fallback | `.nvmrc` = 22 | CI uses Node 20 (**MISMATCH**)                                           |

**Verified**: `.bun-version` contains `1.3.2`; `package.json` `packageManager` field is `bun@1.3.9`. Both sources flagged this. The `.nvmrc` vs CI discrepancy was identified only by Claude.

### 2.2 Linting & Formatting

| Tool        | Version | Status       | Notes                                                                                                                                                 |
|-------------|---------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Biome       | 2.4.4   | Strong       | Primary linter/formatter. `!!` double-negation in includes pattern (confirmed in `biome.jsonc`). No CSS/GraphQL/JSONC coverage.                       |
| ESLint      | 9.31.0  | Scoped       | JSDoc enforcement only via `eslint-plugin-jsdoc`. Correct division of labor.                                                                          |
| Lefthook    | 1.13.0  | Active       | Pre-commit: format via Biome. Pre-push: full build/tsc/test. Uses manual `git add {staged_files}` instead of `stage_fixed: true`. No commit-msg hook. |
| lint-staged | Present | **Orphaned** | `.lintstagedrc.json` exists but is unused (Lefthook is the active hook runner). Dead config.                                                          |

**Verified**: `lefthook.yml` confirms manual `git add` pattern and absence of `commit-msg` hook. `biome.jsonc` confirms `!!` pattern in includes.

### 2.3 Build & Orchestration

| Tool       | Version | Status    | Notes                                                                                                                                                                     |
|------------|---------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Turborepo  | 2.8.10  | Strong    | Well-defined task graph with `dependsOn`, `inputs`, `outputs`. No remote cache configured. `lint` task missing `dependsOn: ["^build"]` for cross-package type resolution. |
| TypeScript | 5.9.3   | Excellent | Strictest settings. Effect language service plugin. `tsconfig.base.json` with path aliases.                                                                               |
| Changesets | 2.29.8  | Good      | Configured for release workflow but not enforced in PR checks.                                                                                                            |

### 2.4 Testing

| Tool           | Version | Status       | Notes                                                                                         |
|----------------|---------|--------------|-----------------------------------------------------------------------------------------------|
| Vitest         | 4.0.18  | Needs tuning | V8 coverage enabled but HTML-only reporter. No coverage thresholds. No CI-friendly reporters. |
| tstyche        | Present | Good         | Type-level tests for schema/branded types.                                                    |
| @effect/vitest | Present | Good         | `it.effect` / `layer()` integration.                                                          |
| Playwright     | Absent  | Gap          | No E2E testing framework.                                                                     |
| Storybook      | Absent  | Gap          | No component playground or visual regression.                                                 |

### 2.5 CI/CD

| Workflow          | Status     | Notes                                                                                                                   |
|-------------------|------------|-------------------------------------------------------------------------------------------------------------------------|
| `release.yml`     | Present    | Changesets-based publish on push to main. Uses `bun install --frozen-lockfile`, runs `turbo run lint test check build`. |
| `check.yml`       | **ABSENT** | No PR quality gates. PRs merge with zero automated checks.                                                              |
| Security scanning | **ABSENT** | No audit, no secret scanning, no SAST.                                                                                  |
| Dependency review | **ABSENT** | No automated vulnerability review on PRs.                                                                               |

**Verified**: Only `release.yml` exists in `.github/workflows/`. This is the single highest-impact gap.

### 2.6 Security & Supply Chain

| Area                    | Status                                                                                                                                                                                          |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `bun audit`             | Not configured (also requires Bun >= 1.2.15; current repo is on 1.3.x so this should work now — **Codex correct, Claude's concern was valid for older versions but current 1.3.x supports it**) |
| Secret scanning         | None                                                                                                                                                                                            |
| SAST                    | None                                                                                                                                                                                            |
| License compliance      | None                                                                                                                                                                                            |
| `bunfig.toml` hardening | No `minimumReleaseAge` or `trustedDependencies`                                                                                                                                                 |

### 2.7 Documentation Quality

| Area             | Status                                       |
|------------------|----------------------------------------------|
| Spell checking   | None configured                              |
| Markdown linting | None configured                              |
| JSDoc policy     | ESLint plugin present but not enforced in CI |
| API docs         | `@effect/docgen` configured per-package      |

### 2.8 Dev Environment

| Area           | Status                                                          |
|----------------|-----------------------------------------------------------------|
| Nix flake      | **ABSENT** (no `flake.nix` or `flake.lock`)                     |
| direnv         | **ABSENT**                                                      |
| Docker Compose | Present and well-configured (PostgreSQL, Redis, Grafana OTEL)   |
| `.mcp.json`    | Present (graphiti-memory server reference — Codex-only finding) |

### 2.9 Monorepo Governance

| Tool     | Version         | Status         | Notes                                                                      |
|----------|-----------------|----------------|----------------------------------------------------------------------------|
| Knip     | Referenced      | **BROKEN**     | `tsconfig.json` references `knip.config.ts` but file is missing from root. |
| Syncpack | 14.0.0-alpha.41 | Active         | Enforces `catalog:` protocol. Alpha intentionally pinned (valid reasons to stay on alpha channel). |
| Madge    | 8.0.0           | Active locally | `lint:circular` script exists but not enforced in CI.                      |

---

## 3. Quick Wins (< 1 hour each)

These items have outsized value relative to their effort and should be done first regardless of wave scheduling.

| #  | Item                                                                             | Source | Effort |
|----|----------------------------------------------------------------------------------|--------|--------|
| 1  | Align `.bun-version` with `packageManager` field (pick one version, update both) | Both   | 5 min  |
| 2  | Restore `knip.config.ts` or remove stale reference from `tsconfig.json`          | Both   | 15 min |
| 3  | Delete orphaned `.lintstagedrc.json`                                             | Both   | 1 min  |
| 4  | Fix Lefthook pre-commit to use `stage_fixed: true` instead of manual `git add`   | Claude | 5 min  |
| 5  | Align `.nvmrc` with CI Node version (both should be 22)                          | Claude | 5 min  |
| 6  | Add `minimumReleaseAge` to `bunfig.toml`                                         | Codex  | 10 min |
| 7  | Add Vitest coverage reporters (`text`, `lcov`, `json-summary`)                   | Both   | 15 min |
| 8  | Add Vitest coverage thresholds (calibrate from current baseline)                 | Both   | 30 min |
| 9  | Add `bun run lint:circular` step to CI                                           | Both   | 10 min |
| 10 | Add `bun run changeset:status` step to CI (with exception label)                 | Both   | 15 min |
| 11 | Pin `redis:latest` to specific version in `docker-compose.yml`                   | Codex  | 5 min  |
| 12 | Fix Biome `!!` double-negation in includes (replace with clean negation pattern) | Claude | 10 min |

---

## 4. P0 Recommendations (Must-Have)

These items fix broken configurations or fill gaps that make CI meaningless without them.

### P0-1: Add CI Check Workflow (`check.yml`)

- **Source**: Both
- **Source agreement**: Full agreement. Both identify this as the single highest-priority item.
- **What**: Create `.github/workflows/check.yml` triggered on PR and push to main. Runs `bun install --frozen-lockfile` followed by `turbo run lint test check build --affected`.
- **Why**: PRs currently merge with zero automated checks. The release workflow catches issues too late.
- **Type**: New workflow
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes. Fully Bun-native.
- **Effect-TS relevant**: No (general CI infrastructure).
- **Config snippet**:
```yaml
# .github/workflows/check.yml
name: Check
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: ".bun-version"
      - run: bun install --frozen-lockfile
      - run: bun run turbo run lint test check build --affected
```
- **Verdict**: Implement exactly as both recommend. This is non-negotiable and should be the first thing built.

### P0-2: Fix Knip Configuration Drift

- **Source**: Both
- **Source agreement**: Full agreement. Both identify the missing file and recommend restoration.
- **What**: Create root `knip.config.ts` with entry/project/ignore patterns matching the workspace structure, or remove the stale reference from `tsconfig.json`.
- **Why**: Current state is internally inconsistent — TypeScript config references a file that doesn't exist.
- **Type**: Config fix
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```ts
// knip.config.ts
import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["apps/**/src/index.{ts,tsx}", "packages/**/src/index.ts", "tooling/**/src/index.ts"],
  project: ["apps/**", "packages/**", "tooling/**"],
  ignore: ["**/*.test.ts", "**/*.stories.tsx", "**/*.tst.ts", "**/dtslint/**"],
  ignoreDependencies: ["@effect/*"] // Effect v4 re-exports may confuse Knip
};

export default config;
```
- **Verdict**: Restore the file. Prefer restoration over removing the reference — Knip provides real value for dead code detection in a growing monorepo.

### P0-3: Consolidate to Lefthook Only

- **Source**: Both
- **Source agreement**: Full agreement.
- **What**: Delete orphaned `.lintstagedrc.json`. Ensure Lefthook is the sole hook runner. Fix `stage_fixed: true` pattern.
- **Why**: Dual hook configurations cause confusion and potential drift. The lint-staged config is dead code.
- **Type**: Config fix
- **Effort**: Low (< 30 min)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
# lefthook.yml (pre-commit section fix)
pre-commit:
  commands:
    format:
      glob: "*.{js,ts,jsx,tsx,json,jsonc,css,md}"
      run: bunx biome check --write {staged_files}
      stage_fixed: true  # replaces manual 'git add {staged_files}'
```
- **Verdict**: Delete `.lintstagedrc.json`, fix `stage_fixed`, and add this to the quick wins list.

### P0-4: Align Bun Version Pinning

- **Source**: Both (Codex P1, Claude flags as critical)
- **Source agreement**: Both flag the mismatch; Codex rates P1, synthesis elevates to P0 because version mismatches cause hard-to-debug CI failures.
- **What**: Pick one Bun version (recommend latest stable) and update both `.bun-version` and `packageManager` field in root `package.json`.
- **Why**: `.bun-version` = `1.3.2`, `packageManager` = `bun@1.3.9`. CI with `bun-version-file: ".bun-version"` gets 1.3.2 while local dev may use 1.3.9.
- **Type**: Config fix
- **Effort**: Low (< 15 min)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```bash
# .bun-version
1.3.9
```
```json
{ "packageManager": "bun@1.3.9" }
```
- **Verdict**: Trivial fix with outsized impact. Align to the higher version (1.3.9) since that's what `packageManager` already declares.

### P0-5: Harden Vitest Coverage

- **Source**: Both
- **Source agreement**: Full agreement on reporters and thresholds.
- **What**: Add CI-friendly reporters (`text`, `lcov`, `json-summary`) and coverage thresholds to `vitest.shared.ts`.
- **Why**: HTML-only coverage is invisible in CI. No thresholds means coverage can silently erode.
- **Type**: Config upgrade
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: Yes. Effect code with `Effect.gen` functions needs representative test patterns; thresholds ensure they get covered.
- **Config snippet**:
```ts
// vitest.shared.ts
coverage: {
  provider: "v8",
  reporter: ["text", "lcov", "html", "json-summary"],
  thresholds: {
    lines: 60,      // calibrate from current baseline, then ratchet up
    branches: 50,
    functions: 60,
    statements: 60
  }
}
```
- **Verdict**: Start with thresholds based on current actual coverage (run once to baseline), then ratchet quarterly. Both sources agree this is foundational.

### P0-6: Add Gitleaks Secret Scanning

- **Source**: Both
- **Source agreement**: Full agreement on Gitleaks as primary. Both mention TruffleHog as alternative but prefer Gitleaks for CI simplicity.
- **What**: Add Gitleaks as a PR check in `check.yml` and as a Lefthook pre-commit hook.
- **Why**: No secret scanning exists. A single leaked credential negates all other security measures.
- **Type**: New tool
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes (standalone binary, no JS runtime dependency).
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
# In check.yml
- name: Secret scanning
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
```yaml
# lefthook.yml addition
pre-commit:
  commands:
    gitleaks:
      run: gitleaks protect --staged --verbose
```
- **Verdict**: Non-negotiable for any repo with API keys, database URLs, and MCP configurations. Add to both CI and local hooks.

### P0-7: Fix Lefthook Pre-push Optimization

- **Source**: Claude only
- **Source agreement**: Codex did not evaluate pre-push configuration in detail.
- **What**: The current pre-push hook runs `turbo run build && tsc --noEmit && vitest run` which duplicates work that `turbo run build` already orchestrates. Consolidate to `turbo run lint test check build --affected`.
- **Why**: Current pre-push takes unnecessarily long, which discourages developers from pushing frequently.
- **Type**: Config fix
- **Effort**: Low (< 30 min)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
# lefthook.yml
pre-push:
  commands:
    quality:
      run: bun run turbo run lint test check build --affected
```
- **Verdict**: Consolidate to single Turbo invocation with `--affected` to only check changed packages.

### P0-8: Enable Bun Supply-Chain Hardening

- **Source**: Codex P0
- **Source agreement**: Claude mentions supply-chain hardening but doesn't explicitly call out `minimumReleaseAge`. Codex provides the specific config.
- **What**: Add `minimumReleaseAge` and explicit `trustedDependencies` to `bunfig.toml`.
- **Why**: Prevents installing packages published in the last N days (defense against supply-chain attacks with newly published malicious versions).
- **Type**: Config upgrade
- **Effort**: Low (< 15 min)
- **Bun compatible**: Yes (Bun-native feature).
- **Effect-TS relevant**: No.
- **Config snippet**:
```toml
# bunfig.toml
[install]
minimumReleaseAge = "3d"

[install.trustedDependencies]
# Only allow lifecycle scripts from explicitly trusted packages
```
- **Verdict**: Trivial config change with meaningful supply-chain protection. Quick win.

### P0-9: Fix Node Version Alignment

- **Source**: Claude only
- **Source agreement**: Codex did not identify this mismatch.
- **What**: Align `.nvmrc` (currently `22`) with CI workflow. Ensure CI uses Node 22 if that's the declared minimum.
- **Why**: `.nvmrc` says 22 but CI may default to a different Node version. Inconsistency between local and CI environments causes subtle failures.
- **Type**: Config fix
- **Effort**: Low (< 10 min)
- **Bun compatible**: Yes (Node is a fallback for tools that don't run under Bun).
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
# In check.yml, if Node is needed for any step
- uses: actions/setup-node@v4
  with:
    node-version-file: ".nvmrc"
```
- **Verdict**: Quick alignment fix. If Bun is the sole runtime in CI, consider whether `.nvmrc` is still needed at all.

---

## 5. P1 Recommendations (High Value)

### P1-1: Add `bun audit` Vulnerability Gate

- **Source**: Both (Codex P0, Claude P1 due to version concern)
- **Source agreement**: Disagree on priority. Codex rates P0; Claude correctly noted `bun audit` requires Bun >= 1.2.15. Since current repo is on 1.3.x, the command is available. However, synthesis places at P1 because it depends on P0-4 (version alignment) being resolved first.
- **What**: Add `bun audit --audit-level=high` to CI check workflow.
- **Why**: No vulnerability scanning exists. `bun audit` is the lowest-friction first line of defense.
- **Type**: Config upgrade
- **Effort**: Low (< 30 min)
- **Bun compatible**: Yes (native Bun command).
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
- name: Vulnerability audit
  run: bun audit --audit-level=high
```
- **Verdict**: Add immediately after version alignment. Gate on `high` severity to avoid blocking on advisory noise.

### P1-2: Add Commitlint Conventional Commits

- **Source**: Both (Claude P0, Codex P1)
- **Source agreement**: Both recommend. Claude rates higher priority due to changelog automation benefits; Codex rates P1.
- **What**: Add `commitlint` with conventional commits config. Wire to Lefthook `commit-msg` hook.
- **Why**: Enforces consistent commit messages that power Changesets changelog generation and make git history navigable.
- **Type**: New tool
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```js
// commitlint.config.js
export default { extends: ["@commitlint/config-conventional"] };
```
```yaml
# lefthook.yml
commit-msg:
  commands:
    commitlint:
      run: bunx commitlint --edit {1}
```
- **Verdict**: P1 — valuable for changelog quality and release automation, but not blocking CI functionality.

### P1-3: Add typos-cli Spell Checking

- **Source**: Both (Claude P0, Codex P2)
- **Source agreement**: Disagree significantly. Claude argues typos-cli is fast, low false-positive, and ideal for staged-file checking. Codex prefers cspell as primary and treats typos-cli as optional.
- **What**: Add `typos-cli` as fast pre-commit spell check on staged files. Complement with cspell for comprehensive project-wide checking.
- **Why**: Zero spell checking exists. `typos-cli` is Rust-based, extremely fast, and has excellent code-aware tokenization.
- **Type**: New tool
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes (standalone Rust binary).
- **Effect-TS relevant**: Yes. Needs custom dictionary for Effect-TS terms (Effect, Schema, Layer, Fiber, etc.).
- **Config snippet**:
```toml
# _typos.toml
[default.extend-words]
# Effect-TS vocabulary
Struct = "Struct"
Fnc = "Fnc"
Ser = "Ser"

[files]
extend-exclude = ["bun.lock", "*.snap", ".repos/**"]
```
```yaml
# lefthook.yml pre-commit addition
typos:
  glob: "*.{ts,tsx,md,json}"
  run: typos {staged_files}
```
- **Verdict**: P1. Claude's argument for typos-cli is stronger than Codex's dismissal — it fills a real gap with near-zero friction. Use alongside cspell (P1-4) for a two-layer approach: typos-cli for fast local feedback, cspell for comprehensive CI checking.

### P1-4: Add cspell Project Spell Checking

- **Source**: Both
- **Source agreement**: Full agreement on cspell as the comprehensive spell checker.
- **What**: Add cspell with custom dictionaries for Effect-TS, domain terms, and package names.
- **Why**: Catches spelling errors that typos-cli misses (domain-specific terms, documentation prose).
- **Type**: New tool
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: Yes. Needs comprehensive Effect vocabulary dictionary.
- **Config snippet**:
```json
{
  "$schema": "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json",
  "version": "0.2",
  "language": "en",
  "words": [
    "beep", "monorepo", "turborepo", "biome", "vitest", "tstyche",
    "changesets", "syncpack", "lefthook", "bunfig",
    "Effect", "Schema", "Layer", "Fiber", "FiberId", "FiberRef",
    "HashMap", "HashSet", "MutableHashMap", "MutableHashSet",
    "TaggedError", "TaggedErrorClass", "GenericTag",
    "decodeUnknown", "decodeUnknownSync", "decodeUnknownEffect",
    "encodeUnknown", "fromJsonString"
  ],
  "ignorePaths": ["bun.lock", "node_modules", ".repos", "*.snap"]
}
```
- **Verdict**: P1. Add after typos-cli for comprehensive coverage. Run in CI, not in pre-commit (too slow for staged files).

### P1-5: Add markdownlint-cli2

- **Source**: Both
- **Source agreement**: Full agreement.
- **What**: Add `markdownlint-cli2` for markdown quality enforcement across docs and specs.
- **Why**: No markdown linting exists. Specs, READMEs, and documentation grow organically and drift.
- **Type**: New tool
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```json
{
  "MD013": false,
  "MD033": false,
  "MD041": false
}
```
- **Verdict**: P1. Standard markdown hygiene. Disable line-length (MD013) for docs with long code blocks.

### P1-6: Biome Language Surface Tuning

- **Source**: Codex only (Claude did not produce a Biome-specific research file)
- **Source agreement**: Codex-only finding, evaluated on merits.
- **What**: Extend Biome coverage to CSS, GraphQL, and JSONC files. Conduct one-time rule hardening pass to move stable `warn` rules to `error`.
- **Why**: Current Biome config only covers JS/TS/JSON. CSS (Tailwind v4), JSONC (tsconfig files), and future GraphQL files are unchecked.
- **Type**: Config upgrade
- **Effort**: Medium (1-4 hrs)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```jsonc
// biome.jsonc additions
{
  "css": {
    "formatter": { "enabled": true },
    "linter": { "enabled": true }
  },
  "json": {
    "parser": { "allowComments": true, "allowTrailingCommas": true }
  }
}
```
- **Verdict**: P1. Single-tool coverage expansion is always preferable to adding new tools. Review which `warn` rules can safely become `error`.

### P1-7: Scope ESLint to Gap-Only Checks

- **Source**: Both
- **Source agreement**: Full agreement. Both recommend keeping Biome as canonical and reducing ESLint to JSDoc/framework-specific gaps only.
- **What**: Audit current ESLint config and remove any rules that overlap with Biome. Document the explicit gap matrix.
- **Why**: Prevents double-linting, reduces CI time, and clarifies tool responsibilities.
- **Type**: Config upgrade
- **Effort**: Medium (1-2 hrs)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Verdict**: P1. Essential for maintainability. ESLint should only run rules Biome cannot provide (JSDoc quality, framework-specific rules).

### P1-8: Optimize CI Caching (Bun + Turbo)

- **Source**: Both
- **Source agreement**: Full agreement on Bun global cache + Turborepo cache restoration.
- **What**: Add Bun dependency cache and Turborepo task cache to `check.yml`.
- **Why**: Without caching, every PR run reinstalls all dependencies and rebuilds everything from scratch.
- **Type**: Config upgrade
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
    restore-keys: bun-${{ runner.os }}-

- uses: actions/cache@v4
  with:
    path: node_modules/.cache/turbo
    key: turbo-${{ runner.os }}-${{ github.sha }}
    restore-keys: turbo-${{ runner.os }}-
```
- **Verdict**: P1. Implement alongside check.yml. Critical for keeping CI fast as the monorepo grows.

### P1-9: Enforce Madge Circular Dependency Check in CI

- **Source**: Both
- **Source agreement**: Full agreement. Madge is configured locally but not enforced in CI.
- **What**: Add `bun run lint:circular` as a CI step.
- **Why**: Circular dependency regressions can slip in via PR without server-side enforcement.
- **Type**: Config upgrade
- **Effort**: Low (< 15 min)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: Yes. Effect's module system is sensitive to circular imports.
- **Config snippet**:
```yaml
- name: Circular dependency check
  run: bun run lint:circular
```
- **Verdict**: P1. Trivial to add, high value. Keep Madge rather than replacing with dependency-cruiser (see Disagreements section).

### P1-10: Enforce Syncpack in CI

- **Source**: Both
- **Source agreement**: Full agreement.
- **What**: Add `bun run syncpack lint` as a CI step.
- **Why**: Syncpack is configured but only runs locally. Drift can occur via PRs that skip local hooks.
- **Type**: Config upgrade
- **Effort**: Low (< 15 min)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: Yes. Effect packages must version-align.
- **Config snippet**:
```yaml
- name: Dependency version sync
  run: bunx syncpack lint
```
- **Verdict**: P1. Enforce what's already configured.

### P1-11: Enforce Changesets Status in CI

- **Source**: Both
- **Source agreement**: Full agreement.
- **What**: Add Changesets status check to PR workflow with an exception label for PRs that don't need changesets.
- **Why**: Ensures every PR that affects published packages includes a changeset entry.
- **Type**: Config upgrade
- **Effort**: Low (< 30 min)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
- name: Changeset status
  if: github.event_name == 'pull_request'
  run: bunx changeset status --since=origin/main
```
- **Verdict**: P1. Add exception label flow (`no-changeset` label skips check) for internal/tooling-only PRs.

### P1-12: Add OSV-Scanner Second-Source Vulnerability Scan

- **Source**: Both (Claude P0, Codex P1)
- **Source agreement**: Both recommend. Claude rates higher; Codex positions as defense-in-depth alongside bun audit.
- **What**: Add OSV-Scanner as a second-source vulnerability database check in CI.
- **Why**: `bun audit` uses npm's advisory database. OSV-Scanner uses Google's OSV database, providing broader coverage.
- **Type**: New tool
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes (standalone binary).
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
- name: OSV vulnerability scan
  uses: google/osv-scanner-action/osv-scanner-action@v2
  with:
    scan-args: |-
      --lockfile=bun.lock
```
- **Verdict**: P1. Add after bun audit is working. Two-source vulnerability scanning is industry best practice.

### P1-13: Add SAST (Semgrep)

- **Source**: Both
- **Source agreement**: Both recommend one SAST engine. Both suggest choosing between Semgrep and CodeQL. Codex explicitly recommends starting with one.
- **What**: Add Semgrep with JavaScript/TypeScript rulesets as a non-blocking CI check initially.
- **Why**: Catches security patterns (injection, auth bypass, unsafe deserialization) that linters miss.
- **Type**: New tool
- **Effort**: Medium (1-4 hrs)
- **Bun compatible**: Yes (Python-based CLI, operates on source files).
- **Effect-TS relevant**: Partial. Custom rules could enforce Effect error handling patterns.
- **Config snippet**:
```yaml
- name: SAST scan
  uses: semgrep/semgrep-action@v1
  with:
    config: p/javascript p/typescript
```
- **Verdict**: P1. Choose Semgrep over CodeQL for faster execution and better custom rule ergonomics. Start non-blocking, promote to blocking after initial triage.

### P1-14: Add Playwright E2E Baseline

- **Source**: Both
- **Source agreement**: Full agreement on Playwright over Cypress.
- **What**: Add Playwright with Chromium-only initial configuration for critical user flows in apps/web.
- **Why**: No E2E testing exists. The Next.js 16 + MUI + shadcn stack has high UI complexity.
- **Type**: New tool
- **Effort**: Medium (2-4 hrs)
- **Bun compatible**: Partial (Node-based test runner, not Bun-native).
- **Effect-TS relevant**: No.
- **Config snippet**:
```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  webServer: {
    command: "bun run --cwd apps/web dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
});
```
- **Verdict**: P1. Start with Chromium-only and 3-5 critical flow tests. Expand browser matrix later.

### P1-15: Add Renovate Dependency Automation

- **Source**: Both (Claude P0, Codex P1)
- **Source agreement**: Both agree on Renovate over Dependabot for monorepo policy control.
- **What**: Add Renovate with grouping rules for Effect stack, scheduled updates, and automerge for patch versions.
- **Why**: No automated dependency updates exist. Manual updates in a monorepo with 50+ packages don't scale.
- **Type**: New tool
- **Effort**: Medium (1-2 hrs)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: Yes. Effect packages should be grouped and updated together.
- **Config snippet**:
```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "packageRules": [
    {
      "matchPackageNames": ["effect", "@effect/*"],
      "groupName": "effect-stack",
      "automerge": false
    },
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true,
      "automergeType": "pr"
    }
  ],
  "schedule": ["before 6am on monday"]
}
```
- **Verdict**: P1. Essential for long-term maintenance. Configure with conservative grouping — Effect packages as a single PR, everything else by update type.

### P1-16: Reintroduce Nix Flake + direnv

- **Source**: Both (Codex P0, Claude P1)
- **Source agreement**: Disagree on priority. Codex rates P0 for reproducible environments; Claude rates P1 noting team comfort prerequisites.
- **What**: Add `flake.nix` pinning Bun, Node, and core CLI tools. Add `.envrc` with `use flake` for automatic shell activation.
- **Why**: Eliminates "works on my machine" drift. Makes onboarding deterministic.
- **Type**: New tool
- **Effort**: Medium (1-2 hrs)
- **Bun compatible**: Yes (Bun is available in nixpkgs).
- **Effect-TS relevant**: No.
- **Config snippet**:
```nix
# flake.nix
{
  description = "beep-effect2 dev shell";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun nodejs_22 git lefthook gitleaks
          ];
        };
      }
    );
}
```
```bash
# .envrc
use flake
```
- **Verdict**: P1. Important but not blocking CI. Use `eachDefaultSystem` (Claude's approach) for multi-platform support rather than Codex's x86_64-linux-only snippet. Start with raw flakes; evaluate `devenv.sh` later.

### P1-17: Add Root AI Governance Files

- **Source**: Both
- **Source agreement**: Full agreement.
- **What**: Add root `CLAUDE.md` and `AGENTS.md` with canonical commands, package boundaries, and coding standards.
- **Why**: AI-assisted development sessions currently lack authoritative guidance, leading to inconsistent patterns.
- **Type**: Config upgrade
- **Effort**: Medium (1-2 hrs)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: Yes. Should codify Effect v4 patterns, banned patterns, and preferred APIs.
- **Verdict**: P1. High value for development velocity. Reference existing memory files and coding standards.

### P1-18: Introduce Storybook 10 (via `@beep/ui` shared package)

- **Source**: Both (Claude P0, Codex P1)
- **Source agreement**: Disagree on priority and framework choice. Claude recommends `@storybook/nextjs` for Next.js integration; Codex recommends `@storybook/react-vite` for speed. Claude rates P0; Codex rates P1.
- **What**: Add Storybook 10 configured in the shared `@beep/ui` package (`packages/ui/ui`) with addons for a11y, docs, and themes. Storybook lives alongside the shared component library, not at the root or in a separate app.
- **Why**: UI stack (React 19 + shadcn + Tailwind v4) has no component playground or visual review pipeline. A shared `@beep/ui` package will own shared theme, shadcn components, and Storybook config so that multiple apps can consume a consistent component library with visual testing built in.
- **Type**: New tool
- **Effort**: Medium (2-4 hrs)
- **Bun compatible**: Partial (Node-based CLI/runtime).
- **Effect-TS relevant**: No (UI layer).
- **Config snippet**:
```ts
// packages/ui/ui/.storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes"
  ],
};
export default config;
```
- **Verdict**: P1. Use `react-vite` framework (Codex's recommendation is stronger — Vite is faster and framework-agnostic for shared components). Storybook is centralized in `@beep/ui` alongside the shared shadcn components, theme, and PostCSS config. Apps consume `@beep/ui` as a workspace dependency. See spec: `specs/pending/shared-ui-package/README.md`.

### P1-19: Add Bundle Analysis

- **Source**: Both (Codex P1, Claude P2)
- **Source agreement**: Both recommend. Codex rates higher with `@next/bundle-analyzer`; Claude suggests `size-limit`.
- **What**: Add `@next/bundle-analyzer` for the Next.js app and consider `size-limit` for published packages.
- **Why**: UI libs (MUI, shadcn) and transitive imports can silently inflate bundle size.
- **Type**: New tool
- **Effort**: Medium (1-2 hrs)
- **Bun compatible**: Partial.
- **Effect-TS relevant**: Yes. Effect's tree-shaking effectiveness should be monitored.
- **Verdict**: P1. Start with `@next/bundle-analyzer` for the web app. Defer package-level `size-limit` to P2.

### P1-20: Add Dependency Review Action

- **Source**: Claude only
- **Source agreement**: Codex did not mention this tool.
- **What**: Add `actions/dependency-review-action` to check.yml for PR-level dependency change review.
- **Why**: Catches known-vulnerable or license-incompatible dependencies at PR time before they merge.
- **Type**: New tool
- **Effort**: Low (< 30 min)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
- name: Dependency review
  uses: actions/dependency-review-action@v4
  if: github.event_name == 'pull_request'
```
- **Verdict**: P1. Low effort, high value. GitHub-native, no additional tooling required.

### P1-21: Add publint + attw for Package Quality

- **Source**: Claude only
- **Source agreement**: Codex did not mention these tools.
- **What**: Add `publint` and `@arethetypeswrong/cli` checks for published packages to ensure correct package.json exports and type declarations.
- **Why**: Incorrect `exports` maps and type resolution are common monorepo issues that only surface when consumers try to use the packages.
- **Type**: New tool
- **Effort**: Low (< 1 hr)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: Yes. Effect v4 packages with dual CJS/ESM must have correct exports.
- **Config snippet**:
```json
{
  "scripts": {
    "lint:publint": "turbo run publint",
    "lint:attw": "turbo run attw"
  }
}
```
- **Verdict**: P1. Especially valuable for an Effect-TS monorepo where packages are consumed across workspaces and potentially published.

### P1-22: Nix CI Binary Cache

- **Source**: Both
- **Source agreement**: Both recommend cache strategy for CI Nix usage.
- **What**: Add Nix cache action for CI jobs that use the flake dev shell.
- **Why**: Without binary cache, Nix CI steps are prohibitively slow.
- **Type**: Config upgrade
- **Effort**: Medium (1-2 hrs)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: No.
- **Config snippet**:
```yaml
- uses: DeterminateSystems/nix-installer-action@main
- uses: DeterminateSystems/magic-nix-cache-action@main
```
- **Verdict**: P1. Implement alongside P1-16 (Nix flake). Without this, Nix in CI is impractical.

---

## 6. P2 Recommendations (Nice to Have)

### P2-1: Add Chromatic Visual Review Pipeline

- **Source**: Both (Codex P1, Claude P2)
- **Source agreement**: Codex rates higher; Claude prefers starting with Playwright snapshots or Lost Pixel (free).
- **What**: Add Chromatic CI integration for PR-level visual diffs after Storybook is in place.
- **Why**: Visual regressions across MUI + shadcn + Tailwind are likely.
- **Type**: New tool (SaaS)
- **Effort**: Low (< 1 hr, after Storybook exists)
- **Bun compatible**: Partial.
- **Effect-TS relevant**: No.
- **Verdict**: P2. Evaluate after Storybook is established. Start with free Playwright snapshot tests; upgrade to Chromatic if managed review UX justifies the cost.

### P2-2: Add Contract Testing (Pact or Effect-native)

- **Source**: Both
- **Source agreement**: Codex recommends Pact; Claude suggests Effect-native contract testing as alternative.
- **What**: Add consumer/provider contract tests for service boundaries.
- **Type**: New tool
- **Effort**: High (4+ hrs)
- **Bun compatible**: Partial.
- **Effect-TS relevant**: Yes. Effect's Schema system could power contract definitions.
- **Verdict**: P2. High effort, evaluate once service boundaries are more mature. Consider Effect Schema-based approach over Pact for consistency.

### P2-3: Add Stryker Mutation Testing

- **Source**: Both
- **Source agreement**: Full agreement on P2 for core domain packages.
- **What**: Add Stryker with Vitest runner for mutation score tracking.
- **Type**: New tool
- **Effort**: High (4+ hrs)
- **Bun compatible**: Partial.
- **Effect-TS relevant**: Yes. Effect gen functions are mutation-sensitive.
- **Verdict**: P2. Scope to `packages/common/` core domain packages only.

### P2-4: Add sherif Monorepo Policy Lint

- **Source**: Both (Claude P1, Codex P2)
- **Source agreement**: Disagree on priority.
- **What**: Add `sherif` for workspace policy checks beyond Syncpack/Madge coverage.
- **Type**: New tool
- **Effort**: Medium (1-2 hrs)
- **Bun compatible**: Yes.
- **Verdict**: P2. Syncpack + Madge already cover the critical governance paths. Sherif is additive, not essential.

### P2-5: Pilot oxlint as Supplemental Diagnostics

- **Source**: Both
- **Source agreement**: Full agreement on P2, non-blocking.
- **What**: Run oxlint as optional fast pass for additional JS/TS diagnostics.
- **Type**: New tool
- **Effort**: Medium (1-2 hrs)
- **Bun compatible**: Yes (Rust binary).
- **Verdict**: P2. Only if Biome's rule coverage proves insufficient for specific patterns.

### P2-6: Add pkg.pr.new for Preview Packages

- **Source**: Both
- **Source agreement**: Full agreement on P2.
- **What**: Add pkg.pr.new workflow for installable PR preview packages.
- **Type**: New tool
- **Effort**: Medium (1-2 hrs)
- **Bun compatible**: Yes.
- **Verdict**: P2. Valuable once packages are consumed externally.

### P2-7: Add remark-lint Semantic Markdown

- **Source**: Both
- **Source agreement**: Full agreement on P2 complement to markdownlint.
- **What**: Add remark-lint if markdownlint rules prove insufficient for semantic checks.
- **Type**: New tool
- **Effort**: Medium (1-2 hrs)
- **Verdict**: P2. Evaluate only after markdownlint is in place and gaps are identified.

### P2-8: Add PR Complexity Labeling

- **Source**: Both
- **Source agreement**: Full agreement on P2.
- **What**: Use `tj-actions/changed-files` to auto-label PRs by size/complexity.
- **Type**: New tool
- **Effort**: Low (< 1 hr)
- **Verdict**: P2. Nice for review triage but not blocking.

### P2-9: Add License Compliance Gate (ORT)

- **Source**: Both (Codex P1, Claude mixed)
- **Source agreement**: Codex recommends ORT at P1 (high effort); Claude mentions lighter alternatives.
- **What**: Add ORT-based license compliance workflow.
- **Type**: New tool
- **Effort**: High (4+ hrs)
- **Bun compatible**: Partial.
- **Verdict**: P2. High effort relative to current need. The dependency-review-action (P1-20) provides basic license checking. Revisit ORT when publishing packages externally.

### P2-10: Docker Build Optimization Plan

- **Source**: Both
- **Source agreement**: Full agreement on P2 / future planning.
- **What**: Prepare multi-stage Bun Docker builds when Dockerfiles are needed.
- **Type**: Config upgrade
- **Effort**: Medium (1-4 hrs, when applicable)
- **Verdict**: P2. Not actionable until Dockerfiles exist. Document the plan now, implement later.

### P2-11: Add Property-Based Testing (fast-check)

- **Source**: Claude only
- **Source agreement**: Codex did not mention this.
- **What**: Add fast-check with Effect Schema Arbitrary integration for property-based tests on core domain types.
- **Type**: New tool
- **Effort**: Medium (2-4 hrs)
- **Bun compatible**: Yes.
- **Effect-TS relevant**: Yes. Effect Schema's `toArbitrary` annotation enables automatic generator creation.
- **Verdict**: P2. High value for data-heavy Effect packages but not urgent.

### P2-12: Add Vitest Browser Mode

- **Source**: Claude only
- **Source agreement**: Codex mentions component testing via Storybook test runner instead.
- **What**: Use Vitest's experimental browser mode for component tests without full Storybook setup.
- **Type**: New tool
- **Effort**: Medium (2-4 hrs)
- **Bun compatible**: Partial.
- **Verdict**: P2. Evaluate as complement to Storybook once both are established.

### P2-13: Add CodSpeed Benchmarking

- **Source**: Claude only
- **What**: Add CodSpeed for CI benchmark regression tracking on performance-critical packages.
- **Type**: New tool
- **Effort**: Medium (2-4 hrs)
- **Verdict**: P2. Only relevant once performance-critical code paths are identified.

### P2-14: Add Changesets Changelog Upgrade

- **Source**: Claude only
- **What**: Replace default Changesets changelog with `@changesets/changelog-github` for richer PR-linked changelogs.
- **Type**: Config upgrade
- **Effort**: Low (< 30 min)
- **Verdict**: P2. Nice improvement but not blocking.

---

## 7. Implementation Roadmap

### Session 1: Foundation Fixes (2-3 hours)

**Goal**: Fix everything that's broken and establish the CI baseline.

1. All Quick Wins (#1-12)
2. P0-1: Create `check.yml`
3. P0-2: Restore `knip.config.ts`
4. P0-3: Clean up hook stack
5. P0-4: Align Bun version
6. P0-5: Vitest coverage hardening
7. P0-7: Lefthook pre-push optimization
8. P0-8: `bunfig.toml` hardening
9. P0-9: Node version alignment

**Exit criteria**: PRs now run automated lint/test/build/coverage checks. All version mismatches resolved. All orphaned configs removed.

### Session 2: CI Hardening & Security (3-4 hours)

**Goal**: Add security scanning and enforce existing governance tools in CI.

1. P0-6: Gitleaks secret scanning
2. P1-1: `bun audit` vulnerability gate
3. P1-8: CI caching (Bun + Turbo)
4. P1-9: Enforce Madge in CI
5. P1-10: Enforce Syncpack in CI
6. P1-11: Enforce Changesets status in CI
7. P1-12: OSV-Scanner
8. P1-20: Dependency review action

**Exit criteria**: PRs check for secrets, vulnerabilities, circular deps, version sync, and changeset presence. CI is cached and fast.

### Session 3: Lint, Docs & Developer Experience (3-4 hours)

**Goal**: Add documentation quality pipeline and refine linting.

1. P1-2: Commitlint + Lefthook commit-msg hook
2. P1-3: typos-cli local spell checking
3. P1-4: cspell CI spell checking
4. P1-5: markdownlint-cli2
5. P1-6: Biome language surface tuning
6. P1-7: ESLint gap scoping audit
7. P1-16: Nix flake + direnv
8. P1-17: Root AI governance files (CLAUDE.md, AGENTS.md)

**Exit criteria**: Spell checking, markdown linting, and commit message enforcement active. Biome covers CSS/JSONC. Nix dev shell available. AI governance docs in place.

### Session 4: Testing & Security Depth (4-6 hours)

**Goal**: Add E2E testing, SAST, and package quality checks.

1. P1-13: Semgrep SAST
2. P1-14: Playwright E2E baseline (3-5 critical flow tests)
3. P1-15: Renovate dependency automation
4. P1-19: Bundle analysis (`@next/bundle-analyzer`)
5. P1-21: publint + attw package quality
6. P1-22: Nix CI cache

**Exit criteria**: Critical user flows have E2E tests. SAST running. Dependencies auto-updated. Package exports validated. Bundle size monitored.

### Session 5: UI Infrastructure & Polish (4-6 hours)

**Goal**: Establish component development infrastructure via shared `@beep/ui` package and address remaining P1/P2 items.

1. P1-18: Create `@beep/ui` shared package with Storybook 10 (see `specs/pending/shared-ui-package/`)
2. P2-1: Evaluate Chromatic vs Playwright snapshots for visual regression
3. P2-4: Evaluate sherif
4. P2-8: PR complexity labeling
5. P2-14: Changesets changelog upgrade
6. Remaining P2 items as time permits

**Exit criteria**: `@beep/ui` package with shared theme, shadcn components, and Storybook running with a11y/theme addons. `apps/web` consuming from shared package. Visual regression strategy decided. All P1 items complete.

---

## 8. Rejected Tools

| Tool                                         | Reason                                                                                                         | Source                                 |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------|----------------------------------------|
| **Husky**                                    | Lefthook is already active and well-configured. Dual hook systems create drift.                                | Both                                   |
| **Cypress**                                  | Playwright has broader browser parity, better tracing, and superior monorepo CI scaling.                       | Both                                   |
| **codespell**                                | Python-centric tooling doesn't fit Bun-first workflow. Weaker domain dictionary ergonomics than cspell.        | Both                                   |
| **Dependabot**                               | Renovate provides superior monorepo grouping, policy control, and automerge rules.                             | Both                                   |
| **Full ESLint re-adoption**                  | Biome is canonical and covers 95%+ of linting needs. ESLint should remain gap-only.                            | Both                                   |
| **Replacing Knip/Syncpack/Madge**            | These tools are correctly selected for their problems. The issue is enforcement/config drift, not tool choice. | Both                                   |
| **source-map-explorer**                      | Stale maintenance compared to `@next/bundle-analyzer` and `rollup-plugin-visualizer`.                          | Codex                                  |
| **Both CodeQL + Semgrep as mandatory gates** | Duplicate findings and triage overhead. Start with one (Semgrep) and add the other as optional later.          | Codex                                  |
| **Percy**                                    | Higher cost than Chromatic with no meaningful advantages for this stack.                                       | Claude                                 |
| **devenv.sh (for now)**                      | Raw flakes are simpler and sufficient for current needs. Re-evaluate when service orchestration grows.         | Both                                   |
| **TruffleHog as primary**                    | Gitleaks has simpler CI integration and sufficient detection quality. TruffleHog is backup.                    | Both                                   |
| **dependency-cruiser replacing Madge**       | Madge is already configured and working. Replacing a functional tool adds migration risk for marginal benefit. | Synthesis judgment (see Disagreements) |

---

## 9. Disagreements & Judgment Calls

### 9.1 Audit Score: 6.5 vs 7.5

- **Claude**: 6.5/10 — weighted missing capabilities (no CI gates, no security, no E2E) heavily.
- **Codex**: 7.5/10 — weighted strong foundation (Biome, TypeScript, Turborepo, Syncpack) heavily.
- **Verdict**: **7.0/10**. Both perspectives are valid. The foundation is genuinely strong (tools are well-chosen), but the enforcement gap is genuinely severe (zero CI quality gates for PRs).

### 9.2 typos-cli Priority: P0 (Claude) vs P2 (Codex)

- **Claude's argument**: Fast, low false-positives, perfect for pre-commit staged-file checking. Fills a complete gap.
- **Codex's argument**: cspell should be primary; typos-cli is optional complement.
- **Verdict**: **P1**. Claude's argument is stronger — typos-cli has superior performance for local hooks — but P0 is too high for spell checking. Both tools serve different niches: typos-cli for fast local feedback, cspell for comprehensive CI checking.

### 9.3 Nix Flake Priority: P0 (Codex) vs P1 (Claude)

- **Codex's argument**: P0 for reproducible environments, eliminates "works on my machine."
- **Claude's argument**: P1 because it doesn't block CI functionality and requires team Nix comfort.
- **Verdict**: **P1**. CI quality gates (P0-1) are more urgent than dev environment reproducibility. Most team members can function with Bun's `packageManager` field for version alignment.

### 9.4 Madge vs dependency-cruiser

- **Claude**: Recommends replacing Madge with dependency-cruiser (P1) for richer rule engine and visualization.
- **Codex**: Recommends keeping Madge and just enforcing it in CI.
- **Verdict**: **Keep Madge** (Codex wins). Madge is configured, tested, and working. Replacing it adds migration risk for marginal benefit. The issue is enforcement, not capability. If Madge proves insufficient later, evaluate dependency-cruiser at that point.

### 9.5 Storybook Priority: P0 (Claude) vs P1 (Codex)

- **Claude**: P0 due to UI stack complexity (React 19 + MUI + shadcn + Tailwind v4).
- **Codex**: P1, acknowledging high value but placing CI gates first.
- **Verdict**: **P1** (Codex wins). CI quality gates must come before UI infrastructure. Storybook is important but not "must-have for the repo to function" like CI checks are.

### 9.6 Storybook Framework: @storybook/nextjs vs react-vite

- **Claude**: Recommends `@storybook/nextjs` for Next.js integration (router, image optimization).
- **Codex**: Recommends `@storybook/react-vite` for speed and flexibility.
- **Verdict**: **react-vite** (Codex wins). For a monorepo Storybook that spans apps and packages, the Vite builder is faster and more portable. Next.js-specific features can be mocked in preview decorators.

### 9.7 Visual Regression: Lost Pixel vs Chromatic

- **Claude**: Recommends Lost Pixel (free, self-hosted, open-source).
- **Codex**: Recommends Chromatic (managed review UX, baseline management).
- **Verdict**: **Start with Playwright snapshots** (both agree this is the starting point), then evaluate managed options based on team needs. Neither Lost Pixel nor Chromatic is needed immediately.

### 9.8 OSV-Scanner Priority: P0 (Claude) vs P1 (Codex)

- **Claude**: P0 as primary vulnerability scanner.
- **Codex**: P1 as defense-in-depth alongside bun audit.
- **Verdict**: **P1**. `bun audit` should be the primary scanner (native, zero-config). OSV-Scanner adds value as a second database source but isn't the first line of defense.

### 9.9 License Compliance: ORT at P1 (Codex) vs lighter alternatives (Claude)

- **Codex**: Recommends ORT at P1 despite high effort.
- **Claude**: Suggests lighter approaches first.
- **Verdict**: **P2**. ORT is heavy for a project not yet publishing packages externally. GitHub's dependency-review-action provides basic license checking at P1 effort.

### 9.10 Codex `flake.nix` x86_64-linux only vs Claude `eachDefaultSystem`

- **Codex**: Only targets x86_64-linux.
- **Claude**: Uses `flake-utils.lib.eachDefaultSystem` for multi-platform.
- **Verdict**: **eachDefaultSystem** (Claude wins). Multi-platform support is important for team diversity (macOS developers exist).

---

## 10. Appendix: Source Attribution

### Files Analyzed

**Claude Code Research** (`specs/pending/best-repo-tooling-possible/claude/`):
- `00-current-state-audit.md` — Comprehensive audit, score 6.5/10, 16 categories
- `research/02-spell-check-docs-quality.md` — 8 tools evaluated, detailed Effect vocabulary
- `research/03-security-supply-chain.md` — 10 tools evaluated, noted bun audit version requirement
- `research/04-git-workflow-ci-optimization.md` — Most detailed file across both sets, full config snippets
- `research/05-testing-infrastructure.md` — 16 recommendations including property-based testing
- `research/06-storybook-component-dev.md` — 12 recommendations, Lost Pixel evaluation
- `research/07-nix-dev-environment.md` — 8 recommendations, multi-platform flake
- `research/08-advanced-emerging-tools.md` — 13 recommendations, publint/attw unique finding
- **Missing**: `01-biome-config-optimization.md` (Claude did not produce this file)

**Codex CLI Research** (`specs/pending/best-repo-tooling-possible/codex/`):
- `00-current-state-audit.md` — Structured audit, score 7.5/10, tool-by-tool ratings
- `MASTER-TOOLING-PLAN.md` — Complete prioritized plan, 5-wave implementation, rejected tools
- `research/01-biome-config-optimization.md` — Unique to Codex, CSS/GraphQL/JSONC coverage
- `research/02-spell-check-docs-quality.md` — 6 tools, less detailed than Claude
- `research/03-security-supply-chain.md` — 7 tools, less detailed than Claude
- `research/04-git-workflow-ci-optimization.md` — 6 tools, fewer config snippets than Claude
- `research/05-testing-infrastructure.md` — 6 tools, less detailed than Claude
- `research/06-storybook-component-dev.md` — 5 tools, react-vite framework choice
- `research/07-nix-dev-environment.md` — 4 tools, x86_64-linux only
- `research/08-advanced-emerging-tools.md` — 10 tools, advanced governance focus

**Actual Repo Files Verified**:
- `.bun-version` — Confirmed `1.3.2`
- `package.json` — Confirmed `packageManager: "bun@1.3.9"`
- `biome.jsonc` — Confirmed `!!` double-negation include pattern
- `lefthook.yml` — Confirmed manual `git add` instead of `stage_fixed: true`, no commit-msg hook
- `.github/workflows/release.yml` — Confirmed only workflow present

### Source Strength Assessment

| Dimension        | Claude                                                                                                        | Codex                                                 |
|------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| Research depth   | Stronger (more tools, more detail per tool)                                                                   | Good (structured, consistent format)                  |
| Config snippets  | More complete and production-ready                                                                            | Adequate but sometimes minimal                        |
| Factual accuracy | Caught bun audit version issue, Lefthook stage_fixed, .nvmrc mismatch                                         | Caught .mcp.json, redis:latest pin, Syncpack alpha    |
| Unique findings  | publint/attw, property-based testing, Lost Pixel, CodSpeed, dependency-review-action, Effect-native contracts | Biome language surface tuning, ORT license compliance |
| Prioritization   | Sometimes aggressive (P0 for spell checking)                                                                  | More conservative and practical                       |
| Coverage gaps    | Missing 01-biome-config-optimization.md                                                                       | Less detailed across all categories                   |

### Synthesis Methodology

1. When both sources agreed → adopted with high confidence.
2. When they disagreed → evaluated reasoning quality, verified factual claims against actual repo files.
3. When only one source mentioned something → evaluated on merits (not automatically lower priority).
4. Preferred concrete config snippets from whichever source provided them.
5. Bun compatibility verified for every recommendation.
6. Effect-TS relevance assessed for every recommendation.
7. The bar for new tool additions was kept high — prefer configuring existing tools over adding new ones.
