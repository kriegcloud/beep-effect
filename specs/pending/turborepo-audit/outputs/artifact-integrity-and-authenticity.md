# Topic
Artifact integrity and authenticity

# TLDR
The repo is prepared for remote cache use, but it does not currently enable signed-artifact verification. CI passes `TURBO_TOKEN` and `TURBO_TEAM`, and it caches `.turbo/cache`, yet there is no `remoteCache.signature: true` configuration and no `TURBO_REMOTE_CACHE_SIGNATURE_KEY` evidence.

# Score
0.46 / 1.00

# Current repo evidence
- `turbo.json:16-17` includes `TURBO_TOKEN` and `TURBO_TEAM` in `globalEnv`, which means Turbo hashes those values and the CI identity is part of the cache model.
- `.github/workflows/check.yml:50-53`, `104-107`, `210-213`, `265-268`, and `321-324` export `TURBO_TOKEN` and `TURBO_TEAM` in the Turbo jobs that run build, lint, check, test, and docgen.
- `.github/workflows/check.yml:85-92`, `131-138`, `245-252`, `300-307`, and `356-360` cache `.turbo/cache` in CI, so remote or local artifact reuse is already expected behavior.
- `turbo.json` has no `remoteCache` block at all, and a repo search found no `TURBO_REMOTE_CACHE_SIGNATURE_KEY` anywhere in the workspace.

# Official Turborepo guidance
- `https://turborepo.dev/docs/core-concepts/remote-caching#artifact-integrity-and-authenticity-verification` says Turborepo can sign uploaded artifacts with `HMAC-SHA256`, verify integrity and authenticity on download, and ignore artifacts that fail verification.
- That same page says verification is enabled by setting `remoteCache.signature: true` in `turbo.json` and providing `TURBO_REMOTE_CACHE_SIGNATURE_KEY`.
- `https://turborepo.dev/docs/crafting-your-repository/caching` emphasizes that remote caching shares artifacts across machines, but also warns that correctness depends on getting the cache model and environment handling right first.

# Gaps or strengths
- Strength: CI is already wired for remote cache identity, so the repo is not starting from zero.
- Strength: `.turbo/cache` is cached in the primary Turbo jobs, so there is operational value in the current trust setup even before signature verification.
- Gap: authenticity verification is not turned on, so the current trust model depends on provider authentication and correct environment scoping rather than signed artifact verification.
- Gap: the repo has no explicit `remoteCache` policy in `turbo.json`, which makes the current remote-cache posture implicit rather than documented in code.

# Improvement or preservation plan
1. Decide whether remote cache signing is a required security property or an optional hardening step for this repo.
2. If it is required, add `remoteCache.signature: true` to `turbo.json` and provision `TURBO_REMOTE_CACHE_SIGNATURE_KEY` in the CI secret set and any local setup docs.
3. Verify the change by clearing `.turbo/cache` and confirming that a second run replays the remote artifact instead of rebuilding locally.
4. If signing is not feasible yet, document that the repo is intentionally relying on authenticated remote caching and revisit the decision when the cache policy changes.

# Commands and files inspected
- `rg -n "TURBO_REMOTE_CACHE_SIGNATURE_KEY|remoteCache|TURBO_TOKEN|TURBO_TEAM|\\.turbo/cache" -S .github turbo.json package.json scripts tooling apps packages infra`
- `nl -ba turbo.json`
- `nl -ba .github/workflows/check.yml`
- `nl -ba package.json`

# Sources
- Repo: `turbo.json`
- Repo: `.github/workflows/check.yml`
- Official Turborepo: `https://turborepo.dev/docs/core-concepts/remote-caching#artifact-integrity-and-authenticity-verification`
- Official Turborepo: `https://turborepo.dev/docs/crafting-your-repository/caching`
