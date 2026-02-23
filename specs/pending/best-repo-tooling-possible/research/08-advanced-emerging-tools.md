# Advanced & Emerging Tools

**Research Date**: 2026-02-22
**Branch**: `effect-v4-migration`
**Scope**: Tools and config improvements for the beep-effect2 Bun/Turborepo monorepo

---

## Current State in This Repo

| Area | Current Tool | Status | Gap |
|------|-------------|--------|-----|
| Dead code detection | Knip | **NOT CONFIGURED** (referenced but missing) | No unused export/dep detection |
| Dep version sync | Syncpack 14.0.0-alpha.41 | Active, basic | No semverGroups, banned deps, or range policies |
| Circular deps | Madge 8.0.0 + custom script | Functional | Not integrated in turbo, duplicated config, known detection gaps |
| Monorepo linting | None | Missing | No structural validation |
| Linting | Biome 2.4.4 + ESLint (JSDoc) | Active | No type-aware rules, no oxlint supplement |
| PR preview packages | pkg.pr.new | Referenced for @effect/docgen | Not configured for @beep/* packages |
| Dep updates | None | **Missing** | No Renovate or Dependabot |
| Bundle analysis | None | **Missing** | No size budgets, no tree-shaking validation |
| Changelog | Changesets 2.29.8 | Well-configured | Default changelog generator (no rich format) |
| AI-friendly config | MEMORY.md only | Minimal | No root CLAUDE.md, no .cursor/, no project-level MCP |
| Package validation | None | **Missing** | No publint or attw checks |
| Docker builds | docker-compose.yml (dev services) | Dev-only | No production Dockerfile, no turbo prune |

---

## Recommendations

---

### 1. Knip (Dead Code Detection)

- **What**: Static analysis tool that finds unused files, exports, dependencies, and unlisted dependencies
- **Why**: This repo has NO dead code detection despite `knip.config.ts` being referenced in `tsconfig.json`. With Effect v4 migration in progress, dead exports and unused deps are likely accumulating across `packages/`, `tooling/`, and `apps/`.
- **Type**: New tool
- **Maturity**: Stable (v5.x, actively maintained, 10k+ GitHub stars)
- **Effort**: Medium (2-3hr) -- needs workspace-specific entry points and Effect-TS pattern tuning
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes (native Bun runtime support since v2.33.0, `bunx knip` works)
- **Pros**:
  - Finds unused files, exports, dependencies, unlisted dependencies, and duplicate exports
  - Native monorepo/workspace support -- reads `workspaces` from root `package.json`
  - 80+ built-in plugins (Vitest, TypeScript, Biome, Changesets, ESLint, etc.)
  - Incremental adoption: start with `--dependencies` then expand to `--exports`
  - CI-friendly: exits non-zero on issues, can be added as turbo task
  - Works with Bun runtime directly
- **Cons**:
  - Effect-TS re-export patterns may cause false positives (barrel files, `Schema.Class` exports)
  - Needs per-workspace `entry` and `project` tuning for accurate results
  - No dedicated Effect-TS plugin (generic TS analysis)
  - Alpha/edge dependencies (like syncpack 14.0.0-alpha) may confuse dep detection
- **Conflicts with**: None
- **Config snippet**:
```ts
// knip.config.ts
import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: ["scripts/*.mjs"],
      project: ["scripts/**/*.mjs"],
      ignoreDependencies: [
        "@typescript/native-preview", // tsgo experimental
        "lefthook",                   // git hook manager (binary)
      ],
    },
    "packages/*": {
      entry: ["src/index.ts"],
      project: ["src/**/*.ts"],
      ignore: ["src/**/*.test.ts", "dtslint/**"],
    },
    "packages/*/*": {
      entry: ["src/index.ts"],
      project: ["src/**/*.ts"],
    },
    "tooling/*": {
      entry: ["src/index.ts", "src/bin.ts"],
      project: ["src/**/*.ts"],
      ignore: ["dtslint/**"],
    },
    "apps/web": {
      entry: ["src/app/**/*.{ts,tsx}", "next.config.{js,ts}"],
      project: ["src/**/*.{ts,tsx}"],
    },
  },
};

export default config;
```

**Integration**: Add to `turbo.json` as a `knip` task, add to `lefthook.yml` pre-push, add to CI check workflow.

---

### 2. Syncpack Config Upgrade (semverGroups + Banned Deps + Range Policies)

- **What**: Expand existing syncpack config with semver range enforcement, banned dependencies, and descriptive labels
- **Why**: Current config only has 3 version groups with no range policies. Missing: enforcement of caret ranges for third-party deps, banning of problematic packages (e.g., `@effect/platform` which does not exist in v4), and no semverGroups for per-workspace range control.
- **Type**: Config upgrade
- **Maturity**: Stable (syncpack 14.x alpha, but semverGroups/banned are stable features)
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes
- **Pros**:
  - Prevents accidental pinned versions in leaf packages
  - Bans known-bad dependencies repo-wide (e.g., deprecated Effect v3 packages)
  - Ensures consistent range format (caret for libs, exact for tooling)
  - Self-documenting: descriptive labels explain the WHY behind each rule
- **Cons**:
  - Alpha version of syncpack may have edge cases with new features
  - Overly strict ranges can cause friction for developers
- **Conflicts with**: None (extends existing config)
- **Config snippet**:
```ts
import type { RcFile } from "syncpack";

const config = {
  customTypes: {
    catalog: {
      path: "catalog",
      strategy: "versionsByName",
    },
  },
  semverGroups: [
    {
      label: "Workspace packages use exact workspace protocol",
      range: "",
      dependencies: ["@beep/**"],
      packages: ["**"],
    },
    {
      label: "Third-party deps in packages use caret ranges for flexibility",
      range: "^",
      dependencies: ["**"],
      dependencyTypes: ["prod", "peer"],
      packages: ["packages/**", "tooling/**"],
    },
  ],
  versionGroups: [
    {
      label: "Catalog (Pinned) - all deps flow from root catalog for single source of truth",
      dependencies: ["**"],
      dependencyTypes: ["catalog"],
      preferVersion: "highestSemver",
    },
    {
      label: "Ban deprecated Effect v3 packages that do not exist in v4",
      dependencies: [
        "@effect/platform",
        "@effect/cli",
        "@effect/schema",
        "@effect/printer",
      ],
      isBanned: true,
    },
    {
      label: "Ban native Node.js alternatives replaced by Effect",
      dependencies: ["lodash", "underscore", "ramda"],
      isBanned: true,
    },
    {
      label: "Workspace packages use workspace: protocol for local resolution",
      dependencies: ["@beep/**"],
      packages: ["**"],
      dependencyTypes: ["dev", "prod"],
      pinVersion: "workspace:^",
    },
    {
      label: "Root devDependencies (third-party) use catalog: for centralized version management",
      dependencies: ["!@beep/**"],
      packages: ["@beep/root"],
      dependencyTypes: ["dev"],
      pinVersion: "catalog:",
    },
  ],
} satisfies RcFile;
export default config;
```

---

### 3. Dependency-Cruiser (Madge Replacement)

- **What**: Rule-based dependency validation and visualization tool for JS/TS
- **Why**: Madge has known detection gaps (does not find all circular deps), no rule engine, and the current setup duplicates config between `.madgerc` and `scripts/circular.mjs`. Dependency-cruiser provides a rule engine for architectural boundary enforcement, not just circular dep detection.
- **Type**: Replacement for Madge
- **Maturity**: Stable (v16.x, 5k+ GitHub stars, actively maintained since 2017)
- **Effort**: Medium (2-3hr) -- needs rule configuration and migration from madge
- **Priority**: P1 (high value)
- **Bun compatible**: Yes (Node-based, runs via `bunx`)
- **Pros**:
  - Rule engine: enforce module boundaries (e.g., `packages/common` cannot import from `tooling/`)
  - More accurate circular dependency detection than madge
  - Navigable HTML report with interactive dependency graph
  - Pre-compilation TypeScript dependency analysis (`tsPreCompilationDeps: true`)
  - `--init` generates sensible defaults automatically
  - CI integration: exits non-zero on violations, can output SARIF for GitHub code scanning
  - Supports `extends` for sharing rules across projects
  - Detects orphan modules (unreachable from entry points)
- **Cons**:
  - More complex configuration than madge
  - Slower than madge for simple circular-only checks (more thorough analysis)
  - No direct `.madgerc` migration path
  - Visualization requires Graphviz for SVG output
- **Conflicts with**: Replaces Madge + `scripts/circular.mjs` + `.madgerc`
- **Config snippet**:
```js
// .dependency-cruiser.cjs
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "No circular dependencies allowed",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      severity: "warn",
      comment: "Modules not reachable from entry points",
      from: { orphan: true, pathNot: ["\\.test\\.ts$", "\\.spec\\.ts$", "dtslint"] },
      to: {},
    },
    {
      name: "tooling-cannot-import-packages",
      severity: "error",
      comment: "Tooling packages must not import from packages/ (wrong direction)",
      from: { path: "^tooling/" },
      to: { path: "^packages/", dependencyTypesNot: ["type-only"] },
    },
    {
      name: "no-dev-deps-in-prod",
      severity: "error",
      from: { path: "^(packages|apps)/.*/src/", pathNot: "\\.test\\.ts$" },
      to: { dependencyTypes: ["npm-dev"] },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    doNotFollow: { path: "node_modules" },
    exclude: { path: ["dist", "build", "\\.d\\.ts$"] },
    reporterOptions: {
      dot: { theme: { graph: { rankdir: "LR" } } },
    },
  },
};
```

---

### 4. Sherif (Monorepo Structure Linter)

- **What**: Zero-config, Rust-based linter that validates monorepo structural hygiene
- **Why**: Catches issues syncpack does not: empty dep fields, root package.json misusing `dependencies` vs `devDependencies`, @types in wrong dep type for private packages, unordered deps, missing `packageManager` field. Runs in ~28ms.
- **Type**: New tool
- **Maturity**: Growing (v0.x but widely adopted, Rust binary, zero-config)
- **Effort**: Low (< 30min) -- literally zero config, just run it
- **Priority**: P1 (high value)
- **Bun compatible**: Yes (explicit Bun support, runs via `bunx sherif@latest`)
- **Pros**:
  - Zero configuration required
  - Extremely fast (~28ms for entire monorepo)
  - Auto-fix with `--fix` flag (updates package.json files + runs install)
  - Catches structural issues that syncpack/biome/eslint miss entirely
  - Rust binary -- no node_modules needed to install
  - GitHub Action available (`QuiiBz/sherif-action`)
- **Cons**:
  - Opinionated: some rules may conflict with project conventions
  - Cannot disable individual rules (all-or-nothing as of v0.x)
  - Overlaps slightly with syncpack on version consistency (but checks different things)
  - Young project, rules set may change
- **Conflicts with**: Minor overlap with syncpack (version consistency), but sherif catches structural issues syncpack does not
- **Config snippet**:
```json
// package.json script
{
  "scripts": {
    "lint:monorepo": "sherif"
  }
}
```
```yaml
# lefthook.yml addition
pre-push:
  commands:
    sherif:
      run: bunx sherif@latest
```

---

### 5. Oxlint (Supplementary Linter)

- **What**: Rust-based JavaScript/TypeScript linter with 520+ rules, 50-100x faster than ESLint
- **Why**: Biome covers formatting + basic linting, but oxlint has rules Biome lacks (e.g., vitest rules, additional react rules, import rules). It can complement Biome for rules not yet ported. However, there is significant overlap.
- **Type**: New tool (supplementary)
- **Maturity**: Stable (v1.0 released June 2025, 12k+ GitHub stars)
- **Effort**: Medium (1-2hr) -- needs config to avoid overlap with Biome
- **Priority**: P2 (nice to have)
- **Bun compatible**: Yes (Rust binary, runs via `bunx oxlint`)
- **Pros**:
  - 520+ rules including vitest, react, unicorn, promise, import plugins
  - 50-100x faster than ESLint, ~2x faster than Biome for linting
  - `eslint-plugin-oxlint` disables overlapping ESLint rules automatically
  - Type-aware rules coming via tsgolint (TypeScript Go port)
  - Can replace remaining ESLint usage for non-JSDoc rules
- **Cons**:
  - Significant rule overlap with Biome (would need careful deduplication)
  - No formatter (Biome still needed for formatting)
  - No auto-fix for many rules yet
  - Type-aware linting still experimental (tsgolint)
  - Adding a third linter (Biome + ESLint + oxlint) increases complexity
  - JSDoc rules may not match current ESLint JSDoc plugin depth
- **Conflicts with**: Overlaps heavily with Biome linting rules. Would need per-rule dedup.
- **Config snippet**:
```json
// oxlintrc.json (only enable rules Biome doesn't have)
{
  "plugins": ["vitest", "promise", "unicorn"],
  "rules": {
    "vitest/no-focused-tests": "error",
    "vitest/no-disabled-tests": "warn",
    "promise/no-return-wrap": "error",
    "unicorn/no-array-for-each": "off"
  },
  "ignorePatterns": ["dist/", "build/", ".repos/", "node_modules/"]
}
```

**Recommendation**: Defer until Biome's rule coverage gaps are clearly identified. The JSDoc ESLint config is narrow and well-scoped -- adding oxlint on top of Biome for marginal rule gains is not worth the complexity right now. Revisit when tsgolint matures.

---

### 6. pkg.pr.new (PR Preview Packages)

- **What**: Continuous preview releases from PRs -- each commit publishes to an npm-compatible URL without touching the real npm registry
- **Why**: The repo already references pkg.pr.new for `@effect/docgen`, but it is not configured for `@beep/*` packages. During the Effect v4 migration, consumers cannot test breaking changes without publishing. PR previews let downstream apps install `@beep/common@pr-123` instantly.
- **Type**: Config upgrade (already partially present)
- **Maturity**: Stable (backed by StackBlitz + Cloudflare, used by Effect, Vite, Svelte)
- **Effort**: Low (< 1hr) -- just add a GitHub Actions workflow
- **Priority**: P1 (high value during v4 migration)
- **Bun compatible**: Yes (`bunx pkg-pr-new publish` works, `--packageManager=bun` for PR comments)
- **Pros**:
  - Zero npm registry pollution (preview URLs only)
  - Works with monorepo: publishes all changed packages
  - PR comments with install commands (`bun add https://pkg.pr.new/@beep/common@abc1234`)
  - Template support for StackBlitz playgrounds
  - No tokens or registry auth needed
  - `--comment=update` keeps PR clean (single comment, edited on each push)
- **Cons**:
  - Preview URLs expire (not permanent)
  - Requires GitHub Actions (not local)
  - Only useful if packages have external consumers
- **Conflicts with**: None
- **Config snippet**:
```yaml
# .github/workflows/preview.yml
name: Preview Packages
on:
  pull_request:
    branches: [main]
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: .bun-version
      - run: bun install --frozen-lockfile
      - run: bun run build
      - run: bunx pkg-pr-new publish --comment=update --packageManager=bun './packages/*' './packages/*/*'
```

---

### 7. Renovate (Dependency Update Automation)

- **What**: Automated dependency update bot with advanced monorepo support, grouping, scheduling, and merge confidence
- **Why**: This repo has **zero** dependency update automation. During active Effect v4 migration, staying on latest Effect betas is critical. Renovate can auto-group Effect updates, pin Bun version, and batch minor/patch updates.
- **Type**: New tool
- **Maturity**: Stable (most widely used dep updater, 18k+ GitHub stars, Mend-backed)
- **Effort**: Medium (2-3hr) -- initial config + tuning groups
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes (native Bun lockfile support)
- **Pros**:
  - Native monorepo awareness: groups related workspace updates
  - `group:monorepos` preset auto-groups packages from same monorepo (e.g., all `effect` packages)
  - Merge confidence labels (age, adoption, passing rate)
  - Schedule control: batch minor/patch weekly, major immediately
  - Auto-merge for passing patch updates
  - Supports `catalog:` references in Bun workspaces
  - Platform-agnostic (GitHub, GitLab, Bitbucket, self-hosted)
  - Regex managers for non-standard version references (`.bun-version`, `.nvmrc`)
  - Free for open source, free Mend-hosted GitHub app
- **Cons**:
  - More complex config than Dependabot
  - Initial PR flood (can be mitigated with scheduling + rate limiting)
  - Needs tuning to avoid noise on alpha/beta deps
- **Conflicts with**: Dependabot (choose one). Renovate is strictly superior for monorepos.
- **Config snippet**:
```json5
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    "group:monorepos",
    ":semanticCommitTypeAll(chore)"
  ],
  "packageRules": [
    {
      "description": "Group all Effect packages together",
      "matchPackagePatterns": ["^effect", "^@effect/"],
      "groupName": "effect",
      "automerge": false
    },
    {
      "description": "Auto-merge non-major dev dependency updates",
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "description": "Pin Bun version updates",
      "matchManagers": ["custom.regex"],
      "matchPackageNames": ["bun"],
      "groupName": "bun"
    }
  ],
  "customManagers": [
    {
      "customType": "regex",
      "fileMatch": ["^\\.bun-version$"],
      "matchStrings": ["(?<currentValue>\\d+\\.\\d+\\.\\d+)"],
      "depNameTemplate": "bun",
      "datasourceTemplate": "github-releases",
      "lookupNameTemplate": "oven-sh/bun"
    }
  ],
  "schedule": ["before 6am on Monday"],
  "prConcurrentLimit": 5
}
```

---

### 8. Bundle Analysis (size-limit)

- **What**: Performance budget tool that checks JS bundle sizes on every commit/PR in CI, with tree-shaking-aware measurement
- **Why**: This repo publishes library packages (`@beep/common`, `@beep/shared`) that consumers bundle. No size budgets exist. Effect-TS is large -- ensuring tree-shaking works correctly is critical for consumer DX. A single accidental barrel re-export can pull in the entire Effect runtime.
- **Type**: New tool
- **Maturity**: Stable (size-limit v11.x, by Andrey Sitnik / PostCSS team)
- **Effort**: Medium (2-3hr) -- needs per-package size configs and baseline measurement
- **Priority**: P2 (nice to have -- becomes P1 when packages are published publicly)
- **Bun compatible**: Partial (uses esbuild/webpack internally; works in CI with Node)
- **Pros**:
  - Tree-shaking aware: `import` option tests individual export sizes
  - GitHub Action shows size diff in PR comments
  - Configurable per-package size budgets
  - Supports gzip and brotli measurement
  - Catches accidental large dependency additions
  - Can validate Effect-TS tree-shaking by importing specific modules
- **Cons**:
  - Uses webpack/esbuild internally (not Bun's bundler)
  - Needs Node.js in CI (not Bun-native)
  - Initial baseline setup requires measuring current sizes
  - Effect-TS packages may have legitimately large bundles
- **Conflicts with**: None
- **Config snippet**:
```json
// package.json (per-package)
{
  "size-limit": [
    {
      "path": "dist/esm/index.js",
      "limit": "50 kB",
      "import": "{ PackageJson }"
    },
    {
      "path": "dist/esm/index.js",
      "limit": "150 kB"
    }
  ]
}
```
```yaml
# .github/workflows/size.yml
name: Size Limit
on: pull_request
jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

---

### 9. Changesets Changelog Upgrade

- **What**: Replace default `@changesets/cli/changelog` with `@changesets/changelog-github` for richer changelogs linking to PRs, commits, and contributors
- **Why**: Current config uses the bare-minimum default changelog generator. The GitHub-flavored generator adds PR links, commit hashes, and contributor attribution -- critical for open-source packages.
- **Type**: Config upgrade
- **Maturity**: Stable (official changesets package)
- **Effort**: Low (< 30min)
- **Priority**: P2 (nice to have -- becomes P1 at public release)
- **Bun compatible**: Yes
- **Pros**:
  - Automatic PR links in CHANGELOG.md
  - Contributor attribution (thanks @username)
  - Commit hash references for traceability
  - Drop-in replacement, same changesets workflow
- **Cons**:
  - Requires `GITHUB_TOKEN` in CI for PR/user lookups
  - Slightly noisier changelogs
- **Conflicts with**: None (replaces default generator)
- **Config snippet**:
```json
// .changeset/config.json (change one line)
{
  "changelog": ["@changesets/changelog-github", { "repo": "kriegcloud/beep-effect" }]
}
```

---

### 10. AI-Friendly Repo Enhancements (CLAUDE.md + MCP)

- **What**: Add root-level `CLAUDE.md` for Claude Code project context, optimize MEMORY.md for conciseness, and configure project-level MCP servers
- **Why**: Current AI config is minimal: MEMORY.md exists but no root `CLAUDE.md`, no `.cursor/` config, no `_mcp.json`. The MEMORY.md is comprehensive but verbose (consumes significant context). A well-structured `CLAUDE.md` improves Claude Code's accuracy and reduces repeat instructions.
- **Type**: Config upgrade
- **Maturity**: Stable (CLAUDE.md is officially supported by Claude Code)
- **Effort**: Medium (1-2hr)
- **Priority**: P1 (high value -- this repo is actively developed with Claude Code)
- **Bun compatible**: N/A (not a runtime tool)
- **Pros**:
  - Every Claude Code session gets project context automatically
  - Reduces incorrect assumptions about Effect v4 API
  - Can specify preferred tools, commands, and workflows
  - Team-shareable via version control
  - MCP tool hints in CLAUDE.md guide agent to use right tools
  - Context-efficient: only include what changes behavior
- **Cons**:
  - Over-verbose CLAUDE.md wastes context tokens
  - Needs ongoing maintenance as project evolves
  - MEMORY.md and CLAUDE.md can conflict if not kept in sync
- **Conflicts with**: None
- **Config snippet**:
```markdown
<!-- CLAUDE.md (root) -->
# beep-effect2

## Quick Reference
- Package manager: Bun (see .bun-version)
- Build: `bunx turbo run build`
- Test: `npx vitest run` (NEVER `bun test`)
- Lint: `bun run lint`
- Type check: `tsc -p tsconfig.json --noEmit`

## Architecture
- packages/ - publishable library packages (Effect v4)
- tooling/ - internal dev tools (CLI, codegen, repo-utils)
- apps/web - Next.js web app

## Effect v4 Rules
- No type assertions (except `as const`)
- Use effect/Array, effect/Option, effect/String (never native)
- Schema: always annotate with identifier, title, description
- Errors: always S.TaggedErrorClass, never Data.TaggedError
- See .claude/projects/.../MEMORY.md for full API reference

## MCP Servers
- Serena: code navigation and editing
- Graphiti: shared knowledge graph at localhost:8000/mcp (group: beep-dev)
```

---

### 11. publint + attw (Package Validation)

- **What**: Two complementary tools that validate npm package exports, types, and entry points before publishing
- **Why**: This repo has composite TypeScript builds with `rewriteRelativeImportExtensions` and `verbatimModuleSyntax`. Misconfigured `exports` in `package.json` can silently break consumers. `publint` validates package structure; `attw` validates TypeScript type resolution across all module systems (CJS, ESM, bundler).
- **Type**: New tools (used together)
- **Maturity**: Stable (publint v0.3.x, attw v0.16.x, both widely adopted)
- **Effort**: Low (< 1hr) -- add to turbo build pipeline
- **Priority**: P1 (high value -- catches real packaging bugs)
- **Bun compatible**: Yes (Node-based CLI, runs via `bunx`)
- **Pros**:
  - `publint`: validates `exports`, `main`, `types`, `files` fields; checks file existence
  - `attw`: uses real TypeScript compiler to verify type resolution paths
  - Together they catch all packaging issues before publish
  - Both have CI-friendly exit codes
  - `attw` GitHub Action available for PR checks
  - Catches monorepo-specific issues (custom conditions, raw TS exports)
- **Cons**:
  - `attw` requires `npm pack` (packs the package first, then validates)
  - Some false positives on unconventional exports patterns
  - Both tools need Node.js (not Bun-native analysis)
- **Conflicts with**: None
- **Config snippet**:
```json
// package.json scripts (per-package)
{
  "scripts": {
    "validate": "publint && attw --pack ."
  }
}
```
```yaml
# turbo.json addition
{
  "tasks": {
    "validate": {
      "dependsOn": ["build"],
      "cache": true,
      "inputs": ["package.json", "dist/**"]
    }
  }
}
```

---

### 12. Docker Build Optimization (turbo prune)

- **What**: Use `turbo prune --docker` to create minimal Docker build contexts for monorepo apps, enabling efficient multi-stage builds
- **Why**: The repo has `docker-compose.yml` for dev services but no production Dockerfile for `apps/web`. When deploying, the entire monorepo is copied into Docker context. `turbo prune` creates a minimal subset with only needed packages and a pruned lockfile.
- **Type**: New tool (turbo feature)
- **Maturity**: Stable for npm/pnpm/yarn; Partial for Bun (turbo prune Bun workspace support is a requested feature as of 2025, with workarounds available)
- **Effort**: High (4hr+) -- Bun lockfile support for turbo prune may need workarounds
- **Priority**: P2 (nice to have until production deployment)
- **Bun compatible**: Partial (turbo prune exists but Bun workspace lockfile pruning has open issues)
- **Pros**:
  - Dramatically smaller Docker images (often 50% reduction)
  - Better layer caching: `json/` stage installs deps, `full/` stage copies source
  - Only includes packages needed for the target app
  - Pruned lockfile means fewer deps installed in container
- **Cons**:
  - Bun workspace support for `turbo prune` is not fully mature
  - May need to use npm/pnpm lockfile as workaround for Docker builds
  - Multi-stage Dockerfile complexity
  - Only useful when deploying containerized apps
- **Conflicts with**: None
- **Config snippet**:
```dockerfile
# Dockerfile (apps/web)
FROM oven/bun:1.3 AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune apps/web --docker

FROM oven/bun:1.3 AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile

FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN bunx turbo run build --filter=apps/web

FROM oven/bun:1.3-slim AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
EXPOSE 3000
CMD ["bun", "run", "start"]
```

---

### 13. Runtime Validation & Observability (Effect-native)

- **What**: Leverage Effect's built-in OpenTelemetry integration for tracing, metrics, and structured logging -- no additional runtime type checking tools needed
- **Why**: Effect v4 already provides: `@effect/opentelemetry` for distributed tracing, `Effect.log`/`Effect.logDebug` for structured logging, Schema decode for runtime type validation at boundaries. The repo has Grafana OTEL-LGTM stack in `docker-compose.yml`. The gap is not tooling but configuration and usage patterns.
- **Type**: Config upgrade (wire existing tools together)
- **Maturity**: Stable (Effect's OTEL integration, Grafana LGTM stack)
- **Effort**: Medium (2-3hr) -- configure NodeSdk.layer, wire to Grafana collector
- **Priority**: P2 (nice to have for dev, P0 for production)
- **Bun compatible**: Yes (Effect's OTEL works with Bun)
- **Pros**:
  - Zero additional dependencies (Effect + existing Grafana stack)
  - Every `Effect.gen` span is automatically traced
  - Schema.decodeUnknown provides runtime type validation at API boundaries
  - Structured logging with levels, annotations, and spans
  - Grafana LGTM provides logs, traces, and metrics in one UI
- **Cons**:
  - Requires wiring `NodeSdk.layer` into app entry points
  - OTEL overhead in dev mode (can disable via env var)
  - Schema decode errors need proper error mapping for observability
- **Conflicts with**: None (already in the stack, just needs wiring)
- **Config snippet**:
```ts
// apps/web/src/instrumentation.ts (Effect OTEL setup)
import { NodeSdk } from "@effect/opentelemetry"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { Layer } from "effect"

const TracingLive = NodeSdk.layer(() => ({
  resource: { serviceName: "beep-web" },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" })
  ),
}))
```

---

## Summary: Priority Matrix

| Priority | Tool | Effort | Impact |
|----------|------|--------|--------|
| **P0** | Knip (dead code detection) | Medium | Eliminates accumulated dead code from v4 migration |
| **P0** | Renovate (dep automation) | Medium | Prevents stale deps, auto-groups Effect updates |
| **P1** | Syncpack config upgrade | Low | Prevents banned deps, enforces range consistency |
| **P1** | Dependency-cruiser (replaces madge) | Medium | Architectural boundary enforcement + better circular detection |
| **P1** | Sherif (monorepo linter) | Low | Catches structural issues no other tool finds |
| **P1** | pkg.pr.new config | Low | PR preview packages during v4 migration |
| **P1** | publint + attw | Low | Catches packaging bugs before publish |
| **P1** | CLAUDE.md + AI config | Medium | Better AI-assisted development |
| **P2** | Oxlint | Medium | Marginal linting gains over Biome (defer) |
| **P2** | size-limit (bundle analysis) | Medium | Size budgets for published packages |
| **P2** | Changesets changelog upgrade | Low | Richer changelogs with PR links |
| **P2** | Docker turbo prune | High | Optimized Docker builds (Bun support partial) |
| **P2** | Effect OTEL wiring | Medium | Observability (P0 for production) |

---

## Recommended Implementation Order

1. **Sherif** -- zero config, run it now, fix structural issues (30 min)
2. **Syncpack upgrade** -- expand existing config with banned deps + semverGroups (1 hr)
3. **Knip** -- create `knip.config.ts`, tune for Effect patterns, add to CI (2-3 hr)
4. **Renovate** -- install GitHub app, configure groups for Effect packages (2-3 hr)
5. **publint + attw** -- add to turbo build pipeline per-package (1 hr)
6. **CLAUDE.md** -- create root CLAUDE.md, optimize MEMORY.md (1-2 hr)
7. **pkg.pr.new** -- add preview workflow for @beep/* packages (1 hr)
8. **Dependency-cruiser** -- replace madge, add architectural rules (2-3 hr)
9. **Changesets changelog** -- swap to `@changesets/changelog-github` (30 min)
10. **size-limit** -- baseline measurement, add budgets (2-3 hr)
11. **Effect OTEL** -- wire NodeSdk.layer to Grafana (2-3 hr)
12. **Docker optimization** -- turbo prune + multi-stage (4+ hr, when needed)
13. **Oxlint** -- evaluate when Biome gaps are clear (defer)

---

## Sources

- [Knip documentation](https://knip.dev/)
- [Knip monorepos & workspaces](https://knip.dev/features/monorepos-and-workspaces)
- [Syncpack banned dependencies](https://jamiemason.github.io/syncpack/version-groups/banned/)
- [Syncpack semver groups](https://jamiemason.github.io/syncpack/semver-groups/ignored/)
- [Dependency-cruiser GitHub](https://github.com/sverweij/dependency-cruiser)
- [Dependency-cruiser vs Madge comparison](https://github.com/sverweij/dependency-cruiser/issues/203)
- [Sherif GitHub](https://github.com/QuiiBz/sherif)
- [Sherif monorepo article](https://blog.productsway.com/must-have-tool-for-your-javascript-monorepo-sherif)
- [Oxlint v1.0 release](https://www.infoq.com/news/2025/08/oxlint-v1-released/)
- [Oxlint vs Biome discussion](https://github.com/oxc-project/oxc/discussions/1709)
- [Biome vs Oxlint type-aware linting](https://www.solberg.is/fast-type-aware-linting)
- [pkg.pr.new GitHub](https://github.com/stackblitz-labs/pkg.pr.new)
- [pkg.pr.new announcement](https://blog.stackblitz.com/posts/pkg-pr-new/)
- [Renovate bot comparison](https://docs.renovatebot.com/bot-comparison/)
- [Renovate vs Dependabot](https://www.turbostarter.dev/blog/renovate-vs-dependabot-whats-the-best-tool-to-automate-your-dependency-updates)
- [size-limit GitHub](https://github.com/ai/size-limit)
- [Changesets vs semantic-release](https://brianschiller.com/blog/2023/09/18/changesets-vs-semantic-release/)
- [Creating the perfect CLAUDE.md](https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/)
- [Claude Code MCP docs](https://code.claude.com/docs/en/mcp)
- [publint documentation](https://publint.dev/docs/)
- [publint vs attw comparison](https://publint.dev/docs/comparisons)
- [attw GitHub Action](https://github.com/boyum/attw-action)
- [Turbo prune Docker guide](https://turborepo.dev/docs/guides/tools/docker)
- [Effect OpenTelemetry docs](https://effect.website/docs/observability/tracing/)
