# #1879 target-filesystem atomic-exchange capability: record

Lane `residue-target-exchange`, branch `feat/residue-target-exchange` off `main`
`426d494b34`, 2026-10-20. Route: ruling S39/S41, a Claude-originated residue lane
worked by a `claude-opus-5-5` child (wave 8, first of #1879, #1880, #1881). Source
evidence: finding F3-F2 in the predecessor
[F-R3 fix wave](../../../repository-simplification-confidence/SPEC.md#f-r3-bounded-shell-links--panel-round-3-fix-wave-2026-10-15).

## Problem

Before this change `ModelsAtomicExchange` probed `mv --exchange` once per service, in
an OS temporary directory, and cached one boolean. That proved exchange support on
the temporary directory's filesystem, not on the filesystem that holds the native
target. The check also ran inside publication, after the backup and the journal had
been written.

## Design

Schema first, then the service contract, then the implementation.

1. **Schema** (`packages/tooling/tool/cli/src/commands/Models/Models.exchange.schemas.ts`):
   - `ModelsExchangeUnsupportedReason`, a `LiteralKit` of `exdev`, `einval`, `eperm`,
     `enosys` and `unknown`.
   - `ModelsExchangeFilesystemIdentity`: `device` (the `stat` dev of the target's
     parent directory, a bigint) and `filesystemType` (an `Option` of the type the
     host reports). `modelsExchangeIdentityKey` derives the cache key from both.
   - `ModelsExchangeCapability`, a `TaggedUnion` of `supported` and
     `unsupported { reason, detail }`.
   - `ModelsExchangeQualification`: `{ directory, identity, capability }`.
   - Errors (`Models.errors.ts`): `ModelsExchangeProbeError` (the probe could not
     run) and `ModelsExchangeFault` (one exchange was refused, with its reason).
     `ModelsLocatorError.reason` widens from `ineligible` to the `LiteralKit`
     `ModelsLocatorRefusal`, which adds `exchange-unsupported` and
     `exchange-probe-failed`.
2. **Contract** (`Models.apply.service.ts`):
   - `ModelsExchangeSystemShape { identify, exchange }` holds the host primitives.
     The live primitives are GNU `stat --file-system --format=%T` and
     `mv --exchange --no-copy` (renameat2 `RENAME_EXCHANGE`), both run with `LC_ALL=C`.
   - `ModelsAtomicExchangeShape { exchange, qualify }`. `qualify(target)` returns a
     `ModelsExchangeQualification` or fails with `ModelsExchangeProbeError`.
     `exchange` keeps its `ModelsLocatorError` channel and its retain-artifacts
     message, and now adds the reason and the host text.
   - `makeModelsAtomicExchange(system)` builds the cached capability from any
     primitives. `ModelsAtomicExchangeLive` is the same constructor over the live
     primitives.
3. **Implementation**:
   - `qualify` stats the target and its parent, then identifies the parent's
     filesystem. A target whose dev differs from its parent's (a bind-mounted file)
     is `unsupported`/`exdev` without probing.
   - Otherwise it looks up the identity key under a one-permit semaphore. On a miss it
     probes. The probe creates a scoped `.beep-models-exchange-probe-*` directory
     inside the target's parent and checks that the directory has the parent's dev.
     It writes two disposable files (`wx`, `0600`), exchanges them, and checks that
     the contents swapped. The scope removes the directory on every outcome. Native
     content is never opened for writing.
   - A `ModelsExchangeFault` from the probe becomes `unsupported` with that reason.
     If the files did not swap, the result is `unsupported`/`unknown`. Supported and
     unsupported verdicts are both cached. A probe failure is not cached and surfaces
     as a typed `ModelsExchangeProbeError`.

## Identity and invalidation rule

The cache key is `${device}:${filesystemType or ""}` of the target's parent
directory. Every `qualify` call identifies the filesystem again, and the identity
lookup is never cached. A target whose device or reported type has changed (a
remount, a moved directory, a newly reported type) therefore misses the cache and
gets a fresh probe. Returning to an earlier identity reuses that identity's entry.

## Errno mapping

`modelsExchangeErrnoFromStderr` reads the C-locale strerror text that `mv` prints:

| Text | Reason |
| --- | --- |
| `Invalid cross-device link` | `exdev` |
| `Invalid argument` | `einval` |
| `Operation not permitted` | `eperm` |
| `Function not implemented` | `enosys` |
| anything else, such as `unrecognized option '--exchange'` or an `mv` that cannot run | `unknown` |

A target that is a mount point separate from its parent is `exdev` without a probe.

## Refusal point

`ModelsApply.apply` calls `requireExchange(actual)` right after the dry-run and
ownership checks, before it stats the target, creates the backup directory, or
writes the backup, the journal or a staged file. `ModelsApply.restore` calls it after
the journal and backup checks and before `atomic` creates the `.preimage` link or the
`.tmp` stage. When the capability is unsupported, the refusal is a
`ModelsLocatorError` with `reason: "exchange-unsupported"` and the message
`Atomic exchange unsupported on the target filesystem (<reason>: <detail>); refusing native write before backup or publication.`.
A probe failure gives `reason: "exchange-probe-failed"`. The old in-publication
`supported` check is removed, because nothing reaches `atomic` without qualifying
first.

## Fixtures and tests

All fixtures are scoped temporary directories. No test writes outside them or reads
home or config files. New file
`packages/tooling/tool/cli/test/models-exchange-capability.test.ts` runs under
`@effect/vitest` `layer(ModelsAtomicExchangeLive …)` so EV010 can prove provenance:

- a supported target is probed once and then cached for a sibling, then applied and
  restored. Afterwards no probe directory remains;
- identity change: devices 1 → 1 → 2 → 1 give probes 1, 1, 2, 2;
- unsupported `exdev`, `einval` and `eperm`, simulated through the primitive layer:
  two apply attempts each fail with `exchange-unsupported` and no `Journal:`. The
  backup directory does not exist, the target bytes are unchanged, the parent holds
  only `config.toml`, and there is one probe;
- a restore on an unsupported filesystem refuses with a journal id. The target keeps
  its applied bytes, no `.preimage`/`.tmp` is left, and the backup is intact;
- an exchange that succeeds without swapping is `unsupported`/`unknown`, and its
  probe files are cleaned up;
- an identity failure is a typed `ModelsExchangeProbeError`. Apply refuses with
  `exchange-probe-failed` before backup and without probing, and an absent target
  also fails typed;
- the live primitives on a disposable target return a verdict with the parent's dev
  and leave only the fixture file. When the verdict is supported, a real exchange
  swaps the files, and an exchange of an absent path keeps the retain-artifacts
  message;
- the errno table above.

`test/helpers/models-atomic-exchange.ts` now builds `modelsTestExchangeLayer` through
`makeModelsAtomicExchange` over a deterministic three-rename primitive, and exports
`makeModelsTestExchangeSystem`. The two race wrappers in `test/models-apply.test.ts`
change one field, `supported: Effect.succeed(true)` to
`qualify: modelsTestExchange.qualify`. Their interference schedules and assertions
are unchanged. The old `fails closed and caches an unsupported exchange probe` test
is replaced by the unsupported-target tests above. It intercepted the old
`exitCode`-based `mv` call and asserted a refusal *after* the journal (`Journal:`),
which is the behavior this issue removes.

## Verification (lane head = `426d494b34` plus the uncommitted diff)

| Check | Result |
| --- | --- |
| `@beep/repo-cli` models tests (9 files), Bun `bunx --bun vitest run` | 130 passed |
| same, Node `bunx vitest run` | 130 passed |
| `tsc-rs -p tsconfig.check.json` and `-p test/tsconfig.json` | 0 errors |
| `bun run beep quality effect-diagnostics --filter repo-cli` | 0 errors / 0 warnings on the check, test and scripts overlays |
| `bun run beep lint effect-vitest` | `introduced=0` |
| `bun run beep lint schema-first` | `introduced=0` (parity ratchet ok) |
| oxlint on changed files | exit 0 |
| biome on changed files | clean; one pre-existing `useTemplate` info on an untouched line |
| `bun run beep quality fallow audit --base origin/main --check` | exit 0, 0 findings |
| jsdoc inventory + `jsdoc-ratchet` | `increased=0`, zero-legacy ok |
| `bun run beep observability catalog --write` | +2 conforming spans (`ModelsAtomicExchange.qualify`, `ModelsExchangeSystem.make`) |
| `bun run beep lint schema-catalog --write` | +7 repo-cli entries |
| `bun run beep laws retired-effect-paths` | findings=0 |
| `bun run beep quality package-verify @beep/repo-cli` | exit 0 (`ok audit`, `ok docgen`) |
| `bun run coverage --filter=@beep/repo-cli` | `coverage-ratchet ok`, 341 files / 6904 tests pass; `Models.exchange.schemas.ts` and `Models.errors.ts` at 100%, `Models.apply.service.ts` at 91.35% lines |
| `bun run beep goals doctor` | `blocking_new=0`, `blocking_inherited=0` |

`knowledge-doctor-evaluators.test.ts` compares each committed packet manifest with
the live file. It fails only while this packet's `ops/manifest.json` edit is
uncommitted, so it is environment-only. With the HEAD bytes put back for the run, the
test passes (14/14) and so does the whole suite. The package-verify and coverage rows
above were taken that way, and the lane edit was restored afterwards. The test passes
again once the manifest is committed.

On this workstation (GNU coreutils 9.12, tmpfs `/tmp`) the live probe is supported.
Hosts whose `mv` lacks `--exchange` refuse with `unknown`, as before, but now before
any backup.

No baseline, inventory or exception rows are added (S31). The package is private, so
no changeset is needed.

## Reversal

Revert the PR. The journal schema, backup layout and on-disk artifacts are
unchanged, so journals written by either version restore under the other. The
widened `ModelsLocatorError.reason` only adds literals.
