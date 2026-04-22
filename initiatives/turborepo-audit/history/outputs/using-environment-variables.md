# Topic
Using environment variables

# TLDR
The repo is already conservative and mostly correct on Turbo environment handling: `globalEnv` is small, `globalPassThroughEnv` is broad but explicit, and CI forwards the same important secrets into Turbo jobs. The main risk is over-broad passthrough scope, which keeps tasks runnable but can hide cache-key mistakes if a variable should actually affect hashes.

# Score
0.82

# Current repo evidence
- `turbo.json` defines `globalEnv: ["TURBO_TOKEN", "TURBO_TEAM"]`, so Turbo’s own remote-cache auth is part of the hash surface where needed.
- `turbo.json` defines a broad `globalPassThroughEnv` allowlist, including `NODE_TLS_REJECT_UNAUTHORIZED`, `PORTLESS_*`, `AWS_*`, `SST_*`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_*`, `BETTER_AUTH_*`, `OPENAI_*`, `GRAPHITI_*`, `SECURITY_*`, `OAUTH_*`, `NEXT_PUBLIC_*`, `LIVEBLOCKS_*`, and `RESEND_*`.
- `turbo.json` also hashes `.env`, `.env.*`, and other root-level config files through `globalDependencies`, which means environment-file changes can invalidate cache entries.
- The root `build` task additionally includes `.env*` in task inputs, which narrows cache correctness for build-time environment changes.
- `.github/workflows/check.yml` forwards the same application secrets and service URLs into the Turbo jobs that run `build`, `check`, `test`, and `docgen`.
- The CI workflow still sets `TURBO_ARGS` to `--filter=...[origin/main]` for PRs, so environment handling and task selection are currently coupled to the broader Git-ref filter strategy.
- The repo’s app packages also reinforce environment locality: packages like `apps/editor-app` have their own native/dev scripts, and the root env list includes app-facing prefixes such as `NEXT_PUBLIC_*`, `PORTLESS_*`, and `AUTH_*`.

# Official Turborepo guidance
- Turborepo’s strict environment mode is the default: only variables declared in `env` and `globalEnv` are available at runtime.
- `globalPassThroughEnv` and `passThroughEnv` are for runtime availability without hashing, but values in those lists do not contribute to cache keys.
- The docs warn that failing to account for env vars can produce incorrect cache hits, especially when preview and production values differ.
- The docs recommend adding `.env` files to `inputs` or `globalDependencies` so changes to those files invalidate cache as expected.
- The docs recommend keeping `.env` files in application packages rather than at the repository root when possible.
- The docs call out framework inference and explicit `env` declarations as the preferred way to account for runtime variables that affect builds.

# Gaps or strengths
- Strength: the repo is already in Turbo strict-mode territory instead of relying on loose, implicit environment availability.
- Strength: CI consistently forwards the secrets that the Turbo jobs need, so the current setup is operationally coherent.
- Strength: `.env` files are included in Turbo hashing, which reduces the risk of stale cache hits from config drift.
- Gap: `globalPassThroughEnv` is broad enough that several important variables are available to every task without affecting cache keys; that is convenient, but it also creates room for missed invalidation if any of those values should actually change outputs.
- Gap: root `.env` handling is still part of the core hash surface, so the repo is relying on root-level environment discipline more than the docs’ preferred per-application `.env` placement.

# Improvement or preservation plan
1. Preserve strict mode and the current explicit env accounting; that is the right baseline for cache safety.
2. Reclassify any passthrough variable that affects task output into `env` or `globalEnv` instead of leaving it in `globalPassThroughEnv`.
3. Keep `.env` and `.env.*` in hashing, but prefer moving app-specific secrets closer to the app/package that consumes them if the runtime layout allows it.
4. In CI, keep forwarding only the minimum task-required secrets and review any new secret added to `check.yml` against the Turbo hash model before broadening passthroughs.

# Commands and files inspected
- `sed -n '1,220p' turbo.json`
- `sed -n '1,220p' .github/workflows/check.yml`
- `sed -n '1,220p' packages/shared/config/package.json`
- `sed -n '1,220p' packages/shared/server/package.json`
- `sed -n '1,220p' packages/shared/client/package.json`
- `sed -n '1,220p' syncpack.config.ts`

# Sources
- `https://turborepo.dev/docs/crafting-your-repository/using-environment-variables`
- `https://turborepo.dev/docs/reference/configuration`
- `https://turborepo.dev/docs/reference/system-environment-variables`
- `/home/elpresidank/YeeBois/projects/beep-effect/turbo.json`
- `/home/elpresidank/YeeBois/projects/beep-effect/.github/workflows/check.yml`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/config/package.json`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/package.json`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/client/package.json`
