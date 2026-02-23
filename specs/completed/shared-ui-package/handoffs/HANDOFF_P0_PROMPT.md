# Shared UI Package: Orchestrator Prompt

Copy-paste this prompt into a new agent session.

---

You are executing the spec at:
`specs/pending/shared-ui-package/README.md`

Your mission is to complete the spec phases in order:
1. Research & Audit (Phase 0 — already complete, see `outputs/research.md`)
2. Design
3. Package Scaffolding
4. Asset Migration
5. Storybook Setup
6. Verification

## Hard Requirements
- Create `@beep/ui` package at `packages/ui/ui` using the monorepo's existing `beep create-package` CLI as a starting point.
- Use **source distribution** (JIT) — components are `.tsx` files, NOT built artifacts. No tsup/unbuild build step.
- shadcn components go in `src/components/ui/`. The shadcn CLI must work from the UI package directory.
- Theme tokens (CSS custom properties, OKLch colors, dark mode, Tailwind `@theme inline`) extracted from `apps/web/src/app/globals.css` into `packages/ui/ui/src/styles/globals.css`.
- `cn()` utility moved from `apps/web/src/lib/utils.ts` to `packages/ui/ui/src/lib/utils.ts`.
- Button component moved from `apps/web/src/components/ui/button.tsx`.
- `apps/web` must be updated to consume from `@beep/ui` — no broken imports.
- Storybook 10 with `@storybook/react-vite` framework, addons: docs, a11y, themes.
- All new deps added to root catalog. Use `catalog:` protocol in package deps.
- Storybook and build-storybook tasks added to `turbo.json`.

## Required Deliverables
- `specs/pending/shared-ui-package/outputs/design.md`
- `packages/ui/ui/` (complete package)
- Updated `apps/web/` (consuming from `@beep/ui`)
- Working Storybook with button story

## Key References
- `specs/pending/shared-ui-package/README.md` (full spec)
- `specs/pending/shared-ui-package/outputs/research.md` (preliminary research)
- `apps/web/src/app/globals.css` (theme tokens to extract)
- `apps/web/src/components/ui/button.tsx` (component to move)
- `apps/web/src/lib/utils.ts` (utility to move)
- `apps/web/components.json` (shadcn config to update)
- `apps/web/next.config.ts` (transpilePackages to update)
- `apps/web/package.json` (add @beep/ui dependency)
- `tooling/cli/src/commands/create-package/` (scaffold tool reference)
- `turbo.json` (add Storybook tasks)
- Root `package.json` catalog (add Storybook deps)

## Pattern References
- Existing packages follow Effect v4 conventions (JSDoc, @since tags, Effect.fn)
- Package scaffolding via `beep create-package` generates standard files (LICENSE, README, AGENTS.md, etc.)
- Root catalog manages all version pins via `catalog:` protocol
- Tailwind v4 uses CSS-first configuration (no `tailwind.config.js`)
- shadcn monorepo pattern: source distribution, shared `components.json` with `@beep/ui/*` aliases

## Verification Gate
Before handoff completion, run:

```bash
bun run build
bun run check
bun run test
bun run lint:jsdoc
bun run lint
```

Also verify Storybook and app integration:

```bash
# Storybook starts
cd packages/ui/ui && bun run storybook

# Web app builds with shared imports
cd apps/web && bun run build

# shadcn CLI works from UI package
cd packages/ui/ui && bunx shadcn add card --dry-run
```
