# Current State Audit — beep-effect2 Monorepo

**Audit Date**: 2026-02-22
**Branch**: `effect-v4-migration`
**Overall Score**: 6.5/10 — Solid foundation with several gaps and inconsistencies

---

## 1. Package Manager: Bun

| File | Value |
|------|-------|
| `.bun-version` | 1.3.2 |
| `package.json#packageManager` | bun@1.3.9 |
| `bunfig.toml` | linker=hoisted, strict-peer-deps, @buf scoped registry |
| `.nvmrc` | 22 (Node fallback) |
| `.npmrc` | @buf registry only, defers to bunfig.toml |

**Issues**:
- **VERSION MISMATCH**: `.bun-version` says 1.3.2, `packageManager` field says 1.3.9. CI uses `.bun-version` via `bun-version-file:` — these must agree.
- `bunfig.toml` has `saveTextLockfile = true` — good for diffability.

**Assessment**: Needs tuning (version mismatch)

---

## 2. Linter & Formatter: Biome v2.4.4

**Config**: `biome.jsonc` (188 lines)

**Enabled Features**:
- Formatter: 120 char line width, 2-space indent, semicolons, ES5 trailing commas
- Linter: `recommended: true` base with heavy overrides
- VCS integration: git-aware, uses `.gitignore`
- Import organization: via `assist.actions.source.organizeImports`
- JSON: comments allowed, 80 char line width, no trailing commas

**Disabled Rules (34 rules off)** — many justified by Effect-TS patterns:
- `noForEach`, `noStaticOnlyClass`, `noArguments` — Effect uses these
- `noUnusedVariables` — handled by TypeScript `noUnusedLocals`
- `useExhaustiveDependencies` — Effect's reactive model differs
- `noDoubleEquals`, `noPrototypeBuiltins` — intentional leniency
- `noNonNullAssertion` — off (MEMORY.md bans `!` via convention, not linter)
- `noExplicitAny` — warn globally, overridden to warn in tooling/test

**Missing**:
- No CSS linting configured (Biome 2.x supports CSS)
- `noUnusedVariables` off — leaves a gap since `noUnusedImports` is error but unused vars aren't caught by biome
- No `nursery` rules evaluated — Biome 2.4 has useful nursery rules
- `noConsole` not configured — useful for library packages
- `formatWithErrors: true` — risky, formats even if parse errors exist
- Excludes `!**/*.css` but also doesn't lint CSS — contradictory
- `!!**/public`, `!!**/build` pattern looks like double-negation bugs (should be `!**/public`)

**Assessment**: Good base, needs tuning — several rules to re-evaluate, CSS linting gap

---

## 3. ESLint (Supplementary — JSDoc only)

**Configs**:
- `eslint.config.mjs` — Root: JSDoc enforcement for `tooling/*/src/**/*.ts`
- `apps/web/eslint.config.mjs` — Next.js: core-web-vitals + typescript

**Root ESLint scope**: Only for JSDoc quality via `eslint-plugin-jsdoc` v62.7.0
- Requires JSDoc on all public exports (functions, classes, types, interfaces, variables)
- Requires descriptions, params, returns
- Minimum 20-char descriptions, 5-char param/return descriptions
- Custom rule: `require-category-tag` (in `eslint-rules/require-category-tag.mjs`)
- Checks for `@category` tag on exported symbols
- Barrel files require `@packageDocumentation` + `@since`

**Assessment**: Well-configured for its narrow scope. Custom @category rule is a nice touch.

---

## 4. Build Orchestration: Turborepo v2.8.10

**Config**: `turbo.json`

**Tasks defined**: `build`, `lint`, `lint:fix`, `check`, `docgen`
- `build`: Cached, depends on `^build`, proper output/input globs
- `lint`/`lint:fix`: Cached, depends on `^lint`/`^lint:fix`
- `check`: Not cached (correct for type checking), depends on `^build` + `^check`
- `docgen`: Cached, outputs `docs/**`, `dtslint/**`

**Global config**:
- `globalDependencies`: env files + tsconfig files
- `globalEnv`: TURBO_TOKEN, TURBO_TEAM (remote cache vars defined but not configured)
- `globalPassThroughEnv`: NODE_TLS_REJECT_UNAUTHORIZED, AWS_*, SST_*

**Missing**:
- No `test` task defined — tests run via root `vitest run`, not per-package via turbo
- No `dev` task defined
- Remote caching not configured (TURBO_TOKEN/TEAM declared but unused in CI)
- `lint` task has `dependsOn: ["^lint"]` — cascading lint is unusual and slow; lint tasks are typically independent
- No `turbo.json` caching for spell check, security audit, etc.

**Assessment**: Functional but basic — missing key tasks, no remote caching

---

## 5. Dead Code Detection: Knip

**Config file**: `knip.config.ts` — **DOES NOT EXIST IN ROOT**
- Referenced in `tsconfig.json` includes but file is missing
- Only found in `.repos/beep-effect/knip.config.ts` (old repo)

**Assessment**: **NOT CONFIGURED** despite being listed in the repo context. Needs creation.

---

## 6. Dependency Version Sync: Syncpack v14.0.0-alpha.41

**Config**: `syncpack.config.ts`

**Version groups**:
1. Catalog (Pinned): All deps use `highestSemver` from catalog
2. Workspace packages: `@beep/**` must use `workspace:^`
3. Root devDeps: Third-party must use `catalog:` references

**Custom types**: `catalog` type with `versionsByName` strategy

**Missing**:
- No `semverGroup` rules for range restrictions
- No `banned` dependencies list
- No `label` descriptions explaining WHY each group exists (only labels exist)
- Version groups don't cover `packages/*/package.json` devDeps specifically

**Assessment**: Good base, needs expansion for semver range policies

---

## 7. Circular Dependency Detection: Madge v8.0.0

**Config**: `.madgerc` + `scripts/circular.mjs`

**`.madgerc`**: Basic config — ts/tsx extensions, skip type imports, exclude dist/public/build/node_modules
**`scripts/circular.mjs`**: Custom wrapper that:
- Walks `packages/`, `tooling/`, `apps/` directories
- Feeds all `.ts` files (excluding `.d.ts`) to madge
- Exits non-zero on any circular dependency

**Missing**:
- Not integrated as a turbo task
- Not in pre-push hook (only pre-commit has biome+jsdoc)
- Duplicated configuration between `.madgerc` and `scripts/circular.mjs`

**Assessment**: Functional but integration could be tighter

---

## 8. Git Hooks: Lefthook v2.1.1

**Config**: `lefthook.yml` (NOT Husky despite `.husky/` mentioned in context)

**Hooks**:
- `pre-commit` (parallel):
  - `biome`: Format staged files matching ts/tsx/js/jsx/json/jsonc/css/md
  - `jsdoc`: ESLint JSDoc rules on staged `tooling/*/src/**/*.ts`
- `pre-push` (parallel):
  - `typecheck`: turbo build + tsc --noEmit
  - `test`: vitest run

**Also exists**: `.lintstagedrc.json` — likely dead/orphaned (biome format only)

**Missing**:
- No commit message linting (commitlint)
- Pre-push runs full build + typecheck + all tests — potentially slow
- No `prepare-commit-msg` hook for conventional commits

**Assessment**: Good but missing commit message enforcement

---

## 9. Changesets v2.29.8

**Config**: `.changeset/config.json`

- `access: "restricted"` — private packages
- `baseBranch: "main"`
- `commit: false` — no auto-commits on version
- Ignores: scratchpad, @beep/repo-cli, @beep/codebase-search, @beep/repo-utils (tooling)
- `updateInternalDependencies: "patch"`
- Uses default changelog generator

**Assessment**: Well-configured for current needs

---

## 10. TypeScript v5.9.3

**Configs**:
- `tsconfig.base.json`: Shared strict settings, composite builds, Effect language service
- `tsconfig.json`: Root — includes tests, references `tsconfig.packages.json`
- `tsconfig.packages.json`: Project references for all workspace packages

**Notable settings**:
- `erasableSyntaxOnly: true` — Bun-compatible, no enums
- `rewriteRelativeImportExtensions: true` — .ts → .js at build
- `verbatimModuleSyntax: true` — strict import/export
- `exactOptionalPropertyTypes: true` — strictest optional handling
- All strict flags on: `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`, `noFallthroughCasesInSwitch`
- `@effect/language-service` plugin configured
- `@typescript/native-preview` 7.0.0-dev in catalog (tsgo)

**Also has**: `build:tsgo` and `check:tsgo` scripts for TypeScript native compiler

**Assessment**: Excellent — strictest possible configuration, future-proofed with tsgo

---

## 11. Testing: Vitest + @effect/vitest + tstyche

**Config**: `vitest.config.ts` (root workspace-style)

- Uses `projects` array pointing to per-package vitest configs
- Bun-aware: conditional exclusions when running under Bun
- Coverage via `@vitest/coverage-v8` (in catalog)
- Type testing via `tstyche` v6.2.0

**Root scripts**:
- `test`: `vitest run && tstyche`
- `test:watch`: `vitest`
- `test:types`: `tstyche`
- `coverage`: `vitest --coverage`

**Missing**:
- No coverage thresholds configured
- No vitest workspace file (uses older `projects` approach)
- No turbo `test` task — tests bypass turborepo caching
- No E2E testing framework
- No visual regression testing
- No component testing (Storybook)

**Assessment**: Functional unit testing, missing coverage enforcement and higher-level testing

---

## 12. CI: GitHub Actions

**Workflows**: Only `release.yml`

**Jobs**:
1. `release-pr`: On push to main — creates/updates release PR via changesets/action
2. `publish`: Manual workflow_dispatch with `PUBLISH` confirmation, uses `release-publish` environment

**Setup**: Bun (from `.bun-version`) + Node 20

**CRITICAL MISSING**:
- **No `check.yml` CI workflow** — no PR checks, no lint gate, no test gate
- No matrix testing (Node versions, OS)
- No Bun caching in CI
- No Turborepo remote cache in CI
- No security scanning workflow
- No dependency review workflow
- Node 20 in CI but `.nvmrc` says 22

**Assessment**: **Severely incomplete** — only release workflow exists, no quality gates

---

## 13. Docker: docker-compose.yml

**Services**:
- `postgres`: pgvector/pgvector:pg17, WAL replication enabled, 200 max connections
- `redis`: Latest, persistent volume
- `grafana`: OTEL-LGTM stack (Grafana + OpenTelemetry), custom otelcol config

**Assessment**: Good for local dev, properly configured

---

## 14. AI Configs

**Present**:
- `.claude/settings.json`: Enables `claude-md-management` and `serena` plugins
- No root `CLAUDE.md` — exists only in `.repos/` subdirectories
- No root `AGENTS.md`
- No `_mcp.json` in root
- No `.patterns/` directory

**Assessment**: Minimal AI config — memory file (MEMORY.md) is comprehensive but no project-level CLAUDE.md

---

## 15. Nix / Dev Environment

- **No `flake.nix` in root** — only in `.repos/` subdirectories
- No `devenv.sh` or `devenv.nix`
- No `.envrc` for direnv

**Assessment**: **NOT CONFIGURED** despite being listed in repo context

---

## 16. Additional Observations

### Orphaned/Dead Config
- `.lintstagedrc.json` — Lefthook is the active hook manager, lint-staged config is dead
- `.husky/` — Only in `.repos/` subdirectories, not in root; Lefthook replaced Husky
- `knip.config.ts` reference in tsconfig.json — file doesn't exist

### Version Mismatches
- `.bun-version` (1.3.2) vs `package.json#packageManager` (bun@1.3.9)
- `.nvmrc` (22) vs CI Node version (20)

### Script Inconsistencies
- `lint` script chains: biome check + eslint + circular + turbo docgen + docs.mjs + lint:jsdoc + lint:circular
  - `lint:jsdoc` runs ESLint which is ALREADY in the `lint` chain
  - `lint:circular` runs `scripts/circular.mjs` which is ALREADY in the chain
  - These duplicate steps double the lint time

### Missing from Repo
- No spell checking
- No commit message linting
- No security/dependency auditing
- No secret scanning
- No license compliance checking
- No dependency update automation (Renovate/Dependabot)
- No PR quality checks CI workflow
- No E2E testing
- No Storybook
- No bundle analysis
- No monorepo linting tool (sherif)

---

## Summary Table

| Tool | Version | Status | Quality |
|------|---------|--------|---------|
| Bun | 1.3.2/1.3.9 | Active (version mismatch) | Needs fix |
| Biome | 2.4.4 | Active | Good, needs tuning |
| ESLint | 10.0.1 | Active (JSDoc+Next.js only) | Well-scoped |
| Turborepo | 2.8.10 | Active | Basic, missing tasks |
| Knip | - | **NOT CONFIGURED** | Missing |
| Syncpack | 14.0.0-alpha.41 | Active | Good base |
| Madge | 8.0.0 | Active | Functional |
| Lefthook | 2.1.1 | Active | Good, missing commitlint |
| lint-staged | - | **DEAD** (orphaned) | Remove |
| Changesets | 2.29.8 | Active | Well-configured |
| TypeScript | 5.9.3 | Active | Excellent |
| Vitest | via @effect/vitest | Active | Missing coverage thresholds |
| tstyche | 6.2.0 | Active | Good |
| @effect/docgen | PR build | Active | Good |
| Docker | - | Active | Good |
| GitHub Actions CI | - | **Release only** | Severely incomplete |
| Nix | - | **NOT CONFIGURED** | Missing |
| Spell check | - | Not present | Missing |
| Commitlint | - | Not present | Missing |
| Security scanning | - | Not present | Missing |
| Dep automation | - | Not present | Missing |
| E2E testing | - | Not present | Missing |
| Storybook | - | Not present | Missing |
