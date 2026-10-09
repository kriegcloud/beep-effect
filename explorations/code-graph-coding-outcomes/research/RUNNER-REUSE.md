# Runner reuse and minimum extension — 2026-10-09

The protected staged audit is digest-linked in [readiness-import.json](readiness-import.json). Its wider source inventory was at main `78b77b1084d83eb105e9161d56c68d6848b63047`; live lane searches reconfirmed BenchmarkRun and the AgentConvention schema locations below. Revalidate the remaining seams on the final common snapshot before claiming implementation compatibility. This initial audit preceded the runner implementation; source work now extends these seams in the same orchestration lane.

| Capability | Source bound seam | Disposition / limit |
| --- | --- | --- |
| Case/run/scorecard | `packages/tooling/library/ai-metrics/src/models.ts:951,990,1038`; `scorecard.ts:309,997` | Reuse BenchmarkCase/BenchmarkRun and recordAiMetricsBenchmarkRun after authoritative acceptance/full proof; Boolean passed cannot represent aborted/unknown/unsupported attempts. |
| Declared trial controls | `packages/tooling/tool/cli/src/commands/AgentEffectiveness/AgentEffectiveness.schemas.ts:504,537,569,604` | Extend existing controls/variant/nullable measurements/trial identity rather than duplicate contracts. Preserve separate commit and SHA-256 source digest. |
| Static eval and comparison | `AgentEffectiveness/internal/EvalScorer.ts:128`, `EvalComparison.ts:110`, `EvalRecord.ts:195` under the same CLI commands root | Reuse diagnostics and comparisons; current static score-record passed mapping cannot serve as authoritative full-task pass. Keep one-surface comparison invariant; integrated graph configs require an explicit matrix contract. |
| Config evidence | `packages/tooling/library/ai-metrics/src/config-snapshot.ts:955,1126` | Reuse observed isolated config fingerprints; report discovered surfaces, omissions and truncation. |
| Process/resource ownership | `packages/tooling/tool/cli/src/internal/process/StepExec.ts:1050,1167`; `internal/repo-run/RunScope.ts:195,325` | Reuse spawn/cancellation/reap/admission. Add complete protected disk spooling; bounded/merged capture is insufficient as raw evidence. |
| Worktree lifecycle | `packages/tooling/tool/cli/src/commands/Worktree/Worktree.command.ts:76,349,406,452`; `internal/repo-run/GitWorktree.ts:112` | Reuse resolution/preservation. High-level bootstrap copies local env/guidance/IDE files: add explicit pinned-start/no-copy trial profile. Retain refs/commits/diffs before removal. |
| Exact Yeet proof | `packages/tooling/tool/cli/src/commands/Yeet/internal/Verdict.ts:619,699`; `Handler.ts:1906,1944`; `ArtifactPaths.ts:416,455,479`; `ProofFact.ts:233,298` | Decode terminal full-tier verdict bound to final head; retain command/exit/journal/proof epoch/reuse provenance. Clone-owned proof storage may outlive lane. |
| Content-free telemetry/private raw | `packages/tooling/library/ai-metrics/src/flight-record.ts:101,258,410`; `telemetry-v2.ts:261`; `telemetry-v2-store.ts:204,225`; `archive.ts:480,644`; `privacy.ts:457,497,802` | Reuse bounded mechanical/semantic/evidence fields, weakest tier, enumeration-before-read and protected archive. Raw commands/prompts/results remain a separate restricted surface. |

**NOT FOUND in the staged audit:** complete typed three-harness executor; provider-native usage/cache/adoption parser for this experiment; Grok source parity; tagged matrix attempt and exact-proof pass projection. Existing transcript ingest summarizes events and timestamps, not native provider token splits. Missing measurements are null, never manufactured from text length or vendor savings counters.

Minimum new behavior: typed matrix/run/attempt receipt contracts; three narrow native CLI stream adapters; protected full stdout/stderr spool; selected-tool-only isolated launch; exact-final task/full-Yeet projection; reports retaining failed/unknown cells and independent quality/reuse dimensions. Repo-operational implementation extends `packages/tooling/tool/cli/src/commands/AgentEffectiveness`; reusable telemetry vocabulary extends `packages/tooling/library/ai-metrics`. No new generic framework, workspace package, daemon, UI or production hooks are justified.

Implementation follows schema-first/effect-first and `beep architecture` for new role files. The runner pilot must prove control+graph isolation, real token/cache parsing, observed assigned-tool calls, source/input digests, local-only commit, exact-final full verify, blinded bundle, interruption/resume and failure retention. Parser canaries cover correct/wrong paths, cumulative/delta usage, unavailable cache/counts, partial JSONL, retries and interruption. Any unsupported interface stays explicit; do not build an undocumented wrapper advantage.

## Current implementation and proof boundary

The implementation adds typed trial plans, attempt receipts, native usage and
identity parsers, isolated execution, committed-source reconstruction, collection
and finalization to AgentEffectiveness. `evals collect` is the explicit CLI entry
for frozen evaluator requests. Full stdout/stderr and native identity sidebands
remain protected artifacts; unknown child usage stays unknown.

The synthetic CLI collect/finalize fixture proves plumbing, not coding quality.
The fresh-source NLP package audit and docgen pass with uncached builds and
unchanged tracked source. The actual offline canonical full-Yeet rehearsal
passed cheap gates, then failed on evaluator runtime prerequisites for Docker
security scanning, Nix and manifest access. Those failures remain separate from
the inherited full-scope coverage failures on candidate main. No runtime or
focused-test result admits a scored trial until the actual end-to-end pilot and
full exact-commit proof pass.
