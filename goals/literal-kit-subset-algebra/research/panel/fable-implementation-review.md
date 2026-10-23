# Fable implementation review of the LiteralKit helpers (2026-10-22)

Scope: the helpers proposed to return (`pickLiterals`, `omitLiterals`, `thunk`), the
ones being renamed (`$match` -> `match`, plus `matchOrElse`, `whenLiterals`), and the
builders they share with the kept statics (`Enum`, `is`). Sources: current
`packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts` and the
pre-trim file at `b26ed3a81d^` (copy: `pretrim-LiteralKit.ts` beside this file).

## Findings on the existing builders (kept statics, so these cost every kit today)

1. Quadratic record building. `makeGuards` (current :179-183), `makeEnum` (:173) and the
   pre-trim `makeThunks` (:271-281) all use `A.reduce({}, (acc, l) => ({ ...acc, [key]: ... }))`.
   Each step copies the accumulator, so a kit with n members allocates n intermediate
   objects and does O(n^2) property copies at module load. HttpStatus-sized kits
   (about 60 members) pay about 1,800 copies per static, three statics each. Fix: build
   entries once with `A.map` and materialise with `Record.fromEntries` (effect/Record),
   one allocation per static.

2. Key derivation repeated per static. `matchLiteral(literal)` (LiteralToKey) is computed
   independently inside `makeGuards`, `makeEnum`, `buildMatch` dispatch, `toTaggedUnion`
   and the old `makeThunks`. Compute `keys: ReadonlyArray<string>` once per kit
   construction and pass it to every builder.

3. Match dispatch does key formatting on every call. `buildMatch` (:275-296) resolves
   `cases[matchLiteral(value)]` per invocation. For string-only kits the key is the
   literal itself, so dispatch can be `cases[value]` with no call. For mixed kits a
   precomputed `HashMap<LiteralValue, string>` built once at construction replaces the
   per-call formatting. `match` sits in fold loops (ciops `classifyAttempt`), so this is
   the one helper where per-call cost matters.

4. `attachHelperDescriptors` (:305-319) is sound and cheap: one `defineProperties` per
   derivation, descriptors shared across derivations. Keep it. Note the descriptor map is
   created once per kit, which is exactly the place to hang lazily memoised values.

## Proposals for the returning helpers

- `thunk`: do not allocate n closures eagerly. Define the descriptor as a getter that
  builds the record on first access and memoises it in the construction closure, so
  every derivation of the kit shares one record. Build each thunk as `F.constant(literal)`
  over the precomputed keys. Type: `{ readonly [K in L[number] as LiteralToKey<K>]: () => K }`
  (unchanged from pre-trim minus the `M` parameter).

- `pickLiterals`: identity at runtime, as before. Signature
  `<const S extends A.NonEmptyReadonlyArray<L[number]>>(subset: S) => S`. Zero cost; the
  value is the typed membership check and completion.

- `omitLiterals`: type-level rejection of an empty complement instead of the pre-trim
  runtime `LiteralNotInSetError` throw. Sketch (verify inference with a tsgo probe; the
  conditional must be intersected onto `S`, not replace it, or `S` loses its inference
  site):
  `<const S extends A.NonEmptyReadonlyArray<L[number]>>(subset: S & ([Exclude<L[number], S[number]>] extends [never] ? never : unknown)) => A.NonEmptyReadonlyArray<Exclude<L[number], S[number]>>`.
  Runtime: `A.difference(subset)(literals)` from effect/Array; member counts are small,
  so no HashSet construction per call (the pre-trim version built one every call).

- `match` / `matchOrElse`: keep the kit's `const Cases` + `Unify<MatchReturn<Cases>>`
  typing (it preserves literal returns without a contextual type, which upstream
  `TaggedUnion.match`'s single `Output` parameter does not). `matchOrElse` takes
  `Partial` cases plus `orElse: (value: L[number]) => B`, both overloads, mirroring
  `TaggedUnion.matchOrElse` (`node_modules/effect/dist/Schema.d.ts:5301`).

- `whenLiterals`: fold `Match.when(literal, handler)` over the cases record. Thread the
  matcher's `Ret` into the handlers (as `Match.tags` does via its `Contextual` helper,
  which is not exported, so write a two-line local equivalent). Constrain case keys to
  `LiteralToKey<Extract<L[number], R>>` so a case for an already-consumed literal is a
  type error. Public helpers needed are all exported under `Match.Types`:
  `AddWithout`, `ApplyFilters`, `WhenMatch`, `PForExclude` (`Match.d.ts:2005-2335`).

## Type-level notes

- Every keyed static repeats the remap `[K in L[number] as LiteralToKey<K>]`. TS caches
  the per-K instantiation, so the repeat is cheap; no change needed.
- Dropping `M` (done in the trim) was the measurable instantiation win; do not reintroduce
  a mapping parameter.
- `Unify.Unify` on match returns is the heaviest remaining type; it is also what keeps
  `Effect`/`Option` returns from exploding into unions of structurally equal types, so keep it.

## Open items for the grill

- `pickLiterals` existence rests on API coherence with `omitLiterals`, not on coverage.
- `thunk` existence rests on context-free literal typing inside pipes/records; the
  coverage claim via `F.constant(Enum.k)` stands.
- Whether `match` should accept the value-first form only (253 of 355 sites) or keep both
  overloads (keep both; upstream `TaggedUnion.match` has both).
- Whether any of `match` / `matchOrElse` should be proposed upstream on `Schema.Literals`.
