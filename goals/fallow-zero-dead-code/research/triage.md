# Fallow Dead-Code Finding Triage

Recorded: 2026-06-11. Verified against worktree at branch point of
`feat/fallow-zero-dead-code` (fallow 2.89.0, `.fallowrc.jsonc` config,
61 total findings). Every finding was independently re-checked against
source, configs, and manifests before classification.

Verdicts: `tp-unexport` (remove the `export` keyword), `tp-remove-dep`,
`tp-add-dep`, `fp-config` (eliminate via `.fallowrc.jsonc`), `fp-tool`
(suspected analyzer gap; re-verify before suppressing), `straggler`
(genuinely unreferenced app code; wire-or-delete policy applies).

## Summary

| Category | Total | True positive | False positive |
| --- | --- | --- | --- |
| Unused files | 4 | 0 (1 straggler) | 3 |
| Unused exports | 25 | 3 | 22 |
| Unused types | 4 | 1 | 3 |
| Unused dependencies | 15 | 11 | 4 |
| Unlisted dependencies | 6 | 5 | 1 |
| **Total** | **61** | **20** | **41** |

Root cause of the app-code false-positive class: `.fallowrc.jsonc#entry`
only roots `packages/**/src/*.ts`; `apps/**` is never rooted, so fallow
treats cross-file-used app exports as unreachable.

## Unused files (4)

| Finding | Verdict | Evidence |
| --- | --- | --- |
| `apps/oip-web/src/components/CtaLink.tsx` | straggler | Pre-launch component; nothing imports it. Wire into a page or delete. |
| `eslint.deprecated.config.mjs` | fp-config | Referenced by `packages/tooling/tool/cli/src/commands/Lint/Lint.command.ts`. |
| `packages/tooling/tool/cli/test/global-cleanup.ts` | fp-config | `globalSetup` in `packages/tooling/tool/cli/vitest.config.ts`. |
| `syncpack.config.ts` | fp-config | Auto-loaded by syncpack (`deps:update` script). |

## Unused exports (25)

True positives (unexport only; symbols stay for internal use):

| Finding | Verdict |
| --- | --- |
| `apps/oip-web/src/app/layout.tsx:149` `instant` | ~~tp-unexport~~ fp-framework (REVISED 2026-06-11) |
| `apps/oip-web/src/app/page.tsx:40` `instant` | ~~tp-unexport~~ fp-framework (REVISED 2026-06-11) |
| `apps/professional-desktop/src/App.tsx:76` `LoadState` | tp-unexport |

False positives (22): all remaining export findings in `apps/canvas`
(`CanvasSceneNode`, `SceneSaveRequest`, `SceneLoadRequest` — used by
`apps/canvas/src/App.tsx` and bridge handlers) and `apps/oip-web`
(`OipContactHttpApiGroup`, `contactResponseBody`, the 13
`OipContent.model.ts` schema classes composed into `OipSiteContent`,
`loadOipSiteContent`, `oipAtomRuntimeFactory`, `oipBrowserLayer`) plus
`apps/stack-installer` `P1RequiredPlatform` (used by
`capture-p1-manual-proof.ts`). All are reachable once apps are rooted
as entries.

**Verdict revision (2026-06-11):** deleting the `instant` exports broke
`next build` for oip-web (`blocking-prerender-dynamic`: "Set `export const
instant = false` to allow a blocking route"). `instant` is a Next.js framework
config export consumed by the framework itself, invisible to import analysis.
Both exports were restored and are suppressed config-only via
`.fallowrc.jsonc#ignoreExports` with provenance. Net true positives: 18.

## Unused types (4)

| Finding | Verdict | Evidence |
| --- | --- | --- |
| `apps/oip-web/src/contact/ContactSubmission.http.ts:124` `ContactSubmissionPayload` | fp-config | Used by `apps/oip-web/src/app/api/contact/ContactHttpApiRoute.ts`. |
| `apps/oip-web/src/content/OipContent.model.ts:49` `ReviewStatus` | fp-config | Used by `OipContent.data.ts`. |
| `apps/oip-web/src/content/OipContent.model.ts:151` `SocialPlatform` | fp-config | Used by `OipHomePage.tsx`. |

## Unused dependencies (15)

| Manifest | Package | Verdict |
| --- | --- | --- |
| `apps/codedank-web/package.json` | `@mdx-js/react` | tp-remove-dep |
| `apps/oip-web/package.json` | `@mdx-js/react` | tp-remove-dep |
| `apps/storybook/package.json` | `@mdx-js/react` | tp-remove-dep (addon-docs bundles its own) |
| `packages/drivers/firecrawl/package.json` | `@beep/observability` | tp-remove-dep |
| `packages/drivers/libpff/package.json` | `@beep/utils` | tp-remove-dep |
| `packages/foundation/capability/langextract/package.json` | `@beep/utils` | tp-remove-dep |
| `packages/foundation/ui-system/ui/package.json` | `@mui/material-pigment-css`, `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/x-date-pickers-pro`, `@mui/x-tree-view` | tp-remove-dep — only referenced by `declare module` theme augmentations under `src/themes/`; delete dead augmentations with them, or keep as devDependencies if augmentation is still wanted (typecheck is the arbiter) |
| `packages/foundation/capability/observability/package.json` | `@opentelemetry/resources`, `@opentelemetry/sdk-trace-node` | fp-tool — both are imported in `observability/src`; re-verify, then `ignoreDependencies` with provenance if confirmed |
| `packages/foundation/ui-system/ui/package.json` | `@emotion/react`, `@emotion/styled` | fp-config — MUI peer/runtime engine; `ignoreDependencies` with provenance |

## Unlisted dependencies (6)

| Package | Imported from | Verdict / fix |
| --- | --- | --- |
| `effect` | `packages/foundation/ui-system/ui` (src/stories/test), `infra` (src/test), `apps/professional-desktop` | tp-add-dep — `catalog:` in ui deps, infra devDeps; verify professional-desktop manifest |
| `three` | `packages/foundation/ui-system/ui/src/components/orb.tsx` | tp-add-dep — add to root catalog first (not present), then `catalog:` |
| `madge` | `packages/tooling/tool/cli/src/commands/Lint/Lint.command.ts` | tp-add-dep — `catalog:` (root catalog has it) |
| `@effect/platform-bun` | `packages/foundation/modeling/utils/test/Glob.test.ts` | tp-add-dep — devDependency `catalog:` |
| `@phosphor-icons/react` | `apps/oip-web/src/components/OipHomePage.tsx` | tp-add-dep — `catalog:` |
| `@typescript/native-preview` | `packages/tooling/policy-pack/repo-configs/test/EffectTsgoEffectFnPolicy.test.ts` | fp-tool — no import found in that file on re-check; re-verify before any change |

## Locked policies (grill session 2026-06-11)

1. Zero scope: dead-code + audit lanes reach 0/clean; dupes and health
   stay advisory with measured ratchet baselines.
2. False positives are eliminated config-only: app entry roots plus
   `ignoreDependencies` entries with provenance comments. No inline
   suppressions (`suppressionPolicy: config-only`).
3. Stragglers: 0 means 0 — wire it or delete it, including new genuine
   findings surfaced by rooting apps.
4. Promotion set: dead-code + audit become blocking pre-push lanes;
   `boundary-violation` rule flips warn -> error (lane stays
   unpromoted); `duplicate-exports` stays off with matrix rationale.
5. Knip stays blocking; parity evidence recorded; retirement deferred.
