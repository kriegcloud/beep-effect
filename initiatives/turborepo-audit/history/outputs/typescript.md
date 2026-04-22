# Topic
TypeScript

## TLDR
TypeScript is one of the strongest parts of this Turbo setup. Shared base configs, project references, and per-package build/check scripts already line up well with the docs.

## Score
0.93

## Current repo evidence
- `tsconfig.base.json` defines the shared compiler baseline for the repo.
- `tsconfig.json` extends the base config, includes shared test and config files, and excludes package-owned test typechecks where appropriate.
- `tsconfig.packages.json` enumerates workspace package references across apps, packages, tooling, and infra.
- `tsconfig.quality.json` and `tsconfig.quality.packages.json` provide a broader type-checking lane.
- `turbo.json` defines cached `build` and `check` tasks with `dependsOn` wiring.
- Package scripts use `tsc -b` consistently: `@beep/editor-app`, `@beep/ui`, `@beep/repo-cli`, `@beep/desktop`, and `@beep/infra`.
- `apps/desktop/package.json` also separates `tsconfig.test.json` for test-only typechecking.
- Root `test:types` uses `tstyche`, so TypeScript correctness is not limited to `tsc` alone.

## Official Turborepo guidance
- The Turborepo TypeScript guide recommends a shared base `tsconfig`, package-local configs that extend it, and project references for faster workspace-wide type checking.
- It also emphasizes that TypeScript setup should balance shared defaults with package-specific overrides.

## Gaps or strengths
- Strength: the repo already uses the recommended shared-base-plus-package-override pattern.
- Strength: `tsconfig.packages.json` makes workspace relationships explicit and keeps typecheck targets discoverable.
- Strength: Turbo build/check tasks already align with package-level `tsc -b` scripts.
- Gap: the root `tsconfig.json` is large and manually curated, so additions can be easy to forget if the workspace expands quickly.

## Improvement or preservation plan
- Preserve the current architecture.
- Keep package `check` and `build` scripts on `tsc -b` so Turbo can continue parallelizing them.
- Keep app-specific test typecheck configs local to the owning app.
- If the workspace grows, revisit whether the root include/exclude lists can be simplified without losing test-config coverage.

## Commands and files inspected
- `sed -n '1,220p' tsconfig.json`
- `sed -n '1,220p' tsconfig.base.json`
- `sed -n '1,220p' tsconfig.packages.json`
- `rg -n 'extends|references|composite|tsBuildInfoFile|paths|baseUrl|include|exclude' tsconfig*.json apps/*/tsconfig*.json packages/*/tsconfig*.json tooling/*/tsconfig*.json infra/tsconfig*.json`
- `bunx turbo query ls @beep/editor-app --output json`
- `bunx turbo query ls @beep/repo-cli --output json`

## Sources
- Repo: `tsconfig.json`
- Repo: `tsconfig.base.json`
- Repo: `tsconfig.packages.json`
- Repo: `tsconfig.quality.json`
- Repo: `tsconfig.quality.packages.json`
- Turbo docs: `https://turborepo.dev/docs/guides/tools/typescript`
