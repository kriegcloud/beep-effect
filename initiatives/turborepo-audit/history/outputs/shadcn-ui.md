# Topic
shadcn-ui

# TLDR
`@beep/ui` is the correct shared owner for shadcn/ui in this repo, and the app-local `components.json` files are already doing the right thing by keeping app-specific shadcn wiring out of the shared package. This is a strong setup with only small maintenance-level improvements left.

# Score
0.91 / 1.00

# Current repo evidence
- `packages/common/ui/components.json` points shadcn at the shared CSS entrypoint `src/styles/globals.css` and aliases components, hooks, lib, and UI subpaths back into `@beep/ui`.
- `packages/common/ui/src/styles/globals.css` is the shared Tailwind v4 theme layer for the UI package.
- `packages/common/ui/README.md` explicitly says `ui-add` is scoped to `packages/common/ui` for shared primitives, and that app-local shadcn blocks for `@beep/editor-app` should stay in `apps/editor-app/components.json`.
- `apps/editor-app/components.json` points its `tailwind.css` entry at the shared UI package CSS, while keeping app-specific aliases and registries local.
- `package.json` exposes `ui-add` as the root entrypoint for shared shadcn additions.
- `packages/common/ui/package.json` exposes the shared package exports for `./styles/globals.css`, `./components/*`, `./hooks/*`, and `./lib/*`.

# Official Turborepo guidance
- The shadcn/ui guide recommends initializing in monorepo mode and adding components into the appropriate workspace rather than flattening everything into one app.
- Turborepo’s shadcn guidance is centered on shared UI packages and monorepo-aware copying, which matches the current `@beep/ui` ownership model.
- Source: https://turborepo.dev/docs/guides/tools/shadcn-ui

# Gaps or strengths
- Strength: the repo already has a clean split between the shared UI base and app-local shadcn entrypoints.
- Strength: the shared package exports its CSS and component surface cleanly, so consumers do not need to know the internal file layout.
- Strength: the root `ui-add` wrapper is intentionally narrow instead of pretending every shadcn operation is repo-global.
- Gap: there is no Turbo-native generator or package task specifically for shadcn component addition, so the workflow remains manual and repo-local.
- Gap: the app-local registries are duplicated across app configs, which is acceptable today but could drift if more app-specific shadcn sources are added.

# Improvement or preservation plan
- Preserve the current split: keep shared primitives in `@beep/ui` and keep app-specific shadcn config local to each app.
- Keep `ui-add` scoped to the shared package; do not centralize app-specific registries into the shared package unless the same registry is truly reusable across apps.
- If more app-local shadcn targets appear, add a lightweight repo convention note rather than moving the ownership boundary.
- Only consider a Turbo generator wrapper if shadcn scaffolding starts producing repeated package-shape boilerplate; the current manual path is still reasonable.

# Commands and files inspected
- `sed -n '1,240p' package.json`
- `sed -n '1,260p' packages/common/ui/package.json`
- `sed -n '1,220p' packages/common/ui/components.json`
- `sed -n '1,220p' packages/common/ui/src/styles/globals.css`
- `sed -n '1,220p' packages/common/ui/src/index.ts`
- `sed -n '1,220p' packages/common/ui/README.md`
- `sed -n '1,220p' apps/editor-app/components.json`
- `bunx turbo query ls @beep/ui --output json`

# Sources
- Repo: `packages/common/ui/components.json`
- Repo: `packages/common/ui/README.md`
- Repo: `packages/common/ui/src/styles/globals.css`
- Repo: `apps/editor-app/components.json`
- Repo: `package.json`
- Repo: `packages/common/ui/package.json`
- Official Turborepo docs: https://turborepo.dev/docs/guides/tools/shadcn-ui
