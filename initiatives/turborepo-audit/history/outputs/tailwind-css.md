# Topic
tailwind-css

# TLDR
Tailwind v4 is centralized well in `@beep/ui` and consumed by apps through small app-local integration files. This is a strong monorepo setup with a single source of truth for the shared theme and only a few places where drift could sneak in.

# Score
0.94 / 1.00

# Current repo evidence
- `packages/common/ui/src/styles/globals.css` is the shared Tailwind v4 stylesheet and theme token source.
- `packages/common/ui/postcss.config.mjs` exports the Tailwind PostCSS plugin config used by the shared package.
- `packages/common/ui/package.json` exports `./styles/globals.css` and `./postcss.config` so apps can consume the shared styling surface without reaching into internals.
- `packages/common/ui/components.json` points the shadcn CSS entrypoint at `src/styles/globals.css`.
- `apps/editor-app/components.json` and `apps/V2T/components.json` both point `tailwind.css` at the shared UI stylesheet.
- `apps/editor-app/postcss.config.mjs` and `apps/V2T/postcss.config.mjs` both re-export `@beep/ui/postcss.config`.
- `apps/editor-app/vite.config.ts` and `apps/V2T/vite.config.ts` consume the shared UI package as part of the Vite app setup.
- `packages/common/ui/README.md` documents the shared UI package as the place for shared primitives, hooks, libs, and styles.

# Official Turborepo guidance
- Turborepo’s Tailwind guide is explicitly written for Tailwind CSS v4 and monorepo setups.
- The guide’s shape matches a shared Tailwind config or shared styling package consumed by apps rather than duplicated app-local styling ownership.
- Source: https://turborepo.dev/docs/guides/tools/tailwind

# Gaps or strengths
- Strength: there is one shared stylesheet and one shared PostCSS config, which is the cleanest place to evolve tokens and component styles.
- Strength: app-local `components.json` files only supply the app-specific aliases and CSS wiring they actually need.
- Strength: the shared package exports the stylesheet and PostCSS config directly, so the integration surface is explicit.
- Gap: style ownership is spread across shared package exports, app-local shadcn configs, and Vite app setup, so new contributors have to follow a few files to understand the full path.
- Gap: there is no dedicated Turbo task for Tailwind preprocessing because the repo already leans on normal app/package build tasks.

# Improvement or preservation plan
- Preserve the current shared CSS ownership in `@beep/ui`; that is the main simplification already paying off.
- Keep app-local `components.json` files for app-specific aliases and registries rather than moving those details into the shared package.
- If CSS generation or style preprocessing starts diverging between apps, then add package-local Turbo overrides or a more explicit task split.
- Otherwise, avoid churning this area; it is already close to the Turborepo guide’s intended shape.

# Commands and files inspected
- `sed -n '1,260p' packages/common/ui/package.json`
- `sed -n '1,220p' packages/common/ui/components.json`
- `sed -n '1,220p' packages/common/ui/src/styles/globals.css`
- `sed -n '1,220p' packages/common/ui/postcss.config.mjs`
- `sed -n '1,220p' packages/common/ui/README.md`
- `sed -n '1,220p' apps/editor-app/components.json`
- `sed -n '1,220p' apps/editor-app/postcss.config.mjs`
- `sed -n '1,220p' apps/V2T/components.json`
- `sed -n '1,220p' apps/V2T/postcss.config.mjs`

# Sources
- Repo: `packages/common/ui/src/styles/globals.css`
- Repo: `packages/common/ui/postcss.config.mjs`
- Repo: `packages/common/ui/package.json`
- Repo: `packages/common/ui/components.json`
- Repo: `apps/editor-app/components.json`
- Repo: `apps/editor-app/postcss.config.mjs`
- Repo: `apps/V2T/components.json`
- Repo: `apps/V2T/postcss.config.mjs`
- Official Turborepo docs: https://turborepo.dev/docs/guides/tools/tailwind
