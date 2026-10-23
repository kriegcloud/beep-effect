I would keep `LiteralKit`, but make it a more coherent finite-domain API: retain named values, per-member guards, exhaustive record matching, and domain-driven tagged-union construction; restore a real `omit`; and make subset operations return kits. I would leave member sets and constant thunks as explicit call-site derivations. I prefer the naming conventions of `Schema.TaggedUnion` over the current mixture of schema and `Data.taggedEnum` conventions, and I would avoid a separate adapter into `effect/Match` because ordinary composition already works. My strongest disagreement with the retirement history is its definition of equivalence: being expressible with upstream primitives does not establish equivalent maintenance behavior, allocation behavior, or usability. Separately, I found a concrete return-type bug worth fixing before expanding the API.

Reviewed the working tree at `549d62e375` and the requested historical revision. No files were modified. Compiler probes ran entirely in memory; performance observations below are source-level analysis, not benchmark results. Historical citations abbreviated **OLD** refer to `git show b26ed3a81d^:packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts`.

## 1. Which helpers should the kit carry?

My boundary is **whether the helper preserves a useful relationship to the declared domain**, not whether someone can reproduce it with upstream functions.

| Facet | Preference | Reason |
|---|---|---|
| Readonly members tuple | **Keep, inherited as `literals`.** | It is the canonical enumeration, useful for iteration and integration. Do not add another name for it. Distinguish it from upstream `members`, which is a tuple of literal **schemas**. |
| Typed subset selection | **Redesign `pick` to return a kit.** | A selected domain should retain the domain API. Returning a less capable object makes ordinary composition unnecessarily awkward. |
| Complement selection | **Restore as `omit`.** | “All members except X” expresses a policy that should continue to hold when the domain grows. An explicitly enumerated complement does not. |
| `HashSet` of members | **Drop from the core surface.** | It chooses a representation and caching policy without adding a domain relationship. Construct and hoist a set where repeated set operations justify it. |
| Record of constant thunks | **Drop.** | `constant(value)` is sufficiently direct, and consumers can hoist frequently reused callbacks. A thunk record adds a parallel vocabulary without enough additional meaning. |
| Keyed members, currently `Enum` | **Keep.** | Named references give discoverability, navigation, and a single source for values used outside strongly contextual expressions. |
| Per-member guards | **Keep.** | A named refinement is valuable in filters and matcher predicates. It should remain precisely typed to its individual literal. |
| Record-form matching | **Keep.** | It expresses a total operation over a closed domain in one place and makes additions produce useful compiler errors. |
| Conversion to a tagged union | **Keep, with a tighter contract.** | The useful feature is requiring a case definition for every domain member, including with a custom discriminator. |
| User-supplied helper-key mapping | **Drop from the core constructor.** | It imposes a second naming system on every helper. Prefer a separate application alias record; reconsider a separate named-values constructor only when real consumers justify it. |

Upstream already supplies the exact tuple, schema-member tuple, `mapMembers`, and `pick`. Its `pick` returns `Literals<L2>`, and the implementation constructs a fresh `Literals`; the current kit inherits that behavior without upgrading the result. That is why I would retain the upstream names but improve closure under selection. [Schema.d.ts:4138–4152](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.d.ts:4138), [Schema.js:2457–2470](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.js:2457), [LiteralKit.schema.ts:344–350](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:344)

The distinction between `omit` and an explicit complement is substantive:

```ts
// A continuing policy:
Status.omit(["deleted"])

// A selection frozen at the time it was written:
Status.pick(["draft", "published"])
```

Add `"archived"` to `Status`: the first includes it, the second does not. The ruling explicitly replaced omission with complement picks, and the codemod calculates that complement from the then-current tuple before emitting its literal text. I disagree with treating those operations as interchangeable. [Parity decisions:470–473](/home/elpresidank/YeeBois/projects/beep-effect/explorations/effect-schema-parity/DECISIONS.md:470), [Codemod:464–505](/home/elpresidank/YeeBois/projects/beep-effect/packages/tooling/tool/cli/src/commands/Lint/internal/SchemaParityCodemodLiteralKitRule.ts:464)

Conceptually, I want:

```ts
// Schematic: exact finite tuples require additional input constraints.
pick<const P extends readonly L[number][]>(members: P): LiteralKit<P>

omit<const E extends readonly L[number][]>(
  excluded: E
): LiteralKit<OmitTuple<L, E>>
```

Two qualifications matter:

- Empty complements should be representable as an empty domain with type `never`. The old implementation instead required a nonempty result and threw after removing everything. I prefer algebraically complete selection operations. **OLD:554–578.**
- Do not apply `Exclude<L[number], E[number]>` indiscriminately to dynamic arrays or union-valued tuple elements. An array typed `("a" | "b")[]` might contain only `"a"` at runtime. Precise subtraction requires statically known singleton entries; otherwise reject the input or return a conservative plain schema type.

I would not require named values everywhere. The raw literals in `classifyAttempt` are readable because their role is explicit and their return type is constrained. Conversely, the keyed values used by `tierCeiling` help identify the domain supplying each result. Both styles are legitimate. [Fold.ts:298–313](/home/elpresidank/YeeBois/projects/beep-effect/apps/labs/ciops/src/kpi/Fold.ts:298), [Catalog.behavior.ts:152–160](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/capability/observability/src/catalog/Catalog.behavior.ts:152)

## 2. Naming

For a fresh API, I would choose:

| Capability | Name |
|---|---|
| Literal tuple | `literals` |
| Literal-schema tuple | `members` |
| Select / exclude | `pick` / `omit` |
| Keyed literal values | `values` |
| Per-member refinements | `guards` |
| Exhaustive record fold | `match` |
| Partial record fold with fallback | `matchOrElse` |
| Domain-to-variant construction | `toTaggedUnion` |

**I would use no `$` prefixes.** `Schema.TaggedUnion` is the closer conceptual relative: a schema with `cases`, `guards`, `match`, and `matchOrElse`. Those names also give consumers a predictable transition from a literal domain to its tagged union. [Schema.d.ts:5285–5308](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.d.ts:5285)

`Data.taggedEnum` has a different object layout: variant constructors occupy the top-level namespace alongside `$is` and `$match`. The prefix is understandable there as a distinction between generated constructors and utility operations. LiteralKit nests its generated names inside records, so I see less justification for copying that convention. This is my interpretation of the layouts, not a claim about upstream’s historical intent. [Data.d.ts:358–379](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Data.d.ts:358)

I prefer `guards` over `is` because a property containing many refinements is a collection, not a predicate. I prefer `values` over `Enum` because the object is a value lookup, not a TypeScript enum or schema constructor. `values` is my least firm naming choice; preserving `Enum` may be worth avoiding a broad cosmetic migration.

The exported `matchLiteral` should be called `literalKey` if it remains public: it encodes a literal into a helper key; it does not perform a domain match. [LiteralKit.schema.ts:148–171](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:148)

**MappedLiteralKit needs semantic cleanup before merely receiving the same renames.** Its directional `Enum` maps source members to destination values, while its guards and matcher operate on source members. Thus `From.Enum.OK` can be `200`, while `From.is.OK` recognizes `"OK"`. That is not the same meaning as an ordinary kit’s `Enum`. [MappedLiteralKit.schema.ts:34–46](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/MappedLiteralKit/MappedLiteralKit.schema.ts:34), [MappedLiteralKit.schema.ts:222–244](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/MappedLiteralKit/MappedLiteralKit.schema.ts:222)

My preferred redesign would expose:

- `From` and `To` as ordinary literal-domain kits.
- The existing reversible codec as the codec.
- Explicit `forward` and `reverse` lookup tables.

Then `From.values.OK` means `"OK"` and `forward.OK` means `200`. A familiar helper name should not change meaning depending on which kit supplied it.

## 3. Exhaustiveness

**Record matching should be exhaustive by default.** Its main advantage is making the complete domain visible and making domain growth actionable.

The current API already requires every mapped key and rejects extra keys through an exactness constraint. Keep that behavior. Preserve each handler’s literal parameter and the union of handler return types, including Effect unification. [LiteralKit.schema.ts:65–90](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:65)

For partial matching, I would expose only:

```ts
Kit.matchOrElse(cases, fallback)
Kit.matchOrElse(value, cases, fallback)
```

The fallback should receive the unhandled portion of the domain, where that can be established soundly from definitely present handlers. Optional or dynamically assembled handler properties must not falsely remove cases from that remainder.

**An unmatched value produces the fallback result.** It should never silently produce `undefined`. If absence is the desired result, use `Match.option`, which already makes unmatched input `None`; I would not initially add another `matchOption` method. [Match.d.ts:1880–1919](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Match.d.ts:1880)

An exhaustive matcher receiving invalid JavaScript input should fail clearly. It is not a decoder, and it should not quietly treat out-of-domain input as a valid partial-match case. Decode unknown input at the boundary.

I would also use own-property lookup when dispatching handlers. The current implementation directly indexes the supplied object, whereas upstream tagged-union matching checks `Object.hasOwn` before retrieving a handler. That is a sensible distinction when literal names can overlap object-prototype names. [LiteralKit.schema.ts:282–291](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:282), [Schema.js:3281–3310](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.js:3281)

## 4. `effect/Match` interoperability

**I would not add a dedicated matcher-transformer method to the kit.** The tuple and curried record matcher already provide a useful composition boundary:

```ts
import { LiteralKit } from "@beep/schema/LiteralKit"
import * as Match from "effect/Match"

const Status = LiteralKit(["ready", "blocked"])

const classify = Match.type<typeof Status.Type | "queued">().pipe(
  Match.withReturnType<number>(),
  Match.whenOr(
    ...Status.literals,
    Status.$match({
      ready: () => 1,
      blocked: () => 2
    })
  ),
  Match.when("queued", () => 0),
  Match.exhaustive
)
```

That uses today’s `$match` spelling; my proposed spelling is `match`.

`whenOr` owns the exclusion of handled input, `withReturnType` constrains the callback result, and `exhaustive` checks the remaining domain. Put `withReturnType` first, as its declaration documentation requires. [Match.d.ts:607–639](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Match.d.ts:607), [Match.d.ts:741](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Match.d.ts:741), [Match.d.ts:1953](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Match.d.ts:1953)

I checked this composition against the installed declarations using a record matcher with the same unary callback shape. The successful result was `(input: "ready" | "blocked" | "queued") => number`; omitting the `"queued"` branch and requiring an incompatible return type both produced the expected errors.

For individual cases, ordinary `Match.when` with a literal or per-member guard is enough. For fallback behavior, retain `Match.orElse` and `Match.option`. [Match.d.ts:698](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Match.d.ts:698), [Match.d.ts:1790](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Match.d.ts:1790)

A bespoke record-case combinator would need to preserve input, accumulated filters, remaining input, accumulated results, flavor, return constraint, and argument tuple. Upstream exposes the relevant `Types` machinery, but exposing machinery is not an argument that every library should couple to it. I would accept that maintenance burden only after repeated consumer evidence showed the composition above was inadequate. [Match.d.ts:65–108](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Match.d.ts:65), [Match.d.ts:2276–2335](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Match.d.ts:2276)

In `classifyAttempt`, my first improvement would simply be `Match.withReturnType<KpiTier>()`, replacing the repeated branch return annotations. `KpiTier` is the **output** domain there; it should not be confused with the attempt-stage input domain being matched. [Fold.ts:298–313](/home/elpresidank/YeeBois/projects/beep-effect/apps/labs/ciops/src/kpi/Fold.ts:298), [Schemas.ts:48–68](/home/elpresidank/YeeBois/projects/beep-effect/apps/labs/ciops/src/kpi/Schemas.ts:48)

## 5. Implementation quality

**Fix the return-type extraction first.** Both versions use:

```ts
Cases[K] extends (...args: ReadonlyArray<unknown>) => infer R
  ? R
  : never
```

Under strict function checking, `(value: "ready") => number` does not promise to accept arbitrary unknown arguments. The condition therefore discards valid unary handlers. [LiteralKit.schema.ts:79–81](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:79); **OLD:135–137.**

An in-memory compiler probe using the extracted current definition produced:

| Handlers | Extracted result |
|---|---|
| Unary handlers returning `number` and `string` | `never` |
| Zero-argument handlers returning `number` and `string` | `number \| string` |
| Unary numeric handler plus zero-argument string handler | `string` |

Inferring the arguments fixes the probe:

```ts
type MatchReturn<Cases> = {
  [K in keyof Cases]:
    Cases[K] extends (...args: infer _Args) => infer R ? R : never
}[keyof Cases]
```

The existing tests check callback parameter narrowing and runtime results, but the cited tests do not assert that the aggregate return type contains every handler’s return type. That distinction explains why these tests do not catch this failure. [LiteralKit.test.ts:89–139](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/test/LiteralKit.test.ts:89)

**Reduce construction work before arguing about tiny call-site savings.**

- Both versions construct records by repeatedly spreading the accumulated object. For \(n\) distinct keys, this copies a quadratic number of properties. Use `effect/Record.fromIterableWith`, which builds one result record in one pass. Retain a small internal type assertion if necessary to recover the key/value correlation. [LiteralKit.schema.ts:173–183](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:173), [Record.js:90–96](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Record.js:90); **OLD:234–281.**
- `matchLiteral` builds a `Match.value(...).pipe(...)` chain on every invocation, including helper construction and every record dispatch. Build a reusable `Match.type<LiteralValue>()` classifier once instead. This respects the repo’s preference for Match helpers while removing repeated matcher construction. [LiteralKit.schema.ts:164–183](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:164), [LiteralKit.schema.ts:282–291](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:282), [matcher.js:130–148](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/internal/matcher.js:130)
- Keep collision validation eager: malformed domains should fail at declaration time. Compute encoded keys once and reuse them. The existing constructor validates keys, then separately constructs guards and values, each of which computes keys again. [LiteralKit.schema.ts:262–272](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:262), [LiteralKit.schema.ts:412–454](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:412)
- Make the guard record lazy and memoized; it allocates one closure per member. I lean toward lazy memoization for the values record too, although its benefit is less obvious. Memoize whole records, not individual properties through a Proxy. Share the memoized records across annotation/check derivatives.
- The old eager `HashSet` and thunk record were unnecessary universal costs. Removing them was reasonable. However, the codemod inserts `HashSet.fromIterable(...)` and `constant(...)` at the access site without hoisting; a rewrite inside a frequently called function can move allocation from once per declaration to once per call. Audit placement rather than claiming an unconditional performance improvement. **OLD:787–834**; [Codemod:509–524](/home/elpresidank/YeeBois/projects/beep-effect/packages/tooling/tool/cli/src/commands/Lint/internal/SchemaParityCodemodLiteralKitRule.ts:509), [Codemod:568–579](/home/elpresidank/YeeBois/projects/beep-effect/packages/tooling/tool/cli/src/commands/Lint/internal/SchemaParityCodemodLiteralKitRule.ts:568)

**Laziness and bundle size are different.** A lazy getter delays allocation; it does not make statically referenced implementation disappear from a bundle. If tagged-union construction materially enlarges small browser consumers, moving it to an explicitly imported companion function is a stronger bundle boundary than a lazy method. I would measure this before sacrificing method ergonomics. The current constructor attaches all four local helpers, so merely avoiding a property read does not establish tree-shaking of that helper’s implementation. [LiteralKit.schema.ts:449–454](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:449)

**Preserve statics through the correct operations.** The current `rebuild` override is substantially better than the old `annotate`-only wrapper. Upstream `annotate`, `annotateKey`, and `check` call `rebuild`; `pipe` merely applies functions. [LiteralKit.schema.ts:297–317](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:297), [make.js:33–46](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/internal/schema/make.js:33); **OLD:608–625.**

My contract would be:

- Annotation/check derivatives retain shared vocabulary helpers.
- `pick`/`omit` create helpers for their selected declaration.
- Arbitrary transforms, brands, or replacement schemas do not automatically inherit claims about the original domain.
- Helpers describe the declared vocabulary; they do not certify satisfaction of additional checks. Use `S.is(derivedSchema)` for that.

This last point needs explicit documentation. Current guards are literal equality closures, and derivatives reuse them. A check rejecting `"down"` can therefore coexist with a guard that recognizes `"down"` as that declared literal. That is coherent, but “schema guard” and “member identity guard” must not be confused. [LiteralKit.schema.ts:179–183](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:179), [LiteralKit.test.ts:209–235](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/test/LiteralKit.test.ts:209)

**Simplify types selectively.** Keep `const` parameters on tuple and record inputs. Keep tuple positions where tagged-union discrimination depends on them. Drop the old mapping parameter and its recursive duplicate-key/duplicate-literal validation: that was a considerable amount of type machinery for a feature I would not put in the core. **OLD:61–123, 158–203.**

I would also try removing the extra `{ Type: ... }` intersection in `TaggedUnionMember` and deriving the complete member type through `S.Struct` alone. That is a simplification to prove with compiler tests, not an assertion that deletion is mechanically safe. [LiteralKit.schema.ts:106–132](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:106)

Finally, tighten `toTaggedUnion` collision handling. The kit’s helper encoding distinguishes `1` from `"1"`, but upstream normalizes numeric discriminants to string keys and rejects that pair as duplicate discriminants. Validate the target representation’s uniqueness, not just the source helper keys. [LiteralKit.schema.ts:47–55](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:47), [Schema.js:3264–3275](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.js:3264)

## 6. What belongs upstream?

**`Literals.omit` is my strongest upstream candidate.** It complements an existing operation and retains information that manually listing the complement loses. It should allow empty results and explicitly address dynamic-array typing. Upstream currently exposes `pick` but no corresponding `omit` in the `Literals` interface. [Schema.d.ts:4138–4153](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.d.ts:4138)

I would also support upstream `guards`, `match`, and `matchOrElse` for literal domains, consistent with `Schema.TaggedUnion`. But the key representation needs an upstream-level decision. I would start with a clean string-literal record API rather than assume this repository’s `number200`/`bigint1n` encoding should become everyone’s convention. That encoding is explicit and usable locally, but it also creates collisions with ordinary strings that the constructor must reject. [LiteralKit.schema.ts:23–55](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:23), [LiteralKit.schema.ts:219–228](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:219)

For tagged unions, a custom-discriminator record constructor would be a reasonable upstream extension. The existing `TaggedUnion` record constructor fixes `_tag`; `toTaggedUnion(tag)` accepts a custom discriminator but starts from an already built union. Domain-complete construction is useful beyond this repository. [Schema.d.ts:5253–5255](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.d.ts:5253), [Schema.d.ts:5285–5286](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.d.ts:5285), [Schema.d.ts:5338–5340](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.d.ts:5338)

I would leave the following local or at call sites: the mixed-literal helper-key convention, application aliases, cached collection choices, thunk records, and MappedLiteralKit’s convenience tables. No upstream contribution is needed for the matcher composition described above.

## 7. Should the kit exist?

**Yes—but not as a compulsory wrapper for every named union.**

A coherent domain object that supplies validation, named values, refinements, and total operations is a worthwhile abstraction. Repeating those relationships ad hoc across consumers is worse than maintaining a small shared implementation. The record matches for modifier labels and review-window labels are concrete examples where the domain operation is easy to read as one table. [projection.ts:212–217](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/ui-system/editor/src/capability/projection.ts:212), [ReviewWindow.ts:330–335](/home/elpresidank/YeeBois/projects/beep-effect/packages/tooling/tool/cli/src/commands/Yeet/internal/ReviewWindow.ts:330)

But a domain used only for decoding and type extraction can reasonably remain plain `S.Literals`, even if named. Naming something does not itself establish a need for generated helper records. I disagree with making that distinction depend solely on “named” versus “anonymous,” as the current Code Laws do. [AGENTS.md:192–196](/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md:192)

The consumer base is evidence of utility and migration cost, not a veto against redesign. Likewise, it is not a reason to preserve a weak helper. My decision would remain “keep a smaller coherent kit” even with ten consumers rather than hundreds.

## Where I am unsure

- **`values` versus `Enum`.** I prefer `values` in a new API, but the improvement may not justify a standalone repository-wide rename.
- **Lazy values.** Lazy guards have a clearer allocation argument. Eagerly building a small values record in one pass might be simpler and fast enough. Measure representative domain sizes.
- **How far to generalize mixed literals.** Their key encoding complicates a design that is especially clean for string domains. I would retain existing support locally, but would be cautious about upstreaming the convention.
- **Exact tuple preservation in `omit`.** It benefits downstream tuple operations, but long recursive filters can become expensive. A bounded precise overload with a conservative fallback may be preferable.
- **Method versus companion function for `toTaggedUnion`.** I prefer the method for discovery and domain coverage. Bundle measurements could change that preference.

## Disagreements with the current code or its history

1. **The initial “ergonomics, therefore retire” ruling was wrong.** Ergonomics that centralize domain relationships are part of an API’s purpose. The September 14 ruling explicitly dismissed all derived helpers on that basis; the later reopening correctly reversed it. [Parity decisions:205–221](/home/elpresidank/YeeBois/projects/beep-effect/explorations/effect-schema-parity/DECISIONS.md:205)

2. **The line-count majority rule is not a sound design criterion.** The doctrine makes survival depend on uncovered consumer lines exceeding covered lines, construction included, and cites a margin of 2,054 versus 2,048. Formatting or a few additional constructions should not determine whether an abstraction deserves to exist. Use the census to understand usage, not to cast a deciding vote. [Architecture decisions:2030–2045](/home/elpresidank/YeeBois/projects/beep-effect/standards/architecture/DECISIONS.md:2030), [Architecture decisions:2074–2093](/home/elpresidank/YeeBois/projects/beep-effect/standards/architecture/DECISIONS.md:2074)

3. **Retiring `omit` as an explicit complement lost maintenance semantics.** The source ruling and codemod establish exactly that substitution. It deserves reconsideration independently of whether the old implementation was good. [Parity decisions:470–473](/home/elpresidank/YeeBois/projects/beep-effect/explorations/effect-schema-parity/DECISIONS.md:470), [Codemod:464–505](/home/elpresidank/YeeBois/projects/beep-effect/packages/tooling/tool/cli/src/commands/Lint/internal/SchemaParityCodemodLiteralKitRule.ts:464)

4. **“Helpers survive every derivation” overstates the implementation.** The rebuild fix is good, but `pipe` is function application, inherited `pick` constructs a plain schema, and other transformations require separate handling. The guarantee should name the supported operations. [LiteralKit.schema.ts:297–317](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:297), [Schema.js:2465–2470](/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/dist/Schema.js:2465), [withLiteralKitStatics.ts:24–27](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/SchemaUtils/withLiteralKitStatics.ts:24)

5. **The current match return-type extractor is incorrect for unary handlers.** This is a verified type-level defect, not a naming preference. It should be repaired regardless of the broader API decision. [LiteralKit.schema.ts:79–90](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts:79)

6. **MappedLiteralKit overloads the meaning of `Enum` too far.** A record of a domain’s own members and a conversion table should have different names. Its current directional construction makes that semantic mismatch explicit. [MappedLiteralKit.schema.ts:127–143](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/MappedLiteralKit/MappedLiteralKit.schema.ts:127), [MappedLiteralKit.schema.ts:230–244](/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/modeling/schema/src/MappedLiteralKit/MappedLiteralKit.schema.ts:230)

7. **The allocation argument for removing helpers was incomplete.** Avoiding universal eager sets is sensible; replacing cached values with inline construction is not automatically faster. The codemod should have treated allocation placement as part of the migration review. [Parity decisions:470–473](/home/elpresidank/YeeBois/projects/beep-effect/explorations/effect-schema-parity/DECISIONS.md:470), [Codemod:509–524](/home/elpresidank/YeeBois/projects/beep-effect/packages/tooling/tool/cli/src/commands/Lint/internal/SchemaParityCodemodLiteralKitRule.ts:509)

