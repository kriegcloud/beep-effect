# Topic
storybook

# TLDR
Storybook is concentrated in `@beep/ui`, which is the right place for a shared design-system surface. The repo already caches the build output and keeps the dev server persistent, so the remaining wins are mostly around reducing uncached browser-test setup.

# Score
0.88 / 1.00

# Current repo evidence
- `packages/common/ui/package.json` defines `storybook`, `build-storybook`, and `test:storybook` at the shared UI package.
- `package.json` delegates `storybook`, `build-storybook`, and `test:storybook` through `bunx turbo run ... --filter=@beep/ui`.
- `turbo.json` marks `storybook` as `persistent: true` and `cache: false`, and marks `build-storybook` with `outputs: ["storybook-static/**"]`.
- `turbo.json` also sets `test:storybook` to `cache: false`, which is sensible because the task installs browsers and runs UI tests rather than producing reusable build artifacts.
- `packages/common/ui/.storybook/main.ts`, `manager.ts`, `preview.css`, and `preview.tsx` exist, so the Storybook runtime is fully owned by the UI package.
- `packages/common/ui/src/components/ui/button.stories.tsx` shows the actual stories are colocated with the component source.
- `packages/common/ui/.storybook/preview.tsx` adds theme-aware decorators and fullscreen layout, which keeps the Storybook canvas aligned with the shared design tokens.

# Official Turborepo guidance
- Turborepo’s Storybook guide treats Storybook as a shared design-system surface that lives alongside the UI package in a monorepo.
- The guide specifically calls out configuring cache around Storybook build output so production apps do not miss cache just because stories changed.
- Source: https://turborepo.dev/docs/guides/tools/storybook

# Gaps or strengths
- Strength: Storybook is not duplicated across apps; it is owned by the shared UI package where it can serve all consumers.
- Strength: `build-storybook` is already modeled as a cacheable Turbo task with explicit outputs.
- Strength: the `storybook` dev task is persistent, which matches how Storybook behaves in practice.
- Gap: `test:storybook` is fully uncached and includes `playwright install --only-shell chromium`, which makes every run heavier than it needs to be.
- Gap: the repo does not appear to separate browser bootstrap from the test task, so CI pays the installation cost every time the task runs.

# Improvement or preservation plan
- Preserve the current package ownership and the cached `build-storybook` task; that is already the right shape.
- Keep `storybook` persistent and uncached; changing that would make the developer experience worse.
- Consider moving browser installation to a setup step or a shared CI bootstrap if `test:storybook` becomes a frequent bottleneck.
- If Storybook grows beyond the shared UI package, add package-local config only where the stories truly diverge; do not split ownership preemptively.

# Commands and files inspected
- `sed -n '1,260p' package.json`
- `sed -n '1,260p' turbo.json`
- `sed -n '1,260p' packages/common/ui/package.json`
- `sed -n '1,220p' packages/common/ui/.storybook/main.ts`
- `sed -n '1,220p' packages/common/ui/.storybook/manager.ts`
- `sed -n '1,220p' packages/common/ui/.storybook/preview.css`
- `sed -n '1,220p' packages/common/ui/.storybook/preview.tsx`
- `sed -n '1,220p' packages/common/ui/src/components/ui/button.stories.tsx`
- `bunx turbo query ls @beep/ui --output json`

# Sources
- Repo: `package.json`
- Repo: `turbo.json`
- Repo: `packages/common/ui/package.json`
- Repo: `packages/common/ui/.storybook/main.ts`
- Repo: `packages/common/ui/.storybook/manager.ts`
- Repo: `packages/common/ui/.storybook/preview.css`
- Repo: `packages/common/ui/.storybook/preview.tsx`
- Repo: `packages/common/ui/src/components/ui/button.stories.tsx`
- Official Turborepo docs: https://turborepo.dev/docs/guides/tools/storybook
