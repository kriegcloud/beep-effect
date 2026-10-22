# #1855 detector repairs wave 3: the FP-2 and FP-6 rulings

Lane `residue-detectors` wave 3, branch `feat/residue-detectors-wave3`, on `main`
`b76e8cac0c` (which includes wave 2, #2041). The class definitions are rows FP-2 and FP-6
of `goals/repository-simplification-confidence/research/sweeps/2026-10-09/B-detector-false-positives.md`.
The measured recommendations are in `detectors-wave-2.md`. EV010 is untouched: PR #2039 owns
it.

## FP-2: EV003 and per-invocation temp-root wrappers

**Ruling: a true false positive. EV003 exempts fresh temp-root wrappers.** A wrapper that
creates a fresh temp root on every call and removes it on release gives each case its own
isolation on purpose. EV003's replacement, sharing through `it.layer`, would put every case on
one root. That breaks the property these tests exist to check, and the 184 retired
exception reasons said so case by case.

**Recognition** (`EffectVitestDetectors.ts`, `isFreshTempRootAcquisition`) is structural and
uses no name allowlist. A call counts only when all four hold:

- It is a provenance-checked `Effect.acquireUseRelease` (3 arguments) or
  `Effect.acquireRelease` (2 arguments), data-first.
- Its acquire contains a `.makeTempDirectory(...)` or `.makeTempDirectoryScoped(...)` call and
  no nested `Effect.acquire*` call.
- Its release is an arrow or function expression, or an `Effect.fn(...)`/`Effect.fnUntraced(...)`
  body, whose first parameter is an identifier.
- The release calls `.remove(<that parameter>, ...)`, matched by binding resolution and not by
  name.

`functionHasShareableResource` is the EV003 predicate, at both the call-site row
(`detectResourceWrapper`) and the definition row (`detectResourceDefinition`). Every
`Layer.scoped/effect/unwrap/launch` still counts, and so does every other acquisition. The
broad `functionHasResource` still builds the `definitions` index, so the EV001/EV002 context
and `localProvider` resolution are unchanged. Both predicates share one
`functionHasResourceWhere` walker.

The repo's temp-dir helper, found with graft, is `withTempWorkingDirectory` /
`temporaryWorkingDirectory` in `packages/tooling/tool/cli/test/support/CommandTest.ts`. It is
`Effect.scoped` over `acquireRelease(fs.makeTempDirectory(), remove)` with no `with*` wrapper
around an acquisition, so it never raised EV003, and no inventory row names it. It needs no
rule of its own. If a wrapper ever puts `temporaryWorkingDirectory` inside an `acquire*`, it
still flags: the exemption keys on the temp-dir constructor, not on helper names.

`mkdtemp` was not added: no EV003 row's wrapper uses it, and the scanned tests use Effect's
`FileSystem`.

**Paired fixtures**, in `test/effect-vitest-detectors.test.ts`, case "permits fresh temp-root
wrappers and keeps shareable resources under resource review". The first five negatives were
written first, and the case failed against `b76e8cac0c`
(`assertFalse` at the negative loop, `Expected false, Received true`):

- Silent:
  - `withTempDirectory` with `Effect.gen` acquire and release;
  - `withTempCwd` through `Effect.flatMap(FileSystem.FileSystem, ...)` with `Effect.orDie`;
  - `Effect.fn("inTempRepo")` with a direct `fs.makeTempDirectory()`;
  - an `acquireRelease(fs.makeTempDirectoryScoped(), (path) => fs.remove(path))`;
  - an `inTempCheckout`-style release that restores `process.cwd` and then removes the root.
- Added with the `Effect.fn` release extension, after the first `--write` left
  `ai-metrics/test/retention.test.ts` flagged: releases written as `Effect.fnUntraced(function* (tmpDir) {...})`
  and `Effect.fn("release")(function* (tmpDir) {...})`.
- Still EV003:
  - a suite-shareable read-only resource re-acquired per test (`fs.readFileString("fixtures/catalog.json")`);
  - a temp acquire whose release only logs;
  - a temp acquire whose release removes a different path, either inline or in an
    `Effect.fnUntraced` release;
  - an unknown `wrap(function* ...)` release;
  - a temp root that opens a second `acquireRelease` store in `use`;
  - a destructured `([root]) =>` release over a zipped temp-dir and server acquire.

**Inventory**: `bun run beep lint effect-vitest --write` takes it from 1,552 rows to 1,356.
Rows are paired by `(ruleId, file, symbol, occurrence)`: 196 were removed and 0 added.

| Symbol | Exceptions retired | Open rows retired |
| --- | --- | --- |
| `withTempDirectory` | 80 | 8 |
| `inTempRepo` | 57 | 0 |
| `withTempCwd` | 22 | 0 |
| `withTempFixture` | 20 | 0 |
| `inTempCheckout` | 4 | 0 |
| `withTempRepo` | 0 | 3 |
| `withOxlintFixture` | 1 | 0 |
| `withRepository` (`git-worktree.test.ts`, temp root plus `git init`) | 0 | 1 |
| **Total** | **184** | **12** |

The `withOxlintFixture` and `withRepository` wrappers were checked by hand. Both acquire
`fs.makeTempDirectory` and remove that same root. One row
(`native-runtime.test.ts` EV014 `it.layer(NodeTestLayer)`, open) re-keyed from line 31 to 32
because this lane inserted a test into that suite. Its status and class are unchanged, and the
rescan reports `introduced=0 resolved=0`. Exceptions with no matching finding drop out with
their rows, so no dead exception remains.

**Still flagged, by design** (EV003: 11 exceptions, 20 open):

- `image-command.test.ts` `withTempDirectory`, 4 exceptions and 4 open. Its
  `acquireUseRelease` acquires a `process.chdir`, not the temp root, which comes from
  `makeTempDirectoryScoped`.
- The process-global wrappers, 15 rows: `withEnvVarEffect` ×4, `withCwd` ×3, `withRealCwd` ×2,
  `withPrependedPath` ×2, `withPathPrefix`, `withWorkingDirectory`, `withPartitionShim`,
  `withEnvVar`.
- Others: `withRedirectingCognee` ×2, `withUnreadableDataDir`, `withFakeBox`, `seedHistory`,
  and the AgentMessage `query`/`call`/`fixture` judgments.

The process-global wrappers are a candidate class for wave 4. They save and restore global
state, so `it.layer` sharing cannot replace them either. That needs its own ruling.

**Reversal**: use `functionHasResource` at the two EV003 sites again, then
`lint effect-vitest --write`. The 196 rows come back as open; restore their reasons from the
pre-PR inventory (`git show <base>:standards/effect-vitest.inventory.jsonc`).

## FP-6: effect-laws `new-map-set` and weak collections

**Ruling: split `WeakMap`/`WeakSet` into a new gating `weak-collection` kind.**
`MAP_SET_CTORS` is now `["Map", "Set"]`. The new `WEAK_COLLECTION_CTORS` set emits
`weak-collection` with message id `weakCollectionCtor`, whose message reads: no Effect
equivalent, keep the collection only where weak identity is required, and document the
identity/GC reason in an allowlist entry. The kind is added to `AllowlistCheck.ts`
(`NativeRuntimeAllowlistKind`) and to `standards/effect-laws.allowlist.schema.json`. The
repo-configs snapshot is regenerated with `bun run codegen` (27 entries, 0 diagnostics).
`detectNewExpressionViolation` now dispatches through a `Match` table
(`detectIdentifierConstructorViolation`). This keeps its cognitive complexity under the
fallow gate.

**Move, not advisory.** The laws registry has no advisory tier. Every kind warns outside the
hotspot scope and errors inside it, and only `native-switch` overrides that, to always-error.
The `--check` strict failure counts warnings too. The only remedy for a weak collection is a
documented identity/GC reason, so the kind gates like the rest. The nine weak-identity entries
move to `weak-collection` with their `reason`, `owner` and `issue` unchanged:

- `@beep/html`:
  - `Html.conformance.ts` (`HTML-CONFORMANCE-WEAK-IDENTITY-PROOFS`);
  - `Html.policy.ts` (`HTML-SAFE-AST-WEAK-IDENTITY-PROOFS`);
  - `Html.serialize.ts` (`HTML-SAFE-STRING-WEAK-IDENTITY-PROOFS`).
- `ChalkRuntime.ts` (`CHALK-WEAKMAP-MEMOIZATION`).
- `editor/viewer.tsx` (`EDITOR-VIEWER-WEAKMAP-ENCODE-CACHE`).
- `dock-react/AdapterState.ts` (`DOCK-REACT-ADAPTER-WEAK-IDENTITY`).
- `provenance/VerifiedTextAnchor.ts` (`CODEX-SECURITY-VERIFIED-ANCHOR-WEAK-IDENTITY`).
- `cli/.../EffectVitestSyntax.ts` (#1067).
- `test-runner/.../VitestInstrumentation.ts` (#1067).

**The mixed entry.** `VitestInstrumentation.ts` also justified a native `Map` (the per-execution
`propertyRuns`, keyed by registration identity and finished in insertion order). Splitting the
entry would have grown the allowlist from 27 to 28, which S31 forbids. Instead the map is now
an insertion-ordered identity list,
`Array<readonly [registration: object, propertyRun: PropertyRunState]>`. Lookup is
`Arr.findFirst` by `===`, insertion is `push`, and finalization iterates in order. That keeps
reference identity and registration order without a native collection. The entry moves whole,
and its reason drops the Map clause, now naming the suite `WeakSet`.

**Allowlist**: 27 entries before and 27 after (`new-map-set` 14 to 5, `weak-collection` 0
to 9). No entry was added. `laws native-runtime --check` reports 4,544 files scanned,
`warnings=0 errors=0 allowlisted=27 unused_allowlist_entries=0`. `laws allowlist-check`
reports OK. The five remaining `new-map-set` entries all hold a real `Map`/`Set`: DevTools,
Wink, Docgen quality, Corpus ServicePrograms, and the ResizeObserver harness.

**Paired fixtures**, in `test/native-runtime.test.ts`. Both were written first and failed
against `b76e8cac0c` (2 failed, 8 passed):

- New case "reports weak collections under their own kind and keeps Map/Set under
  new-map-set". `new WeakMap()`/`new WeakSet()` report `weakCollectionCtor` with the
  identity/GC message and no `HashMap` advice. `new Map()`/`new Set()` still report
  `mapSetCtor`.
- "formats every hotspot violation family" now includes a `new WeakMap` and expects
  `weakCollectionCtor` beside `mapSetCtor`.

**`object-method` review (report only).** Ten entries.

- The five `Object.freeze` entries are all in `@beep/html`: `Html.conformance.ts`,
  `Html.meta.ts`, `Html.language-tag-registry.generated.ts`, `Html.policy.ts` and
  `Html.serialize.ts`. They now call only `Object.freeze` (2 + 87 + 7 + 1 + 1 = 98 calls).
  `Object.create(null)` appears in none of them, although the conformance, policy and
  serialize reasons still name it. Effect has no runtime-freeze equivalent. Whether frozen
  snapshots deserve their own kind is a new policy question, not unambiguous evidence, so the
  entries are unchanged. Recommended for wave 4: a `frozen-snapshot` ruling, plus a
  reason refresh that drops the stale `Object.create(null)` clause.
- The other five use `Object.assign`: `Session.model.ts` statics merge, the shadcn `banner`,
  `dialog` and `dropdown-menu` slot props, and `VitestRuntime.ts`, which copies vendor methods
  onto a callable. Each reason names a boundary contract. No change.

**Coordination**: the sweep asked the lane to notify the effected-port session before any
allowlist edit. This lane cannot message sessions, so the coordinator relays the notice. No
entry was removed or added; only the `kind` of nine entries changed, and one reason was
edited.

**Reversal**:

1. Re-add `WeakMap`/`WeakSet` to `MAP_SET_CTORS`.
2. Remove `weak-collection` from the rule, from `AllowlistCheck` and from the schema.
3. Return the nine entries to `new-map-set` and restore the original `VitestInstrumentation`
   reason.
4. Run `bun run codegen` in `packages/tooling/policy-pack/repo-configs`.
5. Restore `propertyRuns: Map<object, PropertyRunState>`.

## Wave-4 frontier (measured, not implemented)

Measured at the lane head after the wave-3 `--write`. The inventory holds 1,356 rows: 760
exceptions and 596 open. By mechanization: 735 exception/judgment, 546 open/judgment, 50
open/detector, 25 exception/detector.

| Rule | Exceptions | Open |
| --- | ---: | ---: |
| EV001 | 1 | 0 |
| EV002 | 125 | 190 |
| EV003 | 11 | 20 |
| EV004 | 86 | 75 |
| EV005 | 6 | 3 |
| EV006 | 73 | 76 |
| EV007 | 2 | 6 |
| EV008 | 4 | 5 |
| EV009 | 28 | 20 |
| EV010 (owned by #2039) | 138 | 150 |
| EV011 | 0 | 5 |
| EV012 | 6 | 3 |
| EV013 | 0 | 5 |
| EV014 | 240 | 12 |
| EV015 | 40 | 26 |

Schema-first is at 301 live entries, all exceptions, with 0 stale and 0 missing.

**EV014 named test layers (252 rows).** Wave 2 counted 142 rows by symbol name. This census is
broader. It classifies every EV014 row by the binding its first `it.layer(...)` argument names.
The method is a text heuristic over the evidence and the same-file declaration, so treat the
splits as estimates:

| Binding of the layer argument | Exceptions | Open |
| --- | ---: | ---: |
| Imported from another module | 75 | 4 |
| Same-file `const` composition (merge/provide of non-stub operands) | 72 | 7 |
| Same-file `Layer.effect`/`scoped`/`unwrap` body | 71 | 1 |
| Same-file factory function (`makeTestLayer(...)` and similar) | 19 | 0 |
| Inline `Layer.*` expression | 3 | 0 |

The most frequent names: `testLayer` 49, `makeTestLayer` 35, `TestLayer` 16,
`CliRecorderTest` 10, `AiProviderCli` 9, `Executor` 7 and `ResolverTestLayer` 7. None of these
resolves to an acquisition-free layer within its file. Retiring them needs one of two things:

- cross-file resolution of imported test layers (79 rows); or
- a ruling that a `Layer.effect`/`scoped` test layer under `it.layer` without a hook timeout
  is a reviewed judgment rather than an exception (72 rows).

The 79 composition rows need per-operand resolution through factories.

**What a zero-actionable scan still needs.**

1. Review or repair the 596 open rows. The largest blocks are EV002 (190) and EV010 (150,
   #2039), then EV006 (76) and EV004 (75). 546 of them are judgment rows.
2. Rule on the 15 process-global EV003 wrappers, then on the `image-command` chdir wrapper.
3. Do the EV014 named-test-layer work above.
4. Re-review the 760 exceptions one by one against their reasons.
5. Make the `frozen-snapshot` ruling and refresh the stale reasons on the `object-method`
   entries.

## Verification

All on the lane head at `b76e8cac0c` with the change applied. Each heavy command ran alone
through beep-heavy with `</dev/null`. The dependency dists were rebuilt first and again after
the snapshot regeneration (`bunx turbo run build --filter=@beep/repo-cli^...`, 50/50 tasks).

- Typed check in `packages/tooling/tool/cli`: `bun run check` exits 0, and
  `bunx tsc-rs -p test/tsconfig.json --noEmit` exits 0 with 0 errors. Both were re-run after
  the final refactor. `@beep/test-runner` `bun run check` (check plus test tsconfig) also exits 0.
- Suites: effect-vitest-detectors, -contract, -primitives, -store, lint-command,
  native-runtime, native-runtime-prefix, allowlist-check and laws-package, 9 files. They pass
  374/374 on Bun (`bunx --bun vitest run`) and 374/374 on Node (`bunx vitest run`).
  `@beep/test-runner` passes on both runtimes: 3 files, 41 passed, 5 expected fail,
  3 skipped and 4 todo.
- `lint effect-vitest`: 1,356 findings, `introduced=0 resolved=0` after the `--write`.
  `lint:schema-first`: 301 live, 0 stale, 0 missing; every ratchet shows `introduced=0`.
- `laws native-runtime --check`: 0 warnings, 0 errors, 27 allowlisted, 0 unused.
  `laws allowlist-check`: OK.
- `quality effect-diagnostics`: 0 errors and 0 warnings for `@beep/repo-cli` (3 programs) and
  for `@beep/test-runner` (2 programs).
- oxlint (`--disable-nested-config`) and Biome on the changed files: clean.
- `quality fallow audit --base origin/main --check`: exit 0, with complexity and duplication
  `introduced=0`. The first run found two introduced findings: a duplicated resource walker,
  fixed by extracting `functionHasResourceWhere`, and `detectNewExpressionViolation` at
  cognitive 9, fixed with the `Match` table.
- JSDoc: `jsdoc:inventory:check` is ok and `jsdoc:ratchet:check` reports `increased=0`. This
  lane adds no exports.
- `lint schema-catalog` is current, `quality catalog-usage` reports findings=0,
  `lint:retired-effect-paths` reports findings=0, and `goals doctor` reports blocking_new=0
  and blocking_inherited=0.
- `quality package-verify @beep/test-runner`: ok (audit and docgen). `@beep/repo-cli`: 7,404 of 7,405
  tests pass. The one failure is `knowledge-doctor-evaluators` "reads the same packets ...", which
  compares the `HEAD` tree with the live packet manifests. It fails only while this lane's
  `ops/manifest.json` edit is uncommitted, as in waves 1 and 2, so it is environment-only and
  clears on commit.

Route: S39/S41 Claude chain, `claude-opus-5-5` Agent child (step 1), no fallback. The lane was
interrupted once by a session limit and resumed in the same worktree with its edits intact.
