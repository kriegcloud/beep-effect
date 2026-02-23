# Master Tooling Plan

## 1. Executive Summary
Current state score: **7.5 / 10**

The monorepo already has a strong foundation (Bun, Turbo, Biome, strict TypeScript, Syncpack/Madge, Lefthook), but it is missing key enforcement and consistency layers:
- No PR CI quality gate workflow.
- Tooling drift/inconsistency (`knip.config.ts` missing, Bun version pin mismatch, hook stack ambiguity).
- Security/compliance checks are not first-class in CI.
- Documentation quality pipeline (spelling/markdown/JSDoc policy) is incomplete.
- Nix and root AI governance artifacts are absent despite being part of the intended operating model.

Target vision (9.5/10):
- One canonical local hook + CI path.
- Full PR gates for lint/test/type/build/security.
- Bun-first supply-chain hardening and vulnerability scanning.
- Clear docs/API quality pipeline.
- Optional but mature UI and advanced monorepo governance layers.

## 2. Recommendations by Priority

### P0 (must-have)
1. **Add CI check workflow (`check.yml`)** for PR/push with `bun install --frozen-lockfile` + `turbo run lint test check build --affected`.
2. **Fix Knip configuration drift**: restore root `knip.config.ts` or remove stale include.
3. **Consolidate hooks to Lefthook only** (resolve lint-staged/Husky ambiguity).
4. **Add Bun vulnerability gate**: `bun audit --audit-level=high` in CI.
5. **Add secret scanning baseline** with Gitleaks on PRs.
6. **Enable Bun supply-chain hardening** in `bunfig.toml` (`minimumReleaseAge`, explicit `trustedDependencies`).
7. **Harden Vitest coverage policy** with thresholds + CI-friendly reporters.

### P1 (high value)
1. **Align Bun pinning** between `packageManager` and `.bun-version`.
2. **Biome language-surface tuning** for CSS/GraphQL/JSONC policy and rule hardening pass.
3. **Scope ESLint to gap-only checks** (JSDoc/framework-specific gaps), keeping Biome primary.
4. **Add commit message linting** (`commitlint` conventional config).
5. **Optimize CI caching** for Bun + Turbo local/remote cache.
6. **Enforce existing Madge/Syncpack checks in CI** (no tool replacement).
7. **Stabilize Syncpack** from alpha to stable release line.
8. **Add Changesets PR enforcement** (`changeset status` + exception label flow).
9. **Add OSV-Scanner second-source vuln scan** (defense in depth).
10. **Add SAST** (CodeQL or Semgrep; choose one primary).
11. **Add license compliance gate** (ORT-based policy workflow).
12. **Introduce Storybook 10** + addon baseline (`a11y`, `docs`, `themes`).
13. **Add Chromatic visual review pipeline**.
14. **Add Playwright E2E baseline** for critical flows.
15. **Reintroduce Nix flake files** (`flake.nix`, `flake.lock`) and add Nix CI cache strategy.
16. **Add root AI governance files** (`CLAUDE.md`, `AGENTS.md`, `.patterns/`).
17. **Add bundle analysis checks** (`@next/bundle-analyzer` and package bundle metrics).

### P2 (nice to have)
1. **Add `typos-cli` staged-file typo gate** (optional complement to cspell).
2. **Add `remark-lint` semantic markdown layer** if markdownlint rules are insufficient.
3. **Add PR complexity labeling** (`tj-actions/changed-files` thresholds).
4. **Add mutation testing** (Stryker) for core domain packages.
5. **Add contract testing layer** (Pact) for service boundaries.
6. **Add `sherif` policy lint** for extra monorepo governance.
7. **Pilot `oxlint` as non-blocking supplemental diagnostics**.
8. **Adopt `pkg.pr.new`** for preview package distribution on selected packages.
9. **Evaluate `devenv.sh` only if raw flakes become insufficient**.
10. **Prepare Docker build hardening plan** (multi-stage Bun images) when Dockerfiles are introduced.

## 3. Dependency-Aware Implementation Order

### Wave 0: Stabilize existing baseline (Day 1)
1. Fix Knip config drift.
2. Align Bun version pinning.
3. Consolidate hook stack ownership.
4. Add Vitest coverage thresholds/reporters.

### Wave 1: Core CI gates (Day 1-2)
1. Add `check.yml` PR workflow.
2. Add Bun + Turbo caching.
3. Enforce Changesets status in PR checks.
4. Enforce Madge/Syncpack checks in CI.

### Wave 2: Security/compliance hardening (Day 2-3)
1. Add Bun audit gate.
2. Add Gitleaks PR gate.
3. Add OSV-Scanner and choose SAST engine.
4. Add license compliance workflow (ORT).
5. Add Bun `minimumReleaseAge` policy.

### Wave 3: Lint/docs quality improvements (Day 3-4)
1. Biome language/rule tuning.
2. Add cspell and markdownlint.
3. Scope ESLint to JSDoc/framework gap-only checks.

### Wave 4: UI + testing expansion (Day 4-6)
1. Add Playwright E2E baseline.
2. Add Storybook 10 and UI addon baseline.
3. Add Chromatic visual review.
4. Optional: contract + mutation tests on critical packages.

### Wave 5: Advanced governance and DX (Day 6+)
1. Add Renovate.
2. Optional sherif/oxlint pilots.
3. Add pkg.pr.new for selected packages.
4. Add root AI governance docs and Nix shell polish.

## 4. Estimated Total Effort (hours)
- P0 set: **8-14 hours**
- P1 set: **24-40 hours**
- P2 set: **16-30 hours**
- **Total full plan:** **48-84 hours**

Pragmatic target for immediate value (P0 + top P1 subset): **18-30 hours**.

## 5. Quick Wins (< 1 hour each)
1. Align `.bun-version` with `packageManager`.
2. Restore/remove stale `knip.config.ts` reference.
3. Remove hook ambiguity (Lefthook-only ownership).
4. Add `bun audit --audit-level=high` CI step.
5. Add `bun run lint:circular` CI step.
6. Add `bun run changeset:status` CI step.
7. Add Vitest coverage reporters (`text`, `lcov`, `json-summary`).
8. Add `cspell` baseline config with custom words.
9. Add `markdownlint-cli2` baseline config.
10. Add Bun `minimumReleaseAge` to `bunfig.toml`.

## 6. Tools Evaluated and Rejected

1. **Husky (reintroduction)**
- Rejected because Lefthook is already active; dual hook systems create drift/confusion.

2. **Cypress (as primary E2E framework)**
- Rejected in favor of Playwright for broader browser parity, tracing, and monorepo CI scaling.

3. **codespell (primary spell checker)**
- Rejected for Bun-first workflow due Python-centric integration and weaker domain dictionary ergonomics.

4. **Dependabot (primary dependency automation)**
- Rejected in favor of Renovate for monorepo grouping/policy control depth.

5. **Full ESLint re-adoption for TS linting**
- Rejected because Biome is already strong and should remain canonical; ESLint should be gap-only.

6. **Replacing Knip/Syncpack/Madge**
- Rejected because these tools are already correctly selected for their problem areas; the issue is enforcement/config drift, not tool choice.

7. **Source-map-explorer (bundle analysis baseline)**
- Rejected due stale maintenance compared to modern alternatives (`@next/bundle-analyzer`, `rollup-plugin-visualizer`).

8. **Running both CodeQL and Semgrep as mandatory full gates initially**
- Rejected for initial rollout due duplicate findings/triage overhead; start with one primary SAST engine.

## Suggested Delivery Sequence (Minimal High-Impact Plan)
1. Implement all P0 items.
2. Add CI caching + Changesets/Madge/Syncpack enforcement.
3. Add cspell + markdownlint + Biome language surface tuning.
4. Add security depth (OSV + one SAST + license workflow).
5. Add Playwright + Storybook/Chromatic.
