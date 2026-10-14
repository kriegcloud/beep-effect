# Independent first R20 refresh review — 2026-10-14

## Bounded verdict

**No remaining actionable accuracy or scope defect found in the first refresh candidate `7878eb923855f29ef421f6e0a6c31e752864bc14`.** Review began with dirty outputs on reproduction source HEAD `01b3d54700fa4327472fb7beb0ed169766902c90`; the parent committed that same candidate during review. The parent then integrated later main as `aeaa911d51`. This verdict covers the original refresh commit, not subsequent merged-head regenerated output. Fresh owner regeneration and committed-head parity are still required on the integrated source; cap gating and R14 serialized merge remain separate.

One accuracy issue was raised and corrected during review: handoff's present-tense statement that the source matched origin/main became stale when origin/main advanced to `3749e7ca4a`. Current handoff lines 13–15 now say the tree matched integrated main at `01b3d54700` when reproduction began and explicitly require later main integration plus fresh regeneration. No further corrective edit is requested for that wording.

## Scope and capture equality

- The pinned diff `01b3d54700..7878eb9238` has exactly eight generated standard outputs and seven packet files (PLAN, README, SPEC, handoff, stage-4 detectors, stage-5 acceptance, OPPORTUNITIES). No workspace source, agent guidance, root manifest/lockfile, coverage floor, Effect/Vitest inventory, effect-laws allowlist/snapshot, or policy fingerprint is in it.
- Before capture `.beep/rsc-resume/committed-artifacts.json` has six JSON artifact objects. Each matches the parsed artifact at reproduction HEAD `01b3d54700` exactly. After capture `.beep/rsc-resume/current-artifacts.json` has the same six paths; each matches the owner-generated file and pinned candidate commit `7878eb9238` exactly. JSONC owner header comments were excluded only for parsing; snapshot bodies were compared as objects.
- The other two outputs are JSDoc Markdown and JSDoc ratchet baseline. Owner logs name both generation paths; `refresh-jsdoc-ratchet.log:2` reports 21 tracked totals. Ratchet values inspected match current JSDoc totals and the regeneration/snapshot command provenance remains present.
- No generated exception body is changed: schema-first `entries` arrays are exactly equal, 126 before and after. Only generated metadata refreshes. This directly supports stage-4 detectors line 55 and handoff's no-admission statement.
- Catalog is preserved and regenerated rather than wiped: 6,211 to 7,377 schema-catalog entries. Coverage and Effect/Vitest catalogs/floors are untouched by the pinned candidate. Health's 13 target keys are byte-for-byte equal before/after.
- During initial review `git diff origin/main...HEAD` was empty; the large two-endpoint `git diff origin/main` represented lane lag behind newer main, not B source edits. The pinned candidate diff avoids attributing those unrelated main changes to B.

## Counts independently reconciled

Stage-4 detector receipt lines 49–58 accurately report JSDoc packages/modules/exports `141/2,880/20,404 -> 147/3,462/23,453`, remediation/open module/open export totals `120/366/2,949 -> 81/912/1,388`, missing examples `9 -> 8`, example-import/root-package findings `3,111/3,110 -> 1,363/1,342`, multiple descriptions `426 -> 425`, catalog counts and unchanged schema-first bodies. These values were read from before/after objects, not inferred from gate success.

Recomputed JSDoc identity sets independently from both captured inventories. Identity consists of repo path, symbol-or-module, row kind, finding family and serialized body, excluding location-only line/column/anchor; missingSummary and missingRequiredTags contribute identities. The result exactly matches `.beep/rsc-resume/jsdoc-finding-delta.json` and receipt lines 68–77: old 3,411; current 2,731; persisting 1,560; disappeared 1,851; new 1,171. Both identities reconcile (`1,560+1,851=3,411`, `1,560+1,171=2,731`). These are snapshot differences across intervening source/detector history, not 1,851 B repairs; the receipt says so and keeps new/persisting dispositions pending. Root package imports are correctly separated from root Effect imports.

Health `finding_counts` sums independently reproduce 181 before and 180 after, with 13 identical target keys. Parsed raw JSON in both `baseline-fallow-health.log` and `refresh-fallow-health.log` reports 5,227 files, 99,692 functions and 148 functions above threshold (2 critical, 13 high, 133 moderate), with `coverage_model: static_estimated`. The raw gate remains fail and result exit remains 1. Receipt lines 79–83 correctly keep these function/severity units separate from per-file baseline counts and do not claim zero complexity debt.

Census committed CLI count is 4,936,391; owner baseline is 5,168,031; difference is exactly 231,640. `baseline-census.log:156` reports that growth, and line 161 attributes its gate failure to the CLI count. The other five sample counts match before/after (456,717; 896,665; 17,335; 20,586; 17,915), same compiler `7.0.2+effect-tsgo.0.51.1`. `baseline-census.log:2` reports 150 packages; measurements inspected preserve zero diagnostics in both modes. Check time is explicitly advisory, and the source head/dirty state are not rewritten into a clean-head fiction.

## Raw execution and acceptance limits

`results.tsv` matches receipt dispositions: install, Sherif, 14 traversal fixtures, JSDoc, schema-first, root Effect import and supporting law checks, dead-code and build pass; schema-catalog stale snapshot, terse-effect, health and census baseline checks exit 1. Owner refresh commands all exit 0 except health, whose snapshot writes while raw complexity exit 1 remains. `.beep/rsc-resume/baseline-refresh.sh` preserves the required sequential owner-write order. Build log line 12556 reports 151 successful/151 total; artifact-fixtures log line 8 reports 14 passed. Existing landed repair replay is not presented as new B source repair.

Stage-5 `Package gates` and `Scope` correctly limit this wave to generated standards and packet evidence. No package edited means no package source gate is falsely asserted. Handoff and detector receipt keep committed-head parity, cap authorization, later guidance, provenance, paired fixtures, individual exception admissions and final zero scan pending. Review does not waive any of them or certify accepted program baseline counts before R14 merge.

Read-only review; only this private report written. No heavy commands, tracked edits, generated mutations, admissions, or hosted actions by reviewer.
