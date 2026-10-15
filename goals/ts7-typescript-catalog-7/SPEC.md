# TypeScript catalog 7 contract

## Scope and outcome

Move root typescript from ^6.0.3 to ^7.0.2 while retaining @typescript/native.
Keep infra/typescript ^6.0.3 for Pulumi with exactly one syncpack version rule.
Use exact @typescript/typescript6 6.0.2 for the two schema codemod modules and
scratchpad census. Enable Next useTypeScriptCli in oip-web/todox and the shared
schema. Replace Madge with oxlint import/no-cycle over the same tooling roots,
using the existing process runner and typed, fail-closed report decoding.
Expose real manual-tool consumers to Fallow via support entries, not exemptions.

Preserve the frozen ontology adapter bytes/digest. Hosted tstyche targets remain
5.9.3 || 6.0.3 in tstyche's store; TS7 uses the on-demand 7.1 next probe. TS7 7.0
is intentionally excluded by tstyche 8.0.0-beta.0. tsc-rs remains a separate gate.

## Constraints and acceptance

The user rulings, AGENTS.md and current schemas govern this retained packet.
Implementation committed at ca9d9a5828; main integration baf501b4aa contains
94f1b6adbf. Root/compiler isolation, both builds, new circular tests, Fallow and
requested broad proof ran in Waves 2-3. Attributed reds are retained in the lane
report, not represented as green. This packet closes by the explicit Wave 4
operator ruling; git publication is not claimed by the implementation lane.

Wave 4 permits S31b's owning baseline writer only for current root configuration
drift with a hashed basis, subjects ["//"], and unchanged scope/profile/epoch.
No qualification expansion, exception growth or unrelated subject re-review.
Stop the baseline step for any other blocking kind/subject. Never mutate frozen
historical evidence, change tstyche targets, collapse the native alias or use
publication commands in this edit/verify lane.

## Verification

Wave 4 runs reflection-artifacts, manifest jq, goals doctor/index, GOAL length,
then sherif, config-sync, package-scripts, fingerprint, cache audit, effect-vitest,
schema-first, observability catalog, schema-catalog, retired Effect paths,
changeset graph, Fallow audit, knowledge refs and diff whitespace checks.
Exact commands, exits and known limitations live in report-E.md.

## Decision Log

The following rows preserve the chronology from Waves 1-3. The Wave 2 five-patch
Madge approach and Fallow dependency exemption were rejected and removed in
Wave 3. The original S31 cache stop is superseded only by the narrow Wave 4 S31b
ruling. Base-selection rows describe their recorded wave, not the current base.

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-15 | Stop lane E before edits. | Latest prompt requires a 7.0.2 tstyche target and stop on failure; installed beta rejects it. Earlier lane C ruling is recorded but is not silently substituted. | Reconcile kickoff with the approved lane-C 7.1/on-demand contract, then resume from this clean checkout. |
| 2026-10-15 | Accept clean 4052da587f as the inspected checkout and disclose it. | It is local origin/main, immediate child of requested 5861a2b012; intervening change only deletes a private changeset. | Resume against the orchestrator-selected base after read-only provenance verification. |
| 2026-10-15 | Treat schema codemod core/fixup and documented census as live manual API consumers pending isolation. | Active goal rerun instructions, fixture imports and census acceptanceCommands exist; absence from automatic check tasks does not retire them. | After isolation/port verification, remove their TS6 pins; or explicitly archive the relevant tools and retire live run instructions. |
| 2026-10-15 | Preserve frozen ontology adapter bytes and sidecar. | Historical run identity is digest-bound and exploration is graduated. | New versioned adapter/run can use a supported API while old evidence stays immutable. |
| 2026-10-15 | Keep @typescript/native alias unchanged when catalog flip resumes. | Operator explicitly reserves alias collapse for a separate follow-up. | Collapse alias only in that reviewed follow-up after consumer/bin resolution proof. |
| 2026-10-15 | Admit lane E under the lane C tstyche contract. | Explicit orchestrator ruling: hosted exact legacy targets and on-demand 7.1 next probe are accepted; root TypeScript API is not loaded by those targets. | Restore catalog/lockfile from reviewed parent diff; do not silently change tstyche targets. |
| 2026-10-15 | Keep @typescript/native alias unchanged. | Alias consolidation is explicitly a separate follow-up; existing patch/API consumers retain their path. | Collapse only in a later verified migration. |
| 2026-10-15 | Use exact @typescript/typescript6 6.0.2 at root/scratchpad for live API scripts. | Newest published 6.0.x bridge; preserves classic AST semantics while root name moves to TS7. | Port or retire these tools, remove imports/declarations/catalog entry, reinstall. |
| 2026-10-15 | Scope literal typescript ^6.0.3 to infra with one syncpack rule. | Pulumi nodejs runtime and ghaRunners require classic 6.x until Alchemy migration. | Remove pin/rule after Pulumi removal and SDK migration; return infra to catalog if still needed. |
| 2026-10-15 | Expose optional useTypeScriptCli in the shared Next schema and enable it in both apps. | Avoid absent TS7 classic JS API; schema must retain the app setting. | Revert configs/schema/test together only when the chosen compiler supports the replacement build path. |
| 2026-10-15 | Preserve frozen ontology adapter and digest. | Historical run evidence is immutable; operator explicitly requires preserving it. | Version a new adapter/run without mutating historical evidence. |
| 2026-10-15 | Stop cache-baseline work after 27 blocking findings. | S31 forbids debt growth/baseline requests; exact output is retained above. | Resolve cache policy through orchestrator-owned remediation, then rerun audit without adding an exception inventory. |
| 2026-10-15 | Route Madge’s existing classic parser stack through five version-scoped bridge patches. | Root TS7 breaks classic API access; main-manifest TS6 succeeds, and hoisted peer overrides/local pin probes do not isolate the parser. Preserve scanner behavior without a root TS6 name or new direct ESLint dependency. | Migrate the scanner/native-capable dependencies, prove circular lint, remove the five patchedDependencies entries and patch files, reinstall. |
| 2026-10-15 | Model the bridge’s real consumers outside Fallow’s scan with one named dependency exemption. | Goals, scratchpad and installed patched dependencies are excluded from the source scan; tests and circular lint prove usage. | Remove the exemption when those consumers become reachable to Fallow or are retired. |
| 2026-10-15 | Replace Madge with native oxlint import/no-cycle. | Operator ruling; remove the classic parser stack and five patches while preserving value-cycle semantics and the existing task id. | Restore the reviewed prior implementation/dependency state together with compatible compiler API resolution, or replace the native config under fresh tests. |
| 2026-10-15 | Decode cycle JSON with branded schemas and require a positive file count. | Operational failures and zero-file scans must fail closed; reuse existing process runner and typed error channel. | Change the report schema only alongside tests against the installed oxlint format. |
| 2026-10-15 | Make manual development consumers visible through support entry roots. | Stronger Fallow model replaces the bridge exemption; these tools are development support, not production entrypoints. | Remove support roots only when the tools retire or a built-in plugin discovers them; never restore the exemption silently. |
| 2026-10-15 | Declare root jsonc-parser devDependency. | run.ts really imports it; visibility exposed a previously hidden manifest omission. | Remove after migrating or retiring that import. |
| 2026-10-15 | Keep the checkout rebase-free at 4052da587f. | Explicit operator instruction; shared origin/main advanced independently during proof. | Orchestrator integrates the lane on its selected base after review. |
| 2026-10-15 | Leave cache qualification/baseline ruling to the orchestrator. | S31 forbids inventory growth; final audit output will be reported without baseline requests. | Apply an explicit orchestrator ruling outside this edit/verify lane. |
| 2026-10-15 | Re-record only the drifted root subject under S31b. | Explicit Wave 4 ruling permits reviewed input drift without changing scope/profile/epoch or qualification; all 28 blockers (27, plus #1827's new lint:opaque-roundtrips after the main merge) are root configuration drift. | Restore the previous baseline from the parent revision and re-run audit; review changed inputs again before another re-record. |
| 2026-10-15 | Retain this packet as completed-retained with complete phases. | Wave 4 explicitly requires a durable lane E packet after the orchestrator commit and clean main integration; publication and inherited reds remain separately owned. | Reopen manifest lifecycle and phases with a new documented scope if further lane E implementation is required. |
| 2026-10-15 | Regenerate the stale repo-cli instrumentation catalog through its owner. | The native analyzer replaces two nonconforming trace names with conforming Lint.circular; generated data must follow the committed implementation and no debt rows grow. | Restore the prior generated shard only together with the matching source; otherwise rerun the writer after a source revision. |
| 2026-10-15 | Keep the manual bridge tools out of Fallow health scope while dead-code discovery sees them. | Discovery inclusion surfaced their complexity to the health gate; on main neither path was ever health-scored, and the existing health.ignore precedent covers graph-visible, complexity-excluded code. Health scope is unchanged versus main. | Drop the two health.ignore entries when the tools retire or are brought under the complexity ceilings. |
