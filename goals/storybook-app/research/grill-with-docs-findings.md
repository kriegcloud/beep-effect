# Grill With Docs Findings

## Context

The packet was created after a `$grill-with-docs` pass and a
`$quality-review-fix-loop` critique of the plan. The target split is
package-local stories plus one app-owned Storybook runtime.

## Doctrine Decisions

- Story files remain with the packages that own the components. The host app is
  responsible for discovery, browser execution, and deploy.
- `@beep/storybook` is an app workspace, not a library package. It must not gain
  package exports, docgen, dtslint, type-test, or a public API surface.
- `@beep/ui` is a foundation/ui-system package. Its package checks should cover
  source, tests, docs, and package API only.
- Story discovery starts with foundation UI-system packages:
  `packages/foundation/ui-system/*/stories/**/*.stories.@(ts|tsx)`.
- Shared UI and slice UI story enrollment is future scope and should be added
  deliberately when those packages have stories.
- The local route stays `storybook.beep`; only the owning Turbo filter changes.
- CI needs an explicit Storybook workflow because browser-story tests require a
  Playwright-capable lane and static artifact proof.
- Vercel/Pulumi work should be limited to a public Vercel project named
  `beep-storybook`. DNS, Cloudflare, and live `pulumi up` are out of scope.

## Quality Review Fixes Applied To The Plan

- Separated app shape from package shape so `@beep/storybook` cannot drift into
  a reusable API package.
- Added an app-specific story tsconfig rather than moving the old package
  tsconfig as-is.
- Required Vite filesystem allowance and React dedupe for external stories.
- Required Tailwind source globs for app config plus package source/story paths.
- Clarified that story authoring dependencies may remain in story-owning
  packages when local story imports require them.
- Split infra states: wiring/preview complete now, provisioning only after a
  later explicit `pulumi up`.
- Required CI browser install with Linux deps and artifact upload.
