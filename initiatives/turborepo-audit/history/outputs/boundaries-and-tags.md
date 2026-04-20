# Topic
Boundaries and package tags

# TLDR
The repo is enforcing dependency hygiene with custom linting and Syncpack/Sherif policy, but it is not using Turbo’s first-party boundaries or package tags yet. That makes this a meaningful opportunity, but not an automatic replacement: Turbo boundaries can likely complement repo checks before they replace anything.

# Score
0.45 / 1.00

# Current repo evidence
- Root `package.json` runs `lint:repo` via `bunx sherif@1.10.0 -r non-existent-packages` and also runs `bunx syncpack lint` in CI.
- `syncpack.config.ts` enforces `workspace:^` for internal packages and `catalog:` usage for root third-party tool dependencies.
- Root `lint` also includes custom governance lanes such as `lint:schema-first`, `lint:tooling-tagged-errors`, and `check:effect-laws-allowlist`.
- A repo-wide search found no package `tags` metadata and no `turbo boundaries` usage anywhere in the command surface.

# Official Turborepo guidance
- `https://turborepo.dev/docs/reference/boundaries` documents first-party package tags and rule-based import restrictions.
- Turbo boundaries are designed to express package-level architectural constraints inside the monorepo rather than relying purely on external lint tools.
- The reference positions boundaries as a way to prevent invalid cross-package imports when packages are clearly classified.

# Gaps or strengths
- Strength: the repo already takes dependency and package hygiene seriously; it is not missing governance.
- Strength: Syncpack and Sherif are already catching real classes of repository drift.
- Gap: Turbo package tags are absent, so the task graph and architectural governance are still disconnected from each other.
- Gap: custom checks understand version policy and some repo rules, but they do not give the repo a first-party architectural classification layer inside Turbo itself.

# Improvement or preservation plan
1. Do not replace current governance checks immediately; they encode rules Turbo boundaries do not cover.
2. Pilot package tags on a small high-value slice first, such as app vs shared-runtime vs tooling packages.
3. Add `turbo boundaries` as a complementary lane once tags are stable enough to express useful import restrictions.
4. Only consider shrinking Sherif/Syncpack enforcement after Turbo boundaries are proven to catch the intended package-relationship failures.

# Commands and files inspected
- `sed -n '1,240p' package.json`
- `sed -n '1,220p' syncpack.config.ts`
- `sed -n '1,260p' .github/workflows/check.yml`
- `rg -n '"tags"\s*:|turbo boundaries|boundaries' package.json apps packages tooling infra turbo.json .github -S`
- `rg -n 'sherif|lint:repo|syncpack lint|non-existent-packages|workspace:\^|catalog:' package.json syncpack.config.ts .github/workflows/check.yml tooling packages apps infra -S`

# Sources
- Repo: `package.json`
- Repo: `syncpack.config.ts`
- Repo: `.github/workflows/check.yml`
- Official Turborepo: `https://turborepo.dev/docs/reference/boundaries`
