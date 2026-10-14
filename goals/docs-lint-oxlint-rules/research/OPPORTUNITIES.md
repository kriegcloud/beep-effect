# Friction receipts

- 2026-10-14: Host OOM interrupted discovery before implementation. Worktree inspection showed
  only the bootstrapped packet; no tracked edits or pending owned command. Re-ran discovery.
  Admission and serialized heavy commands reduce simultaneous memory pressure.

- 2026-10-14: CLI dependency build and focused docs tests waited for the workstation's
  five occupied admission slots. Admission remained enabled; no competing slot holders were stopped.
- 2026-10-14: The kickoff's cache review example packet is absent in this checkout.
  Used the current tsc-rs-gates cache request/review as the equivalent live format reference.
- 2026-10-14: New docs tests introduced two Effect-vitest findings. Corrected the test-runner
  import and retained layer-based tests; the committed baseline was not refreshed.

- 2026-10-14: Schema-catalog regeneration includes extensive stale rows from untouched sources.
  See schema-catalog-drift.md for keyed counts. A bounded catalog update or main-first generated
  baseline maintenance would prevent unrelated regeneration churn in implementation lanes.
- 2026-10-14: Root docs parity exposed declaration association differences (indirectly exported
  variables and adjacent JSDoc blocks). Corrected rule coverage before accepting any findings.
  The two remaining empty-code-span TSDoc warnings reproduce in the retained ESLint profile.

- 2026-10-14: Package verification raised audit/docgen P0 rows. The runtime reminder required
  inbox acknowledgement despite the lane's no-Yeet envelope. --observed rejected package
  findings; time-limited remediation waivers were recorded solely to acknowledge these rows.
  They do not authorize publishing, and the introduced errors were fixed before final reruns.
- 2026-10-14: The requested quality:knip root script no longer exists. knip:check is the
  current executable lane and was also requested; both command outcomes are retained.
- 2026-10-14: docgen:local required --full because catalog/lock/Turbo inputs changed. Retain
  the refused bounded invocation and run the requested full proof under admission.

- 2026-10-14: The focused worker test still asserted ESLint's old diagnostic name after
  switching to oxlint. Updated only the jsdoc branch to beep(require-jsdoc); the invalid
  fixture now proves the mandatory rule runs through the actual CLI worker.

- 2026-10-14: Full repo-cli audit passed 6160/6161 tests. The only failure compares tracked
  knowledge-tree packets (215) with live filesystem packets (216); the missing record is this
  intentionally untracked docs-lint-oxlint-rules packet. The lane cannot stage it because git
  ownership belongs to the orchestrator. Re-run the test after orchestrator review/commit, without changing
  the unrelated evaluator or hiding the packet.
- 2026-10-14: Lint policy reported unavailable optional remote-cache secret references.
  op-doctor ran once: current agent PATH/identity/read and credential modes pass; its systemd
  fallback PATH and user-bus environment probes fail. No secret values were emitted and no
  desktop unlock, sign-in, privilege prompt or credential repair was attempted.

- 2026-10-14: Full lint policy's medium phase fails only the two inherited empty-code-span
  warnings in repo-cli docs. The retained deprecated-API sweep then hit its 900000ms capture
  timeout (exit 124). These are orchestrator/main follow-ups; no shared deprecated settings
  or secret routing were changed here.

- 2026-10-14: The required session note exited 1 in the restricted lane environment. Its
  output is retained in session-note.log; the packet and assigned report preserve closeout
  state. No permission prompt or global filesystem repair was attempted.

- 2026-10-14: The final Knip rerun remained queued behind five admission holders after all
  owned package/docgen proofs finished. The admission budget and unrelated jobs were preserved.

### 2026-10-14 merge recovery

`git checkout --theirs` failed: `index.lock: Read-only file system`. Copied exact stage-3 bytes with `git show :3:<file>` instead, preserving the orchestrator-owned index. CLI startup initially failed on missing `@beep/t3-code`; `bun install --ignore-scripts` restored workspace links. Graft retrieval stalled after package parsing was repaired; targeted source reads were needed. A merge-aware read-only index fallback and install preflight would prevent this friction.

### Inherited assignment ownership gap after main merge

`beep lint deprecated-apis --full` exits 1: main adds `packages/tooling/tool/cli/scripts/CreateKnowledgeMintApp.ts` and `packages/tooling/tool/cli/test/fixtures/observability-catalog/sources.ts` without tsconfig ownership. The summary reports 204 programs and 17 unmatched paths, exactly matching its path list; only these two paths are TypeScript. Compiler configs are byte-identical to MERGE_HEAD. Main should repair ownership once; excluding these paths would weaken the law.

### Merge cheap-gate repairs

Sherif rejected docs dependencies in `@beep/lint-rules` because their keys were unordered; sorted only that dependency block. Config sync detected the missing alias for the lane's docs plugin export; regenerating aliases through `beep tsconfig-sync`. Running both cheap gates before handoff would catch these gaps earlier.

### Schema law adoption on merge

`beep lint schema-first` found lane-owned D1/D4 violations in DocsRuleSet and TSDocConfigurationError after main's schema-law migration. Converted the plain-data class to branded Opaque/Struct and branded the tagged error manually, without running the forbidden write mode. Checking the current schema skill immediately after merging main would catch this sooner.

### Generated catalog catch-up

The schema catalog owner regenerated 7812 entries after the schema-law repair. Main's catalog was stale across its schema migration, so this includes broad inherited kind changes in addition to the docs lane entries. Retained the owner-generated result instead of hand-editing generated rows. The closeout session note also exited 1 under the restricted environment; the external lane report remains the durable handoff.

## Fallow wave

Publish rejected eight introduced complexity findings despite the prior package quick checks. The combined docs Program visitor measured cyclomatic 68/cognitive 144. Split rule dispatch and AST lookup, extracted assignment proof and test setup/check helpers; no ignores or threshold changes. A Fallow audit in the package handoff would have exposed this before publish. Existing observability catalog/architecture dirt belongs to the orchestrator and is preserved.

The first typecheck exposed the external AST's nullable parent, ObjectProperty spelling, union-valued MethodDefinition discriminator, and recursive nested-pattern inference. Behavior tests were green; corrected the typed AST adapter and flattened export matching before rerunning the package gate. Reading the external AST declaration surface before selecting nested Match patterns would have prevented the compiler churn.
