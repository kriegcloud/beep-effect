# Friction receipts

| Date | Task/evidence | Prevention |
| --- | --- | --- |
| 2026-10-14 | Kickoff names 150 check/134 test configs; live discovery finds 152/136. | Discover project counts at runtime and record the list. |
| 2026-10-14 | t3code reference still documents compiler/rule coupling; no separate diagnostics command found. | Bind design precedent to exact source revision and command. |
| 2026-10-14 | `turbo run build --filter='*^...'` reports zero tasks; `beep:build` is not a Turbo task. Full `turbo run build` completes 153 tasks in 74.093s. | Use the public `build` task and concrete package filters; avoid wildcard dependency exclusion. |
| 2026-10-14 | Spike waits for all five shared beep-heavy slots; admission remains in place. | Include queue time separately from compiler wall time. |
| 2026-10-14 | Root `bun run check` fails in `quality:test-tsgo` at `AgentMessage.runtime.test.ts:322` with TS377032; preserved 0.51.1 reproduces it. | Repair the inherited test in its owning lane; distinguish the successful tsc-rs phase from Effect-tool extras. |
| 2026-10-14 | Uniform root `--lspconfig` override re-enables effect-drizzle's documented missedPipeableOpportunity exception (12 reports). Profile inventory also finds one no-plugin mock-monorepo test config. | Preserve project-specific rule exceptions during the spike; remeasure those projects with their effective profile, and distinguish fixtures from workspace targets. |
| 2026-10-14 | Manifest-based target discovery yields 152 check/135 test workspace projects; raw rg also finds an empty mock-monorepo test fixture, which diagnostics reports as `No files to check`. | Discover target configs from declared workspace roots, not recursive filename matches. Retain the fixture attempt as an explicit non-workspace exclusion. |
| 2026-10-14 | tsgo-rules finds oip-web/todox duplicate profiles outside the check/test extends chains; config-sync does not rewrite them. Updated their rule maps and exit policy explicitly. | Inventory every local plugin declaration as well as the selected project chains when changing the root profile. |
| 2026-10-14 | tsgo-rules also flags AgentMessage.store.ts:200; the directive exists unchanged at HEAD. | Its owning AgentMessage lane must remove or reconcile the inherited directive; do not broaden H2's allowlist. |
| 2026-10-14 | Bounded doctest verification classifies the CLI registration example as `marked-impure: child-process (Command.make)`, although Command is imported from effect/cli. | Resolve imported Command identities in the purity analyzer. Keep this example compile-only under the current conservative rule, with its full code retained. |
| 2026-10-14 | The additional CLI test/tsconfig.json probe finds two Array.join and one Object.values sites not covered by the original check/test filename spike, plus the known strictEffectProvide red. | Include all four direct test/tsconfig.json projects in future spikes; repaired the three new-rule sites before full Check reaches that project. |
| 2026-10-14 | Catalog regression initially expected Error.name to equal the tag. Effect Schema source assigns the schema identifier instead; the assertion now compares the public class.identifier. | Validate Error-name behavior from installed declarations/reference source before choosing assertions. |
| 2026-10-14 | Runtime forces inbox acknowledgement despite the lane's no-Yeet envelope; observed-only rejects local-shard package proof rows and no fix SHA exists in an uncommitted lane. | Offer a local proof-backed acknowledgement distinct from commit-backed fixes. Scoped one-hour receipts are backed by fresh semantica/drizzle successes; the CLI archive/live mismatch is explicitly attributed. |
| 2026-10-14 | CLI full audit compares an archive of HEAD with live filesystem packets; its only remaining mismatch is the untracked bootstrapped H2 packet. | Run that comparison after the orchestrator commits the packet, or make the fixture choose one consistent inventory surface. |
| 2026-10-14 | The semantica missing-key assertion needs an explicit string-key domain for R.has; the error-equivalence fixture reaches private SqlNameError through reflection and retained the old payload key. | Validate helper typing for deliberate missing keys and search reflective fixture payloads when renaming error fields. Both corrected package proofs now pass. |
| 2026-10-14 | Replacing native fixture Array.join with A.join changes the enclosing BunCrypto it.layer v2 occurrence. The same EV014 resource candidate is treated as new despite unchanged resource behavior. | Use a call-site identity that excludes unrelated nested fixture construction; reviewed the exact old/new occurrence and refreshed through the owned inventory writer without changing statuses. |
| 2026-10-14 | Full effect-vitest inventory writer also re-keyed untouched files and removed an unrelated orphan. | Add a reviewed-file selector to the writer. Retained only writer-generated locator updates in four H2-owned files, asserting no semantic/status/severity or row-count changes. |
| 2026-10-14 | Session ledger note exits 1 without an explanatory diagnostic. | Preserve the reason when session-note writes fail; H2 uses the requested cache report and packet as the durable handoff. |

## 2026-10-14 performance wave: shared scope filtering

The first six affected-selection cases exposed that coverageDependentOwners
filters its graph result to measurable coverage owners, excluding a lab consumer.
Evidence: perf-selection-tests.log in ~/.cache/beep/orchestrator/briefs/ts7-exit/lanes/h2-logs
(9 pass, 2 failed; missing lab). Prevention: expose the existing inverted graph
walk separately from coverage policy. The implementation now has an unfiltered
wrapper; coverage defaults retain the original behavior.

The workstation's absolute /proc/meminfo use already exceeds the requested
32-GiB-runner 60% budget before diagnostics start. Keep host baseline/delta and
per-tree RSS separately; an isolated hosted run is the final capacity proof.

The first hosted wiring test pass found an index-dependent Docgen matrix assertion
and missing CI descriptor for the new Effect Diagnostics context (295 pass,
2 failed). Resolve the matrix row by id; register the independent context in the
canonical descriptor and dispatcher, rather than adding an orchestration exemption.

The requested Fallow new-only audit initially reports runEffectDiagnostics
cognitive complexity 10 (threshold 8). Separate the per-project subprocess,
coverage validation and rendering from project selection/aggregation, and flatten
the diagnostic census traversal. No rule suppression or threshold change.

Catalog --check found stale generated inventories: two new H2 span names plus
inherited AgentMessage/Knowledge/Session/Worktree rows and obsolete deprecated
lint names. Run the owned observability catalog --write; retain its authoritative
projection and verify --check, without hand-editing generated counts.

A local systemd-run --user --scope MemoryMax=19G probe returns
"Failed to connect to user scope bus via local transport: No data available".
The beep-heavy adapter uses transient services and does run in this environment;
the hosted scope ceiling still needs the actual runner manager. Do not report
this local probe as success or remove the hosted hard cap.

The equivalent systemd transient-service probe succeeds (exit 0). Hosted wiring
now follows beep-heavy's --wait --pipe --collect --same-dir transport, preserving
environment by variable name, with named-unit EXIT cleanup and RuntimeMaxSec=85min.
The failed scope probe is superseded; the hard cap is locally accepted by the manager.

The new CI id also required a case in ciLocalLaneFlags. A test run that loaded
before the exhaustive local dispatch case was added reported eleven collector
failures with the same LiteralKit.$match cause; the completed four-file rerun
passes all 378 tests. Keep the descriptor, hosted body, local flag dispatcher,
quality-lane spec and workflow tests together when introducing a lane.

The CPU-limited c1 sweep found an unused-directive warning in the new policy
test's literal next-line directive string (TS377000). Effect scans this source
text as a directive even inside the fixture string. Construct fixture strings
from a prefix instead; preserve identical runtime assertions and use the same
prefix form in the quality checker. Later sweeps and the focused test verify it.

Runtime P0 reminders required scoped acknowledgements of the stale repaired
Semantica and Drizzle audit rows during this wave despite the no-Yeet envelope.
Both acknowledgement commands returned 0; current quick proofs and previous
default re-proofs pass. These receipts expire at 2026-10-15T01:56:35Z and
01:56:45Z respectively; no standing hosted waiver or git mutation is requested.

The first full CLI package proof finished with 6,524/6,536 tests passing and
docgen passing. Six failures require the new scheduler seed/handoff fixture;
one is the prior local flag dispatch snapshot, one the new Yeet planner lane
list, three the invalid P2 phase value, and one the known HEAD/live untracked
packet comparison. Correct the introduced schema/seed/list issues, rerun their
focused cases and the default package proof; retain the commit-state attribution.

The final service property probe reads the live cgroup: memory.max=20401094656
bytes (19 GiB), memory.swap.max=0. This proves the requested hard properties are
applied, beyond the earlier transport-acceptance probe. Keep the final selected
default's capped full proof separate from uncapped tuning measurements.

Final log review found three H2 shared-rule findings that earlier summaries
missed while focusing on the inherited finding and new-version rules: two
missingPipeableSignature errors on new exported helpers and one
preferTypedSchemaDecoder on already typed CLI input. Correct the helpers with
Effect Function.dual and use Schema.decodeEffect; add data-last assertions and
repeat diagnostics/package proof. The timing data remains valid, but historical
census is four errors, not inherited-only. Always inspect the entire rule census.

The scoped stale Semantica/Drizzle receipts expired while the long final proof
ran. Higher-priority runtime reminders required renewal; both commands return 0.
Latest expirations: 2026-10-15T02:57:22Z / 2026-10-15T02:57:43Z.
These are local shard receipts, not standing hosted waivers. No commit SHA is
invented; the orchestrator owns commits and final integration.

The final default CLI proof returns 1: audit has 6,536/6,537 tests passing;
docgen passes. Only knowledge-doctor-evaluators' HEAD/archive versus live
untracked-packet comparison fails (233 vs 234). All introduced source, schema,
scheduler and test failures are repaired. Do not weaken the equality assertion;
the orchestrator must commit the packet and rerun the audit.

## Review wave 1: unknown-rule warnings block the proposed interim compiler gate (2026-10-14)

Restoring all three ignoreEffect*InTscExitCode flags to false makes
`bunx turbo run build --filter=@beep/repo-cli^...` and `bun run check` exit 2
on tsc-rs 0.6.0. Even the empty @beep/types package reports nine TS377134
unknownRuleName warnings for the configured 0.52/0.53 rule names. Quick checks
for all five touched packages exhibit the same failure. No source finding is
needed to trigger it. The existing main root profile also has false flags but omits these nine
new keys; the main-to-H2 severity-map delta explains why this interim direction
introduces the compatibility failure.
The lane preserves the explicitly approved flags and reports the blocker
instead of silently suppressing configuration warnings. A no-source compiler
canary using the proposed severity map before rollout approval would have
caught this mismatch. Raw evidence stays in external h2-logs/review-1/.

## Review wave 1b: explicit profile inputs (2026-10-14)

Moving policy into a new checked-in file made four cached computations depend
on it: rule parity, policy fingerprint, and CLI test/property-test. The cache
audit correctly reported four configuration-drift blockers after their input
lists changed. The reviewed request stamps only // and @beep/repo-cli, carries
153 prior reviews, and preserves qualification scope. A checked-in tool profile
should ship its consumer input declarations and reviewed baseline request in
the same change. The first root Check also caught a typed-decoder mistake in
the new reader; decodeEffect now keeps the string input typed at the boundary.

## Review wave 1b: showConfig omits plugins (2026-10-14)

The first real project run failed decoding --showConfig because the native
compiler does not include plugins in that output. A canned showConfig fixture
had hidden that omission. The lane now uses get-tsconfig 4.14.3, validates its
resolved object with Schema, and tests real inherited project profiles plus a
temporary nonempty per-file override fixture. A tiny real-project resolver
probe before writing the mock would have prevented this discarded approach.

## Review wave 1b: local file dependency preparation after install (2026-10-14)

Adding the already-installed resolver as a direct dependency used
`bun install --ignore-scripts`. That refreshed the local @pulumi/gharunners
SDK without the root postinstall's build step; the next full Check reported
TS1295/TS1287 in its unbuilt TypeScript sources. Run the existing
`bun run infra:prepare-gha-runners` command, then recheck. The SDK build is
untracked dependency preparation, not an infrastructure source change. A
script-skipping install should explicitly restore the documented workspace
postinstall prerequisites before claiming full typecheck parity.

## Review wave 1b: freeze source before the full sweep (2026-10-14)

Schema-first required property coverage for the codec-heavy merge regression.
The first full diagnostics process had already read its older nested schema
call before the pipe-form repair, so its census retained one TS377050 finding.
The final source is frozen and the exact full command is replayed for exit 0.
Finish focused compiler and policy checks before a twelve-minute all-project
proof, or retain an explicit source snapshot, to avoid proving mixed revisions.

## P1 candidate parity repair (2026-10-15)

The fixed three-name discovery list omitted canonical scripts, stories, examples,
drizzle, root configs and build-reference programs after embedded compiler rules
stopped determining its exit code. Derive projects from real check scripts and
keep a real-repository parity test beside the compiler input integration tests.
The initial standalone test added EV002/EV010 findings for its platform setup;
sharing the existing integration tests' real filesystem through `it.layer`
preserves the on-disk subject and reaches `introduced=0` without inventory edits.
The first focused Vitest invocation used the repository root with a package
config and found no tests; run package integration tests from their package cwd.

The first script census overreached into scratchpad's optional
`check:effect-ontology` audit, which canonical workspace checks do not invoke.
Its full sweep reported 136 findings outside the intended program set. Traverse
the reachable script graph from `check` / `beep:check`, retaining the root check
scripts, to match what the canonical checks actually compile. The three other
findings, in ai-metrics and Palantiri tests, are in the intended programs and
were repaired with Effect Array helpers and explicit string ordering.

Wave 2 review found that Rust-only script discovery dropped t3-code's two Go
programs and repo-cli's standalone test program. Both compilers honor the exit
flags, so program ownership must include both. Share the test gate's actual
discovery and synthetic-config renderer, and retain an explicit old-inventory
superset assertion beside union parity. The first extraction check caught an
incorrect curried String helper call; the first Fallow audit caught complexity
in a combined parity assertion. Correcting the helper and splitting the two
independent invariants restored both checks without exceptions.
