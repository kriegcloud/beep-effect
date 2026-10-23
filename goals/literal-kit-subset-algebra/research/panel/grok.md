# Literal-domain kit over Effect v4 `Schema.Literals`

Independent review. Sources are the working tree, `git show b26ed3a81d^` (the parent of the trim, PR #1338), installed `effect` under `node_modules/effect`, and the public Zod 4, Valibot, and Effect v4 schema docs. Line numbers are from this checkout on 2026-10-22.

## Summary

Keep a kit, and keep it smaller than the pre-trim grab-bag. `Schema.Literals` already owns the schema, the member tuple (`.literals`), and positive subsetting (`.pick`). The kit should own only what upstream does not: a name→value record (`Enum`), a record of type guards (`is`), and an exhaustive record match (`match`). Add one operation the trim deleted and should not have: `omit`, the negative subset, returning a new kit whose member type is `Exclude<Parent, Drop>` so a parent that grows carries its children with it. Do not bring back `Options`, `pickOptions`, `HashSet`, `thunk`, or `enumMapping`. Do not prefix `match` with `$`. Do not make the kit a plugin for `effect/Match`. Move `toTaggedUnion` off the type of every kit. The current constructor pays for an `effect/Match` pipeline per literal to compute a string key; that is the implementation to fix, not the existence of the kit.

## 1. Which helpers

The line I use: if the result is the same schema family or a pure view of the tuple, it belongs on `Schema.Literals` (or is already there). If it is an allocated index with a naming policy, it is an opt-in kit. If it is `HashSet.fromIterable` or `Function.constant` spelled differently, it is a call site.

**Member tuple.** Keep, under the upstream name `.literals`. Do not restore `Options`. `Literals` stores the array you passed (`node_modules/effect/dist/Schema.js:2457-2461`). The September census counted 395 `.Options` lines that were a rename (`explorations/effect-schema-parity/DECISIONS.md:458`). A second name for one array is a facet to audit on every Effect bump. The trim was right.

**`pick`.** Keep the upstream method. Delete `pickOptions` and do not redesign it back into existence. Pre-trim `pickOptions` was `(subset) => subset` (`b26ed3a81d^:.../LiteralKit.schema.ts:562`). It checked "these are members" and then handed the same tuple back. A `satisfies ReadonlyArray<typeof Kit.Type>` at the call site does that without a method. Upstream `pick` is the useful one: it returns `Literals<L2>` (`node_modules/effect/dist/Schema.d.ts:4147`). One change: the kit must override `pick` so the result is a `LiteralKit`, not a bare `Literals`. Today it does not. The interface only adds `$match`, `Enum`, `is`, `Rebuild`, and `toTaggedUnion` (`packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:344-350`), and upstream `pick` returns a fresh `Literals` (`Schema.js:2465-2467`) that never went through `rebuild`. `Kit.pick(...).Enum` does not exist. Callers re-wrap with `LiteralKit(Kit.pick(...).literals)`, which allocates a second kit and, on a large literal array, forces a giant tuple type. That is what `CitingApplicationIdentity.model.ts:80-83` is working around.

**`omit`.** Redesign, and put it back. This is the helper the trim got wrong.

Positive and negative subsets are different specs. `HarnessLedgerAdmission` is "these five outcomes" (`packages/tooling/tool/cli/src/commands/HarnessLedger/HarnessLedger.schemas.ts:56-57`). Listing them in `pick` is the specification; a new disposition must not appear there until someone opts in. `WipoSt13OfficeCode` is "every ST.3 office except `US` and `XX`" (`packages/law-practice/domain/src/values/CitingApplicationIdentity/CitingApplicationIdentity.model.ts:78-83`). The comment says the complement is spelled out, 238 members, with an explicit element type so `pick` will not infer a 238-tuple. A new office added to `OfficeCode` is silently absent from the child. `AlignedStatus` is still documented as "Derived from AlignmentStatus minus `unaligned`" (`packages/foundation/capability/langextract/src/Alignment/Alignment.model.ts:32-48`) but the code is now a closed four-element pick. The census treated both shapes as "an explicit pick of the complement" (`explorations/effect-schema-parity/DECISIONS.md:470-472`). That sentence is true for a five-element positive subset and false for an open complement.

The old helper is not what I would restore. `omitOptions` returned `NonEmptyReadonlyArray<Exclude<L[number], LSubset[number]>>` (`b26ed3a81d^:.../LiteralKit.schema.ts:558-560` and the interface at 646). That is a non-tuple. The pre-trim chat code refused to use it for that reason: a comment on `TurnRequestReceiptStatus` says deriving via `omitOptions` loses tuple-ness and collapses a `mapMembers` / `Tuple.evolve` mapping to one member (`git show b26ed3a81d^:apps/professional-desktop/src/chat/ChatOrchestrator.ts`, the comment immediately above `TurnRequestReceiptStatus`). Reinstating `omitOptions` reintroduces the bug those authors already routed around. Index-aligned `mapMembers` should keep taking an explicit tuple. `omit` is for the other job.

Shape I want:

```ts
type Complement<L extends readonly [SchemaAST.LiteralValue, ...ReadonlyArray<SchemaAST.LiteralValue>], Drop> =
  Exclude<L[number], Drop>

// On LiteralKit<L>, overriding so the result is a kit:
omit<const Drop extends readonly [L[number], ...ReadonlyArray<L[number]>]>(
  drop: Drop & ([Complement<L, Drop[number]>] extends [never] ? never : unknown)
): LiteralKit<
  readonly [Complement<L, Drop[number]>, ...Array<Complement<L, Drop[number]>>]
>
```

Runtime: filter with `Object.is`, preserve source order, throw a defect if the complement is empty (the type is `never` in that case; the throw is for casts). Do not return the raw tuple. Callers who want to iterate use `.literals`. Do not compute the complement as a recursive tuple filter. A 240-deep conditional is a worse type-cost than the 238-line list it replaces. `Exclude` on the union is the cheap type, and mapped `Enum` / `is` / `match` already distribute over a union of literals, so the child kit still has one key per remaining member. What you give up is index-aligned `mapMembers`. That is the right trade. The Wipo comment exists because a 238-tuple was already considered too expensive to infer (`CitingApplicationIdentity.model.ts:81`).

`pick` on a large written array has the same tuple cost. `omit` avoids writing the array. That is the feature.

**`HashSet`.** Drop. Pre-trim it was `HashSet.fromIterable(literals)` stored on every kit (`b26ed3a81d^:.../LiteralKit.schema.ts:642`). The census found about 15 uses (`DECISIONS.md:463`). Membership for an untrusted value is `S.is(Kit)`. Membership in a hot loop is `HashSet.fromIterable(Kit.literals)` at that loop, which is what the code law already wants (`effect/HashSet`, not a parallel collection on the schema). A lazy getter would still put a `HashSet` type on all ~880 kits to serve a dozen sites. Not worth a facet.

**Thunk record.** Drop. Pre-trim `thunk` was `() => literal` per member (`b26ed3a81d^` interface at 650). Real uses were `Match.orElse(Kit.thunk.failed)`, `O.getOrElse(Kit.thunk.unknown)`, atom defaults: slots of type `(...args) => Member`. `Function.constant(Kit.Enum.failed)` is that function, and it is already in the language the trim cited (`DECISIONS.md:473`). A zero-arg function is assignable to those slots because TypeScript ignores extra parameters. The record also allocated N closures on every kit, including kits that never passed a thunk anywhere. Stable identity, when someone needs it, is one module-level `const failed = Function.constant(...)`, not a feature of the schema. `$match` already covers the "exhaustive record of results" case (`TelemetryTier.$match` at `packages/foundation/capability/observability/src/catalog/Catalog.literals.ts:55-59`). Thunk was the special case where the result is the member itself, which is `Enum`.

**`Enum`.** Keep. For string members it is Zod's `.enum`: `{ ready: "ready" }`. The September census had 1,172 lines in 227 files (`DECISIONS.md:456`); a looser `.Enum` search in `packages` and `apps` today is larger still, and I do not trust it as kit-only. The value is not runtime (the value is the string). The value is autocomplete, a rename that touches one object, and a typed reference where the expected type has already widened to `string`. `classifyAttempt` still returns bare strings (`apps/labs/ciops/src/kpi/Fold.ts:298-312`) because the scrutinee is a different union. That does not make `Enum` redundant; it means not every literal is born as a kit access.

**`is`.** Keep. `Status.is.ready` is `(i: unknown) => i is "ready"` (`LiteralKit.schema.ts:61-63`, built at 179-183). `x === Status.Enum.ready` narrows just as well when `Enum.ready` is the literal type, so the guard is not earning its keep as an inline test. It earns it as a function value: `A.filter(xs, Status.is.ready)`. Upstream gives `S.is(S.Literal("ready"))`, which is a schema pass, or index-based `S.is(members[i])`, which is what the census correctly called uncovered (`DECISIONS.md:457`). Per-member names are the product. Build the guard with `Object.is`, not `===` (see section 5).

**Record match.** Keep, exhaustive. `ComparatorOperator.$match` on `"=" | ">" | ">=" | "<" | "<="` (`packages/foundation/modeling/semver/src/Comparator.ts:274-280`) is the case a chain of `Match.when` makes worse: five arms, no shared key set with `Enum` and `is`, easy to update one and not the others. `effect/Match` has no record form for a bare literal union. `Match.tags` / `Match.valueTags` key off `_tag` (`node_modules/effect/dist/Match.d.ts:1073-1115`). That gap is real. The kit should keep owning the record. It should not own a second, non-exhaustive record (section 3).

**`toTaggedUnion`.** Keep the capability, take it off the kit type. It fills a real hole: `S.TaggedUnion` hardcodes `_tag` (`Schema.d.ts:5285`, `5338-5340`), and `S.toTaggedUnion(tag)` expects you to have already built the structs (`Schema.d.ts:5253-5255`). The kit builds those structs from a record of fields (`LiteralKit.schema.ts:416-440`). A kit-only search for `.toTaggedUnion(` in `packages` and `apps` is 62 lines, not the 36 the census saw, and not the 355 you get if you also count `S.toTaggedUnion`. Enough to keep. Not enough to put a second  N-key mapped type (`TaggedUnionCases` at `LiteralKit.schema.ts:102-142`) on every kit, including `KpiTier` and a 240-member office code that will never be a tag. Prefer a free function whose generic is paid at the call:

```ts
export function taggedUnion<const L extends readonly [PropertyKey, ...ReadonlyArray<PropertyKey>]>(
  kit: LiteralKit<L>
): <const Tag extends string>(
  tag: Tag
) => <const Cases extends { readonly [K in LiteralToKey<L[number]>]: Readonly<Record<string, S.Top>> }>(
  cases: Cases & { readonly [P in Tag]?: never }
) => S.toTaggedUnion<Tag, /* members, as today */ any>
```

Call site: `taggedUnion(EventKind)("kind")({ created: { id: S.String }, deleted: { id: S.String } })`. Worse than a method by one pair of parentheses. Better because `OfficeCode`'s type no longer mentions it. I would not delete the feature to save the parentheses.

**User-supplied key mapping.** Drop, and it should stay dropped. Pre-trim `enumMapping` plus `ValidEnumMapping` (`b26ed3a81d^:.../LiteralKit.schema.ts:753`, validators from 484) was an O(n²) type-level duplicate walk and a second runtime validator, for two production consumers (`DECISIONS.md:464`, `479-480`). The trim called it the one measurable type-check win. I believe that without re-measuring, because the recursive `HasDuplicateMappedLiterals` / `HasDuplicateMappedKeys` conditionals were the only quadratic types in the file. If the keys you want are not the literals, invert the dependency. Valibot already splits these: `v.picklist([...])` for an array of values, `v.enum(object)` for a pre-named object ([Valibot enums](https://valibot.dev/guides/enums/)). Write the const object, derive `S.Literals` from its values. Do not teach `LiteralKit` a second naming scheme. `MappedLiteralKit` is a value bijection (decode/encode), not a key rename. Keep that distinction sharp; section 2 says the directional `Enum` currently blurs it.

## 2. Naming

Follow `Schema.TaggedUnion`, not `Data.taggedEnum`, except where the kit is genuinely a record of members.

| Helper | Name | Why |
| --- | --- | --- |
| Member tuple | `literals` | Already upstream (`Schema.d.ts:4139`). |
| Positive subset | `pick` | Already upstream (`Schema.d.ts:4147`). Override the return type only. |
| Negative subset | `omit` | Pair of `pick`. Not `omitOptions`, not `omitLiterals`. The "options"/"literals" suffix restates the receiver. |
| Name→value record | `Enum` | Keep. Zod 4 calls the same `{ Salmon: "Salmon" }` object `.enum` ([Zod enums](https://zod.dev/api)). `values` collides with `.literals` in speech. I would not spend a 400-file rename to get a purer noun. |
| Guards | `is` | `Status.is.ready(x)` reads as a predicate. `TaggedUnion.guards` (`Schema.d.ts:5290-5292`) is the same record with a worse call shape. |
| Record match | `match` | Same word as `TaggedUnion.match` (`Schema.d.ts:5293-5300`). |
| Partial record | `matchOrElse` | Same word as `TaggedUnion.matchOrElse` (`Schema.d.ts:5301-5308`). |
| Tagged-union builder | `taggedUnion` as a free function | Drops the `to` that existed to look like `S.toTaggedUnion`. |
| Directional image on `MappedLiteralKit` | `map`, not `Enum` | See below. |

**No `$` prefix.** `Data.taggedEnum` puts `$is` and `$match` next to variant constructors so a variant named `match` does not collide (`node_modules/effect/dist/Data.d.ts:323-328`, type at 364-379). The `$` is a namespace split inside one object. `LiteralKit` does not have that object. Members live under `Enum` and `is`. Nothing on the kit is named by the user. `$match` is a copied sigil from the wrong precedent. `TaggedUnion.match` has no `$` and is the closer API: a schema-adjacent exhaustive record. Renaming is a real break (the `$match(` pattern hits 353 lines / 209 files under `packages` and `apps`, and that count includes `Data.taggedEnum` callers, so the kit-only number is the census's 243 lines / 143 files, grown since). I would rename in the same change that adds `omit` and fixes `pick`, not as a drive-by.

**`MappedLiteralKit` should stop calling the translation `Enum`.** On a direction, `is` and `$match` are the source literals, and `Enum` is the image (`packages/foundation/modeling/schema/src/MappedLiteralKit/MappedLiteralKit.schema.ts:42-46`, forward record built at 127-134). `SqlState.From.Enum.SUCCESSFUL_COMPLETION` is `"00000"`. `SqlState.From.is.SUCCESSFUL_COMPLETION("SUCCESSFUL_COMPLETION")` is true. Same key, two meanings, one name that on `LiteralKit` means "the member itself". Call the image `map`. Leave `Enum` for the echo record. Top-level `SqlState.Enum` is an alias of `From.Enum` (`MappedLiteralKit.schema.ts:367-370`), so it inherits the lie. About 11 production files (`MappedLiteralKit(` is 20 calls / 11 files). Cheap to rename relative to `LiteralKit.Enum`.

## 3. Exhaustiveness

Exhaustive by default. An unmatched value is a defect, not a result.

`TaggedUnion.match` requires every case (`Schema.d.ts:5293-5300`). `Data.taggedEnum`'s `$match` requires every tag (`Data.d.ts:368-379`). `Match.tagsExhaustive` requires every tag and then returns the function (`Match.d.ts:1113-1115`). A literal domain is a closed set the kit just enumerated. A record that can omit a key is a silent hole the next time someone adds `"archived"` to the tuple. `TelemetryTier.$match` (`Catalog.literals.ts:55-59`) is doing the job: adding a tier fails the typecheck of the rank function. That is the point of putting match on the kit instead of writing a `switch`.

Runtime today is `cases[matchLiteral(value)]!(value)` (`LiteralKit.schema.ts:286` and `291`). A missing handler throws `TypeError` because of the non-null assertion. I would throw an `Error` (or a small tagged defect) that includes the value, so a cast or a stale bundle says which member missed. I would not return `undefined`, and I would not return `Option`. `Option` is what you want when absence is a value; `Match.option` already does that for open matchers (`Match.d.ts:1919`). Folding it into the kit's `match` makes every exhaustive call site handle `Some`.

Non-exhaustive matching, when it is actually a default:

```ts
matchOrElse<
  const Cases extends Partial<MatchCases<L>>,
  const OrElse extends (value: Exclude<L[number], Handled<Cases>>) => unknown
>(
  cases: Cases & { readonly [K in Exclude<keyof Cases, MatchKeys<L>>]: never },
  orElse: OrElse
): (value: L[number]) => Unify.Unify<MatchReturn<Cases> | ReturnType<OrElse>>
// plus the data-first overload, matching TaggedUnion.matchOrElse
```

`orElse` receives the remainder, not `unknown`. Extra keys are still rejected. I would not add a third form that skips the default and returns `undefined`.

The current type already demands every key (`MatchFn` at `LiteralKit.schema.ts:83-91`, the `Exclude<keyof Cases, MatchKeys<L>>: never` excess-key check). Keep that. It is the right constraint. `Unify.Unify` on the return union matches what `TaggedUnion` does and is worth the instantiation.

Data-first and data-last both stay. `Comparator.ts:274` is data-first because the value is in hand. `Catalog.literals.ts:55` is data-last because the result is a named function. `TaggedUnion.match` has the same pair (`Schema.d.ts:5294-5299`). Dropping either is churn for taste.

## 4. `effect/Match` interoperability

No. The kit should not return a `Matcher` and should not offer a combinator you drop into `Match.type<...>().pipe(...)`.

`effect/Match` is an open, ordered, filter-accumulating chain. Exhaustiveness is a terminator (`Match.exhaustive` at `Match.d.ts:1953`, and `Match.tagsExhaustive` which consumes the chain). `Match.tags` is partial on purpose (`Match.d.ts:1040-1075`): you handle the tags you care about and the rest stays in `Remaining`. A literal kit match is a closed record. Those are different products, and this repo already uses both on purpose. `classifyAttempt` maps a stage union onto `KpiTier` with `Match.type` / `Match.when` / `Match.exhaustive` (`Fold.ts:298-312`). The scrutinee is not a `KpiTier`. A kit combinator inside that pipe would be matching the wrong type. `Comparator.test` uses the record because the scrutinee *is* the domain (`Comparator.ts:274-280`). The choice is the scrutinee, and the caller can see it. A hybrid API hides it.

A combinator that subtracted literals from `Remaining` would have to speak `Types.AddWithout` and `Types.PForExclude` (`Match.d.ts:698`, the `when` return). That algebra is public and unstable in practice: it is the part of `Match` that moves when patterns change. I would not couple `@beep/schema` to it. The rejection recorded on 2026-09-15 — do not migrate `$match` to `Match` chains, because you lose the record and split the key scheme (`DECISIONS.md:521`) — is the right rejection. I agree with the outcome and not with the implied follow-up that the kit should grow a `Match` adapter to compensate.

What *would* belong in `effect/Match`, later, is `Match.literals` / `Match.literalsExhaustive`, analogous to `tags` / `tagsExhaustive`, keyed by the literal values. Partial by default, because it lives in the open chain. That is an upstream design, not a method on the kit. Until it exists, partial literal matching is `Match.when("a", ...)` plus `Match.orElse`, and closed matching is `kit.match`. Two styles, one place each.

`Match.withReturnType` (`Match.d.ts:639`) constrains the accumulated result of a chain. The kit's `match` does not accumulate. The return type is the union of the handlers, unified. There is nothing for `withReturnType` to attach to. If a caller needs a result annotation, they annotate the binding. I would not add a type parameter to `match` just to mirror a chain API.

## 5. Implementation quality

**What the constructor does today, per kit.** `assertUniqueHelperKeys` walks every literal through `matchLiteral` and a `HashMap` (`LiteralKit.schema.ts:262-272`, called at 413). `makeEnum` and `makeGuards` each walk again (`449-452`). `matchLiteral` builds an `effect/Match` pipeline: `Match.value`, four `Match.when`, `Match.orElseAbsurd`, and a cast (`164-171`). For a kit of n members that is 3n matcher allocations at module init, plus two object-spread reductions that copy the accumulator on every step (`173-177`, `179-183`). Spread-reduce is O(n²) in property writes. n is usually under 10, so this is not a hot-loop bug. It is a tax paid once per kit at import, and there are 2,273 `LiteralKit(` call sites in `packages` and `apps` (878 files; the count includes tests). The trim removed the eager `HashSet` and left the more expensive per-literal work in place.

`buildMatch` ignores its literal argument (`274`). The function closes over nothing about the set; it re-derives the key from the value at call time. Every kit gets its own function object anyway (`452`). One shared function would behave the same. The per-kit type is the interface, not the closure.

`toTaggedUnion` closes over `base` (`416-440`). That one is legitimately per kit. It also calls `matchLiteral` again per member at call time, so a tagged-union build pays the `Match` pipeline once more.

Guards use `===` (`182`). `SchemaAST.LiteralValue` is `string | number | boolean | bigint` (`node_modules/effect/dist/SchemaAST.d.ts:995`), so `NaN` is a legal member. `NaN === NaN` is false, so `is` would reject the member it claims to name. The collision check uses `Object.is` (`268`). The guard should use `Object.is` too. Same for `-0` if it ever appears as a distinct literal. This is a real bug with a ridiculous input, and the fix is one token.

**What I would build.**

One pass, one plain object, no `Match`:

```ts
const keyOf = (literal: SchemaAST.LiteralValue): string => {
  switch (typeof literal) {
    case "boolean":
      return literal ? "true" : "false"
    case "bigint":
      return `bigint${literal}n`
    case "number":
      return `number${literal}`
    case "string":
      return literal
  }
}

const enumRecord: Record<string, SchemaAST.LiteralValue> = {}
const guards: Record<string, (i: unknown) => boolean> = {}
for (const literal of literals) {
  const key = keyOf(literal)
  const previous = enumRecord[key]
  if (previous !== undefined && !Object.is(previous, literal)) throw collision
  enumRecord[key] = literal
  guards[key] = (i) => Object.is(i, literal)
}
```

That replaces `assertUniqueHelperKeys`, `makeEnum`, and `makeGuards`. Skip the `HashMap`. A string-keyed record is the structure being built; using `effect/HashMap` to validate the keys of a record is ceremony. The code law against `Set` and `Map` is about domain state. This accumulator is the record itself.

`match` is one module-level function. `omit` and the overridden `pick` call the same constructor, so a derived kit gets its own record and its own guards. Do not share the parent `Enum` with a child that has fewer keys.

Leave `Enum` and `is` eager. Lazy getters save nothing you can measure on a kit that exists to be read, and they make the first touch order-dependent. The win is the linear pass, not laziness. I would not lazy-build `toTaggedUnion` either, once it is a free function: the closure is one function, created at the call.

**Statics across derivations.** Overriding `rebuild` is the right hook, and the current code does it (`LiteralKit.schema.ts:304-318`). Upstream `annotate`, `annotateKey`, and `check` all call `this.rebuild` (`node_modules/effect/dist/internal/schema/make.js:36-44`), and `rebuild` does `make(ast, this[RebuildOptions])` (`make.js:45-47`). The literals, `pick`, and `transform` live in those options (`Schema.js:2459-2470`). Re-attaching descriptors after `upstreamRebuild.call` keeps `Enum` / `is` / `match` on the same objects across annotation. Pre-trim wrapped only `annotate` (`b26ed3a81d^:.../LiteralKit.schema.ts:608-617`), so `check` dropped the helpers. The trim fixed a real bug. Keep the `rebuild` override.

It does not survive everything, and the docs are honest about the list (`LiteralKit.schema.ts:357-363` says annotate, annotateKey, and check). `brand` calls `make` directly and does not call `rebuild` (`Schema.js:2595-2599`). `pick` and `transform` and `mapMembers` return new schemas from the options object, not from `rebuild`. `withLiteralKitStatics` exists to copy `is`, `Enum`, `$match`, and `toTaggedUnion` after `S.brand` (`packages/foundation/modeling/schema/src/SchemaUtils/withLiteralKitStatics.ts:19-54`). That helper should stay. I would not try to make `brand` pretend the result is still a `LiteralKit`. A brand is a different type; copying the guards across is an explicit act, which is what `pipe(S.brand(...), withLiteralKitStatics(base))` already says. Do delete `toTaggedUnion` from the copied set once it is a free function.

`MappedLiteralKit` builds a full `LiteralKit(from)` and then throws away its `Enum` and `toTaggedUnion` (`MappedLiteralKit.schema.ts:231-244`), twice (From and To), and the outer attach copies `is` and `$match` again (`367-370`). Construct the guards and the shared `match` directly. The directional `map` record is a different object (the image), built by `makeForwardEnum` / `makeReverseEnum` (`127-143`), which has the same spread-reduce. Same one-pass fix.

**Types to stop paying for.** The `M` parameter and `ValidEnumMapping` are already gone. Do not bring them back; they were the type-cost problem. `LiteralToKey` (`LiteralKit.schema.ts:47-55`) is a distributive conditional that is identity on strings. Keep it. It is the naming policy that makes `1` and `"1"` not overwrite each other, and the constructor enforces it (`262-272`). `MatchReturn` plus the excess-key mapped type (`79-91`) is paid at the `match` call, which is where it should be paid. `toTaggedUnion`'s tower (`93-142`) is paid as part of `LiteralKit<L>` because the interface property's conditional resolves as soon as `L` is concrete (`349`). Moving it to a free function is the simplification. I did not re-run the typeperf fixture (`packages/foundation/modeling/schema/test/fixtures/typeperf/literal-kit-tagged-union.ts`); I am not claiming a millisecond number.

The `as LiteralKit<L>` cast at `LiteralKit.schema.ts:454` means the constructor does not check that the attached object matches the interface. Fine for a kit built by hand, and it hides drift. I would rather the descriptors be built to a typed object and returned without a cast once `toTaggedUnion` is no longer a property that is `never` for bigint members. The `never`-typed method is itself a smell: a kit of bigints typechecks with a method you must not call, and the runtime throws `LiteralKitTaggedUnionLiteralError` (`423-427`). A free function constrained to `PropertyKey` members makes that a call-site type error and deletes the error class.

**`const` type parameters.** Keep them on `LiteralKit` and on `omit` / `pick`. They are why `Enum` keys are literals and why the code law says not to write `as const` at the call. Nothing in the trim should relax that.

## 6. Upstream

`Schema.Literals` should grow `omit` next to `pick`. Nothing else here should move upstream.

`pick` without `omit` is the asymmetry Zod closed with `.extract` / `.exclude`, both of which return a new enum schema rather than a tuple ([Zod enums](https://zod.dev/api)). Effect's own schema guide shows `Schema.Literals(["a","b","c"]).pick(["a","b"])` and does not document an omit ([Effect v4 schema basics](https://effect.website/docs/v4/schema/basic-usage)). The operation is "filter this literal union", which is schema-family, not application policy. It does not allocate guards, it does not invent key names, and every Effect user with a 200-member code list has the same stale-complement bug `WipoSt13OfficeCode` has. Signature, on `Literals<L>`:

```ts
omit<const Drop extends ReadonlyArray<L[number]>>(
  drop: Drop
): Literals<readonly [Exclude<L[number], Drop[number]>, ...Array<Exclude<L[number], Drop[number]>>]>
```

Runtime filter, `Object.is`, throw if empty. Type via `Exclude`, not a recursive tuple walk, for the same depth reason as section 1. The kit's `omit` then wraps that result and reattaches helpers, the same way a kit `pick` should wrap upstream `pick`.

I would not add `Enum`, `is`, or `match` to `Schema.Literals`. `Literals` is used for anonymous unions (the repo's own code law says so) and inside Effect (`TrueLiterals` / `FalseLiterals` at `Schema.js:2805-2807`). Eager records on every one of those would tax schemas that have no names and no match sites. Effect already puts `guards` and `match` on `TaggedUnion`, where the discriminant is a tag and the value is a struct (`Schema.d.ts:5290-5308`). Bare literals are a different, opt-in index. A repo kit is the right opt-in. The key scheme (`number200`, `bigint1n`) is a policy Effect has not adopted and should not adopt just because one codebase mixed `1` with `"number1"`.

I would also not add `toTaggedUnion`-from-literals upstream until `TaggedUnion` itself can take a custom tag. Today `TaggedUnion` is `_tag` only. A free function in `@beep/schema` is the local patch. If Effect later allows `TaggedUnion` over an arbitrary discriminant, delete the local function and call that. Do not maintain both.

`Match.literals` is the other upstream candidate, and it is independent of `Schema`. I would write it as a proposal, not a local combinator. Reasons in section 4.

Leave `MappedLiteralKit` repo-local. A reversible literal bijection with directional guards is a modeling helper, not a schema primitive. Effect's `Literals.transform` (`Schema.d.ts:4148-4152`, runtime at `Schema.js:2468-2470`) is the schema half, and the kit already uses it (`MappedLiteralKit.schema.ts:231`). The directional records are the part upstream does not have, and eleven files do not justify an upstream API.

## 7. Existence

The kit should exist. Plain `Schema.Literals` plus ad hoc code is the right spelling for an anonymous union and the wrong spelling for a named domain that is matched, guarded, and passed around as a value.

What ad hoc code actually looks like, per domain: a const tuple, `S.Literals(tuple)`, a hand-written const object if you want names, a hand-written guard per member or one `S.is(schema)`, and a `Match.type<typeof schema.Type>()` chain that must be updated in the same edit as the tuple but is not forced to share keys with the const object. That is fine five times. This repo constructs `LiteralKit` in 878 files. The September census, which was kit-filtered and therefore the number I trust, already had `Enum` at 1,172 lines and `is` at 603 (`DECISIONS.md:456-457`). Deleting the kit inlines those. The 2026-09-14 "retire it, the helpers are ergonomics" ruling was wrong, and the 2026-09-15 reversal was right about that (`DECISIONS.md:517-525`).

It should not exist in the pre-trim shape. `Options`, identity `pickOptions`, eager `HashSet`, eager `thunk`, and `enumMapping` were a second standard library. The trim's doctrine — delete a facet upstream already covers — is the right doctrine for those five. It was applied to `omit` without noticing that upstream does not cover a computed complement, and that "write the complement out" changes meaning for any domain defined by exclusion.

So: one kit, four surface members (`literals` and `pick` inherited, `omit` added, `Enum`, `is`, `match`), `taggedUnion` as a function beside it, `MappedLiteralKit` kept but not as a second copy of the same grab-bag. Anonymous unions stay `S.Literals`. I would not sunset the kit to prove a point about upstream purity. The 600-file base is not a reason to keep a bad helper, and it is a reason to keep the three helpers those files actually call.

## Where I am unsure

- **The return type of `omit` for a large parent.** I am sure the member type should be `Exclude<Parent, Drop>`, and sure a recursive tuple filter is the wrong way to get there. I am less sure that `readonly [Complement, ...Array<Complement>]` is a good `L` to hand back to `LiteralKit`. `keyof` of a rest tuple includes array members, and `Literals.members` is `{ [K in keyof L]: Literal<L[K]> }` (`Schema.d.ts:4140-4142`), so a rest-array `L` may pollute `members`. I would prototype `omit` on `OfficeCode` → `WipoSt13OfficeCode` before freezing that type. If `members` gets dirty, store the complement union on a dedicated type parameter and stop using a tuple as the only carrier of `L[number]`.

- **Whether `LiteralKit<L>` eagerly expands `toTaggedUnion`'s mapped types** the moment any property is read. The property's conditional sits on the interface (`LiteralKit.schema.ts:349`) and `L` is concrete at the call, so I believe a use of `.Enum` resolves it. I have not confirmed that with a trace of the checker. If property types are elaborated lazily, the cost argument for moving `taggedUnion` off the interface gets weaker, and the reason that remains is "bigint kits should not have a method typed `never`".

- **`matchOrElse` versus "use `Match` for partials".** I lean toward one partial form because `TaggedUnion` has one and because a default arm on a closed set is common. I would drop it without regret if the only call sites are people avoiding an exhaustive record. I would not add it speculatively in the same change as `omit`.

- **Renaming `$match` to `match`.** I am sure about the name and unsure the break is worth it alone. Only together with `omit` and the `pick` return-type fix.

- **How often mixed number/string kits occur outside the doc example.** `LiteralToKey`'s prefixes exist for them (`LiteralKit.schema.ts:47-55`). If almost every kit is strings, the key scheme is still justified as a collision trap (the constructor throws, which is correct) but `match` keys like `number200` are a sharp edge I have not seen in the sampled call sites. `ComparatorOperator` uses `">="` as a key (`Comparator.ts:277`), which works because the literal is already a string. I did not census mixed-type kits separately.

## Disagreements with the current code or its history

- **Deleting `omit` and rewriting complements to `pick`.** The 2026-09-15 ruling says omit "becomes an explicit pick of the complement at its 13 sites" (`explorations/effect-schema-parity/DECISIONS.md:470-472`). That freezes a negative definition into a positive list. The evidence is in the tree now: `CitingApplicationIdentity.model.ts:80-83` spells out 238 office codes and widens the tuple by hand, and `Alignment.model.ts:32-48` still describes a subtraction while the code lists the kept members. The old helper's type was also wrong (non-tuple `Exclude` array, pre-trim lines 558-560 and 646), which `ChatOrchestrator.ts` already documented. The fix was a tuple-or-`Exclude` return type that yields a kit, not a codemod to `pick`.

- **Counting construction lines as a vote for retirement.** The doctrine says a concept retires unless uncovered-member lines outnumber covered-facet lines, "construction included" (`standards/architecture/DECISIONS.md:2030-2038`). Applied here, uncovered was 2,054 and covered was 2,048, construction contributing 1,521 (`DECISIONS.md:455`, restated at `standards/architecture/DECISIONS.md:2074-2082`). You cannot call `.Enum` without constructing the kit. Construction is the cost of the uncovered members, not an independent preference for `S.Literals`. Drop construction from the covered column and the uncovered side wins by a factor of four. The ADAPT outcome was right; the metric nearly produced the wrong one, and it will do that to the next kit whose constructor is called about as often as its interesting methods.

- **`$match` as a name.** It copies `Data.taggedEnum`, where `$` separates meta helpers from variant constructors (`Data.d.ts:323-328`). `LiteralKit` has no constructors in that object. The schema API it actually resembles is `TaggedUnion.match` (`Schema.d.ts:5293`), which has no `$`. The current interface (`LiteralKit.schema.ts:345`) keeps the sigil anyway.

- **`pickOptions` as evidence of how the kit grew.** An identity function shipped as a method (`b26ed3a81d^:.../LiteralKit.schema.ts:562`). Removing it was right. It is also why I do not want `thunk` back: same pattern, a record of closures that `Function.constant` already is, justified by 65 lines (`DECISIONS.md:460`).

- **`matchLiteral` going through `effect/Match`.** `LiteralKit.schema.ts:164-171` allocates a matcher to concatenate a prefix. `makeEnum` / `makeGuards` (`173-183`) call it twice per member via object spread. The trim's performance note was about not building a `HashSet` for every kit (`DECISIONS.md:473`). The remaining constructor work is more allocation than the `HashSet` was, and it runs for every kit, not only the kits that asked for a set.

- **Directional `Enum` meaning the other side.** `MappedLiteralKit.schema.ts:42-46` and `127-134`. On `LiteralKit`, `Enum.x` is `x`. On a mapped direction, `Enum.x` is the translation of `x`, while `is.x` tests `x`. One name, two functions. The top-level kit aliases `From`, so the confusing one is the one you get by default (`367-370`).

- **Inherited `pick` dropping the kit.** Not overridden (`LiteralKit.schema.ts:344-350`); upstream returns a new `Literals` (`Schema.js:2465-2467`). Combined with the omit deletion, the recommended spelling `LiteralKit(Parent.pick(complement).literals)` both rebuilds every helper and, for large complements, is the 238-tuple the Wipo authors then refused to infer. `rebuild` was fixed for annotate/check (`make.js:36-47`, kit at `304-318`) and not for the derivation people use to make a child domain.

- **Pre-trim `attachHelperDescriptors` wrapping only `annotate`.** `b26ed3a81d^:.../LiteralKit.schema.ts:608-617`. `check` silently stripped `Enum` and `is`. The trim fixed this. I am not disagreeing with the fix; I am disagreeing with any reading that the statics were "just ergonomics" while a derivation could delete them without a type error. The current `as LiteralKit<L>` cast (`LiteralKit.schema.ts:454`) still means the constructor is not checked against that interface, so the same class of drift can return.
