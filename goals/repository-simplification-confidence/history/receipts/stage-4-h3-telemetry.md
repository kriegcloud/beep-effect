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

The native full CLI command passed build/compile and all 319 test files,
6432 tests, then exited 1 on three formatting-only artifacts introduced by the
first merge's older Biome hook. Formatting repair `7aa6085f35` restored all
three files byte-for-byte to integrated main; no test behavior changed. The
original full-command exit is retained. Qualification composes that completed
runtime proof with fresh package lint/check and full docgen after the repair.

Final integration `7d651c59a2` merged main `061d5a40e4`, including the security
and Junie repairs. H3 telemetry source/tests stayed unchanged. Current dependency
closure passed, `package-verify @beep/repo-cli --quick` passed lint (4.8 s) and
check (6.0 s), and full package docgen typechecked 2898 examples and passed.
Final integrated test-tsgo and local docgen also passed. The full runtime proof
keeps its prior source-head boundary; hosted CI is the proof for the published
integrated tip. The Decision Log records why runtime tests were retained after
formatting-only repair instead of replayed.

After the preceding main integration, actual-checkout direct adapter samples
were Claude 0.542 s at 20:13:45.527Z, Codex 0.518 s at 20:13:46.045Z, Cursor
0.499 s at 20:13:46.544Z. Each exited zero, wrote one stamped row and no refusal;
all three stamps matched the TypeScript oracle. Later main's tracked Claude
settings changes reset the regime. Final-head scans and adapter samples below
bind qualification to that configuration; none fill a live session window.

### final integration evidence

All required integrated parity commands passed on the `7d651c59a2` source:

| Command | Result | UTC completion |
| --- | --- | --- |
| `beep quality test-tsgo` | Pass | 20:22:48Z |
| `docgen:local --base origin/main` | Pass | 20:23:29Z |
| `beep ci lane jsdoc-ratchet` | Pass, zero introduced findings | 20:29:33Z |
| `CI=true beep knowledge refs --check` | Pass, zero live gated observations | 20:30:02Z |
| `beep quality fallow audit` | Pass, zero introduced findings | 20:30:12Z |
| `beep quality fallow health` | Pass, zero introduced findings | 20:30:17Z |
| `beep laws retired-effect-paths` | Pass | 20:30:20Z |
| Scoped Node/V8 coverage | Pass, 307 tests across eight files; focused measurement, not full ratchet | 19:48:35Z |
| Scoped baseline read | Ten touched file rows, no row edited | October 14 |

Package qualification is composed with its command provenance retained:
metrics full `package-verify` passed. CLI native build/compile and all 6432
tests passed before the formatter failure; the formatting-only repair is
followed by passing integrated quick lint/check and full package docgen.
The full command's historical exit 1 is not relabelled exit 0.

Final current-checkout adapter samples (version `harness-hash-v2`) all exit zero,
write one stamp and no refusal, and match the actual TypeScript snapshot:
Claude 0.566 s at 20:26:34.352Z; Codex 0.490 s at 20:26:34.842Z; Cursor
0.505 s at 20:26:35.347Z. All three stay below the native three-second cap.
They use disposable evidence roots and contribute no live observations.

The final live census at 20:26:48.926Z counted zero invalid JSON lines:

| Client | Rows | Sessions | Starts / stamped sessions | Surface rows | Distinct stamps |
| --- | ---: | ---: | ---: | ---: | ---: |
| Claude | 687147 | 2094 | 462 / 462 | 2731 | 197 |
| Codex | 573797 | 2431 | 3 / 0 | 0 | 0 |
| Cursor | 2885 | 288 | 0 / 0 | 0 | 0 |

Final per-client `prune-proposals --agent-kind <kind> --json` dry runs all
return zero qualifying sessions, incomplete 30-session and shared windows,
`nonUseQualified: false`, 48 candidates, no proposals and `written: false`.
Each reads 5389 shards and counts 74 schema-undecodable historical rows.
Claude additionally counts 67 mixed-fingerprint sessions and six below its
activity floor. Current collection capability remains unknown.

| Client | Stamped | Unstamped by design | Unsupported | Not configured | Disabled | Fingerprint / command / result / UTC |
| --- | --- | --- | --- | --- | --- | --- |
| Claude | Current direct adapter; earlier native workflows | None asserted | None asserted for hooks | Global state unknown | Proven only in disposable switch test | v2 / Claude prune dry run / 0 of 30, no write / 20:27:04.186Z |
| Codex | Current direct adapter | Native metrics cannot count sessions | None asserted for adapter | Ordinary native launch/trust state unknown | Not asserted | v2 / Codex prune dry run / 0 of 30, no write / 20:27:17.058Z |
| Cursor | Current direct adapter; earlier native start | None asserted | Native OTel source and reconciliation format | Native tool coverage unknown | Not asserted | v2 / Cursor prune dry run / 0 of 30, no write / 20:27:29.927Z |
| Junie | None asserted | None asserted | Hook/forwarder client | No supported adapter | Not asserted | No supported fingerprint collector / unsupported / October 14 |
| Grok | None asserted | None asserted | Hook/forwarder client | No supported adapter | Not asserted | No supported fingerprint collector / unsupported / October 14 |

No client is classified genuinely unused. F retains every affected capability
on demand, owns home trust/namespace/global projection/OTel edits and dispositions,
and receives these limits before its final panel. A's hook retirement is already
integrated, so H3 lands after it. The orchestrator owns the S11 merge gate and
post-merge retirement. Remote Prometheus/Phoenix and restored forwarder export
remain unknown; no scheduling or home changes were performed by this lane.

The first normal resumed publication returned exit 1 before any push despite green cheap gates. Yeet's clean-existing-commit intent captured the old remote lane-to-HEAD filename diff and exceeded its 512 KiB bound. The subsequent normal staged publication includes this actual friction receipt; its existing staged-path route preserves the complete preflight and push gates. No source/tooling guard or Git ref is changed to bypass the bound.

## post-publication opaque integration

The first wave published `0499a87c3999f85bb32e02d1bdd5043f24c58a9a`
through normal Yeet, including green cheap gates and the clean-HEAD frozen
install preflight. It became ready at 20:45:26Z. Its Security job failed only
on hosted ruleset drift: live requires `beep-reviewer`, declared contexts omit
it. H3 changes no ruleset/CI declaration; the row is attributed to the
orchestrator under S11. Vercel's two build-rate-limit failures are environment
rows exempt under the repository merge policy.

Main #1758 then conflicted in three telemetry schemas. Merge `1c5270d37d`
retains main's branded Opaque representation and H3's Natural budgets,
UTC/calendar/order checks, startup/role metadata, pulse invariants and counters.
Follow-up `0be6f4feff` restores the error brand and converts four H3-only private
reconciliation records. The separate pinned Opus confirmation reports zero
remaining actionable findings; codec statics and `.make` callers stay intact.
The disarm-order check now also carries its title and description.

Post-merge proof:

| Check | Result / boundary |
| --- | --- |
| Metrics full package verification | Pass, audit 25.0 s and docgen 6.6 s, 21:23:11Z |
| Both package quick checks | Pass after the brand fixes |
| CLI prune/reconciliation/forwarder command regressions | 76 pass in two files, 21:23:25Z |
| test-tsgo | Pass after the brand fixes |
| Local docgen | Pass after the brand fixes |
| Knowledge refs | Pass, zero live gated observations |
| Fallow audit/health and retired paths | Pass |
| JSDoc ratchet | Inherited +2 root-import findings: mcp-kit `src/TierGate.ts:TierGateVerdict` and uspto-mcp `src/UsptoDocumentTiers.ts:MintFetchableHandle`; H3 introduces none |

The first post-brand runtime rerun failed because unrelated unresolved
`/tmp/.git` appeared while other jobs were active. Both compile/lint checks
passed; the private-temp rerun above passed all 76 cases. That unrelated
metadata is retained and production checks remain strict. The previous
6432-test native runtime result keeps its original source head; it is not
relabeled a full post-migration runtime sweep. This wave's fresh package,
codec/regression and compile/docgen evidence covers the schema resolution.

The second publication is one complete base-conflict wave, not a per-file push.
S11 permits the inherited JSDoc and hosted settings reds after attribution;
the orchestrator owns the final gate and any consolidated main fix.

Main episode-14 fix #1773 merged into the lane at `9a9582fb91`; none of the H3 telemetry source/tests changed across that integration. The subsequent source/inventory comparison shows the two inherited mcp-kit/uspto-mcp JSDoc examples remain; the earlier interpretation of the fix title was incorrect. The latest parity refresh is running against that integrated source while the complete conflict wave publishes. Earlier red and green results retain their original provenance; publication resets the review window.

### final conflict-wave dispatch

The complete conflict wave published `826c032ed6c67e2f479fb4ee33734a317a7f2e5a`
through Yeet at 21:34:38Z, with green cheap gates and clean-HEAD install preflight.
Fresh complete thread read returned zero threads and no pagination. The PR
remains ready and structurally mergeable; its latest push restarts the window.

Final parity completed with local docgen, knowledge refs, Fallow audit/health
and retired paths passing. The remaining failures are inherited and explicitly
retained: test-tsgo reports `AgentMessage.runtime.test.ts:322` TS377032, with the
file byte-identical to main; JSDoc reports the same two mcp-kit/uspto-mcp root
imports, with both files byte-identical to main. H3 introduces neither finding.
The exact-head Security job `116117679019` fails hosted ruleset drift for
`beep-reviewer`, and Vercel deployments fail only their build rate limit. The
orchestrator owns these S11 attributions and its consolidated fix.

The final delivery keeps all earlier source boundaries. Metrics full audit and
docgen pass after Opaque integration; both package quick checks and the 76-case
CLI codec/reconciliation regressions pass. Earlier native runtime proof records
6432 passing tests before the formatting-only failure. No full post-Opaque CLI
runtime or full coverage-ratchet pass is claimed. No client has a qualified
non-use window, and F retains the affected capabilities on demand.

## Review wave round 1 — 2026-10-14

Read review comments 4276613162, 4276613174 and 4276613187 in full before editing. The driver requests all three in one push. Merge current main once after the main-merge gate, preserving prior handoff metadata. The post-1758 codemod write/check reports 62 declarations already branded and zero changed files.

Hook ingestion now retains all decodable records across corrupt or unreadable shards. Run results and CLI status JSON expose hookCollectionComplete, failedHookShards and hookRejectedRecords. Existing transcript/session identity, first opening, mixed fingerprint and known disarm/refusal checks still apply. Gap refusals decode per record: rejected records are counted, valid intersecting gaps still suppress stamps, and unrelated valid stamps survive. Unreadable gap evidence remains fail-closed and is explicitly reported by stampGapCollectionComplete. Historical status payloads decode with unverified collection flags.

Prune reports expose stamped for qualifying per-client observations and unsupported for Junie/Grok. A missing supported-client observation remains unknown, since absence cannot establish not-configured or unstamped-by-design. This does not change the non-use qualification gate. Regression fixtures exercise corrupt and unreadable shards, mixed invalid/valid intersecting refusals, a rejected record beside a valid non-intersecting refusal, status JSON round-trip and both unsupported clients.

The first full package attempts caught the introduced v4 Array.filterMap Result/Option mismatch; corrected against the local Effect reference. The first corrected metrics run used a temp root inside the checkout and hit nested-repository exclusion assertions; the corrected run with ordinary external temp backing passed the full metrics audit and docgen (26.6 s / 4.9 s). Original failures remain in the private command logs; no baseline, production boundary or admission gate was weakened. Remaining proof and publication results are recorded in the dated handoff.

Review-wave scoped coverage read (67 metrics tests and 76 CLI tests passed; source commit `5fb9658540`, unchanged by main integration):

| Touched source | Lines | Statements | Branches | Functions |
| --- | ---: | ---: | ---: | ---: |
| ai-metrics `forwarder.ts` | 90.81% | 90.25% | 79.12% | 79.64% |
| CLI `AIMetrics/internal/Programs.ts` | 70.90% | 70.61% | 57.07% | 74.26% |
| CLI `HarnessLedger.schemas.ts` | 93.93% | 86.84% | 100% | 66.66% |
| CLI `PruneWindow.ts` | 96.02% | 94.37% | 84.90% | 90.22% |

Read all four matching rows in the committed coverage regression baseline; did not rewrite them. The PruneWindow scoped line/statement/function percentages equal the prior lane scoped receipt; branch coverage rises from 84.71% to 84.90%. The older repository row is higher for line/statement/function coverage, so this is a scoped read, not a full coverage-ratchet pass.

After merging main `f02768114e`, test-tsgo reports only inherited AgentMessage.runtime.test.ts:322 TS377032, with identical source on origin/main. Local docgen passes. The integrated codemod check reports zero new sites, with 88 Opaque, five TaggedError and two Class declarations already branded.

The Fallow follow-up commit `e6c3143251` simplifies the shard reader with Result.match and HashSet shard deduplication and separates fixture diagnostics. Fresh full metrics audit/docgen passes (23.3 s / 5.4 s); 47 compile tasks and 67 metrics scoped tests pass. Fallow audit/health both return zero findings. Fresh forwarder coverage is 90.75% lines, 90.16% statements, 78.31% branches and 80% functions, above its matching baseline row. JSDoc ratchet passes with zero increases and zero non-generated legacy findings; knowledge references and retired Effect paths pass. The former JSDoc root-import red and main Security repair are now integrated; the AgentMessage test-tsgo diagnostic remains inherited.

The first long CLI audit passed 6,444 tests but spanned a main merge; three newly landed governance/retirement files saw old cached exports or ledger semantics. Their current sources match main, and all 70 tests pass in a fresh same-runtime process. A full frozen-source retry follows main `d0d67769aa`; do not merge during that runner. Parallel local docgen exit 137 is retained and retried with serialized package concurrency. The dated handoff records final outcomes and post-push REST reply ids.

### Review round 2 — retained stamps disclose incomplete collection

The derived transcript schema now defaults collection completeness to false. Session and source-file rows store the marker; session and turn OTLP spans expose `ai_metrics.session_stamp_collection_complete`. The mixed-shard/refusal regression matrix verifies that good stamps survive, every partial collection is marked false, and fully collected retained stamps are true. Existing records remain unverified through a default-false additive DuckDB migration. The repaired full metrics package audit and docgen pass.

Reconciliation and pruning convert invalid agent kinds to typed input errors; reconciliation reports tagged failures through the standard CLI stderr/reported-exit path. Bare help lists reconciliation's required directories, client selection and the pruning client selector.

Historical round-2 qualification after main #1796 failed because this lane retained installed Effect 4.0.2 against a lockfile and source expecting 4.0.4. The earlier attribution to main was incorrect: 4.0.4 supplies the callable UUID API. Matching source files did not establish installed dependency parity. The driver corrected the install; no shared Crypto repair is required. The codemod/check passes with no new sites; fixup changes no files. `lint schema-first` passes. Metrics' own 425 tests and lint pass; focused CLI 76 tests pass with independent temp backing. The earlier complete metrics package audit/docgen pass is retained as pre-merge proof, not represented as integrated-head success.

| Scoped coverage file | Lines | Statements | Branches | Functions |
| --- | ---: | ---: | ---: | ---: |
| `packages/tooling/library/ai-metrics/src/forwarder.ts` | 90.78 | 90.19 | 79.06 | 80.17 |
| `packages/tooling/tool/cli/src/commands/AIMetrics/internal/Programs.ts` | 70.9 | 70.61 | 57.07 | 74.26 |
| `packages/tooling/tool/cli/src/commands/HarnessLedger/HarnessLedger.schemas.ts` | 93.93 | 86.84 | 100 | 66.66 |
| `packages/tooling/tool/cli/src/commands/HarnessLedger/internal/PruneWindow.ts` | 96.02 | 94.37 | 84.9 | 90.22 |
| `packages/tooling/library/ai-metrics/src/derived-storage.ts` | 94.15 | 94.3 | 100 | 80.85 |
| `packages/tooling/library/ai-metrics/src/otlp.ts` | 93.61 | 94.03 | 77.27 | 87.69 |
| `packages/tooling/tool/cli/src/commands/HarnessLedger/HarnessLedger.command.ts` | 25.39 | 24.8 | 5.71 | 13.46 |

Seven matching committed baseline rows were read, never rewritten. The three round-2 files meet their rows. PruneWindow keeps the round-1 scoped values below the historical line/statement/function floors; this is a scoped read, not a complete ratchet pass.

The integrated round-2 parity sequence terminates: JSDoc ratchet, knowledge refs, Fallow audit/health and retired Effect paths pass. The earlier test-tsgo and local docgen failures occurred with stale installed dependencies, as corrected above; metrics and CLI package docgen themselves pass. All owned local test/parity runners have terminated.


### Round-2 installed integration — 2026-10-15

The driver corrected the stale-install diagnosis. Main `b8fe0030e4` is merged
in `4de40d71f9`; `bun install` ran after the merge and the installed Effect
package reports 4.0.4. No Crypto source repair was needed. The one merge
conflict was the observability totals: the owner command regenerated 5,438
spans, 4,920 conforming and 518 non-conforming. The schema codemod check
reports zero new sites. No baseline was rewritten.

The full metrics package verification passes audit (37.0 s) and docgen
(8.7 s). The CLI dependency build passes 44 tasks. Fresh Node/V8 coverage
passes 70 metrics tests and 76 CLI tests; all seven scoped file percentages
match the preceding round-2 table. This remains a scoped coverage read,
not a full coverage-ratchet pass. Fresh CLI smoke checks return the standard
stderr and exit 1 for missing transcript roots and invalid clients in both
reconciliation and pruning. Bare help advertises both entry points.

Fresh per-client pruning dry runs, at 01:39–01:40 UTC, all report 0 of 30
qualifying sessions, false non-use qualification and no write. Counts only:
Claude has 466 out-of-regime, 1,624 unstamped and 67 mixed observations;
Codex has 2,480 unstamped; Cursor has 298 unstamped. No client qualifies as
genuinely unused. Full CLI package and parity results follow in the current
handoff after terminal verification.

Full `package-verify @beep/repo-cli` passes audit (1,294.0 s) and docgen
(43.0 s). Fresh scoped CLI regressions pass 76 tests. Repository
`quality test-tsgo` passes on the installed integrated source; the previously
reported Crypto and AgentMessage failures do not appear in this run.

The installed integrated parity sequence is entirely green: test-tsgo
(01:58:00 UTC), local docgen against origin/main (01:58:53 UTC), JSDoc ratchet
(02:05:57 UTC), CI-mode knowledge refs (02:06:31 UTC), Fallow audit
(02:06:50 UTC), Fallow health (02:06:56 UTC), and retired Effect paths
(02:06:59 UTC). Both Fallow lanes and the retired-paths law report zero
findings. All owned local verification runners terminated. The prior stale
Crypto diagnosis is superseded; no inherited test-tsgo/JSDoc red appears.

After the pre-push catalog-only main advance, merged main a4b3aa1fcc and reinstalled. Owner regeneration yields a tree-identical integration in 2587e2445f. The repeated test-tsgo, local docgen, JSDoc ratchet, CI knowledge refs, Fallow audit/health and retired-paths checks all pass, ending at 02:10:06 UTC.
