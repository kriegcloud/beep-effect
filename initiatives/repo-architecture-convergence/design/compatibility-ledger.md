# Compatibility Ledger Design Seed

## Purpose

This file is a design-time seed and reference only. It is not the live
compatibility ledger for the initiative.

The authoritative live ledger is `../ops/compatibility-ledger.md`. Use this
document to name the candidate shims the design surface anticipates, so the
owning phase knows what to record in `ops/*` if an atomic cutover is not
possible.

## Expected Live Fields

Every live row in `../ops/compatibility-ledger.md` must record:

- a stable `ID`
- the exact legacy surface
- the shim kind
- the canonical replacement
- the affected consumers
- the owner
- the reason
- the issue or blocker that forced the bridge
- the created phase
- the expiry or deletion phase
- the deletion gate
- the validation query
- the proof plan
- the allowlist reference when repo-law exception governance is also required
- the removal evidence
- the current status
- any notes needed to explain phased teardown or closeout context

## Seed Planning Rules

- Design rows should pre-plan every live field except `Removal evidence` and
  `Status`, which are live-only closeout fields filled after the shim lands and
  later deletes.
- Validation queries in this seed are consumer-scope proofs. Unless a row says
  otherwise, they prove live code, test, package-manifest, docgen, root-config,
  and launch-surface absence only across the named scan set.
- Validation queries in this seed must stay copy-paste reproducible as written.
  Do not name nonexistent repo-root files in the scan set.
- Historical/design docs, generated lockfiles, and metadata inventories stay
  outside proof scope unless the row or phase evidence pack names them
  explicitly.
- If a row also needs repo-law exception governance, fill `Allowlist
  reference` with the matching `standards/effect-laws.allowlist.jsonc` entry
  instead of leaving the dependency implicit.

## Design-Time Seed Candidates

| ID | Surface | Shim kind | Canonical replacement | Likely consumers | Owner | Reason | Issue trigger | Created phase if activated | Expiry or deletion phase | Deletion gate | Validation query | Proof plan | Allowlist reference | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `seed-runtime-protocol` | `@beep/runtime-protocol` | package alias or re-export | `@beep/shared-use-cases/public`, `@beep/repo-memory-use-cases/public`, `@beep/repo-memory-use-cases/server` | `apps/desktop`, `packages/repo-memory/client`, `packages/editor/protocol`, package/app docs/tests | `P4` repo-memory cutover | the protocol split may need a temporary bridge while shared vs slice contracts separate | activate only if repo-memory and editor rewrites cannot land atomically | expected `P4` | expected `P5`; must be gone by `P6` | all live import, dependency, path-alias, and docgen references audited by the query reach zero | `rg -n "@beep/runtime-protocol" apps packages tooling infra .agents .aiassistant .claude .codex package.json tsconfig.json turbo.json tsconfig.packages.json tsconfig.quality.packages.json scratchpad syncpack.config.ts` | use the query as the live consumer/config/docgen proof across the named scan set; pair it with the phase consumer census for metadata or historical-doc cleanup outside query scope | none expected | promote to the live ledger only if the bridge lands |
| `seed-runtime-server` | `@beep/runtime-server` | package alias or wrapper exports | `@beep/repo-memory-server`, `@beep/repo-memory-config/*` | `apps/desktop`, docs/tests, sidecar launch wrappers | `P4` repo-memory cutover | desktop sidecar cutover may need a temporary bridge while repo-memory server/config surfaces stabilize | activate only if desktop import or launch-surface rewrites cannot land atomically | expected `P4` | expected `P4`; must be gone by `P6` | all live import, dependency, path-alias, and docgen references audited by the query reach zero | `rg -n "@beep/runtime-server" apps packages tooling infra .agents .aiassistant .claude .codex package.json tsconfig.json turbo.json tsconfig.packages.json tsconfig.quality.packages.json scratchpad syncpack.config.ts` | use the query as the live consumer/config/docgen proof across the named scan set; pair it with the phase consumer census for metadata or historical-doc cleanup outside query scope | none expected | wrapper exports are transitional only |
| `seed-runtime-server-entrypoint` | `packages/runtime/server/src/main.ts` | wrapper entrypoint | `packages/repo-memory/server/src/main.ts` or the canonical repo-memory server entrypoint chosen during implementation | `apps/desktop` Tauri/dev/build/docs surfaces | `P4` repo-memory cutover | desktop dev/build/Tauri surfaces may need a temporary wrapper entrypoint during server relocation | activate only if app launch surfaces cannot flip in one batch | expected `P4` | expected `P4`; must be gone by `P6` | all live launch-surface references audited by the query reach zero | `rg -n "packages/runtime/server/src/main.ts" apps packages tooling infra package.json tsconfig.json turbo.json tsconfig.packages.json tsconfig.quality.packages.json scratchpad syncpack.config.ts` | use the query to prove app, script, docgen, and root-config launch surfaces in the named scan set are off the old path; pair with phase evidence for any historical-doc cleanup outside query scope | none expected | wrapper only, not a durable route exception |
| `seed-shared-server` | `@beep/shared-server` | package alias | `@beep/drizzle` | shared-server tests, docs, and importers | `P3` non-slice extraction | `shared/server -> drivers/drizzle` extraction may need a short alias while importers flip | activate only if driver extraction and importer rewrites cannot land atomically | expected `P3` | expected `P3`; must be gone by `P6` | all live import, dependency, path-alias, and docgen references audited by the query reach zero | `rg -n "@beep/shared-server" apps packages tooling infra .agents .aiassistant .claude .codex package.json tsconfig.json turbo.json tsconfig.packages.json tsconfig.quality.packages.json scratchpad syncpack.config.ts` | use the query as the live consumer/config/docgen proof across the named scan set; pair it with the phase consumer census for metadata or historical-doc cleanup outside query scope | none expected | keep the alias only long enough to flip real importers |
| `seed-shared-tables` | `@beep/shared-tables` | package alias | `@beep/drizzle` and, if created, `@beep/table-modeling` | shared-tables tests, docs, and importers | `P3` non-slice extraction | `shared/tables` split may need a short alias while driver vs modeling survivors separate | activate only if split extraction and importer rewrites cannot land atomically | expected `P3` | expected `P3`; must be gone by `P6` | all live import, dependency, path-alias, and docgen references audited by the query reach zero | `rg -n "@beep/shared-tables" apps packages tooling infra .agents .aiassistant .claude .codex package.json tsconfig.json turbo.json tsconfig.packages.json tsconfig.quality.packages.json scratchpad syncpack.config.ts` | use the query as the live consumer/config/docgen proof across the named scan set; pair it with the phase consumer census for metadata or historical-doc cleanup outside query scope | none expected | if no modeling survivor exists, delete without creating a second target package |
| `seed-editor-lexical` | `@beep/editor-lexical` | package alias | `@beep/editor-ui` | `apps/editor-app`, editor package docs/tests | `P5` editor cutover | the `editor-lexical -> editor/ui` rename may need a short alias while app and package imports flip | activate only if editor rewrites cannot land atomically | expected `P5` | expected `P5`; must be gone by `P6` | all live import, dependency, path-alias, and docgen references audited by the query reach zero | `rg -n "@beep/editor-lexical" apps packages tooling infra .agents .aiassistant .claude .codex package.json tsconfig.json turbo.json tsconfig.packages.json tsconfig.quality.packages.json scratchpad syncpack.config.ts` | use the query as the live consumer/config/docgen proof across the named scan set; pair it with the phase consumer census for metadata or historical-doc cleanup outside query scope | none expected | keep the alias only long enough to finish the editor UI rename |
| `seed-editor-runtime-entrypoint` | `packages/editor/runtime/src/main.ts` | wrapper entrypoint | `packages/editor/server/src/main.ts` or the canonical editor server entrypoint chosen during implementation | `apps/editor-app` Tauri/dev/build surfaces | `P5` editor cutover | editor app launch surfaces may need a temporary wrapper entrypoint during server relocation | activate only if app launch surfaces cannot flip in one batch | expected `P5` | expected `P5`; must be gone by `P6` | all live launch-surface references audited by the query reach zero | `rg -n "packages/editor/runtime/src/main.ts" apps packages tooling infra package.json tsconfig.json turbo.json tsconfig.packages.json tsconfig.quality.packages.json scratchpad syncpack.config.ts` | use the query to prove app, script, docgen, and root-config launch surfaces in the named scan set are off the old path; pair with phase evidence for any historical-doc cleanup outside query scope | none expected | wrapper only, not a durable route exception |

## Governance Rule

When a design-time seed candidate becomes real, the owning phase records it in
`../ops/compatibility-ledger.md` and tracks its lifecycle there.

When promoting a seed row into the live ledger, copy the planned owner, reason,
issue, phase, proof-plan, and allowlist data rather than recreating them from
memory. Fill `Removal evidence` and `Status` only in the live ledger once the
surface exists and later deletes.

This file does not carry live `planned`, `active`, `deleted`, or `withdrawn`
state. If a cutover lands atomically, no live row is needed and this seed
remains purely referential.

At final cutover, only `ops/compatibility-ledger.md` is scored as live
governance evidence.
