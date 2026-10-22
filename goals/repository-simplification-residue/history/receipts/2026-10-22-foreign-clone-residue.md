# Foreign-clone residue census, 2026-10-22

Resolves the bounded local-residue disposition in #1854. The program orchestrator
owns this receipt; checkout owners below come from `bun run beep session open`.
The later S44 issue triage authorizes this census and the single idle-map archive.

Snapshot completed at `2026-10-22T12:37:41.371555+00:00`. Census: 242 git checkouts in
`~/YeeBois/projects/beep-effect*`, including children of 24
sibling `-worktrees` roots. Git metadata and working trees were read with
`GIT_OPTIONAL_LOCKS=0`; no foreign checkout was modified except the named map move.
The primary `beep-effect` working tree was preserved.
`beep-effect11-worktrees/practice-services` was excluded entirely.

## Method and limits

- Enumerate immediate sibling git checkouts and git checkouts immediately inside
  sibling `-worktrees` roots; non-git directories are not checkouts.
- Collect `git status --porcelain=v1 --ignored=no -z --untracked-files=normal`,
  collapse untracked entries to their top-level path, and filter against this
  fresh-main lane's `.gitignore` with `git check-ignore --no-index`.
- Main ignores both `.serena/` and `map.html`; include them explicitly because
  the brief names them. Other main-ignored candidates are excluded.
- Read foreign file contents only to compute SHA-256. Directory byte counts sum
  descendant file sizes without following directory symlinks; they describe the
  entire top-level directory, including tracked or ignored descendants, rather
  than only its untracked subset. Directory hashes are not applicable.
  Counts are logical bytes and do not measure reclaimable filesystem space.
- An open ledger row means live owner. A blocked row means unknown liveness;
  no row means idle under the brief's ledger rule, not proof that no process
  exists. Rows for other worktrees do not transfer ownership to their clone root.
- Retained paths recover in place: the recovery destination is their source
  path. No backup or deletion of those paths is claimed.

## Per-path disposition

Paths are relative to `~`. `none` means no ledger owner for the exact checkout.
Serena directories are live per-project MCP state regardless of checkout liveness;
the current `.mcp.json` still configures the `serena` server.

| Path relative to ~ | Owner | Bytes | SHA-256 (regular files only) | Checkout liveness | Action and recovery destination |
| --- | --- | ---: | --- | --- | --- |
| `~/YeeBois/projects/beep-effect-worktrees/effect-schema-parity-align/explorations` | none; program orchestrator disposition | 107396666 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect-worktrees/effect-schema-parity-align/goals` | none; program orchestrator disposition | 157818690 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect-worktrees/pr-1134-closeout/.pr1134-r4-summary.md` | none; program orchestrator disposition | 3423 | 1bdd22f075e08c2e22ed49ea2a5ef36f886f8f5ead4e9f6aa7d85073181e7237 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect-worktrees/pr-1134-closeout/.review-r6` | none; program orchestrator disposition | 135409 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect-worktrees/pr-1138/.pr1138-review-payload.json` | none; program orchestrator disposition | 11804 | ab0771d80177e767d62214e376f48b10478d20989cdde89b35151c14965383f5 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect0-worktrees/pr1131-r5/review-summary.md` | none; program orchestrator disposition | 4981 | 8f90f1471f7398ee21039e5306afcc2d7deb5a8969404677e51fb6cef4dfc62d | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect0-worktrees/pr1132-e6b656/_review-r2` | none; program orchestrator disposition | 267060 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect10-worktrees/effected-w2d/packages` | claude-code (open row) | 271806977 | directory | live owner | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect11/.serena` | claude-code (open row) | 11384 | directory | live owner | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect12-pr874/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect13-handoff/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect14/.serena` | none; program orchestrator disposition | 11384 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect16/.serena` | none; program orchestrator disposition | 11384 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect16-widen2/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect16-widen3/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect18/.serena` | none; program orchestrator disposition | 11384 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect19/tools` | none; program orchestrator disposition | 43739 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect19-openai-driver/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect19-scratchpad-type-repairs/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2/.serena` | none; program orchestrator disposition | 13426 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect2-goalshot2/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-proof/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-worktrees/effect-vitest-capability-leaves/goals` | none; program orchestrator disposition | 218839435 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-worktrees/effect-vitest-inventory-proof/goals` | none; program orchestrator disposition | 216977634 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-acceptance/goals` | none; program orchestrator disposition | 236736928 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-acceptance/packages` | none; program orchestrator disposition | 291386566 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-capture-controls/goals` | none; program orchestrator disposition | 232360546 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-capture-controls/packages` | none; program orchestrator disposition | 276253595 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-capture-source/goals` | none; program orchestrator disposition | 172250876 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-test-policy-repairs/goals` | none; program orchestrator disposition | 236778824 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2-worktrees/research-corpus-synthesis/explorations` | codex (open row) | 159081199 | directory | live owner | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect20/.serena` | none; program orchestrator disposition | 11384 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect20-worktrees/bun-test-pilot/scratchpad` | none; program orchestrator disposition | 15095131 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect21-worktrees/node-modules-link-probe/.changeset` | none; program orchestrator disposition | 299868 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect22/.serena` | none; program orchestrator disposition | 11386 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect3/.serena` | none; program orchestrator disposition | 11383 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect3/packages` | none; program orchestrator disposition | 4118488184 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect3/scratchpad` | none; program orchestrator disposition | 78233218 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect3/sst-env.d.ts` | none; program orchestrator disposition | 289 | 7a67b58da08364c7e45b4cc6cb7f105c5dc12f7b22c749fdb41dd35530bd35ba | idle | Retained in place; SST declarations belong to #1851 |
| `~/YeeBois/projects/beep-effect3-worktrees/coverage-floor/.changeset` | none; program orchestrator disposition | 355262 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect3-worktrees/coverage-floor/packages` | none; program orchestrator disposition | 113781645 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect5/.serena` | claude-code (blocked row) | 13426 | directory | unknown | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect6/.serena` | none; program orchestrator disposition | 13426 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect6-worktrees/security-followup-2026-10-14/packages` | none; program orchestrator disposition | 271966564 | directory | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect7/.serena` | none; program orchestrator disposition | 13426 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect7-gitleaks-beta105/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect7-write-wall/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect8/.serena` | none; program orchestrator disposition | 11383 | directory | idle | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect9/.serena` | codex (blocked row) | 11383 | directory | unknown | Live Serena MCP state; retained in place |
| `~/YeeBois/projects/beep-effect9-ceiling/.ignore` | none; program orchestrator disposition | 180 | 5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507 | idle | Retained in place; archive outside bounded scope |
| `~/YeeBois/projects/beep-effect2/map.html` | none; program orchestrator disposition | 4949263 | 2f3ceb4b1de7928f04273cb96a5a7aac7ce6ac7347fcc70ab07ea413ca983a80 | idle | archived; size and SHA-256 verified; `~/.cache/beep/residue/beep-effect2/map.html` |

## Archive and reversal

The only move was `~/YeeBois/projects/beep-effect2/map.html` to
`~/.cache/beep/residue/beep-effect2/map.html`. Immediately before the move, a
second `session open` read found no owner row for `beep-effect2`. The destination
did not exist, and the source digest still matched the census. After the rename,
the source was absent and the destination had the same byte count and SHA-256.
No file content was inspected beyond hashing.

To reverse, first recheck the clone owner, require the original source path to be
absent, and verify the archive against the digest above. Then move the archive
back to its original path without overwriting any replacement. The archive is
local recovery state; this receipt does not claim a remote backup.

## Coverage

Every enumerated checkout returned a successful status read. The following table
lists all scanned checkouts by sibling root. Counts in the disposition table are
a point-in-time observation; concurrent owners may subsequently change their paths.

| Sibling root relative to ~ | Scanned checkout names |
| --- | --- |
| `~/YeeBois/projects (clone roots)` | `beep-effect`, `beep-effect-private`, `beep-effect0`, `beep-effect10`, `beep-effect11`, `beep-effect12`, `beep-effect12-pr874`, `beep-effect13`, `beep-effect13-handoff`, `beep-effect14`, `beep-effect15`, `beep-effect16`, `beep-effect16-widen2`, `beep-effect16-widen3`, `beep-effect17`, `beep-effect18`, `beep-effect19`, `beep-effect19-openai-driver`, `beep-effect19-scratchpad-type-repairs`, `beep-effect2`, `beep-effect2-goalshot2`, `beep-effect2-proof`, `beep-effect20`, `beep-effect21`, `beep-effect22`, `beep-effect3`, `beep-effect4`, `beep-effect5`, `beep-effect6`, `beep-effect7`, `beep-effect7-gitleaks-beta105`, `beep-effect7-write-wall`, `beep-effect8`, `beep-effect8-s5`, `beep-effect9`, `beep-effect9-ceiling` |
| `~/YeeBois/projects/beep-effect-private-worktrees` | `curation-normalized-candidates`, `curation-view-resolution`, `frame-curation-proof`, `frame-curation-selection` |
| `~/YeeBois/projects/beep-effect-worktrees` | `agent-rating-critique-fixes`, `ai-metrics-p6-proof`, `ci-burst-20260903-2-restore`, `ci-burst-20260903-2-up`, `ci-burst-20260903-restore`, `ci-burst-20260903-up`, `effect-rc115-verify`, `effect-schema-parity-align`, `firecrawl-driver`, `inline-schema-head-control`, `inline-schema-package-proof-v2`, `jsonl-effect-first`, `jsonl-zero-findings`, `ontology-interop-pr`, `p1-a-verdict`, `p1-deps-audit-fix`, `playground`, `portfolio-driver`, `pr-1134-closeout`, `pr-1138`, `pr-858-coverage`, `pr-872-closeout`, `pr-873-closeout`, `pr-992-closeout`, `repo-cli-deterministic-projections`, `s43-tooling-debt`, `security-cloud-connector`, `ship-velocity-proof-a`, `ship-velocity-proof-b`, `ship-velocity-proof-c`, `ship-velocity-proof-d`, `tauri-linux-dev-shell`, `tsgo-045-effect-idiom-sweep`, `unblock-ci-dep-review`, `yeet-inbox-backpressure-classification` |
| `~/YeeBois/projects/beep-effect0-worktrees` | `pr-1133`, `pr-1134`, `pr1131-r5`, `pr1132-e6b656`, `pr1365-r10-959a7707`, `pr1365-r7-1710f6d3`, `pr1365-r8-9b8fd7d`, `pr1365-r9-061d6f89`, `pr1367-r5-e11b4b25`, `pr1371-r10-9951f493`, `pr1371-r11-cc6b6500`, `pr1371-r4-b3113ec`, `pr1371-r6-b613a847`, `pr1371-r7-44b8e11`, `pr1371-r7-67ba9397`, `pr1371-r9-a6b071c2`, `pr1372-r1-b74aa346`, `pr1372-r2-b4f3af4`, `pr1372-r3-f6129129`, `pr1372-r4-7bd88007`, `pr1373-r2-0bb133dc`, `pr1374-r1-48917b6e`, `pr1375-r1-3bd5bc77`, `pr1376-r1-011e87de`, `pr1378-r1-ee2d3435`, `pr1378-r2-9e58a18f`, `pr1378-r2-c3370bef`, `pr1378-r2-faa5f61e`, `pr1378-r3-8b2e5008`, `pr1378-r4-6a06e7b6`, `pr1379-r1-051b8355`, `pr1379-r1-8af2f8e8`, `pr1379-r2-02056d93`, `pr1380-r1-02c966f0` |
| `~/YeeBois/projects/beep-effect10-worktrees` | `effected-w2d`, `w2d-baseline`, `w2d-bench-base` |
| `~/YeeBois/projects/beep-effect11-worktrees` | `corpus-restore`, `osv-postcss-selector-parser`, `s44-coverage-1893`, `s44-duckdb-followups`, `s44-ev010`, `s44-probes-1858`, `s44-repo-cli-bugs`, `s44-residue-1854`, `s44-retention-1871`, `s44-vitest-lanes-1877` |
| `~/YeeBois/projects/beep-effect14-worktrees` | `editor-deflake` |
| `~/YeeBois/projects/beep-effect18-worktrees` | `lint-policy-close-proof` |
| `~/YeeBois/projects/beep-effect2-worktrees` | `api-docs-lab`, `doctest-mark-ui-system`, `effect-vitest-acp`, `effect-vitest-agents-foundation`, `effect-vitest-business-drivers`, `effect-vitest-canon-baseline`, `effect-vitest-canon-continuation`, `effect-vitest-canon-detector-resources`, `effect-vitest-canon-property-boundaries`, `effect-vitest-canon-property-values`, `effect-vitest-canon-resource-next`, `effect-vitest-capability-leaves`, `effect-vitest-cli-config`, `effect-vitest-coverage-followup`, `effect-vitest-database-drivers`, `effect-vitest-government-drivers`, `effect-vitest-inventory-proof`, `effect-vitest-leaves-checkpoint`, `effect-vitest-lint-rules`, `effect-vitest-mcp-kit`, `effect-vitest-md`, `effect-vitest-media-drivers`, `effect-vitest-observability`, `effect-vitest-phoenix`, `effect-vitest-pr1399-conflict`, `effect-vitest-pretext`, `effect-vitest-provenance`, `effect-vitest-provider-drivers`, `effect-vitest-rdf`, `effect-vitest-repo-configs`, `effect-vitest-repo-utils`, `effect-vitest-shared-domain`, `effect-vitest-wave-d-colors`, `effect-vitest-wave-d-cosmos`, `effect-vitest-wave-d-pacer`, `llm-provider-auth`, `obs-timing-provenance-review`, `option-literal-fallbacks`, `pr-531-lint-oom`, `pr1399-conflict-repair`, `pr1934-coverage-proof-a753347dc5`, `qualification-acceptance`, `qualification-approved-workflow`, `qualification-capture-controls`, `qualification-capture-source`, `qualification-fresh-pairs`, `qualification-main-06a5-repair`, `qualification-operational-93a1`, `qualification-patched-portability`, `qualification-patched-profile`, `qualification-patched-shadow-source`, `qualification-pilot-a1`, `qualification-pilot-a2`, `qualification-pilot-b1`, `qualification-pilot-b2`, `qualification-pilot-c1`, `qualification-pilot-c2`, `qualification-pilot-d1`, `qualification-pilot-d2`, `qualification-pilot-e1`, `qualification-pilot-e2`, `qualification-pilot-f1`, `qualification-pilot-f2`, `qualification-pilot-g1`, `qualification-pilot-g2`, `qualification-pilot-h1`, `qualification-pilot-h2`, `qualification-pilot-i1`, `qualification-pilot-i2`, `qualification-pilot-j1`, `qualification-pilot-j2`, `qualification-pilot-runner`, `qualification-portability`, `qualification-runtime-current`, `qualification-security`, `qualification-signed-matrix`, `qualification-test-policy-repairs`, `qualification-test-tsgo-repairs`, `qualification-v9-source-a`, `qualification-v9-source-b`, `qualification-workflow-v9`, `research-corpus-synthesis`, `research-shared-coverage`, `s44-coverage-1894` |
| `~/YeeBois/projects/beep-effect20-worktrees` | `bun-test-pilot` |
| `~/YeeBois/projects/beep-effect21-worktrees` | `node-modules-link-probe` |
| `~/YeeBois/projects/beep-effect3-worktrees` | `coverage-floor`, `ep27-unblocker`, `pr-1750-conflicts`, `pr-1760-conflicts`, `pr-1767-conflicts`, `pr-1771-conflicts`, `pr-1926-conflicts`, `rsc-residue-detectors-w3`, `ts7-tooling` |
| `~/YeeBois/projects/beep-effect5-worktrees` | `document-semantic-conformance`, `document-semantic-conformance-grok-review`, `effect-ref-home-paths`, `per-module-imports-p2-before` |
| `~/YeeBois/projects/beep-effect6-worktrees` | `retired-effect-paths-unblock-2026-10-14`, `security-followup-2026-10-14`, `yeet-auto-admit-heavy` |
| `~/YeeBois/projects/beep-effect7-worktrees` | `duckdb-a-map-fix`, `duckdb-sql-followups`, `graft-auto-upgrade` |
| `~/YeeBois/projects/beep-effect8-worktrees` | `model-routing-final-proof`, `ontology-emission-v2` |
| `~/YeeBois/projects/beep-effect9-worktrees` | `boolean-creep-r40-recovery`, `boolean-creep-r54-audit`, `boolean-creep-r54-audit-v17`, `boolean-creep-r54-audit-v5`, `code-graph-baseline`, `code-graph-baseline-7a0-qualification`, `code-graph-baseline-accounts`, `code-graph-evaluation`, `effect-nested-module-imports`, `r2-cache-pilot`, `r2-cache-rollout` |

## Left open

SST declarations remain with #1851, including the observed `sst-env.d.ts` above.
All other untracked paths remain with their live checkout owner or the program
orchestrator for a separately bounded disposition. Original Vitest work, pilot
state, active jobs, and Serena state were preserved. This receipt closes #1854's
census and authorized archive; it does not claim those retained paths are deleted
or that the broader repository-simplification packet is complete.
