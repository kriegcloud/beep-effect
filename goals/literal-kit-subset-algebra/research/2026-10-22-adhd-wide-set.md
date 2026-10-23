# /adhd wide set — LiteralKit redesign (2026-10-22)

Five isolated divergent branches (competitor, inversion, 3am on-call, remove-the-assumption,
speedrunner), 30 ideas, scored novelty / viability / fit 0-10, weighted
0.35 N + 0.40 V + 0.25 F. Duplicates across branches merged; branch letters kept.

## Cluster A — pay-per-use typing (where expensive types get instantiated)

- ★ Phantom-generic deferral: keep `toTaggedUnion` on the kit but put its N-key mapped type and
  distributive member conditional inside a generic method signature so only call sites pay
  (S1) [N8 V7 F9] 7.85
- `toTaggedUnion` as a free function `taggedUnion(kit)(tag)(cases)` (I4, C4, Grok) [N3 V9 F8] 6.65
- Type-only kit: phantom brand + free functions reading `schema.literals`; no `rebuild`
  override (R6) [N7 V6 F6] 6.35
- `Cases<Kit>` alias + `satisfies` at the call site; `match` is a plain lookup (R4) [N5 V5 F5]
  TRAP: trades inference ergonomics at 355 sites for checker time nobody measured.

## Cluster B — union-typed subsets (omit/pick without a tuple walk)

- Type `omit`/`pick` over the member union; tuple order is runtime-only, kept by one filter
  pass; widened key fails to compile because `Exclude` collapses to `never` (I2, C5, S2)
  [N6 V8 F9] 7.55
- `pick<const K>(...keys) => LiteralKit<K>`: the caller's argument tuple is the subset tuple
  (S3) [N4 V9 F9] 7.25 (this is what upstream `pick` already does; override its return type)
- Build kits from an object `{ Active: "active" }` so subsets are `Omit<Record, K>` (R3)
  [N6 V5 F5] TRAP: inverts the source of truth at 870 construction sites for a type trick
  Cluster B already gets from `Exclude`.
- Upstream: statics-preserving `pick`/`omit` hook on `Schema.Literals` (I6) [N5 V4 F6]
  TRAP as stated: upstream will not take a statics hook; the acceptable ask is plain `omit`.

## Cluster C — construction cost (870 kits at import)

- Shared prototype `KitProto` with getters reading one symbol-keyed members array;
  construction is one slot assignment; `rebuild` carries one pointer (R1, I3) [N7 V7 F8] 7.25
- Lazy memoised helper records built on first access (I1, C3) [N5 V8 F8] 7.0
- Self-replacing lazy getters for `is`; `Enum` built in the same single loop (S5) [N6 V8 F7] 7.05
- `Object.setPrototypeOf` the rebuilt schema onto a shared helper prototype (S6) [N7 V5 F7]
  TRAP-leaning: `setPrototypeOf` on live upstream instances is a V8 slow path and breaks
  the schema class chain unless the kit proto inherits from it per kit.

## Cluster D — dispatch keys (the encoding function on the hot path)

- Property-key coercion dispatch: `cases[value]` for string-only kits, decided once at
  construction; null-prototype records; reserved names rejected; encoding fallback only on a
  `String()` collision (S4, C1) [N7 V9 F8] 8.05
- Split `StringLiteralKit` vs general kit by overload (I5, C2) [N5 V7 F7] 6.3 (the runtime
  branch above gets the win without a type split)
- Non-string kits must supply an explicit key map (R2) [N6 V6 F6] 6.0 (breaking for the
  few mixed kits; weaker than S4)

## Cluster E — diagnosis and authoring guards (3am)

- `match` miss throws a typed defect `LiteralKitUnhandledCase { kit, value, members }`,
  catalogued as a span (O6; Grok and Astra also) [N4 V9 F7] 6.75
- GritQL rule banning `as Kit.Type` / `as typeof Kit.Type` casts, pointing at `Kit.is` /
  decode (O4) [N5 V9 F6] 6.85
- Phantom `MissingCase<"x">` / `UnknownCase<"y">` branded keys so the compiler message spells
  the offending literal (O3) [N7 V6 F7] 6.6
- Subset lineage `parent` + `relation` plus a repo-wide lineage test (O2) [N6 V6 F5] 5.75
  (type-level `Exclude` already makes drift impossible; `parent` ref is cheap diagnostics)
- Fingerprint hash stamped into kit and cases (O1) [N7 V4 F3] TRAP: solves stale-bundle
  mismatch in a single-bundle monorepo; the cases record has no version to compare.
- Build-time literal-domain manifest diffed in cheap-gates listing match sites (O5)
  [N7 V4 F4] TRAP: heavy tooling for what the type checker already reports on growth.

## Cluster F — attachment model and upstream asks

- `LiteralKit.of(schema)` rebuilds helpers from any schema whose AST is a literal union, so
  they survive `S.optional` / `S.Union` / brand; upstream ask is a members annotation, not
  statics (C6) [N8 V5 F6] 6.3
- Late-bound open registry assembled from Layers (R5) [N9 V2 F2] TRAP: nobody has this
  problem; the 234-literal complement is a closed set.

## Shortlist (converge)

1. Coercion dispatch with construction-time collision check (Cluster D) 8.05
2. ★ Phantom-generic deferral of expensive helper types (Cluster A) 7.85
3. Union-typed subsets (Cluster B) 7.55
4. Shared-prototype / lazy construction (Cluster C) 7.25, adopt whichever of R1 or S5
   measures cheaper; both remove the quadratic builders.

Traps listed inline above: R4, R3, I6, S6, O1, O5, R5.

## Focus (three deepened branches, Opus, each read the kit source)

### 1. Coercion dispatch (Cluster D)

Sketch: one `A.every(literals, P.isString)` pass at construction picks a dispatcher once.
Fast path `cases[value](value)` is only sound for all-string kits, because mixed kits have
public keys `number200` / `true`, not `"200"`; the "String() injective" generalisation adds
nothing. `Enum`/`is` built in one `Object.fromEntries` pass on `Object.create(null)`.
Curried `match(cases)` copies the user record once onto a null prototype; the value-first
form guards with `Object.hasOwn` and turns a prototype hit (`"toString"`) into a typed
defect. Only `__proto__` as a string literal needs rejecting at construction.
Load-bearing risk: the branch may not pay for itself. Most measurable cost is `matchLiteral`
constructing a `Match` pipeline per call; a `typeof` switch captures about 90 % of the gain
for every kit with one code path. A `__proto__` rejection is a public behaviour change.
First step: vitest bench of four dispatch variants on an 8-member string kit and a 3-member
mixed kit, plus a census of literal arrays for `__proto__` / `constructor` / `toString` and
mixed-kind kits. Numbers decide whether the fast path ships at all.
Children: `typeof`-switch `matchLiteral` (baseline the fast path must beat); O(n) null-proto
record builders; `LiteralKitReservedKeyError` + GritQL rule for `__proto__`; a
`matchUnknown(value: unknown)` that validates and dispatches in one `hasOwn`; a shared
null-proto tag table reused by `toTaggedUnion` and `S.tag` unions.

### 2. ★ Phantom-generic deferral (Cluster A), MEASURED

The agent measured instead of sketching. `toTaggedUnion` already has the proposed shape:
`ToTaggedUnionFn<L>` (`:138-142`) is a curried generic signature, so the N-key mapped type
and the distributive member conditional run only on call. tsgo `--extendedDiagnostics` on a
temporary 240-member fixture using `Enum`, `is`, `annotate`, `Type`:

| Arm | Instantiations |
| --- | --- |
| current interface, `toTaggedUnion` never touched | 20,831 |
| `toTaggedUnion` replaced by `unknown` | 20,783 |
| current interface plus `typeof Big.toTaggedUnion` (read, not called) | 23,990 |

Untouched kits pay 48 instantiations for the member. Moving it to a free function would
save 48. Grok's open question is closed: keep `toTaggedUnion` on the kit.
Load-bearing risk: laziness is fragile. Any structural comparison that targets the member
(`Pick<LiteralKit<X>, "toTaggedUnion">`, `satisfies` with another `L`, comparing two kits,
declaration emit of an exported kit, editor hover) forces about 3.2k instantiations at 240
members. A future `Rebuild` variance check could bring the cost back silently.
First step: add typeperf fixture pair `literal-kit-large-untagged.ts` (untouched arm, about
20.8k) and a touched arm (about 24.0k); gate on the untouched arm staying within epsilon of
the member-removed count.
Children: laziness-contrast fixture pairs as the typeperf convention; audit `IsGuards<L>`
and `EnumType<L>` the same way (they are the always-accessed N-key types where real cost
lives); a declaration-emit typeperf arm; write the rule into the kit JSDoc **Gotchas** with
the three numbers; GritQL rule flagging conditional/mapped property types over a kit type
parameter that are not wrapped in a generic signature alias.

### 3. Union-typed omit (Cluster B)

Sketch: `Literals` is already `A.NonEmptyReadonlyArray<LiteralValue>`, i.e. a rest tuple,
so the complement fits the existing `L` with no new kit type:
`omit<const D extends A.NonEmptyReadonlyArray<L[number]>>(dropped: D): [Exclude<L[number], D[number]>] extends [never] ? OmitEmptyComplementError<L, D> : LiteralKit<readonly [Exclude<L[number], D[number]>, ...Array<Exclude<L[number], D[number]>>]>`.
`Exclude` distributes once, linear, non-recursive; every helper keys on `L[number]` so the
complement union flows through for free. Upstream `members` is a homomorphic mapped type
over `L`, so a rest tuple maps element-wise with no `length`/`push` keys (pin with one type
test). `pick` stays tuple-first: `pick<const P extends A.NonEmptyReadonlyArray<L[number]>>(p: P): LiteralKit<P>`.
Runtime: `HashSet.fromIterable(dropped)` + one ordered `A.filter`, then `LiteralKit(...)`.
Load-bearing risk: upstream `transform` is positional (`{ [I in keyof L]: LiteralValue }`);
on a rest tuple it degenerates to head + unordered array, so a caller can mis-align an
omit-derived kit's `transform` with no compile error. Second: an omit-derived
`LiteralKit<readonly [C, ...C[]]>` is not assignable where code names the hand-spelled
tuple type, so replacing the 234-literal complement needs a census of `.literals[0]` reads
and `transform` call sites first.
First step: type-level test asserting (1) `pick([...]).literals` is the exact tuple,
(2) `LiteralKit<readonly ["b", ..."b"[]]>["members"]` has no array keys, (3) omitting every
member is a compile error, (4) `omit` over `OfficeCode` stays within an instantiation
ceiling. Then add `omit`/`pick` to the interface (`:344`) and factory (`:412`).
Children: `Positional` brand so `transform` is `never` on omit-derived kits, with a
member-keyed `transformBy(record)` instead; `partition(kit, dropped)` returning both halves
from one pass; GritQL guard flagging a `LiteralKit([...])` whose set is a strict subset of a
sibling kit's; `extend(more)` with an overlap compile error, giving kits union/difference/
intersection; provenance in the identity annotation (`derivedFrom`, `op`, `dropped`) so the
schema catalog renders "OfficeCode minus [...]".

## Provocation

If helpers were derived from the AST rather than attached as statics (`LiteralKit.of(schema)`,
C6), the kit would survive `S.optional`, `S.Union` and brands, the `rebuild` override would
disappear, and the upstream ask would shrink to "annotate `Literals` with its members". Is
the statics-on-the-object model worth keeping once subsets return kits anyway?
