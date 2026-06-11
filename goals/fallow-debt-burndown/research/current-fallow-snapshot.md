---
schemaVersion: fallow-debt-burndown/research-snapshot/v1
updated: 2026-06-11
sourceBranch: feat/fallow-debt-burndown
---

# Current Fallow Snapshot

This snapshot records the current advisory queue for debt burn-down. The local
evidence came from `.beep/fallow/*` envelopes generated on 2026-06-11.

## Commands

```sh
bun run beep quality fallow boundaries --advisory --base origin/main --out .beep/fallow/boundaries.json --quiet
bun run beep quality fallow health --advisory --base origin/main --out .beep/fallow/health.json --quiet
bun run beep quality fallow security --advisory --base origin/main --out .beep/fallow/security.json --quiet
bun run beep quality fallow dupes --advisory --base origin/main --out .beep/fallow/dupes.json --quiet
```

## Boundary Queue

Fallow boundary analysis reports 26 boundary violations. The visible pattern is
direct imports from application or driver code into foundation internals:

- `@beep/identity`: 11 findings.
- `@beep/schema`: 8 findings.
- `@beep/utils`: 7 findings.

First targets:

- `apps/architecture-lab-proof/src/index.ts` imports
  `packages/foundation/modeling/identity/src/packages.ts`.
- `apps/canvas/src/main.tsx` imports
  `packages/foundation/modeling/utils/src/index.ts`.
- `apps/professional-desktop/src/App.tsx` imports identity, schema, and utils
  internals.
- `apps/professional-runtime-proof/src/index.ts` imports schema internals.
- `packages/_internal/db-admin/src/migrations/ArchitectureLab.ts` imports
  identity internals.
- Driver and tooling packages import utils internals.

Preferred fix: use public `@beep/*` package exports or add a canonical export if
the dependency is legitimate.

## Health Queue

The current top-bounded health report contains 50 surfaced findings:

- critical: 27.
- high: 21.
- moderate: 2.

First targets:

- `packages/tooling/tool/cli/src/commands/CreatePackage/Handler.ts`, anonymous
  function at line 848: cyclomatic 67, cognitive 79, 377 lines.
- `packages/foundation/ui-system/ui/src/themes/components/button.ts`, `root` at
  line 66: cyclomatic 50, cognitive 49, 281 lines.
- `packages/tooling/tool/cli/src/commands/Lint/Lint.command.ts`,
  `runLintToolingSchemaFirst` at line 312: cyclomatic 40, cognitive 73, 178
  lines.
- `packages/tooling/tool/cli/src/commands/Yeet/internal/Handler.ts`,
  `validateMonitorGuards` at line 769: cyclomatic 40, cognitive 34, 117 lines.
- `packages/tooling/tool/cli/src/commands/Docgen/internal/Quality.ts`,
  `collectExportedDeclarationCandidates` at line 913: cyclomatic 39,
  cognitive 61, 119 lines.

Preferred fix: extract named helpers and phase functions with package-local
tests or checks. Avoid suppressing complexity as the default resolution.

## Security Queue

Fallow security reports 23 candidates:

- path-traversal: 12.
- header-injection: 4.
- dangerous-html: 3.
- prototype-pollution: 2.
- sql-injection: 1.
- open-redirect: 1.

First targets:

- `packages/tooling/library/ai-metrics/src/mirror.ts` line 611:
  sql-injection candidate.
- `packages/drivers/wink/src/WinkTools.service.ts` line 718:
  prototype-pollution candidate.
- `packages/tooling/tool/cli/src/commands/Graphiti/internal/ProxyServices.ts`
  lines 492-494: header-injection candidates.
- `packages/drivers/discord/src/Discord.service.ts` line 87:
  header-injection candidate.
- `apps/oip-web/src/app/api/contact/ContactRouteResponse.ts` line 51:
  open-redirect candidate.

Preferred fix: triage candidate reachability and existing lane coverage before
recording a suppression or creating a blocking gate.

## Dupes Queue

The top-bounded Fallow dupes report currently shows 50 clone groups and 537
instances in the wrapper artifact. The parent feature matrix records the full
configured run as 930 clone groups.

First targets:

- repeated app `vitest.config.ts` setup across five apps.
- repeated `provideScopedLayer` and CLI argument helpers across tests/proofs.
- repeated hand-maintained package test shapes.

Generated ACP schema clones are classified as generated-code candidates rather
than immediate refactor targets.

