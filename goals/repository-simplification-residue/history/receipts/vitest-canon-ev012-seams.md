# EV012 production seams

Lane `fix/ev012-service-seams`, base `main` `dba006a1cc`. Operator ruling
2026-10-24: fix root causes now. The vitest-canon wave 4 receipt left three EV012
rows open because none of their subjects had a production seam ("EV012: no
production seam"). This lane adds the seams, migrates the three tests to swap
behavior through Effect context, and drops each module mock.

## Seams

| Row | Seam | Live value | Test value |
| --- | --- | --- | --- |
| `agents/server/test/AnthropicTurnKernel.test.ts:33` (`@beep/anthropic`) | `AnthropicTurnProvider` `Context.Service` with `turnPlan` (the execution plan that provides the language model) and `repairInvalidBlocks`. `AnthropicTurnKernelFromProvider` reads it when the layer is built. | `AnthropicTurnProviderLive`: the driver's `AnthropicTurnPlan` and the module's existing `repairInvalidBlocks` (built on `generateAnthropicToolJson`). `AnthropicTurnKernel` is `AnthropicTurnKernelFromProvider` with the live provider provided, still typed `Layer<AgentTurnKernel>`. | A one-step plan over a scripted `LanguageModel`, and `makeRepairInvalidBlocks` over a scripted repair call. |
| `epistemic/server/test/BoundedShaclValidator.test.ts:25` (`@beep/semantic-web/services/shacl-validation`) | `BoundedShaclViolationFactory` `Context.Service` with `makeViolation`, threaded through the validator's pure helpers. `BoundedShaclValidationServiceFromFactory` reads it. semantic-web had no factory seam to reuse. | `BoundedShaclViolationFactoryLive` builds the same `violation`-severity value with `ShaclValidationViolation.make`. `BoundedShaclValidationServiceLive` keeps its name and its `Layer<ShaclValidationService>` type. | The live factory wrapped with a `MutableRef` counter, so the capped-request case still proves generation stops (1 construction) rather than truncating late (3). |
| `tooling/tool/cli/test/codex-findings-packet-encode-failure.test.ts:10` (`Findings.triage.schemas`) | `CodexTriageLedgerEncoder` `Context.Reference` read by the triage document step of `renderPacketDocuments`. A reference was the smallest honest seam: it has a production default, so the renderer's signature and requirements do not change. Real invalid input cannot reach the branch, because every ledger field is built through validating constructors. | Default value `encodeCodexTriageLedger`. | `S.encodeUnknownEffect(S.Never)` through `Effect.provideService`: a real `SchemaError` that reaches the `payload-invalid` mapping. |

The sibling `ontology/client/test/worker-command-encode-failure.test.ts:18` is
left alone. It mocks `encodeWorkerCommand` in `@beep/ontology-use-cases`, a
synchronous `Result` codec called from atom code in another package, so the
renderer's reference does not apply. Retiring it needs its own seam in that
package.

## Migration

Each test drops its `vi.mock` and `vi.hoisted`, and imports no `vitest`. The
kernel test keeps its scenario record as a plain object that the test provider
reads. Its `it.layer` stays `concurrent: false` for the same reason as before.
The SHACL test counts through the factory seam instead of shadowing
`ShaclValidationViolation.make`.

## Mutation probes (one per test, restored)

| Test | Mutation | Result |
| --- | --- | --- |
| AnthropicTurnKernel | Kernel calls the module `repairInvalidBlocks` instead of `provider.repairInvalidBlocks` | 2 of 6 failed (repair usage, repair failure) |
| BoundedShaclValidator | `validationResult` materializes `A.fromIterable(violationBatches)` | 1 of 6 failed: `expected 3 to be 1` |
| codex-findings-packet-encode-failure | Renderer calls `encodeCodexTriageLedger` directly, ignoring the reference | 1 of 1 failed |

## Verification

Each check ran alone through `beep-heavy -- zsh -ic '...' </dev/null`.

- Dependency dists rebuilt with `turbo run build` filtered to the dependencies of
  the three packages (79 tasks successful).
- `check` (source and test overlays) exits 0 for `@beep/agents-server`,
  `@beep/epistemic-server` and `@beep/repo-cli`.
- The three test files pass on Bun (`bunx --bun vitest run`) and Node
  (`bunx vitest run`).
- `quality package-verify` passes for `@beep/agents-server` and
  `@beep/epistemic-server`. For `@beep/repo-cli` it ran 7,607 tests with one
  failure: `knowledge-doctor-evaluators.test.ts` compares goal-packet manifests
  read from the git tree with the working tree, and this lane's uncommitted
  `ops/manifest.json` statusNote edit makes them differ. With the HEAD manifest
  restored the file passes 14 of 14, so the failure is environment-only and
  clears once the edit is committed. repo-cli `lint` and `docgen` pass when run
  separately.
- `lint effect-vitest --write`: 1,213 rows to 1,210. The only identity changes
  are the three retired EV012 rows; the remaining diff refreshes line numbers in
  files that changed on `main` after the last regeneration. A follow-up scan
  reports `introduced=0 resolved=0`. All 7 `#1855 wave 4 register` exceptions
  remain.
- `observability catalog --write` and `lint schema-catalog --write` made no
  change (no new named spans or schemas).
- `lint schema-first` exits 0. The SHACL test's existing `SFV4-arbitrary-tests`
  exception moved from line 38 to line 40; its status and reason are unchanged.
- Biome over the six files, root `lint:oxlint`, the jsdoc inventory and
  `jsdoc-ratchet` (`increased=0`) pass. `fallow audit` against the merge base
  `dba006a1cc` returns `pass` with nothing introduced.

## Reversal

Revert the six source and test files and regenerate the inventory with
`lint effect-vitest --write`; the three module mocks return as open EV012 rows.
All three packages are private, so no changeset is involved.
