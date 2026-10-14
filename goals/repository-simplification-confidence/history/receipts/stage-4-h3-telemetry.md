# H3 telemetry qualification

Status: repository repair implemented; external qualification prerequisites remain. No non-use retirement is supported by this receipt.

## baseline

At the initial lane head, the hook census returned:

| Client | Rows | Sessions | SessionStart sessions | Stamped sessions | Surface rows | Distinct stamps |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Claude | 564057 | 1819 | 191 | 191 | 1397 | 116 |
| Codex | 422540 | 1501 | 3 | 0 | 0 | 0 |
| Cursor | 2403 | 28 | 0 | 0 | 0 | 0 |

The payload-free census had zero invalid JSON lines. The baseline dry run
`bun run beep harness-ledger prune-proposals --json` observed 0 current-regime
sessions, skipped 191 other/mixed sessions and 3144 unstamped sessions, read
3866 shards, counted 74 schema-undecodable rows, and wrote nothing.
Counts are a dated snapshot, not a promise about the growing store.

## fingerprint-v2

The session stamp uses the versioned `harness-hash-v2` preimage. Git checkouts
include indexed configuration and `.claude/settings.local.json`; non-git
fixtures use the bounded filesystem walk. Added roots: `.cursor`, `.agents`,
`.junie`, `.grok`; `.mcp.json` is session configuration. Ignored state is excluded.
An indexed Git parity fixture covers nested guidance, symlinked CLAUDE.md,
all existing config roots, and unrelated quoted names. Model/effort overrides are session attributes; model defaults in configuration
remain fingerprint inputs. Global projection is separately owned by F and is
not silently inferred from this repository snapshot.

## codex

Codex delegates to the shared writer and registers SessionStart. Synthetic
SessionStart wrote one stamped row. The installed CLI is 0.162.0; its binary
exposes no `PostToolUseFailure` name. Unmatched Pre events are therefore
`failed-or-interrupted`, not proven drops. Four isolated native Codex reproductions succeeded in running their tool, across
primary and linked fixtures with `danger-full-access` and `workspace-write`, but
emitted zero hook rows. The fixture explicitly enabled hooks and had project trust
and registrations. This does not establish a sandbox cause or repair native trust.
F owns native re-trust. Rollout filenames do not establish root/fork ancestry;
unknown roles are excluded until a tested native signal exists.

## cursor

Synthetic `sessionStart` produced one stamped row and `{}` protocol output.
Final-source isolated adapter samples: Claude 0.201 s at 22:18:24.259Z; Codex
0.263 s at 22:18:24.523Z; Cursor 0.298 s at 22:18:24.821Z, all on 2026-10-09.
Each sample exited zero, wrote one row and one stamp, emitted the expected
protocol output, and recorded no refusal. These are single synthetic samples,
not native-tool latency or a general performance claim. Cursor's 3 s cap is
retained; timeout refusals are recorded. Native Cursor emitted one SessionStart and one SessionEnd with a stamp. Its
Opus tool workflow was rejected by the existing subscription limit. Native hook
latency was not measured; the 0.298 s result is isolated adapter latency only.

## window

Windows are keyed by client plus session/transcript identity. Root qualification requires an observed `startup` at its earliest timestamp,
plus at least one verified-primary user turn and tool event; a later transcript under
the same parent contributes touches only with verified role metadata, without
becoming another qualifying root. Each activity row must itself be verified primary.
Mixed stamps and disarm intervals are excluded. Shared `.agents/skills`
candidates cannot write proposals until every loading client has a complete
window. `nonUseQualified` stays false without independent reconciliation.
No synthetic fixture contributes to the live 30-session window. Automatic
`--write` remains advisory even with a full window: aggregate ratios cannot
establish per-tool identity or surface collection. Manual ledger decisions remain
available. The unknown-restart counter includes roots without an observed fresh opening.
Unknown current collection capability is null; only a proven current
sentinel reports disabled. An unknown-start disarm interval excludes sessions
only through its known re-arm time.

## drops

Writer refusals have only UTC time, normalized client, and a closed reason.
Switch transitions are durable, payload-free rows beside the existing disarm
windows. Storage failure can still prevent the refusal itself from being
persisted; transcript reconciliation remains necessary.

## otel

Forwarder source/session rows retain optional session-time harness stamps
beside ingest-time `config_snapshot_id`. Unknown and mixed stamps stay absent. A reused transcript path with multiple
production session identities is ambiguous and receives no stamp; unsupported
OpenClaw sources never join the Codex hook namespace.
Codex sessions are not countable from native metrics. Cursor, Junie, and Grok
remain unsupported native-OTel transcript sources. Forwarder cadence is on demand.

Remote current queries are blocked: the existing SSH multiplex socket was
absent and a bounded BatchMode connection timed out. No credential was requested
or copied; no remote state was changed. Prometheus and recent Phoenix results
remain unknown for this lane. The legacy archive-key secret reference cannot
resolve through the agent account. One `op-doctor` diagnosis confirmed the
service-account route; the failing secret operation was stopped. F must provide
a current lane-scoped secret reference. No forwarder run or new timer was started;
restored export is not claimed.

## reconciliation

`bun run beep harness-ledger reconcile --state-dir <hook-events> --transcript-dir
<transcripts> --agent-kind <kind>` reads structural transcript metadata and emits
counts only. It includes nested children, resolves relative roots, and prevents
symlink-directory revisits. Unreadable entries are counted and skipped. Non-production hooks are excluded. Aggregate ratios
remain advisory and `qualifiedForNonUse` stays false; genuine non-use still needs
at least 0.98 collection coverage for the affected harness plus per-tool and
surface attribution. Codex exec wrappers are reported as failed-or-interrupted;
Cursor transcript format is unsupported by this reconciler.

## validation

All instrument fixtures use isolated `BEEP_AGENT_EVIDENCE_ROOT` directories.
They establish execution behavior and never fill the live window.

| Workflow | Result | Boundary | UTC date |
| --- | --- | --- | --- |
| Claude primary and linked checkout | Each: 1 fresh startup, 1 prompt, 2 Pre, 2 Post, 1 Stop; one stamp and one skill surface | Native Opus workflow; identical indexed fixture heads produced equal stamps | 2026-10-09T21:50:30.083Z primary; 21:50:36.282Z linked |
| Claude project Skill, MCP and Read | 1 Skill, 1 MCP tool, 1 Read; 3 surface rows; one start stamp | Existing hook pipeline; local constant-response MCP fixture | 2026-10-09 |
| Claude fan-out | 1 parent SessionStart; 2 Agent calls and 2 Bash posts; no extra qualifying roots | Both children pinned to Opus; parent payload namespace observed | 2026-10-09 |
| Codex primary/linked, two sandbox modes | 4 tool workflows succeeded; zero native hook rows | Native collection remains unknown; no home trust state changed | 2026-10-09 |
| Cursor native session | 1 stamped start and 1 end | Tool workflow rejected by subscription quota; no billing/model substitution | 2026-10-09 |
| Direct Claude/Codex/Cursor adapters | Each writes 1 stamp; schema and shell/TS parity fixtures | Synthetic; excluded from live observations | 2026-10-09 |
| Arm/disarm | 2 transitions, 1 disabled refusal, 1 closed gap, sentinel re-armed | Disposable evidence root | 2026-10-09 |
| Remote Prometheus/Phoenix | Unknown: bounded SSH connection timed out | No remote write; current metrics/page not verified | 2026-10-09 |

Interactive permission behavior and actual desktop/proxy attribution remain
unverified. F owns those home fields and native launcher verification.

The five coverage buckets are applied to the relevant collection surface; unknown
is retained rather than forced into a bucket:

| Client | Stamped | Unstamped by design | Unsupported | Not configured | Disabled | Current live qualification |
| --- | --- | --- | --- | --- | --- | --- |
| Claude | Isolated native workflows proven | None asserted | None asserted for hooks | Unknown globally | Not asserted | Incomplete; no non-use |
| Codex | Direct adapter proven | Native metrics cannot count sessions | None asserted for hook adapter | Native trust/config state unknown | Not asserted | Native hooks and root ancestry unqualified |
| Cursor | Native SessionStart proven | None asserted | Native OTel transcript source and reconciliation format | Tool coverage unknown | Not asserted | Tool workflow unqualified |
| Junie | None asserted | None asserted | Hook/forwarder client unsupported | No supported adapter | Not asserted | Unsupported; no non-use |
| Grok | None asserted | None asserted | Hook/forwarder client unsupported | No supported adapter | Not asserted | Unsupported; no non-use |

The configuration version is `harness-hash-v2`; actual salts, session identities
and fingerprint values are private. Partial or failed collection retains every
candidate on demand. No capability is classified genuinely unused.

## proof

Known same-client or unknown-client event-loss refusals conservatively exclude overlapping sessions through `sessionsSkippedRefused`. Forwarder stamps are withheld for overlapping refusal/disarm gaps and malformed gap evidence. Stamp-only failures remain diagnostics; a later event-loss refusal affects an open session until its durable SessionEnd. Refusal uncertainty covers the entire recorded second. A refusal can coexist a durable row; the exclusion records collection uncertainty. Claude path conventions infer ancestry only for Claude; Codex/Cursor filename spelling alone cannot qualify a root.

Publication cheap gates rejected introduced test-lint and Fallow findings before any push. Source repairs consolidate failure handling, count an aliased unreadable entry once, scope resource-bearing tests, and simplify writer setup. No generated baseline was changed.

Final package/parity results and final-head live census are recorded below when
the admitted jobs complete. Coverage was read from the existing regression
baseline for 10 touched source files; this is a baseline read, not current
coverage measurement. No baseline row was changed.

Independent reviews use separate read-only sessions: Claude Opus 5.5 medium and
Codex GPT-6.1-Sol medium. Earlier actionable findings are retained and repaired,
including lower-severity disarm, refusal, role, join and traversal defects.

## recovery

Revert the H3 PR. Additive refusal/transition/stamp fields and historical v1 rows
remain readable; v1 observations stay outside the v2 regime. F rolls home changes
back through its backups. This lane made no home configuration change, scheduled
no timer and performed no remote mutation.

Graft queries saved approximately 217,311 source tokens across this lane's work.

Current-source qualification repair (source and tests reviewed at `122f9cb540`): corrupt hook evidence excludes non-use windows without erasing positive touches; shared capability counts require 30 sessions per loading harness independent of display window; canonical aliases retain all observed path hooks and conflicting identities remain unmatched. Forwarder stamps require valid ordered transcript bounds and durable terminal hooks to bound event-loss refusals. Snapshot budgets reserve root guidance/MCP files and exclude nested checkout paths before stat. Independent review and final admitted package proof remain pending; these statements are implementation evidence, not proof of a complete live window.

The admitted intermediate census counted Claude 574,951 rows, 1,858 sessions and 230 startup stamps; Codex 447,640 rows, 1,559 sessions and no stamps; Cursor 2,411 rows and 36 sessions without startup stamps in the shared ledger. JSON syntax was valid, but 74 older rows did not satisfy the current row schema. Current conservative scans therefore report zero qualifying sessions for each client, incomplete shared coverage, and no writes. These are intermediate counts; final-head scans follow the terminal proof. Malformed, future-dated and invalid-calendar sentinels were armed in disposable fixtures: all three produced valid windows with unknown starts. No shared ledger was rewritten.

The full intermediate CLI package audit passed 290 test files and failed 18 cases in the forwarder command fixture because its helper supplied incomplete Git metadata. The fixture now initializes and indexes a real repository; no production boundary was relaxed. The final admitted batch will rerun both complete package audits and parity commands. Git boundary regressions additionally cover a broken nested metadata directory under a valid parent, a physical directory ending in a newline, and an external scan alias. Live future sentinel timestamps and invalid UTC calendar dates fail closed. Final-source native Claude primary/linked workflows again produced seven rows each, matching fresh stamps and no refusals, at the UTC times in the validation table.

Independent final repair confirmations on `122f9cb540015311dcaf9650762db1ec93e630db` reported zero actionable findings from separate Claude Opus 5.5 medium and Codex GPT-6.1-Sol medium sessions. Earlier findings remain in the repair history. The preceding batch passed test-tsgo, Fallow audit/health (zero introduced findings), docgen local, jsdoc-ratchet and CI knowledge refs (zero live gated observations); its package failures were repaired and require the queued full rerun. The rerun uses the original user identity in a capability-free private mount namespace with an explicit device bind and lane-owned backing for TMPDIR because unresolved ancestor Git metadata predates this lane outside its ownership. Startup probes verified Bun/Git execution, permission denial for unreadable files, and a clean non-Git temporary ancestry. No host metadata or mounts were changed. Current program main `cb64e0484f` was merged during the batch, before the full CLI gate began; packet conflicts preserve both lanes' records. H3 source and tests are byte-identical across this merge. Earlier package/focused results remain applicable to H3; impacted parity scans require a post-merge refresh.

## resume-2026-10-14

The lane merged current `origin/main` at integration commit `9a19889a5a`;
packet records preserve both lanes' evidence. Full qualification is being
refreshed before one publication wave. The previous independent confirmations
remain attached to their recorded source head, not silently relabelled current.

The payload-free census on October 14 found zero invalid JSON lines:

| Client | Rows | Sessions | Starts | Stamped sessions | Surface rows | Distinct stamps |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Claude | 684521 | 2090 | 458 | 458 | 2653 | 193 |
| Codex | 569917 | 2417 | 3 | 0 | 0 | 0 |
| Cursor | 2868 | 286 | 0 | 0 | 0 | 0 |

These are growing-store snapshots. Per-client dry runs used
`bun run beep harness-ledger prune-proposals --agent-kind <kind> --json`
and wrote nothing. Each returned zero qualifying sessions, an incomplete
30-session and shared window, and `nonUseQualified: false`. All reported
74 schema-undecodable historical rows. Claude skipped 458 other-regime and
67 mixed-fingerprint sessions; Codex and Cursor remained unstamped.
Current collection capability stayed unknown. Missing telemetry does not prove
non-use; all candidates remain on demand.

Actual lane configuration exposed a performance defect: normal-cap direct
adapter samples wrote one startup row and one `stamp-failed` refusal per client.
An extended-cap diagnostic measured 5.011 seconds to stamp 528 selected paths.
Batching indexed metadata/leaf inspection retains selection and fail-closed
semantics without a cache or longer native deadline. Normal-cap samples after
batching wrote one stamp each, zero refusals, and exited zero: Claude 0.886 s
at 19:34:51.055Z; Codex 0.884 s at 19:34:51.939Z; Cursor 0.850 s at
19:34:52.789Z. Samples are synthetic, isolated from the shared ledger, and
never contribute to qualification. Shell/TypeScript parity and independent
review must pass before publication.

The full ai-metrics package gate passed audit (48.3 s) and docgen (12.3 s)
in the documented private temp namespace. Its earlier unisolated 19 fixture
failures were environment-only and acknowledged. The unisolated CLI audit
exited 143; its isolated replacement remains the authoritative full rerun.
`test-tsgo` passed against the integrated source. Final results follow below.

Remote validation remains unknown: a new bounded 20-second BatchMode SSH
probe timed out on October 14. Prometheus config-snapshot/desktop attribution
and a recent Phoenix page could not be read. No remote state, home fields,
installed timer, salt namespace or live evidence was changed. F owns native
trust, launcher ancestry, global projection, OTel fields and the usable archive
secret reference; the orchestrator owns any scheduling decision.

The final batching repair is committed at `8af3d54111`. Separate pinned
Opus 5.5 medium review found and closed diagnostic-shaped filename handling,
metadata completeness/status validation, remaining per-path forks, deleted
unusual names and regression accuracy. Its final confirmation reports zero
actionable findings at every severity. Tests cover 150 selected batch files,
a missing indexed path after more than 4 KB of output, `stat: `-prefixed guidance,
EACCES after successful metadata, dangling-link parity, loop refusal and deleted
non-ASCII paths. No baseline or deadline was relaxed.

Normal-cap full-checkout samples after final source repair were Claude 0.545 s
at 19:41:59.261Z, Codex 0.499 s at 19:41:59.760Z and Cursor 0.530 s at
19:42:00.290Z. Each exited zero, wrote one stamped row and zero refusals.
The actual-checkout TypeScript oracle selected 525 files and confirmed all
three shell stamps match. The 528-path Git list includes paths excluded by
snapshot rules; selected-file and raw-index counts are different measures.
These samples precede the deleted-unusual-path compatibility repair, which
leaves the actual checkout's selected inputs and hot path unchanged.

The October 14 isolated switch workflow returned zero for disarm, refused
event and arm; it persisted two transitions, one disabled refusal and one
closed disarm window, and left the disposable sentinel armed. Earlier native
workflow receipts keep their October 9 provenance; desktop/proxy permissions
and native Codex/Cursor tool qualification remain unproved.

Refreshed parity passed test-tsgo, local docgen, JSDoc ratchet (zero introduced
findings), CI knowledge refs (zero live gated observations), Fallow audit and
health (zero introduced findings), and retired Effect paths. The scoped baseline
read covered 10 touched source files without editing any row. Current scoped
coverage and the final package rerun follow below when terminal.

Final repaired ai-metrics `package-verify` passed audit (26.1 s) and docgen
(6.4 s) after test cleanup commit `2cdc5ce44d`. The earlier finalizer compiler
failure was introduced, fixed, and acknowledged with that commit; it is not
attributed to main. Scoped Node/V8 coverage passed 231 metrics tests and 76
CLI tests across eight files; test-tsgo passed again. The focused coverage
summaries do not establish the full package floors: snapshot, hook and prune
function/branch coverage plus EvalRecord still have lower focused measurements
than the committed full-suite rows. No row was lowered, and no full Coverage
Regression pass is claimed. The inherited program-wide hosted Coverage red
remains owned by the orchestrator, separately from this scoped limitation.

A second required main merge at `8cd9d1329b` integrated current main
`83dde3b1f3`, including #1571's AgentMessage surface and #1744's H2 records.
H3 source/tests are unchanged by that merge. Packet conflicts preserve H3
status and the updated H2 row. The full CLI audit began before that merge;
its source-head boundary is retained rather than labelled an exact integrated
package proof. A post-merge quick package gate and all required parity commands
are being refreshed; the final handoff gives their terminal states.

The full private-namespace CLI audit terminated after 1273.19 s: 310 files and
6340 tests passed, with three failures in unchanged `graft-hooks.test.ts` and
`effect-fn.test.ts`. The two Graft failures were native root ownership projected
as UID 65534 in a private user namespace; the trust guard correctly refuses it.
The Effect law CLI fixture could not resolve newly merged `@beep/t3-code`.
All three were acknowledged as environment boundaries, not repaired in source.
The current dependency closure passed 44 build tasks (42 cached); all ten tests
in the two failing files then passed with native `/tmp`, at 19:59:21Z. A new full
native CLI package verification follows that corrected preflight. Temp fixtures
are small test repositories, never full repo clones; home metadata is untouched.

Current installed Codex is 0.162.1 (`hooks` feature enabled). Five disposable
native executions on October 14 completed their read-only command successfully
but emitted zero hook rows: primary full-access at 20:06:11.437Z, primary
workspace-write at 20:06:19.695Z, linked full-access at 20:06:34.033Z, linked
workspace-write at 20:06:44.331Z, and an invocation-only source-vetted hook-trust
bypass at 20:06:55.377Z. Each selected GPT-6.1-Sol medium, used ephemeral
sessions and fixture registrations with no persisted trust entry, and kept the
existing authentication route. No home config was edited. User config was
ignored for isolation, so these runs do not establish collection under the
operator's ordinary launch configuration. The bypass also returning zero
prevents assigning the cause solely to persisted hook trust. Native collection
remains unknown; this is not proof of disabled collection or unused capability.
Direct adapters remain independently stamped and schema-qualified.

The integrated cheap-gates verification passed all 16 lanes at 20:06:59Z,
including schema-first, Effect/Vitest, retired paths, changeset status, cache
policy, goals, JSDoc and Fallow. Both edited packages are private after D's
merged policy; no publish-enabled patch changeset was required by that gate.

Current read-only reconciliation completed for all supported hook client kinds:

| Client / transcript scope | Files | Transcript tool events | Matched terminal hooks | Sessions without hooks | Ratio | Result / UTC |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Claude / lane archive | 18 | 0 | 0 | 0 | Not available | Advisory, non-use false / 20:11:18Z |
| Codex / local sessions archive | 346 | 53832 | 2488 | 271 | 0.046218 | Failed-or-interrupted exec wrappers; non-use false / 20:11:46Z |
| Cursor / projects archive | 81 | 3539 | 0 | 48 | 0 | Unsupported transcript format; non-use false / 20:12:04Z |

All scans counted 74 schema-undecodable hook rows and wrote no evidence. The
archive scopes are explicitly different, and the Codex archive is not filtered
to this checkout/current regime. Those aggregate ratios are not comparable or
collection-loss estimates. The lane Claude archive has no countable tool
observations, not evidence of non-use. No ratio meets a qualified current-window
and per-tool/surface attribution gate. Unknown collection stays unknown.
