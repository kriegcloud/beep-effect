# Topic
Managing dependencies

# TLDR
The repo is already aligned with Turborepo’s dependency guidance in the important ways: dependencies are installed where they are used, internal packages use `workspace:^`, version alignment is centralized with `catalog:` plus Syncpack, and root dependencies are mostly repo tools. The main improvement opportunity is to keep the root lean and avoid expanding root-level dependency surface unless it is truly workspace-management tooling.

# Score
0.9

# Current repo evidence
- Root `package.json` uses Bun workspaces for apps, packages, tooling, `.claude`, and `.codex`, which gives Turbo a large but explicit package graph to work from.
- Root `package.json` keeps repository tools at the root via `devDependencies` such as `turbo`, `syncpack`, `typescript`, `vitest`, `eslint`, `cspell`, `markdownlint-cli2`, `lefthook`, and `sherif`.
- Root `package.json` uses `catalog:` for the shared toolchain and many external versions, while `overrides` pins a smaller set of transitive dependencies like `@anthropic-ai/sdk`, `axios`, `undici`, `hono`, and `lodash`.
- `syncpack.config.ts` enforces three important policies: workspace packages use `workspace:^`, catalog dependencies stay pinned, and the root `@beep/root` devDependencies reference the catalog.
- The repo’s package surfaces reflect the recommended layout: internal packages such as `packages/shared/env`, `packages/shared/server`, and `packages/shared/client` declare their own runtime dependencies locally, not at the root.
- A representative package like `packages/shared/env/package.json` shows the pattern clearly: workspace dependencies are local, and external dependencies like `effect` and `@effect/vitest` come from the catalog.

# Official Turborepo guidance
- Turborepo’s dependency guidance says to install dependencies where they are used, so each package’s `package.json` should describe what it needs.
- The docs explicitly recommend keeping few dependencies in the root and reserving the root for repo-management tools rather than application/runtime dependencies.
- Turborepo does not manage dependencies itself; that is the package manager’s job, so Syncpack and Bun catalog usage are appropriate repo-level policy tools rather than Turbo responsibilities.
- The docs call out Syncpack, manypkg, and sherif as valid purpose-built tools for keeping versions aligned.
- The docs also note that catalogs are a valid mechanism for keeping versions in sync across the workspace.

# Gaps or strengths
- Strength: the repo already follows the “install dependencies where they’re used” principle well for shared packages and app packages.
- Strength: the root dependency surface is mostly workspace tooling, which is exactly the kind of root dependency set Turborepo expects.
- Strength: `syncpack.config.ts` gives a clear policy layer on top of Bun catalogs, so version drift is controlled without making Turbo responsible for it.
- Gap: the root `catalog` and `overrides` sets are large, which is workable but increases maintenance cost and makes the root a higher-value churn point for cache invalidation and version policy changes.
- Gap: because the repo uses Bun rather than pnpm, the “catalog” guidance is only partially analogous to the docs’ pnpm examples, so the current design depends more on policy discipline than on Turborepo enforcement.

# Improvement or preservation plan
1. Preserve the current package-local dependency pattern for apps and shared packages; it matches Turborepo guidance and keeps dependency ownership clear.
2. Keep the root dependency list focused on workspace tooling and repo automation only.
3. Audit future root additions against the “is this a repo-management tool or a runtime dependency?” rule before merging them into `devDependencies`.
4. Prefer adding package-local dependencies and letting Syncpack enforce version alignment, instead of widening root-level dependency surface to make installs easier.

# Commands and files inspected
- `node -e 'const p=require("./package.json"); console.log(JSON.stringify(...))'`
- `sed -n '1,220p' syncpack.config.ts`
- `sed -n '1,220p' packages/shared/env/package.json`
- `sed -n '1,220p' packages/shared/server/package.json`
- `sed -n '1,220p' packages/shared/client/package.json`
- `sed -n '1,220p' turbo.json`

# Sources
- `https://turborepo.dev/docs/crafting-your-repository/managing-dependencies`
- `https://turborepo.dev/docs/reference/configuration`
- `https://turborepo.dev/docs/reference/system-environment-variables`
- `/home/elpresidank/YeeBois/projects/beep-effect/package.json`
- `/home/elpresidank/YeeBois/projects/beep-effect/syncpack.config.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/env/package.json`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/package.json`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/client/package.json`
