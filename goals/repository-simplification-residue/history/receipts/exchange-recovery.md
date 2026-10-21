# #1880 restart recovery states for native exchange journals: record

Lane `residue-exchange-recovery`, branch `feat/residue-exchange-recovery`, stacked on
#1879's head `dcabf8ef17` (PR #1944), 2026-10-21. Route: ruling S39/S41, a
Claude-originated residue lane worked by a `claude-opus-5-5` child (wave 8, second of
#1879, #1880, #1881). Source evidence: finding R3-GROK-01 in the predecessor
[F-R3 fix wave](../../../repository-simplification-confidence/SPEC.md#f-r3-bounded-shell-links--panel-round-3-fix-wave-2026-10-15).

## Problem

Before this change a native publication wrote one journal record up front and never
updated it. A process that died between the backup, the `.preimage` hard link, the
`.tmp` stage and the exchange left artifacts and a journal that could not say which
step had run. `restore` only knew how to undo a finished apply, and nothing
reconciled an interrupted one on the next start.

## Design

Schema first, then the service contract, then the implementation. #1879's
`ModelsAtomicExchange.qualify` gate and `ModelsExchangeSystemShape` seam are reused
unchanged.

1. **Schema** (`packages/tooling/tool/cli/src/commands/Models/Models.exchange.schemas.ts`
   owns publication state; `Models.manifest.schemas.ts` owns the journal):
   - `ModelsPublicationStep`, a `LiteralKit` of `intent`, `backed-up`, `staged`,
     `exchanged`, `verified`, `completed`.
   - `ModelsPublicationState`, a `TaggedUnion` of the six steps plus
     `recovering { from }`, `recovered { from, outcome }` and
     `refused { from, reason, detail }`.
   - `ModelsRecoveryOutcome` (`preimage` | `intended`) and `ModelsRecoveryRefusal`
     (`competing-writer`, `foreign-artifact`, `target-missing`, `filesystem-changed`).
   - `ModelsPublicationOwner { bootId, pid, startTicks }` names the process that last
     wrote a state.
   - `ModelsTrackedPublication`: `state`, `owner`, `target`, `staging`, `retained`,
     `backup`, `preimageHash`, `stagedHash`, `targetAtIntentHash` (SHA-256 of the raw
     target bytes read at intent) and `filesystem` (the
     `modelsExchangeIdentityKey` of the target filesystem at intent).
   - `ModelsLegacyPublication` and the union `ModelsPublication`.
   - `ModelsApplyJournal` gains `publication` (decoding default and constructor
     default `legacy`, so a journal without the key decodes to the legacy state by
     schema transformation) and `restoration` (an optional tracked publication for
     the undo that `restore` publishes).
   - Reports: `ModelsPublicationRole`, `ModelsRecoverySkip` (`legacy` |
     `owner-alive`), `ModelsRecoveryResult` and `ModelsRecoveryReport`.
   - `ModelsLocatorRefusal` (`Models.errors.ts`) adds `owner-alive` and spreads
     `ModelsRecoveryRefusal.literals`, so every recovery refusal is typed.
2. **Contract** (`Models.apply.service.ts`): `ModelsApplyShape` gains
   `recover(backupDirectory) → ReadonlyArray<ModelsRecoveryReport>`. The recovery
   service is a member of the writer contract rather than a second service, because
   it reconciles the writer's own journals with the writer's private primitives, and
   manual and automatic recovery must share one path. `beep models recover` is the
   explicit entry point (a subcommand of the existing group, not a parallel CLI).
3. **Implementation**: one `reconcile(backupDirectory, journal, role, publication)`
   behind `apply --write` (target-scoped sweep before planning), `recover` (sweep of
   every journal) and `restore` (its own journal, retrying refusals).

## State machine

Each state is written with an atomic journal write before the step it guards: the
encoded journal goes to `<id>.json.<n>.partial` with an exclusive create, a full write
and `fsync`, then an exclusive `link` for the first state or a `rename` for every
later one, then a directory `fsync`.

| State | Written | Durable on disk when it is the latest state | Guards |
| --- | --- | --- | --- |
| `intent` | after `qualify`, before any artifact | journal with every path, hash and the filesystem key | the backup write |
| `backed-up` | after the backup is written `wx` and fsynced | + `<id>.backup` (apply only) | the `.preimage` link and the `.tmp` stage |
| `staged` | after the stage is written, fsynced, validated, chmodded and drift-checked | + `.preimage`, `.tmp` | the exchange |
| `exchanged` | right after the exchange returns | target and stage swapped | verification of both occupants |
| `verified` | after both occupants verify | as above | removal of the stage and link |
| `completed` | after the cleanup | journal + backup | — (terminal) |
| `recovering { from }` | before recovery changes anything; owner becomes the recoverer | unchanged artifacts | removals or an exchange-back |
| `recovered { from, outcome }` | after reconciliation | per crash-point table | — (terminal) |
| `refused { from, reason, detail }` | after a refusal | every artifact kept | — (terminal; only explicit restore retries) |
| `legacy` | never written; decoded for journals without `publication` | whatever the old writer left | — (never touched) |

Transitions: `intent → backed-up → staged → exchanged → verified → completed` for an
apply; `intent → staged → exchanged → verified → completed` for a restoration (it has
no backup of its own). Any pending state (`intent` … `verified`, `recovering`) →
`recovering → recovered | refused`. Explicit `restore` also takes `refused →
recovering`.

Recovery leaves a pending publication alone while its owner is alive: same boot id,
`/proc/<pid>/stat` present, same start ticks, not a zombie. A reused pid, a reboot or
a reaped process reads as dead. Terminal states skip the owner check.

## Crash-point recovery

Recovery decides from the bytes on disk; the recorded step only says which artifacts
may exist. Every recorded path must be this journal's own: the stage and link sit
beside the target as `<name>.<id>-*.tmp|.preimage`, and the backup is
`<backups>/<id>.backup` (compared through resolved directories). An artifact counts
as ours only when it is absent or its bytes hash to the preimage or the staged
content.

| Crash point (latest state) | Live target | Automatic (`recover`, next `apply`) | Manual (`restore --journal`) |
| --- | --- | --- | --- |
| before backup (`intent`) | preimage | nothing to undo; drop a partial journal write and any partial backup → `recovered`/`preimage` | same; nothing to restore |
| after backup (`backed-up`) | preimage | drop the stale backup → `recovered`/`preimage` | same |
| after stage (`staged`, exchange not run) | preimage | remove the stage and link, drop the backup → `recovered`/`preimage` | same |
| mid-exchange (`staged`, exchange returned) | staged | the stage holds the preimage: remove stage and link, keep the backup → `recovered`/`intended` | reconcile as automatic, then the journaled undo restores the preimage |
| after exchange (`exchanged`) | staged | as mid-exchange | as mid-exchange |
| after verification (`verified`) | staged | as mid-exchange | as mid-exchange |
| `completed` | staged | no-op | the undo, as before |
| during recovery (`recovering`) | either | reconciled again from the bytes | same |
| restoration at `staged` | applied content | `restoration` `recovered`/`preimage` | a fresh undo |
| restoration after its exchange | original content | `restoration` `recovered`/`intended` (the restore landed) | done |

## Competing-writer rule

Recovery never overwrites a competing native writer. When the target's bytes match
neither the preimage nor the staged content, or the target is missing, a symlink or
not a regular file, recovery records `refused` with a typed reason
(`competing-writer` or `target-missing`) and keeps every artifact. A stage or link
with foreign bytes, or a recorded path that is not this journal's, is
`foreign-artifact`. When the target holds the staged content but the stage holds
foreign bytes, the exchange displaced a competing writer: recovery qualifies the
target (`requireExchange`), compares the filesystem identity key with the one recorded
at intent (`filesystem-changed` refuses without exchanging), exchanges the competitor
back to the live path, and refuses with `competing-writer`. A refusal is terminal
for automatic recovery, does not block the next apply (which edits only owned fields
of the live bytes), and is retried only by an explicit restore.

## Matrix results

`packages/tooling/tool/cli/test/models-exchange-recovery.test.ts`, 40 tests under
`@effect/vitest` `layer(...)`, on scoped temporary trees only. The SIGKILL tests spawn
`test/fixtures/models/exchange-crash-writer.ts` with `bun`: a real `ModelsApplyLive`
over #1879's deterministic `makeModelsTestExchangeSystem` primitive. Its
`FileSystem` wrapper halts after the journal link or rename that publishes the named
state, and its exchange wrapper halts after the publication exchange returns. The
parent reads `HALTED <point>`, sends SIGKILL, reaps the child, recovers, and compares
SHA-256 of the raw target bytes. No crash-writer process outlives a run.

| Case | Result |
| --- | --- |
| SIGKILL at `intent`, `backed-up`, `staged` → `recover` | byte-exact preimage; backup, stage, link and partial journal removed; second run `[]`, identical listing |
| SIGKILL at `exchange-returned`, `exchanged`, `verified` → `recover` | byte-exact intended; backup equals the preimage; stage and link removed; second run `[]` |
| SIGKILL at `completed` → `recover` | no-op |
| each of the seven points → `restore --journal` | byte-exact preimage, no artifacts; a second restore leaves the bytes unchanged |
| each of the seven points → next `apply --write` | recovers first, then writes; byte-exact intended; old journal terminal |
| SIGKILL of the apply, then SIGKILL of `recover` at `recovering` | reconciled again to byte-exact intended; idempotent |
| SIGKILL of a restore at `staged` / after its exchange | `restoration` recovered to `preimage` / `intended`, byte-exact |
| competing writer replaces the target after SIGKILL at `staged`; in-place write after `exchange-returned` | `refused`/`competing-writer`; target keeps the competitor; stage, link and backup kept; second `recover` `[]`; explicit restore refuses again with the typed reason |
| legacy journal (no `publication` key) | decodes to `legacy`; `recover` reports `skipped`/`legacy` and changes nothing; `restore` undoes byte-exact |
| live owner | `skipped`/`owner-alive`; restore refuses with reason `owner-alive` |
| displaced competitor (in-process) | exchanged back to the live path, `refused`/`competing-writer` |
| changed filesystem identity | `refused`/`filesystem-changed`, no exchange |
| foreign stage, foreign link, missing target, symlinked target, recorded path outside the target directory | typed refusal, every artifact and the outside file kept |
| symlinked backup directory | restore through the resolved directory recovers |
| property: every `ModelsTrackedPublication` | round-trips through the journal codec; dropping `publication` decodes to `legacy` |
| `beep models recover` | prints each decision and the legacy count; exits non-zero on a refusal |

All existing race, rollback and #1879 capability tests are unchanged and green.

## Verification

Lane head `dcabf8ef17` plus the uncommitted diff.

| Check | Result |
| --- | --- |
| `@beep/repo-cli` models tests (9 files), Bun `bunx --bun vitest run test/models` | 165 passed (40 new in `models-exchange-recovery.test.ts`) |
| same, Node `bunx vitest run test/models` | 165 passed |
| `tsc-rs -p tsconfig.check.json` and `-p test/tsconfig.json`; the crash-writer fixture through a scratch overlay | 0 errors |
| `bun run beep quality effect-diagnostics --filter repo-cli` | 0 errors / 0 warnings on the check, test and scripts overlays |
| `bun run beep lint effect-vitest` | `introduced=0` |
| `bun run beep lint schema-first` | `introduced=0`, parity ratchet ok, no new advisory (the property test covers the journal codec) |
| oxlint and biome on the seven changed source/test files | clean |
| `bun run beep quality fallow audit --base origin/main --check` | exit 0, verdict pass, 0 complexity findings (settle, sweep, apply and restore split into helpers) |
| `bun run jsdoc:inventory:check` + `bun run jsdoc:ratchet:check` | `increased=0`, zero-legacy ok; prose sections precede every **Example** |
| `bun run beep observability catalog --write` | +2 conforming spans (`ModelsApply.recover`, `ModelsCommand.recover`) |
| `bun run beep lint schema-catalog --write` | +12 repo-cli entries, `ModelsLocatorRefusal` updated |
| `bun run beep laws retired-effect-paths` | findings=0 |
| `bun run coverage --filter=@beep/repo-cli` | `coverage-ratchet ok`; 342 files / 6944 tests pass; `Models.apply.service.ts` 96.08% lines (baseline 93.52), `Models.exchange.schemas.ts`, `Models.errors.ts`, `Models.manifest.schemas.ts` 100% |
| `bun run beep quality package-verify @beep/repo-cli` | exit 0 (`ok audit`, `ok docgen`) |
| `bun run beep goals doctor` | `OK: no new blocking findings` (inherited legacy completion-gate advisories only, none in this packet) |

Coverage and package-verify ran before the packet's `ops/manifest.json` edit, which
`knowledge-doctor-evaluators.test.ts` compares against the committed file (see the
#1879 record). Package-verify needs a real stdin: its steps spawn with
`stdin: "inherit"`, so a background run with a closed stdin fails with `Failed to
spawn bun run docgen`; binding `</dev/null` fixes it.

No crash-writer process or test temporary directory outlived any run. No baseline,
inventory or exception rows are added (S31). The package is private, so no
changeset.

## Route and model evidence

Worked by a Claude Code Agent-tool child pinned to `claude-opus-5-5` (S39/S41 Claude
chain, step 1). No fallback was taken; no other provider ran in this lane.

## What #1881 can reuse

- The tracked-publication schema (`ModelsTrackedPublication`, `ModelsPublicationState`,
  `ModelsPublicationOwner`) and the refusal kit, for file publications. Directory
  publication needs a tree hash in place of a byte hash.
- The ledger pattern (fsynced partial, exclusive link for the first state, rename for
  the rest, directory fsync) and the owner-liveness check.
- The bytes-decide reconciliation and the competing-writer rule, including returning a
  displaced writer through a qualified exchange.
- The crash-writer fixture design: halt on the journal write that publishes a state,
  SIGKILL, reap, compare SHA-256.
- Gap for #1881: a replacing writer's own crash (the skill projection is a different
  writer), directory exchange and per-entry recovery are not covered here.

## Residual limits

- Two recoverers that start on the same dead publication at the same instant are not
  mutually excluded beyond the owner check; the same external-maintenance-boundary
  note as the writer applies.
- Owner liveness reads procfs. Without procfs no owner is recorded and recovery
  treats the publication as abandoned; such hosts also fail #1879's exchange
  qualification, so they never publish.

## Reversal

Revert the PR. Journals written by this version carry extra `publication` and
`restoration` keys; the previous decoder ignores unknown keys, so its restore still
undoes a completed apply. Interrupted publications from this version then fall back
to the previous behavior: artifacts stay until removed by hand.
