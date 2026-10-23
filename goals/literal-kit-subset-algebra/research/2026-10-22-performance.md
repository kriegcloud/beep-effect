# Performance evidence — 2026-10-22

All type counts are single-checker (`--singleThreaded`), and both sides use
the same compiler, `7.0.2+effect-tsgo.0.55.0`. The merge-base `39868bbebd` was
measured in a clean detached worktree with its own install and dependency
build, using `bun run beep quality check-census --gate-only --filter <pkg>`.
The lane was measured by `check-census --write-baseline` after the dispatch
fix.

The committed baseline before this lane was taken with
`effect-tsgo.0.51.1`. Against it, every row fails the gate's "compiler
changed" check, on `main` as well as on this lane. Its absolute numbers are
not comparable to these, so this lane re-measured every row with the current
compiler.

## Instantiations

| Program | Merge-base | Lane | Δ |
| --- | ---: | ---: | ---: |
| `@beep/schema` | 466,896 | 398,630 | −68,266 (−14.6%) |
| `@beep/repo-cli` | 6,183,612 | 6,157,883 | −25,729 (−0.4%) |
| `@beep/law-practice-domain` | 1,015,133 | 815,028 | −200,105 (−19.7%) |
| `typeperf/baseline` (import only) | 17,290 | 20,477 | +3,187 |
| `typeperf/literal-kit-tagged-union` | 20,541 | 23,722 | +3,181 |
| `typeperf/literal-kit-keyed-api` | 17,870 | 21,100 | +3,230 |
| `typeperf/literal-kit-large-untagged` | — | 48,318 | new |
| `typeperf/literal-kit-large-untagged-touched` | — | 51,445 | new |

The three package rows fall. These causes were not isolated one by one, but
two changes are the likely drivers:

- `@beep/law-practice-domain` drops a 238-literal explicit-tuple `pick` for
  `OfficeCode.omit(["US", "XX"])`.
- Dependents stop paying for a re-wrapped `LiteralKit(...)` around every
  subset, and for the spread-in-reduce record types the old builders inferred.

The fixture rows rise by a flat ~3.2k. That is the fixed cost of importing
the `LiteralKit` subpath, and it is the same on every fixture. Two new tagged
error classes (`LiteralKitUnhandledCaseError`, `LiteralKitEmptySubsetError`)
account for about half of it: the whole errors module costs 2,864 on its own.
The rest is the new `pick` / `omit` / `matchOrElse` declarations. The keyed
API's marginal cost over the import is flat: 580 before, 623 after.

The large pair isolates `toTaggedUnion` laziness. A 240-member kit used
through `Enum`, `is`, `pick`, `omit` and `matchOrElse` costs 27,841 over the
import. Reading `typeof kit.toTaggedUnion` adds 3,127. This agrees with the
panel's 48 against 3,159 measurement for the property alone.

During the lane, a first cut of `literalKey` used a module-level
`effect/Match` pipeline. It raised the import cost to +5,826 and was replaced
by a `typeof`-keyed lookup (the grill ruled a `typeof` switch; the native-runtime law bans `switch`, and the record measures the same); the numbers above are after that
change.

## Dispatch (`research/tools/dispatch-bench.ts`, Bun, 5M calls, six literals)

| Path | Merge-base `$match` | Lane `match` |
| --- | ---: | ---: |
| `switch` (reference) | 1.64 ns | 1.57 ns |
| direct record index (reference) | 3.59 ns | 3.53 ns |
| kit, data-first | 79.34 ns | 7.10 ns |
| kit, curried | 73.16 ns | 5.29 ns |
| kit `matchOrElse`, curried | — | 11.68 ns |

The merge-base ran an `effect/Match` pipeline per call (`matchLiteral`). The
lane does one `typeof`-keyed lookup for the key and one own-property check
(`Record.has`), and it allocates nothing on a hit. A direct-index fast path
would save the remaining ~2–4 ns and stays out of scope: a miss would then
reach inherited properties, and nothing here needs the speed.

## Update after review round 1 (#2080, head after `011190d9ec`)

The review fixes change the kit's types in three ways:

- `matchOrElse` counts only required case keys as handled (`RequiredCaseKeys`).
- `MatchReturn` keeps optional handlers' return types (`-?` + `NonNullable`).
- The unhandled-case error's `value` is `S.Unknown`, and one `LiteralKitEmptySubsetError` replaces the omit-only error.

Re-measured with the same compiler:

| Program | Before the fixes | After |
| --- | ---: | ---: |
| `@beep/schema` | 398,630 | 399,919 (+1,289) |
| `typeperf/baseline` (import only) | 20,477 | 19,874 (−603) |
| `typeperf/literal-kit-keyed-api` | 21,100 | 20,509 (−591) |
| `typeperf/literal-kit-large-untagged` | 48,318 | 52,141 (+3,823) |
| `typeperf/literal-kit-large-untagged-touched` | 51,445 | 55,268 (+3,823) |

The increases are the cost of the two type-correctness fixes over a 240-member union. Both fixes were wrong before: optional cases were typed as handled, and optional handlers' return types were lost. The import cost falls because the error schemas are simpler. The baseline file records the new values.

`@beep/repo-cli` now reads 6,166,041. It is not comparable to the 6,183,612 merge-base figure above, because the lane has since merged 11 `main` commits (through `d1070562cd`) and three clone dedups.
