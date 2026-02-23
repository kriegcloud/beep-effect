# Advanced & Emerging Tools

## Current State
- Knip: root `knip.config.ts` is missing, though `tsconfig.json` references it.
- Syncpack: configured well but pinned to `14.0.0-alpha.41` while stable `14.0.0` exists.
- Madge: configured, but no CI gate currently enforces circular dependency regressions.
- No monorepo policy linter beyond Syncpack/Madge.
- No automated dependency update platform configured.
- No bundle analysis workflow is configured.
- Root AI guidance files (`CLAUDE.md`, `AGENTS.md`, `.patterns`) are missing.
- No Dockerfile exists, so Docker build optimization is currently not applicable beyond planning.
- Current quality: `needs tuning`.

## Recommendations

### Knip Config Recovery (Do Not Replace Knip)
- What: Restore root `knip.config.ts` or remove stale references from TypeScript config.
- Why: Current state is internally inconsistent and can break type/tooling workflows.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P0 (must-have)
- Bun compatible: Yes
- Pros: Restores declared dead-code policy integrity.
- Cons: Requires deciding canonical include/exclude strategy.
- Conflicts with: None.
- Config snippet:
```ts
// knip.config.ts
export default {
  entry: ["apps/**/src/index.ts", "packages/**/src/index.ts"],
  project: ["apps/**", "packages/**", "tooling/**"],
  ignore: ["**/*.test.ts", "**/*.stories.tsx"]
};
```

### Syncpack Stabilization (Alpha -> Stable)
- What: Move from `syncpack@14.0.0-alpha.41` to stable `14.0.0` and re-run policy checks.
- Why: You already rely on Syncpack heavily; stable channel reduces churn risk.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Same feature intent with lower breakage risk.
- Cons: Minor migration validation required.
- Conflicts with: None.
- Config snippet:
```json
{
  "devDependencies": {
    "syncpack": "14.0.0"
  }
}
```

### Madge Enforcement in CI (Do Not Replace Madge)
- What: Add CI job for existing `lint:circular` script and fail PRs on cycles.
- Why: Madge is configured but not enforced server-side.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Turns existing config into an actual gate.
- Cons: May expose legacy cycles that need phased cleanup.
- Conflicts with: None.
- Config snippet:
```yaml
- name: Circular deps
  run: bun run lint:circular
```

### sherif (Monorepo Policy Lint Beyond Syncpack)
- What: Pilot `sherif` for workspace policy checks (dependency boundaries, script consistency, package hygiene).
- Why: Complements Syncpack/Madge with monorepo governance checks not covered by either.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P2 (nice to have)
- Bun compatible: Yes
- Pros: Fast checks, purpose-built for JS monorepos.
- Cons: Additional policy surface to tune.
- Conflicts with: Potential overlap with custom repo-utils checks.
- Config snippet:
```json
{
  "scripts": {
    "lint:repo": "bunx sherif"
  }
}
```

### oxlint (Complementary Fast Rule Engine)
- What: Run `oxlint` as an optional, non-blocking fast pass for extra JS/TS diagnostics.
- Why: Can provide additional performance-oriented lint signal while Biome remains canonical formatter/linter.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P2 (nice to have)
- Bun compatible: Yes
- Pros: Very fast Rust-based lint execution.
- Cons: Rule overlap with Biome; avoid making both auto-fix authorities.
- Conflicts with: Biome if both are treated as source-of-truth linters.
- Config snippet:
```json
{
  "scripts": {
    "lint:ox": "bunx oxlint ."
  }
}
```

### pkg.pr.new for Preview Package Distribution
- What: Add pkg.pr.new workflow for tooling/internal packages to provide installable PR previews.
- Why: Speeds cross-team validation of package changes before formal release.
- Type: New tool
- Maturity: Growing
- Effort: Medium (1-4hr)
- Priority: P2 (nice to have)
- Bun compatible: Yes
- Pros: No npm publish needed for preview consumption.
- Cons: Extra CI workflow and release-preview conventions.
- Conflicts with: None.
- Config snippet:
```yaml
- uses: stackblitz-labs/pkg.pr.new@latest
```

### Renovate over Dependabot (Monorepo Update Strategy)
- What: Prefer Renovate for grouped, policy-driven dependency update PRs.
- Why: Monorepos with catalog/workspace dependencies usually need grouping, schedules, and granular rules beyond Dependabot defaults.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Rich grouping rules, automerge policies, lockfile maintenance.
- Cons: Larger config surface than Dependabot.
- Conflicts with: Dependabot (avoid running both for the same ecosystem).
- Config snippet:
```json
{
  "extends": ["config:recommended"],
  "packageRules": [
    { "matchPackageNames": ["@effect/*", "effect"], "groupName": "effect-stack" }
  ]
}
```

### Bundle Analysis + Tree-Shaking Validation
- What: Add bundle-size checks using `@next/bundle-analyzer` (web app) and `rollup-plugin-visualizer`/size budgets for packages.
- Why: Detects regressions from UI libs and transitive imports early.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Quantitative guardrails for frontend/runtime payload.
- Cons: Requires baseline thresholds and maintenance.
- Conflicts with: None.
- Config snippet:
```js
// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer';
export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })({});
```

### AI-Friendly Repo Surface (Canonical Root Files)
- What: Add root `CLAUDE.md`, root `AGENTS.md`, and `.patterns/` with canonical coding/review/tooling directives.
- Why: Current guidance is fragmented; AI and human contributors need one authoritative source.
- Type: Config upgrade
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Better consistency across assisted development sessions.
- Cons: Requires ownership of docs maintenance.
- Conflicts with: None.
- Config snippet:
```md
# AGENTS.md
- Canonical lint/test/build commands
- Required CI checks
- Package boundary and ownership rules
```

### Docker Build Optimization Plan (Future)
- What: If/when Dockerfiles are introduced, use multi-stage builds with Bun install cache and explicit non-root runtime users.
- Why: Current repo has compose services only, but shipping artifacts will need reproducible secure image builds.
- Type: Config upgrade
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P2 (nice to have)
- Bun compatible: Yes
- Pros: Smaller, safer images and faster CI builds.
- Cons: Not actionable until Dockerfiles exist.
- Conflicts with: None.
- Config snippet:
```Dockerfile
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
```

## Head-to-Head Notes
- Renovate vs Dependabot:
  - Renovate is better for monorepo grouping/policy control.
  - Dependabot is simpler but less expressive for complex workspace/cascade updates.
- Biome vs oxlint:
  - Keep Biome as canonical formatter/linter.
  - Treat oxlint as supplemental diagnostics only.
